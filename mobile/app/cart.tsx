import { View, Text, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import { createOrderWithPayment } from '@/lib/appwrite';
import cn from 'clsx';

const CartScreen = () => {
  const { 
    items, 
    restaurantId, 
    getTotalPrice, 
    getTotalItems, 
    increaseQty, 
    decreaseQty, 
    removeItem, 
    clearCart,
    getCartForCheckout 
  } = useCartStore();
  
  const user = useAuthStore((state) => state.user);
  const [processing, setProcessing] = useState(false);

  const total = getTotalPrice();
  const itemCount = getTotalItems();

  const handleQuantityIncrease = (itemId: string, customizations: any[], notes?: string) => {
    increaseQty(itemId, customizations || [], notes);
  };

  const handleQuantityDecrease = (itemId: string, customizations: any[], notes?: string) => {
    decreaseQty(itemId, customizations || [], notes);
  };

  const handleRemoveItem = (itemId: string, customizations: any[], notes?: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeItem(itemId, customizations || [], notes || '')
        }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearCart
        }
      ]
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => router.push('/(auth)/sign-in')
          }
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Error', 'No restaurant selected. Please add items from a restaurant.');
      return;
    }

    try {
      setProcessing(true);

      // Create order with required fields for direct payment
      const orderData = {
        userId: user.$id,
        restaurantId,
        items: items.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
          customizations: item.customizations || [],
          notes: item.notes
        })),
        total,
        deliveryAddress: user.address_home || 'Quick Order',
        phone: user.phone || '0000000000',
        notes: '',
        paymentMethod: 'vnpay' as const // Default to VNPay for quick order
      };

      const { order } = await createOrderWithPayment(orderData);
      
      // Clear cart after successful order creation
      clearCart();
      
      // Navigate directly to payment selection
      router.push({
        pathname: '/payment-selection' as any,
        params: {
          orderId: order.$id,
          amount: total.toString(),
          restaurantId
        }
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getItemSubtotal = (item: any) => {
    const basePrice = item.price * item.quantity;
    const customizationPrice = (item.customizations || []).reduce(
      (sum: number, c: any) => sum + c.price, 0
    ) * item.quantity;
    return basePrice + customizationPrice;
  };

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Cart ({itemCount})</Text>
          </View>
        </View>

        {/* Empty Cart */}
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">🛒</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</Text>
          <Text className="text-gray-600 text-center mb-8">
            Add some delicious items to get started!
          </Text>
          <TouchableOpacity
            className="bg-amber-500 py-3 px-6 rounded-xl"
            onPress={() => router.replace('/(tabs)/home' as any)}
          >
            <Text className="text-white font-semibold text-lg">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Cart ({itemCount})</Text>
          </View>
          <TouchableOpacity onPress={handleClearCart}>
            <Text className="text-red-500 font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Cart Items */}
          <View className="bg-white rounded-xl overflow-hidden mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            {items.map((item, index) => (
              <View key={`${item.id}-${JSON.stringify(item.customizations)}-${item.notes || 'no-notes'}`}>
                <View className="p-4">
                  <View className="flex-row">
                    {/* Item Image */}
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-16 h-16 rounded-lg mr-4"
                      resizeMode="cover"
                    />

                    {/* Item Details */}
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800 text-lg mb-1">
                        {item.name}
                      </Text>
                      
                      {/* Customizations */}
                      {item.customizations && item.customizations.length > 0 && (
                        <View className="mb-2">
                          {item.customizations.map((custom, idx) => (
                            <Text key={idx} className="text-sm text-gray-600">
                              + {custom.name} (+{custom.price.toLocaleString('vi-VN')}₫)
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* Price and Quantity Controls */}
                      <View className="flex-row items-center justify-between">
                        <Text className="text-amber-600 font-bold text-lg">
                          {getItemSubtotal(item).toLocaleString('vi-VN')}₫
                        </Text>

                        {/* Quantity Controls */}
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            className="w-8 h-8 rounded-full border border-gray-300 items-center justify-center"
                            onPress={() => handleQuantityDecrease(item.id, item.customizations || [])}
                          >
                            <Text className="text-gray-600 font-bold">-</Text>
                          </TouchableOpacity>
                          
                          <Text className="mx-4 font-semibold text-lg">{item.quantity}</Text>
                          
                          <TouchableOpacity
                            className="w-8 h-8 rounded-full border border-gray-300 items-center justify-center"
                            onPress={() => handleQuantityIncrease(item.id, item.customizations || [])}
                          >
                            <Text className="text-gray-600 font-bold">+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Remove Button */}
                    <TouchableOpacity
                      className="ml-2 p-2"
                      onPress={() => handleRemoveItem(item.id, item.customizations || [], item.notes)}
                    >
                      <Text className="text-red-500 text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Divider */}
                {index < items.length - 1 && (
                  <View className="h-px bg-gray-200 mx-4" />
                )}
              </View>
            ))}
          </View>

          {/* Order Summary */}
          <View className="bg-white rounded-xl p-4 mb-4"
            style={Platform.OS === 'android' ? { elevation: 2 } : {}}
          >
            <Text className="text-lg font-bold text-gray-800 mb-4">Order Summary</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal ({itemCount} items):</Text>
                <Text className="font-semibold">{total.toLocaleString('vi-VN')}₫</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Delivery Fee:</Text>
                <Text className="font-semibold text-green-600">Free</Text>
              </View>
              
              <View className="h-px bg-gray-200 my-2" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">Total:</Text>
                <Text className="text-xl font-bold text-amber-600">
                  {total.toLocaleString('vi-VN')}₫
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View className="bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          className={cn(
            'py-4 px-6 rounded-xl',
            processing ? 'bg-gray-400' : 'bg-amber-500'
          )}
          onPress={handleCheckout}
          disabled={processing}
        >
          <Text className="text-white font-bold text-center text-lg">
            {processing ? 'Processing...' : `Checkout • ${total.toLocaleString('vi-VN')}₫`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;