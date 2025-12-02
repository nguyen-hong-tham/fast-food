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
  droneHub?: LatLng | null; // Alias for hub (backward compatibility)
  restaurant?: LatLng | null;
  customer?: LatLng | null;
  drone?: LatLng | null;
  path?: LatLng[];
  phase?: 'idle' | 'hub_to_restaurant' | 'restaurant_to_customer';
  currentPhase?: 'idle' | 'to_restaurant' | 'to_customer'; // Alias for phase
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
          {phase === 'hub_to_restaurant' && 'Hub → Restaurant'}
          {phase === 'restaurant_to_customer' && 'Restaurant → Customer'}
          {phase === 'idle' && 'Preparing...'}
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
  droneHub,
  restaurant,
  customer,
  drone,
  path = [],
  phase = 'idle',
  currentPhase,
  completedPath = [],
  remainingPath = [],
  etaMinutes,
}) => {
  const mapRef = useRef<MapView | null>(null);

  // Use droneHub as fallback, convert currentPhase to phase format
  const hubLocation = hub || droneHub;
  const activePhase = phase !== 'idle' ? phase : 
    currentPhase === 'to_restaurant' ? 'hub_to_restaurant' : 
    currentPhase === 'to_customer' ? 'restaurant_to_customer' : 'idle';

  const coordinates = useMemo(() => {
    return [hubLocation, restaurant, customer, drone].filter(Boolean) as LatLng[];
  }, [hubLocation, restaurant, customer, drone]);

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
    if (activePhase === 'hub_to_restaurant') return '#FFA500'; // Orange for hub→restaurant
    if (activePhase === 'restaurant_to_customer') return '#1E90FF'; // Blue for restaurant→customer
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
        {/* Hub Marker (Drone Base) - Purple Pin */}
        {hubLocation && (
          <Marker
            coordinate={hubLocation}
            title="Drone Hub"
            description="Drone base station"
            pinColor="#9333ea"
          />
        )}

        {/* Restaurant Marker - Orange Pin */}
        {restaurant && (
          <Marker
            coordinate={restaurant}
            title="Restaurant"
            description="Pickup location"
            pinColor="#f97316"
          />
        )}

        {/* Customer Marker - Green Pin */}
        {customer && (
          <Marker
            coordinate={customer}
            title="Delivery Address"
            description="Delivery destination"
            pinColor="#22c55e"
          />
        )}

        {/* Drone Marker */}
        {drone && (
          <Marker
            coordinate={drone}
            title="Drone"
            description="In-flight delivery"
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={icons.drone}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        )}

        {/* Planned Route - Full path (hub → restaurant → customer) with dashed lines */}
        {hubLocation && restaurant && (
          <Polyline
            coordinates={[hubLocation, restaurant]}
            strokeColor={activePhase === 'hub_to_restaurant' ? '#FFA500' : '#CCCCCC'}
            strokeWidth={activePhase === 'hub_to_restaurant' ? 4 : 2}
            lineDashPattern={[8, 4]}
          />
        )}
        
        {restaurant && customer && (
          <Polyline
            coordinates={[restaurant, customer]}
            strokeColor={activePhase === 'restaurant_to_customer' ? '#1E90FF' : '#CCCCCC'}
            strokeWidth={activePhase === 'restaurant_to_customer' ? 4 : 2}
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
    </View>
  );
};

export default DeliveryMap;
