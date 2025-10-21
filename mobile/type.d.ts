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
}

// ===================== CATEGORY =====================

export interface Category extends Models.Document {
  name: string;
  description: string;
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
  image_url: string;
  quantity: number;
  customizations?: CartCustomization[];
}

export interface CartStore {
  items: CartItemType[];
  restaurantId: string | null; // Track which restaurant items are from
  addItem: (item: Omit<CartItemType, "quantity">, restaurantId: string) => void;
  removeItem: (id: string, customizations: CartCustomization[]) => void;
  increaseQty: (id: string, customizations: CartCustomization[]) => void;
  decreaseQty: (id: string, customizations: CartCustomization[]) => void;
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
}

export interface Order extends Models.Document {
  userId: string;
  restaurantId?: string; // NEW: Phase 0
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "delivering"
    | "completed"
    | "cancelled";
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'; // NEW: Phase 0
  paymentMethod?: 'cod' | 'vnpay'; // NEW: Phase 0
  droneId?: string; // NEW: Phase 0
  deliveryAddress: string;
  deliveryAddressLabel?: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
}

// ===================== ORDER ITEMS =====================

export interface OrderItemDocument extends Models.Document {
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
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

// ===================== REVIEW =====================

export interface Review extends Models.Document {
  userId: string;
  restaurantId: string;
  orderId: string;
  overallRating: number; // 1-5
  foodQuality?: number; // 1-5
  deliverySpeed?: number; // 1-5
  service?: number; // 1-5
  comment?: string;
  images?: string[];
  isVisible: boolean;
  restaurantResponse?: string;
  createdAt: string;
  updatedAt?: string;
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

// ===================== DRONE =====================

export interface Drone extends Models.Document {
  code: string; // Unique identifier
  name: string;
  model: string;
  status: 'idle' | 'delivering' | 'maintenance' | 'charging' | 'offline';
  batteryLevel: number; // 0-100
  currentLat?: number;
  currentLng?: number;
  maxPayload: number; // kg
  maxRange: number; // km
  assignedOrderId?: string;
  lastMaintenanceAt?: string;
  totalFlights: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===================== DRONE EVENT =====================

export interface DroneEvent extends Models.Document {
  droneId: string;
  orderId?: string;
  eventType: 'takeoff' | 'landing' | 'position_update' | 'battery_low' | 'error' | 'maintenance';
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  batteryLevel?: number;
  message?: string;
  timestamp: string;
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
