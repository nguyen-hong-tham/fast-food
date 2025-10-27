import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { LatLng } from 'react-native-maps';

import CustomHeader from '@/components/CustomHeader';
import DeliveryMap from '@/components/tracking/DeliveryMap';
import StatusTimeline from '@/components/tracking/StatusTimeline';
import { getOrderById, subscribeToDroneEvents, subscribeToOrder } from '@/lib/appwrite';
import { getRestaurantById } from '@/lib/api-helpers';
import { simulateDroneFlight } from '@/lib/drone-simulator';
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

    const unsubscribe = subscribeToOrder(trackingOrderId, (updated) => {
      setOrder((prev) => {
        const merged = { ...(prev || {}), ...updated } as Order;
        setItems(parseOrderItems(merged.items));
        return merged;
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [trackingOrderId]);

  useEffect(() => {
    if (!trackingOrderId) return;

    const unsubscribe = subscribeToDroneEvents(trackingOrderId, (event) => {
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
    });

    return () => {
      unsubscribe?.();
    };
  }, [trackingOrderId]);

  useEffect(() => {
    if (!order) return;
    if (!restaurantCoords || !customerCoords) return;
    if (order.status === 'delivered' || order.status === 'cancelled') return;
    if (simulationState !== 'idle') return;
    if (hasRealtimeProgress) return;
    
    // ✅ Trigger simulation when restaurant accepts order (status = preparing)
    const shouldStartSimulation = 
      order.status === 'preparing' || 
      order.status === 'ready' || 
      order.status === 'picked_up' || 
      order.status === 'delivering';
    if (!shouldStartSimulation) return;

    console.log('🚁 Starting drone simulation for order:', order.$id, 'status:', order.status);

    setSimulationState('running');
    setCountdownActive(true);
    
    // Set initial drone position at base (near restaurant)
    const droneBaseCoords = {
      latitude: restaurantCoords.latitude + 0.005,
      longitude: restaurantCoords.longitude + 0.005,
    };
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
        setDroneCoords(coordinate);
        setDronePath((prev) => [...prev, coordinate]);
        
        // Update ETA based on progress
        const remainingTime = Math.max(0, (1 - progress) * (SIMULATION_DURATION / 60000));
        setEtaMinutes(remainingTime);
        
        // Log phase changes
        if (phase === 'to_restaurant' && progress < 0.1) {
          console.log('🚁 Phase 1: Drone heading to restaurant...');
        } else if (phase === 'to_customer' && progress > 0.3 && progress < 0.35) {
          console.log('🚁 Phase 2: Drone heading to customer...');
        }
      },
    })
      .then(() => {
        if (!isMounted) return;
        console.log('✅ Drone simulation completed successfully');
        setSimulationState('completed');
        setCountdownActive(false);
        setEtaMinutes(0);
      })
      .catch((err) => {
        console.error('❌ Drone simulation failed', err);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomHeader title="Order Tracking" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 py-4 space-y-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs uppercase tracking-wide text-gray-500">Order</Text>
              <Text className="text-2xl font-quicksand-semibold text-dark-100">#{order.$id.slice(-6).toUpperCase()}</Text>
            </View>
            {etaMinutes !== undefined && etaMinutes !== null && etaMinutes > 0 && (
              <View className="bg-dark-100/90 rounded-2xl px-4 py-3 items-center justify-center">
                <Text className="text-xs font-quicksand-medium text-white/70">Drone Arrival Countdown</Text>
                <Text className="text-2xl font-quicksand-semibold text-white mt-1">
                  {String(Math.floor(etaMinutes)).padStart(2, '0')}:{String(Math.floor((etaMinutes % 1) * 60)).padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>

          <DeliveryMap
            restaurant={restaurantCoords}
            customer={customerCoords}
            drone={droneCoords}
            path={dronePath}
            etaMinutes={etaMinutes}
          />

          <View className="rounded-3xl bg-white p-5 shadow-sm">
            <Text className="text-lg font-quicksand-semibold text-dark-100 mb-4">Delivery Progress</Text>
            <StatusTimeline current={order.status} />
          </View>

          <View className="rounded-3xl bg-white p-5 shadow-sm space-y-3">
            <Text className="text-lg font-quicksand-semibold text-dark-100">Delivery Details</Text>
            <View>
              <Text className="text-sm text-gray-500">Address</Text>
              <Text className="mt-1 text-base font-quicksand-medium text-dark-100">{order.deliveryAddress}</Text>
            </View>
            {restaurant && (
              <View>
                <Text className="text-sm text-gray-500">Restaurant</Text>
                <Text className="mt-1 text-base font-quicksand-medium text-dark-100">{restaurant.name}</Text>
              </View>
            )}
            <TouchableOpacity
              className="mt-2 flex-row items-center"
              activeOpacity={0.7}
              onPress={handleCallRestaurant}
            >
              <Image source={icons.phone} className="mr-3 h-5 w-5" tintColor="#FE8C00" />
              <Text className="text-base font-quicksand-semibold text-primary">
                Call Restaurant
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-3xl bg-white p-5 shadow-sm">
            <Text className="text-lg font-quicksand-semibold text-dark-100 mb-4">Order Items</Text>
            {items.length === 0 && (
              <Text className="text-sm text-gray-500">No items available.</Text>
            )}
            {items.map((item, index) => (
              <View key={`${item.menuItemId}-${index}`} className="mb-4 last:mb-0 flex-row">
                <Image
                  source={item.image_url ? { uri: item.image_url } : icons.bag}
                  className="h-16 w-16 rounded-2xl bg-gray-100"
                  resizeMode={item.image_url ? 'cover' : 'contain'}
                />
                <View className="ml-4 flex-1">
                  <Text className="text-base font-quicksand-semibold text-dark-100">{item.name}</Text>
                  <Text className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</Text>
                  <Text className="mt-1 text-sm font-quicksand-semibold text-primary">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;
