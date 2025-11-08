import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { Restaurant } from '@/type';
import { router } from 'expo-router';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  showBackButton?: boolean;
}

const RestaurantHeader = ({ restaurant, showBackButton = true }: RestaurantHeaderProps) => {


  return (
    <View className="bg-white">
      {/* Cover Image */}
      <View className="relative">
        <Image
          source={{ uri: restaurant.coverImage || restaurant.logo || 'https://via.placeholder.com/400x200' }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            className="absolute top-12 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center"
            onPress={() => router.back()}
            style={Platform.OS === 'android' ? { elevation: 5 } : {}}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
        )}



        {/* Logo */}
        {restaurant.logo && (
          <View className="absolute bottom-0 left-4 transform translate-y-1/2"
            style={Platform.OS === 'android' ? { elevation: 3 } : {}}
          >
            <Image
              source={{ uri: restaurant.logo }}
              className="w-20 h-20 rounded-full border-4 border-white"
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View className="px-4 pt-12 pb-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {restaurant.name}
            </Text>
            {restaurant.cuisine && (
              <Text className="text-base text-gray-500">
                {restaurant.cuisine}
              </Text>
            )}
          </View>
        </View>

        {restaurant.description && (
          <Text className="text-sm text-gray-600 mb-3">
            {restaurant.description}
          </Text>
        )}

        {/* Stats */}
        <View className="flex-row items-center justify-between py-3 border-t border-gray-200">
          {/* Rating */}
          <View className="items-center">
            <View className="flex-row items-center mb-1">
              <Text className="text-yellow-500 text-lg mr-1">★</Text>
              <Text className="text-lg font-bold text-gray-800">
                {restaurant.rating.toFixed(1)}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">Rating</Text>
          </View>

          {/* Orders */}
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {restaurant.totalOrders}+
            </Text>
            <Text className="text-xs text-gray-500">Orders</Text>
          </View>

          {/* Contact */}
          <TouchableOpacity className="items-center">
            <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mb-1">
              <Text className="text-lg">📞</Text>
            </View>
            <Text className="text-xs text-gray-500">Call</Text>
          </TouchableOpacity>
        </View>

        {/* Address */}
        <View className="flex-row items-start mt-3 py-3 border-t border-gray-200">
          <Text className="flex-1 text-sm text-gray-700">
            {restaurant.address}
          </Text>
        </View>

        {/* Currently Unavailable Warning */}
        {restaurant.isActive === false && (
          <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <Text className="text-red-600 text-sm text-center font-medium">
              This restaurant is currently unavailable for orders
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RestaurantHeader;
