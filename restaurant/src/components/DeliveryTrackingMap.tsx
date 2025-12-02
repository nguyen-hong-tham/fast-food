import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Pin markers using leaflet-color-markers (same style as mobile)
// Violet pin for Hub
const hubIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Orange pin for Restaurant
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Green pin for Customer
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Drone icon
const droneIcon = new L.Icon({
  iconUrl: '/icons/drone.png',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

interface MapBoundsUpdaterProps {
  hub?: { latitude: number; longitude: number } | null | undefined;
  restaurant: { latitude: number; longitude: number; name?: string } | null | undefined;
  customer: { latitude: number; longitude: number; address?: string } | null | undefined;
  drone: { latitude: number; longitude: number; name?: string; batteryLevel?: number } | null | undefined;
}

// Component to update map bounds
const MapBoundsUpdater: React.FC<MapBoundsUpdaterProps> = ({ hub, restaurant, customer, drone }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (hub) bounds.extend([hub.latitude, hub.longitude]);
    if (restaurant) bounds.extend([restaurant.latitude, restaurant.longitude]);
    if (customer) bounds.extend([customer.latitude, customer.longitude]);
    if (drone) bounds.extend([drone.latitude, drone.longitude]);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [hub, restaurant, customer, drone, map]);

  return null;
};

// Drone Progress Indicator Component
interface DroneProgressIndicatorProps {
  phase: 'idle' | 'hub_to_restaurant' | 'restaurant_to_customer';
  phaseProgress: number;
  overallProgress: number;
}

export const DroneProgressIndicator: React.FC<DroneProgressIndicatorProps> = ({ 
  phase, 
  phaseProgress, 
  overallProgress 
}) => (
  <div className="bg-white rounded-2xl p-4 shadow-md">
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          {phase === 'hub_to_restaurant' && 'Hub → Restaurant'}
          {phase === 'restaurant_to_customer' && 'Restaurant → Customer'}
          {phase === 'idle' && 'Preparing...'}
        </span>
        <span className="text-xs font-semibold text-orange-500">
          {Math.round(phaseProgress)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${phaseProgress}%` }}
        />
      </div>
    </div>
    
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">Overall Progress</span>
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(overallProgress)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
    </div>
  </div>
);

export interface DeliveryMapProps {
  hub?: { latitude: number; longitude: number } | null; // Drone hub/base station
  droneHub?: { latitude: number; longitude: number } | null; // Alias for hub
  restaurant?: { latitude: number; longitude: number; name?: string } | null;
  customer?: { latitude: number; longitude: number; address?: string } | null;
  drone?: { latitude: number; longitude: number; name?: string; batteryLevel?: number } | null;
  path?: { latitude: number; longitude: number }[];
  phase?: 'idle' | 'hub_to_restaurant' | 'restaurant_to_customer';
  currentPhase?: 'idle' | 'to_restaurant' | 'to_customer'; // Alias for phase
  progress?: number; // Phase progress
  completedPath?: { latitude: number; longitude: number }[];
  remainingPath?: { latitude: number; longitude: number }[];
  etaMinutes?: number;
  deliveryPhase?: string; // Legacy support
  className?: string;
}

const DeliveryTrackingMap: React.FC<DeliveryMapProps> = ({
  hub,
  droneHub,
  restaurant,
  customer,
  drone,
  phase = 'idle',
  currentPhase,
  progress = 0,
  etaMinutes,
  deliveryPhase,
  className = '',
}) => {
  const [mapReady, setMapReady] = useState(false);

  // Use droneHub as fallback, convert currentPhase to phase format
  const hubLocation = hub || droneHub;
  const activePhase = phase !== 'idle' ? phase : 
    currentPhase === 'to_restaurant' ? 'hub_to_restaurant' : 
    currentPhase === 'to_customer' ? 'restaurant_to_customer' : 
    deliveryPhase === 'to_restaurant' ? 'hub_to_restaurant' :
    deliveryPhase === 'to_customer' ? 'restaurant_to_customer' : 'idle';

  // Calculate phase progress and overall progress
  const phaseProgress = progress || 0;
  const overallProgress = activePhase === 'hub_to_restaurant' 
    ? phaseProgress * 0.5 // First half of journey
    : activePhase === 'restaurant_to_customer'
    ? 50 + (phaseProgress * 0.5) // Second half of journey
    : 0;

  // Default center (Ho Chi Minh City)
  const defaultCenter: [number, number] = [10.762622, 106.660172];
  
  // Get center based on available data
  const center: [number, number] = drone 
    ? [drone.latitude, drone.longitude]
    : restaurant
    ? [restaurant.latitude, restaurant.longitude]
    : hubLocation
    ? [hubLocation.latitude, hubLocation.longitude]
    : defaultCenter;

  // NOTE: Path traveled polylines removed to match mobile behavior
  // Only planned routes (Hub→Restaurant, Restaurant→Customer) are shown

  return (
    <div className={`relative ${className}`}>
      {/* Progress indicator overlay */}
      {activePhase !== 'idle' && (
        <div className="absolute top-4 left-4 z-[1000] max-w-xs">
          <DroneProgressIndicator 
            phase={activePhase}
            phaseProgress={phaseProgress}
            overallProgress={overallProgress}
          />
        </div>
      )}


      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        whenReady={() => setMapReady(true)}
        className="rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Hub marker (Drone Base) - Purple */}
        {hubLocation && (
          <Marker 
            position={[hubLocation.latitude, hubLocation.longitude]} 
            icon={hubIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-purple-600">Drone Hub</strong>
                <p className="mt-1 text-gray-600">Drone base station</p>
                <p className="text-gray-500 text-xs mt-1">
                  {hubLocation.latitude.toFixed(5)}, {hubLocation.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Restaurant marker - Orange */}
        {restaurant && (
          <Marker 
            position={[restaurant.latitude, restaurant.longitude]} 
            icon={restaurantIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-orange-600">Restaurant</strong>
                {restaurant.name && <p className="mt-1">{restaurant.name}</p>}
                <p className="text-gray-600 mt-1">Pickup location</p>
                <p className="text-gray-500 text-xs mt-1">
                  {restaurant.latitude.toFixed(5)}, {restaurant.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Customer marker - Green */}
        {customer && (
          <Marker 
            position={[customer.latitude, customer.longitude]} 
            icon={customerIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-green-600">Delivery Location</strong>
                {customer.address && <p className="mt-1">{customer.address}</p>}
                <p className="text-gray-600 mt-1">Delivery destination</p>
                <p className="text-gray-500 text-xs mt-1">
                  {customer.latitude.toFixed(5)}, {customer.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drone marker */}
        {drone && (
          <Marker 
            position={[drone.latitude, drone.longitude]} 
            icon={droneIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-blue-600">Drone</strong>
                {drone.name && <p className="mt-1">{drone.name}</p>}
                <p className="text-gray-600 mt-1">In-flight delivery</p>
                {drone.batteryLevel !== undefined && (
                  <p className="mt-1">Battery: {drone.batteryLevel}%</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {drone.latitude.toFixed(5)}, {drone.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Planned Route - Hub to Restaurant (dashed) */}
        {hubLocation && restaurant && (
          <Polyline
            positions={[[hubLocation.latitude, hubLocation.longitude], [restaurant.latitude, restaurant.longitude]]}
            pathOptions={{
              color: activePhase === 'hub_to_restaurant' ? '#FFA500' : '#CCCCCC',
              weight: activePhase === 'hub_to_restaurant' ? 4 : 2,
              opacity: 0.7,
              dashArray: '8, 4',
            }}
          />
        )}

        {/* Planned Route - Restaurant to Customer (dashed) */}
        {restaurant && customer && (
          <Polyline
            positions={[[restaurant.latitude, restaurant.longitude], [customer.latitude, customer.longitude]]}
            pathOptions={{
              color: activePhase === 'restaurant_to_customer' ? '#1E90FF' : '#CCCCCC',
              weight: activePhase === 'restaurant_to_customer' ? 4 : 2,
              opacity: 0.7,
              dashArray: '8, 4',
            }}
          />
        )}

        {/* NOTE: path traveled (polylinePositions) is no longer displayed
            to match mobile behavior - only planned routes are shown */}

        {/* Auto-fit bounds */}
        {mapReady && <MapBoundsUpdater hub={hubLocation} restaurant={restaurant} customer={customer} drone={drone} />}
      </MapContainer>
    </div>
  );
};

export default DeliveryTrackingMap;
