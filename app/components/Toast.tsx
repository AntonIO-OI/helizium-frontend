'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | '';
  onClose: () => void;
  duration?: number; // duration in milliseconds
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const toastStyles = {
    base: 'fixed bottom-4 right-4 max-w-xs px-4 py-4 rounded shadow-lg text-white text-xl',
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      style={{ zIndex: 999 }}
      className={`${toastStyles.base} ${type === 'success' ? toastStyles.success : type === 'error' ? toastStyles.error : toastStyles.info}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          className="ml-4 text-white hover:text-gray-200"
          onClick={onClose}
          aria-label="Close Toast"
        >
          ×
        </button>
      </div>
    </div>
  );
}
