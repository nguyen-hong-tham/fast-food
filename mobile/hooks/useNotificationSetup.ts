import { useEffect } from 'react';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync, addNotificationListeners, clearNotifications } from '@/lib/notifications';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import * as Notifications from 'expo-notifications';

const useNotificationSetup = () => {
  const { user } = useAuthStore();
  const increment = useNotificationStore((state) => state.increment);
  const reset = useNotificationStore((state) => state.reset);
  const setCount = useNotificationStore((state) => state.setCount);

  useEffect(() => {
    if (!user) {
      reset();
      clearNotifications();
      return;
    }

    registerForPushNotificationsAsync(user.$id).catch((error) => {
      console.error('Push registration failed', error);
    });

    const subscription = addNotificationListeners(
      (notification: Notifications.Notification) => {
        increment();
        const currentBadge = notification.request.content.badge;
        if (typeof currentBadge === 'number') {
          setCount(currentBadge);
        }
      },
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data as { orderId?: string; screen?: string };

        if (data?.orderId) {
          router.push({ pathname: '/order-tracking' as any, params: { orderId: data.orderId } });
        } else if (data?.screen) {
          router.push(data.screen as any);
        }

        reset();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [user?.$id, increment, reset, setCount]);
};

export default useNotificationSetup;
