import { Drone } from '@/type';
import { appwriteConfig, databases, updateOrderStatus } from './appwrite';
import { assignDroneToOrder, completeDroneDelivery, getAvailableDrone, getDroneById, updateDroneLocation } from './api-helpers';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

interface SimulationOptions {
  orderId: string;
  restaurantCoords: Coordinate;
  customerCoords: Coordinate;
  droneId?: string;
  duration?: number; // Total duration for full journey (restaurant → customer)
  onProgress?: (payload: {
    coordinate: Coordinate;
    progress: number;
    phase: 'to_restaurant' | 'to_customer'; // Which phase of delivery
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
  onProgress,
}: SimulationOptions) => {
  const drone = await ensureDrone(orderId, droneId);
  
  // Phase 1: Drone flies to restaurant (30% of total time)
  const phase1Duration = duration * 0.3;
  const phase1Steps = Math.max(8, Math.floor(phase1Duration / 2500));
  
  // Assume drone starts from base location (nearby restaurant for simplicity)
  const droneBaseCoords: Coordinate = {
    latitude: restaurantCoords.latitude + 0.005, // ~500m away
    longitude: restaurantCoords.longitude + 0.005,
  };
  
  const waypointsToRestaurant = calculateWaypoints(droneBaseCoords, restaurantCoords, phase1Steps);
  
  console.log('🚁 Phase 1: Drone flying to restaurant...');
  
  // Update order status to show drone is on the way to pick up
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      status: 'ready', // Restaurant marked ready, drone coming
      droneId: drone.$id,
      assignedAt: new Date().toISOString(),
    }
  );

  // Simulate flight to restaurant
  for (let i = 0; i < waypointsToRestaurant.length; i += 1) {
    const point = waypointsToRestaurant[i];
    const progress = (i + 1) / waypointsToRestaurant.length;
    const speed = 30; // Moderate speed to restaurant

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(10, drone.batteryLevel - 0.5 * (i + 1)),
      altitude: 50,
    });

    onProgress?.({ 
      coordinate: point, 
      progress: progress * 0.3, // 0-30% of total progress
      phase: 'to_restaurant' 
    });

    await sleep(phase1Duration / phase1Steps);
  }

  // Drone arrived at restaurant - update to picked_up
  console.log('✅ Drone arrived at restaurant, picking up order...');
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      status: 'picked_up',
      pickedUpAt: new Date().toISOString(),
    }
  );

  // Small delay to simulate package loading
  await sleep(3000);

  // Phase 2: Drone flies to customer (70% of remaining time)
  const phase2Duration = duration * 0.7;
  const phase2Steps = Math.max(16, Math.floor(phase2Duration / 2500));
  const waypointsToCustomer = calculateWaypoints(restaurantCoords, customerCoords, phase2Steps);

  console.log('🚁 Phase 2: Drone flying to customer...');
  
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      status: 'delivering',
      estimatedDeliveryTime: new Date(Date.now() + phase2Duration).toISOString(),
    }
  );

  for (let i = 0; i < waypointsToCustomer.length; i += 1) {
    const point = waypointsToCustomer[i];
    const progress = (i + 1) / waypointsToCustomer.length;

    const speedMultiplier = progress < 0.2 ? 0.6 : progress > 0.8 ? 0.5 : 1;
    const speed = Math.max(15, (drone.maxSpeed || 40) * speedMultiplier);
    const batteryDrain = Math.min(5, Math.max(0.5, speed / 40));

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(5, drone.batteryLevel - batteryDrain * (i + 1)),
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

  // Delivery complete
  console.log('✅ Drone delivered to customer!');
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
