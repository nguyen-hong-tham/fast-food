import { icons } from '@/constants';
import { Order } from '@/type';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { hasUserReviewedOrder } from '@/lib/restaurant-reviews';
import useAuthStore from '@/store/auth.store';

interface OrderCardProps {
    order: Order;
}

const STATUS_COLORS = {
    pending: '#FE8C00',
    confirmed: '#FE8C00',
    preparing: '#FE8C00',
    ready: '#2F9B65',
    picked_up: '#1E90FF',
    delivering: '#1E90FF',
    delivered: '#2F9B65',
    completed: '#2F9B65',
    cancelled: '#F14141',
};

const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivering: 'Delivering',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const OrderCard = React.memo(({ order }: OrderCardProps) => {
    const { user } = useAuthStore();
    const [hasReviewed, setHasReviewed] = useState(false);
    const [checkingReview, setCheckingReview] = useState(true);
    
    const statusColor = STATUS_COLORS[order.status];
    const statusLabel = STATUS_LABELS[order.status];
    
    // Check if user has already reviewed this order
    useEffect(() => {
        const checkReview = async () => {
            if (order.status === 'delivered' && user?.$id) {
                try {
                    const reviewed = await hasUserReviewedOrder(user.$id, order.$id);
                    setHasReviewed(reviewed);
                } catch (error) {
                    console.error('Error checking review status:', error);
                }
            }
            setCheckingReview(false);
        };
        
        checkReview();
    }, [order.$id, order.status, user?.$id]);
    
    // Get item count - prefer itemCount field (new orders) over parsing items (old orders)
    const itemCount = useMemo(() => {
        // New orders have itemCount field
        if (order.itemCount && typeof order.itemCount === 'number') {
            return order.itemCount;
        }
        
        // Old orders need to parse items field
        if (!order.items) return 0;
        
        try {
            const items = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : order.items;
            
            if (!Array.isArray(items)) return 0;
            
            return items.reduce((sum: number, item: any) => {
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                return sum + quantity;
            }, 0);
        } catch (error) {
            console.warn('Failed to parse order items:', error);
            return 0;
        }
    }, [order.items, order.itemCount]);
    
    // Format date - use useMemo
    const orderDate = useMemo(() => 
        new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        [order.createdAt]
    );

    const handlePress = useCallback(() => {
        // Navigate to tracking screen for active orders, order-detail for completed/cancelled
        const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering'];
        const shouldShowTracking = activeStatuses.includes(order.status);
        
        if (shouldShowTracking) {
            router.push({
                pathname: '/order-tracking',
                params: { orderId: order.$id }
            });
        } else {
            router.push({
                pathname: '/order-detail',
                params: { orderId: order.$id }
            });
        }
    }, [order.status, order.$id]);

    const handleRateRestaurant = useCallback(async () => {
        if (!user?.$id) {
            Alert.alert('Error', 'You must be logged in to rate');
            return;
        }

        if (hasReviewed) {
            Alert.alert('Already Reviewed', 'You have already reviewed this order');
            return;
        }

        // Navigate to rating screen
        router.push({
            pathname: '/rate-restaurant',
            params: {
                orderId: order.$id,
                restaurantId: order.restaurantId || '',
                restaurantName: 'Restaurant', // TODO: Fetch restaurant name from API
            },
        });
    }, [order.$id, order.restaurantId, user?.$id, hasReviewed]);

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-4 shadow-md shadow-black/10"
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <View>
                    <Text className="paragraph-bold text-dark-100">
                        Order #{order.$id.slice(-6).toUpperCase()}
                    </Text>
                    <Text className="body-regular text-gray-500 mt-1">
                        {orderDate}
                    </Text>
                </View>
                
                <View 
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${statusColor}20` }}
                >
                    <Text 
                        className="body-medium font-quicksand-semibold"
                        style={{ color: statusColor }}
                    >
                        {statusLabel}
                    </Text>
                </View>
            </View>

            {/* Items Summary */}
            <View className="flex-row items-center mb-3">
                <Image
                    source={icons.bag}
                    className="size-5 mr-2"
                    resizeMode="contain"
                    tintColor="#878787"
                />
                <Text className="body-regular text-gray-500">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
                
                {/* Payment Method */}
                {order.paymentMethod && (
                    <>
                        <Text className="body-regular text-gray-400 mx-2">•</Text>
                        <Text className="body-regular text-gray-500">
                            {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Cash on Delivery'}
                        </Text>
                    </>
                )}
            </View>

            {/* Delivery Address */}
            <View className="flex-row items-start mb-3">
                <Image
                    source={icons.location}
                    className="size-5 mr-2 mt-0.5"
                    resizeMode="contain"
                    tintColor="#878787"
                />
                <View className="flex-1">
                    {order.deliveryAddressLabel && (
                        <Text className="body-medium text-dark-100 mb-0.5">
                            {order.deliveryAddressLabel}
                        </Text>
                    )}
                    <Text className="body-regular text-gray-500" numberOfLines={2}>
                        {order.deliveryAddress}
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <Text className="h3-bold text-primary">
                    {order.total.toLocaleString('vi-VN')}₫
                </Text>
                
                <View className="flex-row items-center">
                    <Text className="paragraph-semibold text-primary mr-2">
                        View Details
                    </Text>
                    <Image
                        source={icons.arrowRight}
                        className="size-4"
                        resizeMode="contain"
                        tintColor="#FE8C00"
                    />
                </View>
            </View>

            {/* Rate Restaurant Button - Only show for delivered orders */}
            {order.status === 'delivered' && !checkingReview && (
                <View className="mt-3 pt-3 border-t border-gray-100">
                    <TouchableOpacity
                        className={`rounded-xl py-3 flex-row items-center justify-center ${
                            hasReviewed ? 'bg-amber-500' : 'bg-amber-500'
                        }`}
                        onPress={handleRateRestaurant}
                        disabled={hasReviewed}
                        activeOpacity={0.8}
                    >
                        <Text className={`paragraph-semibold text-white'
                        }`}>
                            {hasReviewed ? 'Already Reviewed' : 'Rate This Restaurant'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;
