// app/_layout.tsx
import useAuthStore from '@/store/auth.store';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './globals.css';

// 1) Chặn auto-hide ngay khi load module
SplashScreen.preventAutoHideAsync().catch(() => {});

// 2) Khởi tạo Sentry, TẮT feedback/replay ở dev để tránh crash
Sentry.init({
  dsn: 'https://68e9cb3b752bed44fe8c25bbbb455153@o4510090773725184.ingest.us.sentry.io/4510090775363584',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
  replaysOnErrorSampleRate: __DEV__ ? 0 : 1,
  integrations: __DEV__ ? [] : [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

function RootInner() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    'QuickSand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'QuickSand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'QuickSand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'QuickSand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'QuickSand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (!fontsLoaded || isLoading) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// 3) Xuất mặc định (bắt buộc cho expo-router)
export default Sentry.wrap(RootInner);

// ❌ ĐỪNG gọi ở global scope:
// Sentry.showFeedbackWidget();

// ✅ Nếu muốn mở Feedback, hãy gọi trong một handler khi đã sẵn sàng:
// const openFeedback = () => !__DEV__ && Sentry.showFeedbackWidget();
