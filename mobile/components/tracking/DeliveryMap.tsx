import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { icons } from '@/constants';

// Define LatLng type locally
interface LatLng {
  latitude: number;
  longitude: number;
}

export interface DeliveryMapProps {
  hub?: LatLng | null; // Hub location (drone base)
  restaurant?: LatLng | null;
  customer?: LatLng | null;
  drone?: LatLng | null;
  path?: LatLng[];
  phase?: 'idle' | 'hub_to_restaurant' | 'restaurant_to_customer';
  progress?: number;
  completedPath?: LatLng[];
  remainingPath?: LatLng[];
  etaMinutes?: number;
}

const INITIAL_REGION = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const DroneProgressIndicator = ({ 
  phase, 
  phaseProgress, 
  overallProgress 
}: { 
  phase: 'idle' | 'hub_to_restaurant' | 'restaurant_to_customer'; 
  phaseProgress: number; 
  overallProgress: number; 
}) => (
  <View className="bg-white rounded-2xl p-4 shadow-md">
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-quicksand-bold text-gray-700">
          {phase === 'hub_to_restaurant' && '🚁 Hub → Restaurant'}
          {phase === 'restaurant_to_customer' && '📦 Restaurant → Customer'}
          {phase === 'idle' && '⏳ Preparing...'}
        </Text>
        <Text className="text-xs font-quicksand-semibold text-primary">
          {Math.round(phaseProgress)}%
        </Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${phaseProgress}%` }}
        />
      </View>
    </View>
    
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 font-quicksand-medium">Overall Progress</Text>
        <Text className="text-xs font-quicksand-semibold text-gray-700">
          {Math.round(overallProgress)}%
        </Text>
      </View>
      <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
        <View
          className="h-full bg-amber-400 rounded-full"
          style={{ width: `${overallProgress}%` }}
        />
      </View>
    </View>
  </View>
);

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  hub,
  restaurant,
  customer,
  drone,
  path = [],
  phase = 'idle',
  completedPath = [],
  remainingPath = [],
  etaMinutes,
}) => {
  const mapRef = useRef<MapView | null>(null);

  const coordinates = useMemo(() => {
    return [hub, restaurant, customer, drone].filter(Boolean) as LatLng[];
  }, [hub, restaurant, customer, drone]);

  const initialRegion = useMemo<Region>(() => {
    const fallback = INITIAL_REGION;
    const source = restaurant || customer;

    if (!source) return fallback;

    return {
      latitude: source.latitude,
      longitude: source.longitude,
      latitudeDelta: fallback.latitudeDelta,
      longitudeDelta: fallback.longitudeDelta,
    };
  }, [restaurant, customer]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (coordinates.length === 0) return;

    // Add delay to ensure map is ready before fitting
    const timer = setTimeout(() => {
      try {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
          animated: true,
        });
      } catch (error) {
        console.warn('Failed to fit coordinates:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [coordinates]);

  // Get active segment color based on phase
  const getPathColor = () => {
    if (phase === 'hub_to_restaurant') return '#FFA500'; // Orange for hub→restaurant
    if (phase === 'restaurant_to_customer') return '#1E90FF'; // Blue for restaurant→customer
    return '#7C3AED'; // Purple for idle
  };

  return (
    <View className="h-80 w-full overflow-hidden rounded-3xl">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        customMapStyle={[]}
      >
        {/* Hub Marker (Drone Base) */}
        {hub && (
          <Marker
            coordinate={hub}
            title="Drone Hub"
            description="Drone base station"
            pinColor="#1E90FF" // Blue
          />
        )}

        {/* Restaurant Marker */}
        {restaurant && (
          <Marker
            coordinate={restaurant}
            title="Restaurant"
            description="Pickup location"
            pinColor="#FE8C00" // Orange
          />
        )}

        {/* Customer Marker */}
        {customer && (
          <Marker
            coordinate={customer}
            title="Delivery Address"
            description="Delivery destination"
            pinColor="#2F9B65" // Green
          />
        )}

        {/* Drone Marker */}
        {drone && (
          <Marker
            coordinate={drone}
            title="Drone"
            description="In-flight delivery"
            pinColor="#1E90FF" // Blue
          >
            <View className="items-center justify-center">
              <Image
                source={icons.drone}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        )}

        {/* Planned Route - Full path (hub → restaurant → customer) with dashed lines */}
        {hub && restaurant && (
          <Polyline
            coordinates={[hub, restaurant]}
            strokeColor={phase === 'hub_to_restaurant' ? '#FFA500' : '#CCCCCC'}
            strokeWidth={phase === 'hub_to_restaurant' ? 4 : 2}
            lineDashPattern={[8, 4]}
          />
        )}
        
        {restaurant && customer && (
          <Polyline
            coordinates={[restaurant, customer]}
            strokeColor={phase === 'restaurant_to_customer' ? '#1E90FF' : '#CCCCCC'}
            strokeWidth={phase === 'restaurant_to_customer' ? 4 : 2}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* Actual path traveled by drone (solid, highlights progress) */}
        {path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor={getPathColor()}
            strokeWidth={3}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Completed path (thicker, more visible) */}
        {completedPath.length > 1 && (
          <Polyline
            coordinates={completedPath}
            strokeColor="#10B981"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Remaining path (dashed outline) */}
        {remainingPath.length > 1 && (
          <Polyline
            coordinates={remainingPath}
            strokeColor="#9CA3AF"
            strokeWidth={2}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Status overlay */}
      <View className="absolute top-4 left-4 rounded-xl bg-black/70 px-3 py-2">
        <Text className="text-white font-quicksand-semibold text-xs">
          {phase === 'idle' && '⏳ Waiting for drone...'}
          {phase === 'hub_to_restaurant' && '🚁 Hub → Restaurant'}
          {phase === 'restaurant_to_customer' && '📦 Restaurant → Customer'}
        </Text>
      </View>

      {typeof etaMinutes === 'number' && etaMinutes > 0 && (
        <View className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/70 px-4 py-3">
          <Text className="text-white font-quicksand-semibold text-sm tracking-wide">
            Estimated arrival in {Math.max(0, Math.round(etaMinutes))} minutes
          </Text>
        </View>
      )}
    </View>
  );
};

export default DeliveryMap;
