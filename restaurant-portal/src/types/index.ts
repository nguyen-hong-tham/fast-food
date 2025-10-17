export interface User {
  $id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'restaurant_owner' | 'admin' | 'drone_operator';
  avatar?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Restaurant {
  $id: string;
  name: string;
  ownerId: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  image?: string;
  coverImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  cuisineTypes: string[];
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  deliveryRadius: number; // km
  averageRating?: number;
  totalReviews?: number;
  isActive: boolean;
  businessLicense?: string;
  foodSafetyCert?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface MenuItem {
  $id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // minutes
  tags?: string[];
  $createdAt: string;
  $updatedAt: string;
}

export interface Order {
  $id: string;
  userId: string;
  restaurantId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  paymentMethod: 'cash' | 'vnpay' | 'momo';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  estimatedDeliveryTime?: string;
  droneId?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface OrderItem {
  $id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Payment {
  $id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'vnpay' | 'momo';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  vnpayData?: any;
  $createdAt: string;
  $updatedAt: string;
}

export interface Review {
  $id: string;
  orderId: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment?: string;
  images?: string[];
  $createdAt: string;
  $updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  todayRevenue: number;
  todayOrders: number;
  topSellingItems: Array<{
    itemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Order[];
}
