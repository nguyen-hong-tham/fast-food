import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CustomHeader from '@/components/common/CustomHeader';
import { getUserNotifications, markNotificationAsRead } from '@/lib/api-helpers';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import cn from 'clsx';

interface Notification {
  $id: string;
  userId: string;
  type: 'order_update' | 'promotion' | 'system' | 'review_request';
  title: string;
  body: string;
  data?: string;
  status: 'sent' | 'read';
  channel: 'push' | 'email' | 'in_app';
  sentAt: string;
  readAt?: string;
  imageUrl?: string;
  actionUrl?: string;
}

const NotificationsScreen = () => {
  const { user } = useAuthStore();
  const { reset } = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await getUserNotifications(user.$id);
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    // Reset notification badge when entering screen
    reset();
  }, [loadNotifications, reset]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read
    if (notification.status !== 'read') {
      try {
        await markNotificationAsRead(notification.$id);
        setNotifications(prev => 
          prev.map(n => n.$id === notification.$id ? { ...n, status: 'read' } : n)
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate based on notification data
    if (notification.data) {
      try {
        const data = JSON.parse(notification.data);
        if (data.orderId) {
          router.push({
            pathname: '/order-tracking',
            params: { orderId: data.orderId }
          });
        } else if (data.screen) {
          router.push(data.screen);
        }
      } catch (error) {
        console.error('Failed to parse notification data:', error);
      }
    }
  }, []);

  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return '📦';
      case 'promotion':
        return '🎉';
      case 'review_request':
        return '⭐';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  const renderNotificationItem = useCallback(({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      className={cn(
        'bg-white mx-4 mb-3 rounded-xl p-4 border',
        item.status === 'read' ? 'border-gray-100' : 'border-primary/30 bg-amber-50/30'
      )}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Icon */}
        <View className={cn(
          'w-12 h-12 rounded-full items-center justify-center mr-3',
          item.status === 'read' ? 'bg-gray-100' : 'bg-primary/10'
        )}>
          <Text className="text-2xl">{getNotificationIcon(item.type)}</Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={cn(
              'text-base flex-1 mr-2',
              item.status === 'read' ? 'text-gray-800' : 'text-gray-900 font-bold'
            )}>
              {item.title}
            </Text>
            {item.status !== 'read' && (
              <View className="w-2 h-2 rounded-full bg-primary" />
            )}
          </View>

          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.body}
          </Text>

          <Text className="text-xs text-gray-400">
            {formatTime(item.sentAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleNotificationPress, getNotificationIcon, formatTime]);

  const keyExtractor = useCallback((item: Notification) => item.$id, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => n.status !== 'read').length,
  [notifications]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <CustomHeader title="Notifications" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Notifications" />

      {/* Unread count */}
      {unreadCount > 0 && (
        <View className="bg-primary/10 px-4 py-3 border-b border-primary/20">
          <Text className="text-sm text-primary font-semibold">
            You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={keyExtractor}
        renderItem={renderNotificationItem}
        contentContainerClassName="py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">🔔</Text>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              No notifications yet
            </Text>
            <Text className="text-gray-500 text-sm text-center px-8">
              We'll notify you when there's something new
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
