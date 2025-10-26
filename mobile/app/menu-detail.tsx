import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { getMenuById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuDetail = () => {
    const { menuId, restaurantId } = useLocalSearchParams<{ menuId: string; restaurantId: string }>();
    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState<string>('');
    const { addItem } = useCartStore();

    useEffect(() => {
        const fetchMenuItem = async () => {
            if (!menuId || typeof menuId !== 'string') return;

            try {
                setLoading(true);
                const item = await getMenuById(menuId);
                setMenuItem(item as unknown as MenuItem);
            } catch (error) {
                console.error('Error fetching menu item:', error);
                Alert.alert('Error', 'Failed to load menu item details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItem();
    }, [menuId]);

    const calculateTotal = () => {
        if (!menuItem) return 0;
        return menuItem.price * quantity;
    };

    const handleAddToCart = () => {
        if (!menuItem || !restaurantId) return;

        // 🚨 Leader's Fix: Check restaurant conflict FIRST
        const currentRestaurantId = useCartStore.getState().restaurantId;
        
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
            // Show restaurant conflict alert IMMEDIATELY
            Alert.alert(
                'Different Restaurant',
                'Cart contains items from another restaurant. Do you want to clear cart and add this item?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Clear & Add', 
                        style: 'destructive',
                        onPress: () => {
                            // Clear cart và add item mới
                            useCartStore.getState().clearCart();
                            addItemAndShowSuccess();
                        }
                    }
                ]
            );
            return; // STOP HERE - không show popup success
        }

        // Nếu không conflict, proceed bình thường
        addItemAndShowSuccess();
    };

    const addItemAndShowSuccess = () => {
        if (!menuItem || !restaurantId) return; // Safety check
        
        // Add item to cart (no conflict check needed)
        addItem(
            {
                id: menuItem.$id,
                name: menuItem.name,
                price: menuItem.price,
                image_url: menuItem.image_url,
                customizations: [],
                notes: notes.trim() || undefined
            },
            restaurantId,
            quantity
        );

        // 🎯 Show success popup với choices
        Alert.alert(
            'Added to Cart',
            `${quantity}x ${menuItem.name} has been added to cart.\n\nWhat would you like to do next?`,
            [
                { 
                    text: 'Continue Shopping', 
                    style: 'default',
                    onPress: () => {
                        // Simply go back to the previous screen (restaurant-detail)
                        router.back();
                    }
                },
                { 
                    text: 'Checkout Now', 
                    style: 'default',
                    onPress: () => {
                        const cartData = useCartStore.getState().getCartForCheckout();
                        router.push({
                            pathname: '/checkout' as any,
                            params: {
                                restaurantId: cartData.restaurantId,
                                totalAmount: cartData.totalAmount.toString(),
                                itemCount: cartData.totalItems.toString()
                            }
                        });
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <CustomHeader title="Menu Detail" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#f59e0b" />
                    <Text className="mt-4 text-gray-600">Loading menu item...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!menuItem) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <CustomHeader title="Menu Detail" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-xl text-gray-600 text-center mb-4">Menu item not found</Text>
                    <TouchableOpacity 
                        className="bg-amber-500 px-6 py-3 rounded-lg"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-semibold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <CustomHeader title={menuItem.name} />
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View className="relative h-64 bg-gray-100">
                    <Image 
                        source={{ uri: menuItem.image_url }} 
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                        <Text className="text-sm font-semibold text-amber-600">
                            ⭐ {menuItem.rating ? menuItem.rating.toFixed(1) : '0.0'}
                        </Text>
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-6 py-4">
                    {/* Title and Price */}
                    <View className="mb-4">
                        <Text className="text-2xl font-bold text-gray-900 mb-2">{menuItem.name}</Text>
                        <Text className="text-xl font-semibold text-amber-600">
                            {menuItem.price.toLocaleString('vi-VN')}₫
                        </Text>
                    </View>

                    {/* Description */}
                    <View className="mb-6">
                        <Text className="text-gray-700 leading-6">{menuItem.description}</Text>
                    </View>

                    {/* Nutrition Info */}
                    <View className="flex-row bg-gray-50 rounded-lg p-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Calories</Text>
                            <Text className="text-lg font-semibold text-gray-900">{menuItem.calories || 'N/A'}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Protein</Text>
                            <Text className="text-lg font-semibold text-gray-900">{menuItem.protein ? `${menuItem.protein}g` : 'N/A'}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Stock</Text>
                            <Text className="text-lg font-semibold text-gray-900">{menuItem.stock ?? 'Unlimited'}</Text>
                        </View>
                    </View>

                    {/* Special Notes */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">Special Notes</Text>
                        <TextInput
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 min-h-[80px]"
                            placeholder="Add special instructions for this item (e.g., extra spicy, no onions, etc.)"
                            placeholderTextColor="#9CA3AF"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text className="text-sm text-gray-400 mt-2">{notes.length}/500 characters</Text>
                    </View>

                    {/* Quantity Selector */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-lg font-semibold text-gray-900">Quantity</Text>
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Text className="text-lg font-bold text-gray-700">−</Text>
                            </TouchableOpacity>
                            <Text className="mx-4 text-lg font-semibold">{quantity}</Text>
                            <TouchableOpacity
                                className="w-10 h-10 bg-amber-500 rounded-full items-center justify-center"
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Text className="text-lg font-bold text-white">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Section */}
            <View className="px-6 py-4 border-t border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-semibold text-gray-900">Total</Text>
                    <Text className="text-xl font-bold text-amber-600">
                        {calculateTotal().toLocaleString('vi-VN')}₫
                    </Text>
                </View>
                
                <CustomButton
                    title={`Add ${quantity} to Cart`}
                    onPress={handleAddToCart}
                />
            </View>
        </SafeAreaView>
    );
};

export default MenuDetail;
