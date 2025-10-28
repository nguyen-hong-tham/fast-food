import { icons } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { router } from "expo-router";
import React, { useCallback } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const CartButton = React.memo(() => {
    const { getTotalItems, getCartForCheckout } = useCartStore();
    const totalItems = getTotalItems();

    const handleCartPress = useCallback(() => {
        if (totalItems === 0) {
            // Nếu cart rỗng, có thể show message hoặc không làm gì
            return;
        }

        // 🎯 Leader's Request: Cart button → Checkout directly
        const cartData = getCartForCheckout();
        router.push({
            pathname: '/checkout' as any,
            params: {
                restaurantId: cartData.restaurantId,
                totalAmount: cartData.totalAmount.toString(),
                itemCount: cartData.totalItems.toString()
            }
        });
    }, [totalItems, getCartForCheckout]);

    return (
        <TouchableOpacity className="cart-btn" onPress={handleCartPress}>
            <Image source={icons.bag} className="size-5" resizeMode="contain" />

            {totalItems > 0 && (
                <View className="cart-badge">
                    <Text className="small-bold text-white">{totalItems}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
});

CartButton.displayName = 'CartButton';

export default CartButton
