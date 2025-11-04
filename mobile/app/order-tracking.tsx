import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

import CustomHeader from '@/components/CustomHeader';
import DeliveryMap from '@/components/tracking';

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

    console.log('🚁 Starting drone simulation:');
    console.log('  - Order ID:', order.$id);
    console.log('  - Status:', order.status);
    console.log('  - Drone ID:', order.droneId || 'Not assigned yet');
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
        console.error('Drone simulation failed', err);
        if (!isMounted) return;
        setSimulationState('idle');
        setCountdownActive(false);
        
        // Show error message but keep estimated time if available
        if (order.estimatedDeliveryTime) {
          const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
          setEtaMinutes(Math.max(0, etaMs / 60000));
        } else {
          setEtaMinutes(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [order, restaurantCoords, customerCoords, simulationState, hasRealtimeProgress]);  useEffect(() => {
    if (!order?.estimatedDeliveryTime) return;
    const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
    setEtaMinutes(Math.max(0, etaMs / 60000));
  }, [order?.estimatedDeliveryTime]);

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

  // Calculate ETA text
  const getEtaText = () => {
    if (etaMinutes && etaMinutes > 0) {
      const minutes = Math.floor(etaMinutes);
      return `${minutes} - ${minutes + 4} mins`;
    }
    if (deliveryCalc?.estimatedTime) {
      const minutes = Math.floor(deliveryCalc.estimatedTime);
      return `${minutes} - ${minutes + 4} mins`;
    }
    return '19 - 23 mins';
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <CustomHeader title="Order Tracking" />
      
      {/* Map - Full width at top */}
      <View style={{ height: 350 }}>
        <DeliveryMap
          restaurant={restaurantCoords}
          customer={customerCoords}
          drone={droneCoords}
          path={dronePath}
          etaMinutes={etaMinutes}
        />
        
        {/* Debug Info Overlay (Remove in production) */}
        {__DEV__ && (
          <View className="absolute top-2 left-2 bg-black/70 rounded-lg p-2">
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
        <View className="px-4 py-4 space-y-3">
          
          {/* ETA Card with Progress Bar */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="mb-3">
              <Text className="text-lg font-quicksand-bold text-gray-900">
                Your order will arrive in {getEtaText()}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View className="bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
              <View 
                className="bg-green-500 h-full rounded-full" 
                style={{ 
                  width: order.status === 'delivered' ? '100%' : 
                         order.status === 'delivering' ? `${Math.min(phaseProgress, 100)}%` :
                         order.status === 'ready' ? '50%' :
                         order.status === 'preparing' ? '25%' : '10%'
                }}
              />
            </View>
          </View>

          {/* Drone Info Card */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-base font-quicksand-bold text-gray-900 mb-4">
              Delivery Drone Information
            </Text>
            
            {order.droneId ? (
              <>
                <Text className="text-sm text-gray-600 font-quicksand-medium mb-3">
                  {currentPhase === 'to_restaurant' && 'Drone is flying to restaurant'}
                  {currentPhase === 'to_customer' && 'Drone is delivering to you'}
                  {currentPhase === 'idle' && order.status === 'ready' && 'Drone is waiting at restaurant'}
                  {currentPhase === 'idle' && order.status === 'preparing' && 'Preparing your food'}
                  {currentPhase === 'idle' && order.status === 'pending' && 'Awaiting confirmation'}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {/* Drone Avatar */}
                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <Text className="text-2xl">🚁</Text>
                    </View>
                    
                    {/* Drone Info */}
                    <View className="flex-1">
                      <Text className="text-base font-quicksand-bold text-gray-900">
                        Drone #{order.droneId.slice(-4).toUpperCase()}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-sm text-amber-500 font-quicksand-semibold mr-1">5.0</Text>
                        <Text className="text-xl text-amber-400">★</Text>
                      </View>
                      {/* Show current phase progress */}
                      {currentPhase !== 'idle' && (
                        <View className="mt-2">
                          <View className="bg-gray-200 rounded-full h-1.5 w-32">
                            <View 
                              className="bg-blue-500 h-full rounded-full" 
                              style={{ width: `${Math.min(phaseProgress, 100)}%` }}
                            />
                          </View>
                          <Text className="text-xs text-gray-500 mt-1">
                            {Math.round(phaseProgress)}% completed
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Action Buttons */}
                  <View className="flex-row space-x-2">
                    {restaurant?.phone && (
                      <TouchableOpacity
                        className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={handleCallRestaurant}
                      >
                        <Image source={icons.phone} className="w-6 h-6" tintColor="#1F2937" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            ) : (
              <View className="items-center py-4">
                <Text className="text-2xl mb-2">🔍</Text>
                <Text className="text-sm text-gray-500 font-quicksand-medium text-center">
                  Looking for available drone...
                </Text>
              </View>
            )}
          </View>

          {/* Delivery Address Card */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Text className="text-lg">📍</Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-quicksand-bold text-gray-900 mb-1">
                  Delivery Address
                </Text>
                <Text className="text-sm text-gray-600 font-quicksand-medium leading-5">
                  {order.deliveryAddress}
                </Text>
                {order.phone && (
                  <View className="flex-row items-center mt-2">
                    <Text className="text-sm text-gray-500 font-quicksand-medium">
                      {order.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Order Status Card */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-base font-quicksand-bold text-gray-900 mb-3">
              Order Status
            </Text>
            <View className="bg-green-50 rounded-xl px-4 py-3">
              <Text className="text-sm font-quicksand-semibold text-green-700">
                {getStatusText()}
              </Text>
            </View>
          </View>

          {/* Restaurant Info Card */}
          {restaurant && (
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                  <Text className="text-lg">🍽️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-quicksand-bold text-gray-900">
                    {restaurant.name}
                  </Text>
                  {deliveryCalc && (
                    <Text className="text-sm text-gray-600 font-quicksand-medium mt-1">
                      {deliveryCalc.formattedDistance} • {deliveryCalc.formattedTime}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Order Items */}
          {items.length > 0 && (
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <Text className="text-base font-quicksand-bold text-gray-900 mb-3">
                Order Details
              </Text>
              {items.map((item, index) => (
                <View key={`${item.menuItemId}-${index}`} className="mb-3 last:mb-0">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-sm font-quicksand-semibold text-gray-900">
                        {item.quantity}x {item.name}
                      </Text>
                      {item.notes && (
                        <Text className="text-xs text-gray-500 font-quicksand-regular mt-1">
                          {item.notes}
                        </Text>
                      )}
                    </View>
                    <Text className="text-sm font-quicksand-bold text-gray-900 ml-3">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Order ID */}
          <View className="items-center py-2">
            <Text className="text-xs text-gray-400 font-quicksand-medium">
              Order ID: #{order.$id.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;
