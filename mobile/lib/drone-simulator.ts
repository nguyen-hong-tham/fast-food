import { Drone } from '@/type';
import { appwriteConfig, databases, updateOrderStatus } from './appwrite';
import { assignDroneToOrder, completeDroneDelivery, getAvailableDrone, getDroneById, updateDroneLocation } from './api-helpers';
import { ID } from 'react-native-appwrite';

// Default Hub Location (Trung tâm điều phối drone)
export const DEFAULT_HUB_LOCATION: Coordinate = {
  latitude: 10.7587229,
  longitude: 106.682131,
};

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
  // If order already has a drone assigned, use that drone
  if (preferredDroneId) {
    const existing = await getDroneById(preferredDroneId);
    return existing;
  }

  // If no drone assigned yet, throw error - admin must assign manually
  throw new Error('No drone assigned to this order yet. Admin must assign a drone first.');
};

export const simulateDroneFlight = async ({
  orderId,
  restaurantCoords,
  customerCoords,
  droneId,
  duration = 25000, // Total 25 seconds: 10s (hub→restaurant) + 15s (restaurant→customer)
  phase = 'full',
  onProgress,
}: SimulationOptions) => {
  const drone = await ensureDrone(orderId, droneId);
  
  // Always use default hub location as starting point
  const droneStartCoords: Coordinate = DEFAULT_HUB_LOCATION;
  console.log('🏠 Drone starting from HUB:', droneStartCoords);
  
  // ========================================
  // PHASE 1: Drone flies from HUB to RESTAURANT (10 seconds)
  // ========================================
  const phase1Duration = 10000; // 10 seconds
  const phase1Steps = 20; // 20 steps = 0.5s per step for smooth animation
  
  const waypointsToRestaurant = calculateWaypoints(droneStartCoords, restaurantCoords, phase1Steps);
  
  console.log('🚁 PHASE 1: Drone flying from HUB to RESTAURANT...');
  console.log('   Hub location:', droneStartCoords);
  console.log('   Restaurant location:', restaurantCoords);
  
  // ✅ NOW set status to 'delivering' - simulation officially starts
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
      status: 'delivering',
      deliveryStartedAt: new Date().toISOString(),
    }
  );
  
  console.log('✅ Order status changed to DELIVERING');

  // Simulate flight from hub to restaurant
  for (let i = 0; i < waypointsToRestaurant.length; i += 1) {
    const point = waypointsToRestaurant[i];
    const progress = (i + 1) / waypointsToRestaurant.length;
    const speed = 45; // Fast speed to restaurant

    console.log(`🚁 Step ${i + 1}/${waypointsToRestaurant.length}: Moving to`, point);

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(20, Math.floor(drone.batteryLevel - 0.3 * (i + 1))),
      altitude: 50,
    });

    console.log(`📌 Calling onProgress - Phase 1 - ${Math.round(progress * 40)}%`);
    
    onProgress?.({ 
      coordinate: point, 
      progress: progress * 0.4, // 0-40% of total progress (10s of 25s)
      phase: 'to_restaurant' 
    });

    await sleep(phase1Duration / phase1Steps); // 0.5s per step
  }

  // ========================================
  // Drone arrived at RESTAURANT - Picking up food
  // ========================================
  console.log('✅ Drone arrived at RESTAURANT!');
  console.log('📦 Loading food onto drone...');
  
  // Wait for restaurant to load food onto drone (simulate)
  await sleep(2000); // 2 seconds loading time
  
  // ========================================
  // PHASE 2: Drone picks up and flies to CUSTOMER (15 seconds)
  // ========================================
  console.log('🚁 PHASE 2: Drone flying from RESTAURANT to CUSTOMER...');
  console.log('   Restaurant location:', restaurantCoords);
  console.log('   Customer location:', customerCoords);
  
  // Update estimated delivery time
  const phase2Duration = 15000; // 15 seconds
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    {
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

  const phase2Steps = 30; // 30 steps = 0.5s per step for smooth animation
  const waypointsToCustomer = calculateWaypoints(restaurantCoords, customerCoords, phase2Steps);

  console.log('🚁 PHASE 2: Drone delivering to customer...');

  for (let i = 0; i < waypointsToCustomer.length; i += 1) {
    const point = waypointsToCustomer[i];
    const progress = (i + 1) / waypointsToCustomer.length;

    console.log(`🚁 Step ${i + 1}/${waypointsToCustomer.length}: Moving to`, point);

    const speedMultiplier = progress < 0.2 ? 0.6 : progress > 0.8 ? 0.5 : 1;
    const speed = Math.max(15, (drone.maxSpeed || 40) * speedMultiplier);
    const batteryDrain = Math.min(4, Math.max(0.4, speed / 40));

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(10, Math.floor(drone.batteryLevel - batteryDrain * (i + 1))),
      altitude: 80 - progress * 50,
    });

    console.log(`📌 Calling onProgress - Phase 2 - ${Math.round((0.4 + progress * 0.6) * 100)}%`);

    onProgress?.({ 
      coordinate: point, 
      progress: 0.4 + (progress * 0.6), // 40-100% of total progress (15s of 25s)
      phase: 'to_customer' 
    });

    await sleep(phase2Duration / phase2Steps); // 0.5s per step
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
