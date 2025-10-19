'use client';

import { useEffect, useState } from 'react';
import { databases, Query } from '@/lib/appwrite';
import { config } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { TrendingUp, DollarSign, ShoppingBag, Star } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const { restaurant } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    averageRating: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);

  const COLORS = ['#f58b20', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

  useEffect(() => {
    const loadAnalytics = async () => {
      if (restaurant?.$id) {
        await fetchAnalytics();
      } else {
        setIsLoading(false);
      }
    };
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Fetch orders
      const ordersResponse = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        [Query.equal('restaurantId', restaurant!.$id), Query.limit(500)]
      );

      const orders = ordersResponse.documents;
      
      // Calculate basic stats
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Revenue by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const revenueByDay = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        
        const dayOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.$createdAt);
          return orderDate >= date && orderDate < nextDay;
        });

        return {
          date: date.toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' }),
          revenue: dayOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
          orders: dayOrders.length,
        };
      });

      // Fetch menu items
      const menuResponse = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.menuCollectionId,
        [Query.equal('restaurantId', restaurant!.$id)]
      );

      const menuItems = menuResponse.documents;

      // Category distribution
      const categoryMap = new Map();
      menuItems.forEach((item: any) => {
        const count = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, count + 1);
      });

      const categoryStats = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value,
      }));

      // Mock top selling items (would need order_items in real implementation)
      const topSellingItems = menuItems.slice(0, 5).map((item: any, index: number) => ({
        name: item.name,
        sold: Math.floor(Math.random() * 100) + 50,
        revenue: item.price * (Math.floor(Math.random() * 100) + 50),
      }));

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue: avgOrderValue,
        averageRating: restaurant?.rating || 0, // Changed from averageRating to rating
      });
      setRevenueData(revenueByDay);
      setCategoryData(categoryStats);
      setTopItems(topSellingItems.sort((a, b) => b.sold - a.sold));
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Restaurant Found</h2>
          <p className="text-gray-600">
            You need to have a restaurant associated with your account to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">Track your restaurant performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString('vi-VN')}₫`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Avg Order Value"
          value={`${stats.averageOrderValue.toLocaleString('vi-VN')}₫`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('vi-VN')}₫`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#f58b20" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Orders (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Menu Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Selling Items</h2>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.sold} sold</p>
                  </div>
                </div>
                <span className="font-semibold text-primary-600">
                  {item.revenue.toLocaleString('vi-VN')}₫
                </span>
              </div>
            ))}
          </div>
        </div>
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
  color: 'green' | 'blue' | 'purple' | 'yellow';
}) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
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
