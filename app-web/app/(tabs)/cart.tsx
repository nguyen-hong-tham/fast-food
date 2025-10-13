import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import OrderConfirmationModal from "@/components/OrderConfirmationModal";
import { createOrder } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { useCartStore } from "@/store/cart.store";
import cn from "clsx";
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

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
    const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [isOrdering, setIsOrdering] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const deliveryFee = 5.00;
    const discount = 0.50;
    const finalTotal = totalPrice + deliveryFee - discount;

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

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const handleConfirmOrder = async (deliveryInfo: {
        name: string;
        address: string;
        phone: string;
        notes: string;
    }) => {
        try {
            setIsOrdering(true);

            // Prepare order items
            const orderItems = items.map(item => ({
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url,
                customizations: item.customizations || []
            }));

            // Create order with user-provided delivery info
            await createOrder({
                user: user!.$id,
                items: JSON.stringify(orderItems),
                total: finalTotal,
                status: 'pending',
                deliveryAddress: deliveryInfo.address,
                deliveryAddressLabel: 'Custom',
                phone: deliveryInfo.phone,
                notes: deliveryInfo.notes,
                recipientName: deliveryInfo.name, // Commented out - add this attribute to Appwrite orders collection if needed
            });

            // Close modal
            setShowConfirmModal(false);

            // Clear cart
            clearCart();

            // Show success message
            Alert.alert(
                'Order Placed! 🎉',
                'Your order has been placed successfully. You can track it in Order History.',
                [
                    { text: 'View Orders', onPress: () => router.push('/order-history' as any) },
                    { text: 'OK' }
                ]
            );
        } catch (error) {
            console.error('Order error:', error);
            
            // Extract error message
            let errorMessage = 'Failed to place order. Please try again.';
            
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            // Check for specific error types
            if (errorMessage.includes('permission') || errorMessage.includes('Unauthorized')) {
                Alert.alert(
                    'Permission Error ⚠️',
                    'Unable to create order due to permission issues.\n\n' +
                    '📝 To fix this:\n' +
                    '1. Open Appwrite Console\n' +
                    '2. Go to Database → orders collection\n' +
                    '3. Settings → Permissions\n' +
                    '4. Add "Any" role with Create permission\n\n' +
                    'Contact admin if you need help.',
                    [{ text: 'OK' }]
                );
            } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
                Alert.alert(
                    'Network Error 📡',
                    'Unable to connect to server. Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Order Failed ❌',
                    `Failed to place order.\n\nError: ${errorMessage}\n\nPlease try again or contact support.`,
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={items}
                renderItem={({ item }) => <CartItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerClassName="pb-28 px-5 pt-5"
                ListHeaderComponent={() => (
                    <CustomHeader 
                        title="Your Cart" 
                        showBackButton={false} 
                        showSearchButton={false}
                        centered={true}
                    />
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-20">
                        <Text className="text-lg font-semibold text-gray-400 mb-2">
                            Cart Empty
                        </Text>
                        <Text className="text-sm text-gray-300">
                            Add some delicious items to get started!
                        </Text>
                    </View>
                )}
                ListFooterComponent={() => totalItems > 0 && (
                    <View className="gap-5">
                        <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                            <Text className="h3-bold text-dark-100 mb-5">
                                Payment Summary
                            </Text>

                            <PaymentInfoStripe
                                label={`Total Items (${totalItems})`}
                                value={`$${totalPrice.toFixed(2)}`}
                            />
                            <PaymentInfoStripe
                                label={`Delivery Fee`}
                                value={`$${deliveryFee.toFixed(2)}`}
                            />
                            <PaymentInfoStripe
                                label={`Discount`}
                                value={`- $${discount.toFixed(2)}`}
                                valueStyle="!text-success"
                            />
                            <View className="border-t border-gray-300 my-2" />
                            <PaymentInfoStripe
                                label={`Total`}
                                value={`$${finalTotal.toFixed(2)}`}
                                labelStyle="base-bold !text-dark-100"
                                valueStyle="base-bold !text-dark-100 !text-right"
                            />
                        </View>

                        <CustomButton 
                            title="Order Now" 
                            onPress={handleOrderNow}
                            isLoading={isOrdering}
                        />
                    </View>
                )}
            />

            {/* Order Confirmation Modal */}
            {user && (
                <OrderConfirmationModal
                    visible={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmOrder}
                    userName={user.name || ''}
                    userAddress={user.address_home || ''}
                    userPhone={user.phone || ''}
                    totalItems={totalItems}
                    totalPrice={totalPrice}
                    deliveryFee={deliveryFee}
                    discount={discount}
                    finalTotal={finalTotal}
                />
            )}
        </SafeAreaView>
    )
}

export default Cart
