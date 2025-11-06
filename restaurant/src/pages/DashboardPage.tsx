import StatCard from '@/components/StatCard';
import { useAuthStore } from '@/store/authStore';
import { Star, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { restaurant, user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Monitor your restaurant's performance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Restaurant Name"
          value={restaurant?.name || 'N/A'}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Rating"
          value={`${restaurant?.rating?.toFixed(1) || '5.0'} ⭐`}
          icon={<Star className="w-6 h-6" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Status"
          value={`"${restaurant?.status || 'Active'}"`}
          icon={restaurant?.isActive ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          color={restaurant?.isActive ? "bg-green-500" : "bg-red-500"}
        />
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Welcome to FoodFast Restaurant Portal
        </h2>
        <p className="text-gray-600 mb-6">
          Manage your restaurant menu, orders, and settings from this portal.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-sm text-gray-600">{restaurant?.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm text-gray-600">{restaurant?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-600">{user?.email || restaurant?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-sm text-gray-600">{restaurant?.isActive ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
