import { View, ViewProps } from 'react-native';
import { ReactNode } from 'react';
import { isWeb } from '@/lib/responsive';

interface WebContainerProps extends ViewProps {
  children: ReactNode;
  maxWidth?: 'container' | 'content' | 'narrow' | 'full';
  center?: boolean;
  className?: string;
}

/**
 * Container component that limits width on web for better desktop experience
 * On mobile, it renders children directly without wrapper
 * 
 * @example
 * <WebContainer maxWidth="container">
 *   <YourContent />
 * </WebContainer>
 */
export default function WebContainer({ 
  children, 
  maxWidth = 'container',
  center = true,
  className = '',
  ...props
}: WebContainerProps) {
  // On native mobile, render without wrapper
  if (!isWeb) {
    return <>{children}</>;
  }

  // Define max-width classes
  const maxWidthClass = 
    maxWidth === 'narrow' ? 'max-w-[600px]' :
    maxWidth === 'content' ? 'max-w-[800px]' :
    maxWidth === 'container' ? 'max-w-[1200px]' :
    maxWidth === 'full' ? 'max-w-full' :
    'max-w-[1200px]';

  const centerClass = center ? 'mx-auto' : '';
  const paddingClass = maxWidth !== 'full' ? 'px-4 md:px-6 lg:px-8' : '';

  return (
    <View 
      className={`w-full flex-1 ${maxWidthClass} ${centerClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
