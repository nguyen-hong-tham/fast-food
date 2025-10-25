import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import React from 'react';
import { Restaurant, RestaurantWithDistance } from '@/type';
import { router } from 'expo-router';
import cn from 'clsx';

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const handlePress = () => {
    router.push({
      pathname: '/restaurant-detail' as any,
      params: { id: restaurant.$id }
    });
  };

  // Check if restaurant is currently open
  const isCurrentlyOpen = () => {
    if (!restaurant.operatingHours) return false;
    
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const todayHours = restaurant.operatingHours[currentDay];
    
    if (!todayHours) return false;
    
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const isOpen = restaurant.isActive && isCurrentlyOpen();

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mb-4 overflow-hidden"
      style={Platform.OS === 'android' ? { 
        elevation: 3, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      }}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Cover Image */}
      <View className="relative">
        <Image
          source={{ 
            uri: restaurant.coverImage || restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop'
          }}
          className="w-full h-48"
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-black/20" />
        
        {/* Status Badge */}
        <View className="absolute top-3 right-3">
          <View className={cn(
            'px-3 py-1.5 rounded-full',
            isOpen ? 'bg-green-500' : 'bg-red-500'
          )}>
            <Text className="text-white text-xs font-semibold">
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Delivery Info Badge */}
        {restaurant.deliveryFee !== undefined && (
          <View className="absolute top-3 left-3">
            <View className="bg-black/60 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-medium">
                {restaurant.deliveryFee === 0 ? 'Free Delivery' : `${restaurant.deliveryFee.toLocaleString('vi-VN')}₫`}
              </Text>
            </View>
          </View>
        )}

        {/* Logo */}
        {restaurant.logo && (
          <View className="absolute -bottom-6 left-4">
            <View className="w-12 h-12 rounded-xl bg-white p-1"
              style={Platform.OS === 'android' ? { elevation: 2 } : {}}
            >
              <Image
                source={{ uri: restaurant.logo }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View className="p-4 pt-8">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={1}>
              {restaurant.name}
            </Text>
            
            <View className="flex-row items-center">
              {restaurant.cuisine && (
                <>
                  <Text className="text-sm text-gray-500">
                    {restaurant.cuisine}
                  </Text>
                  <Text className="text-gray-400 mx-2">•</Text>
                </>
              )}
              <Text className="text-sm text-gray-500">
                {restaurant.distance !== undefined ? `${restaurant.distance.toFixed(1)} km` : 'Distance N/A'}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View className="items-end">
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
              <Text className="text-yellow-500 text-sm mr-1">★</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1">
              {restaurant.totalOrders > 0 ? `${restaurant.totalOrders}+ orders` : 'New restaurant'}
            </Text>
          </View>
        </View>

        {/* Description */}
        {restaurant.description && (
          <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
            {restaurant.description}
          </Text>
        )}

        {/* Stats Row */}
        <View className="flex-row items-center justify-between">
          {/* Delivery Time */}
          <View className="flex-row items-center">
            <Text className="text-amber-500 text-base mr-1">🚁</Text>
            <Text className="text-sm text-gray-600">
              {restaurant.estimatedDeliveryTime || restaurant.estimatedTime || 30}-{(restaurant.estimatedDeliveryTime || restaurant.estimatedTime || 30) + 15} min
            </Text>
          </View>

          {/* Minimum Order */}
          {restaurant.minimumOrder && (
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                Min: {restaurant.minimumOrder.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          )}

          {/* Status Indicator */}
          <View className={cn(
            'w-2 h-2 rounded-full',
            restaurant.status === 'active' && isOpen ? 'bg-green-500' : 'bg-gray-400'
          )} />
        </View>

        {/* Special Status Messages */}
        {restaurant.status === 'pending' && (
          <View className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <Text className="text-yellow-700 text-sm text-center font-medium">
              🕐 Approval Pending
            </Text>
          </View>
        )}

        {restaurant.status === 'suspended' && (
          <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
            <Text className="text-red-600 text-sm text-center font-medium">
              ⚠️ Temporarily Suspended
            </Text>
          </View>
        )}

        {restaurant.status === 'inactive' && (
          <View className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
            <Text className="text-gray-600 text-sm text-center font-medium">
              💤 Currently Inactive
            </Text>
          </View>
        )}

        {!isOpen && restaurant.status === 'active' && (
          <View className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-2">
            <Text className="text-orange-600 text-sm text-center font-medium">
              🌙 Closed - Opens tomorrow
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantCard;
