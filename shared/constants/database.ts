/**
 * Database Constants
 * Appwrite Database IDs, Collection IDs, and other constants
 */

export const DATABASE_CONFIG = {
  // Database ID
  DATABASE_ID: '68da5e73002cb68e70af', // app
  
  // Collection IDs
  COLLECTIONS: {
    USER: 'user',
    RESTAURANTS: 'restaurants',
    CATEGORIES: 'categories',
    MENU: 'menu',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    PAYMENTS: 'payments',
    DRONES: 'drones',
    DRONE_EVENTS: 'drone_events',
    NOTIFICATIONS: 'notifications',
  },
  
  // Bucket IDs (if using Appwrite Storage)
  BUCKETS: {
    AVATARS: 'avatars',
    RESTAURANT_IMAGES: 'restaurant-images',
    MENU_IMAGES: 'menu-images',
    DOCUMENTS: 'documents', // For business licenses, etc.
  }
} as const;

// Default values
export const DEFAULTS = {
  RESTAURANT: {
    RATING: 0,
    TOTAL_REVENUE: 0,
    TOTAL_ORDERS: 0,
    STATUS: 'pending',
    IS_ACTIVE: false,
  },
  MENU_ITEM: {
    RATING: 0,
    STOCK: 0,
    SOLD_COUNT: 0,
    IS_AVAILABLE: true,
  },
  DRONE: {
    BATTERY_LEVEL: 100,
    TOTAL_FLIGHTS: 0,
    MAX_PAYLOAD: 5,
    CURRENT_PAYLOAD: 0,
    MAX_SPEED: 50,
    MAX_RANGE: 10,
    TOTAL_DISTANCE: 0,
    IS_ACTIVE: true,
    STATUS: 'available',
  },
  ORDER: {
    STATUS: 'pending',
    PAYMENT_STATUS: 'pending',
    PAYMENT_METHOD: 'cod',
  },
  PAYMENT: {
    CURRENCY: 'VND',
    STATUS: 'pending',
  },
  USER: {
    STATUS: 'active',
    ADDRESS_HOME_LABEL: 'Home',
  },
  NOTIFICATION: {
    STATUS: 'pending',
  },
  CATEGORY: {
    DISPLAY_ORDER: 0,
  },
} as const;

// Query limits
export const QUERY_LIMITS = {
  DEFAULT: 25,
  MAX: 100,
  SMALL: 10,
  LARGE: 50,
} as const;

// Order status flow
export const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'delivered',
] as const;

// Restaurant approval flow
export const RESTAURANT_STATUS_FLOW = [
  'pending',
  'approved', // or 'rejected'
  'active', // or 'inactive'
] as const;

// Payment providers
export const PAYMENT_PROVIDERS = {
  COD: 'cod',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  VNPAY: 'vnpay',
} as const;

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  ADMIN: 'admin',
} as const;

// Drone event types
export const DRONE_EVENTS = {
  TAKEOFF: 'takeoff',
  LANDING: 'landing',
  DELIVERY_START: 'delivery_start',
  DELIVERY_COMPLETE: 'delivery_complete',
  BATTERY_LOW: 'battery_low',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_STATUS: 'order_status',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
  DRONE_UPDATE: 'drone_update',
} as const;

// Notification channels
export const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app',
} as const;
