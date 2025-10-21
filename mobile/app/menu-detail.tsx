import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { getMenuById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { CartCustomization, MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuDetail = () => {
    const { menuId, restaurantId } = useLocalSearchParams<{ menuId: string; restaurantId: string }>();
    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedCustomizations, setSelectedCustomizations] = useState<CartCustomization[]>([]);
    const { addItem } = useCartStore();

    // Mock customizations based on Vietnamese food
    const mockCustomizations: CartCustomization[] = [
        { id: '1', name: 'Extra Rice (Cơm thêm)', price: 5000, type: 'addon' },
        { id: '2', name: 'Extra Meat (Thịt thêm)', price: 15000, type: 'addon' },
        { id: '3', name: 'Extra Vegetables (Rau thêm)', price: 8000, type: 'addon' },
        { id: '4', name: 'Less Spicy (Ít cay)', price: 0, type: 'preference' },
        { id: '5', name: 'No Vegetables (Không rau)', price: 0, type: 'preference' },
        { id: '6', name: 'Extra Fish Sauce (Nước mắm thêm)', price: 2000, type: 'addon' },
    ];

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

    const toggleCustomization = (custom: CartCustomization) => {
        setSelectedCustomizations(prev => {
            const exists = prev.find(c => c.id === custom.id);
            if (exists) {
                return prev.filter(c => c.id !== custom.id);
            } else {
                return [...prev, custom];
            }
        });
    };

    const calculateTotal = () => {
        if (!menuItem) return 0;
        const basePrice = menuItem.price * quantity;
        const customizationPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0) * quantity;
        return basePrice + customizationPrice;
    };

    const handleAddToCart = () => {
        if (!menuItem || !restaurantId) return;

        addItem(
            {
                id: menuItem.$id,
                name: menuItem.name,
                price: menuItem.price,
                image_url: menuItem.image_url,
                customizations: selectedCustomizations
            },
            restaurantId
        );

        Alert.alert(
            'Added to Cart',
            `${quantity}x ${menuItem.name} has been added to your cart`,
            [
                { text: 'Continue Shopping', style: 'default' },
                { 
                    text: 'View Cart', 
                    onPress: () => router.push('/cart' as any)
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

                    {/* Customizations */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">Customizations</Text>
                        {mockCustomizations.map((custom) => (
                            <TouchableOpacity
                                key={custom.id}
                                className={`flex-row items-center justify-between p-3 rounded-lg mb-2 ${
                                    selectedCustomizations.find(c => c.id === custom.id) 
                                        ? 'bg-amber-50 border border-amber-200' 
                                        : 'bg-gray-50'
                                }`}
                                onPress={() => toggleCustomization(custom)}
                            >
                                <View className="flex-1">
                                    <Text className="font-medium text-gray-900">{custom.name}</Text>
                                    <Text className="text-sm text-gray-500">{custom.type}</Text>
                                </View>
                                <Text className="text-amber-600 font-semibold">
                                    {custom.price > 0 ? `+${custom.price.toLocaleString('vi-VN')}₫` : 'Free'}
                                </Text>
                                <View className={`w-5 h-5 rounded-full border-2 ml-3 ${
                                    selectedCustomizations.find(c => c.id === custom.id)
                                        ? 'bg-amber-500 border-amber-500'
                                        : 'border-gray-300'
                                }`}>
                                    {selectedCustomizations.find(c => c.id === custom.id) && (
                                        <Text className="text-white text-xs text-center">✓</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
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
