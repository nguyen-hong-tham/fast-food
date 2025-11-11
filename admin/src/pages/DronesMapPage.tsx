import { getAllDrones, getAllDroneHubs } from '@/lib/api';
import type { Drone, DroneHub } from '@/types';
import { Map, List, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import DroneMap from '@/components/maps/DroneMap';

export default function DronesMapPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [hubs, setHubs] = useState<DroneHub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDroneId, setSelectedDroneId] = useState<string>();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [showRoutes, setShowRoutes] = useState(true); // Enable routes by default

  // Helper function to get drone hub ID
  const getDroneHubId = (drone: Drone): string => {
    return typeof drone.droneHub === 'string' ? drone.droneHub : (drone.droneHub?.$id || '');
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 seconds for real-time tracking
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dronesData, hubsData] = await Promise.all([
        getAllDrones(200),
        getAllDroneHubs(),
      ]);
      setDrones(dronesData);
      setHubs(hubsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: drones.length,
    available: drones.filter((d) => d.status === 'available').length,
    busy: drones.filter((d) => d.status === 'busy').length,
    maintenance: drones.filter((d) => d.status === 'maintenance').length,
    offline: drones.filter((d) => d.status === 'offline').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading drone data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drone Location Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of drone fleet</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 flex items-center gap-2 ${
                view === 'map'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
              Map View
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 flex items-center gap-2 ${
                view === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Drones</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.available}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">In Service</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.busy}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Maintenance</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.maintenance}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Offline</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.offline}</p>
        </div>
      </div>

      {/* Map or List View */}
      {view === 'map' ? (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Live Map</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded"
              />
              Show Routes
            </label>
          </div>

          <DroneMap
            drones={drones}
            hubs={hubs}
            selectedDroneId={selectedDroneId}
            onDroneClick={(drone) => setSelectedDroneId(drone.$id)}
            showRoutes={showRoutes}
            className="h-[600px]"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hub
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flights
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drones.map((drone) => {
                  const droneHubId = getDroneHubId(drone);
                  const hub = hubs.find((h) => h.$id === droneHubId);
                  return (
                    <tr
                      key={drone.$id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedDroneId(drone.$id);
                        setView('map');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{drone.name}</div>
                          <div className="text-sm text-gray-500">{drone.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            drone.status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : drone.status === 'busy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {drone.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${drone.batteryLevel}%`,
                                  backgroundColor:
                                    drone.batteryLevel >= 70
                                      ? '#10b981'
                                      : drone.batteryLevel >= 30
                                      ? '#f59e0b'
                                      : '#ef4444',
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-700">{drone.batteryLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drone.currentLatitude && drone.currentLongitude ? (
                          <div>
                            <div>{drone.currentLatitude.toFixed(4)}</div>
                            <div>{drone.currentLongitude.toFixed(4)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No location</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hub ? hub.name : <span className="text-gray-400">No hub</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drone.totalFlights}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hub Info Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Hub Locations</h2>
        <div className="grid grid-cols-3 gap-4">
          {hubs.map((hub) => {
            const hubDrones = drones.filter((d) => getDroneHubId(d) === hub.$id);
            return (
              <div key={hub.$id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{hub.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{hub.address}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Drones:</span>
                  <span className="font-medium">{hubDrones.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Available:</span>
                  <span className="font-medium text-green-600">
                    {hubDrones.filter((d) => d.status === 'available').length}
                  </span>
                </div>
              </div>
            );
          })}
          {hubs.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No hubs configured yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
