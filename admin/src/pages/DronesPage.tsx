import { createDrone, deleteDrone, getAllDrones, getAllDroneHubs, updateDrone, createDroneHub, updateDroneHub, deleteDroneHub } from '@/lib/api';
import type { Drone, DroneHub, DroneStatus } from '@/types';
import { Battery, Edit, Map, List, Plane, Plus, Search, Trash2, X, RefreshCw, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DroneMap from '@/components/maps/DroneMap';

interface DroneFormData {
  code: string;
  name: string;
  model: string;
  status: DroneStatus;
  batteryLevel: number;
  maxPayload: number;
  maxSpeed: number;
  maxRange: number;
  hubId: string; // String field instead of relationship
}

interface HubFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [hubs, setHubs] = useState<DroneHub[]>([]);
  const [filteredDrones, setFilteredDrones] = useState<Drone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [editingHub, setEditingHub] = useState<DroneHub | null>(null);
  const [selectedDroneId, setSelectedDroneId] = useState<string>();
  const [viewMode, setViewMode] = useState<'list' | 'hub'>('list');
  const [isEditingHubInfo, setIsEditingHubInfo] = useState(false);
  const [formData, setFormData] = useState<DroneFormData>({
    code: '',
    name: '',
    model: '',
    status: 'available',
    batteryLevel: 100,
    maxPayload: 5,
    maxSpeed: 50,
    maxRange: 10,
    hubId: '', // Hub ID is required (string field)
  });
  const [hubFormData, setHubFormData] = useState<HubFormData>({
    name: '',
    address: '',
    latitude: 10.7587229,
    longitude: 106.682131,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(async () => {
      try {
        const [dronesData] = await Promise.all([
          getAllDrones(200),
        ]);
        setDrones(dronesData);
        console.log('🔄 Auto-refreshed drones');
      } catch (error) {
        console.error('Error auto-refreshing drones:', error);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    filterDrones();
  }, [searchQuery, drones]);
  
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
      alert('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadData();
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const filterDrones = () => {
    if (!searchQuery.trim()) {
      setFilteredDrones(drones);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = drones.filter(
      drone =>
        drone.code?.toLowerCase().includes(query) ||
        drone.name?.toLowerCase().includes(query) ||
        drone.model?.toLowerCase().includes(query)
    );
    setFilteredDrones(filtered);
  };
  
  const handleOpenModal = (drone?: Drone) => {
    // Check if hub exists before allowing drone creation
    if (!drone && hubs.length === 0) {
      alert('⚠️ You must create a Hub first before adding drones!');
      setViewMode('hub');
      return;
    }
    
    if (drone) {
      setEditingDrone(drone);
      const droneHubId = (drone as any).hubId || getDroneHubId(drone);
      setFormData({
        code: drone.code || '',
        name: drone.name || '',
        model: drone.model || '',
        status: drone.status || 'available',
        batteryLevel: drone.batteryLevel || 100,
        maxPayload: drone.maxPayload || 5,
        maxSpeed: drone.maxSpeed || 50,
        maxRange: drone.maxRange || 10,
        hubId: droneHubId || (hubs.length > 0 ? hubs[0].$id : ''),
      });
    } else {
      setEditingDrone(null);
      setFormData({
        code: '',
        name: '',
        model: '',
        status: 'available',
        batteryLevel: 100,
        maxPayload: 5,
        maxSpeed: 50,
        maxRange: 10,
        hubId: hubs.length > 0 ? hubs[0].$id : '',
      });
    }
    setIsModalOpen(true);
  };
  
  const handleOpenHubModal = (hub?: DroneHub) => {
    if (hub) {
      setEditingHub(hub);
      setHubFormData({
        name: hub.name,
        address: hub.address,
        latitude: hub.latitude,
        longitude: hub.longitude,
      });
    } else {
      setEditingHub(null);
      setHubFormData({
        name: '',
        address: '',
        latitude: 10.7587229,
        longitude: 106.682131,
      });
    }
    setIsHubModalOpen(true);
  };
  
  const handleCloseHubModal = () => {
    setIsHubModalOpen(false);
    setEditingHub(null);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDrone(null);
  };
  
  const handleSubmitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hubFormData.name.trim() || !hubFormData.address.trim()) {
      alert('Please fill in Hub Name and Address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (hubs.length > 0) {
        // Update existing hub
        const updated = await updateDroneHub(hubs[0].$id, hubFormData);
        setHubs([updated]);
        setIsEditingHubInfo(false);
        alert('Hub updated successfully');
      } else {
        // Create new hub
        const newHub = await createDroneHub(hubFormData);
        setHubs([newHub]);
        alert('Hub created successfully');
      }
      
      handleCloseHubModal();
    } catch (error: any) {
      console.error('Error saving hub:', error);
      alert(error.message || 'Failed to save hub');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Please fill in all required fields (Code and Name)');
      return;
    }
    
    if (!formData.hubId) {
      alert('Please select a hub for this drone');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (editingDrone) {
        const updated = await updateDrone(editingDrone.$id, {
          code: formData.code,
          name: formData.name,
          model: formData.model,
          status: formData.status,
          batteryLevel: formData.batteryLevel,
          maxPayload: formData.maxPayload,
          maxSpeed: formData.maxSpeed,
          maxRange: formData.maxRange,
          hubId: formData.hubId,
        });
        setDrones(drones.map(d => d.$id === updated.$id ? updated : d));
        alert('Drone updated successfully');
      } else {
        const newDrone = await createDrone({
          ...formData,
          status: 'available',
          hubId: formData.hubId,
        });
        setDrones([newDrone, ...drones]);
        alert('Drone created successfully and assigned to hub');
      }
      
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving drone:', error);
      alert(error.message || 'Failed to save drone');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (droneId: string) => {
    const drone = drones.find(d => d.$id === droneId);
    
    // Check if drone is busy (delivering)
    if (drone?.status === 'busy' || drone?.status === 'delivering') {
      alert('❌ Cannot delete this drone. It is currently busy with a delivery. Please wait until it completes the delivery.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this drone?')) {
      return;
    }
    
    try {
      await deleteDrone(droneId);
      setDrones(drones.filter(d => d.$id !== droneId));
      alert('Drone deleted successfully');
    } catch (error) {
      console.error('Error deleting drone:', error);
      alert('Failed to delete drone');
    }
  };
  
  const handleDeleteHub = async (hubId: string) => {
    const dronesInHub = drones.filter(d => getDroneHubId(d) === hubId);
    const busyDrones = dronesInHub.filter(d => d.status === 'busy');
    
    // Check if any drone is currently busy (delivering)
    if (busyDrones.length > 0) {
      alert(`❌ Cannot delete hub. ${busyDrones.length} drone(s) are currently delivering orders. Please wait until they complete their deliveries.`);
      return;
    }
    
    if (dronesInHub.length > 0) {
      const confirmMsg = `⚠️ This hub has ${dronesInHub.length} drone(s). Deleting the hub will also delete all drones assigned to it. Continue?`;
      if (!confirm(confirmMsg)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this hub?')) {
        return;
      }
    }
    
    try {
      // Delete all drones in the hub first
      for (const drone of dronesInHub) {
        await deleteDrone(drone.$id);
      }
      
      // Then delete the hub
      await deleteDroneHub(hubId);
      
      setDrones(drones.filter(d => getDroneHubId(d) !== hubId));
      setHubs(hubs.filter(h => h.$id !== hubId));
      alert(`Hub and ${dronesInHub.length} drone(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting hub:', error);
      alert('Failed to delete hub');
    }
  };

  const stats = {
    total: drones.length,
    available: drones.filter(d => d.status === 'available').length,
    inService: drones.filter(d => d.status === 'busy').length,
    maintenance: drones.filter(d => d.status === 'maintenance').length,
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'text-green-600';
    if (level >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: DroneStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get drone hub ID
  const getDroneHubId = (drone: Drone): string => {
    // Prioritize hubId (string field) over droneHub (relationship)
    return (drone as any).hubId || (typeof drone.droneHub === 'string' ? drone.droneHub : (drone.droneHub?.$id || ''));
  };

  // Helper function to filter drones by hub
  const getDronesByHub = (hubId: string) => {
    return drones.filter(d => getDroneHubId(d) === hubId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading drones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drone Management</h1>
            <p className="text-gray-600 mt-1">Manage your delivery drone fleet</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('hub')}
                className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'hub'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Hub
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by code, name, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Total Drones</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Available</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.available}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">In Service</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.inService}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Maintenance</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.maintenance}</div>
          </div>
        </div>
      </div>

      {/* Hub Info - Only show in List/Map view */}
      {viewMode !== 'hub' && (
        hubs.length > 0 ? (
          <div className="mb-6 space-y-3">
            {hubs.map(hub => {
              const dronesInHub = getDronesByHub(hub.$id).length;
              return (
                <div key={hub.$id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900">{hub.name}</h3>
                      <p className="text-sm text-blue-700 mt-1">{hub.address}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        📍 {hub.latitude.toFixed(6)}, {hub.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-600">Drones</div>
                      <div className="text-2xl font-bold text-blue-900">{dronesInHub}</div>
                    </div>
                    <button
                      onClick={() => setViewMode('hub')}
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="View Hub Details"
                    >
                      <Building2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">No Hub Available</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to create a Hub first before adding drones. Click the "Hub" tab to create one.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* Content - List, Map, or Hub */}
      {viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Add Drone Button in List View Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Drone Fleet</h2>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Drone
            </button>
          </div>

          {filteredDrones.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No drones found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Add your first drone to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CODE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NAME</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MODEL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BATTERY</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPECS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FLIGHTS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrones.map((drone) => (
                    <tr key={drone.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Plane className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{drone.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drone.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drone.model || 'DJI'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(drone.status)}`}>
                          {drone.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Battery className={`w-4 h-4 ${getBatteryColor(drone.batteryLevel)}`} />
                          <span className={`text-sm font-medium ${getBatteryColor(drone.batteryLevel)}`}>
                            {drone.batteryLevel}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div>Max: {drone.maxPayload}kg</div>
                        <div>Speed: {drone.maxSpeed}km/h</div>
                        <div>Range: {drone.maxRange}km</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drone.totalFlights}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(drone)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(drone.$id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* HUB VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {hubs.length === 0 ? (
            /* No Hub - Create Form */
            <div className="p-8">
              <div className="text-center mb-6">
                <Building2 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Drone Hub</h3>
                <p className="text-gray-600">Set up the central hub where all drones will be stationed</p>
              </div>

              <form onSubmit={handleSubmitHub} className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hub Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={hubFormData.name}
                      onChange={(e) => setHubFormData({ ...hubFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Main Distribution Hub"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={hubFormData.address}
                      onChange={(e) => setHubFormData({ ...hubFormData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Lê Văn Việt, Tăng Nhơn Phú A, Thủ Đức, Hồ Chí Minh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={hubFormData.latitude}
                      onChange={(e) => setHubFormData({ ...hubFormData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="10.7587229"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={hubFormData.longitude}
                      onChange={(e) => setHubFormData({ ...hubFormData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="106.682131"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Right-click on Google Maps and copy the coordinates to get the exact latitude and longitude.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? 'Creating Hub...' : 'Create Hub'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Hub Exists - Display Info & Drones */
            <div>
              {/* Hub Information Card */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      {isEditingHubInfo ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={hubFormData.name}
                            onChange={(e) => setHubFormData({ ...hubFormData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/90 text-gray-900 rounded-lg"
                            placeholder="Hub Name"
                          />
                          <input
                            type="text"
                            value={hubFormData.address}
                            onChange={(e) => setHubFormData({ ...hubFormData, address: e.target.value })}
                            className="w-full px-3 py-2 bg-white/90 text-gray-900 rounded-lg"
                            placeholder="Address"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              step="any"
                              value={hubFormData.latitude}
                              onChange={(e) => setHubFormData({ ...hubFormData, latitude: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 bg-white/90 text-gray-900 rounded-lg text-sm"
                              placeholder="Latitude"
                            />
                            <input
                              type="number"
                              step="any"
                              value={hubFormData.longitude}
                              onChange={(e) => setHubFormData({ ...hubFormData, longitude: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 bg-white/90 text-gray-900 rounded-lg text-sm"
                              placeholder="Longitude"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold mb-2">{hubs[0].name}</h2>
                          <p className="text-blue-100 mb-2">{hubs[0].address}</p>
                          <p className="text-sm text-blue-200">
                            📍 {hubs[0].latitude.toFixed(6)}, {hubs[0].longitude.toFixed(6)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEditingHubInfo ? (
                      <>
                        <button
                          onClick={() => {
                            handleSubmitHub(new Event('submit') as any);
                          }}
                          className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingHubInfo(false);
                            setHubFormData({
                              name: hubs[0].name,
                              address: hubs[0].address,
                              latitude: hubs[0].latitude,
                              longitude: hubs[0].longitude,
                            });
                          }}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditingHubInfo(true);
                          setHubFormData({
                            name: hubs[0].name,
                            address: hubs[0].address,
                            latitude: hubs[0].latitude,
                            longitude: hubs[0].longitude,
                          });
                        }}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Hub Info
                      </button>
                    )}
                  </div>
                </div>

                {/* Hub Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-sm text-blue-100">Total Drones</div>
                    <div className="text-3xl font-bold mt-1">{getDronesByHub(hubs[0].$id).length}</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-sm text-blue-100">Available</div>
                    <div className="text-3xl font-bold mt-1">{getDronesByHub(hubs[0].$id).filter(d => d.status === 'available').length}</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-sm text-blue-100">In Service</div>
                    <div className="text-3xl font-bold mt-1">{getDronesByHub(hubs[0].$id).filter(d => d.status === 'busy').length}</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-sm text-blue-100">Maintenance</div>
                    <div className="text-3xl font-bold mt-1">{getDronesByHub(hubs[0].$id).filter(d => d.status === 'maintenance').length}</div>
                  </div>
                </div>
              </div>

              {/* Drones List */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Drones at this Hub</h3>
                
                {getDronesByHub(hubs[0].$id).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No drones assigned to this hub yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add drones to get started with deliveries</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getDronesByHub(hubs[0].$id).map((drone) => (
                      <div key={drone.$id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-semibold text-gray-900">{drone.code}</div>
                              <div className="text-sm text-gray-500">{drone.name}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(drone.status)}`}>
                            {drone.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Battery</span>
                            <span className={`font-medium ${getBatteryColor(drone.batteryLevel)}`}>
                              {drone.batteryLevel}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Flights</span>
                            <span className="font-medium text-gray-900">{drone.totalFlights}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Model</span>
                            <span className="font-medium text-gray-900">{drone.model || 'DJI'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-3 border-t">
                          <button
                            onClick={() => handleOpenModal(drone)}
                            className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(drone.$id)}
                            className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDrone ? 'Edit Drone' : 'Add New Drone'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="DJ13"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Drone3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="DJI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hub <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hubId}
                  onChange={(e) => setFormData({ ...formData, hubId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a hub</option>
                  {hubs.map(hub => (
                    <option key={hub.$id} value={hub.$id}>
                      {hub.name} - {hub.address}
                    </option>
                  ))}
                </select>
                {hubs.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No hubs available. Please create a hub first.</p>
                )}
              </div>

              {editingDrone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DroneStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Battery Level (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.batteryLevel}
                  onChange={(e) => setFormData({ ...formData, batteryLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Payload (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxPayload}
                    onChange={(e) => setFormData({ ...formData, maxPayload: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Speed (km/h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxSpeed}
                    onChange={(e) => setFormData({ ...formData, maxSpeed: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Range (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxRange}
                    onChange={(e) => setFormData({ ...formData, maxRange: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingDrone ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hub Management Modal */}
      {isHubModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {editingHub ? 'Edit Hub' : 'Create New Hub'}
              </h2>
              <button
                onClick={handleCloseHubModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHub} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hub Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hubFormData.name}
                  onChange={(e) => setHubFormData({ ...hubFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Main Hub"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hubFormData.address}
                  onChange={(e) => setHubFormData({ ...hubFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Lê Văn Việt, Tăng Nhơn Phú A, Thủ Đức, Hồ Chí Minh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={hubFormData.latitude}
                    onChange={(e) => setHubFormData({ ...hubFormData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="10.7587229"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={hubFormData.longitude}
                    onChange={(e) => setHubFormData({ ...hubFormData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="106.682131"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> You can get coordinates by right-clicking on Google Maps and selecting the latitude/longitude values.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseHubModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingHub ? 'Update Hub' : 'Create Hub')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
