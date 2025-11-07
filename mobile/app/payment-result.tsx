import { View, Text, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import cn from 'clsx';

const PaymentResultScreen = () => {
  const { 
    success, 
    method, 
    orderId, 
    amount, 
    message, 
    transactionRef 
  } = useLocalSearchParams<{
    success: string;
    method: 'vnpay' | 'cod';
    orderId: string;
    amount: string;
    message: string;
    transactionRef?: string;
  }>();

  const isSuccess = success === 'true';
  const orderAmount = parseFloat(amount || '0');

  const handleContinue = () => {
    if (isSuccess) {
      // Navigate to order tracking
      router.replace({
        pathname: '/order-tracking' as any,
        params: { orderId }
      });
    } else {
      // Go back to try again
      router.back();
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/restaurants' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        {/* Status Icon */}
        <View className={cn(
          'w-24 h-24 rounded-full items-center justify-center mb-6',
          isSuccess ? 'bg-green-100' : 'bg-red-100'
        )}>
          <Text className="text-4xl">
            {isSuccess ? '✔️' : '❌'}
          </Text>
        </View>

        {/* Status Title */}
        <Text className={cn(
          'text-2xl font-bold text-center mb-3',
          isSuccess ? 'text-green-700' : 'text-red-700'
        )}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </Text>

        {/* Status Message */}
        <Text className="text-gray-600 text-center mb-8 leading-6">
          {message || (isSuccess 
            ? 'Your order has been placed successfully.' 
            : 'There was an issue processing your payment.'
          )}
        </Text>

        {/* Order Details */}
        <View className="bg-white rounded-xl p-6 w-full mb-8"
          style={Platform.OS === 'android' ? { elevation: 2 } : {}}
        >
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Order Details
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Order ID:</Text>
              <Text className="font-semibold text-gray-800">#{orderId}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Payment Method:</Text>
              <Text className="font-semibold text-gray-800 capitalize">
                {method === 'vnpay' ? 'VNPay' : 'Cash on Delivery'}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Amount:</Text>
              <Text className="text-xl font-bold text-amber-600">
                {orderAmount.toLocaleString('vi-VN')}₫
              </Text>
            </View>
            
            {transactionRef && (
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Transaction ID:</Text>
                <Text className="font-mono text-sm text-gray-800">{transactionRef}</Text>
              </View>
            )}
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Status:</Text>
              <View className={cn(
                'px-3 py-1 rounded-full',
                isSuccess ? 'bg-green-100' : 'bg-red-100'
              )}>
                <Text className={cn(
                  'text-sm font-semibold',
                  isSuccess ? 'text-green-700' : 'text-red-700'
                )}>
                  {isSuccess ? 'Confirmed' : 'Failed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Success Content */}
        {isSuccess && (
          <View className="bg-green-50 rounded-xl p-4 w-full mb-8">
            <Text className="text-sm text-green-700 mb-2">
              • Your order is being prepared by the restaurant
            </Text>
            <Text className="text-sm text-green-700 mb-2">
              • You'll receive notifications about order status
            </Text>
            <Text className="text-sm text-green-700">
              • Estimated delivery: 30-45 minutes
            </Text>
          </View>
        )}

        {/* Failed Content */}
        {!isSuccess && (
          <View className="bg-red-50 rounded-xl p-4 w-full mb-8">
            <View className="flex-row items-center mb-2">
              <Text className="font-semibold text-red-800">What to do?</Text>
            </View>
            <Text className="text-sm text-red-700 mb-2">
              • Check your payment method and try again
            </Text>
            <Text className="text-sm text-red-700 mb-2">
              • Contact your bank if using card payment
            </Text>
            <Text className="text-sm text-red-700">
              • Try using Cash on Delivery instead
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            className={cn(
              'py-4 px-6 rounded-xl w-full',
              isSuccess ? 'bg-amber-500' : 'bg-blue-500'
            )}
            onPress={handleContinue}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {isSuccess ? 'Track Your Order' : 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 px-6 rounded-xl w-full border border-gray-300 bg-white"
            onPress={handleGoHome}
          >
            <Text className="text-gray-700 font-semibold text-center text-lg">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <TouchableOpacity className="mt-6">
          <Text className="text-amber-600 text-center text-sm underline">
            Need help? Contact Support
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentResultScreen;
