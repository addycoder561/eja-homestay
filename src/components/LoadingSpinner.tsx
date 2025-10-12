'use client';

import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  timeout = 10000,
  onTimeout 
}: LoadingSpinnerProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">{message}</p>
        {showTimeout && (
          <div className="text-sm text-gray-500">
            <p>This is taking longer than expected.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-yellow-500 hover:text-yellow-600 underline mt-2"
            >
              Refresh page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
