// Performance optimization utilities

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Image lazy loading optimization
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Preload critical resources
export function preloadCriticalResources() {
  // Preload critical images
  const criticalImages = [
    '/eja_svg.svg',
    '/eja_transparent logo.png'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Optimize database queries
export function optimizeQuery(query: any, options: {
  limit?: number;
  select?: string[];
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
}) {
  let optimizedQuery = query;
  
  if (options.limit) {
    optimizedQuery = optimizedQuery.limit(options.limit);
  }
  
  if (options.select && options.select.length > 0) {
    optimizedQuery = optimizedQuery.select(options.select.join(', '));
  }
  
  if (options.orderBy) {
    optimizedQuery = optimizedQuery.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    });
  }
  
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        optimizedQuery = optimizedQuery.eq(key, value);
      }
    });
  }
  
  return optimizedQuery;
}

// Cache management
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  static clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Record<string, number[]> = {};
  
  static startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics[label]) {
        this.metrics[label] = [];
      }
      this.metrics[label].push(duration);
      
      // Keep only last 100 measurements
      if (this.metrics[label].length > 100) {
        this.metrics[label] = this.metrics[label].slice(-100);
      }
    };
  }
  
  static getMetrics(label?: string): Record<string, { avg: number; min: number; max: number; count: number }> {
    if (label) {
      const values = this.metrics[label] || [];
      return {
        [label]: {
          avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
          min: Math.min(...values) || 0,
          max: Math.max(...values) || 0,
          count: values.length
        }
      };
    }
    
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    Object.entries(this.metrics).forEach(([key, values]) => {
      result[key] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
        min: Math.min(...values) || 0,
        max: Math.max(...values) || 0,
        count: values.length
      };
    });
    
    return result;
  }
  
  static clearMetrics() {
    this.metrics = {};
  }
}
