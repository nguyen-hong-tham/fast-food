// Hook for managing toast notifications
import { useState, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor: string;
  onConfirm: () => void;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const [dialog, setDialog] = useState<ConfirmDialogState>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    confirmColor: '#f59e0b',
    onConfirm: () => {},
  });

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      confirmColor?: string;
    }
  ) => {
    setDialog({
      visible: true,
      title,
      message,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText || 'Cancel',
      confirmColor: options?.confirmColor || '#f59e0b',
      onConfirm,
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    dialog,
    showConfirm,
    hideConfirm,
  };
};
