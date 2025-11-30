import { Account, Client, Databases, Storage } from 'appwrite';

// Appwrite configuration from environment variables
export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '692a85350000a4fc97b3',
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

// Initialize Appwrite Client
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Add localhost as allowed origin for CORS
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🔧 Running on localhost, origin:', window.location.origin);
}

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
