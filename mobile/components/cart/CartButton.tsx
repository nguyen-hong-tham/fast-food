import { icons } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { router } from "expo-router";
import React, { useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View, Platform } from 'react-native';
import cn from 'clsx';

const CartButton = React.memo(() => {
    const { getTotalItems, getCartForCheckout } = useCartStore();
    const totalItems = getTotalItems();
    const [isHovered, setIsHovered] = useState(false);

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
        <TouchableOpacity 
            className={cn(
                "cart-btn transition-all duration-300",
                Platform.OS === 'web' && isHovered && "scale-110"
            )}
            style={Platform.OS === 'web' ? {
                position: 'fixed',
                bottom: 32,
                right: 32,
                boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.2)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            } : undefined}
            onPress={handleCartPress}
            {...(Platform.OS === 'web' && {
                // @ts-ignore
                onMouseEnter: () => setIsHovered(true),
                onMouseLeave: () => setIsHovered(false),
            })}
        >
            <View className={cn(
                "flex-row items-center gap-2",
                Platform.OS === 'web' && isHovered && "gap-3"
            )}>
                <Image source={icons.bag} className="size-5" resizeMode="contain" />

                {totalItems > 0 && (
                    <View className="cart-badge">
                        <Text className="small-bold text-white">{totalItems}</Text>
                    </View>
                )}
                
                {/* Web: Show text on hover */}
                {Platform.OS === 'web' && isHovered && totalItems > 0 && (
                    <Text className="text-white font-bold text-sm">
                        View Cart
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
});

CartButton.displayName = 'CartButton';

export default CartButton
