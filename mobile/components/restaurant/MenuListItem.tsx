import { MenuItem } from "@/type";
import { router } from "expo-router";
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, ActivityIndicator, Alert, ToastAndroid, Platform } from 'react-native';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';

interface MenuListItemProps {
    item: MenuItem;
    restaurantId?: string;
    searchTerm?: string;
}

const MenuListItem = ({ item, restaurantId, searchTerm }: MenuListItemProps) => {
    const { $id, image_url, name, price, description } = item;
    const [adding, setAdding] = useState(false);
    const { addItem, items, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const handleAddToCart = async () => {
        if (!user) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Please login to add items to cart', ToastAndroid.SHORT);
            } else {
                Alert.alert('Authentication Required', 'Please login to add items to cart');
            }
            router.push('/(auth)/sign-in');
            return;
        }

        // Check if cart has items from different restaurant
        if (items.length > 0 && items[0].restaurantId !== restaurantId) {
            Alert.alert(
                'Different Restaurant',
                'Your cart contains items from another restaurant. Do you want to clear your cart and add items from this restaurant?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Clear Cart',
                        style: 'destructive',
                        onPress: async () => {
                            clearCart();
                            await proceedAddToCart();
                        }
                    }
                ]
            );
            return;
        }

        await proceedAddToCart();
    };

    const proceedAddToCart = async () => {
        setAdding(true);
        try {
            addItem({
                id: $id,
                name: name,
                price: price,
                image: image_url || '',
                restaurantId: restaurantId || '',
                customizations: []
            }, restaurantId || '', 1);
            
            if (Platform.OS === 'android') {
                ToastAndroid.show(`✓ ${name} added to cart`, ToastAndroid.SHORT);
            } else {
                Alert.alert('Success', `${name} has been added to your cart`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Failed to add item to cart', ToastAndroid.SHORT);
            } else {
                Alert.alert('Error', 'Failed to add item to cart');
            }
        } finally {
            setAdding(false);
        }
    };

    const handleViewDetails = () => {
        router.push(`/menu-detail?menuId=${$id}&restaurantId=${restaurantId}`);
    };

    // Highlight search term
    const highlightText = (text: string, term?: string) => {
        if (!term || !text) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        const parts = text.split(regex);
        
        return (
            <Text>
                {parts.map((part, index) => 
                    regex.test(part) ? (
                        <Text key={index} style={{ backgroundColor: '#fef08a', fontWeight: '700' }}>
                            {part}
                        </Text>
                    ) : (
                        <Text key={index}>{part}</Text>
                    )
                )}
            </Text>
        );
    };

    return (
        <TouchableOpacity
            onPress={handleViewDetails}
            style={{
                flexDirection: 'row',
                backgroundColor: 'white',
                padding: 12,
                marginBottom: 12,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2
            }}
            activeOpacity={0.7}
        >
            {/* Image */}
            <View style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                backgroundColor: '#f3f4f6',
                overflow: 'hidden',
                marginRight: 12
            }}>
                {image_url ? (
                    <Image
                        source={{ uri: image_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{ 
                        width: '100%', 
                        height: '100%', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <Text style={{ fontSize: 40 }}>🍽️</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                {/* Title & Description */}
                <View>
                    <Text 
                        style={{ 
                            fontSize: 16, 
                            fontWeight: '700', 
                            color: '#111827',
                            marginBottom: 4
                        }}
                        numberOfLines={1}
                    >
                        {searchTerm ? highlightText(name, searchTerm) : name}
                    </Text>
                    
                    {/* Description */}
                    {description && (
                        <Text 
                            style={{ 
                                fontSize: 13, 
                                color: '#6b7280',
                                lineHeight: 18,
                                marginBottom: 8
                            }}
                            numberOfLines={2}
                        >
                            {searchTerm ? highlightText(description, searchTerm) : description}
                        </Text>
                    )}
                </View>

                {/* Price & Add Button */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                }}>
                    <Text style={{ 
                        fontSize: 18, 
                        fontWeight: '800', 
                        color: '#f59e0b'
                    }}>
                        {price.toLocaleString('vi-VN')}₫
                    </Text>
                    
                    <TouchableOpacity
                        onPress={handleAddToCart}
                        disabled={adding}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#f97316',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#f97316',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3
                        }}
                        activeOpacity={0.7}
                    >
                        {adding ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={{ 
                                color: '#000000', 
                                fontSize: 20, 
                                fontWeight: 'bold',
                                lineHeight: 20
                            }}>+</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(MenuListItem);
