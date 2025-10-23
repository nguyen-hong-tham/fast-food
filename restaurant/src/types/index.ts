export interface User {
  $id: string;
  accountId: string; // Appwrite account ID (used for authentication)
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'restaurant' | 'admin';
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
  logo?: string;
  coverImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  rating?: number;
  totalOrders?: number;
  totalRevenue?: number;
  businessLicense?: string;
  taxCode?: string;
  bankAccount?: string;
  bankName?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  isActive: boolean;
  deliveryRadius?: number;
  openingHours?: string;
  imageUrl?: string;
  totalReviews?: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface MenuItem {
  $id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  image_url?: string;
  calories?: number;
  protein?: number;
  isAvailable: boolean;
  preparationTime?: number;
  rating?: number;
  stock?: number;
  soldCount?: number;
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
