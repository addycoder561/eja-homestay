'use client';

import { useEffect, useState } from 'react';
import { PerformanceMonitor } from '@/lib/performance';

export default function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      const newMetrics = PerformanceMonitor.getMetrics();
      setMetrics(newMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Metrics</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      {Object.entries(metrics).map(([key, value]: [string, any]) => (
        <div key={key} className="mb-2">
          <div className="font-semibold text-yellow-400">{key}</div>
          <div className="text-gray-300">
            Avg: {value.avg.toFixed(2)}ms | 
            Min: {value.min.toFixed(2)}ms | 
            Max: {value.max.toFixed(2)}ms | 
            Count: {value.count}
          </div>
        </div>
      ))}
      
      <button 
        onClick={() => PerformanceMonitor.clearMetrics()}
        className="mt-2 px-2 py-1 bg-red-600 rounded text-xs"
      >
        Clear Metrics
      </button>
    </div>
  );
}

// Toggle button for development
export function PerformanceToggle() {
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      className="fixed bottom-4 left-4 bg-yellow-500 text-black px-3 py-2 rounded-lg text-xs font-bold z-50"
    >
      {isVisible ? 'Hide' : 'Show'} Perf
    </button>
  );
}