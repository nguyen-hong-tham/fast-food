import React from 'react';
import { View, Text } from 'react-native';

export interface DeliveryMapProps {
  restaurant?: { latitude: number; longitude: number } | null;
  customer?: { latitude: number; longitude: number } | null;
  drone?: { latitude: number; longitude: number } | null;
  path?: { latitude: number; longitude: number }[];
  etaMinutes?: number;
}

const DeliveryMapWeb: React.FC<DeliveryMapProps> = ({
  restaurant,
  customer,
  drone,
  path = [],
  etaMinutes,
}) => {
  return (
    <View className="h-64 bg-gray-100 rounded-xl justify-center items-center border border-gray-200">
      <View className="items-center">
        <Text className="text-lg font-semibold text-gray-800 mb-1">Delivery Map</Text>
        <Text className="text-sm text-gray-600 text-center px-4">
          Map view is not available on web. Please use the mobile app for real-time tracking.
        </Text>
        
        {etaMinutes && (
          <View className="mt-4 bg-blue-100 px-3 py-2 rounded-lg">
            <Text className="text-blue-800 font-medium">
              ETA: {etaMinutes} minutes
            </Text>
          </View>
        )}
        
        <View className="mt-3 space-y-1">
          {restaurant && (
            <Text className="text-xs text-gray-500">
              📍 Restaurant: {restaurant.latitude.toFixed(4)}, {restaurant.longitude.toFixed(4)}
            </Text>
          )}
          {customer && (
            <Text className="text-xs text-gray-500">
              🏠 Customer: {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
            </Text>
          )}
          {drone && (
            <Text className="text-xs text-gray-500">
              🚁 Drone: {drone.latitude.toFixed(4)}, {drone.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default DeliveryMapWeb;