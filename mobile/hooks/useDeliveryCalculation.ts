/**
 * 🪝 useDeliveryCalculation Hook
 * React hook để tính toán thời gian và phí giao hàng
 */

import { useState, useCallback } from 'react';
import { 
  calculateDelivery, 
  calculateDeliveryFromAddress, 
  calculateDeliveryWithFallback,
  DeliveryCalculation 
} from '../lib/delivery-calculator';

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
  reset: () => void;
}

export const useDeliveryCalculation = (): UseDeliveryCalculation => {
  const [calculation, setCalculation] = useState<DeliveryCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFromCoords = useCallback((
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number
  ) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const result = calculateDelivery(
        restaurantLat,
        restaurantLng,
        customerLat,
        customerLng
      );
      
      setCalculation(result);
    } catch (err) {
      setError('Không thể tính toán khoảng cách');
      console.error('🚚 Delivery calculation error:', err);
      
      // Fallback với giá trị mặc định
      const fallback = calculateDeliveryWithFallback();
      setCalculation(fallback);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const calculateFromAddress = useCallback(async (
    restaurantLat: number,
    restaurantLng: number,
    address: string
  ) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const result = await calculateDeliveryFromAddress(
        restaurantLat,
        restaurantLng,
        address
      );
      
      setCalculation(result);
    } catch (err) {
      setError('Không thể tính toán từ địa chỉ');
      console.error('🚚 Address delivery calculation error:', err);
      
      // Fallback với giá trị mặc định
      const fallback = calculateDeliveryWithFallback(restaurantLat, restaurantLng);
      setCalculation(fallback);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCalculation(null);
    setIsCalculating(false);
    setError(null);
  }, []);

  return {
    calculation,
    isCalculating,
    error,
    calculateFromCoords,
    calculateFromAddress,
    reset,
  };
};