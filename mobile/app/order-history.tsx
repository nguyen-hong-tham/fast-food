import CustomHeader from '@/components/common/CustomHeader';
import OrderCard from '@/components/common/OrderCard';
import { icons } from '@/constants';
import { getUserOrders } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { Order } from '@/type';
import { useFocusEffect } from '@react-navigation/native';
import cn from 'clsx';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORDER_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'delivering', label: 'Delivering' },
    { id: 'delivered', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
];

const OrderHistory = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const fetchOrders = async () => {
        if (!user?.$id) return;

        try {
            setLoading(true);
            const fetchedOrders = await getUserOrders(user.$id);
            console.log('📦 Fetched orders:', fetchedOrders.length);
            console.log('📦 Order statuses:', fetchedOrders.map((o: any) => o.status));
            setOrders(fetchedOrders as unknown as Order[]);
            filterOrders(fetchedOrders as unknown as Order[], selectedFilter);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const filterOrders = (orderList: Order[], filter: string) => {
        if (filter === 'all') {
            setFilteredOrders(orderList);
        } else {
            const filtered = orderList.filter(order => order.status === filter);
            console.log(`🔍 Filter "${filter}":`, filtered.length, 'orders found');
            setFilteredOrders(filtered);
        }
    };

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        filterOrders(orders, filter);
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [user?.$id])
    );

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-6 py-12">
            <Image
                source={icons.bag}
                className="size-24 mb-6"
                resizeMode="contain"
                tintColor="#D1D5DB"
            />
            <Text className="h3-bold text-dark-100 text-center mb-2">
                {selectedFilter === 'all' ? 'No Orders Yet' : `No ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Orders`}
            </Text>
            <Text className="paragraph-regular text-gray-500 text-center">
                {selectedFilter === 'all' 
                    ? 'Your order history will appear here once you place your first order.'
                    : `You don't have any ${selectedFilter} orders at the moment.`
                }
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <CustomHeader title="Order History" />
            
            {/* Filters */}
            <View className="px-6 py-4 border-b border-gray-100">
                <FlatList
                    data={ORDER_FILTERS}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-x-2 pb-3"
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            key={item.id}
                            className={cn('filter', selectedFilter === item.id ? 'bg-amber-500' : 'bg-white')}
                            style={Platform.OS === 'android' ? { elevation: 5, shadowColor: '#878787'} : {}}
                            onPress={() => handleFilterChange(item.id)}
                        >
                            <Text className={cn('body-medium', selectedFilter === item.id ? 'text-white' : 'text-gray-200')}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Orders List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FE8C00" />
                    <Text className="paragraph-regular text-gray-500 mt-4">
                        Loading your orders...
                    </Text>
                </View>
            ) : filteredOrders.length === 0 ? (
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#FE8C00']}
                            tintColor="#FE8C00"
                        />
                    }
                >
                    {renderEmptyState()}
                </ScrollView>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.$id}
                    renderItem={({ item }) => <OrderCard order={item} />}
                    contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#FE8C00']}
                            tintColor="#FE8C00"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default OrderHistory;
