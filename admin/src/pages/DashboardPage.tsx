import StatCard from '@/components/StatCard';
import { getDashboardStats } from '@/lib/api';
import type { DashboardStats } from '@/types';
import { CheckCircle, Clock, DollarSign, Package, ShoppingBag, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Monitor your restaurant's performance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Revenue"
          value={`${(stats?.totalRevenue || 0).toLocaleString('vi-VN')}₫`}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={<Package className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>
      
      {/* Order Status Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Orders by Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            icon={<Clock className="w-6 h-6" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="Completed Orders"
            value={stats?.completedOrders || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="bg-green-500"
          />
          <StatCard
            title="Cancelled Orders"
            value={stats?.cancelledOrders || 0}
            icon={<XCircle className="w-6 h-6" />}
            color="bg-red-500"
          />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-left">
            <ShoppingBag className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">View All Orders</h3>
            <p className="text-sm text-gray-500">Manage customer orders</p>
          </button>
          <button className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-left">
            <Package className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">Add New Product</h3>
            <p className="text-sm text-gray-500">Create menu item</p>
          </button>
          <button className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-left">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">View Customers</h3>
            <p className="text-sm text-gray-500">Manage user accounts</p>
          </button>
        </div>
      </div>
    </div>
  );
}
