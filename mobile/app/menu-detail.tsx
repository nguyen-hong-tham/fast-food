import CustomButton from "@/components/common/CustomButton";
import CustomHeader from "@/components/common/CustomHeader";
import { getMenuById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import useAuthStore from "@/store/auth.store";
import { MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast, ConfirmDialog } from "@/components/common/WebNotification";
import { useToast } from "@/hooks/useToast";

// Stable wrapper for desktop centered content to avoid remounting children on each render
const DesktopContentWrapper = ({ children, isDesktop }: { children: React.ReactNode; isDesktop: boolean }) => {
    if (!isDesktop) return <>{children}</>;

    return (
        <View style={{
            maxWidth: 1200,
            marginHorizontal: 'auto' as any,
            width: '100%'
        }}>
            {children}
        </View>
    );
};

const MenuDetail = () => {
    const { menuId, restaurantId } = useLocalSearchParams<{ menuId: string; restaurantId: string }>();
    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState<string>('');
    const { addItem, items, increaseQty, decreaseQty } = useCartStore();
    const { user } = useAuthStore();
    const { toast, showToast, hideToast, dialog, showConfirm, hideConfirm } = useToast();

    const isWeb = Platform.OS === 'web';
    const screenWidth = Dimensions.get('window').width;
    const isDesktop = isWeb && screenWidth > 768;

    // Get existing cart item quantity
    useEffect(() => {
        if (!menuId) return;
        
        const simpleCartItem = items.find(i => 
            i.id === menuId && 
            (!i.customizations || i.customizations.length === 0) &&
            (!i.notes || i.notes === '')
        );
        
        if (simpleCartItem) {
            setQuantity(simpleCartItem.quantity);
            console.log('📦 Found existing item in cart with quantity:', simpleCartItem.quantity);
        }
    }, [menuId, items]);

    useEffect(() => {
        const fetchMenuItem = async () => {
            if (!menuId || typeof menuId !== 'string') return;

            try {
                setLoading(true);
                const item = await getMenuById(menuId);
                setMenuItem(item as unknown as MenuItem);
            } catch (error) {
                console.error('Error fetching menu item:', error);
                if (isWeb) {
                    showToast('Failed to load menu item details. Please try again.', 'error');
                } else {
                    Alert.alert('Error', 'Failed to load menu item details. Please try again.');
                }
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

        // Check if user is logged in
        if (!user) {
            if (isWeb) {
                showConfirm(
                    'Login Required',
                    'Please login to add items to cart.',
                    () => router.push('/(auth)/sign-in'),
                    { confirmText: 'Login', cancelText: 'Cancel' }
                );
            } else {
                Alert.alert(
                    'Login Required',
                    'Please login to add items to cart.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Login', onPress: () => router.push('/(auth)/sign-in') }
                    ]
                );
            }
            return;
        }

        const currentRestaurantId = useCartStore.getState().restaurantId;
        
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
            if (isWeb) {
                showConfirm(
                    'Different Restaurant',
                    'Cart contains items from another restaurant. Do you want to clear cart and add this item?',
                    () => {
                        useCartStore.getState().clearCart();
                        addItemAndShowSuccess();
                    },
                    { confirmText: 'Clear & Add', cancelText: 'Cancel', confirmColor: '#ef4444' }
                );
            } else {
                Alert.alert(
                    'Different Restaurant',
                    'Cart contains items from another restaurant. Do you want to clear cart and add this item?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Clear & Add', 
                            style: 'destructive',
                            onPress: () => {
                                useCartStore.getState().clearCart();
                                addItemAndShowSuccess();
                            }
                        }
                    ]
                );
            }
            return;
        }

        addItemAndShowSuccess();
    };

    const addItemAndShowSuccess = () => {
        if (!menuItem || !restaurantId) return;
        
        // 🔑 KEY FIX: Check if item already exists in cart
        const existingItem = items.find(i => 
            i.id === menuItem.$id && 
            (!i.customizations || i.customizations.length === 0) &&
            (i.notes || '') === (notes.trim() || '')
        );
        
        if (existingItem) {
            // Item đã có trong cart - quantity đã được cập nhật bởi increaseQty/decreaseQty
            // KHÔNG gọi addItem() nữa - chỉ show thông báo thành công
            console.log('✅ Item already in cart with quantity:', existingItem.quantity);
        } else {
            // Item chưa có - thêm mới với quantity hiện tại
            addItem(
                {
                    id: menuItem.$id,
                    name: menuItem.name,
                    price: menuItem.price,
                    image: menuItem.image_url || '',
                    restaurantId: restaurantId,
                    customizations: [],
                    notes: notes.trim() || ''
                },
                restaurantId,
                quantity
            );
        }

        // On web, show custom dialog
        if (isWeb) {
            showToast(`${quantity}x ${menuItem.name} added to cart!`, 'success');
            
            showConfirm(
                'Added to Cart',
                'What would you like to do next?',
                () => {
                    // Checkout Now
                    const cartData = useCartStore.getState().getCartForCheckout();
                    router.push({
                        pathname: '/checkout' as any,
                        params: {
                            restaurantId: cartData.restaurantId,
                            totalAmount: cartData.totalAmount.toString(),
                            itemCount: cartData.totalItems.toString()
                        }
                    });
                },
                { 
                    confirmText: 'Checkout Now', 
                    cancelText: 'Continue Shopping',
                    confirmColor: '#10b981'
                }
            );

            return;
        }

        // Native apps: use Alert with multiple buttons
        Alert.alert(
            'Added to Cart',
            `${quantity}x ${menuItem.name} has been added to cart.\n\nWhat would you like to do next?`,
            [
                { 
                    text: 'Continue Shopping', 
                    style: 'default',
                    onPress: () => {
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
        <SafeAreaView className="flex-1 bg-white" style={{ flex: 1 }}>
            <CustomHeader/>
            
            {/* Toast and Dialog for Web */}
            {isWeb && (
                <>
                    <Toast
                        visible={toast.visible}
                        message={toast.message}
                        type={toast.type}
                        onHide={hideToast}
                    />
                    <ConfirmDialog
                        visible={dialog.visible}
                        title={dialog.title}
                        message={dialog.message}
                        confirmText={dialog.confirmText}
                        cancelText={dialog.cancelText}
                        confirmColor={dialog.confirmColor}
                        onConfirm={dialog.onConfirm}
                        onCancel={hideConfirm}
                    />
                </>
            )}
            
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ flex: 1 }}
            >
                <DesktopContentWrapper isDesktop={isDesktop}>
                    {/* Image Section - Responsive height */}
                    <View style={{
                        position: 'relative',
                        height: isDesktop ? 400 : 256, // Desktop cao hơn
                        backgroundColor: '#f3f4f6'
                    }}>
                        <Image 
                            source={{ uri: menuItem.image_url }} 
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                            resizeMode={isWeb ? 'contain' : 'cover'} // Web dùng contain để không bị cắt
                        />
                        <View style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            backgroundColor: 'white',
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 9999
                        }}>
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
                                style={isWeb ? { outline: 'none' } as any : {}} // Remove blue outline on web
                            />
                            <Text className="text-sm text-gray-400 mt-2">{notes.length}/500 characters</Text>
                        </View>

                        {/* Quantity Selector */}
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-lg font-semibold text-gray-900">Quantity</Text>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
                                    onPress={() => {
                                        const newQty = Math.max(1, quantity - 1);
                                        setQuantity(newQty);
                                        // Sync with cart if item exists
                                        if (menuItem && items.find(i => i.id === menuItem.$id && !i.customizations?.length && !i.notes)) {
                                            decreaseQty(menuItem.$id, [], '');
                                        }
                                    }}
                                    style={isWeb ? { cursor: 'pointer' } as any : {}}
                                >
                                    <Text className="text-lg font-bold text-gray-700">−</Text>
                                </TouchableOpacity>
                                <Text className="mx-4 text-lg font-semibold">{quantity}</Text>
                                <TouchableOpacity
                                    className="w-10 h-10 bg-amber-500 rounded-full items-center justify-center"
                                    onPress={() => {
                                        const newQty = quantity + 1;
                                        setQuantity(newQty);
                                        // Sync with cart if item exists
                                        if (menuItem && items.find(i => i.id === menuItem.$id && !i.customizations?.length && !i.notes)) {
                                            increaseQty(menuItem.$id, [], '');
                                        }
                                    }}
                                    style={isWeb ? { cursor: 'pointer' } as any : {}}
                                >
                                    <Text className="text-lg font-bold text-white">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </DesktopContentWrapper>
                {/* Bottom Section - Inside ScrollView but styled to stick */}
                <View style={isDesktop ? {
                    maxWidth: 1200,
                    marginHorizontal: 'auto' as any,
                    width: '100%'
                } : {}}>
                    <View className="px-6 py-4 border-t border-gray-200 bg-white">
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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MenuDetail;
