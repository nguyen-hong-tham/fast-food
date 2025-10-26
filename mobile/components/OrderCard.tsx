import { icons } from '@/constants';
import { Order } from '@/type';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
    order: Order;
}

const STATUS_COLORS = {
    pending: '#FE8C00',
    preparing: '#FE8C00',
    ready: '#2F9B65',
    delivering: '#1E90FF',
    completed: '#2F9B65',
    cancelled: '#F14141',
};

const STATUS_LABELS = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    delivering: 'Delivering',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const OrderCard = ({ order }: OrderCardProps) => {
    const statusColor = STATUS_COLORS[order.status];
    const statusLabel = STATUS_LABELS[order.status];
    
    // Parse items from JSON string
    const items = typeof order.items === 'string' 
        ? JSON.parse(order.items) 
        : order.items;
    
    const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    
    // Format date
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const handlePress = () => {
        router.push({
            pathname: '/order-detail',
            params: { orderId: order.$id }
        });
    };

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
        </TouchableOpacity>
    );
};

export default OrderCard;
