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
import { getOrderById, subscribeToDroneEvents, subscribeToOrder } from '@/lib/appwrite';
import { getRestaurantById } from '@/lib/api-helpers';
import { simulateDroneFlight } from '@/lib/drone-simulator';
import { useDeliveryCalculation } from '@/hooks/useDeliveryCalculation';
import { icons } from '@/constants';
import { Order, OrderItem, Restaurant } from '@/type';

const DEFAULT_COORDINATE: LatLng = {
  latitude: 10.762622,
  longitude: 106.660172,
};

const SIMULATION_DURATION = 60000;

const parseOrderItems = (rawItems: Order['items']): OrderItem[] => {
  if (Array.isArray(rawItems)) return rawItems;

  try {
    return JSON.parse(rawItems as unknown as string) as OrderItem[];
  } catch (error) {
    console.warn('Failed to parse order.items, returning empty list');
    return [];
  }
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
      setItems(parseOrderItems(typedOrder.items));

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
    if (!order?.deliveryAddress) return;

    let isActive = true;

    (async () => {
      try {
        const geocoded = await Location.geocodeAsync(order.deliveryAddress);
        if (geocoded.length > 0 && isActive) {
          setCustomerCoords({ latitude: geocoded[0].latitude, longitude: geocoded[0].longitude });
          return;
        }
      } catch (err) {
        console.warn('Geocode failed, falling back to user location', err);
      }

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
  }, [order?.deliveryAddress]);

  useEffect(() => {
    if (!trackingOrderId) return;

    let isSubscribed = true;

    const unsubscribe = subscribeToOrder(trackingOrderId, (updated) => {
      if (!isSubscribed) return;
      
      try {
        console.log('📦 Order update received via realtime:', updated.status);
        setRealtimeConnected(true); // Mark realtime as working
        setOrder((prev) => {
          const merged = { ...(prev || {}), ...updated } as Order;
          setItems(parseOrderItems(merged.items));
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
        if (event.latitude && event.longitude) {
          const coordinate = { latitude: event.latitude, longitude: event.longitude };
          setDroneCoords(coordinate);
          setDronePath((prev) => [...prev, coordinate]);
          setHasRealtimeProgress(true);
        }

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

  useEffect(() => {
    if (!order) return;
    if (!restaurantCoords || !customerCoords) return;
    if (order.status === 'delivered' || order.status === 'cancelled') return;
    if (simulationState !== 'idle') return;
    if (hasRealtimeProgress) return;
    
    // Trigger simulation when order is active
    const shouldStartSimulation = 
      order.status === 'preparing' || 
      order.status === 'ready' || 
      order.status === 'delivering';
    
    if (!shouldStartSimulation) {
      console.log('⏸️ Simulation not triggered. Status:', order.status);
      return;
    }

    // Check if drone is assigned
    if (!order.droneId) {
      console.log('⏸️ No drone assigned yet. Waiting for admin to assign drone...');
      setSimulationState('idle');
      // Don't set errorMessage here - this is a normal state, not an error
      return;
    }

    // Clear error message if drone is now assigned
    setErrorMessage(null);

    console.log('🚁 Starting drone simulation:');
    console.log('  - Order ID:', order.$id);
    console.log('  - Status:', order.status);
    console.log('  - Drone ID:', order.droneId);
    console.log('  - Restaurant:', restaurantCoords);
    console.log('  - Customer:', customerCoords);

    setSimulationState('running');
    setCountdownActive(true);
    
    // Set initial drone position at base (near restaurant)
    const droneBaseCoords = {
      latitude: restaurantCoords.latitude + 0.005,
      longitude: restaurantCoords.longitude + 0.005,
    };
    
    console.log('📍 Initial drone position:', droneBaseCoords);
    
    setDronePath([droneBaseCoords]);
    setDroneCoords(droneBaseCoords);
    
    // Set initial ETA
    const initialETA = SIMULATION_DURATION / 60000;
    setEtaMinutes(initialETA);

    let isMounted = true;

    simulateDroneFlight({
      orderId: order.$id,
      restaurantCoords,
      customerCoords,
      droneId: order.droneId,
      duration: SIMULATION_DURATION,
      onProgress: ({ coordinate, progress, phase }) => {
        if (!isMounted) return;
        
        console.log(`🚁 Drone update: ${phase} - ${Math.round(progress * 100)}%`, coordinate);
        
        setDroneCoords(coordinate);
        setDronePath((prev) => [...prev, coordinate]);
        setCurrentPhase(phase);
        
        // Calculate phase-specific progress
        if (phase === 'to_restaurant') {
          setPhaseProgress((progress / 0.3) * 100); // 0-30% maps to 0-100%
        } else if (phase === 'to_customer') {
          setPhaseProgress(((progress - 0.3) / 0.7) * 100); // 30-100% maps to 0-100%
        }
        
        // Update ETA based on progress
        const remainingTime = Math.max(0, (1 - progress) * (SIMULATION_DURATION / 60000));
        setEtaMinutes(remainingTime);
      },
    })
      .then(() => {
        if (!isMounted) return;
        console.log('Drone simulation completed successfully');
        setSimulationState('completed');
        setCountdownActive(false);
        setEtaMinutes(0);
      })
      .catch((err) => {
        // Silently handle simulation errors - it's just for visualization
        if (!isMounted) return;
        setSimulationState('idle');
        setCountdownActive(false);
        setEtaMinutes(undefined);
        
        // Don't show error to user - simulation is optional
        if (__DEV__) {
          console.warn('Drone simulation could not start (network/backend issue)');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [order, restaurantCoords, customerCoords, simulationState, hasRealtimeProgress]);

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
          path={dronePath}
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
              Sim: {simulationState}
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5 space-y-4">
          
          {/* Status Card - SIMPLE & SAFE */}
          <View className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <View className="bg-primary px-6 py-6 flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ opacity: 0.8 }} className="text-white text-xs font-quicksand-semibold uppercase tracking-wider mb-2">
                  Order Status
                </Text>
                <Text className="text-white text-2xl font-quicksand-bold">
                  {getStatusText()}
                </Text>
                <Text style={{ opacity: 0.7 }} className="text-white text-sm font-quicksand-medium mt-2">
                  {order.status === 'preparing' && 'Kitchen is preparing your order'}
                  {order.status === 'ready' && !order.droneId && 'Waiting for admin to assign delivery drone...'}
                  {order.status === 'ready' && order.droneId && 'Order is ready for drone pickup'}
                  {order.status === 'delivering' && 'Drone is on the way to you'}
                  {order.status === 'delivered' && 'Order has been delivered'}
                  {order.status === 'cancelled' && 'Order was cancelled'}
                </Text>
              </View>
              <View style={{ opacity: 0.3 }} className="w-16 h-16 bg-white rounded-full items-center justify-center ml-4">
                <Text className="text-4xl">
                  {order.status === 'delivering' ? '🚚' : 
                   order.status === 'ready' ? '✅' : 
                   order.status === 'preparing' ? '👨‍🍳' : 
                   order.status === 'delivered' ? '🎉' : '⏱️'}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Info Section - CLEAN LAYOUT */}
          <View className="space-y-3">
            {/* Drone Card */}
            {order.droneId && (
              <View className="bg-white rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                      <Text className="text-3xl">🚁</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 font-quicksand-semibold uppercase mb-1">
                        Delivery Drone
                      </Text>
                      <Text className="text-base font-quicksand-bold text-gray-900">
                        #{order.droneId.slice(-4).toUpperCase()}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-xs text-amber-500 font-quicksand-bold">5.0 ⭐</Text>
                      </View>
                    </View>
                  </View>
                  {restaurant?.phone && (
                    <TouchableOpacity
                      className="w-11 h-11 bg-primary rounded-full items-center justify-center"
                      activeOpacity={0.7}
                      onPress={handleCallRestaurant}
                    >
                      <Image source={icons.phone} className="w-5 h-5" tintColor="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Delivery Address */}
            <View className="bg-white rounded-2xl p-5 shadow-lg">
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-2xl">📍</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 font-quicksand-semibold uppercase mb-1">
                    Delivery To
                  </Text>
                  <Text className="text-sm text-gray-900 font-quicksand-bold leading-relaxed mb-2">
                    {order.deliveryAddress}
                  </Text>
                  {order.phone && (
                    <Text className="text-sm text-gray-600 font-quicksand-semibold">
                      📞 {order.phone}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Restaurant Info */}
            {restaurant && (
              <View className="bg-white rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center">
                  {restaurant.logo ? (
                    <Image 
                      source={{ uri: restaurant.logo }}
                      className="w-14 h-14 rounded-xl mr-4"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-14 h-14 bg-orange-100 rounded-xl items-center justify-center mr-4">
                      <Text className="text-2xl">🍽️</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 font-quicksand-semibold uppercase mb-1">
                      Restaurant
                    </Text>
                    <Text className="text-sm text-gray-900 font-quicksand-bold mb-1">
                      {restaurant.name}
                    </Text>
                    {deliveryCalc && (
                      <Text className="text-xs text-gray-600 font-quicksand-semibold">
                        {deliveryCalc.formattedDistance} • {deliveryCalc.formattedTime}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Order Items - CLEAN DESIGN */}
          {items.length > 0 && (
            <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <View className="bg-gray-50 px-5 py-4 flex-row items-center justify-between border-b border-gray-200">
                <Text className="text-base font-quicksand-bold text-gray-900">
                  Order Details
                </Text>
                <View className="bg-primary px-3 py-1 rounded-full">
                  <Text className="text-xs text-white font-quicksand-bold">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
              </View>
              
              {/* Items List */}
              <View className="px-5 py-3">
                {items.map((item, index) => (
                  <View key={`${item.menuItemId}-${index}`} className="py-3">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 flex-row items-start">
                        <View style={{ backgroundColor: 'rgba(254, 140, 0, 0.1)' }} className="w-8 h-8 rounded-lg items-center justify-center mr-3">
                          <Text className="text-sm font-quicksand-bold text-primary">
                            {item.quantity}x
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
                      <View className="h-px bg-gray-100 mt-3" />
                    )}
                  </View>
                ))}
              </View>
              
              {/* Total */}
              <View style={{ backgroundColor: 'rgba(254, 140, 0, 0.05)', borderTopWidth: 2, borderTopColor: 'rgba(254, 140, 0, 0.2)' }} className="px-5 py-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-quicksand-bold text-gray-900">
                    Total
                  </Text>
                  <Text className="text-xl font-quicksand-bold text-primary">
                    {order.total.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Order ID - REDESIGNED */}
          <View className="items-center py-4 mb-2">
            <View className="bg-gray-200 px-6 py-3 rounded-full border-2 border-gray-300">
              <Text className="text-sm text-gray-900 font-quicksand-bold">
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
