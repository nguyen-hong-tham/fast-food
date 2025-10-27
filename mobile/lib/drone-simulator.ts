import { Drone } from '@/type';
import { appwriteConfig, databases, updateOrderStatus } from './appwrite';
import { assignDroneToOrder, completeDroneDelivery, getAvailableDrone, getDroneById, updateDroneLocation } from './api-helpers';
import { ID } from 'react-native-appwrite';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

interface SimulationOptions {
  orderId: string;
  restaurantCoords: Coordinate;
  customerCoords: Coordinate;
  droneId?: string;
  duration?: number;
  phase?: 'to_restaurant' | 'to_customer' | 'full'; // Which phase to simulate
  onProgress?: (payload: {
    coordinate: Coordinate;
    progress: number;
    phase: 'to_restaurant' | 'to_customer';
  }) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const calculateWaypoints = (
  start: Coordinate,
  end: Coordinate,
  steps: number = 24
): Coordinate[] => {
  const waypoints: Coordinate[] = [];

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const easeInOut = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    waypoints.push({
      latitude: start.latitude + (end.latitude - start.latitude) * easeInOut,
      longitude: start.longitude + (end.longitude - start.longitude) * easeInOut,
    });
  }

  return waypoints;
};

const ensureDrone = async (orderId: string, preferredDroneId?: string): Promise<Drone> => {
  if (preferredDroneId) {
    const existing = await getDroneById(preferredDroneId);
    if (existing.assignedOrderId !== orderId) {
      const updated = await assignDroneToOrder(existing.$id, orderId);
      return updated;
    }
    return existing;
  }

  const available = await getAvailableDrone();
  if (!available) {
    throw new Error('No drone available for delivery');
  }

  const updated = await assignDroneToOrder(available.$id, orderId);
  return updated;
};

export const simulateDroneFlight = async ({
  orderId,
  restaurantCoords,
  customerCoords,
  droneId,
  duration = 60000, // Total 60 seconds for complete delivery
  phase = 'full',
  onProgress,
}: SimulationOptions) => {
  const drone = await ensureDrone(orderId, droneId);
  
  // ========================================
  // PHASE 1: Drone flies to restaurant (30%)
  // ========================================
  const phase1Duration = duration * 0.3;
  const phase1Steps = Math.max(10, Math.floor(phase1Duration / 2500));
  
  // Drone starts from base location (nearby restaurant)
  const droneBaseCoords: Coordinate = {
    latitude: restaurantCoords.latitude + 0.005, // ~500m away
    longitude: restaurantCoords.longitude + 0.005,
  };
  
  const waypointsToRestaurant = calculateWaypoints(droneBaseCoords, restaurantCoords, phase1Steps);
  
  console.log('🚁 PHASE 1: Drone flying to restaurant...');
  
  // Just assign drone, don't change order status
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      droneId: drone.$id,
      assignedAt: new Date().toISOString(),
    }
  );

  // Simulate flight to restaurant
  for (let i = 0; i < waypointsToRestaurant.length; i += 1) {
    const point = waypointsToRestaurant[i];
    const progress = (i + 1) / waypointsToRestaurant.length;
    const speed = 45; // Fast speed to restaurant

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(20, Math.floor(drone.batteryLevel - 0.3 * (i + 1))),
      altitude: 50,
    });

    onProgress?.({ 
      coordinate: point, 
      progress: progress * 0.3, // 0-30% of total progress
      phase: 'to_restaurant' 
    });

    await sleep(phase1Duration / phase1Steps);
  }

  // ========================================
  // Drone arrived at restaurant
  // ========================================
  console.log('✅ Drone arrived at restaurant!');
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      status: 'ready',
      readyAt: new Date().toISOString(),
    }
  );
  
  // Wait for restaurant to prepare food (simulate)
  console.log('⏳ Waiting for restaurant to prepare food...');
  await sleep(5000); // 5 seconds preparation time
  
  // ========================================
  // PHASE 2: Drone picks up and flies to customer (70%)
  // ========================================
  console.log('📦 Drone picking up order...');
  
  // Update to delivering status
  const phase2Duration = duration * 0.7;
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      status: 'delivering',
      estimatedDeliveryTime: new Date(Date.now() + phase2Duration).toISOString(),
    }
  );

  // Create delivery_start event
  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.droneEventsCollectionId,
    ID.unique(),
    {
      droneId: drone.$id,
      orderId,
      eventType: 'delivery_start',
      latitude: restaurantCoords.latitude,
      longitude: restaurantCoords.longitude,
      batteryLevel: drone.batteryLevel,
    }
  );

  const phase2Steps = Math.max(20, Math.floor(phase2Duration / 2500));
  const waypointsToCustomer = calculateWaypoints(restaurantCoords, customerCoords, phase2Steps);

  console.log('🚁 PHASE 2: Drone delivering to customer...');

  for (let i = 0; i < waypointsToCustomer.length; i += 1) {
    const point = waypointsToCustomer[i];
    const progress = (i + 1) / waypointsToCustomer.length;

    const speedMultiplier = progress < 0.2 ? 0.6 : progress > 0.8 ? 0.5 : 1;
    const speed = Math.max(15, (drone.maxSpeed || 40) * speedMultiplier);
    const batteryDrain = Math.min(4, Math.max(0.4, speed / 40));

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(10, Math.floor(drone.batteryLevel - batteryDrain * (i + 1))),
      altitude: 80 - progress * 50,
    });

    onProgress?.({ 
      coordinate: point, 
      progress: 0.3 + (progress * 0.7), // 30-100% of total progress
      phase: 'to_customer' 
    });

    const jitter = (phase2Duration / phase2Steps) * (progress < 0.3 ? 1.2 : progress > 0.7 ? 0.8 : 1);
    await sleep(jitter);
  }

  // ========================================
  // Delivery complete
  // ========================================
  console.log('✅ Drone delivered to customer!');
  
  // Create delivery_complete event
  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.droneEventsCollectionId,
    ID.unique(),
    {
      droneId: drone.$id,
      orderId,
      eventType: 'delivery_complete',
      latitude: customerCoords.latitude,
      longitude: customerCoords.longitude,
    }
  );

  await completeDroneDelivery(drone.$id);
  await updateOrderStatus(orderId, 'delivered');
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      deliveredAt: new Date().toISOString(),
      paymentStatus: 'paid',
    }
  );
};
