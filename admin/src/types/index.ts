import { Models } from 'appwrite';

// ===================== USER =====================

export type UserRole = 'customer' | 'admin' | 'staff';

export interface User extends Models.Document {
  accountId: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address_home?: string;
  address_home_label?: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

// ===================== ORDER =====================

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  customizations?: Array<{
    id: string;
    name: string;
    price: number;
    type: string;
  }>;
}

export interface Order extends Models.Document {
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  deliveryAddress: string;
  deliveryAddressLabel?: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
}

// ===================== MENU =====================

export interface MenuItem extends Models.Document {
  name: string;
  price: number;
  image_url: string;
  description: string;
  calories: number;
  protein: number;
  rating: number;
  type: string;
}

export interface Category extends Models.Document {
  name: string;
  description: string;
}

export interface Customization extends Models.Document {
  name: string;
  price: number;
  type: string;
}

// ===================== DRONE HUB =====================

export interface DroneHub extends Models.Document {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  drones?: Drone[]; // Relationship: one-to-many
}

// ===================== DRONE =====================

export type DroneStatus = 'available' | 'busy' | 'maintenance' | 'offline';

export interface Drone extends Models.Document {
  code: string;
  name: string;
  model?: string;
  assignedOrderId?: string;
  status: DroneStatus;
  batteryLevel: number;
  totalFlights: number;
  currentLatitude?: number;
  currentLongitude?: number;
  maxPayload: number;
  currentPayload: number;
  maxSpeed: number;
  maxRange: number;
  totalDistance: number;
  isActive: boolean;
  homeLatitude?: number; // Hub location cache
  homeLongitude?: number; // Hub location cache
  droneHub?: DroneHub | string; // Relationship to hub
  lastMaintenanceAt?: string;
  nextMaintenanceAt?: string;
}

// ===================== STATS =====================

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  color: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
}
