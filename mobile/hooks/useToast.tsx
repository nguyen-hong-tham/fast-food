/**
 * Toast Notification Hook
 * 
 * Simple hook to manage toast notifications across the app
 * 
 * Usage:
 * ```tsx
 * import { useToast } from '@/hooks/useToast';
 * 
 * const MyComponent = () => {
 *   const { showToast, ToastComponent } = useToast();
 * 
 *   const handleSuccess = () => {
 *     showToast('Order placed successfully!', 'success');
 *   };
 * 
 *   return (
 *     <>
 *       <Button onPress={handleSuccess} />
 *       {ToastComponent}
 *     </>
 *   );
 * };
 * ```
 */

import { useState } from 'react';
import Toast from '@/components/Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const ToastComponent = (
    <Toast
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      onDismiss={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
};
