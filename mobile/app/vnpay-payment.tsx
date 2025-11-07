import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { processVNPayCallback, updateOrderPaymentStatus } from '@/lib/appwrite';
import { useCartStore } from '@/store/cart.store';

const VNPayPaymentScreen = () => {
  const { paymentUrl, orderId, amount, secret } = useLocalSearchParams<{
    paymentUrl: string;
    orderId: string;
    amount: string;
    secret: string;
  }>();
  
  const [processing, setProcessing] = useState(false);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    openPaymentBrowser();
  }, []);

  const openPaymentBrowser = async () => {
    try {
      setProcessing(true);

      if (!paymentUrl) {
        throw new Error('Payment URL not provided');
      }

      // Open VNPay payment in browser
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: '#f59e0b',
        readerMode: false,
        showInRecents: false
      });

      if (result.type === 'dismiss') {
        // User dismissed the browser
        handlePaymentCancel();
      } else if (result.type === 'cancel') {
        // Payment was cancelled
        handlePaymentCancel();
      }

    } catch (error) {
      console.error('Error opening payment browser:', error);
      Alert.alert(
        'Payment Error',
        'Failed to open payment page. Please try again.',
        [
          { text: 'Retry', onPress: openPaymentBrowser },
          { text: 'Cancel', onPress: handlePaymentCancel }
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Payment Cancelled',
      'Your payment was cancelled. Would you like to try again?',
      [
        { 
          text: 'Try Again', 
          onPress: openPaymentBrowser 
        },
        { 
          text: 'Cancel Order', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update payment status in database
      await updateOrderPaymentStatus(orderId, 'paid');
      
      // Clear cart
      clearCart();
      
      // Navigate to success result
      router.replace({
        pathname: '/payment-result' as any,
        params: {
          success: 'true',
          method: 'vnpay',
          orderId,
          amount,
          message: 'Payment completed successfully',
          transactionRef: `VNP${Date.now()}`
        }
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Payment successful but failed to update order status');
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      'Payment Failed',
      'Your payment could not be processed. Please try again.',
      [
        {
          text: 'Try Again',
          onPress: openPaymentBrowser
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">VNPay Payment</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center px-4">
        <View className="items-center">
          {/* VNPay Logo */}
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-6">
            <Text className="text-white text-2xl font-bold">VNP</Text>
          </View>

          <Text className="text-xl font-semibold text-gray-800 mb-2">
            VNPay Payment
          </Text>
          
          <Text className="text-gray-600 text-center mb-6">
            You will be redirected to VNPay to complete your payment securely
          </Text>

          {/* Order Details */}
          <View className="bg-gray-50 rounded-xl p-4 w-full mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Order ID:</Text>
              <Text className="font-semibold text-gray-800">#{orderId}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Amount:</Text>
              <Text className="text-xl font-bold text-amber-600">
                {parseFloat(amount || '0').toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full space-y-3">
            <TouchableOpacity
              className="bg-blue-500 py-4 px-6 rounded-xl w-full"
              onPress={openPaymentBrowser}
              disabled={processing}
            >
              <Text className="text-white font-semibold text-center text-lg">
                {processing ? 'Opening Payment...' : 'Open VNPay Payment'}
              </Text>
            </TouchableOpacity>

            {/* Demo Buttons for Testing */}
            <View className="w-full mt-8">
              <Text className="text-sm text-gray-500 text-center mb-4">
                Demo Controls (For Testing)
              </Text>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-green-500 py-3 px-4 rounded-lg"
                  onPress={handlePaymentSuccess}
                >
                  <Text className="text-white font-semibold text-center">
                    Simulate Success
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-red-500 py-3 px-4 rounded-lg"
                  onPress={handlePaymentFailure}
                >
                  <Text className="text-white font-semibold text-center">
                    Simulate Failure
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View className="mt-8 bg-blue-50 rounded-xl p-4 w-full">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🔒</Text>
            <Text className="font-semibold text-blue-800">Secure Payment</Text>
          </View>
          <Text className="text-sm text-blue-700">
            Your payment is processed securely through VNPay's encrypted gateway.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VNPayPaymentScreen;
