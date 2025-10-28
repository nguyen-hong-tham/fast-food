/**
 * 🚚 Delivery Calculator - Tính toán thời gian và phí giao hàng
 * Dựa trên khoảng cách thực tế từ cửa hàng đến khách hàng
 */

import { calculateDistance } from './appwrite';

// Cấu hình delivery
export const DELIVERY_CONFIG = {
  // Thời gian: 1km = 5 phút
  TIME_PER_KM: 5, // minutes
  
  // Phí ship: 6k/1km
  COST_PER_KM: 6000, // VND
  
  // Phí tối thiểu (dưới 1km vẫn tính 1km)
  MIN_DISTANCE: 1, // km
  MIN_COST: 6000, // VND
  MIN_TIME: 5, // minutes
  
  // Thời gian chuẩn bị đơn hàng (cooking time)
  PREPARATION_TIME: 15, // minutes
};

export interface DeliveryCalculation {
  distance: number; // km
  estimatedTime: number; // minutes (total: prep + delivery)
  deliveryTime: number; // minutes (only delivery)
  shippingCost: number; // VND
  formattedDistance: string;
  formattedTime: string;
  formattedCost: string;
}

/**
 * Tính toán delivery dựa trên tọa độ
 * @param restaurantLat Tọa độ latitude nhà hàng
 * @param restaurantLng Tọa độ longitude nhà hàng  
 * @param customerLat Tọa độ latitude khách hàng
 * @param customerLng Tọa độ longitude khách hàng
 * @returns DeliveryCalculation object
 */
export const calculateDelivery = (
  restaurantLat: number,
  restaurantLng: number,
  customerLat: number,
  customerLng: number
): DeliveryCalculation => {
  // Tính khoảng cách (km)
  const rawDistance = calculateDistance(
    restaurantLat,
    restaurantLng,
    customerLat,
    customerLng
  );
  
  // Làm tròn lên 1 chữ số thập phân
  const distance = Math.round(rawDistance * 10) / 10;
  
  // Áp dụng khoảng cách tối thiểu  
  const effectiveDistance = Math.max(distance, DELIVERY_CONFIG.MIN_DISTANCE);
  
  // Tính thời gian giao hàng (chỉ delivery)
  const deliveryTime = Math.max(
    Math.ceil(effectiveDistance * DELIVERY_CONFIG.TIME_PER_KM),
    DELIVERY_CONFIG.MIN_TIME
  );
  
  // Tính tổng thời gian (prep + delivery)
  const estimatedTime = DELIVERY_CONFIG.PREPARATION_TIME + deliveryTime;
  
  // Tính phí ship
  const shippingCost = Math.max(
    Math.ceil(effectiveDistance * DELIVERY_CONFIG.COST_PER_KM),
    DELIVERY_CONFIG.MIN_COST
  );
  
  return {
    distance,
    estimatedTime,
    deliveryTime,
    shippingCost,
    formattedDistance: `${distance} km`,
    formattedTime: `${estimatedTime} phút`,
    formattedCost: formatCurrency(shippingCost),
  };
};

/**
 * Tính delivery với fallback cho trường hợp không có tọa độ
 */
export const calculateDeliveryWithFallback = (
  restaurantLat?: number,
  restaurantLng?: number,
  customerLat?: number,
  customerLng?: number
): DeliveryCalculation => {
  // Nếu thiếu tọa độ, dùng giá trị mặc định
  if (!restaurantLat || !restaurantLng || !customerLat || !customerLng) {
    return {
      distance: DELIVERY_CONFIG.MIN_DISTANCE,
      estimatedTime: DELIVERY_CONFIG.PREPARATION_TIME + DELIVERY_CONFIG.MIN_TIME,
      deliveryTime: DELIVERY_CONFIG.MIN_TIME,
      shippingCost: DELIVERY_CONFIG.MIN_COST,
      formattedDistance: `${DELIVERY_CONFIG.MIN_DISTANCE} km`,
      formattedTime: `${DELIVERY_CONFIG.PREPARATION_TIME + DELIVERY_CONFIG.MIN_TIME} phút`,
      formattedCost: formatCurrency(DELIVERY_CONFIG.MIN_COST),
    };
  }
  
  return calculateDelivery(restaurantLat, restaurantLng, customerLat, customerLng);
};

/**
 * Format tiền tệ VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Tính delivery cho address string (dùng geocoding)
 */
export const calculateDeliveryFromAddress = async (
  restaurantLat: number,
  restaurantLng: number,
  deliveryAddress: string
): Promise<DeliveryCalculation> => {
  try {
    // Import dynamic để tránh circular dependency
    const ExpoLocation = await import('expo-location');
    
    // Geocode address
    const geocoded = await ExpoLocation.geocodeAsync(deliveryAddress);
    
    if (geocoded.length > 0) {
      return calculateDelivery(
        restaurantLat,
        restaurantLng,
        geocoded[0].latitude,
        geocoded[0].longitude
      );
    }
  } catch (error) {
    console.warn('🌍 Geocoding failed for delivery calculation:', error);
  }
  
  // Fallback nếu geocoding fail
  return calculateDeliveryWithFallback(restaurantLat, restaurantLng);
};

/**
 * Hook để dùng trong React components
 */
export interface UseDeliveryCalculation {
  calculation: DeliveryCalculation | null;
  isCalculating: boolean;
  error: string | null;
  calculateFromCoords: (
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number
  ) => void;
  calculateFromAddress: (
    restaurantLat: number,
    restaurantLng: number,
    address: string
  ) => Promise<void>;
}

// Export types và constants sẽ được export ở trên