import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedDataOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  cacheKey?: string;
  cacheTime?: number; // in milliseconds
  retryCount?: number;
  retryDelay?: number; // in milliseconds
  enabled?: boolean;
}

interface UseOptimizedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedData<T>({
  fetchFn,
  dependencies = [],
  cacheKey,
  cacheTime = 5 * 60 * 1000, // 5 minutes default
  retryCount = 3,
  retryDelay = 1000,
  enabled = true,
}: UseOptimizedDataOptions<T>): UseOptimizedDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setError(null);
        return;
      } else {
        // Cache expired, remove it
        cache.delete(cacheKey);
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    retryCountRef.current = 0;

    const attemptFetch = async (attempt: number): Promise<void> => {
      try {
        const result = await fetchFn();
        
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setData(result);
        setError(null);

        // Cache the result
        if (cacheKey) {
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        
        if (attempt < retryCount) {
          retryCountRef.current = attempt + 1;
          setTimeout(() => attemptFetch(attempt + 1), retryDelay);
        } else {
          setError(errorMessage);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };

    await attemptFetch(0);
  }, [fetchFn, cacheKey, cacheTime, retryCount, retryDelay, enabled]);

  const refetch = useCallback(async () => {
    clearCache();
    await fetchData();
  }, [clearCache, fetchData]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}
