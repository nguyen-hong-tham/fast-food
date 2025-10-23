'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, Query } from '@/lib/appwrite';
import { config } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { DashboardStats } from '@/types';
import { BarChart3, TrendingUp, ShoppingBag, Clock } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, restaurant, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to setup if no restaurant
  useEffect(() => {
    if (!authLoading && user?.role === 'restaurant' && !restaurant) {
      router.push('/setup');
    }
  }, [restaurant, authLoading, user, router]);

  useEffect(() => {
    const loadStats = async () => {
      if (!authLoading && restaurant?.$id) {
        await fetchDashboardStats();
      } else {
        // No restaurant yet, stop loading
        setIsLoading(false);
      }
    };
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, authLoading]);

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If no restaurant, the useEffect will redirect to /setup
  // This is just a fallback UI
  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to restaurant setup...</p>
        </div>
      </div>
    );
  }

  // Restaurant approval status banners
  const getStatusBanner = () => {
    if (!restaurant) return null;

    if (restaurant.status === 'pending') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Pending Approval
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your restaurant registration is currently under review. You&apos;ll receive an email notification within 24-48 hours regarding the approval status.
                </p>
                <p className="mt-2">
                  In the meantime, you can complete your restaurant profile by adding more information in the <a href="/settings" className="font-medium underline">Settings</a> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (restaurant.status === 'rejected') {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Registration Rejected
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Unfortunately, your restaurant registration was not approved.
                </p>
                {restaurant?.rejectionReason && (
                  <p className="mt-2">
                    <strong>Reason:</strong> {restaurant.rejectionReason}
                  </p>
                )}
                <p className="mt-2">
                  Please contact support at <a href="mailto:support@foodfast.vn" className="font-medium underline">support@foodfast.vn</a> for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (restaurant.status === 'approved') {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Restaurant Approved - Complete Your Profile
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Congratulations! Your restaurant has been approved. Please complete your profile to activate your restaurant:
                </p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Add menu items</li>
                  <li>Upload restaurant logo and cover image</li>
                  <li>Set operating hours</li>
                  <li>Add bank account details</li>
                </ul>
                <p className="mt-2">
                  Go to <a href="/settings" className="font-medium underline">Settings</a> to complete your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Main dashboard render
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {restaurant?.name || user?.name}!
        </p>
      </div>

      {/* Restaurant Status Alerts */}
      {getStatusBanner()}

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
