import { useState, useEffect, useRef } from 'react';

import { useAuthStore } from '@/store/authStore';
import { databases, Query, client } from '@/lib/appwrite';
import { metricsTracker } from '@/lib/telemetry';
import { config } from '@/config';
import { Order } from '@/types';
import { Clock, CheckCircle, XCircle, Package, Truck, MapPin, X, Plane } from 'lucide-react';
import DeliveryTrackingMap from '@/components/DeliveryTrackingMap';

interface OrderItem {
  $id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  imageUrl?: string;
  orderId: any;
  $createdAt: string;
  $updatedAt: string;
}

interface Drone {
  $id: string;
  code: string;
  name: string;
  deliveryPhase?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  batteryLevel: number;
  homeLatitude?: number;
  homeLongitude?: number;
  droneHub?: DroneHub | string;
}

interface DroneHub {
  $id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Default hub location (273 An Dương Vương - Main Hub)
const DEFAULT_HUB = { latitude: 10.7599171, longitude: 106.6796834 };

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Helper function to calculate progress percentage
const calculateProgress = (
  dronePosition: { latitude: number; longitude: number } | null,
  hubCoords: { latitude: number; longitude: number } | null,
  restaurantCoords: { latitude: number; longitude: number } | null,
  customerCoords: { latitude: number; longitude: number } | null,
  phase?: string
): number => {
  if (!dronePosition || !restaurantCoords) return 0;
  
  const hub = hubCoords || DEFAULT_HUB;
  
  if (phase === 'to_restaurant') {
    const totalDistance = calculateDistance(hub.latitude, hub.longitude, restaurantCoords.latitude, restaurantCoords.longitude);
    if (totalDistance === 0) return 100;
    const currentDistance = calculateDistance(dronePosition.latitude, dronePosition.longitude, restaurantCoords.latitude, restaurantCoords.longitude);
    const traveled = totalDistance - currentDistance;
    return Math.min(Math.max((traveled / totalDistance) * 100, 0), 100);
  } else if (phase === 'to_customer' && customerCoords) {
    const totalDistance = calculateDistance(restaurantCoords.latitude, restaurantCoords.longitude, customerCoords.latitude, customerCoords.longitude);
    if (totalDistance === 0) return 100;
    const currentDistance = calculateDistance(dronePosition.latitude, dronePosition.longitude, customerCoords.latitude, customerCoords.longitude);
    const traveled = totalDistance - currentDistance;
    return Math.min(Math.max((traveled / totalDistance) * 100, 0), 100);
  }
  
  return 0;
};

// Helper function to calculate ETA in minutes
const calculateETA = (
  dronePosition: { latitude: number; longitude: number } | null,
  restaurantCoords: { latitude: number; longitude: number } | null,
  customerCoords: { latitude: number; longitude: number } | null,
  phase?: string
): number | undefined => {
  if (!dronePosition) return undefined;
  
  const DRONE_SPEED_KM_PER_HOUR = 50;
  let distance = 0;
  
  if (phase === 'to_restaurant' && restaurantCoords) {
    distance = calculateDistance(
      dronePosition.latitude, dronePosition.longitude,
      restaurantCoords.latitude, restaurantCoords.longitude
    );
  } else if (phase === 'to_customer' && customerCoords) {
    distance = calculateDistance(
      dronePosition.latitude, dronePosition.longitude,
      customerCoords.latitude, customerCoords.longitude
    );
  }
  
  const timeInHours = distance / DRONE_SPEED_KM_PER_HOUR;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  return timeInMinutes > 0 ? timeInMinutes : undefined;
};

// --- CLIENT SIDE INTERPOLATION HOOK (Phase C) ---
function getMetersDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function useInterpolatedCoordinate(target: { latitude: number; longitude: number } | null) {
  const [current, setCurrent] = useState<{ latitude: number; longitude: number } | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const targetCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!target) {
      setCurrent(null);
      startCoordsRef.current = null;
      targetCoordsRef.current = null;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    if (!current) {
      setCurrent(target);
      startCoordsRef.current = target;
      targetCoordsRef.current = target;
      return;
    }

    const dist = getMetersDistance(
      current.latitude, current.longitude,
      target.latitude, target.longitude
    );

    if (dist > 1000) {
      // Snap instantly if teleport threshold (1000m) is exceeded
      setCurrent(target);
      startCoordsRef.current = target;
      targetCoordsRef.current = target;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    startCoordsRef.current = { ...current };
    targetCoordsRef.current = { ...target };
    startTimeRef.current = performance.now();

    const duration = 2500; // Smooth 2.5s slide

    const animate = (time: number) => {
      if (!startCoordsRef.current || !targetCoordsRef.current) return;

      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const lat = startCoordsRef.current.latitude + (targetCoordsRef.current.latitude - startCoordsRef.current.latitude) * progress;
      const lng = startCoordsRef.current.longitude + (targetCoordsRef.current.longitude - startCoordsRef.current.longitude) * progress;

      setCurrent({ latitude: lat, longitude: lng });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target?.latitude, target?.longitude]);

  return current;
}

export default function OrdersPage() {
  const { restaurant, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drones, setDrones] = useState<Map<string, Drone>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Tracking state
  // const [showTracking, setShowTracking] = useState(false);
  const [rawDronePosition, setRawDronePosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const dronePosition = useInterpolatedCoordinate(rawDronePosition);
  const [deliveryPath, setDeliveryPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [hubCoords, setHubCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'to_restaurant' | 'to_customer' | 'idle'>('idle');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Animation refs to avoid closure issues
  const phaseRef = useRef(currentPhase);
  const simulatingRef = useRef(isSimulating);
  const hubRef = useRef(hubCoords);
  
  // Keep refs in sync
  useEffect(() => { phaseRef.current = currentPhase; }, [currentPhase]);
  useEffect(() => { simulatingRef.current = isSimulating; }, [isSimulating]);
  useEffect(() => { hubRef.current = hubCoords; }, [hubCoords]);
  
  // Helper function to check if order is new (< 5 minutes old)
  const isNewOrder = (order: Order): boolean => {
    const orderTime = new Date(order.$createdAt).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now - orderTime < fiveMinutes;
  };

  // Get count of new orders
  const newOrderCount = orders.filter(order => 
    isNewOrder(order) && order.status === 'pending'
  ).length;

  // ✅ Wait for auth to finish loading, then fetch orders
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }
    
    if (!restaurant?.$id) {
      console.log('⚠️ No restaurant found after auth loaded');
      setIsLoading(false);
      return;
    }

    console.log('✅ Auth loaded, fetching orders for restaurant:', restaurant.$id);
    fetchOrders();
    fetchDrones();
  }, [authLoading, restaurant?.$id]);

  // Subscribe to selected order details for realtime status changes (document-level subscription)
  useEffect(() => {
    if (authLoading || !selectedOrder?.$id) return;

    const orderChannel = `databases.${config.appwrite.databaseId}.collections.${config.appwrite.ordersCollectionId}.documents.${selectedOrder.$id}`;
    console.log('🔔 Subscribing to selected order document:', selectedOrder.$id);

    const unsubscribe = client.subscribe(orderChannel, (response) => {
      metricsTracker.logRealtimeEvent(`order-document: ${selectedOrder.$id}`);
      const payload = response.payload as any;
      console.log('📨 Selected order realtime update:', payload.$id, payload.status);
      
      // Update selected order details
      setSelectedOrder(prev => {
        if (prev?.$id === payload.$id) {
          return { ...prev, ...payload };
        }
        return prev;
      });

      // Also update the order in the list so list stays in sync
      setOrders(prev => 
        prev.map(o => o.$id === payload.$id ? { ...o, ...payload } : o)
      );
    });

    return () => {
      console.log('🧹 Unsubscribing from selected order document:', selectedOrder.$id);
      unsubscribe();
    };
  }, [authLoading, selectedOrder?.$id]);

  // Subscribe to drone position for selected delivering order (document-level subscription)
  useEffect(() => {
    if (!selectedOrder || !selectedOrder.droneId || selectedOrder.status !== 'delivering') {
      return;
    }

    console.log('🚁 Subscribing to drone position for drone:', selectedOrder.droneId);
    
    const droneChannel = `databases.${config.appwrite.databaseId}.collections.${config.appwrite.dronesCollectionId}.documents.${selectedOrder.droneId}`;
    
    const unsubscribe = client.subscribe(droneChannel, (response) => {
      metricsTracker.logRealtimeEvent(`drone-document: ${selectedOrder.droneId}`);
      const payload = response.payload as any;
      console.log('📍 Drone position update:', payload);
      
      if (payload.currentLatitude && payload.currentLongitude) {
        setRawDronePosition({
          latitude: payload.currentLatitude,
          longitude: payload.currentLongitude,
        });
        
        // Add to path
        setDeliveryPath(prev => [...prev, {
          latitude: payload.currentLatitude,
          longitude: payload.currentLongitude,
        }]);
      }
      
      // Update drone in map
      setDrones(prev => {
        const newMap = new Map(prev);
        newMap.set(payload.$id, payload);
        return newMap;
      });
    });

    return () => {
      console.log('🧹 Unsubscribing from drone position');
      unsubscribe();
    };
  }, [selectedOrder?.$id, selectedOrder?.droneId, selectedOrder?.status]);

  // Fetch drones for active orders
  const fetchDrones = async () => {
    metricsTracker.logPollRequest('restaurant/fetchDrones');
    try {
      const response = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.dronesCollectionId,
        [Query.limit(100)]
      );
      
      const dronesMap = new Map<string, Drone>();
      response.documents.forEach((drone: any) => {
        dronesMap.set(drone.$id, drone);
      });
      setDrones(dronesMap);
    } catch (error: any) {
      console.error('Error fetching drones:', error.message);
      // Don't fail if drones can't be fetched - it's optional
      if (error.message?.includes('not authorized')) {
        console.warn('💡 Restaurant role needs Read permission for drones collection');
      }
    }
  };

  // Auto-refresh orders every 30 seconds as fallback for realtime (optimized from 10s)
  useEffect(() => {
    if (authLoading || !restaurant?.$id) return;
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') {
        console.log('Skipping poll request: tab is inactive');
        return;
      }
      console.log('Auto-refreshing orders...');
      fetchOrders();
      fetchDrones();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [authLoading, restaurant?.$id]);

  // DRONE ANIMATION - Simulates drone movement Hub → Restaurant → Customer (synced with mobile)
  useEffect(() => {
    if (!isSimulating || !selectedOrder?.droneId || !restaurant) {
      return;
    }
    if (selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') {
      setIsSimulating(false);
      return;
    }

    console.log('Starting drone animation, phase:', phaseRef.current);

    // Capture coordinates
    const hub = hubRef.current || DEFAULT_HUB;
    const restaurantCoords = { latitude: restaurant.latitude, longitude: restaurant.longitude };
    const customerCoords = selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude
      ? { latitude: selectedOrder.deliveryLatitude, longitude: selectedOrder.deliveryLongitude }
      : null;

    console.log('Hub:', hub);
    console.log('Restaurant:', restaurantCoords);
    console.log('Customer:', customerCoords);

    // ============================================================
    // 🎮 ANIMATION SPEED SETTINGS - ĐIỀU CHỈNH TỐC ĐỘ TẠI ĐÂY
    // ============================================================
    // PHASE1_DURATION: Thời gian bay từ Hub → Restaurant (milliseconds)
    // PHASE2_DURATION: Thời gian bay từ Restaurant → Customer (milliseconds)
    // TICK_INTERVAL: Khoảng cách giữa các frame animation (ms) - càng nhỏ càng mượt
    // 
    // Ví dụ: 
    //   - 6000ms = 6 giây, 12000ms = 12 giây, 20000ms = 20 giây
    //   - Tăng số này để drone bay chậm hơn
    // ============================================================
    const PHASE1_DURATION = 18500; // 18 giây cho Hub → Restaurant (tăng từ 6s)
    const PHASE2_DURATION = 31500; // 31 giây cho Restaurant → Customer (tăng từ 8s)
    const TICK_INTERVAL = 200;     // 200ms per tick (giữ nguyên để animation mượt)
    // ============================================================
    
    const PHASE1_STEPS = PHASE1_DURATION / TICK_INTERVAL; // 60 steps
    const PHASE2_STEPS = PHASE2_DURATION / TICK_INTERVAL; // 80 steps
    
    let stepCount = 0;
    let currentSteps = PHASE1_STEPS;
    let startPos = { ...hub };
    let endPos = restaurantCoords;
    
    const animationInterval = setInterval(() => {
      if (!simulatingRef.current) {
        clearInterval(animationInterval);
        return;
      }

      stepCount++;
      const phase = phaseRef.current;
      
      // Calculate eased progress (same easing as mobile)
      const t = stepCount / currentSteps;
      const easeInOut = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      // Calculate new position
      const newPos = {
        latitude: startPos.latitude + (endPos.latitude - startPos.latitude) * easeInOut,
        longitude: startPos.longitude + (endPos.longitude - startPos.longitude) * easeInOut,
      };
      
      setRawDronePosition(newPos);

      // Check if phase completed
      if (stepCount >= currentSteps) {
        if (phase === 'to_restaurant') {
          console.log('Arrived at Restaurant!');
          phaseRef.current = 'to_customer';
          setCurrentPhase('to_customer');
          
          // Reset for phase 2
          stepCount = 0;
          currentSteps = PHASE2_STEPS;
          startPos = { ...restaurantCoords };
          endPos = customerCoords || restaurantCoords;
        } else {
          console.log('Arrived at Customer! Delivery complete.');
          simulatingRef.current = false;
          setIsSimulating(false);
          phaseRef.current = 'idle';
          setCurrentPhase('idle');
          clearInterval(animationInterval);
        }
      }
    }, TICK_INTERVAL);

    return () => clearInterval(animationInterval);
  }, [isSimulating, selectedOrder?.$id, restaurant]);

  const fetchOrders = async () => {
    metricsTracker.logPollRequest('restaurant/fetchOrders');
    if (!restaurant?.$id) {
      console.warn('No restaurant ID to fetch orders');
      setIsLoading(false);
      return;
    }

      try {
        setIsLoading(true);
        console.log('Fetching orders for restaurant:', restaurant.$id);
        console.log('Restaurant name:', restaurant.name);
        
        // Debug alert
        //alert(`DEBUG: Restaurant ID = ${restaurant.$id}\nRestaurant Name = ${restaurant.name}`);      // Try to query with restaurantId filter (will work if it's a string attribute)
      // If it fails, fall back to client-side filtering
      let filtered: any[];
      
      try {
        // Attempt server-side filtering
        const response = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.ordersCollectionId,
          [
            Query.equal('restaurantId', restaurant.$id),
            Query.orderDesc('$createdAt'),
            Query.limit(100)
          ]
        );
        filtered = response.documents;
        console.log('Server-side filtering successful:', filtered.length, 'orders');
      } catch (queryError: any) {
        // If server-side filtering fails (relationship), do client-side filtering
        console.log('Server-side filtering failed:', queryError.message);
        console.log('Fetching ALL orders for client-side filtering...');
        const response = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.ordersCollectionId,
          [
            Query.orderDesc('$createdAt'),
            Query.limit(100)
          ]
        );
        
        console.log('Total orders in database:', response.documents.length);
        
        // Debug: Log first few orders to see restaurantId structure
        response.documents.slice(0, 3).forEach((order: any, index: number) => {
          const orderRestaurantId = typeof order.restaurantId === 'object' 
            ? order.restaurantId?.$id || JSON.stringify(order.restaurantId)
            : order.restaurantId;
          console.log(`Order ${index + 1}:`, {
            orderId: order.$id,
            restaurantId: orderRestaurantId,
            restaurantIdType: typeof order.restaurantId,
            status: order.status,
            matches: orderRestaurantId === restaurant.$id
          });
        });
        
        // Filter client-side by restaurantId (handle relationship object)
        filtered = response.documents.filter((order: any) => {
          const orderRestaurantId = typeof order.restaurantId === 'object' 
            ? order.restaurantId?.$id 
            : order.restaurantId;
          const matches = orderRestaurantId === restaurant.$id;
          return matches;
        });
        console.log('Client-side filtered:', filtered.length, 'orders for restaurant', restaurant.$id);
      }
      
      // ALWAYS recalculate totals from order_items to ensure accuracy
      console.log(`Calculating totals for ${filtered.length} orders from order_items`);
      
      try {
        // Fetch all order items in one call
        const itemsResponse = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.orderItemsCollectionId,
          [Query.limit(500)]
        );
        
        console.log(`Found ${itemsResponse.documents.length} order items in database`);
        
        // Group items by orderId
        const itemsByOrderId: Record<string, any[]> = {};
        itemsResponse.documents.forEach((item: any) => {
          const orderId = typeof item.orderId === 'object' ? item.orderId.$id : item.orderId;
          if (!itemsByOrderId[orderId]) itemsByOrderId[orderId] = [];
          itemsByOrderId[orderId].push(item);
        });
        
        // Calculate totals for ALL orders - prioritize order.total from database
        const updatedOrders = filtered.map((order: any) => {
          const items = itemsByOrderId[order.$id] || [];
          
          // Priority 1: Use order.total if available (includes shipping)
          if (order.total && order.total > 0) {
            console.log(`Order ${order.$id}: Using order.total = ${order.total}₫`);
            return { ...order, totalAmount: order.total };
          }
          
          // Priority 2: Use order.totalAmount if available
          if (order.totalAmount && order.totalAmount > 0) {
            console.log(`Order ${order.$id}: Using order.totalAmount = ${order.totalAmount}₫`);
            return order;
          }
          
          // Priority 3: Calculate from items (fallback for old orders)
          const calculatedTotal = items.reduce((sum: number, item: any) => 
            sum + (item.subtotal || 0), 0
          );
          
          console.log(`Order ${order.$id}: ${items.length} items, calculated = ${calculatedTotal}₫`);
          
          return { 
            ...order, 
            totalAmount: calculatedTotal > 0 ? calculatedTotal : order.totalAmount 
          };
        });
        
        console.log('Totals recalculated from order items');
        console.table(updatedOrders.map((o: any) => ({
          orderId: o.$id.slice(-8),
          items: (itemsByOrderId[o.$id] || []).length,
          totalAmount: o.totalAmount,
          status: o.status
        })));
        
        setOrders(updatedOrders as any);
      } catch (calcError) {
        console.error('Error calculating totals:', calcError);
        setOrders(filtered as any);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsLoadingItems(true);
    setIsSimulating(false);
    setRawDronePosition(null);
    setDeliveryPath([]);
    setHubCoords(null);
    setCurrentPhase('idle');
    
    // Initialize drone tracking if order is being delivered
    if (order.droneId && (order.status === 'delivering' || order.status === 'picked_up')) {
      console.log('Initializing drone tracking for order:', order.$id);
      
      try {
        const drone = drones.get(order.droneId);
        let hubLocation = { ...DEFAULT_HUB };
        
        if (drone) {
          console.log('Found drone:', drone.name, drone);
          
          // Get hub from droneHub relationship
          if (drone.droneHub && typeof drone.droneHub === 'object' && 'latitude' in drone.droneHub) {
            const hub = drone.droneHub as DroneHub;
            hubLocation = { latitude: hub.latitude, longitude: hub.longitude };
            console.log('Hub from droneHub object:', hubLocation);
          } else if (drone.droneHub && typeof drone.droneHub === 'string') {
            // Fetch hub from database
            try {
              const hubDoc = await databases.getDocument(
                config.appwrite.databaseId,
                config.appwrite.droneHubsCollectionId,
                drone.droneHub
              );
              hubLocation = { latitude: hubDoc.latitude, longitude: hubDoc.longitude };
              console.log('Hub fetched:', hubDoc.name, hubLocation);
            } catch (e) {
              console.warn('Failed to fetch hub, using default');
            }
          } else if (drone.homeLatitude && drone.homeLongitude) {
            hubLocation = { latitude: drone.homeLatitude, longitude: drone.homeLongitude };
            console.log('Using drone home position:', hubLocation);
          }
        }
        
        // Set hub coords and start drone from hub
        setHubCoords(hubLocation);
        setCurrentPhase('to_restaurant');
        setRawDronePosition({ ...hubLocation });
        console.log('Drone starting from:', hubLocation);
        
        // Start simulation after state is set
        setTimeout(() => {
          setIsSimulating(true);
          console.log('Animation started');
        }, 300);
        
      } catch (err) {
        console.error('Error initializing tracking:', err);
      }
    }
    
    try {
      console.log('Fetching order items for order:', order.$id);
      
      // Fetch all order items first (orderId might be a relationship)
      const response = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.orderItemsCollectionId,
        [
          Query.limit(100)
        ]
      );

      console.log('Total order items in database:', response.documents.length);
      
      // Filter client-side by orderId (handle relationship object)
      const filtered = response.documents.filter((item: any) => {
        const itemOrderId = typeof item.orderId === 'object' 
          ? item.orderId.$id 
          : item.orderId;
        console.log('Comparing item orderId:', itemOrderId, 'with:', order.$id);
        return itemOrderId === order.$id;
      });

      console.log('Order items for this order:', filtered.length);
      setOrderItems(filtered as any);

      // Calculate total from order items
      const calculatedTotal = filtered.reduce((sum: number, item: any) => {
        return sum + (item.subtotal || 0);
      }, 0);

      console.log('Order totalAmount from DB:', order.totalAmount);
      console.log('Calculated total from items:', calculatedTotal);

      // Always update selectedOrder with calculated total for display
      const updatedOrder = { ...order, totalAmount: calculatedTotal };
      setSelectedOrder(updatedOrder);

      // Update orders list immediately with calculated total
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.$id === order.$id ? { ...o, totalAmount: calculatedTotal } : o
        )
      );

      // Update order in database if different and calculatedTotal > 0
      if (order.totalAmount !== calculatedTotal && calculatedTotal > 0) {
        console.log('Total amount mismatch! Updating order in database...');
        try {
          await databases.updateDocument(
            config.appwrite.databaseId,
            config.appwrite.ordersCollectionId,
            order.$id,
            { totalAmount: calculatedTotal }
          );
          console.log('Order total amount updated in database');
        } catch (updateError: any) {
          console.error('Error updating order total:', updateError);
          // Don't block the UI if update fails
        }
      }
    } catch (error: any) {
      console.error(' Error fetching order items:', error);
      alert('Failed to load order details: ' + error.message);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change the order status to ${newStatus.toUpperCase()}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      console.log('Updating order status:', orderId, 'to', newStatus);
      
      // Validate status value matches Appwrite enum
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status value: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const updateData = {
        status: newStatus
      };
      
      console.log('Sending update data:', updateData);
      
      await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        orderId,
        updateData
      );

      console.log('Order status updated successfully');
      
      // Refresh orders to get latest data
      await fetchOrders();
      
      // Close modal after successful update
      if (selectedOrder && selectedOrder.$id === orderId) {
        closeModal();
      }

      alert('Order status updated successfully!');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      alert('Failed to update order status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'ready':
      case 'picked_up':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivering':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivering':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            {/* NEW ORDER BADGE */}
            {newOrderCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 border-2 border-orange-500 rounded-full animate-pulse">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-sm font-bold text-orange-700">
                  {newOrderCount} đơn mới
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex overflow-x-auto">
            {['all', 'pending', 'preparing', 'ready', 'delivering', 'delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-6 py-3 font-medium transition-colors ${
                  filter === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {orders.filter(o => o.status === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Your orders will appear here once customers start ordering!' 
                : `No ${filter} orders at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isNew = isNewOrder(order);
              return (
              <div 
                key={order.$id} 
                className={`rounded-lg shadow hover:shadow-md transition-all ${
                  isNew 
                    ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 animate-pulse' 
                    : 'bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {/* 🔔 NEW ORDER INDICATOR */}
                      {isNew && (
                        <div className="mr-2 relative">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                        </div>
                      )}
                      {getStatusIcon(order.status)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.$id.slice(-8).toUpperCase()}
                          {isNew && (
                            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">
                              MỚI
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.$createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(order.totalAmount || 0).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                      <p className={`text-sm font-medium ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{order.deliveryAddress}</span>
                  </div>

                  {/* Drone Status Info */}
                  {order.droneId && (order.status === 'picked_up' || order.status === 'delivering') && (() => {
                    const drone = drones.get(order.droneId);
                    
                    if (!drone) return null;
                    
                    const getPhaseInfo = (phase?: string) => {
                      switch (phase) {
                        case 'to_restaurant':
                          return { 
                            label: 'Drone đang bay đến nhà hàng', 
                            icon: '✈️', 
                            bgColor: 'bg-blue-50', 
                            borderColor: 'border-blue-200',
                            progressColor: 'bg-blue-500',
                            eta: '~20s' 
                          };
                        case 'picking_up':
                          return { 
                            label: 'Drone đang lấy hàng', 
                            icon: '📦', 
                            bgColor: 'bg-yellow-50', 
                            borderColor: 'border-yellow-200',
                            progressColor: 'bg-yellow-500',
                            eta: '~5s' 
                          };
                        case 'to_customer':
                          return { 
                            label: 'Drone đang giao hàng cho khách', 
                            icon: '🚚', 
                            bgColor: 'bg-purple-50', 
                            borderColor: 'border-purple-200',
                            progressColor: 'bg-purple-500',
                            eta: '~30s' 
                          };
                        case 'delivering':
                          return { 
                            label: 'Drone đang giao hàng', 
                            icon: '📍', 
                            bgColor: 'bg-green-50', 
                            borderColor: 'border-green-200',
                            progressColor: 'bg-green-500',
                            eta: '~3s' 
                          };
                        default:
                          return { 
                            label: 'Drone đang di chuyển', 
                            icon: '🚁', 
                            bgColor: 'bg-gray-50', 
                            borderColor: 'border-gray-200',
                            progressColor: 'bg-gray-500',
                            eta: '-' 
                          };
                      }
                    };
                    
                    const phaseInfo = getPhaseInfo(drone.deliveryPhase);
                    
                    return (
                      <div className={`mt-3 p-3 ${phaseInfo.bgColor} border ${phaseInfo.borderColor} rounded-lg`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl animate-bounce">{phaseInfo.icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {phaseInfo.label}
                              </p>
                              <p className="text-xs text-gray-600">
                                Drone: {drone.code} • {drone.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">ETA</p>
                            <p className="text-sm font-bold text-gray-900">{phaseInfo.eta}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${phaseInfo.progressColor} transition-all animate-pulse`}
                                style={{ width: '60%' }}
                              />
                            </div>
                          </div>
                          <Plane className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    );
                  })()}

                  {order.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.$id, 'preparing')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(order.$id, 'ready')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Mark Ready (Gọi Drone)
                      </button>
                    )}
                    {order.status === 'delivering' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg">
                        <span className="animate-pulse">🚁</span>
                        <span className="text-sm font-medium">Drone đang giao hàng...</span>
                      </div>
                    )}
                    {(order.status === 'ready' || order.status === 'picked_up') && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                        <span className="animate-bounce">🚁</span>
                        <span className="text-sm font-medium">Đang chờ drone lấy hàng...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{selectedOrder.$id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Status</h3>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.$createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg text-gray-900">
                      {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className={`font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedOrder.paymentStatus.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Delivery Address</h3>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{(selectedOrder as any).deliveryAddressLabel || 'Delivery Location'}</p>
                    <p className="text-gray-700">{selectedOrder.deliveryAddress}</p>
                    <p className="text-gray-500 mt-1">📞 {(selectedOrder as any).phone}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Tracking Map */}
              {(selectedOrder.status === 'delivering' || selectedOrder.status === 'picked_up') && selectedOrder.droneId && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    Live Tracking
                  </h3>
                  <DeliveryTrackingMap
                    hub={hubCoords || DEFAULT_HUB}
                    path={deliveryPath}
                    restaurant={restaurant ? {
                      latitude: restaurant.latitude,
                      longitude: restaurant.longitude,
                      name: restaurant.name
                    } : null}
                    customer={selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude ? {
                      latitude: selectedOrder.deliveryLatitude,
                      longitude: selectedOrder.deliveryLongitude,
                      address: selectedOrder.deliveryAddress
                    } : null}
                    drone={dronePosition ? {
                      latitude: dronePosition.latitude,
                      longitude: dronePosition.longitude,
                      name: drones.get(selectedOrder.droneId)?.name,
                      batteryLevel: drones.get(selectedOrder.droneId)?.batteryLevel
                    } : null}
                    currentPhase={currentPhase}
                    progress={calculateProgress(
                      dronePosition,
                      hubCoords,
                      restaurant ? { latitude: restaurant.latitude, longitude: restaurant.longitude } : null,
                      selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude 
                        ? { latitude: selectedOrder.deliveryLatitude, longitude: selectedOrder.deliveryLongitude }
                        : null,
                      currentPhase
                    )}
                    etaMinutes={calculateETA(
                      dronePosition,
                      restaurant ? { latitude: restaurant.latitude, longitude: restaurant.longitude } : null,
                      selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude 
                        ? { latitude: selectedOrder.deliveryLatitude, longitude: selectedOrder.deliveryLongitude }
                        : null,
                      currentPhase
                    )}
                    className="h-96 rounded-lg overflow-hidden"
                  />
                  <div className="mt-2 flex justify-center gap-4">
                    <span className="text-sm text-gray-500">
                      Phase: {currentPhase === 'to_restaurant' ? 'Hub → Restaurant' : currentPhase === 'to_customer' ? 'Restaurant → Customer' : 'Idle'}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Customer Notes</h3>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Items</h3>
                {isLoadingItems ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items found</p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.$id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {item.price.toLocaleString('vi-VN')}₫
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1 italic">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.subtotal.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Summary */}
                    <div className="pt-3 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">Total</p>
                        <p className="text-xl font-bold text-primary-600">
                          {orderItems.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-2 flex-wrap">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.$id, 'preparing');
                        closeModal();
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Accept Order
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.$id, 'ready');
                        closeModal();
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Mark Ready (Gọi Drone)
                    </button>
                  )}
                  {selectedOrder.status === 'delivering' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <span className="animate-pulse text-xl">🚁</span>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Drone đang giao hàng</p>
                        <p className="text-xs text-purple-600">Đơn hàng sẽ tự động hoàn thành khi drone giao xong</p>
                      </div>
                    </div>
                  )}
                  {(selectedOrder.status === 'ready' || selectedOrder.status === 'picked_up') && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="animate-bounce text-xl">🚁</span>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Đang chờ drone lấy hàng</p>
                        <p className="text-xs text-blue-600">Admin sẽ assign drone để giao hàng</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
