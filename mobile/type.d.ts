import { ImageSourcePropType } from "react-native";
import { Models } from "react-native-appwrite";

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
  // New fields for Phase 0
  restaurantId?: string;
  isAvailable?: boolean;
  stock?: number;
  soldCount?: number; // Number of times this item has been sold
  categories?: string | Category; // Can be category ID or category object
}

// ===================== CATEGORY =====================

export interface Category extends Models.Document {
  name: string;
  description?: string;
  restaurantId: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateCategoryParams {
  name: string;
  description?: string;
  restaurantId: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryParams {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryWithMenuCount extends Category {
  menuCount: number;
}

// ===================== RESTAURANT =====================

export interface Restaurant extends Models.Document {
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
  operatingHours?: Record<string, { open: string; close: string }>;
  cuisine?: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  businessLicense?: string;
  isActive: boolean;
  deliveryFee?: number;
  minimumOrder?: number;
  estimatedDeliveryTime?: number; // in minutes
  createdAt: string;
  updatedAt?: string;
}

export interface RestaurantFilters {
  cuisine?: string;
  rating?: number;
  distance?: number;
  search?: string;
  sortBy?: 'rating' | 'distance' | 'name' | 'newest';
}

export interface RestaurantWithDistance extends Restaurant {
  distance?: number; // Distance from user in km
  isOpen?: boolean; // Whether restaurant is currently open
  estimatedTime?: number; // Estimated delivery time in minutes
}

// ===================== USER =====================

export type UserRole = 'customer' | 'admin' | 'restaurant' | 'staff';

export interface User extends Models.Document {
  accountId: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address_home?: string;
  address_home_label?: string;
  role?: UserRole;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===================== CART =====================

export interface CartCustomization {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface CartItemType {
  id: string; // menu item id
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurantId: string;
  customizations?: CartCustomization[];
  notes?: string; // Special instructions from customer
}

export interface CartStore {
  items: CartItemType[];
  restaurantId: string | null; // Track which restaurant items are from
  addItem: (item: Omit<CartItemType, "quantity">, restaurantId: string, quantity?: number) => void;
  removeItem: (id: string, customizations: CartCustomization[], notes?: string) => void;
  increaseQty: (id: string, customizations: CartCustomization[], notes?: string) => void;
  decreaseQty: (id: string, customizations: CartCustomization[], notes?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartForCheckout: () => {
    items: CartItemType[];
    restaurantId: string | null;
    totalAmount: number;
    totalItems: number;
  };
}

// ===================== ORDER =====================

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  customizations?: CartCustomization[];
  notes?: string;
}

export interface Order extends Models.Document {
  userId: string;
  restaurantId?: string; // NEW: Phase 0
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "confirmed" 
    | "preparing"
    | "ready"
    | "picked_up" // NEW: Drone picked up from restaurant
    | "delivering"
    | "delivered"
    | "cancelled"; // Updated to match ACTUAL database enum from error message
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'; // NEW: Phase 0
  paymentMethod?: 'cod' | 'vnpay'; // NEW: Phase 0
  droneId?: string; // NEW: Phase 0
  deliveryAddress: string;
  deliveryAddressLabel?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  estimatedDeliveryTime?: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  assignedAt?: string;
}

// ===================== ORDER ITEMS =====================

export interface OrderItemDocument extends Models.Document {
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; // ✅ Thêm imageUrl
  notes?: string; // ✅ Thêm notes
  customizations?: Record<string, any>;
  subtotal: number;
}

// ===================== PAYMENT =====================

export interface Payment extends Models.Document {
  secret: string; // From database schema
  resultCode?: string;
  transactionRef?: string;
  currency: string; // Default: "VND"
  refundReason?: string;
  refundAmount?: number;
  mvrResponse?: string;
  provider: 'vnpay' | 'cod';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  refundCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ===================== VNPAY PAYMENT =====================

export interface VNPayPaymentRequest {
  orderId: string;
  amount: number;
  returnUrl?: string;
  ipAddr?: string;
  orderInfo?: string;
}

export interface VNPayPaymentResponse {
  paymentUrl: string;
  secret: string;
}

export interface VNPayCallbackParams {
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface PaymentMethod {
  id: 'vnpay' | 'cod';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentResult {
  success: boolean;
  method: 'vnpay' | 'cod';
  orderId: string;
  transactionRef?: string;
  amount: number;
  message: string;
}

// ===================== NOTIFICATION =====================

export interface Notification extends Models.Document {
  userId: string;
  type: 'order_update' | 'promotion' | 'system' | 'review_request';
  title: string;
  body: string;
  data?: Record<string, any>;
  status: 'sent' | 'read' | 'failed';
  channel: 'push' | 'email' | 'in_app';
  sentAt: string;
  readAt?: string;
}

// ===================== DRONE HUB =====================

export interface DroneHub extends Models.Document {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
<<<<<<< HEAD
  capacity: number;
  currentDrones: number;
  isActive: boolean;
  createdAt: string;
=======
  drones?: Drone[] | string[]; // Relationship - can be array of IDs or objects
>>>>>>> 9058acf3dafd0cffc4f244a29aad512c2d6200a5
}

// ===================== DRONE =====================

export interface Drone extends Models.Document {
  code: string; // Unique identifier (required)
  name: string; // Required
  model?: string;
  assignedOrderId?: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline'; // Match Appwrite enum
  batteryLevel: number; // 0-100
  totalFlights: number;
  currentLatitude?: number;
  currentLongitude?: number;
  maxPayload: number; // kg
  currentPayload: number; // kg
  maxSpeed: number; // km/h
  maxRange: number; // km
  totalDistance: number; // km
  isActive: boolean;
  homeLatitude?: number; // Home position (from hub)
  homeLongitude?: number;
  droneHub?: DroneHub | string; // Relationship - can be ID or object
  lastMaintenanceAt?: string;
  nextMaintenanceAt?: string;
  createdAt: string;
  droneHub?: string | DroneHub; // Relationship to DroneHub
}

// ===================== DRONE EVENT =====================

export interface DroneEvent extends Models.Document {
  droneId: string;
  orderId?: string;
  eventType: 'takeoff' | 'landing' | 'delivery_start' | 'delivery_complete' | 'battery_low' | 'maintenance' | 'error' | 'position_update'; // Match Appwrite enum
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  batteryLevel?: number;
  payload?: string; // JSON string in Appwrite
  description?: string;
  timestamp: string;
  createdAt?: string;
}

// ===================== PROMOTION =====================

export interface Promotion extends Models.Document {
  code: string; // Promo code
  title: string;
  description?: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  maxUsage: number;
  currentUsage: number;
  startDate: string;
  endDate: string;
  applicableRestaurants?: string[]; // Restaurant IDs or empty for all
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===================== USER VOUCHER =====================

export interface UserVoucher extends Models.Document {
  userId: string;
  promotionId: string;
  status: 'available' | 'used' | 'expired';
  usedAt?: string;
  orderId?: string;
  createdAt: string;
}

// ===================== AUDIT LOG =====================

export interface AuditLog extends Models.Document {
  actorId: string; // User ID who performed action
  action: string; // e.g., 'approve_restaurant', 'update_order_status'
  entity: string; // e.g., 'restaurant', 'order', 'user'
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ===================== UI COMPONENT PROPS =====================

export interface TabBarIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

export interface PaymentInfoStripeProps {
  label: string;
  value: string;
  labelStyle?: string;
  valueStyle?: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomHeaderProps {
  title?: string;
}

export interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad";
}

export interface ProfileFieldProps {
  label: string;
  value: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
}

// ===================== AUTH =====================

export interface UpdateUserParams {
  userId: string;
  name?: string;
  phone?: string;
  address_home?: string;
  address_home_label?: string;
  avatar?: string;
}

// ===================== REVIEWS =====================

export interface Review extends Models.Document {
  userId: string;
  orderId: string;
  restaurantId: string;
  menuItemId?: string; // Optional - for menu item reviews
  
  // Overall rating (required)
  rating?: number; // 1-5 (for menu items)
  overallRating?: number; // 1-5 (for restaurants)
  
  // Detailed ratings (for restaurant reviews)
  foodQuality?: number; // 1-5
  deliverySpeed?: number; // 1-5
  service?: number; // 1-5
  
  // Review content
  comment?: string;
  images?: string[]; // Array of image URLs
  
  // Restaurant response
  reply?: string; // Restaurant's reply (menu item reviews)
  repliedAt?: string;
  restaurantResponse?: string; // Restaurant response (restaurant reviews)
  
  // Metadata
  helpful?: number; // Number of people found this helpful
  isVerifiedPurchase?: boolean;
  isVisible?: boolean; // For restaurant reviews
  status?: 'active' | 'hidden' | 'reported';
  
  // Appwrite auto fields: $id, $createdAt, $updatedAt
}

export interface CreateReviewParams {
  orderId: string;
  menuItemId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface ReviewWithUser extends Review {
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface MenuItemWithReviews extends MenuItem {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface GetMenuParams {
  category?: string;
  query?: string;
}
