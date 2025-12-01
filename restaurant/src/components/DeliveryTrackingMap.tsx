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

// Custom icons
const restaurantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyAydjdsYTIgMiAwIDAgMCA0IDB2LTdoMy4wMDFsMS41IDYuNzQ1YTIgMiAwIDAgMCAzLjk5OCAwTDE2LjUgMkgyMHY3YTIgMiAwIDAgMCA0IDBWMiIvPjxwYXRoIGQ9Ik0zIDExdjEwaDZWMTFNMjAgMTF2MTBoLTZWMTEiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const customerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMDcyYmEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyAxMGgxOE0zIDEwbDIuNDUtNi40NEE1IDUgMCAwIDEgMTAuMSAxSDEzLjlhNSA1IDAgMCAxIDQuNjUgMi41NkwyMSAxME0zIDEwdjlhMyAzIDAgMCAwIDMgM2gxMmEzIDMgMCAwIDAgMy0zdi05TTE0IDIydi05bS00IDl2LTlNOSAxaDF2Nk05IDE2aDYiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const droneIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxNmExNjkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNSAxM2gxMk01IDEzTDIgMTBNNSAxM3YtMmEyIDIgMCAwIDEgMi0yaDEwYTIgMiAwIDAgMSAyIDJ2MiIvPjxwYXRoIGQ9Im0xNyAxM2wzIDNNMyAyMWgxOCIvPjxwYXRoIGQ9Ik03IDhoNE03IDhoLTJhMSAxIDAgMCAwLTEgMXYyTTExIDhoMmExIDEgMCAwIDEgMSAxdjJNMTEgOFYzYTEgMSAwIDAgMSAxLTFoMWExIDEgMCAwIDEgMSAxdjUiLz48L3N2Zz4=',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

interface MapBoundsUpdaterProps {
  restaurant: { latitude: number; longitude: number; name?: string } | null | undefined;
  customer: { latitude: number; longitude: number; address?: string } | null | undefined;
  drone: { latitude: number; longitude: number; name?: string; batteryLevel?: number } | null | undefined;
}

// Component to update map bounds
const MapBoundsUpdater: React.FC<MapBoundsUpdaterProps> = ({ restaurant, customer, drone }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (restaurant) bounds.extend([restaurant.latitude, restaurant.longitude]);
    if (customer) bounds.extend([customer.latitude, customer.longitude]);
    if (drone) bounds.extend([drone.latitude, drone.longitude]);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [restaurant, customer, drone, map]);

  return null;
};

export interface DeliveryMapProps {
  restaurant?: { latitude: number; longitude: number; name?: string } | null;
  customer?: { latitude: number; longitude: number; address?: string } | null;
  drone?: { latitude: number; longitude: number; name?: string; batteryLevel?: number } | null;
  path?: { latitude: number; longitude: number }[];
  etaMinutes?: number;
  deliveryPhase?: string;
  className?: string;
}

const DeliveryTrackingMap: React.FC<DeliveryMapProps> = ({
  restaurant,
  customer,
  drone,
  path = [],
  etaMinutes,
  deliveryPhase,
  className = '',
}) => {
  const [mapReady, setMapReady] = useState(false);

  // Default center (Ho Chi Minh City)
  const defaultCenter: [number, number] = [10.762622, 106.660172];
  
  // Get center based on available data
  const center: [number, number] = drone 
    ? [drone.latitude, drone.longitude]
    : restaurant
    ? [restaurant.latitude, restaurant.longitude]
    : defaultCenter;

  // Convert path to Leaflet format
  const polylinePositions = path.map(p => [p.latitude, p.longitude] as [number, number]);

  return (
    <div className={`relative ${className}`}>
      {/* Status overlay */}
      {(etaMinutes || deliveryPhase) && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-3 space-y-2">
          {deliveryPhase && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                deliveryPhase === 'to_restaurant' ? 'bg-yellow-500' :
                deliveryPhase === 'to_customer' ? 'bg-blue-500' :
                'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {deliveryPhase === 'to_restaurant' ? '📍 Going to Restaurant' :
                 deliveryPhase === 'to_customer' ? '🚀 Delivering to Customer' :
                 'Standby'}
              </span>
            </div>
          )}
          {etaMinutes && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">ETA:</span> {etaMinutes} min
            </div>
          )}
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

        {/* Restaurant marker */}
        {restaurant && (
          <Marker 
            position={[restaurant.latitude, restaurant.longitude]} 
            icon={restaurantIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-red-600">🏪 Restaurant</strong>
                {restaurant.name && <p className="mt-1">{restaurant.name}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  {restaurant.latitude.toFixed(5)}, {restaurant.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Customer marker */}
        {customer && (
          <Marker 
            position={[customer.latitude, customer.longitude]} 
            icon={customerIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-blue-600">🏠 Delivery Location</strong>
                {customer.address && <p className="mt-1">{customer.address}</p>}
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
                <strong className="text-green-600">🚁 Drone</strong>
                {drone.name && <p className="mt-1">{drone.name}</p>}
                {drone.batteryLevel !== undefined && (
                  <p className="mt-1">🔋 Battery: {drone.batteryLevel}%</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {drone.latitude.toFixed(5)}, {drone.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Flight path */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Auto-fit bounds */}
        {mapReady && <MapBoundsUpdater restaurant={restaurant} customer={customer} drone={drone} />}
      </MapContainer>
    </div>
  );
};

export default DeliveryTrackingMap;
