import { View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export const LoadingSkeleton = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  className = ''
}: LoadingSkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#E5E7EB',
        opacity,
      }}
      className={className}
    />
  );
};

export const RestaurantCardSkeleton = () => (
  <View className="bg-white rounded-xl p-4 mb-3">
    <View className="flex-row">
      <LoadingSkeleton width={80} height={80} borderRadius={12} />
      <View className="flex-1 ml-3 justify-between py-1">
        <LoadingSkeleton width="70%" height={18} />
        <LoadingSkeleton width="50%" height={14} />
        <View className="flex-row items-center mt-2">
          <LoadingSkeleton width={60} height={14} />
          <View className="ml-3">
            <LoadingSkeleton width={50} height={14} />
          </View>
        </View>
      </View>
    </View>
  </View>
);

export const RestaurantListSkeleton = ({ count = 5 }: { count?: number }) => (
  <View className="px-4">
    {Array.from({ length: count }).map((_, index) => (
      <RestaurantCardSkeleton key={index} />
    ))}
  </View>
);
