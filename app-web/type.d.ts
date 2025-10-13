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
}

// ===================== CATEGORY =====================

export interface Category extends Models.Document {
  name: string;
  description: string;
}

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
  role?: UserRole; // NEW: For admin access control
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
  addItem: (item: Omit<CartItemType, "quantity">) => void;
  removeItem: (id: string, customizations: CartCustomization[]) => void;
  increaseQty: (id: string, customizations: CartCustomization[]) => void;
  decreaseQty: (id: string, customizations: CartCustomization[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
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
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "delivering"
    | "completed"
    | "cancelled";
  deliveryAddress: string;
  deliveryAddressLabel?: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
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
