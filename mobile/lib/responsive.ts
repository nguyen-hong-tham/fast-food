// Platform utilities for responsive design
import { Platform, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

// Platform checks
export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Breakpoint definitions (matching Tailwind)
export const BREAKPOINTS = {
  mobile: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = 'mobile' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Get current breakpoint based on screen width
 */
export const getBreakpoint = (): Breakpoint => {
  const { width } = Dimensions.get('window');
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'mobile';
};

/**
 * Check if current width is at least the given breakpoint
 */
export const isAtLeast = (breakpoint: Breakpoint): boolean => {
  const { width } = Dimensions.get('window');
  return width >= BREAKPOINTS[breakpoint];
};

/**
 * Hook for responsive design with breakpoint detection
 * @example
 * const { isDesktop, isMobile, breakpoint } = useResponsive();
 * if (isDesktop) return <DesktopLayout />;
 * return <MobileLayout />;
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint());
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setBreakpoint(getBreakpoint());
    });

    return () => subscription?.remove();
  }, []);

  return {
    // Screen size categories
    isMobileSize: breakpoint === 'mobile',
    isSmall: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isLarge: breakpoint === 'xl' || breakpoint === '2xl',
    
    // Current breakpoint
    breakpoint,
    
    // Dimensions
    width: dimensions.width,
    height: dimensions.height,
    
    // Utility functions
    isAtLeast: (bp: Breakpoint) => {
      const order: Breakpoint[] = ['mobile', 'sm', 'md', 'lg', 'xl', '2xl'];
      return order.indexOf(breakpoint) >= order.indexOf(bp);
    },
    
    // Platform
    isWeb,
    isMobile,
  };
};

/**
 * Get responsive value based on breakpoint
 * @example
 * const columns = useResponsiveValue({ mobile: 1, md: 2, lg: 3 });
 */
export const useResponsiveValue = <T,>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const { breakpoint } = useResponsive();
  
  // Try current breakpoint first
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }
  
  // Fallback to smaller breakpoints
  const order: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'mobile'];
  const currentIndex = order.indexOf(breakpoint);
  
  for (let i = currentIndex; i < order.length; i++) {
    const bp = order[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

/**
 * Platform-specific component selection
 * @example
 * const Layout = usePlatformComponent({
 *   web: WebLayout,
 *   native: MobileLayout
 * });
 */
export const usePlatformComponent = <T,>(components: {
  web?: T;
  native?: T;
  ios?: T;
  android?: T;
  default?: T;
}): T | undefined => {
  if (Platform.OS === 'web' && components.web) return components.web;
  if (Platform.OS === 'ios' && components.ios) return components.ios;
  if (Platform.OS === 'android' && components.android) return components.android;
  if (components.native && (Platform.OS === 'ios' || Platform.OS === 'android')) {
    return components.native;
  }
  return components.default;
};

/**
 * Get responsive spacing value
 * Automatically scales padding/margin for different screen sizes
 */
export const getResponsiveSpacing = (base: number): number => {
  const { width } = Dimensions.get('window');
  
  if (width >= BREAKPOINTS.xl) return base * 1.5;
  if (width >= BREAKPOINTS.lg) return base * 1.25;
  if (width >= BREAKPOINTS.md) return base * 1.1;
  return base;
};

/**
 * Check if device is in landscape mode
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    Dimensions.get('window').width > Dimensions.get('window').height 
      ? 'landscape' 
      : 'portrait'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(
        window.width > window.height ? 'landscape' : 'portrait'
      );
    });

    return () => subscription?.remove();
  }, []);

  return {
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  };
};
