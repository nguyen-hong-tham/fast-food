import { MenuItem } from "@/type";
import { router } from "expo-router";
import React, { useCallback, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';

interface MenuCardProps {
    item: MenuItem;
    restaurantId?: string;
}

const MenuCard = React.memo(({ item, restaurantId }: MenuCardProps) => {
    const { $id, image_url, name, price } = item;
    const [adding, setAdding] = useState(false);
    const { addItem } = useCartStore();
    const { user } = useAuthStore();

    const handleViewDetails = useCallback(() => {
        router.push(`/menu-detail?menuId=${$id}&restaurantId=${restaurantId}`);
    }, [$id, restaurantId]);

    const showWebPopup = (type: 'login' | 'success' | 'error', message: string, onConfirm?: () => void) => {
        if (Platform.OS !== 'web') return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;animation:fadeIn 0.2s;';

        // Create popup
        const popup = document.createElement('div');
        popup.style.cssText = 'background:white;border-radius:16px;padding:32px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.3s;';

        if (type === 'login') {
            popup.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:48px;margin-bottom:16px;">🔐</div>
                    <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#111827;">Login Required</h2>
                    <p style="margin:0 0 24px 0;color:#6b7280;font-size:16px;">Please login to add items to cart</p>
                    <div style="display:flex;gap:12px;">
                        <button id="cancelBtn" style="flex:1;padding:12px 24px;border:2px solid #e5e7eb;background:white;color:#374151;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Cancel</button>
                        <button id="loginBtn" style="flex:1;padding:12px 24px;border:none;background:#f59e0b;color:white;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Login</button>
                    </div>
                </div>
            `;
        } else if (type === 'success') {
            popup.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:48px;margin-bottom:16px;">✅</div>
                    <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#111827;">Added to Cart!</h2>
                    <p style="margin:0 0 24px 0;color:#6b7280;font-size:16px;">${message}</p>
                    <div style="display:flex;gap:12px;">
                        <button id="continueBtn" style="flex:1;padding:12px 24px;border:2px solid #e5e7eb;background:white;color:#374151;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Continue Shopping</button>
                        <button id="checkoutBtn" style="flex:1;padding:12px 24px;border:none;background:#f59e0b;color:white;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Go to Cart</button>
                    </div>
                </div>
            `;
        } else {
            popup.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:48px;margin-bottom:16px;">❌</div>
                    <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#111827;">Error</h2>
                    <p style="margin:0 0 24px 0;color:#6b7280;font-size:16px;">${message}</p>
                    <button id="closeBtn" style="width:100%;padding:12px 24px;border:none;background:#f59e0b;color:white;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Close</button>
                </div>
            `;
        }

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);

        // Handle buttons
        const removePopup = () => {
            overlay.style.animation = 'fadeOut 0.2s';
            setTimeout(() => {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
            }, 200);
        };

        if (type === 'login') {
            popup.querySelector('#cancelBtn')?.addEventListener('click', removePopup);
            popup.querySelector('#loginBtn')?.addEventListener('click', () => {
                removePopup();
                router.push('/(auth)/sign-in');
            });
        } else if (type === 'success') {
            popup.querySelector('#continueBtn')?.addEventListener('click', removePopup);
            popup.querySelector('#checkoutBtn')?.addEventListener('click', () => {
                removePopup();
                router.push('/cart');
            });
        } else {
            popup.querySelector('#closeBtn')?.addEventListener('click', removePopup);
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) removePopup();
        });
    };

    const handleQuickAdd = useCallback(async (e: any) => {
        e.stopPropagation();
        
        if (!user) {
            if (Platform.OS === 'web') {
                showWebPopup('login', 'Please login to add items to cart');
            } else {
                Alert.alert(
                    'Login Required',
                    'Please login to add items to cart',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Login', onPress: () => router.push('/(auth)/sign-in') }
                    ]
                );
            }
            return;
        }

        if (!restaurantId) {
            if (Platform.OS === 'web') {
                showWebPopup('error', 'Restaurant information not found');
            } else {
                Alert.alert('Error', 'Restaurant information not found');
            }
            return;
        }

        try {
            setAdding(true);
            
            addItem(
                {
                    id: $id,
                    name,
                    price,
                    image_url,
                    customizations: [],
                },
                restaurantId,
                1
            );

            if (Platform.OS === 'web') {
                showWebPopup('success', `${name} has been added to your cart`);
            } else {
                Alert.alert('Success', 'Item added to cart!');
            }
        } catch (error) {
            if (Platform.OS === 'web') {
                showWebPopup('error', 'Failed to add item to cart');
            } else {
                Alert.alert('Error', 'Failed to add item to cart');
            }
        } finally {
            setAdding(false);
        }
    }, [$id, name, price, image_url, restaurantId, user, addItem]);

    return (
        <View 
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100" 
            style={Platform.OS === 'android' ? { elevation: 3 }: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
            {/* Image Section */}
            <TouchableOpacity onPress={handleViewDetails} activeOpacity={0.9}>
                <View style={{ width: '100%', aspectRatio: 4/3, backgroundColor: '#f3f4f6' }}>
                    <Image 
                        source={{ uri: image_url }} 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            ...(Platform.OS === 'web' ? { objectFit: 'cover' } : {})
                        } as any}
                        resizeMode="cover"
                    />
                </View>
            </TouchableOpacity>

            {/* Content Section */}
            <View style={{ padding: 12 }}>
                {/* Title */}
                <TouchableOpacity onPress={handleViewDetails}>
                    <Text style={{ 
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: 8,
                        lineHeight: 20
                    }} numberOfLines={2}>
                        {name}
                    </Text>
                </TouchableOpacity>

                {/* Price */}
                <Text style={{ 
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: 12
                }}>
                    {price.toLocaleString('vi-VN')}₫
                </Text>

                {/* Two Buttons: View Details + Quick Add */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* View Details Button */}
                    <TouchableOpacity 
                        style={{ 
                            flex: 1,
                            backgroundColor: '#fef3c7',
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={handleViewDetails}
                        activeOpacity={0.7}
                    >
                        <Text style={{ 
                            fontSize: 13, 
                            fontWeight: '600',
                            color: '#d97706'
                        }}>
                            Details
                        </Text>
                    </TouchableOpacity>

                    {/* Quick Add to Cart Button */}
                    <TouchableOpacity 
                        style={{ 
                            backgroundColor: adding ? '#d1d5db' : '#f59e0b',
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 48,
                        }}
                        onPress={handleQuickAdd}
                        activeOpacity={0.7}
                        disabled={adding}
                    >
                        {adding ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={{ 
                                fontSize: 16, 
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                +🛒
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
});

MenuCard.displayName = 'MenuCard';

export default MenuCard