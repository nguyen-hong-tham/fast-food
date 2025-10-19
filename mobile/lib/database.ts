/**
 * Database Helper Functions for Mobile App
 * 
 * Enhanced helpers using the simplified database structure
 * Compatible with existing appwrite.ts
 */

import { databases, appwriteConfig } from './appwrite';
import { Query, ID } from 'react-native-appwrite';
import type {
  User,
  Restaurant,
  MenuItem,
  Category,
  Order,
  OrderItem,
  Payment,
  Notification,
} from '../../shared/types/database';

const { databaseId } = appwriteConfig;

// ============================================
// RESTAURANT OPERATIONS
// ============================================

/**
 * Get all active restaurants
 */
export async function getActiveRestaurants(limit = 25) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'restaurants',
      [
        Query.equal('isActive', true),
        Query.equal('status', 'active'),
        Query.orderDesc('rating'),
        Query.limit(limit),
      ]
    );
    return result.documents as Restaurant[];
  } catch (error) {
    console.error('Get active restaurants error:', error);
    throw error;
  }
}

/**
 * Get restaurant details
 */
export async function getRestaurantDetails(restaurantId: string) {
  try {
    const restaurant = await databases.getDocument(
      databaseId,
      'restaurants',
      restaurantId
    );
    return restaurant as Restaurant;
  } catch (error) {
    console.error('Get restaurant details error:', error);
    throw error;
  }
}

/**
 * Search restaurants by name
 */
export async function searchRestaurants(searchTerm: string) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'restaurants',
      [
        Query.search('name', searchTerm),
        Query.equal('isActive', true),
        Query.equal('status', 'active'),
        Query.limit(25),
      ]
    );
    return result.documents as Restaurant[];
  } catch (error) {
    console.error('Search restaurants error:', error);
    throw error;
  }
}

/**
 * Get nearby restaurants (simplified - just get all and filter client-side)
 */
export async function getNearbyRestaurants(latitude: number, longitude: number, radiusKm = 10) {
  try {
    const allRestaurants = await getActiveRestaurants(100);
    
    // Filter by distance (simple calculation)
    const nearby = allRestaurants.filter((restaurant) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude
      );
      return distance <= radiusKm;
    });
    
    // Sort by distance
    return nearby.sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  } catch (error) {
    console.error('Get nearby restaurants error:', error);
    throw error;
  }
}

// ============================================
// MENU OPERATIONS
// ============================================

/**
 * Get menu items for a restaurant
 */
export async function getRestaurantMenu(restaurantId: string) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'menu',
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('isAvailable', true),
        Query.orderDesc('soldCount'),
        Query.limit(100),
      ]
    );
    return result.documents as MenuItem[];
  } catch (error) {
    console.error('Get restaurant menu error:', error);
    throw error;
  }
}

/**
 * Get menu items by category
 */
export async function getMenuByCategory(categoryId: string, restaurantId?: string) {
  try {
    const queries = [
      Query.equal('categoryId', categoryId),
      Query.equal('isAvailable', true),
      Query.limit(50),
    ];
    
    if (restaurantId) {
      queries.push(Query.equal('restaurantId', restaurantId));
    }
    
    const result = await databases.listDocuments(
      databaseId,
      'menu',
      queries
    );
    return result.documents as MenuItem[];
  } catch (error) {
    console.error('Get menu by category error:', error);
    throw error;
  }
}

/**
 * Get single menu item details
 */
export async function getMenuItemDetails(menuItemId: string) {
  try {
    const menuItem = await databases.getDocument(
      databaseId,
      'menu',
      menuItemId
    );
    return menuItem as MenuItem;
  } catch (error) {
    console.error('Get menu item details error:', error);
    throw error;
  }
}

/**
 * Get popular menu items
 */
export async function getPopularMenuItems(limit = 10) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'menu',
      [
        Query.equal('isAvailable', true),
        Query.orderDesc('soldCount'),
        Query.limit(limit),
      ]
    );
    return result.documents as MenuItem[];
  } catch (error) {
    console.error('Get popular menu items error:', error);
    throw error;
  }
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * Get all categories
 */
export async function getAllCategories() {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'categories',
      [
        Query.orderAsc('displayOrder'),
        Query.limit(50),
      ]
    );
    return result.documents as Category[];
  } catch (error) {
    console.error('Get all categories error:', error);
    throw error;
  }
}

// ============================================
// ORDER OPERATIONS
// ============================================

/**
 * Create a new order
 */
export async function createOrder(
  userId: string,
  restaurantId: string,
  items: Array<{
    menuItemId: string;
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    notes?: string;
  }>,
  deliveryInfo: {
    address: string;
    addressLabel?: string;
    phone?: string;
    email?: string;
    recipientName?: string;
    notes?: string;
  },
  paymentMethod: 'cod' | 'momo' | 'zalopay' | 'vnpay' = 'cod'
) {
  try {
    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // 1. Create order document
    const order = await databases.createDocument(
      databaseId,
      'orders',
      ID.unique(),
      {
        userId,
        restaurantId,
        items: JSON.stringify(items), // Temporary JSON storage
        total, // ← NEW: Total amount
        status: 'pending',
        deliveryAddress: deliveryInfo.address,
        deliveryAddressLabel: deliveryInfo.addressLabel || 'Home',
        phone: deliveryInfo.phone,
        email: deliveryInfo.email,
        recipientName: deliveryInfo.recipientName,
        notes: deliveryInfo.notes,
        paymentMethod,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    
    // 2. Create order items
    const orderItems = await Promise.all(
      items.map(item => 
        databases.createDocument(
          databaseId,
          'order_items',
          ID.unique(),
          {
            orderId: order.$id,
            menuItemId: item.menuItemId,
            name: item.name,
            imageUrl: item.imageUrl || null,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            notes: item.notes || null,
          }
        )
      )
    );
    
    // 3. Create payment record
    await databases.createDocument(
      databaseId,
      'payments',
      ID.unique(),
      {
        userId,
        orderId: order.$id,
        provider: paymentMethod,
        method: paymentMethod === 'cod' ? 'cash' : 'e-wallet',
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        amount: total,
        currency: 'VND',
      }
    );
    
    return {
      order: order as Order,
      orderItems: orderItems as OrderItem[],
    };
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string, limit = 50) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'orders',
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
      ]
    );
    return result.documents as Order[];
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
}

/**
 * Get order details with items
 */
export async function getOrderDetails(orderId: string) {
  try {
    // Get order
    const order = await databases.getDocument(
      databaseId,
      'orders',
      orderId
    ) as Order;
    
    // Get order items
    const itemsResult = await databases.listDocuments(
      databaseId,
      'order_items',
      [
        Query.equal('orderId', orderId),
      ]
    );
    
    // Get restaurant info (if needed)
    let restaurant: Restaurant | null = null;
    if (typeof order.restaurantId === 'string') {
      restaurant = await databases.getDocument(
        databaseId,
        'restaurants',
        order.restaurantId
      ) as Restaurant;
    }
    
    return {
      order,
      orderItems: itemsResult.documents as OrderItem[],
      restaurant,
    };
  } catch (error) {
    console.error('Get order details error:', error);
    throw error;
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(
  userId: string,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'orders',
      [
        Query.equal('userId', userId),
        Query.equal('status', status),
        Query.orderDesc('createdAt'),
        Query.limit(50),
      ]
    );
    return result.documents as Order[];
  } catch (error) {
    console.error('Get orders by status error:', error);
    throw error;
  }
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit = 50) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'notifications',
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    );
    return result.documents as Notification[];
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const result = await databases.listDocuments(
      databaseId,
      'notifications',
      [
        Query.equal('userId', userId),
        Query.notEqual('status', 'read'),
        Query.limit(1), // Only need count
      ]
    );
    return result.total;
  } catch (error) {
    console.error('Get unread notifications count error:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await databases.updateDocument(
      databaseId,
      'notifications',
      notificationId,
      {
        status: 'read',
        readAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const unreadNotifications = await databases.listDocuments(
      databaseId,
      'notifications',
      [
        Query.equal('userId', userId),
        Query.notEqual('status', 'read'),
        Query.limit(100),
      ]
    );
    
    await Promise.all(
      unreadNotifications.documents.map(notification =>
        markNotificationAsRead(notification.$id)
      )
    );
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
}

// ============================================
// USER PROFILE OPERATIONS
// ============================================

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    phone?: string;
    address_home?: string;
    address_home_label?: string;
    avatar?: string;
  }
) {
  try {
    const updated = await databases.updateDocument(
      databaseId,
      'user',
      userId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
    return updated as User;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  try {
    const user = await databases.getDocument(
      databaseId,
      'user',
      userId
    );
    return user as User;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format price in VND
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Calculate order total from items
 */
export function calculateOrderTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export default {
  // Restaurants
  getActiveRestaurants,
  getRestaurantDetails,
  searchRestaurants,
  getNearbyRestaurants,
  
  // Menu
  getRestaurantMenu,
  getMenuByCategory,
  getMenuItemDetails,
  getPopularMenuItems,
  
  // Categories
  getAllCategories,
  
  // Orders
  createOrder,
  getUserOrders,
  getOrderDetails,
  getOrdersByStatus,
  
  // Notifications
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  
  // User Profile
  updateUserProfile,
  getUserProfile,
  
  // Utilities
  formatPrice,
  calculateOrderTotal,
};
