import { create } from 'zustand';
import * as Notifications from 'expo-notifications';

interface NotificationState {
  unreadCount: number;
  increment: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  increment: () => set((state) => {
    const nextCount = state.unreadCount + 1;
    Notifications.setBadgeCountAsync(nextCount).catch(() => {});
    return { unreadCount: nextCount };
  }),
  reset: () => {
    Notifications.setBadgeCountAsync(0).catch(() => {});
    set({ unreadCount: 0 });
  },
  setCount: (count: number) => {
    Notifications.setBadgeCountAsync(count).catch(() => {});
    set({ unreadCount: count });
  },
}));

export default useNotificationStore;
