import { Account, Client, Databases, Storage } from 'appwrite';

// Appwrite configuration from environment variables
export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '68da5e73002cb68e70af',
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || '68dacda1003d6943981e',
  
  // Existing collections
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID || 'user',
  ordersCollectionId: import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
  menuCollectionId: import.meta.env.VITE_APPWRITE_MENU_COLLECTION_ID || 'menu',
  categoriesCollectionId: import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',
  customizationsCollectionId: import.meta.env.VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID || 'customizations',
  menuCustomizationsCollectionId: import.meta.env.VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID || 'menu_customizations',
  
  // New collections (Phase 0 - Database Foundation)
  restaurantsCollectionId: import.meta.env.VITE_APPWRITE_RESTAURANTS_COLLECTION_ID || 'restaurants',
  orderItemsCollectionId: import.meta.env.VITE_APPWRITE_ORDER_ITEMS_COLLECTION_ID || 'order_items',
  paymentsCollectionId: import.meta.env.VITE_APPWRITE_PAYMENTS_COLLECTION_ID || 'payments',
  reviewsCollectionId: import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews',
  notificationsCollectionId: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
  dronesCollectionId: import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID || 'drones',
  droneHubsCollectionId: import.meta.env.VITE_APPWRITE_DRONE_HUBS_COLLECTION_ID || 'drone_hub',
  droneEventsCollectionId: import.meta.env.VITE_APPWRITE_DRONE_EVENTS_COLLECTION_ID || 'drone_events',
  promotionsCollectionId: import.meta.env.VITE_APPWRITE_PROMOTIONS_COLLECTION_ID || 'promotions',
  userVouchersCollectionId: import.meta.env.VITE_APPWRITE_USER_VOUCHERS_COLLECTION_ID || 'user_vouchers',
  auditLogsCollectionId: import.meta.env.VITE_APPWRITE_AUDIT_LOGS_COLLECTION_ID || 'audit_logs',
};

// Initialize Appwrite Client with admin-specific session
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Use a unique session storage key for admin to avoid conflicts with customer app
if (typeof window !== 'undefined') {
  // Override localStorage for admin sessions
  const ADMIN_PREFIX = 'admin_';
  const nativeSetItem = window.localStorage.setItem;
  const nativeGetItem = window.localStorage.getItem;
  const nativeRemoveItem = window.localStorage.removeItem;
  
  window.localStorage.setItem = function(key: string, value: string) {
    if (key.includes('appwrite') || key.includes('cookieFallback')) {
      return nativeSetItem.call(this, ADMIN_PREFIX + key, value);
    }
    return nativeSetItem.call(this, key, value);
  };
  
  window.localStorage.getItem = function(key: string) {
    if (key.includes('appwrite') || key.includes('cookieFallback')) {
      return nativeGetItem.call(this, ADMIN_PREFIX + key);
    }
    return nativeGetItem.call(this, key);
  };
  
  window.localStorage.removeItem = function(key: string) {
    if (key.includes('appwrite') || key.includes('cookieFallback')) {
      return nativeRemoveItem.call(this, ADMIN_PREFIX + key);
    }
    return nativeRemoveItem.call(this, key);
  };
}

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
