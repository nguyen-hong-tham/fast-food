import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import { createOrderWithPayment } from '@/lib/appwrite';
import { getRestaurantById } from '@/lib/api-helpers';
import { useDeliveryCalculation } from '@/hooks/useDeliveryCalculation';
import { icons } from '@/constants';
import cn from 'clsx';

const CheckoutScreen = () => {
  const { 
    restaurantId, 
    totalAmount, 
    itemCount,
    selectedAddress,
    selectedLatitude,
    selectedLongitude 
  } = useLocalSearchParams<{
    restaurantId: string;
    totalAmount: string;
    itemCount: string;
    selectedAddress?: string;
    selectedLatitude?: string;
    selectedLongitude?: string;
  }>();
  
  const user = useAuthStore((state) => state.user);
  const { items, clearCart } = useCartStore();
  
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address_home || '');
  const [deliveryAddressLabel, setDeliveryAddressLabel] = useState(user?.address_home_label || 'Home');
  const [deliveryCoords, setDeliveryCoords] = useState<{lat?: number, lng?: number}>({
    lat: selectedLatitude ? parseFloat(selectedLatitude) : user?.latitude,
    lng: selectedLongitude ? parseFloat(selectedLongitude) : user?.longitude,
  });
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'vnpay' | 'cod'>('vnpay');
  const [processing, setProcessing] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showItems, setShowItems] = useState(false);

  // Update address and coords from location picker or user profile changes
  useEffect(() => {
    if (selectedAddress) {
      setDeliveryAddress(selectedAddress);
    }
    if (selectedLatitude && selectedLongitude) {
      setDeliveryCoords({
        lat: parseFloat(selectedLatitude),
        lng: parseFloat(selectedLongitude),
      });
    }
  }, [selectedAddress, selectedLatitude, selectedLongitude]);
  
  // Update coords when user profile changes (after location picker saves)
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setDeliveryCoords(prev => ({
        lat: prev.lat || user.latitude,
        lng: prev.lng || user.longitude,
      }));
      if (!deliveryAddress && user?.address_home) {
        setDeliveryAddress(user.address_home);
      }
    }
  }, [user?.latitude, user?.longitude, user?.address_home]);

  const subtotal = parseFloat(totalAmount || '0');
  
  // Delivery calculation hook
  const { 
    calculation: deliveryCalc, 
    isCalculating, 
    calculateFromAddress 
  } = useDeliveryCalculation();
  
  // Calculate total with shipping
  const shippingFee = deliveryCalc?.shippingCost || 0;
  const total = subtotal + shippingFee;

  // Fetch restaurant data và tính delivery
  useEffect(() => {
    const fetchRestaurantAndCalculateDelivery = async () => {
      if (!restaurantId) return;

      try {
        // Lấy thông tin restaurant
        const restaurantData = await getRestaurantById(restaurantId);
        setRestaurant(restaurantData);
        
        // Tính delivery nếu có địa chỉ
        if (deliveryAddress && restaurantData?.latitude && restaurantData?.longitude) {
          await calculateFromAddress(
            restaurantData.latitude,
            restaurantData.longitude,
            deliveryAddress
          );
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
      }
    };

    fetchRestaurantAndCalculateDelivery();
  }, [restaurantId, deliveryAddress, calculateFromAddress]);

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

      // Calculate estimated delivery time
      const estimatedDeliveryTime = deliveryCalc 
        ? new Date(Date.now() + deliveryCalc.estimatedTime * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 60 * 1000).toISOString(); // fallback: 30 phút

      // Create order with "pending" payment status
      console.log('📍 Delivery coords for order:', deliveryCoords.lat, deliveryCoords.lng);
      
      // Validate coordinates - use user's coords or default
      const finalLat = deliveryCoords.lat || user?.latitude || 10.762622;
      const finalLng = deliveryCoords.lng || user?.longitude || 106.660172;
      
      if (!finalLat || !finalLng) {
        Alert.alert('Error', 'Cannot determine delivery location. Please set your address.');
        return;
      }
      
      const orderData = {
        userId: user.$id,
        restaurantId,
        items: items.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image || '',
          customizations: item.customizations,
          notes: item.notes
        })),
        total,
        deliveryAddress: deliveryAddress.trim(),
        deliveryAddressLabel: deliveryAddressLabel.trim(),
        // Add delivery coordinates for drone tracking (always valid numbers)
        deliveryLatitude: finalLat,
        deliveryLongitude: finalLng,
        phone: phone.trim(),
        notes: notes.trim(),
        paymentMethod: selectedPaymentMethod,
        status: "pending",
        estimatedDeliveryTime,
      };

      const { order } = await createOrderWithPayment(orderData);

      if (selectedPaymentMethod === 'cod') {
        // For COD, order is complete, navigate to success
        clearCart();
        router.replace({
          pathname: '/payment-result' as any,
          params: {
            success: 'true',
            orderId: order.$id,
            amount: total.toString(),
            method: 'cod'
          }
        });
      } else {
        // For VNPay, treat same as COD - just create order and go to success
        clearCart();
        router.replace({
          pathname: '/payment-result' as any,
          params: {
            success: 'true',
            orderId: order.$id,
            amount: total.toString(),
            method: 'vnpay'
          }
        });
      }

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
          
          {/* Delivery Information Card - Consolidated */}
          {deliveryCalc && (
            <View className="bg-white rounded-xl p-4 mb-4"
              style={Platform.OS === 'android' ? { elevation: 2 } : {}}
            >
              <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Info</Text>
              
              {/* Distance & Time Row */}
              <View className="flex-row justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Distance</Text>
                  <Text className="text-base font-semibold text-gray-800">{deliveryCalc.formattedDistance}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Estimated Time</Text>
                  <Text className="text-base font-semibold text-amber-600">{deliveryCalc.formattedTime}</Text>
                </View>
              </View>

              {/* Breakdown */}
              <View className="bg-amber-50 p-2 rounded-lg">
                <Text className="text-xs text-gray-600">
                  Prep: 15 min + Delivery: {deliveryCalc.deliveryTime} min
                </Text>
              </View>
            </View>
          )}

          {/* Loading Delivery Calculation */}
          {isCalculating && (
            <View className="bg-white rounded-xl p-4 mb-4"
              style={Platform.OS === 'android' ? { elevation: 2 } : {}}
            >
              <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Info</Text>
              <ActivityIndicator size="small" color="#FF7A00" />
              <Text className="text-gray-500 text-center mt-2 text-sm">Calculating delivery...</Text>
            </View>
          )}

          {/* Order Summary - Simplified */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-800">Order Summary</Text>
              <TouchableOpacity onPress={() => setShowItems((s) => !s)}>
                <Text className="text-sm text-primary">{showItems ? 'Hide' : `Show (${itemCount})`}</Text>
              </TouchableOpacity>
            </View>

            {/* Detailed items list (only shown when toggled) */}
            {showItems && (
              <View className="mb-3 pb-3 border-b border-gray-200">
                {items.map((it) => (
                  <View key={`${it.id}-${it.notes || ''}`} className="flex-row items-center mb-2">
                    <Image source={{ uri: it.image || '' }} className="size-10 rounded-lg mr-2 bg-gray-100" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">{it.name} x{it.quantity}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-gray-800">
                      {(it.price * it.quantity).toLocaleString('vi-VN')}₫
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Summary totals */}
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal:</Text>
                <Text className="font-semibold">{subtotal.toLocaleString('vi-VN')}₫</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Shipping Fee:</Text>
                <Text className="font-semibold text-gray-800">
                  {shippingFee.toLocaleString('vi-VN')}₫
                </Text>
              </View>

              <View className="border-t border-gray-200 pt-2 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-gray-800">Total</Text>
                  <Text className="text-xl font-bold text-amber-600">
                    {total.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Delivery Address & Contact - Combined */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-4">Delivery Details</Text>
            
            {/* Delivery Address */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 font-semibold">Address *</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/location-picker?returnScreen=checkout')}
                  className="flex-row items-center px-3 py-1.5 bg-amber-50 rounded-lg"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-xs text-amber-600 font-semibold mr-1">Change</Text>
                  <Image 
                    source={icons.pencil} 
                    className="size-3" 
                    tintColor="#FF6B35"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="Enter your full delivery address"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Phone *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Contact Info Display */}
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-xs text-gray-500 mb-1">Contact Information</Text>
              <Text className="text-sm text-gray-700">{user?.name} • {user?.email}</Text>
            </View>
          </View>

          {/* Notes */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-gray-700 font-semibold mb-2">Special Instructions (Optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholder="Add any special instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Payment Method */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-3">Payment Method</Text>
            
            {/* VNPay Option */}
            <TouchableOpacity
              className={cn(
                'flex-row items-center p-3 rounded-lg border mb-2',
                selectedPaymentMethod === 'vnpay' 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-300 bg-white'
              )}
              onPress={() => setSelectedPaymentMethod('vnpay')}
            >
              <View className={cn(
                'w-5 h-5 rounded-full border-2 mr-3 items-center justify-center',
                selectedPaymentMethod === 'vnpay' 
                  ? 'border-amber-500 bg-amber-500' 
                  : 'border-gray-300'
              )}>
                {selectedPaymentMethod === 'vnpay' && (
                  <View className="w-2 h-2 rounded-full bg-white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">VNPay</Text>
                <Text className="text-xs text-gray-500">Pay instantly with VNPay gateway</Text>
              </View>
            </TouchableOpacity>

            {/* COD Option */}
            <TouchableOpacity
              className={cn(
                'flex-row items-center p-3 rounded-lg border',
                selectedPaymentMethod === 'cod' 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-300 bg-white'
              )}
              onPress={() => setSelectedPaymentMethod('cod')}
            >
              <View className={cn(
                'w-5 h-5 rounded-full border-2 mr-3 items-center justify-center',
                selectedPaymentMethod === 'cod' 
                  ? 'border-amber-500 bg-amber-500' 
                  : 'border-gray-300'
              )}>
                {selectedPaymentMethod === 'cod' && (
                  <View className="w-2 h-2 rounded-full bg-white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">Cash on Delivery</Text>
                <Text className="text-xs text-gray-500">Pay when you receive</Text>
              </View>
            </TouchableOpacity>
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
            {processing 
              ? 'Creating Order...' 
              : selectedPaymentMethod === 'vnpay' 
                ? `Pay with VNPay • ${total.toLocaleString('vi-VN')}₫`
                : `Place Order • ${total.toLocaleString('vi-VN')}₫`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
