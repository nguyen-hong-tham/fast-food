import { databases, Query } from './appwrite';
import { config } from '@/config';

/**
 * Fetch restaurant by owner ID
 */
export const getRestaurantByOwnerId = async (ownerId: string) => {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.restaurantsCollectionId,
      [Query.equal('ownerId', ownerId), Query.limit(1)]
    );
    return response.documents[0] || null;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
};

/**
 * Fetch menu items for a restaurant
 */
export const getMenuItems = async (restaurantId: string) => {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.menuCollectionId,
      [Query.equal('restaurantId', restaurantId), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
};

/**
 * Fetch orders for a restaurant
 */
export const getOrders = async (restaurantId: string, limit = 100) => {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.ordersCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

/**
 * Fetch order items for an order
 */
export const getOrderItems = async (orderId: string) => {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.orderItemsCollectionId,
      [Query.equal('orderId', orderId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.ordersCollectionId,
      orderId,
      { status }
    );
    return response;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get restaurant statistics
 */
export const getRestaurantStats = async (restaurantId: string) => {
  try {
    const orders = await getOrders(restaurantId, 500);
    
    const totalRevenue = orders.reduce((sum: number, order: any) => 
      sum + (order.status === 'delivered' ? order.totalAmount : 0), 0
    );
    
    const totalOrders = orders.filter((o: any) => o.status === 'delivered').length;
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o: any) => 
      new Date(o.$createdAt) >= today && o.status === 'delivered'
    );
    const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      avgOrderValue,
      todayRevenue,
      todayOrders: todayOrders.length,
    };
  } catch (error) {
    console.error('Error getting restaurant stats:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      avgOrderValue: 0,
      todayRevenue: 0,
      todayOrders: 0,
    };
  }
};
