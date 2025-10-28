/**
 * 🚚 DeliveryInfoCard Component
 * Hiển thị thông tin delivery calculation (distance, time, cost)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { DeliveryCalculation } from '@/lib/delivery-calculator';

interface DeliveryInfoCardProps {
  calculation: DeliveryCalculation;
  style?: 'default' | 'compact' | 'detailed';
  showIcons?: boolean;
}

export const DeliveryInfoCard: React.FC<DeliveryInfoCardProps> = ({
  calculation,
  style = 'default',
  showIcons = true,
}) => {
  const icons = showIcons ? {
    distance: '📍',
    time: '⏰',
    cost: '💰',
    prep: '⚡',
  } : {
    distance: '',
    time: '',
    cost: '',
    prep: '',
  };

  if (style === 'compact') {
    return (
      <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600">{icons.distance} {calculation.formattedDistance}</Text>
          <Text className="text-sm text-gray-400 mx-2">•</Text>
          <Text className="text-sm text-primary font-semibold">{icons.time} {calculation.formattedTime}</Text>
        </View>
        <Text className="text-sm font-semibold text-green-600">{calculation.formattedCost}</Text>
      </View>
    );
  }

  if (style === 'detailed') {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-3">{icons.distance} Delivery Information</Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Distance</Text>
            <Text className="font-semibold text-gray-800">{calculation.formattedDistance}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Estimated Time</Text>
            <Text className="font-semibold text-primary">{calculation.formattedTime}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Shipping Fee</Text>
            <Text className="font-semibold text-green-600">{calculation.formattedCost}</Text>
          </View>
          
          <View className="border-t border-gray-200 pt-3 mt-3">
            <Text className="text-xs text-gray-500 text-center">
              {icons.prep} Preparation: 15 min + Delivery: {calculation.deliveryTime} min
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Default style
  return (
    <View className="space-y-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-600">{icons.distance} Distance</Text>
        <Text className="text-sm font-semibold text-gray-800">{calculation.formattedDistance}</Text>
      </View>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-600">{icons.time} Estimated Time</Text>
        <Text className="text-sm font-semibold text-primary">{calculation.formattedTime}</Text>
      </View>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-600">{icons.cost} Shipping Fee</Text>
        <Text className="text-sm font-semibold text-green-600">{calculation.formattedCost}</Text>
      </View>
    </View>
  );
};

/**
 * 📊 DeliveryInfoBadge - Compact badge version
 */
export const DeliveryInfoBadge: React.FC<{ calculation: DeliveryCalculation }> = ({ 
  calculation 
}) => (
  <View className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1 flex-row items-center">
    <Text className="text-xs text-amber-700">
      ⏰ {calculation.formattedTime} • 💰 {calculation.formattedCost}
    </Text>
  </View>
);

/**
 * 🎯 DeliveryInfoSummary - For checkout summary
 */
export const DeliveryInfoSummary: React.FC<{ calculation: DeliveryCalculation }> = ({ 
  calculation 
}) => (
  <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <View className="flex-row items-center justify-between mb-1">
      <Text className="text-sm font-semibold text-blue-800">🚚 Delivery</Text>
      <Text className="text-sm font-bold text-blue-600">{calculation.formattedCost}</Text>
    </View>
    <Text className="text-xs text-blue-600">
      📍 {calculation.formattedDistance} • ⏰ {calculation.formattedTime}
    </Text>
  </View>
);

export default DeliveryInfoCard;