import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { databases, Query } from '@/lib/appwrite';
import { config } from '@/config';
import { TrendingUp, DollarSign, ShoppingBag, Star, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const { restaurant } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    rating: 0,
    todayRevenue: 0,
    todayOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
  });

  useEffect(() => {
    if (restaurant?.$id) {
      fetchAnalytics();
    }
  }, [restaurant]);

  const fetchAnalytics = async () => {
    if (!restaurant?.$id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Fetching analytics for restaurant:', restaurant.$id);
      
      // Fetch all orders first (because restaurantId is a relationship)
      const ordersResponse = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        [Query.limit(1000)]
      );

      console.log('📊 Total orders in database:', ordersResponse.documents.length);
      
      // Filter client-side by restaurantId (handle relationship object)
      const orders = ordersResponse.documents.filter((order: any) => {
        const orderRestaurantId = typeof order.restaurantId === 'object' 
          ? order.restaurantId.$id 
          : order.restaurantId;
        return orderRestaurantId === restaurant.$id;
      });

      console.log('✅ Filtered orders for analytics:', orders.length);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const todayOrders = orders.filter((order: any) => 
        new Date(order.$createdAt) >= today
      );
      const todayRevenue = todayOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      const monthOrders = orders.filter((order: any) => 
        new Date(order.$createdAt) >= thisMonth
      );
      const monthRevenue = monthOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        rating: restaurant?.rating || 0,
        todayRevenue,
        todayOrders: todayOrders.length,
        monthRevenue,
        monthOrders: monthOrders.length,
      });
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <ShoppingBag className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Average Order</span>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageOrderValue.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per order</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Rating</span>
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rating.toFixed(1)} ⭐
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Customer rating</p>
                </div>
              </div>
            </div>

            {/* Today's Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Today&apos;s Revenue</span>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.todayRevenue.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="text-sm opacity-75 mt-2">
                    From {stats.todayOrders} orders today
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">This Month</span>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.monthRevenue.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="text-sm opacity-75 mt-2">
                    From {stats.monthOrders} orders this month
                  </p>
                </div>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Restaurant Name</p>
                  <p className="text-lg font-medium text-gray-900">{restaurant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className={`text-lg font-medium ${
                    restaurant.status === 'active' ? 'text-green-600' : 
                    restaurant.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {restaurant.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{restaurant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-medium text-gray-900">{restaurant.email}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-lg font-medium text-gray-900">{restaurant.address}</p>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg border-2 border-dashed border-amber-300">
              <div className="text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  More Analytics Coming Soon!
                </h3>
                <p className="text-gray-600">
                  Charts, graphs, best-selling items, and detailed revenue analytics will be added here.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
