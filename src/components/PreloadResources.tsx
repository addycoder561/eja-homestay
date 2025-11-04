'use client';

import { useEffect } from 'react';

export function PreloadResources() {
  useEffect(() => {
    // Preconnect to external domains for faster loading
    const preconnectDomains = [
      'https://qfpfezjygemxfgwazsix.supabase.co',
      'https://images.unsplash.com'
    ];

    preconnectDomains.forEach(domain => {
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = domain;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);

      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = domain;
      document.head.appendChild(dnsPrefetch);
    });

    // Preload critical images
    const criticalImages = [
      '/eja_svg.svg',
      '/placeholder-experience.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Prefetch critical API endpoints
    const apiEndpoints = [
      '/api/properties',
      '/api/experiences',
      '/api/retreats'
    ];

    apiEndpoints.forEach(endpoint => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = endpoint;
      document.head.appendChild(link);
    });

    // Prefetch likely next pages
    const nextPages = ['/discover', '/experiences'];
    nextPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}
