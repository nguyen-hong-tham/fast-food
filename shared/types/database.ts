/**
 * Shared Database Types
 * Generated from Appwrite Database Schema
 * Date: 2025-10-19
 * 
 * Use these types across all platforms:
 * - Mobile App (React Native)
 * - Restaurant Portal (Next.js)
 * - Admin Portal (React/Vite)
 */

import { Models } from 'appwrite';

// ============================================
// BASE TYPES & ENUMS
// ============================================

export type UserRole = 'customer' | 'restaurant' | 'admin';
export type UserStatus = 'active' | 'inactive';

export type RestaurantStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivering' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'momo' | 'zalopay' | 'vnpay';
export type PaymentProvider = 'cod' | 'momo' | 'zalopay' | 'vnpay';

export type DroneStatus = 'available' | 'busy' | 'maintenance' | 'offline';

export type DroneEventType = 
  | 'takeoff' 
  | 'landing' 
  | 'delivery_start' 
  | 'delivery_complete' 
  | 'battery_low' 
  | 'maintenance' 
  | 'error';

export type NotificationType = 'order_status' | 'promotion' | 'system' | 'drone_update';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

// ============================================
// COLLECTION INTERFACES
// ============================================

/**
 * User Collection
 * Collection ID: user
 * 
 * Manages all users: customers, restaurant owners, and admins
 */
export interface User extends Models.Document {
  name: string;
  email: string;
  accountId: string; // Link to Appwrite Auth
  avatar?: string | null;
  phone?: string | null;
  address_home?: string | null;
  address_home_label?: string | null;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  
  // Relationships
  restaurants?: Restaurant[]; // One to Many
  orders?: Order[]; // One to Many
}

/**
 * Restaurant Collection
 * Collection ID: restaurants
 * 
 * Restaurant information and business details
 */
export interface Restaurant extends Models.Document {
  name: string;
  description?: string | null;
  address: string;
  phone: string;
  email: string;
  logo?: string | null;
  coverImage?: string | null;
  cuisineType?: string | null;
  businessLicense?: string | null;
  taxCode?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  rejectionReason?: string | null; // NEW: Admin rejection reason
  latitude: number;
  longitude: number;
  rating: number;
  totalRevenue: number;
  totalOrders: number;
  status: RestaurantStatus;
  isActive: boolean;
  approvedAt?: string | null;
  
  // Relationships
  ownerId: string | User; // Many to One → User
  menuItems?: MenuItem[]; // One to Many
  orders?: Order[]; // One to Many
}

/**
 * Category Collection
 * Collection ID: categories
 * 
 * Food categories (Pizza, Burger, Drinks, etc.)
 */
export interface Category extends Models.Document {
  name: string;
  description: string;
  imageUrl?: string | null;
  displayOrder: number;
  
  // Relationships
  menu?: MenuItem[]; // One to Many
}

/**
 * Menu Collection
 * Collection ID: menu
 * 
 * Menu items (simplified - no customizations/toppings)
 */
export interface MenuItem extends Models.Document {
  name: string;
  description: string;
  image_url: string;
  rating: number;
  calories: number;
  protein: number;
  price: number;
  stock: number;
  soldCount: number;
  isAvailable: boolean;
  
  // Relationships
  restaurantId: string | Restaurant; // Many to One → Restaurant
  categoryId?: string | Category; // Many to One → Category
}

/**
 * Order Collection
 * Collection ID: orders
 * 
 * Customer orders
 */
export interface Order extends Models.Document {
  items: string; // JSON string of order items (temporary storage)
  total: number; // NEW: Total order amount
  status: OrderStatus;
  deliveryAddress: string;
  deliveryAddressLabel?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  recipientName?: string | null;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
  assignedAt?: string | null;
  confirmedAt?: string | null;
  preparingAt?: string | null; // Extra timestamp
  readyAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  estimatedDeliveryTime?: string | null;
  
  // Relationships
  userId?: string | User; // Many to One → User
  restaurantId?: string | Restaurant; // Many to One → Restaurant
  droneId?: string | Drone; // Many to One → Drone
  orderItems?: OrderItem[]; // One to Many
  payments?: Payment[]; // One to Many
}

/**
 * Order Item Collection
 * Collection ID: order_items
 * 
 * Individual items in an order
 */
export interface OrderItem extends Models.Document {
  menuItemId: string; // Reference to menu item
  name: string; // Snapshot of item name
  imageUrl?: string | null;
  notes?: string | null;
  price: number; // Price at time of order
  subtotal: number; // price * quantity
  quantity: number;
  
  // Relationships
  orderId: string | Order; // Many to One → Order
}

/**
 * Payment Collection
 * Collection ID: payments
 * 
 * Payment transactions
 */
export interface Payment extends Models.Document {
  userId: string; // User who paid
  transactionId?: string | null; // From payment gateway
  transactionRef?: string | null;
  currency: string;
  failureReason?: string | null;
  refundReason?: string | null;
  rawResponse?: string | null; // Full gateway response
  provider: PaymentProvider;
  method?: string | null;
  status: PaymentStatus;
  amount: number;
  refundAmount?: number | null;
  refundedAt?: string | null;
  
  // Relationships
  orderId?: string | Order; // One to One → Order
}

/**
 * Drone Collection
 * Collection ID: drones
 * 
 * Delivery drones
 */
export interface Drone extends Models.Document {
  code: string; // Unique drone code
  name: string;
  model?: string | null;
  assignedOrderId?: string | null;
  status: DroneStatus;
  batteryLevel: number; // 0-100
  totalFlights: number;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  maxPayload: number; // kg
  currentPayload: number; // kg
  maxSpeed: number; // km/h
  maxRange: number; // km
  totalDistance: number; // km
  isActive: boolean;
  lastMaintenanceAt?: string | null;
  nextMaintenanceAt?: string | null;
  
  // Relationships
  droneEvents?: DroneEvent[]; // One to Many
}

/**
 * Drone Event Collection
 * Collection ID: drone_events
 * 
 * Drone activity logs
 */
export interface DroneEvent extends Models.Document {
  orderId?: string | null;
  payload?: string | null; // JSON data
  description?: string | null;
  eventType: DroneEventType;
  latitude?: number | null;
  longitude?: number | null;
  altitude?: number | null;
  speed?: number | null;
  batteryLevel: number;
  
  // Relationships
  droneId?: string | Drone; // Many to One → Drone
}

/**
 * Notification Collection
 * Collection ID: notifications
 * 
 * User notifications
 */
export interface Notification extends Models.Document {
  userId: string;
  title: string;
  body: string;
  data?: string | null; // JSON data
  imageUrl?: string | null;
  actionUrl?: string | null;
  fcmToken?: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: string | null;
  readAt?: string | null;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Create types (without Appwrite auto-generated fields)
 */
export type CreateUser = Omit<User, keyof Models.Document | 'restaurants' | 'orders'>;
export type CreateRestaurant = Omit<Restaurant, keyof Models.Document | 'menuItems' | 'orders' | 'rating' | 'totalRevenue' | 'totalOrders'>;
export type CreateCategory = Omit<Category, keyof Models.Document | 'menu'>;
export type CreateMenuItem = Omit<MenuItem, keyof Models.Document | 'rating' | 'soldCount'>;
export type CreateOrder = Omit<Order, keyof Models.Document | 'orderItems' | 'payments'>;
export type CreateOrderItem = Omit<OrderItem, keyof Models.Document>;
export type CreatePayment = Omit<Payment, keyof Models.Document>;
export type CreateDrone = Omit<Drone, keyof Models.Document | 'droneEvents' | 'totalFlights' | 'totalDistance'>;
export type CreateDroneEvent = Omit<DroneEvent, keyof Models.Document>;
export type CreateNotification = Omit<Notification, keyof Models.Document>;

/**
 * Update types (partial of create types)
 */
export type UpdateUser = Partial<CreateUser>;
export type UpdateRestaurant = Partial<CreateRestaurant>;
export type UpdateCategory = Partial<CreateCategory>;
export type UpdateMenuItem = Partial<CreateMenuItem>;
export type UpdateOrder = Partial<CreateOrder>;
export type UpdateOrderItem = Partial<CreateOrderItem>;
export type UpdatePayment = Partial<CreatePayment>;
export type UpdateDrone = Partial<CreateDrone>;
export type UpdateDroneEvent = Partial<CreateDroneEvent>;
export type UpdateNotification = Partial<CreateNotification>;

// ============================================
// QUERY RESULT TYPES
// ============================================

/**
 * Populated types (with relationships)
 */
export interface OrderWithDetails extends Order {
  userId: User;
  restaurantId: Restaurant;
  droneId?: Drone;
  orderItems: OrderItem[];
  payments: Payment[];
}

export interface RestaurantWithMenu extends Restaurant {
  ownerId: User;
  menuItems: MenuItem[];
}

export interface MenuItemWithRelations extends MenuItem {
  restaurantId: Restaurant;
  categoryId: Category;
}

// ============================================
// FRONTEND SPECIFIC TYPES
// ============================================

/**
 * Order item for shopping cart (before creating order)
 */
export interface CartItem {
  menuItemId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  notes?: string;
}

/**
 * Order summary for display
 */
export interface OrderSummary {
  orderId: string;
  restaurantName: string;
  restaurantLogo?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

/**
 * Restaurant card for listing
 */
export interface RestaurantCard {
  $id: string;
  name: string;
  logo?: string;
  coverImage?: string;
  cuisineType?: string;
  rating: number;
  isActive: boolean;
  distance?: number; // Calculated from user location
}

/**
 * Drone location for tracking
 */
export interface DroneLocation {
  droneId: string;
  droneName: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  batteryLevel: number;
  status: DroneStatus;
  lastUpdate: string;
}
