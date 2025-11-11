/**
 * Drone Delivery Simulator Service
 * Mô phỏng hành trình giao hàng chi tiết:
 * Hub → Restaurant (20s) → Customer (30s)
 */

import { databases } from './appwrite';

export type DeliveryPhase = 
  | 'idle'           // Drone chờ tại hub
  | 'to_restaurant'  // Đang bay đến nhà hàng
  | 'picking_up'     // Đang lấy hàng tại nhà hàng
  | 'to_customer'    // Đang bay đến khách hàng
  | 'delivering'     // Đang giao hàng cho khách
  | 'completed';     // Hoàn thành

export interface DeliverySimulation {
  orderId: string;
  droneId: string;
  phase: DeliveryPhase;
  progress: number; // 0-100
  timeRemaining: number; // seconds
  currentLat: number;
  currentLng: number;
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
  hubLat: number;
  hubLng: number;
}

const PHASE_DURATIONS = {
  to_restaurant: 20, // 20 giây
  picking_up: 5,     // 5 giây lấy hàng
  to_customer: 30,   // 30 giây
  delivering: 3,     // 3 giây giao hàng
};

/**
 * Tính toán vị trí trung gian giữa 2 điểm
 */
function interpolatePosition(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  progress: number // 0-1
): { lat: number; lng: number } {
  return {
    lat: lat1 + (lat2 - lat1) * progress,
    lng: lng1 + (lng2 - lng1) * progress,
  };
}

/**
 * Bắt đầu simulation cho một đơn hàng
 */
export async function startDeliverySimulation(
  orderId: string,
  droneId: string,
  restaurantLat: number,
  restaurantLng: number,
  customerLat: number,
  customerLng: number,
  hubLat: number = 10.762622, // Default hub location
  hubLng: number = 106.660172,
  onUpdate: (simulation: DeliverySimulation) => void,
  onComplete: () => void
): Promise<() => void> {
  let currentPhase: DeliveryPhase = 'to_restaurant';
  let phaseStartTime = Date.now();
  let isRunning = true;

  const simulation: DeliverySimulation = {
    orderId,
    droneId,
    phase: currentPhase,
    progress: 0,
    timeRemaining: PHASE_DURATIONS.to_restaurant,
    currentLat: hubLat,
    currentLng: hubLng,
    restaurantLat,
    restaurantLng,
    customerLat,
    customerLng,
    hubLat,
    hubLng,
  };

  // Update loop - chạy mỗi giây
  const intervalId = setInterval(async () => {
    if (!isRunning) return;

    const elapsed = (Date.now() - phaseStartTime) / 1000; // seconds
    const phaseDuration = PHASE_DURATIONS[currentPhase as keyof typeof PHASE_DURATIONS] || 1;
    const progress = Math.min(elapsed / phaseDuration, 1);
    const timeRemaining = Math.max(0, phaseDuration - elapsed);

    simulation.progress = progress * 100;
    simulation.timeRemaining = timeRemaining;

    // Cập nhật vị trí theo phase
    if (currentPhase === 'to_restaurant') {
      const pos = interpolatePosition(hubLat, hubLng, restaurantLat, restaurantLng, progress);
      simulation.currentLat = pos.lat;
      simulation.currentLng = pos.lng;
    } else if (currentPhase === 'to_customer') {
      const pos = interpolatePosition(restaurantLat, restaurantLng, customerLat, customerLng, progress);
      simulation.currentLat = pos.lat;
      simulation.currentLng = pos.lng;
    }

    // Gọi callback update
    onUpdate({ ...simulation });

    // Cập nhật drone position trong database
    try {
      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID,
        droneId,
        {
          currentLatitude: simulation.currentLat,
          currentLongitude: simulation.currentLng,
          // Note: deliveryPhase is tracked locally, not in database
        }
      );
    } catch (error) {
      console.error('Error updating drone position:', error);
    }

    // Chuyển phase khi hoàn thành
    if (progress >= 1) {
      switch (currentPhase) {
        case 'to_restaurant':
          currentPhase = 'picking_up';
          simulation.phase = currentPhase;
          phaseStartTime = Date.now();
          
          // Cập nhật order status
          await updateOrderStatus(orderId, 'picked_up');
          break;

        case 'picking_up':
          currentPhase = 'to_customer';
          simulation.phase = currentPhase;
          phaseStartTime = Date.now();
          
          // Cập nhật order status
          await updateOrderStatus(orderId, 'delivering');
          break;

        case 'to_customer':
          currentPhase = 'delivering';
          simulation.phase = currentPhase;
          phaseStartTime = Date.now();
          break;

        case 'delivering':
          currentPhase = 'completed';
          simulation.phase = currentPhase;
          isRunning = false;
          
          // Cập nhật order thành delivered
          await updateOrderStatus(orderId, 'delivered');
          
          // Giải phóng drone
          await freeDrone(droneId);
          
          clearInterval(intervalId);
          onComplete();
          break;
      }
    }
  }, 1000); // Update mỗi giây

  // Return cleanup function
  return () => {
    isRunning = false;
    clearInterval(intervalId);
  };
}

async function updateOrderStatus(orderId: string, status: string) {
  try {
    await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID,
      orderId,
      { status }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

async function freeDrone(droneId: string) {
  try {
    await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID,
      droneId,
      {
        status: 'available',
        assignedOrderId: null,
        // Note: deliveryPhase removed - not in database schema
        batteryLevel: Math.floor(Math.random() * 40 + 40), // 40-80%
      }
    );
  } catch (error) {
    console.error('Error freeing drone:', error);
  }
}

/**
 * Lấy tổng thời gian delivery (giây)
 */
export function getTotalDeliveryTime(): number {
  return PHASE_DURATIONS.to_restaurant + 
         PHASE_DURATIONS.picking_up + 
         PHASE_DURATIONS.to_customer + 
         PHASE_DURATIONS.delivering;
}

/**
 * Format thời gian còn lại
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s`;
}
