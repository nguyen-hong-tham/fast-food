import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone, DroneHub } from '../../types';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';

interface DeliveryOrder {
  $id: string;
  droneId: string | any;
  status: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  restaurantId: any;
  deliveryAddress: string;
}

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createDroneIcon = (status: string) => {
  const colors: Record<string, string> = {
    available: '#10b981',
    busy: '#f59e0b',
    maintenance: '#ef4444',
    offline: '#6b7280',
  };

  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="
        background-color: ${colors[status] || '#6b7280'};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L4.5 7.5l1.5 1.5L12 5l6 4 1.5-1.5L12 2zM12 22l-7.5-5.5 1.5-1.5L12 19l6-4 1.5 1.5L12 22zm0-10L4.5 7.5 12 12l7.5-4.5L12 12z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const hubIcon = L.divIcon({
  className: 'custom-hub-icon',
  html: `
    <div style="
      background-color: #3b82f6;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface DroneMapProps {
  drones: Drone[];
  hubs: DroneHub[];
  selectedDroneId?: string;
  onDroneClick?: (drone: Drone) => void;
  showRoutes?: boolean;
  className?: string;
}

const DroneMap: React.FC<DroneMapProps> = ({
  drones,
  hubs,
  selectedDroneId,
  onDroneClick,
  showRoutes = false,
  className = '',
}) => {
  const [center, setCenter] = useState<[number, number]>([10.8231, 106.6297]); // Ho Chi Minh City default
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);

  // Fetch delivery orders
  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      try {
        const response = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID,
          [
            Query.or([
              Query.equal('status', 'ready'),
              Query.equal('status', 'delivering')
            ]),
            Query.limit(50)
          ]
        );
        setDeliveryOrders(response.documents as any);
      } catch (error) {
        console.error('Error fetching delivery orders:', error);
      }
    };

    fetchDeliveryOrders();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchDeliveryOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Center map on first hub if available
    if (hubs.length > 0) {
      setCenter([hubs[0].latitude, hubs[0].longitude]);
    }
  }, [hubs]);

  const getBatteryColor = (level: number) => {
    if (level >= 70) return '#10b981';
    if (level >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const getDronesAtHub = (hubId: string) => {
    return drones.filter(
      (drone) =>
        drone.status === 'available' &&
        drone.droneHub === hubId &&
        drone.currentLatitude &&
        drone.currentLongitude
    );
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        className="z-0"
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hubs */}
        {hubs.map((hub) => (
          <React.Fragment key={hub.$id}>
            <Marker position={[hub.latitude, hub.longitude]} icon={hubIcon}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">{hub.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{hub.address}</p>
                  <div className="text-xs text-gray-500">
                    <p>Drones at hub: {getDronesAtHub(hub.$id).length}</p>
                    <p className="text-xs mt-1">
                      📍 {hub.latitude.toFixed(4)}, {hub.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Hub coverage circle */}
            <Circle
              center={[hub.latitude, hub.longitude]}
              radius={5000} // 5km radius
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 10',
              }}
            />
          </React.Fragment>
        ))}

        {/* Drones */}
        {drones.map((drone) => {
          if (!drone.currentLatitude || !drone.currentLongitude) return null;

          const isSelected = selectedDroneId === drone.$id;
          const hubPosition = hubs.find((h) => h.$id === drone.droneHub);
          
          // Find if this drone has an active delivery
          const activeDelivery = deliveryOrders.find(order => {
            const orderDroneId = typeof order.droneId === 'string' 
              ? order.droneId 
              : order.droneId?.$id;
            return orderDroneId === drone.$id;
          });

          const restaurantLat = activeDelivery?.restaurantId?.latitude || null;
          const restaurantLng = activeDelivery?.restaurantId?.longitude || null;

          return (
            <React.Fragment key={drone.$id}>
              {/* Delivery Route - Hub → Restaurant → Customer */}
              {showRoutes && activeDelivery && hubPosition && restaurantLat && restaurantLng && (
                <>
                  {/* Route: Hub → Restaurant (Blue dashed) */}
                  <Polyline
                    positions={[
                      [hubPosition.latitude, hubPosition.longitude],
                      [restaurantLat, restaurantLng],
                    ]}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 3,
                      dashArray: '10, 5',
                      opacity: 0.6,
                    }}
                  />
                  
                  {/* Route: Restaurant → Customer (Green solid) */}
                  <Polyline
                    positions={[
                      [restaurantLat, restaurantLng],
                      [activeDelivery.deliveryLatitude, activeDelivery.deliveryLongitude],
                    ]}
                    pathOptions={{
                      color: '#10b981',
                      weight: 3,
                      opacity: 0.7,
                    }}
                  />

                  {/* Restaurant Marker */}
                  <Marker
                    position={[restaurantLat, restaurantLng]}
                    icon={L.divIcon({
                      className: 'custom-restaurant-icon',
                      html: `
                        <div style="
                          background-color: #f59e0b;
                          width: 28px;
                          height: 28px;
                          border-radius: 4px;
                          border: 2px solid white;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        ">
                          <span style="font-size: 16px;">🍽️</span>
                        </div>
                      `,
                      iconSize: [28, 28],
                      iconAnchor: [14, 14],
                    })}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">Restaurant</p>
                        <p className="text-xs text-gray-600">Pickup Location</p>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* Customer Marker - Always visible when there's an active delivery */}
              {activeDelivery && 
               activeDelivery.deliveryLatitude && activeDelivery.deliveryLongitude && (
                <Marker
                  position={[activeDelivery.deliveryLatitude, activeDelivery.deliveryLongitude]}
                  icon={L.divIcon({
                    className: 'custom-customer-icon',
                    html: `
                      <div style="
                        background-color: #10b981;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      ">
                        <span style="font-size: 14px;">📍</span>
                      </div>
                    `,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">Customer</p>
                      <p className="text-xs text-gray-600">{activeDelivery.deliveryAddress}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              <Marker
                position={[drone.currentLatitude, drone.currentLongitude]}
                icon={createDroneIcon(drone.status)}
                eventHandlers={{
                  click: () => onDroneClick?.(drone),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{drone.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          drone.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : drone.status === 'busy'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {drone.status}
                      </span>
                    </div>

                    {/* Delivery Phase Info */}
                    {activeDelivery && (
                      <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          🚁 Active Delivery
                        </p>
                        <p className="text-xs text-blue-700">
                          Order: #{activeDelivery.$id.slice(-8).toUpperCase()}
                        </p>
                        
                        {/* Distance to customer - Always show if coordinates available */}
                        {activeDelivery.deliveryLatitude && activeDelivery.deliveryLongitude && 
                         drone.currentLatitude && drone.currentLongitude && (
                          <p className="text-xs text-blue-700 mt-2 font-bold">
                            📏 Distance to customer: {calculateDistance(
                              Number(drone.currentLatitude),
                              Number(drone.currentLongitude),
                              Number(activeDelivery.deliveryLatitude),
                              Number(activeDelivery.deliveryLongitude)
                            ).toFixed(2)} km
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Code:</span> {drone.code}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Model:</span> {drone.model || 'N/A'}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Battery</span>
                            <span className="font-medium">{drone.batteryLevel}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${drone.batteryLevel}%`,
                                backgroundColor: getBatteryColor(drone.batteryLevel),
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                        <p>✈️ Flights: {drone.totalFlights}</p>
                        <p>📏 Distance: {drone.totalDistance.toFixed(1)} km</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Show route to hub if enabled and hub exists */}
              {showRoutes && isSelected && hubPosition && (
                <Polyline
                  positions={[
                    [drone.currentLatitude, drone.currentLongitude],
                    [hubPosition.latitude, hubPosition.longitude],
                  ]}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 3,
                    dashArray: '10, 10',
                    opacity: 0.7,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-sm font-bold mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span>Busy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500" />
            <span>Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500" />
            <span>Hub</span>
          </div>
          {showRoutes && (
            <>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <div className="flex-1 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6' }} />
                <span className="text-xs">To Restaurant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-0.5 bg-green-500" />
                <span className="text-xs">To Customer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🍽️</span>
                <span>Restaurant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <span>Customer</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneMap;
