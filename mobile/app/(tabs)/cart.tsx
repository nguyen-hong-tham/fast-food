import CartItem from "@/components/cart/CartItem";
import CustomButton from "@/components/common/CustomButton";
import CustomHeader from "@/components/common/CustomHeader";
import useAuthStore from '@/store/auth.store';
import { useCartStore } from "@/store/cart.store";
import { useDeliveryCalculation } from '@/hooks/useDeliveryCalculation';
import { getRestaurantById } from '@/lib/appwrite';
import cn from "clsx";
import { router } from 'expo-router';
import { Alert, FlatList, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/constants";
import { useEffect, useState } from 'react';

interface PaymentInfoStripeProps {
    label: string;
    value: string;
    labelStyle?: string;
    valueStyle?: string;
}

const PaymentInfoStripe = ({ label,  value,  labelStyle,  valueStyle, }: PaymentInfoStripeProps) => (
    <View className="flex-between flex-row my-1">
        <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
            {label}
        </Text>
        <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
            {value}
        </Text>
    </View>
);

const Cart = () => {
    const { items, getTotalItems, getTotalPrice, clearCart, restaurantId } = useCartStore();
    const { user } = useAuthStore();
    const [restaurant, setRestaurant] = useState<any>(null);

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    // Delivery calculation
    const { 
        calculation: deliveryCalc, 
        isCalculating, 
        calculateFromAddress 
    } = useDeliveryCalculation();

    const deliveryFee = deliveryCalc?.shippingCost || 0;
    const discount = 0; // No discount by default
    const finalTotal = totalPrice + deliveryFee - discount;

    // Fetch restaurant and calculate delivery
    useEffect(() => {
        const fetchRestaurantAndCalculateDelivery = async () => {
            if (!restaurantId || !user?.address_home) return;

            try {
                const restaurantData = await getRestaurantById(restaurantId);
                setRestaurant(restaurantData);
                
                if (restaurantData?.latitude && restaurantData?.longitude) {
                    await calculateFromAddress(
                        restaurantData.latitude,
                        restaurantData.longitude,
                        user.address_home
                    );
                }
            } catch (error) {
                console.error('Failed to fetch restaurant:', error);
            }
        };

        fetchRestaurantAndCalculateDelivery();
    }, [restaurantId, user?.address_home, calculateFromAddress]);

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: () => clearCart()
                }
            ]
        );
    };

    const handleOrderNow = async () => {
        // Check if user is logged in
        if (!user) {
            Alert.alert(
                'Login Required',
                'Please login to place an order.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/(auth)/sign-in') }
                ]
            );
            return;
        }

        // Check if cart is empty
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before ordering.');
            return;
        }

        if (!restaurantId) {
            Alert.alert('Error', 'No restaurant selected. Please add items from a restaurant.');
            return;
        }

        // Navigate to checkout page
        router.push({
            pathname: '/checkout' as any,
            params: {
                restaurantId,
                totalAmount: totalPrice.toString(), // Pass subtotal only
                itemCount: totalItems.toString()
            }
        });
    };

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={items}
                renderItem={({ item }) => <CartItem item={item} />}
                keyExtractor={(item) => `${item.id}-${JSON.stringify(item.customizations)}-${item.notes || 'no-notes'}`}
                contentContainerClassName="pb-28 px-5 pt-5"
                ListHeaderComponent={() => (
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-2xl font-bold text-gray-800">Your Cart</Text>
                            {totalItems > 0 && (
                                <TouchableOpacity onPress={handleClearCart}>
                                    <Text className="text-red-500 font-semibold">Clear All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-20">
                        <Image 
                            source={images.emptyState}
                            className="w-48 h-48 mb-6"
                            resizeMode="contain"
                        />
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                            Your cart is empty
                        </Text>
                        <Text className="text-base text-gray-500 text-center mb-8 px-8">
                            Add some delicious items from our restaurants to get started!
                        </Text>
                        <CustomButton 
                            title="Browse Restaurants" 
                            onPress={() => router.push('/(tabs)/restaurants')}
                        />
                    </View>
                )}
                ListFooterComponent={() => totalItems > 0 && (
                    <View className="gap-5">
                        {/* Continue Shopping */}
                        <TouchableOpacity 
                            className="p-4 flex-row items-center justify-center"
                            onPress={() => router.push('/(tabs)/restaurants')}
                        >
                            <Image source={icons.plus} className="w-5 h-5 mr-2" tintColor="#FF6B35" />
                            <Text className="font-semibold text-primary">Add More Items</Text>
                        </TouchableOpacity>

                        {/* Payment Summary */}
                        <View className="mt-2 border border-gray-200 p-5 rounded-2xl bg-gray-50">
                            <Text className="h3-bold text-dark-100 mb-4">
                                Order Summary
                            </Text>
                            <PaymentInfoStripe
                                label="Distance"
                                value={isCalculating ? 'Calculating...' : `${deliveryCalc?.formattedDistance || 'N/A'}`}
                                
                            />
                            <PaymentInfoStripe
                                label="Estimated Time"
                                value={isCalculating ? 'Calculating...' : `${deliveryCalc?.formattedTime || 'N/A'}`}
                            />

                            <PaymentInfoStripe
                                label={`Subtotal (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`}
                                value={`${totalPrice.toLocaleString('vi-VN')}₫`}
                            />
                            <PaymentInfoStripe
                                label="Delivery Fee"
                                value={isCalculating ? 'Calculating...' : `${deliveryFee.toLocaleString('vi-VN')}₫`}
                            />

                            <View className="border-t border-gray-300 my-3" />
                            <PaymentInfoStripe
                                label="Total"
                                value={`${finalTotal.toLocaleString('vi-VN')}₫`}
                                labelStyle="text-lg font-bold !text-dark-100"
                                valueStyle="text-xl font-bold !text-primary"
                            />
                        </View>

                        <CustomButton 
                            title={`Proceed to Checkout · ${finalTotal.toLocaleString('vi-VN')}₫`}
                            onPress={handleOrderNow}
                        />
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

export default Cart
