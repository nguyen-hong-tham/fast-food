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
  path?: LatLng[];
  etaMinutes?: number;
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
  path = [],
  etaMinutes,
}) => {
  const mapRef = useRef<MapView | null>(null);

  const coordinates = useMemo(() => {
    return [restaurant, customer, drone].filter(Boolean) as LatLng[];
  }, [restaurant, customer, drone]);

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

  const polylinePoints = useMemo(() => {
    if (path.length > 0) return path;

    if (restaurant && customer) {
      return [restaurant, customer];
    }

    return [];
  }, [path, restaurant, customer]);

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
        {restaurant && (
          <Marker
            coordinate={restaurant}
            title="Restaurant"
            description="Pickup location"
            pinColor="#FE8C00"
          />
        )}

        {customer && (
          <Marker
            coordinate={customer}
            title="Customer"
            description="Delivery destination"
            pinColor="#2F9B65"
          />
        )}

        {drone && (
          <Marker
            coordinate={drone}
            title="Drone"
            description="In-flight"
            pinColor="#1E90FF"
          />
        )}

        {polylinePoints.length > 1 && (
          <Polyline
            coordinates={polylinePoints}
            strokeColor="#1E90FF"
            strokeWidth={4}
            lineDashPattern={[6, 6]}
          />
        )}
      </MapView>

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
