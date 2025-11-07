import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import RestaurantRatingInput from '@/components/rating/RestaurantRatingInput';
import CustomHeader from '@/components/common/CustomHeader';

const RateRestaurantScreen = () => {
  const params = useLocalSearchParams();

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader title="Rate Restaurant" showBackButton />

      <RestaurantRatingInput
        orderId={params.orderId as string}
        restaurantId={params.restaurantId as string}
        restaurantName={(params.restaurantName as string) || 'Restaurant'}
        onSuccess={() => {
          console.log('Review submitted successfully');
        }}
      />
    </View>
  );
};

export default RateRestaurantScreen;
