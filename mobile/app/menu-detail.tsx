import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { icons } from "@/constants";
import { getMenuById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { CartCustomization, MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuDetail = () => {
    const { menuId } = useLocalSearchParams<{ menuId: string }>();
    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedCustomizations, setSelectedCustomizations] = useState<CartCustomization[]>([]);
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
                Alert.alert('Error', 'Failed to load menu item details');
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
        const customizationsPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0) * quantity;
        return basePrice + customizationsPrice;
    };

    const handleAddToCart = () => {
        if (!menuItem) return;

        addItem({
            id: menuItem.$id,
            name: menuItem.name,
            price: menuItem.price,
            image_url: menuItem.image_url,
            quantity,
            customizations: selectedCustomizations
        });

        Alert.alert(
            'Added to Cart!',
            `${quantity}x ${menuItem.name} has been added to your cart.`,
            [
                { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
                { text: 'Continue Shopping', style: 'cancel' }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <CustomHeader title="Menu Details" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FE8C00" />
                    <Text className="paragraph-regular text-gray-500 mt-4">
                        Loading menu details...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!menuItem) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <CustomHeader title="Menu Details" />
                <View className="flex-1 items-center justify-center px-6">
                    <Image
                        source={icons.search}
                        className="size-24 mb-6"
                        resizeMode="contain"
                        tintColor="#D1D5DB"
                    />
                    <Text className="h3-bold text-dark-100 text-center mb-2">
                        Item Not Found
                    </Text>
                    <Text className="paragraph-regular text-gray-500 text-center">
                        This menu item could not be found.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Giả sử có customizations từ backend
    const toppings: CartCustomization[] = [
        { id: '1', name: 'Tomato', price: 0.5, type: 'topping' },
        { id: '2', name: 'Onion', price: 0.3, type: 'topping' },
        { id: '3', name: 'Cheese', price: 1.0, type: 'topping' },
        { id: '4', name: 'Bacon', price: 1.5, type: 'topping' },
    ];

    const sides: CartCustomization[] = [
        { id: '5', name: 'Fries', price: 3.0, type: 'side' },
        { id: '6', name: 'Coleslaw', price: 2.5, type: 'side' },
        { id: '7', name: 'Salad', price: 4.0, type: 'side' },
        { id: '8', name: 'Vinegar', price: 0.5, type: 'side' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <CustomHeader title={menuItem.name} />
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image */}
                <View className="items-center justify-center py-8 bg-gray-50">
                    <Image
                        source={{ uri: menuItem.image_url }}
                        className="w-64 h-64"
                        resizeMode="contain"
                    />
                </View>

                <View className="px-6 pt-6">
                    {/* Title & Price */}
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1 mr-4">
                            <Text className="h3-bold text-dark-100 mb-1">
                                {menuItem.name}
                            </Text>
                            <Text className="body-regular text-gray-500">
                                {menuItem.description}
                            </Text>
                        </View>
                        <Text className="h3-bold text-primary">
                            ${menuItem.price.toFixed(2)}
                        </Text>
                    </View>

                    {/* Rating */}
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={icons.star}
                            className="size-5 mr-1"
                            resizeMode="contain"
                            tintColor="#FE8C00"
                        />
                        <Text className="paragraph-semibold text-dark-100 mr-1">
                            {menuItem.rating}
                        </Text>
                        <Text className="body-regular text-gray-500">
                            / 5
                        </Text>
                    </View>

                    {/* Nutrition Info */}
                    <View className="flex-row items-center gap-x-6 mb-6 pb-6 border-b border-gray-200">
                        <View className="flex-row items-center">
                            <Text className="body-regular text-gray-500 mr-2">Calories:</Text>
                            <Text className="paragraph-semibold text-dark-100">
                                {menuItem.calories} Cal
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="body-regular text-gray-500 mr-2">Protein:</Text>
                            <Text className="paragraph-semibold text-dark-100">
                                {menuItem.protein}g
                            </Text>
                        </View>
                    </View>

                    {/* Toppings */}
                    <View className="mb-6">
                        <Text className="h4-bold text-dark-100 mb-3">Toppings</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {toppings.map((topping) => {
                                const isSelected = selectedCustomizations.some(c => c.id === topping.id);
                                return (
                                    <TouchableOpacity
                                        key={topping.id}
                                        onPress={() => toggleCustomization(topping)}
                                        className={`px-4 py-2 rounded-full border-2 ${
                                            isSelected 
                                                ? 'bg-primary border-primary' 
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`body-medium ${
                                            isSelected ? 'text-white' : 'text-dark-100'
                                        }`}>
                                            {topping.name} {topping.price > 0 ? `+$${topping.price.toFixed(2)}` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Side Options */}
                    <View className="mb-6">
                        <Text className="h4-bold text-dark-100 mb-3">Side options</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {sides.map((side) => {
                                const isSelected = selectedCustomizations.some(c => c.id === side.id);
                                return (
                                    <TouchableOpacity
                                        key={side.id}
                                        onPress={() => toggleCustomization(side)}
                                        className={`px-4 py-2 rounded-full border-2 ${
                                            isSelected 
                                                ? 'bg-primary border-primary' 
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`body-medium ${
                                            isSelected ? 'text-white' : 'text-dark-100'
                                        }`}>
                                            {side.name} +${side.price.toFixed(2)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Quantity */}
                    <View className="flex-row items-center justify-between mb-8">
                        <Text className="h4-bold text-dark-100">Quantity</Text>
                        <View className="flex-row items-center gap-x-4">
                            <TouchableOpacity
                                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Image
                                    source={icons.minus}
                                    className="size-5"
                                    resizeMode="contain"
                                    tintColor="#1A1A1A"
                                />
                            </TouchableOpacity>
                            <Text className="h3-bold text-dark-100 min-w-[40px] text-center">
                                {quantity}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setQuantity(prev => prev + 1)}
                                className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                            >
                                <Image
                                    source={icons.plus}
                                    className="size-5"
                                    resizeMode="contain"
                                    tintColor="#FFFFFF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className="px-6 py-4 bg-white border-t border-gray-200">
                <CustomButton
                    title={`Add to cart ($${calculateTotal().toFixed(2)})`}
                    onPress={handleAddToCart}
                />
            </View>
        </SafeAreaView>
    );
};

export default MenuDetail;
