import { createDrone, deleteDrone, getAllDrones, updateDrone } from '@/lib/api';
import type { Drone, DroneStatus } from '@/types';
import { Battery, Edit, Plane, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DroneFormData {
  code: string;
  name: string;
  model: string;
  status: DroneStatus;
  batteryLevel: number;
  maxPayload: number;
  maxSpeed: number;
  maxRange: number;
}

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [filteredDrones, setFilteredDrones] = useState<Drone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [formData, setFormData] = useState<DroneFormData>({
    code: '',
    name: '',
    model: '',
    status: 'available',
    batteryLevel: 100,
    maxPayload: 5,
    maxSpeed: 50,
    maxRange: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadDrones();
  }, []);
  
  useEffect(() => {
    filterDrones();
  }, [searchQuery, drones]);
  
  const loadDrones = async () => {
    try {
      setIsLoading(true);
      const data = await getAllDrones(200);
      setDrones(data);
    } catch (error) {
      console.error('Error loading drones:', error);
      alert('Failed to load drones');
    } finally {
      setIsLoading(false);
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
    if (drone) {
      setEditingDrone(drone);
      setFormData({
        code: drone.code || '',
        name: drone.name || '',
        model: drone.model || '',
        status: drone.status || 'available',
        batteryLevel: drone.batteryLevel || 100,
        maxPayload: drone.maxPayload || 5,
        maxSpeed: drone.maxSpeed || 50,
        maxRange: drone.maxRange || 10,
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
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Please fill in all required fields (Code and Name)');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (editingDrone) {
        // Update existing drone
        const updated = await updateDrone(editingDrone.$id, {
          code: formData.code,
          name: formData.name,
          model: formData.model,
          status: formData.status,
          batteryLevel: formData.batteryLevel,
          maxPayload: formData.maxPayload,
          maxSpeed: formData.maxSpeed,
          maxRange: formData.maxRange,
        });
        setDrones(drones.map(d => d.$id === updated.$id ? updated : d));
        alert('Drone updated successfully');
      } else {
        // Create new drone
        const newDrone = await createDrone(formData);
        setDrones([newDrone, ...drones]);
        alert('Drone created successfully');
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
  
  const getStatusColor = (status: DroneStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'text-green-500';
    if (level >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drones...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Drone Management</h1>
          <p className="text-gray-500 mt-2">Manage your delivery drone fleet</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Drone</span>
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, name, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Total Drones</p>
          <p className="text-3xl font-bold text-gray-800">{drones.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Available</p>
          <p className="text-3xl font-bold text-green-600">
            {drones.filter(d => d.status === 'available').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">In Service</p>
          <p className="text-3xl font-bold text-yellow-600">
            {drones.filter(d => d.status === 'busy').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Maintenance</p>
          <p className="text-3xl font-bold text-orange-600">
            {drones.filter(d => d.status === 'maintenance' || d.status === 'offline').length}
          </p>
        </div>
      </div>
      
      {/* Drones Table */}
      {filteredDrones.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {drones.length === 0 ? 'No drones found' : 'No drones match your search'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Specs
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Flights
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrones.map(drone => (
                  <tr key={drone.$id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Plane className="w-5 h-5 text-gray-400" />
                        <span className="font-mono font-semibold text-gray-900">{drone.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{drone.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {drone.model || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(drone.status)}`}>
                        {drone.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Battery className={`w-5 h-5 ${getBatteryColor(drone.batteryLevel)}`} />
                        <span className="font-semibold">{drone.batteryLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>Max: {drone.maxPayload}kg</div>
                        <div>Speed: {drone.maxSpeed}km/h</div>
                        <div>Range: {drone.maxRange}km</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{drone.totalFlights}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(drone)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(drone.$id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
        </div>
      )}
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingDrone ? 'Edit Drone' : 'Add New Drone'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., DR001"
                    required
                  />
                </div>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Falcon"
                    required
                  />
                </div>
                
                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., DJI M300"
                  />
                </div>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DroneStatus })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                
                {/* Battery Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Battery Level (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.batteryLevel}
                    onChange={(e) => setFormData({ ...formData, batteryLevel: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {/* Max Payload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Payload (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.maxPayload}
                    onChange={(e) => setFormData({ ...formData, maxPayload: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {/* Max Speed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Speed (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.maxSpeed}
                    onChange={(e) => setFormData({ ...formData, maxSpeed: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {/* Max Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Range (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.maxRange}
                    onChange={(e) => setFormData({ ...formData, maxRange: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingDrone ? 'Update Drone' : 'Create Drone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
