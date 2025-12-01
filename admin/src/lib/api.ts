import type { Category, Drone, DroneHub, MenuItem, Order, User } from '@/types';
import { ID, Query } from 'appwrite';
import { account, appwriteConfig, databases } from './appwrite';

// ===================== AUTH =====================

/**
 * Sign in with email and password (Admin only)
 */
export const signIn = async (email: string, password: string) => {
  try {
    // Delete any existing session first to avoid "session already active" error
    try {
      const currentSession = await account.getSession('current');
      if (currentSession) {
        console.log('🔄 Deleting existing session...');
        await account.deleteSession('current');
        // Small delay to let Appwrite process the deletion
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (e: any) {
      // Ignore if no session exists
      console.log('ℹ️ No existing session to delete');
    }
    
    // Create new session
    console.log('🔐 Creating new admin session...');
    const session = await account.createEmailPasswordSession(email, password);
    console.log('✅ Session created:', session.$id);
    
    // Small delay to ensure session is fully established
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get user data and check if admin
    console.log('📋 Fetching user data...');
    const user = await getCurrentUser();
    console.log('👤 User data:', user);
    
    if (!user || user.role !== 'admin') {
      console.log('❌ Access denied - user role:', user?.role);
      await signOut();
      throw new Error('Access denied. Admin privileges required.');
    }
    
    console.log('✅ Admin login successful');
    return session;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    // Handle rate limit error specifically
    if (error.code === 429 || error.message?.includes('Rate limit')) {
      throw new Error('Rate limit exceeded. Please try again after some time.');
    }
    
    // Handle session errors with retry
    if (error.message?.includes('session is active') || error.message?.includes('session is prohibited')) {
      try {
        console.log('🔄 Retrying: Force delete session and login again');
        await account.deleteSession('current').catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 500));
        const session = await account.createEmailPasswordSession(email, password);
        
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
          await signOut();
          throw new Error('Access denied. Admin privileges required.');
        }
        
        console.log('✅ Admin login successful after retry');
        return session;
      } catch (retryError: any) {
        console.error('❌ Retry failed:', retryError);
        throw new Error('Login failed: ' + (retryError.message || 'Please try again'));
      }
    }
    
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    await account.deleteSession('current');
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentAccount = await account.get();
    
    if (!currentAccount) return null;
    
    const userDocuments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );
    
    if (userDocuments.documents.length === 0) return null;
    
    return userDocuments.documents[0] as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// ===================== USERS =====================

/**
 * Get all users
 */
export const getAllUsers = async (limit: number = 100): Promise<User[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(limit)]
    );
    
    return response.documents as User[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch users');
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: string): Promise<User> => {
  try {
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      { role, updatedAt: new Date().toISOString() }
    );
    
    return updatedUser as User;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user role');
  }
};

// ===================== ORDERS =====================

/**
 * Get all orders
 */
export const getAllOrders = async (limit: number = 200): Promise<Order[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(limit)]
    );
    
    return response.documents as Order[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  try {
    const updatedOrder = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId,
      { status, updatedAt: new Date().toISOString() }
    );
    
    return updatedOrder as Order;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update order status');
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const order = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId
    );
    
    return order as Order;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch order');
  }
};

// ===================== MENU =====================

/**
 * Get all menu items
 */
export const getAllMenuItems = async (limit: number = 100): Promise<MenuItem[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [Query.limit(limit)]
    );
    
    return response.documents as MenuItem[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch menu items');
  }
};

/**
 * Create menu item
 */
export const createMenuItem = async (data: Partial<MenuItem>): Promise<MenuItem> => {
  try {
    const newItem = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      'unique()',
      {
        ...data,
        createdAt: new Date().toISOString(),
      }
    );
    
    return newItem as MenuItem;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create menu item');
  }
};

/**
 * Update menu item
 */
export const updateMenuItem = async (menuId: string, data: Partial<MenuItem>): Promise<MenuItem> => {
  try {
    const updatedItem = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      menuId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
    
    return updatedItem as MenuItem;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update menu item');
  }
};

/**
 * Delete menu item
 */
export const deleteMenuItem = async (menuId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      menuId
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete menu item');
  }
};

// ===================== CATEGORIES =====================

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.limit(100)]
    );
    
    return response.documents as Category[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch categories');
  }
};

// ===================== DRONES =====================

/**
 * Get all drones
 */
export const getAllDrones = async (limit: number = 100): Promise<Drone[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.dronesCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(limit)]
    );
    
    return response.documents as Drone[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch drones');
  }
};

/**
 * Create new drone with hub assignment
 */
export const createDrone = async (data: {
  code: string;
  name: string;
  model?: string;
  status?: string;
  batteryLevel?: number;
  maxPayload?: number;
  maxSpeed?: number;
  maxRange?: number;
  hubId: string;
}): Promise<Drone> => {
  try {
    // Get hub location from the selected hub
    const hub = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.droneHubsCollectionId,
      data.hubId
    );
    
    const drone = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.dronesCollectionId,
      ID.unique(),
      {
        code: data.code,
        name: data.name,
        model: data.model || '',
        status: data.status || 'available',
        batteryLevel: data.batteryLevel || 100,
        totalFlights: 0,
        currentPayload: 0,
        maxPayload: data.maxPayload || 5,
        maxSpeed: data.maxSpeed || 50,
        maxRange: data.maxRange || 10,
        totalDistance: 0,
        isActive: true,
        hubId: data.hubId,
        // Set drone at hub location
        currentLatitude: hub.latitude,
        currentLongitude: hub.longitude,
        homeLatitude: hub.latitude,
        homeLongitude: hub.longitude,
      }
    );
    
    return drone as Drone;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create drone');
  }
};

/**
 * Update drone
 */
export const updateDrone = async (droneId: string, data: Partial<Drone>): Promise<Drone> => {
  try {
    const updatedDrone = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.dronesCollectionId,
      droneId,
      data
    );
    
    return updatedDrone as Drone;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update drone');
  }
};

/**
 * Delete drone
 */
export const deleteDrone = async (droneId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.dronesCollectionId,
      droneId
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete drone');
  }
};

// ===================== DRONE HUBS =====================

/**
 * Get all drone hubs
 */
export const getAllDroneHubs = async (): Promise<DroneHub[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.droneHubsCollectionId,
      [Query.orderDesc('$createdAt')]
    );
    
    return response.documents as DroneHub[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch drone hubs');
  }
};

/**
 * Create new drone hub
 */
export const createDroneHub = async (data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}): Promise<DroneHub> => {
  try {
    const hub = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.droneHubsCollectionId,
      ID.unique(),
      data
    );
    
    return hub as DroneHub;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create drone hub');
  }
};

/**
 * Update drone hub
 */
export const updateDroneHub = async (hubId: string, data: Partial<DroneHub>): Promise<DroneHub> => {
  try {
    const updatedHub = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.droneHubsCollectionId,
      hubId,
      data
    );
    
    return updatedHub as DroneHub;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update drone hub');
  }
};

/**
 * Delete drone hub
 */
export const deleteDroneHub = async (hubId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.droneHubsCollectionId,
      hubId
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete drone hub');
  }
};

// ===================== STATS =====================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const [orders, users, products] = await Promise.all([
      getAllOrders(),
      getAllUsers(),
      getAllMenuItems(),
    ]);
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: users.filter(u => u.role !== 'admin').length,
      totalProducts: products.length,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }
};
