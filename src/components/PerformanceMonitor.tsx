'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const lcp = entry as PerformanceEntry;
          console.log('LCP:', lcp.startTime);
          // Send to analytics service here
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = entry as PerformanceEntry;
          console.log('FID:', fid.processingStart - fid.startTime);
          // Send to analytics service here
        }
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          const cls = entry as any;
          if (!cls.hadRecentInput) {
            clsValue += cls.value;
          }
        }
        console.log('CLS:', clsValue);
        // Send to analytics service here
      }).observe({ entryTypes: ['layout-shift'] });

      // FCP (First Contentful Paint)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fcp = entry as PerformanceEntry;
          console.log('FCP:', fcp.startTime);
          // Send to analytics service here
        }
      }).observe({ entryTypes: ['first-contentful-paint'] });
    };

    // Track page load performance
    const trackPageLoad = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
              const metrics = {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                ttfb: navigation.responseStart - navigation.requestStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                loadComplete: navigation.loadEventEnd - navigation.navigationStart,
              };
              console.log('Page Load Metrics:', metrics);
              // Send to analytics service here
            }
          }, 0);
        });
      }
    };

    // Track resource loading
    const trackResources = () => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          if (resource.initiatorType === 'img' || resource.initiatorType === 'script') {
            console.log(`${resource.initiatorType} load time:`, resource.duration);
            // Send to analytics service here
          }
        }
      }).observe({ entryTypes: ['resource'] });
    };

    // Initialize tracking
    if (typeof window !== 'undefined') {
      trackWebVitals();
      trackPageLoad();
      trackResources();
    }
  }, []);

  return null; // This component doesn't render anything
}
