/**
 * Drone Assignment Algorithm Utilities
 * Smart selection and optimization for drone delivery
 */

export interface Drone {
  $id: string;
  code: string;
  name: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  batteryLevel: number;
  currentLatitude?: number;
  currentLongitude?: number;
  maxPayload: number;
  currentPayload: number;
  maxRange: number;
  maxSpeed: number;
}

export interface Order {
  $id: string;
  restaurantId: any;
  deliveryLatitude: number;
  deliveryLongitude: number;
  total: number;
  $createdAt: string;
}

export interface DroneScore {
  drone: Drone;
  score: number;
  distance: number;
  eta: number; // Estimated time of arrival in minutes
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate order weight based on total amount
 * Simple heuristic: 10,000₫ ≈ 0.1 kg
 */
export function estimateOrderWeight(totalAmount: number): number {
  const baseWeight = 0.5; // Packaging weight
  const foodWeight = (totalAmount / 10000) * 0.1;
  return Math.min(baseWeight + foodWeight, 5); // Max 5kg
}

/**
 * Calculate ETA based on distance and drone speed
 * @returns ETA in minutes
 */
export function calculateETA(
  distanceKm: number,
  speedKmh: number = 50
): number {
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = timeHours * 60;
  return Math.ceil(timeMinutes);
}

/**
 * Calculate battery consumption for a trip
 * Returns percentage of battery needed
 */
export function calculateBatteryConsumption(
  distanceKm: number,
  payload: number
): number {
  // Base consumption: 2% per km
  // Additional: 0.5% per kg of payload
  const baseConsumption = distanceKm * 2;
  const payloadConsumption = payload * 0.5;
  return baseConsumption + payloadConsumption;
}

/**
 * Calculate comprehensive drone score for an order
 * Higher score = better match
 */
export function calculateDroneScore(
  drone: Drone,
  order: Order,
  restaurantLat: number,
  restaurantLon: number
): number {
  // Calculate distance from drone to restaurant
  const droneToRestaurant = calculateDistance(
    drone.currentLatitude || restaurantLat,
    drone.currentLongitude || restaurantLon,
    restaurantLat,
    restaurantLon
  );
  
  // Calculate distance from restaurant to delivery
  const restaurantToDelivery = calculateDistance(
    restaurantLat,
    restaurantLon,
    order.deliveryLatitude,
    order.deliveryLongitude
  );
  
  const totalDistance = droneToRestaurant + restaurantToDelivery;
  
  // Estimate order weight
  const orderWeight = estimateOrderWeight(order.total);
  
  // Calculate battery needed for round trip
  const batteryNeeded = calculateBatteryConsumption(
    totalDistance * 2, // Round trip
    orderWeight
  );
  
  // Check if drone has enough battery (with 20% safety margin)
  const batteryScore = drone.batteryLevel >= batteryNeeded * 1.2 ? 1 : 0;
  
  // Check if drone has enough payload capacity
  const payloadScore = (drone.maxPayload - drone.currentPayload) >= orderWeight ? 1 : 0;
  
  // Check if distance is within drone range
  const rangeScore = totalDistance <= drone.maxRange ? 1 : 0;
  
  // Scoring factors with weights
  const factors = {
    distance: droneToRestaurant,
    battery: drone.batteryLevel,
    payload: (drone.maxPayload - drone.currentPayload) / drone.maxPayload,
    availability: drone.status === 'available' ? 1 : 0,
    capabilities: (batteryScore + payloadScore + rangeScore) / 3
  };
  
  // Weights (total = 1.0)
  const weights = {
    distance: 0.25,      // 25% - Closer is better
    battery: 0.20,       // 20% - Higher battery is better
    payload: 0.15,       // 15% - More capacity is better
    availability: 0.15,  // 15% - Available drones preferred
    capabilities: 0.25   // 25% - Can complete mission
  };
  
  // Calculate weighted score (0-100 scale)
  const score =
    (1 / (factors.distance + 1)) * weights.distance * 100 +
    factors.battery * weights.battery +
    factors.payload * weights.payload * 100 +
    factors.availability * weights.availability * 100 +
    factors.capabilities * weights.capabilities * 100;
  
  return score;
}

/**
 * Select best drone for an order using smart algorithm
 */
export function selectBestDrone(
  order: Order,
  availableDrones: Drone[],
  restaurantLat: number,
  restaurantLon: number
): DroneScore | null {
  if (availableDrones.length === 0) {
    return null;
  }
  
  // Filter drones by basic capabilities
  const capableDrones = availableDrones.filter(drone => {
    // Must be available
    if (drone.status !== 'available') return false;
    
    // Must have minimum battery (30%)
    if (drone.batteryLevel < 30) return false;
    
    // Check distance within range
    const distance = calculateDistance(
      drone.currentLatitude || restaurantLat,
      drone.currentLongitude || restaurantLon,
      restaurantLat,
      restaurantLon
    );
    
    if (distance > drone.maxRange) return false;
    
    return true;
  });
  
  if (capableDrones.length === 0) {
    return null;
  }
  
  // Calculate scores for all capable drones
  const dronesWithScores: DroneScore[] = capableDrones.map(drone => {
    const score = calculateDroneScore(drone, order, restaurantLat, restaurantLon);
    
    const distance = calculateDistance(
      drone.currentLatitude || restaurantLat,
      drone.currentLongitude || restaurantLon,
      restaurantLat,
      restaurantLon
    );
    
    const eta = calculateETA(distance, drone.maxSpeed);
    
    return { drone, score, distance, eta };
  });
  
  // Sort by score (highest first)
  dronesWithScores.sort((a, b) => b.score - a.score);
  
  return dronesWithScores[0];
}

/**
 * Get priority level for an order based on waiting time
 */
export function getOrderPriority(createdAt: string): {
  level: 'low' | 'medium' | 'high' | 'urgent';
  waitingMinutes: number;
} {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const waitingMinutes = Math.floor(diffMs / 60000);
  
  if (waitingMinutes < 10) {
    return { level: 'low', waitingMinutes };
  } else if (waitingMinutes < 20) {
    return { level: 'medium', waitingMinutes };
  } else if (waitingMinutes < 30) {
    return { level: 'high', waitingMinutes };
  } else {
    return { level: 'urgent', waitingMinutes };
  }
}

/**
 * Sort orders by priority
 */
export function sortOrdersByPriority(orders: Order[]): Order[] {
  return orders.sort((a, b) => {
    const priorityA = getOrderPriority(a.$createdAt);
    const priorityB = getOrderPriority(b.$createdAt);
    
    // Urgent orders first
    if (priorityA.level === 'urgent' && priorityB.level !== 'urgent') return -1;
    if (priorityB.level === 'urgent' && priorityA.level !== 'urgent') return 1;
    
    // Then by waiting time (longest first)
    return priorityB.waitingMinutes - priorityA.waitingMinutes;
  });
}
