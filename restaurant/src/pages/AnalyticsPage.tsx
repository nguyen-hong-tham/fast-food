import { useState, useEffect } from 'react';

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
      
      // Try server-side filtering first
      let orders: any[];
      try {
        const ordersResponse = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.ordersCollectionId,
          [
            Query.equal('restaurantId', restaurant.$id),
            Query.limit(1000)
          ]
        );
        orders = ordersResponse.documents;
      } catch {
        // Fallback: Fetch all and filter client-side
        const ordersResponse = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.ordersCollectionId,
          [Query.limit(1000)]
        );
        orders = ordersResponse.documents.filter((order: any) => {
          const orderRestaurantId = typeof order.restaurantId === 'object' 
            ? order.restaurantId.$id 
            : order.restaurantId;
          return orderRestaurantId === restaurant.$id;
        });
      }

      console.log('Filtered orders for analytics:', orders.length);

      // ✅ SMART CALCULATION: Fix missing/zero totalAmount
      // Fetch order items once, group by orderId, calculate totals
      const ordersNeedingTotals = orders.filter((o: any) => !o.totalAmount || o.totalAmount === 0);
      
      let ordersWithTotals = orders;
      if (ordersNeedingTotals.length > 0) {
        console.log(`📊 ${ordersNeedingTotals.length} orders need total calculation`);
        
        try {
          const itemsResponse = await databases.listDocuments(
            config.appwrite.databaseId,
            config.appwrite.orderItemsCollectionId,
            [Query.limit(1000)]
          );
          
          // Group by orderId
          const itemsByOrderId: Record<string, any[]> = {};
          itemsResponse.documents.forEach((item: any) => {
            const orderId = typeof item.orderId === 'object' ? item.orderId.$id : item.orderId;
            if (!itemsByOrderId[orderId]) itemsByOrderId[orderId] = [];
            itemsByOrderId[orderId].push(item);
          });
          
          // Calculate totals
          ordersWithTotals = orders.map((order: any) => {
            if (order.totalAmount && order.totalAmount > 0) {
              return { ...order, calculatedTotal: order.totalAmount };
            }
            
            const items = itemsByOrderId[order.$id] || [];
            const calculatedTotal = items.reduce((sum: number, item: any) => 
              sum + (item.subtotal || 0), 0
            );
            
            return { ...order, calculatedTotal };
          });
          
          console.log('✅ Analytics totals calculated');
        } catch (calcError) {
          console.error('Error calculating analytics totals:', calcError);
          ordersWithTotals = orders.map((order: any) => ({
            ...order,
            calculatedTotal: order.totalAmount || 0
          }));
        }
      } else {
        ordersWithTotals = orders.map((order: any) => ({
          ...order,
          calculatedTotal: order.totalAmount || 0
        }));
      }

      console.log('Orders with totals:', ordersWithTotals.length);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate stats using calculatedTotal
      const totalRevenue = ordersWithTotals.reduce((sum, order: any) => sum + (order.calculatedTotal || 0), 0);
      const totalOrders = ordersWithTotals.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const todayOrders = ordersWithTotals.filter((order: any) => 
        new Date(order.$createdAt) >= today
      );
      const todayRevenue = todayOrders.reduce((sum, order: any) => sum + (order.calculatedTotal || 0), 0);

      const monthOrders = ordersWithTotals.filter((order: any) => 
        new Date(order.$createdAt) >= thisMonth
      );
      const monthRevenue = monthOrders.reduce((sum, order: any) => sum + (order.calculatedTotal || 0), 0);

      console.log('📊 Analytics Stats:', {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        todayRevenue,
        todayOrders: todayOrders.length,
        monthRevenue,
        monthOrders: monthOrders.length
      });

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
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
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
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{restaurant.phone}</p>
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
  );
}
