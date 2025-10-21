import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import useAuthStore from '@/store/auth.store';
import { useCartStore } from "@/store/cart.store";
import cn from "clsx";
import { router } from 'expo-router';
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

        // Get restaurant ID from cart store
        const { restaurantId } = useCartStore.getState();
        if (!restaurantId) {
            Alert.alert('Error', 'No restaurant selected. Please add items from a restaurant.');
            return;
        }

        // Navigate to checkout page
        router.push({
            pathname: '/checkout' as any,
            params: {
                restaurantId,
                totalAmount: finalTotal.toString(),
                itemCount: totalItems.toString()
            }
        });
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
                            title="Checkout" 
                            onPress={handleOrderNow}
                        />
                    </View>
                )}
            />


        </SafeAreaView>
    )
}

export default Cart
