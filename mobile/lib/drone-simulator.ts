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
  hubCoords?: Coordinate; // Hub location (optional, will use DEFAULT_HUB_LOCATION if not provided)
  restaurantCoords: Coordinate;
  customerCoords: Coordinate;
  droneId?: string;
  duration?: number;
  phase?: 'to_restaurant' | 'to_customer' | 'full'; // Which phase to simulate
  onProgress?: (payload: {
    coordinate: Coordinate;
    progress: number;
    phase: 'hub_to_restaurant' | 'restaurant_to_customer';
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
  hubCoords,
  restaurantCoords,
  customerCoords,
  droneId,
  duration = 14000, // Total 14 seconds: 6s (hub→restaurant) + 8s (restaurant→customer)
  phase = 'full',
  onProgress,
}: SimulationOptions) => {
  const drone = await ensureDrone(orderId, droneId);
  
  console.log('🚁 Drone simulation starting with drone data:', {
    id: drone.$id,
    name: drone.name,
    homeLatitude: drone.homeLatitude,
    homeLongitude: drone.homeLongitude,
    currentLatitude: drone.currentLatitude,
    currentLongitude: drone.currentLongitude,
    droneHub: drone.droneHub
  });
  
  // Determine hub location
  // Priority: 1. hubCoords param, 2. droneHub object, 3. homeLatitude/Longitude, 4. DEFAULT_HUB_LOCATION
  let droneStartCoords: Coordinate;
  let hubName = 'Drone Hub';
  
  if (hubCoords) {
    droneStartCoords = hubCoords;
    console.log('🏠 Using provided hub coordinates:', droneStartCoords);
  } else if (drone.droneHub && typeof drone.droneHub === 'object' && 'latitude' in drone.droneHub) {
    // Drone hub is populated with full object
    const hub = drone.droneHub as any;
    droneStartCoords = {
      latitude: hub.latitude,
      longitude: hub.longitude,
    };
    hubName = hub.name || 'Drone Hub';
    console.log(`🏠 Drone starting from hub "${hubName}":`, droneStartCoords);
  } else if (drone.homeLatitude && drone.homeLongitude) {
    // Use drone's home position
    droneStartCoords = {
      latitude: drone.homeLatitude,
      longitude: drone.homeLongitude,
    };
    console.log('🏠 Drone starting from home position:', droneStartCoords);
  } else if (drone.currentLatitude && drone.currentLongitude) {
    // Use drone's current position
    droneStartCoords = {
      latitude: drone.currentLatitude,
      longitude: drone.currentLongitude,
    };
    console.log('📍 Drone starting from current position:', droneStartCoords);
  } else {
    // Fallback: use DEFAULT_HUB_LOCATION
    droneStartCoords = DEFAULT_HUB_LOCATION;
    console.log('⚠️ No hub/home/current position found. Using DEFAULT_HUB_LOCATION:', droneStartCoords);
  }
  
  // ========================================
  // PHASE 1: Drone flies from HUB to RESTAURANT (6 seconds)
  // ========================================
  const phase1Duration = 6000; // 6 seconds
  const phase1Steps = 30; // 30 steps = 200ms per step for very smooth animation
  
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
    const speed = 50; // Fast speed to restaurant

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(20, Math.floor(drone.batteryLevel - 0.2 * (i + 1))),
      altitude: 60,
    });
    
    // Phase 1 is 43% of total journey (6s of 14s)
    const totalProgress = progress * 0.43;
    
    onProgress?.({ 
      coordinate: point, 
      progress: totalProgress,
      phase: 'hub_to_restaurant' 
    });

    await sleep(phase1Duration / phase1Steps); // 200ms per step
  }

  // ========================================
  // Drone arrived at RESTAURANT - Picking up food
  // ========================================
  console.log('✅ Drone arrived at RESTAURANT!');
  console.log('📦 Loading food onto drone...');
  
  // Wait for restaurant to load food onto drone (simulate)
  await sleep(1000); // 1 second loading time
  
  // ========================================
  // PHASE 2: Drone flies from RESTAURANT to CUSTOMER (8 seconds)
  // ========================================
  console.log('🚁 PHASE 2: Drone flying from RESTAURANT to CUSTOMER...');
  console.log('   Restaurant location:', restaurantCoords);
  console.log('   Customer location:', customerCoords);
  
  // Update estimated delivery time
  const phase2Duration = 8000; // 8 seconds
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

  const phase2Steps = 40; // 40 steps = 200ms per step for very smooth animation
  const waypointsToCustomer = calculateWaypoints(restaurantCoords, customerCoords, phase2Steps);

  // Simulate flight from restaurant to customer
  for (let i = 0; i < waypointsToCustomer.length; i += 1) {
    const point = waypointsToCustomer[i];
    const progress = (i + 1) / waypointsToCustomer.length;

    const speedMultiplier = progress < 0.2 ? 0.7 : progress > 0.8 ? 0.6 : 1;
    const speed = Math.max(20, (drone.maxSpeed || 45) * speedMultiplier);
    const batteryDrain = Math.min(3, Math.max(0.3, speed / 50));

    await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
      orderId,
      speed,
      batteryLevel: Math.max(10, Math.floor(drone.batteryLevel - batteryDrain * (i + 1))),
      altitude: 70 - progress * 40,
    });

    // Phase 2 is 57% of total journey (8s of 14s), starting from 43%
    const totalProgress = 0.43 + (progress * 0.57);

    onProgress?.({ 
      coordinate: point, 
      progress: totalProgress,
      phase: 'restaurant_to_customer' 
    });

    await sleep(phase2Duration / phase2Steps); // 200ms per step
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
