import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import { createOrderWithPayment } from '@/lib/appwrite';
import cn from 'clsx';

const CheckoutScreen = () => {
  const { restaurantId, totalAmount, itemCount } = useLocalSearchParams<{
    restaurantId: string;
    totalAmount: string;
    itemCount: string;
  }>();
  
  const user = useAuthStore((state) => state.user);
  const { items, clearCart } = useCartStore();
  
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address_home || '');
  const [deliveryAddressLabel, setDeliveryAddressLabel] = useState(user?.address_home_label || 'Home');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const total = parseFloat(totalAmount || '0');

  const handleProceedToPayment = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Missing Information', 'Please enter your delivery address.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number.');
      return;
    }

    if (!user || !restaurantId) {
      Alert.alert('Error', 'Missing user or restaurant information.');
      return;
    }

    try {
      setProcessing(true);

      // Create order with "pending" payment status
      const orderData = {
        userId: user.$id,
        restaurantId,
        items: items.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
          customizations: item.customizations
        })),
        total,
        deliveryAddress: deliveryAddress.trim(),
        deliveryAddressLabel: deliveryAddressLabel.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        paymentMethod: 'vnpay' as const // Will be updated after payment selection
      };

      const { order } = await createOrderWithPayment(orderData);

      // Navigate to payment selection with order ID
      router.replace({
        pathname: '/payment-selection' as any,
        params: {
          orderId: order.$id,
          amount: totalAmount,
          restaurantId
        }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Checkout Error',
        'Failed to create order. Please try again.',
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
          <Text className="text-xl font-bold text-gray-800">Checkout</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Order Summary */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-3">Order Summary</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">{itemCount} items</Text>
              <Text className="text-xl font-bold text-amber-600">
                {total.toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <Text className="text-sm text-gray-500">Delivery fee included</Text>
          </View>

          {/* Delivery Information */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-4">Delivery Information</Text>
            
            {/* Address Label */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Address Label</Text>
              <View className="flex-row space-x-2">
                {['Home', 'Work', 'Other'].map((label) => (
                  <TouchableOpacity
                    key={label}
                    className={cn(
                      'px-4 py-2 rounded-lg border',
                      deliveryAddressLabel === label
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-white border-gray-300'
                    )}
                    onPress={() => setDeliveryAddressLabel(label)}
                  >
                    <Text className={cn(
                      'font-semibold',
                      deliveryAddressLabel === label ? 'text-white' : 'text-gray-700'
                    )}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Delivery Address */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Delivery Address *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="Enter your full delivery address"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Phone Number *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Notes */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Special Instructions (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="Add any special instructions for your order..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-3">Contact Information</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Name:</Text>
                <Text className="font-semibold text-gray-800">{user?.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Email:</Text>
                <Text className="font-semibold text-gray-800">{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Delivery Time */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-3">Estimated Delivery</Text>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🚁</Text>
              <View>
                <Text className="font-semibold text-gray-800">Drone Delivery</Text>
                <Text className="text-gray-600">30-45 minutes</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <View className="bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          className={cn(
            'py-4 px-6 rounded-xl',
            processing ? 'bg-gray-400' : 'bg-amber-500'
          )}
          onPress={handleProceedToPayment}
          disabled={processing}
        >
          <Text className="text-white font-bold text-center text-lg">
            {processing ? 'Creating Order...' : `Proceed to Payment • ${total.toLocaleString('vi-VN')}₫`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;