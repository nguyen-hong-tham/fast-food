import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { restaurant } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Restaurant Name</p>
            <p className="text-2xl font-bold text-gray-900">
              {restaurant?.name || 'N/A'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              {restaurant?.rating?.toFixed(1) || '0.0'} ⭐
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Status</p>
            <p className={`text-2xl font-bold capitalize ${
              restaurant?.status === 'active' ? 'text-green-600' :
              restaurant?.status === 'pending' ? 'text-yellow-600' :
              'text-gray-900'
            }`}>
              {restaurant?.status || 'pending'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to FoodFast Restaurant Portal</h2>
          <p className="text-gray-600">
            Manage your restaurant menu, orders, and settings from this portal.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>Address:</strong> {restaurant?.address}</p>
              <p className="text-gray-600"><strong>Phone:</strong> {restaurant?.phone}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Email:</strong> {restaurant?.email}</p>
              <p className="text-gray-600"><strong>Active:</strong> {restaurant?.isActive ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
