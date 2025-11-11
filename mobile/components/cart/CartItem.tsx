import { icons } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import React, { useCallback } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartItem = React.memo(({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty, removeItem } = useCartStore();

    const handleIncrease = useCallback(() => {
        increaseQty(item.id, item.customizations!, item.notes || '');
    }, [item.id, item.customizations, item.notes, increaseQty]);

    const handleDecrease = useCallback(() => {
        decreaseQty(item.id, item.customizations!, item.notes || '');
    }, [item.id, item.customizations, item.notes, decreaseQty]);

    const handleRemove = useCallback(() => {
        removeItem(item.id, item.customizations!, item.notes || '');
    }, [item.id, item.customizations, item.notes, removeItem]);

    return (
        <View className="cart-item">
            <View className="flex flex-row items-center gap-x-3">
                <View className="cart-item__image">
                    <Image
                        source={{ uri: item.image || '' }}
                        className="size-4/5 rounded-lg"
                        resizeMode="cover"
                    />
                </View>

                <View>
                    <Text className="base-bold text-dark-100">{item.name}</Text>
                    <Text className="paragraph-bold text-primary mt-1">
                        {(item.price).toLocaleString('vi-VN')}₫
                    </Text>
                    {item.notes && (
                        <Text className="text-sm text-gray-600 mt-1 italic">
                            Note: {item.notes}
                        </Text>
                    )}

                    <View className="flex flex-row items-center gap-x-4 mt-2">
                        <TouchableOpacity
                            onPress={handleDecrease}
                            className="cart-item__actions"
                        >
                            <Image
                                source={icons.minus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>

                        <Text className="base-bold text-dark-100">{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={handleIncrease}
                            className="cart-item__actions"
                        >
                            <Image
                                source={icons.plus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleRemove}
                className="flex-center"
            >
                <Image source={icons.trash} className="size-5" resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
});

CartItem.displayName = 'CartItem';

export default CartItem;
