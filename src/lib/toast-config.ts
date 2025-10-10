import toast from 'react-hot-toast';

// Custom toast styles
const toastStyles = {
  success: {
    style: {
      background: '#10B981',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  loading: {
    style: {
      background: '#3B82F6',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3B82F6',
    },
  },
  info: {
    style: {
      background: '#6366F1',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#6366F1',
    },
  },
};

// Enhanced toast functions with branding
export const showToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      ...toastStyles.success,
      duration: 4000,
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      ...toastStyles.error,
      duration: 5000,
      ...options,
    });
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      ...toastStyles.loading,
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    return toast(message, {
      ...toastStyles.info,
      duration: 4000,
      ...options,
    });
  },

  // Booking specific toasts
  bookingSuccess: (propertyName: string) => {
    return toast.success(`🎉 Booking confirmed for ${propertyName}!`, {
      ...toastStyles.success,
      duration: 6000,
    });
  },

  bookingError: (error: string) => {
    return toast.error(`❌ Booking failed: ${error}`, {
      ...toastStyles.error,
      duration: 6000,
    });
  },

  // Authentication toasts
  signInSuccess: (userName?: string) => {
    return toast.success(`👋 Welcome back${userName ? `, ${userName}` : ''}!`, {
      ...toastStyles.success,
      duration: 4000,
    });
  },

  signUpSuccess: (userName?: string) => {
    return toast.success(`🎉 Welcome to EJA${userName ? `, ${userName}` : ''}!`, {
      ...toastStyles.success,
      duration: 5000,
    });
  },

  authError: (error: string) => {
    return toast.error(`🔐 ${error}`, {
      ...toastStyles.error,
      duration: 5000,
    });
  },

  // Wishlist toasts
  wishlistAdded: (itemName: string) => {
    return toast.success(`❤️ Added ${itemName} to your bucket list!`, {
      ...toastStyles.success,
      duration: 3000,
    });
  },

  wishlistRemoved: (itemName: string) => {
    return toast.info(`💔 Removed ${itemName} from your bucket list`, {
      ...toastStyles.info,
      duration: 3000,
    });
  },

  // Profile toasts
  profileUpdated: () => {
    return toast.success(`✅ Profile updated successfully!`, {
      ...toastStyles.success,
      duration: 3000,
    });
  },

  profileError: (error: string) => {
    return toast.error(`❌ Profile update failed: ${error}`, {
      ...toastStyles.error,
      duration: 4000,
    });
  },

  // Payment toasts
  paymentSuccess: (amount: number) => {
    return toast.success(`💳 Payment of ₹${amount.toLocaleString()} successful!`, {
      ...toastStyles.success,
      duration: 5000,
    });
  },

  paymentError: (error: string) => {
    return toast.error(`💳 Payment failed: ${error}`, {
      ...toastStyles.error,
      duration: 6000,
    });
  },

  // Generic toasts
  saved: (item: string) => {
    return toast.success(`💾 ${item} saved successfully!`, {
      ...toastStyles.success,
      duration: 3000,
    });
  },

  deleted: (item: string) => {
    return toast.info(`🗑️ ${item} deleted successfully`, {
      ...toastStyles.info,
      duration: 3000,
    });
  },

  copied: (item: string) => {
    return toast.success(`📋 ${item} copied to clipboard!`, {
      ...toastStyles.success,
      duration: 2000,
    });
  },

  // Network toasts
  networkError: () => {
    return toast.error(`🌐 Network error. Please check your connection.`, {
      ...toastStyles.error,
      duration: 5000,
    });
  },

  offline: () => {
    return toast.error(`📱 You're offline. Some features may not work.`, {
      ...toastStyles.error,
      duration: 4000,
    });
  },

  online: () => {
    return toast.success(`🌐 You're back online!`, {
      ...toastStyles.success,
      duration: 2000,
    });
  },
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Dismiss specific toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};
