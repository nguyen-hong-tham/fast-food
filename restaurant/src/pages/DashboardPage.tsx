import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { restaurant } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {(restaurant?.totalRevenue || 0).toLocaleString('vi-VN')}₫
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {restaurant?.totalOrders || 0}
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
            <p className="text-2xl font-bold text-gray-900">
              {restaurant?.status || 'pending'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to FoodFast Restaurant Portal</h2>
          <p className="text-gray-600">This is your dashboard. More features coming soon!</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
