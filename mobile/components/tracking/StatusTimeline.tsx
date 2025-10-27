import React from 'react';
import { View, Text } from 'react-native';
import { Order } from '@/type';

const STATUS_SEQUENCE: Order['status'][] = [
  'pending',
  'preparing',
  'ready',
  'delivering',
  'delivered',
];

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed', // Keep for backwards compatibility
  preparing: 'Restaurant Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up', // Keep for backwards compatibility
  delivering: 'Drone Delivering',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

interface StatusTimelineProps {
  current: Order['status'];
  cancelled?: boolean;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ current }) => {
  if (current === 'cancelled') {
    return (
      <View className="items-start">
        <View className="flex-row items-center">
          <View className="mr-3 h-4 w-4 rounded-full border-2 border-red-400 bg-red-400" />
          <Text className="font-quicksand-semibold text-base text-red-500">Order Cancelled</Text>
        </View>
        <Text className="mt-2 text-sm text-gray-500">
          Please contact support if this was unexpected.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-col space-y-6">
      {STATUS_SEQUENCE.map((status, index) => {
        const isCompleted = STATUS_SEQUENCE.indexOf(current) >= index;
        const isActive = current === status;

        return (
          <View key={status} className="flex-row items-start">
            <View className="items-center mr-4">
              <View
                className={`h-4 w-4 rounded-full border-2 ${
                  isCompleted ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                }`}
              />
              {index !== STATUS_SEQUENCE.length - 1 && (
                <View className={`w-[2px] flex-1 ${isCompleted ? 'bg-primary/60' : 'bg-gray-200'}`}>
                  <Text />
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text
                className={`font-quicksand-semibold text-base ${
                  isCompleted ? 'text-dark-100' : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[status]}
              </Text>
              {isActive && (
                <Text className="text-sm text-primary font-quicksand-medium mt-1">
                  In progress...
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default StatusTimeline;
