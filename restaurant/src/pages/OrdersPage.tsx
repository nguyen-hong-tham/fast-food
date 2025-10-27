import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { databases, Query } from '@/lib/appwrite';
import { config } from '@/config';
import { Order } from '@/types';
import { Clock, CheckCircle, XCircle, Package, Truck, MapPin, X } from 'lucide-react';

interface OrderItem {
  $id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  imageUrl?: string;
  orderId: any;
  $createdAt: string;
  $updatedAt: string;
}

export default function OrdersPage() {
  const { restaurant } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (restaurant?.$id) {
      fetchOrders();
    }
  }, [restaurant]);

  const fetchOrders = async () => {
    if (!restaurant?.$id) {
      console.warn('No restaurant ID to fetch orders');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Fetching orders for restaurant:', restaurant.$id);
      
      // Fetch all orders first (because restaurantId is a relationship)
      const response = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      console.log('📊 Total orders:', response.documents.length);
      
      // Filter client-side by restaurantId (handle relationship object)
      const filtered = response.documents.filter((order: any) => {
        const orderRestaurantId = typeof order.restaurantId === 'object' 
          ? order.restaurantId.$id 
          : order.restaurantId;
        console.log('🔍 Comparing order restaurantId:', orderRestaurantId, 'with:', restaurant.$id);
        return orderRestaurantId === restaurant.$id;
      });
      
      console.log('✅ Filtered orders for this restaurant:', filtered.length);
      setOrders(filtered as any);
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsLoadingItems(true);
    
    try {
      console.log('🔍 Fetching order items for order:', order.$id);
      
      // Fetch all order items first (orderId might be a relationship)
      const response = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.orderItemsCollectionId,
        [
          Query.limit(100)
        ]
      );

      console.log('📊 Total order items in database:', response.documents.length);
      
      // Filter client-side by orderId (handle relationship object)
      const filtered = response.documents.filter((item: any) => {
        const itemOrderId = typeof item.orderId === 'object' 
          ? item.orderId.$id 
          : item.orderId;
        console.log('🔍 Comparing item orderId:', itemOrderId, 'with:', order.$id);
        return itemOrderId === order.$id;
      });

      console.log('✅ Order items for this order:', filtered.length);
      setOrderItems(filtered as any);

      // Calculate total from order items
      const calculatedTotal = filtered.reduce((sum: number, item: any) => {
        return sum + (item.subtotal || 0);
      }, 0);

      console.log('💰 Order totalAmount from DB:', order.totalAmount);
      console.log('💰 Calculated total from items:', calculatedTotal);

      // Always update selectedOrder with calculated total for display
      const updatedOrder = { ...order, totalAmount: calculatedTotal };
      setSelectedOrder(updatedOrder);

      // Update orders list immediately with calculated total
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.$id === order.$id ? { ...o, totalAmount: calculatedTotal } : o
        )
      );

      // Update order in database if different and calculatedTotal > 0
      if (order.totalAmount !== calculatedTotal && calculatedTotal > 0) {
        console.log('⚠️ Total amount mismatch! Updating order in database...');
        try {
          await databases.updateDocument(
            config.appwrite.databaseId,
            config.appwrite.ordersCollectionId,
            order.$id,
            { totalAmount: calculatedTotal }
          );
          console.log('✅ Order total amount updated in database');
        } catch (updateError: any) {
          console.error('❌ Error updating order total:', updateError);
          // Don't block the UI if update fails
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching order items:', error);
      alert('Failed to load order details: ' + error.message);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change the order status to ${newStatus.toUpperCase()}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 Updating order status:', orderId, 'to', newStatus);
      
      // Validate status value matches Appwrite enum
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status value: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const updateData = {
        status: newStatus
      };
      
      console.log('📤 Sending update data:', updateData);
      
      await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        orderId,
        updateData
      );

      console.log('✅ Order status updated successfully');
      
      // Refresh orders to get latest data
      await fetchOrders();
      
      // Close modal after successful update
      if (selectedOrder && selectedOrder.$id === orderId) {
        closeModal();
      }

      alert('Order status updated successfully!');
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      alert('Failed to update order status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'ready':
      case 'picked_up':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivering':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivering':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex overflow-x-auto">
            {['all', 'pending', 'preparing', 'ready', 'delivering', 'delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-6 py-3 font-medium transition-colors ${
                  filter === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {orders.filter(o => o.status === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Your orders will appear here once customers start ordering!' 
                : `No ${filter} orders at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.$id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.$id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.$createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(order.totalAmount || 0).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                      <p className={`text-sm font-medium ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{order.deliveryAddress}</span>
                  </div>

                  {order.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.$id, 'preparing')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(order.$id, 'ready')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Mark Ready (Start Delivery)
                      </button>
                    )}
                    {order.status === 'delivering' && (
                      <button 
                        onClick={() => updateOrderStatus(order.$id, 'delivered')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {(order.status === 'ready' || order.status === 'picked_up') && (
                      <button 
                        disabled={true}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg transition-colors text-sm font-medium opacity-50 cursor-not-allowed"
                      >
                        🚁 Drone in Transit...
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{selectedOrder.$id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Status</h3>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.$createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg text-gray-900">
                      {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className={`font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedOrder.paymentStatus.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Delivery Address</h3>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{selectedOrder.deliveryAddress}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Customer Notes</h3>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Items</h3>
                {isLoadingItems ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items found</p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.$id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {item.price.toLocaleString('vi-VN')}₫
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1 italic">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.subtotal.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Summary */}
                    <div className="pt-3 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">Total</p>
                        <p className="text-xl font-bold text-primary-600">
                          {orderItems.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-2 flex-wrap">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.$id, 'preparing');
                        closeModal();
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Accept Order
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.$id, 'ready');
                        closeModal();
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Mark Ready (Start Delivery)
                    </button>
                  )}
                  {selectedOrder.status === 'delivering' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.$id, 'delivered');
                        closeModal();
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {(selectedOrder.status === 'ready' || selectedOrder.status === 'picked_up') && (
                    <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                      🚁 Drone is delivering your order...
                    </div>
                  )}
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
