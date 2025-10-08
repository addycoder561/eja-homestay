import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedDataOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  cacheKey?: string;
  staleTime?: number; // in milliseconds
  retryCount?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

export function useOptimizedData<T>({
  fetchFn,
  dependencies = [],
  cacheKey,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  retryCount = 3
}: UseOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      const now = Date.now();
      
      if (now - cached.timestamp < cached.staleTime) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (!isMountedRef.current) return;
      
      setData(result);
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          staleTime
        });
      }
      
      retryCountRef.current = 0;
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const error = err as Error;
      console.error('Error fetching data:', error);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData();
          }
        }, 1000 * retryCountRef.current); // Exponential backoff
      } else {
        setError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, cacheKey, staleTime, retryCount]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, dependencies);

  const refetch = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    retryCountRef.current = 0;
    fetchData();
  }, [fetchData, cacheKey]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T, optimisticData: Partial<T>) => T
) {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const updateOptimistically = useCallback((updates: Partial<T>) => {
    setData(prev => updateFn(prev, updates));
    setIsOptimistic(true);
  }, [updateFn]);

  const confirmUpdate = useCallback((confirmedData: T) => {
    setData(confirmedData);
    setIsOptimistic(false);
  }, []);

  const revertUpdate = useCallback(() => {
    setIsOptimistic(false);
  }, []);

  return {
    data,
    isOptimistic,
    updateOptimistically,
    confirmUpdate,
    revertUpdate
  };
}