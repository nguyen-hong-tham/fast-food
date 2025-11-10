import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Restaurant, RestaurantWithDistance } from '@/type';
import { router } from 'expo-router';
import cn from 'clsx';
import { getRestaurantMenuItems } from '@/lib/api-helpers';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
}

const RestaurantCard = React.memo(({ restaurant }: RestaurantCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { location: currentLocation } = useCurrentLocation();
  
  const handlePress = useCallback(() => {
    router.push({
      pathname: '/restaurant-detail' as any,
      params: { id: restaurant.$id }
    });
  }, [restaurant.$id]);

  // Calculate estimated delivery time based on distance
  const estimatedTime = useMemo(() => {
    // If we have restaurant distance (from search results)
    if (restaurant.distance !== undefined) {
      // Base preparation time (15 min) + travel time (3 min per km)
      const baseTime = 15;
      const travelTime = Math.round(restaurant.distance * 3);
      return baseTime + travelTime;
    }
    
    // If we have coordinates and current location, calculate distance
    if (currentLocation && restaurant.latitude && restaurant.longitude) {
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      
      const dLat = toRad(restaurant.latitude - currentLocation.latitude);
      const dLon = toRad(restaurant.longitude - currentLocation.longitude);
      
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(currentLocation.latitude)) *
        Math.cos(toRad(restaurant.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      const baseTime = 15;
      const travelTime = Math.round(distance * 3);
      return baseTime + travelTime;
    }
    
    // Fallback to restaurant's estimated time or default
    return restaurant.estimatedDeliveryTime || 30;
  }, [restaurant.distance, restaurant.latitude, restaurant.longitude, restaurant.estimatedDeliveryTime, currentLocation]);

  // Fetch minimum price from menu items
  useEffect(() => {
    let isMounted = true;
    
    const fetchRestaurantStats = async () => {
      if (isLoadingStats) return; // Prevent duplicate calls
      
      try {
        setIsLoadingStats(true);
        
        // Fetch menu items to get minimum price
        const menuItems = await getRestaurantMenuItems(restaurant.$id);
        
        if (isMounted) {
          if (menuItems && menuItems.length > 0) {
            const prices = menuItems.map((item: any) => item.price).filter((price: number) => price > 0);
            if (prices.length > 0) {
              const min = Math.min(...prices);
              setMinPrice(min);
            } else {
              setMinPrice(null); // No valid prices found
            }
          } else {
            setMinPrice(null); // No menu items, will show N/A
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant stats:', error);
        if (isMounted) {
          setMinPrice(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    fetchRestaurantStats();
    
    return () => {
      isMounted = false;
    };
  }, [restaurant.$id]);



  return (
    <TouchableOpacity
      className={cn(
        "bg-white rounded-xl mb-4 overflow-hidden transition-all duration-300",
        Platform.OS === 'web' && isHovered && "scale-[1.02]"
      )}
      style={Platform.OS === 'android' ? { 
        elevation: isHovered ? 8 : 3, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isHovered ? 4 : 2 },
        shadowOpacity: isHovered ? 0.2 : 0.1,
        shadowRadius: isHovered ? 8 : 4
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isHovered ? 4 : 2 },
        shadowOpacity: isHovered ? 0.2 : 0.1,
        shadowRadius: isHovered ? 8 : 4
      }}
      onPress={handlePress}
      activeOpacity={0.8}
      {...(Platform.OS === 'web' && {
        // @ts-ignore - Web-specific props
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      })}
    >
      {/* Cover Image */}
      <View className="relative">
        <Image
          source={{ 
            uri: restaurant.coverImage || restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop'
          }}
          className="w-full h-48 lg:h-56"
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View className={cn(
          "absolute inset-0",
          isHovered ? "bg-black/30" : "bg-black/20"
        )} />
        
        {/* New Badge - Top Right */}
        {restaurant.totalOrders === 0 && (
          <View className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">NEW</Text>
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
              <Text className="text-sm text-gray-500">
                {typeof restaurant.distance === 'number' 
                  ? `${restaurant.distance.toFixed(1)} km` 
                  : 'Calculating...'
                }
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
            <Text className="text-sm text-gray-600">Estimated time: </Text>
            <Text className="text-sm text-gray-600">
              {`${estimatedTime}-${estimatedTime + 10} min`}
            </Text>
          </View>

          {/* Minimum Price */}
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600">
              Min: {minPrice !== null 
                ? `${minPrice.toLocaleString('vi-VN')}₫` 
                : (restaurant.minimumOrder 
                  ? `${restaurant.minimumOrder.toLocaleString('vi-VN')}₫` 
                  : 'N/A'
                )
              }
            </Text>
          </View>

          {/* Status Indicator */}
          <View className={cn(
            'w-2 h-2 rounded-full',
            restaurant.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
          )} />
        </View>

        {/* Special Status Messages */}
        {restaurant.status === 'pending' && (
          <View className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <Text className="text-yellow-700 text-sm text-center font-medium">
              Approval Pending
            </Text>
          </View>
        )}

        {restaurant.status === 'suspended' && (
          <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
            <Text className="text-red-600 text-sm text-center font-medium">
              Temporarily Suspended
            </Text>
          </View>
        )}

        {restaurant.status === 'inactive' && (
          <View className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
            <Text className="text-gray-600 text-sm text-center font-medium">
              Currently Inactive
            </Text>
          </View>
        )}


      </View>
    </TouchableOpacity>
  );
});

RestaurantCard.displayName = 'RestaurantCard';

export default RestaurantCard;