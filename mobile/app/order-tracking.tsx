import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

import CustomHeader from '@/components/common/CustomHeader';
import DeliveryMap from '@/components/tracking';
import RealtimeStatus from '@/components/tracking/RealtimeStatus';

// Define LatLng type locally to avoid web import issues
interface LatLng {
  latitude: number;
  longitude: number;
}
import StatusTimeline from '@/components/tracking/StatusTimeline';
import { getOrderById, getOrderItems, subscribeToDroneEvents, subscribeToDronePosition, subscribeToOrder, updateOrderStatus } from '@/lib/appwrite';
import { getDroneById, getRestaurantById } from '@/lib/api-helpers';
import { useDeliveryCalculation } from '@/hooks/useDeliveryCalculation';
import { icons } from '@/constants';
import { Drone, DroneHub, Order, OrderItem, Restaurant } from '@/type';

const DEFAULT_COORDINATE: LatLng = {
  latitude: 10.762622,
  longitude: 106.660172,
};

const parseOrderItems = (rawItems: Order['items']): OrderItem[] => {
  // Items are now stored in separate orderItems collection
  // This function is kept for backwards compatibility with old orders
  if (!rawItems) return [];
  if (Array.isArray(rawItems)) return rawItems;

  try {
    return JSON.parse(rawItems as unknown as string) as OrderItem[];
  } catch (error) {
    console.warn('Failed to parse order.items, will fetch from orderItems collection');
    return [];
  }
};

// ✅ Map OrderItemDocument to OrderItem (imageUrl → image_url)
const mapOrderItemsFromDatabase = (docs: any[]): OrderItem[] => {
  return docs.map(doc => ({
    menuItemId: doc.menuItemId,
    name: doc.name,
    price: doc.price,
    quantity: doc.quantity,
    image_url: doc.imageUrl || '', // ✅ Map imageUrl → image_url
    notes: doc.notes,
  }));
};

const OrderTrackingScreen = () => {
  const params = useLocalSearchParams<{ orderId?: string; id?: string }>();
  const trackingOrderId = useMemo(() => params.orderId || params.id, [params.orderId, params.id]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [restaurantCoords, setRestaurantCoords] = useState<LatLng | null>(null);
  const [customerCoords, setCustomerCoords] = useState<LatLng | null>(null);
  const [droneCoords, setDroneCoords] = useState<LatLng | null>(null);
  const [droneHubCoords, setDroneHubCoords] = useState<LatLng | null>(null); // Drone hub location
  const [dronePath, setDronePath] = useState<LatLng[]>([]);
  const [etaMinutes, setEtaMinutes] = useState<number | undefined>(undefined);
  const [countdownActive, setCountdownActive] = useState(false);
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [hasRealtimeProgress, setHasRealtimeProgress] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'to_restaurant' | 'to_customer' | 'idle'>('idle');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Delivery calculation hook
  const { 
    calculation: deliveryCalc, 
    calculateFromAddress 
  } = useDeliveryCalculation();

  const loadOrder = useCallback(async () => {
    if (!trackingOrderId) {
  setErrorMessage('Order not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orderDoc = await getOrderById(trackingOrderId);
      const typedOrder = orderDoc as unknown as Order;
      setOrder(typedOrder);
      
      // Fetch order items from orderItems collection
      try {
        const orderItemsData = await getOrderItems(trackingOrderId);
        console.log('📦 Fetched order items:', orderItemsData.length);
        const mappedItems = mapOrderItemsFromDatabase(orderItemsData); // ✅ Map fields
        setItems(mappedItems);
      } catch (itemsError) {
        console.warn('Failed to fetch order items from collection, trying to parse from order.items field');
        // Fallback to old method for backwards compatibility
        setItems(parseOrderItems(typedOrder.items));
      }

      if (typedOrder.restaurantId) {
        const restaurantDoc = await getRestaurantById(typedOrder.restaurantId);
        setRestaurant(restaurantDoc as unknown as Restaurant);
        setRestaurantCoords({
          latitude: restaurantDoc.latitude,
          longitude: restaurantDoc.longitude,
        });
        
        // Calculate delivery info
        if (typedOrder.deliveryAddress && restaurantDoc.latitude && restaurantDoc.longitude) {
          await calculateFromAddress(
            restaurantDoc.latitude,
            restaurantDoc.longitude,
            typedOrder.deliveryAddress
          );
        }
      }
    } catch (err) {
  console.error('Failed to load order tracking data', err);
  setErrorMessage('Unable to load order tracking data');
    } finally {
      setLoading(false);
    }
  }, [trackingOrderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!order) return;

    let isActive = true;

    (async () => {
      // First priority: use deliveryLatitude/deliveryLongitude from order if available
      if (order.deliveryLatitude && order.deliveryLongitude) {
        console.log('📍 Using delivery coords from order DB:', order.deliveryLatitude, order.deliveryLongitude);
        console.log('📍 Delivery address from order:', order.deliveryAddress);
        alert(`🔍 DEBUG Customer Coords:\nDB Coords: ${order.deliveryLatitude}, ${order.deliveryLongitude}\nAddress: ${order.deliveryAddress}`);
        setCustomerCoords({ 
          latitude: order.deliveryLatitude, 
          longitude: order.deliveryLongitude 
        });
        return;
      }

      // Fallback: geocode the address
      if (order.deliveryAddress) {
        try {
          const geocoded = await Location.geocodeAsync(order.deliveryAddress);
          if (geocoded.length > 0 && isActive) {
            console.log('📍 Geocoded delivery address:', geocoded[0].latitude, geocoded[0].longitude);
            setCustomerCoords({ latitude: geocoded[0].latitude, longitude: geocoded[0].longitude });
            return;
          }
        } catch (err) {
          console.warn('Geocode failed, falling back to user location', err);
        }
      }

      // Last resort: use current location
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          if (isActive) {
            setCustomerCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
          return;
        }
      } catch (err) {
        console.warn('Location permission denied or not available', err);
      }

      if (isActive) {
        setCustomerCoords(DEFAULT_COORDINATE);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [order?.deliveryAddress, order?.deliveryLatitude, order?.deliveryLongitude]);

  useEffect(() => {
    if (!trackingOrderId) return;

    let isSubscribed = true;

    const unsubscribe = subscribeToOrder(trackingOrderId, async (updated) => {
      if (!isSubscribed) return;
      
      try {
        console.log('Order update received via realtime:', updated.status);
        console.log('Drone ID in update:', updated.droneId);
        
        setRealtimeConnected(true); // Mark realtime as working
        
        // Always refetch order if droneId is missing in realtime update
        // This catches when Admin assigns drone (ready status) AND when delivering
        const shouldRefetch = !updated.droneId && 
          (updated.status === 'ready' || updated.status === 'delivering' || updated.status === 'picked_up');
        
        if (shouldRefetch) {
          console.log(`Status is ${updated.status} but no droneId in realtime update. Refetching order...`);
          try {
            const fullOrder = await getOrderById(trackingOrderId);
            console.log('Refetched order droneId:', fullOrder.droneId);
            
            // Update phase based on status
            // ready with droneId = drone flying to restaurant (Admin just assigned)
            // picked_up = drone at restaurant, picking up food
            // delivering = drone flying to customer
            if (fullOrder.status === 'ready' || fullOrder.status === 'preparing') {
              if (fullOrder.droneId) {
                setCurrentPhase('to_restaurant');
                console.log('🚀 Phase set to to_restaurant (drone flying to restaurant)');
              }
            } else if (fullOrder.status === 'picked_up') {
              // Drone at restaurant, but not yet flying to customer
              console.log('📦 Order picked up - drone at restaurant');
            } else if (fullOrder.status === 'delivering') {
              setCurrentPhase((prevPhase) => {
                if (prevPhase !== 'to_customer') {
                  console.log('🔄 Phase changed to to_customer - resetting path from restaurant');
                  // Clear old path and start from restaurant
                  setDronePath(restaurantCoords ? [restaurantCoords] : []);
                  if (restaurantCoords) {
                    setDroneCoords(restaurantCoords);
                  }
                }
                return 'to_customer';
              });
            }
            
            setOrder(fullOrder as unknown as Order);
            
            // Refetch items from orderItems collection
            const orderItemsData = await getOrderItems(trackingOrderId);
            const mappedItems = mapOrderItemsFromDatabase(orderItemsData);
            setItems(mappedItems);
            return;
          } catch (error) {
            console.error('Error refetching order:', error);
          }
        }
        
        // Update phase based on order status (for cases where droneId is already known)
        // ready with droneId = drone flying to restaurant
        // picked_up = drone at restaurant
        // delivering = drone flying to customer
        if (updated.status === 'ready' || updated.status === 'preparing') {
          // Only set phase if we have a drone assigned
          setOrder((prev) => {
            if (prev?.droneId) {
              setCurrentPhase('to_restaurant');
            }
            return prev;
          });
        } else if (updated.status === 'picked_up') {
          // Drone arrived at restaurant, preparing to fly to customer
          console.log('📦 Order picked up - drone at restaurant, preparing to fly to customer');
        } else if (updated.status === 'delivering') {
          setCurrentPhase((prevPhase) => {
            if (prevPhase !== 'to_customer') {
              console.log('🔄 Phase changed to to_customer - resetting path from restaurant');
              // Clear old path and start from restaurant
              setDronePath(restaurantCoords ? [restaurantCoords] : []);
              if (restaurantCoords) {
                setDroneCoords(restaurantCoords);
              }
            }
            return 'to_customer';
          });
        }
        
        setOrder((prev) => {
          const merged = { ...(prev || {}), ...updated } as Order;
          console.log('Merged order droneId:', merged.droneId);
          return merged;
        });
      } catch (error) {
        console.error('Error processing order update:', error);
      }
    });

    return () => {
      isSubscribed = false;
      try {
        unsubscribe?.();
      } catch (error) {
        console.error('Error unsubscribing from order:', error);
      }
    };
  }, [trackingOrderId]);

  useEffect(() => {
    if (!trackingOrderId) return;

    let isSubscribed = true;

    const unsubscribe = subscribeToDroneEvents(trackingOrderId, (event) => {
      if (!isSubscribed) return;
      
      try {
        // Note: Position updates are handled by subscribeToDronePosition
        // This subscription is only for drone events like landing

        if (event.eventType === 'landing') {
          setCountdownActive(false);
          setEtaMinutes(0);
        }
      } catch (error) {
        console.error('Error processing drone event:', error);
      }
    });

    return () => {
      isSubscribed = false;
      try {
        unsubscribe?.();
      } catch (error) {
        console.error('Error unsubscribing from drone events:', error);
      }
    };
  }, [trackingOrderId]);

  // Subscribe to drone position updates (realtime from drone document)
  useEffect(() => {
    if (!order?.droneId) return;
    if (order.status === 'delivered' || order.status === 'cancelled') return;

    let isSubscribed = true;
    console.log('🔔 Setting up drone position subscription for drone:', order.droneId);

    const unsubscribe = subscribeToDronePosition(order.droneId, (position) => {
      if (!isSubscribed) return;
      
      console.log('📍 Received drone position update:', position.latitude.toFixed(6), position.longitude.toFixed(6));
      
      const coordinate = { latitude: position.latitude, longitude: position.longitude };
      setDroneCoords(coordinate);
      setDronePath((prev) => {
        // Avoid duplicate points
        const last = prev[prev.length - 1];
        if (last && Math.abs(last.latitude - coordinate.latitude) < 0.00001 && 
            Math.abs(last.longitude - coordinate.longitude) < 0.00001) {
          return prev;
        }
        // Keep only last 50 points to prevent memory issues
        const newPath = [...prev, coordinate];
        return newPath.slice(-50);
      });
      setHasRealtimeProgress(true);
    });

    return () => {
      isSubscribed = false;
      try {
        unsubscribe?.();
      } catch (error) {
        console.error('Error unsubscribing from drone position:', error);
      }
    };
  }, [order?.droneId, order?.status, restaurantCoords, customerCoords]);

  // Fetch drone hub info when drone is assigned (for map display)
  useEffect(() => {
    if (!order?.droneId) return;
    if (droneHubCoords) return; // Already fetched
    
    const fetchDroneHub = async () => {
      try {
        console.log('🔍 Fetching drone info for hub location...');
        const drone = await getDroneById(order.droneId!);
        
        // Get drone hub coordinates
        let hubCoords: LatLng | null = null;
        
        if (drone.droneHub && typeof drone.droneHub === 'object' && 'latitude' in drone.droneHub) {
          const hub = drone.droneHub as DroneHub;
          hubCoords = {
            latitude: hub.latitude,
            longitude: hub.longitude,
          };
          console.log('🏠 Drone hub found:', hub.name, hubCoords);
        } else if (drone.homeLatitude && drone.homeLongitude) {
          hubCoords = {
            latitude: drone.homeLatitude,
            longitude: drone.homeLongitude,
          };
          console.log('🏠 Drone home position:', hubCoords);
        } else if (drone.currentLatitude && drone.currentLongitude) {
          hubCoords = {
            latitude: drone.currentLatitude,
            longitude: drone.currentLongitude,
          };
          console.log('📍 Drone current position:', hubCoords);
        } else if (restaurantCoords) {
          // Fallback: offset from restaurant
          hubCoords = {
            latitude: restaurantCoords.latitude + 0.008,
            longitude: restaurantCoords.longitude - 0.008,
          };
          console.log('⚠️ Using fallback hub position:', hubCoords);
        }
        
        if (hubCoords) {
          setDroneHubCoords(hubCoords);
          
          // Determine initial phase based on order status AND drone position
          // The key insight: when drone is just assigned, it should start from hub
          // regardless of order status. We use assignedAt timestamp to detect fresh assignments.
          let initialPhase: 'to_restaurant' | 'to_customer' | 'idle' = 'to_restaurant';
          
          // Check if order was recently assigned (within last 2 minutes)
          const assignedAt = order?.assignedAt ? new Date(order.assignedAt).getTime() : 0;
          const now = Date.now();
          const isRecentlyAssigned = (now - assignedAt) < 2 * 60 * 1000; // 2 minutes
          
          // Check drone position to determine phase
          const droneCurrentPos = drone.currentLatitude && drone.currentLongitude 
            ? { lat: drone.currentLatitude, lng: drone.currentLongitude }
            : null;
          
          // Calculate distances
          const distToHub = droneCurrentPos ? Math.sqrt(
            Math.pow(droneCurrentPos.lat - hubCoords.latitude, 2) +
            Math.pow(droneCurrentPos.lng - hubCoords.longitude, 2)
          ) : 999;
          
          const distToRestaurant = droneCurrentPos && restaurantCoords ? Math.sqrt(
            Math.pow(droneCurrentPos.lat - restaurantCoords.latitude, 2) +
            Math.pow(droneCurrentPos.lng - restaurantCoords.longitude, 2)
          ) : 999;
          
          // Determine phase based on position and status
          if (order?.status === 'picked_up' || order?.status === 'delivering') {
            // If drone is close to restaurant (within ~100m), it's picking up or starting to_customer
            if (distToRestaurant < 0.001) { // ~100m threshold
              initialPhase = 'to_customer';
              console.log('🚁 Drone is at restaurant, phase: to_customer');
            } else if (distToHub < 0.001 || isRecentlyAssigned) {
              // Drone still at hub or just assigned - start from beginning
              initialPhase = 'to_restaurant';
              console.log('🚁 Drone at hub or recently assigned, phase: to_restaurant');
            } else {
              // Drone is somewhere in between - determine by which is closer
              initialPhase = distToRestaurant < distToHub ? 'to_customer' : 'to_restaurant';
              console.log(`🚁 Drone in transit, closer to ${initialPhase === 'to_customer' ? 'restaurant' : 'hub'}`);
            }
          } else {
            // Status is 'ready' with droneId = just assigned, start from hub
            initialPhase = 'to_restaurant';
            console.log('🚁 Order ready with drone, phase: to_restaurant');
          }
          
          setCurrentPhase(initialPhase);
          console.log('🚀 Initial phase determined:', order?.status, '→', initialPhase);
          
          // Set initial drone position based on phase
          // If to_restaurant phase, start from hub
          // If to_customer phase, start from restaurant (or current position if available)
          let initialDronePos: LatLng;
          if (initialPhase === 'to_restaurant') {
            initialDronePos = hubCoords;
            console.log('🚁 Initial drone position: Hub', initialDronePos);
          } else if (initialPhase === 'to_customer' && restaurantCoords) {
            initialDronePos = restaurantCoords;
            console.log('🚁 Initial drone position: Restaurant', initialDronePos);
          } else if (drone.currentLatitude && drone.currentLongitude) {
            initialDronePos = { latitude: drone.currentLatitude, longitude: drone.currentLongitude };
            console.log('🚁 Initial drone position: Current', initialDronePos);
          } else {
            initialDronePos = hubCoords;
            console.log('🚁 Initial drone position: Fallback to Hub', initialDronePos);
          }
          
          setDroneCoords(initialDronePos);
          setDronePath([initialDronePos]);
          setSimulationState('running');
        }
      } catch (error) {
        console.error('Error fetching drone hub info:', error);
      }
    };
    
    fetchDroneHub();
  }, [order?.droneId, restaurantCoords, droneHubCoords]);

  // 🚁 LOCAL DRONE ANIMATION - runs when no realtime updates are received
  // This ensures drone moves even if admin simulation is not running
  useEffect(() => {
    if (simulationState !== 'running') return;
    if (!droneCoords) return;
    if (!order?.droneId) return;
    if (order.status === 'delivered' || order.status === 'cancelled') return;

    // Determine target based on phase
    let targetCoords: LatLng | null = null;
    let startCoords: LatLng | null = null;
    
    if (currentPhase === 'to_restaurant' && restaurantCoords && droneHubCoords) {
      startCoords = droneHubCoords;
      targetCoords = restaurantCoords;
    } else if (currentPhase === 'to_customer' && customerCoords && restaurantCoords) {
      startCoords = restaurantCoords;
      targetCoords = customerCoords;
    }

    if (!targetCoords || !startCoords) return;

    console.log(`🚁 Starting local animation: ${currentPhase}`);
    console.log(`📍 From:`, startCoords, `To:`, targetCoords);
    
    // Debug: Alert to show exact coordinates
    if (currentPhase === 'to_customer') {
      alert(`🔍 Drone Route (to_customer):\n\nRestaurant (start):\n${startCoords.latitude.toFixed(6)}, ${startCoords.longitude.toFixed(6)}\n\nCustomer (target):\n${targetCoords.latitude.toFixed(6)}, ${targetCoords.longitude.toFixed(6)}`);
    }

    let progress = phaseProgress / 100; // Convert 0-100 to 0-1
    let lastRealtimeUpdate = Date.now();
    let animationActive = true;

    const animationInterval = setInterval(() => {
      if (!animationActive) return;

      // Check if we're receiving realtime updates (from admin simulator)
      // If yes, let realtime handle it and just update progress display
      if (hasRealtimeProgress && Date.now() - lastRealtimeUpdate < 3000) {
        // Realtime is active, calculate progress based on current position
        if (droneCoords && startCoords && targetCoords) {
          const totalDist = Math.sqrt(
            Math.pow(targetCoords.latitude - startCoords.latitude, 2) +
            Math.pow(targetCoords.longitude - startCoords.longitude, 2)
          );
          const currentDist = Math.sqrt(
            Math.pow(droneCoords.latitude - startCoords.latitude, 2) +
            Math.pow(droneCoords.longitude - startCoords.longitude, 2)
          );
          progress = Math.min(currentDist / totalDist, 1);
          setPhaseProgress(Math.round(progress * 100));
        }
        return;
      }

      // No realtime updates - run local animation
      const phaseDuration = currentPhase === 'to_restaurant' ? 30 : 45; // seconds
      const progressIncrement = 1 / phaseDuration; // Progress per second
      
      progress = Math.min(progress + progressIncrement, 1);
      setPhaseProgress(Math.round(progress * 100));

      // Calculate new position using easing
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      const newLat = startCoords!.latitude + (targetCoords!.latitude - startCoords!.latitude) * easeInOut;
      const newLng = startCoords!.longitude + (targetCoords!.longitude - startCoords!.longitude) * easeInOut;
      
      const newCoords = { latitude: newLat, longitude: newLng };
      setDroneCoords(newCoords);
      setDronePath(prev => {
        const last = prev[prev.length - 1];
        if (last && Math.abs(last.latitude - newLat) < 0.00001) return prev;
        return [...prev.slice(-50), newCoords];
      });

      // Phase complete
      if (progress >= 1) {
        console.log(`✅ Phase ${currentPhase} complete!`);
        
        if (currentPhase === 'to_restaurant') {
          // Move to next phase - drone arrived at restaurant
          setCurrentPhase('to_customer');
          progress = 0;
          setPhaseProgress(0);
          console.log('📦 Drone arrived at restaurant, starting delivery to customer...');
        } else if (currentPhase === 'to_customer') {
          // Delivery complete
          setSimulationState('completed');
          animationActive = false;
          clearInterval(animationInterval);
          
          // 🎉 Mark as delivered - update LOCAL state immediately
          // Note: Mobile users don't have permission to update order status in database
          // The actual database status update is handled by admin simulation
          console.log('🎉 Delivery complete! Updating local state to delivered...');
          setOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
          
          // Silently try to update database (will likely fail due to permissions - that's OK)
          if (order?.$id) {
            updateOrderStatus(order.$id, 'delivered')
              .then(() => console.log('✅ Database also updated to delivered!'))
              .catch(() => {
                // Silently ignore permission errors - local state is already updated
                // Admin simulation or restaurant portal will update database later
              });
          }
        }
      }
    }, 1000); // Update every second

    // Track realtime updates
    const realtimeTracker = setInterval(() => {
      if (hasRealtimeProgress) {
        lastRealtimeUpdate = Date.now();
      }
    }, 500);

    return () => {
      animationActive = false;
      clearInterval(animationInterval);
      clearInterval(realtimeTracker);
    };
  }, [simulationState, currentPhase, order?.droneId, order?.status, droneHubCoords, restaurantCoords, customerCoords, hasRealtimeProgress]);

  // Auto-update countdown every 30 seconds for real-time ETA
  useEffect(() => {
    if (!order?.estimatedDeliveryTime) return;
    
    const estimatedTime = order.estimatedDeliveryTime;
    
    // Initial calculation
    const updateETA = () => {
      const etaMs = new Date(estimatedTime).getTime() - Date.now();
      const minutes = Math.max(0, etaMs / 60000);
      setEtaMinutes(minutes);
      
      // Stop countdown when delivered or cancelled
      if (minutes <= 0 || order.status === 'delivered' || order.status === 'cancelled') {
        return false; // Signal to stop interval
      }
      return true; // Continue countdown
    };
    
    // Update immediately
    if (!updateETA()) return;
    
    // Then update every 30 seconds for real-time countdown
    const interval = setInterval(() => {
      if (!updateETA()) {
        clearInterval(interval);
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [order?.estimatedDeliveryTime, order?.status]);

  const handleCallRestaurant = () => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <CustomHeader title="Order Tracking" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="mt-4 text-gray-500 font-quicksand-medium">Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <CustomHeader title="Order Tracking" />
        <View className="flex-1 items-center justify-center px-6">
          <Image source={icons.bag} className="h-24 w-24" resizeMode="contain" tintColor="#D1D5DB" />
          <Text className="mt-6 text-lg font-quicksand-semibold text-dark-100">Order Unavailable</Text>
          <Text className="mt-2 text-center text-gray-500 font-quicksand-regular">
            {errorMessage || 'We could not load this order. Please try again later.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Helper function to get status text in English
  const getStatusText = () => {
    switch (order.status) {
      case 'pending':
        return 'Awaiting Confirmation';
      case 'preparing':
        return 'Preparing Your Food';
      case 'ready':
        return 'Ready for Pickup';
      case 'delivering':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  // Calculate ETA text - using real estimated delivery time
  const getEtaText = () => {
    // Priority 1: Use order's estimated delivery time
    if (order?.estimatedDeliveryTime) {
      const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
      const minutes = Math.max(0, Math.floor(etaMs / 60000));
      if (minutes > 0) {
        return `${minutes} - ${minutes + 4} mins`;
      }
    }
    
    // Priority 2: Use delivery calculation
    if (deliveryCalc?.estimatedTime) {
      const minutes = Math.floor(deliveryCalc.estimatedTime);
      return `${minutes} - ${minutes + 4} mins`;
    }
    
    // Fallback
    return '19 - 23 mins';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomHeader title="Order Tracking" />
      
      {/* Map - Full width at top */}
      <View style={{ height: 320 }} className="relative">
        <DeliveryMap
          restaurant={restaurantCoords}
          customer={customerCoords}
          drone={droneCoords}
          droneHub={droneHubCoords}
          path={dronePath}
          currentPhase={currentPhase}
          etaMinutes={etaMinutes}
        />
        
        {/* Map Gradient Overlay */}
        <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
        
        {/* Realtime Connection Status */}
        <RealtimeStatus isConnected={realtimeConnected} />
        
        {/* Debug Info Overlay (Remove in production) */}
        {__DEV__ && (
          <View className="absolute top-2 left-2 rounded-lg p-2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <Text className="text-white text-xs font-mono">
              Status: {order.status}
            </Text>
            <Text className="text-white text-xs font-mono">
              Phase: {currentPhase} ({Math.round(phaseProgress)}%)
            </Text>
            <Text className="text-white text-xs font-mono">
              Drone: {droneCoords ? '✓ Visible' : '✗ Hidden'}
            </Text>
            <Text className="text-white text-xs font-mono">
              Hub: {droneHubCoords ? '✓ Set' : '✗ Not set'}
            </Text>
            <Text className="text-white text-xs font-mono">
              Sim: {simulationState}
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 space-y-3">
          
          {/* Status Card - PROFESSIONAL REDESIGN */}
          <View className="bg-primary rounded-3xl shadow-xl overflow-hidden" style={{ elevation: 8 }}>
            <View className="px-6 py-8 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xs font-quicksand-bold uppercase tracking-widest mb-3" style={{ opacity: 0.9 }}>
                  ORDER STATUS
                </Text>
                <Text className="text-white text-3xl font-quicksand-bold mb-3 leading-tight">
                  {getStatusText()}
                </Text>
                {/* Status Icon */}
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-lg" style={{ opacity: 0.95 }}>
                </View>
              </View>
            </View>
          </View>

          {/* Delivery Address - SIMPLE CARD */}
          <View className="bg-white rounded-2xl p-5 shadow-md" style={{ elevation: 2 }}>
            <Text className="text-xs text-gray-500 font-quicksand-bold uppercase tracking-wider mb-3">
              DELIVERY TO
            </Text>
            <Text className="text-base text-gray-900 font-quicksand-bold leading-relaxed mb-3">
              {order.deliveryAddress}
            </Text>
            {order.phone && (
              <Text className="text-sm text-gray-600 font-quicksand-semibold">
                {order.phone}
              </Text>
            )}
          </View>

          {/* Restaurant Info - SIMPLE CARD */}
          {restaurant && (
            <View className="bg-white rounded-2xl p-5 shadow-md" style={{ elevation: 2 }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 font-quicksand-bold uppercase tracking-wider mb-2">
                    RESTAURANT
                  </Text>
                  <Text className="text-base text-gray-900 font-quicksand-bold mb-1">
                    {restaurant.name}
                  </Text>
                  {deliveryCalc && (
                    <Text className="text-sm text-gray-600 font-quicksand-semibold">
                      {deliveryCalc.formattedDistance} • {deliveryCalc.formattedTime}
                    </Text>
                  )}
                </View>
                {restaurant?.phone && (
                  <TouchableOpacity
                    className="w-11 h-11 bg-primary rounded-xl items-center justify-center shadow-md"
                    activeOpacity={0.7}
                    onPress={handleCallRestaurant}
                    style={{ elevation: 2 }}
                  >
                    <Text className="text-white text-lg font-bold">📞</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Order Items - CLEAN DESIGN */}
          {items.length > 0 && (
            <View className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ elevation: 4 }}>
              {/* Header */}
              <View className="bg-gray-50 px-5 py-4 flex-row items-center justify-between border-b border-gray-200">
                <Text className="text-base font-quicksand-bold text-gray-900">
                  Order Details
                </Text>
                <View className="bg-primary px-3 py-1.5 rounded-full">
                  <Text className="text-xs text-white font-quicksand-bold">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              
              {/* Items List */}
              <View className="px-5 py-3">
                {items.map((item, index) => (
                  <View key={`${item.menuItemId}-${index}`}>
                    <View className="py-3 flex-row items-start justify-between">
                      <View className="flex-1 flex-row items-start">
                        <View className="w-8 h-8 bg-amber-50 rounded-lg items-center justify-center mr-3 border border-amber-200">
                          <Text className="text-sm font-quicksand-bold text-primary">
                            {item.quantity}×
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-quicksand-bold text-gray-900">
                            {item.name}
                          </Text>
                          {item.notes && (
                            <Text className="text-xs text-gray-500 font-quicksand-medium mt-1">
                              Note: {item.notes}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text className="text-sm font-quicksand-bold text-gray-900 ml-2">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </Text>
                    </View>
                    {index < items.length - 1 && (
                      <View className="h-px bg-gray-100" />
                    )}
                  </View>
                ))}
              </View>
              
              {/* Total */}
              <View className="bg-primary px-5 py-4 border-t-2 border-amber-400">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-quicksand-bold text-white">
                    Total
                  </Text>
                  <Text className="text-xl font-quicksand-bold text-white">
                    {order.total.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Order ID - CLEAN BADGE */}
          <View className="items-center py-4">
            <View className="bg-gray-100 px-6 py-3 rounded-xl border border-gray-300 shadow-sm">
              <Text className="text-sm text-gray-700 font-quicksand-bold text-center">
                Order ID: #{order.$id.slice(-8).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;
