import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, AnimatedRegion } from 'react-native-maps';
import { icons } from '@/constants';
import { appwriteConfig, client } from '@/lib/appwrite';

// Define LatLng type locally
interface LatLng {
  latitude: number;
  longitude: number;
}

export interface DeliveryMapProps {
  hub?: LatLng | null;
  restaurant?: LatLng | null;
  customer?: LatLng | null;
  drone?: LatLng | null;
  droneId?: string | null; // Add droneId to subscribe to realtime updates
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
  hub,
  restaurant,
  customer,
  drone,
  droneId,
  path = [],
  etaMinutes,
}) => {
  const mapRef = useRef<MapView | null>(null);
  const markerRef = useRef<any>(null);
  
  // Animated drone position (using any to bypass TypeScript issues with AnimatedRegion)
  const animatedDroneCoords = useRef<any>(
    new AnimatedRegion({
      latitude: drone?.latitude || 10.762622,
      longitude: drone?.longitude || 106.660172,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  const [realtimeDronePosition, setRealtimeDronePosition] = useState<LatLng | null>(drone || null);
  const [traveledPath, setTraveledPath] = useState<LatLng[]>([]); // Store all waypoints drone has traveled
  const lastProcessedPosition = useRef<string | null>(null); // Prevent duplicate animations

  // Subscribe to realtime drone position updates
  useEffect(() => {
    if (!droneId) {
      console.log('No droneId provided, skipping realtime subscription');
      return;
    }

    console.log('🔔 Subscribing to drone updates:', droneId);

    // Subscribe to BOTH drones collection AND droneEvents collection
    // This ensures we catch updates from both sources
    
    // Channel 1: Direct drone document updates (currentLatitude/currentLongitude)
    const droneChannel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.dronesCollectionId}.documents.${droneId}`;
    
    // Channel 2: Drone events (latitude/longitude from events)
    const eventsChannel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.droneEventsCollectionId}.documents`;
    
    const unsubscribeDrone = client.subscribe(droneChannel, (response: any) => {
      const payload = response.payload;
      
      if (payload.currentLatitude != null && payload.currentLongitude != null) {
        const newCoords = {
          latitude: payload.currentLatitude,
          longitude: payload.currentLongitude,
        };
        
        console.log('🚁 Drone position from drones collection:', newCoords);
        updateDronePosition(newCoords);
      }
    });
    
    const unsubscribeEvents = client.subscribe(eventsChannel, (response: any) => {
      const payload = response.payload;
      
      // Only process events for our drone
      if (payload.droneId !== droneId) {
        return;
      }
      
      if (payload.latitude != null && payload.longitude != null) {
        const newCoords = {
          latitude: payload.latitude,
          longitude: payload.longitude,
        };
        
        console.log('🚁 Drone position from event:', payload.eventType, newCoords);
        updateDronePosition(newCoords);
      }
    });

    return () => {
      console.log('🔕 Unsubscribing from drone updates');
      unsubscribeDrone();
      unsubscribeEvents();
    };
  }, [droneId]);

  // Helper function to update drone position with animation
  const updateDronePosition = (newCoords: LatLng) => {
    // Create unique key to prevent duplicate animations
    const posKey = `${newCoords.latitude.toFixed(6)},${newCoords.longitude.toFixed(6)}`;
    
    if (lastProcessedPosition.current === posKey) {
      console.log('⏭️ Skipping duplicate position:', posKey);
      return;
    }
    
    lastProcessedPosition.current = posKey;
    setRealtimeDronePosition(newCoords);
    
    // Add to traveled path for visualization
    setTraveledPath(prev => [...prev, newCoords]);
    
    try {
      console.log('✈️ Animating drone to:', newCoords);
      animatedDroneCoords.timing({
        ...newCoords,
        latitudeDelta: 0,
        longitudeDelta: 0,
      }, {
        duration: 450, // 450ms animation (slightly less than 500ms interval)
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('❌ Animation error:', error);
      animatedDroneCoords.setValue({
        ...newCoords,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
    }
  };

  // Update animated position when drone prop changes (for initial position)
  useEffect(() => {
    if (drone && (drone.latitude !== realtimeDronePosition?.latitude || 
                  drone.longitude !== realtimeDronePosition?.longitude)) {
      console.log('🎯 Initial drone position set:', drone);
      setRealtimeDronePosition(drone);
      // Set initial value without animation
      animatedDroneCoords.setValue({
        ...drone,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
    }
  }, [drone]);

  const coordinates = useMemo(() => {
    return [hub, restaurant, customer, drone].filter(Boolean) as LatLng[];
  }, [hub, restaurant, customer, drone]);

  const initialRegion = useMemo<Region>(() => {
    const fallback = INITIAL_REGION;
    const source = hub || restaurant || customer;

    if (!source) return fallback;

    return {
      latitude: source.latitude,
      longitude: source.longitude,
      latitudeDelta: fallback.latitudeDelta,
      longitudeDelta: fallback.longitudeDelta,
    };
  }, [hub, restaurant, customer]);

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
    // Always show the planned route: hub -> restaurant -> customer
    const plannedPoints: LatLng[] = [];
    if (hub) plannedPoints.push(hub);
    if (restaurant) plannedPoints.push(restaurant);
    if (customer) plannedPoints.push(customer);

    return plannedPoints;
  }, [hub, restaurant, customer]);

  // Actual path traveled by drone (for progress visualization)
  const actualPath = useMemo(() => {
    // Use traveledPath if available (from realtime updates)
    if (traveledPath.length > 1) return traveledPath;
    // Fallback to path prop
    if (path.length > 1) return path;
    return [];
  }, [traveledPath, path]);

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
        {hub && (
          <Marker
            coordinate={hub}
            title="Hub"
            description="Trạm drone"
            pinColor="#8B5CF6"
          />
        )}

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

        {/* Animated drone marker */}
        {realtimeDronePosition && (
          <Marker.Animated
            ref={markerRef}
            coordinate={animatedDroneCoords}
            title="Drone"
            description="Đang giao hàng"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View className="items-center justify-center">
              <Image
                source={icons.drone}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </Marker.Animated>
        )}

        {/* Planned route - dashed line (always visible) */}
        {polylinePoints.length > 1 && (
          <Polyline
            coordinates={polylinePoints}
            strokeColor="#10B981"
            strokeWidth={3}
            lineDashPattern={[8, 8]}
          />
        )}

        {/* Actual path traveled - solid line (shows progress) */}
        {actualPath.length > 1 && (
          <Polyline
            coordinates={actualPath}
            strokeColor="#1E90FF"
            strokeWidth={4}
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
