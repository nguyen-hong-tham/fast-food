import { View, Text, Dimensions, Platform } from 'react-native';
import { useResponsive } from '@/lib/responsive';
import { useEffect, useState } from 'react';

/**
 * Development helper component to show current platform and breakpoint
 * Only visible in development mode
 * Shows platform, screen dimensions, and current breakpoint
 */
export default function DevInfo() {
  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [mounted, setMounted] = useState(false);
  const { width, height } = Dimensions.get('window');
  const { breakpoint } = useResponsive();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <View 
      className="absolute top-0 right-0 bg-black/80 px-3 py-2 z-50 rounded-bl-lg"
      style={{ 
        position: Platform.OS === 'web' ? 'fixed' : 'absolute',
      }}
    >
      <Text className="text-white text-xs font-mono">
        📱 {Platform.OS.toUpperCase()}
      </Text>
      <Text className="text-white text-xs font-mono">
        📐 {Math.round(width)} × {Math.round(height)}
      </Text>
      <Text className="text-white text-xs font-mono">
        🎯 {breakpoint}
      </Text>
    </View>
  );
}
