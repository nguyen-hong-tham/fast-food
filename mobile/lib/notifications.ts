import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { saveUserPushToken } from './appwrite';

let handlerConfigured = false;

export const ensureNotificationHandlerConfigured = () => {
  if (handlerConfigured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  handlerConfigured = true;
};

const getProjectId = () => {
  const easProjectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
  if (!easProjectId) {
    console.warn('Expo project ID is not configured; push token retrieval may fail.');
  }
  return easProjectId;
};

export const registerForPushNotificationsAsync = async (userId?: string) => {
  // Skip on web - notifications not supported
  if (Platform.OS === 'web') {
    console.log('Skipping push notifications setup on web');
    return null;
  }

  ensureNotificationHandlerConfigured();

  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const existingStatus = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus.status;

  if (existingStatus.status !== 'granted') {
    const permission = await Notifications.requestPermissionsAsync();
    finalStatus = permission.status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  let pushToken: string | null = null;

  try {
    const projectId = getProjectId();
    
    // Chỉ thử lấy token nếu có projectId
    if (projectId) {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
      pushToken = tokenResponse.data;
      console.log('✅ Got real Expo push token:', pushToken);
    } else {
      // Không có projectId - tạo mock token cho development
      pushToken = `ExpoToken[${Math.random().toString(36).substring(7)}]`;
      console.warn('⚠️ No projectId found. Using mock push token for development:', pushToken);
      console.warn('   To enable real push notifications, run: npx eas init');
    }
  } catch (error) {
    console.error('Failed to get Expo push token:', error);
    // Fallback: Generate a mock token for development
    pushToken = `ExpoToken[${Math.random().toString(36).substring(7)}]`;
    console.warn('Using mock push token for development:', pushToken);
  }

  if (userId && pushToken) {
    try {
      await saveUserPushToken(userId, pushToken);
    } catch (error) {
      console.error('Unable to persist push token', error);
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F32',
    });
  }

  return pushToken;
};

export const addNotificationListeners = (
  onReceive?: (notification: Notifications.Notification) => void,
  onRespond?: (response: Notifications.NotificationResponse) => void
) => {
  // Skip on web - notifications not supported
  if (Platform.OS === 'web') {
    console.log('Skipping notification listeners on web');
    return {
      remove: () => {},
      receiveSub: null,
      responseSub: null,
    };
  }

  ensureNotificationHandlerConfigured();

  const receiveSub = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
    onReceive?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
    onRespond?.(response);
  });

  return {
    remove: () => {
      receiveSub.remove();
      responseSub.remove();
    },
    receiveSub,
    responseSub,
  };
};

export const clearNotifications = async () => {
  // Skip on web - notifications API not supported
  if (Platform.OS === 'web') {
    console.log('Skipping clearNotifications on web');
    return;
  }

  try {
    await Notifications.dismissAllNotificationsAsync();
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(0);
    }
  } catch (error) {
    console.error('Failed to clear notifications', error);
  }
};
