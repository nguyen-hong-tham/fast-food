'use client';

import { useEffect, useState } from 'react';
import { databases, Query } from '@/lib/appwrite';
import { config } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { DashboardStats } from '@/types';
import { BarChart3, TrendingUp, ShoppingBag, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user, restaurant } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (restaurant?.$id) {
      fetchDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      // Fetch orders for this restaurant
      const ordersResponse = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        [Query.equal('restaurantId', restaurant!.$id), Query.limit(100)]
      );

      // Calculate stats
      const orders = ordersResponse.documents;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      
      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(o => new Date(o.$createdAt) >= today);
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pendingOrders,
        todayRevenue,
        todayOrders: todayOrders.length,
        topSellingItems: [],
        recentOrders: orders.slice(0, 5) as any,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {restaurant?.name || user?.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`${stats?.totalRevenue.toLocaleString('vi-VN')}₫`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders.toString() || '0'}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders.toString() || '0'}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Today's Revenue"
          value={`${stats?.todayRevenue.toLocaleString('vi-VN')}₫`}
          icon={<BarChart3 className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order.$id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">Order #{order.$id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.$createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
