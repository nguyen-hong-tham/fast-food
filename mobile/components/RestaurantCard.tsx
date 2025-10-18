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
      pathname: '/restaurant-detail',
      params: { id: restaurant.$id }
    });
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden"
      style={Platform.OS === 'android' ? { elevation: 3, shadowColor: '#000' } : {}}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      <View className="relative">
        <Image
          source={{ uri: restaurant.coverImage || restaurant.logo || 'https://via.placeholder.com/400x200' }}
          className="w-full h-40"
          resizeMode="cover"
        />
        
        {/* Status Badge */}
        <View className={cn(
          'absolute top-3 right-3 px-3 py-1 rounded-full',
          restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'
        )}>
          <Text className="text-white text-xs font-semibold">
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>

        {/* Logo Overlay */}
        {restaurant.logo && (
          <View className="absolute bottom-0 left-4 transform translate-y-1/2">
            <Image
              source={{ uri: restaurant.logo }}
              className="w-16 h-16 rounded-full border-4 border-white"
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View className="p-4 pt-10">
        <Text className="text-xl font-semibold text-gray-800 mb-1">
          {restaurant.name}
        </Text>
        
        {restaurant.cuisine && (
          <Text className="text-sm text-gray-500 mb-2">
            {restaurant.cuisine}
          </Text>
        )}

        {restaurant.description && (
          <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
            {restaurant.description}
          </Text>
        )}

        {/* Stats Row */}
        <View className="flex-row items-center justify-between">
          {/* Rating */}
          <View className="flex-row items-center">
            <Text className="text-yellow-500 text-base mr-1">★</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {restaurant.rating.toFixed(1)}
            </Text>
            <Text className="text-xs text-gray-500 ml-1">
              ({restaurant.totalOrders}+)
            </Text>
          </View>

          {/* Distance */}
          {restaurant.distance !== undefined && (
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                📍 {restaurant.distance.toFixed(1)} km
              </Text>
            </View>
          )}

          {/* Estimated Time */}
          {restaurant.estimatedTime && (
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                ⏱️ {restaurant.estimatedTime} min
              </Text>
            </View>
          )}
        </View>

        {/* Currently Unavailable Banner */}
        {!restaurant.isActive && (
          <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
            <Text className="text-red-600 text-sm text-center font-medium">
              Currently Unavailable
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantCard;
