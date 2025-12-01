import CustomHeader from '@/components/common/CustomHeader';
import { icons } from '@/constants';
import { getOrderById, getOrderItems } from '@/lib/appwrite';
import { Order, OrderItem } from '@/type';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_COLORS = {
    pending: '#FE8C00',
    confirmed: '#FE8C00',
    preparing: '#FE8C00',
    ready: '#2F9B65',
    delivering: '#1E90FF',
    delivered: '#2F9B65',
    cancelled: '#F14141',
};

const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivering: 'Delivering',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const OrderDetail = () => {
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || typeof orderId !== 'string') return;

            try {
                setLoading(true);
                const fetchedOrder = await getOrderById(orderId);
                setOrder(fetchedOrder as unknown as Order);
                
                // Fetch order items from orderItems collection
                try {
                    const itemsData = await getOrderItems(orderId);
                    console.log('📦 Order detail - fetched items:', itemsData.length);
                    // Map imageUrl → image_url for compatibility
                    const mappedItems = itemsData.map((doc: any) => ({
                        menuItemId: doc.menuItemId,
                        name: doc.name,
                        price: doc.price,
                        quantity: doc.quantity,
                        image_url: doc.imageUrl || doc.image_url || '',
                        notes: doc.notes,
                        customizations: doc.customizations,
                    }));
                    setOrderItems(mappedItems as OrderItem[]);
                } catch (itemsError) {
                    console.warn('Failed to fetch order items:', itemsError);
                    // Fallback to parsing items from order.items field (for old orders)
                    if (fetchedOrder.items) {
                        try {
                            const parsedItems = typeof fetchedOrder.items === 'string' 
                                ? JSON.parse(fetchedOrder.items) 
                                : fetchedOrder.items;
                            setOrderItems(parsedItems);
                        } catch (parseError) {
                            console.error('Failed to parse order items:', parseError);
                            setOrderItems([]);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleCall = () => {
        if (order?.phone) {
            Linking.openURL(`tel:${order.phone}`);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <CustomHeader title="Order Details" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FE8C00" />
                    <Text className="paragraph-regular text-gray-500 mt-4">
                        Loading order details...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <CustomHeader title="Order Details" />
                <View className="flex-1 items-center justify-center px-6">
                    <Image
                        source={icons.bag}
                        className="size-24 mb-6"
                        resizeMode="contain"
                        tintColor="#D1D5DB"
                    />
                    <Text className="h3-bold text-dark-100 text-center mb-2">
                        Order Not Found
                    </Text>
                    <Text className="paragraph-regular text-gray-500 text-center">
                        This order could not be found or has been deleted.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Use orderItems state instead of parsing from order.items
    const items = orderItems;
    
    const statusColor = STATUS_COLORS[order.status];
    const statusLabel = STATUS_LABELS[order.status];
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <CustomHeader title="Order Details" />
            
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Order ID & Status */}
                <View className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="h3-bold text-dark-100">
                            Order #{order.$id.slice(-6).toUpperCase()}
                        </Text>
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
                    <Text className="body-regular text-gray-500">
                        {orderDate}
                    </Text>
                </View>

                {/* Items */}
                <View className="px-6 py-4 border-b border-gray-100">
                    <Text className="h4-bold text-dark-100 mb-4">Order Items</Text>
                    {items.map((item, index) => (
                        <View 
                            key={`${item.menuItemId}-${index}-${item.quantity}`}
                            className="flex-row mb-4 last:mb-0"
                        >
                            <Image
                                source={{ uri: item.image_url }}
                                className="size-16 rounded-xl bg-gray-100"
                                resizeMode="cover"
                            />
                            <View className="flex-1 ml-3">
                                <View className="flex-row items-start justify-between">
                                    <Text className="paragraph-bold text-dark-100 flex-1 mr-2">
                                        {item.name}
                                    </Text>
                                    <Text className="paragraph-bold text-primary">
                                        {((item.price * item.quantity)).toLocaleString('vi-VN')}₫
                                    </Text>
                                </View>
                                <Text className="body-regular text-gray-500 mt-1">
                                    {(item.price).toLocaleString('vi-VN')}₫ × {item.quantity}
                                </Text>
                                {item.customizations && item.customizations.length > 0 && (
                                    <View className="mt-2">
                                        {item.customizations.map((custom, idx) => (
                                            <Text key={idx} className="body-small text-gray-500">
                                                • {custom.name} ({custom.type}) +{(custom.price * 1000).toLocaleString('vi-VN')}₫
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Delivery Information */}
                <View className="px-6 py-4 border-b border-gray-100">
                    <Text className="h4-bold text-dark-100 mb-4">Delivery Information</Text>
                    
                    {/* Address */}
                    <View className="flex-row items-start mb-4">
                        <Image
                            source={icons.location}
                            className="size-5 mr-3 mt-0.5"
                            resizeMode="contain"
                            tintColor="#FE8C00"
                        />
                        <View className="flex-1">
                            {order.deliveryAddressLabel && (
                                <Text className="paragraph-semibold text-dark-100 mb-1">
                                    {order.deliveryAddressLabel}
                                </Text>
                            )}
                            <Text className="body-regular text-gray-600">
                                {order.deliveryAddress}
                            </Text>
                        </View>
                    </View>

                    {/* Phone */}
                    <TouchableOpacity 
                        className="flex-row items-center mb-4"
                        onPress={handleCall}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={icons.phone}
                            className="size-5 mr-3"
                            resizeMode="contain"
                            tintColor="#FE8C00"
                        />
                        <Text className="body-regular text-primary underline">
                            {order.phone}
                        </Text>
                    </TouchableOpacity>

                    {/* Notes */}
                    {order.notes && (
                        <View className="flex-row items-start">
                            <Image
                                source={icons.pencil}
                                className="size-5 mr-3 mt-0.5"
                                resizeMode="contain"
                                tintColor="#878787"
                            />
                            <View className="flex-1">
                                <Text className="paragraph-semibold text-dark-100 mb-1">
                                    Notes
                                </Text>
                                <Text className="body-regular text-gray-600">
                                    {order.notes}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Payment Information */}
                <View className="px-6 py-4 border-b border-gray-100">
                    <Text className="h4-bold text-dark-100 mb-4">Payment Information</Text>
                    
                    <View className="flex-row items-center">
                        <Image
                            source={icons.dollar}
                            className="size-5 mr-3"
                            resizeMode="contain"
                            tintColor="#FE8C00"
                        />
                        <View className="flex-1">
                            <Text className="paragraph-semibold text-dark-100 mb-1">
                                Payment Method
                            </Text>
                            <Text className="body-regular text-gray-600">
                                {order.paymentMethod === 'vnpay' ? 'VNPay Online Payment' : 'Cash on Delivery (COD)'}
                            </Text>
                        </View>
                        <View 
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: order.paymentMethod === 'vnpay' ? '#1E90FF20' : '#2F9B6520' }}
                        >
                            <Text 
                                className="body-medium font-quicksand-semibold"
                                style={{ color: order.paymentMethod === 'vnpay' ? '#1E90FF' : '#2F9B65' }}
                            >
                                {order.paymentMethod === 'vnpay' ? 'VNPay' : 'COD'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Order Summary */}
                <View className="px-6 py-4">
                    <Text className="h4-bold text-dark-100 mb-4">Order Summary</Text>
                    
                    <View className="space-y-2">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="body-regular text-gray-600">Subtotal</Text>
                            <Text className="paragraph-regular text-dark-100">
                                {order.total.toLocaleString('vi-VN')}₫
                            </Text>
                        </View>
                        
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="body-regular text-gray-600">Delivery Fee</Text>
                            <Text className="paragraph-regular text-dark-100">0₫</Text>
                        </View>

                        <View className="h-px bg-gray-200 my-3" />

                        <View className="flex-row items-center justify-between">
                            <Text className="h4-bold text-dark-100">Total</Text>
                            <Text className="h3-bold text-primary">
                                {order.total.toLocaleString('vi-VN')}₫
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Help Section */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <View className="px-6 py-4 mx-6 bg-orange-50 rounded-xl">
                        <Text className="paragraph-semibold text-dark-100 mb-2">
                            Need Help?
                        </Text>
                        <Text className="body-regular text-gray-600 mb-3">
                            Contact our support team if you have any questions about your order.
                        </Text>
                        <TouchableOpacity 
                            className="bg-primary py-3 rounded-full items-center"
                            activeOpacity={0.8}
                        >
                            <Text className="paragraph-bold text-white">
                                Contact Support
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderDetail;
