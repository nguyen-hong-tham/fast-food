/**
 * Hook for real-time drone tracking
 */

import { useEffect, useState, useCallback } from 'react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import type { Drone, Order } from '../types';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface ActiveDelivery {
  orderId: string;
  droneId: string;
  status: string;
  restaurantCoords: Coordinate;
  customerCoords: Coordinate;
  hubCoords: Coordinate;
  phase: 'to_restaurant' | 'picking_up' | 'to_customer' | 'completed';
  progress: number;
}

interface UseRealtimeDroneTrackingOptions {
  autoRefreshInterval?: number; // ms, default 3000
}

export const useRealtimeDroneTracking = (
  options: UseRealtimeDroneTrackingOptions = {}
) => {
  const { autoRefreshInterval = 3000 } = options;

  const [drones, setDrones] = useState<Drone[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all drones
   */
  const fetchDrones = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID,
        [Query.limit(100), Query.orderDesc('$createdAt')]
      );
      return response.documents as unknown as Drone[];
    } catch (err) {
      console.error('Failed to fetch drones:', err);
      throw err;
    }
  }, []);

  /**
   * Fetch orders that need drone delivery
   */
  const fetchActiveOrders = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID,
        [
          Query.equal('status', ['ready', 'delivering']),
          Query.limit(50),
          Query.orderDesc('$createdAt'),
        ]
      );
      return response.documents as unknown as Order[];
    } catch (err) {
      console.error('Failed to fetch active orders:', err);
      throw err;
    }
  }, []);

  /**
   * Main data refresh function
   */
  const refreshData = useCallback(async () => {
    try {
      const [dronesData, ordersData] = await Promise.all([
        fetchDrones(),
        fetchActiveOrders(),
      ]);

      setDrones(dronesData);

      // Build active deliveries from orders
      const deliveries: ActiveDelivery[] = ordersData
        .filter(order => order.droneId)
        .map(order => {
          const droneId = typeof order.droneId === 'string' ? order.droneId : order.droneId?.$id;
          return {
            orderId: order.$id,
            droneId: droneId || '',
            status: order.status,
            restaurantCoords: { latitude: 0, longitude: 0 },
            customerCoords: { latitude: 0, longitude: 0 },
            hubCoords: { latitude: 0, longitude: 0 },
            phase: 'to_restaurant' as const,
            progress: 0,
          };
        });

      setActiveDeliveries(deliveries);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDrones, fetchActiveOrders]);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    refreshData();

    const interval = setInterval(() => {
      refreshData();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [refreshData, autoRefreshInterval]);

  return {
    drones,
    activeDeliveries,
    isLoading,
    error,
    refreshData,
  };
};
