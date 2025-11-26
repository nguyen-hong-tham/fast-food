import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

// Define LatLng type locally
interface LatLng {
  latitude: number;
  longitude: number;
}

export interface DeliveryMapProps {
  restaurant?: LatLng | null;
  customer?: LatLng | null;
  drone?: LatLng | null;
  droneHub?: LatLng | null; // Starting position of drone
  path?: LatLng[];
  etaMinutes?: number;
  currentPhase?: 'idle' | 'to_restaurant' | 'to_customer';
}

const INITIAL_REGION = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurant,
  customer,
  drone,
  droneHub,
  path = [],
  etaMinutes,
  currentPhase = 'idle',
}) => {
  const mapRef = useRef<MapView | null>(null);

  const coordinates = useMemo(() => {
    return [droneHub, restaurant, customer, drone].filter(Boolean) as LatLng[];
  }, [droneHub, restaurant, customer, drone]);

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

  // Build path based on current phase
  const polylinePoints = useMemo(() => {
    // If we have a live path from drone events, use it
    if (path.length > 1) return path;

    // Otherwise, build the expected route
    const points: LatLng[] = [];
    
    if (droneHub) points.push(droneHub);
    if (restaurant) points.push(restaurant);
    if (customer) points.push(customer);

    return points;
  }, [path, droneHub, restaurant, customer]);

  // Determine which segment is active for coloring
  const getSegmentColor = (index: number) => {
    if (currentPhase === 'to_restaurant' && index === 0) return '#FFA500'; // Orange for hub->restaurant
    if (currentPhase === 'to_customer' && index === 1) return '#1E90FF'; // Blue for restaurant->customer
    return '#CCCCCC'; // Gray for inactive segments
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
        {/* Drone Hub Marker */}
        {droneHub && (
          <Marker
            coordinate={droneHub}
            title="Drone Hub"
            description="Drone starting point"
            pinColor="#8B5CF6" // Purple for hub
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
            title="Customer"
            description="Delivery destination"
            pinColor="#2F9B65" // Green
          />
        )}

        {/* Drone Marker */}
        {drone && (
          <Marker
            coordinate={drone}
            title="Drone"
            description="In-flight"
            pinColor="#1E90FF" // Blue
          />
        )}

        {/* Route Polylines - Hub to Restaurant */}
        {droneHub && restaurant && (
          <Polyline
            coordinates={[droneHub, restaurant]}
            strokeColor={currentPhase === 'to_restaurant' ? '#FFA500' : '#CCCCCC'}
            strokeWidth={currentPhase === 'to_restaurant' ? 4 : 2}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* Route Polylines - Restaurant to Customer */}
        {restaurant && customer && (
          <Polyline
            coordinates={[restaurant, customer]}
            strokeColor={currentPhase === 'to_customer' ? '#1E90FF' : '#CCCCCC'}
            strokeWidth={currentPhase === 'to_customer' ? 4 : 2}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* Drone actual path - shows where drone has flown */}
        {path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor="#7C3AED"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Status overlay */}
      <View className="absolute top-4 left-4 rounded-xl bg-black/70 px-3 py-2">
        <Text className="text-white font-quicksand-semibold text-xs">
          {currentPhase === 'idle' && '⏳ Waiting for drone...'}
          {currentPhase === 'to_restaurant' && '🚁 Drone → Restaurant'}
          {currentPhase === 'to_customer' && '📦 Drone → Customer'}
        </Text>
      </View>

      {typeof etaMinutes === 'number' && (
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
