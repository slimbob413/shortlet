/**
 * Toast Provider Component
 * 
 * Wraps the Toaster component from react-hot-toast
 * Provides global toast notifications
 */

import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#4aed88',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ff4b4b',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider; 