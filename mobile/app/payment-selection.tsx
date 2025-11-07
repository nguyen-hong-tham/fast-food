import { View, Text, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getPaymentMethods, createVNPayPayment, createCODPayment } from '@/lib/appwrite';
import { PaymentMethod, PaymentResult } from '@/type';
import { useCartStore } from '@/store/cart.store';
import cn from 'clsx';

const PaymentSelectionScreen = () => {
  const { orderId, amount, restaurantId } = useLocalSearchParams<{
    orderId: string;
    amount: string;
    restaurantId: string;
  }>();
  
  const [selectedMethod, setSelectedMethod] = useState<'vnpay' | 'cod' | null>(null);
  const [processing, setProcessing] = useState(false);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const paymentMethods = getPaymentMethods();
  const orderAmount = parseFloat(amount || '0');

  const handlePaymentMethodSelect = (methodId: 'vnpay' | 'cod') => {
    setSelectedMethod(methodId);
  };

  const handleProceedPayment = async () => {
    if (!selectedMethod || !orderId) return;

    try {
      setProcessing(true);

      let result: PaymentResult;

      if (selectedMethod === 'vnpay') {
        // Create VNPay payment
        const vnpayResponse = await createVNPayPayment({
          orderId,
          amount: orderAmount,
          returnUrl: 'foodfast://payment-result',
          orderInfo: `Payment for order ${orderId}`
        });

        // Navigate to VNPay WebView
        router.push({
          pathname: '/vnpay-payment' as any,
          params: {
            paymentUrl: vnpayResponse.paymentUrl,
            orderId,
            amount: amount,
            secret: vnpayResponse.secret
          }
        });
        return;

      } else if (selectedMethod === 'cod') {
        // Create COD payment
        result = await createCODPayment(orderId, orderAmount);
        
        // Clear cart and navigate to success
        clearCart();
        
        router.replace({
          pathname: '/payment-result' as any,
          params: {
            success: 'true',
            method: 'cod',
            orderId,
            amount: amount,
            message: result.message
          }
        });
      }

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        'Failed to process payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Payment Method</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4"
          style={Platform.OS === 'android' ? { elevation: 2 } : {}}
        >
          <Text className="text-lg font-semibold text-gray-800 mb-3">Order Summary</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Order ID:</Text>
            <Text className="font-semibold text-gray-800">#{orderId}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-600">Total Amount:</Text>
            <Text className="text-xl font-bold text-amber-600">
              {orderAmount.toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Choose Payment Method
          </Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={cn(
                'bg-white rounded-xl p-4 mb-3 border-2',
                selectedMethod === method.id 
                  ? 'border-amber-500' 
                  : 'border-gray-200',
                !method.enabled && 'opacity-50'
              )}
              style={Platform.OS === 'android' ? { elevation: 2 } : {}}
              onPress={() => method.enabled && handlePaymentMethodSelect(method.id)}
              disabled={!method.enabled}
            >
              <View className="flex-row items-center">
                {/* Payment Icon */}
                <View className={cn(
                  'w-12 h-12 rounded-full items-center justify-center mr-4',
                  selectedMethod === method.id ? 'bg-amber-100' : 'bg-gray-100'
                )}>
                  <Text className="text-2xl">{method.icon}</Text>
                </View>

                {/* Payment Info */}
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {method.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {method.description}
                  </Text>
                </View>

                {/* Selection Indicator */}
                <View className={cn(
                  'w-6 h-6 rounded-full border-2 items-center justify-center',
                  selectedMethod === method.id 
                    ? 'border-amber-500 bg-amber-500' 
                    : 'border-gray-300'
                )}>
                  {selectedMethod === method.id && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
              </View>

              {/* Special Notes */}
              {method.id === 'vnpay' && selectedMethod === method.id && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-xs text-gray-500">
                    Supports: Visa, MasterCard, JCB, ATM cards, QR Pay, E-wallets
                  </Text>
                </View>
              )}
              
              {method.id === 'cod' && selectedMethod === method.id && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-xs text-gray-500">
                    Pay with cash when your order is delivered
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Note */}
        <View className="mx-4 mt-6 bg-blue-50 rounded-xl p-4">
          <View className="flex-row items-center mb-2">
            <Text className="font-semibold text-blue-800">Secure Payment</Text>
          </View>
          <Text className="text-sm text-blue-700">
            Your payment information is encrypted and secure. We do not store your card details.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View className="h-32" />
      </ScrollView>

      {/* Proceed Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-200">
        <TouchableOpacity
          className={cn(
            'py-4 px-6 rounded-xl flex-row items-center justify-center',
            selectedMethod && !processing
              ? 'bg-amber-500'
              : 'bg-gray-300'
          )}
          onPress={handleProceedPayment}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <Text className="text-white font-semibold text-lg">Processing...</Text>
          ) : (
            <>
              <Text className="text-white font-semibold text-lg mr-2">
                {selectedMethod === 'vnpay' ? 'Pay Now' : 'Place Order'}
              </Text>
              <Text className="text-white text-lg">
                {orderAmount.toLocaleString('vi-VN')}₫
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentSelectionScreen;
