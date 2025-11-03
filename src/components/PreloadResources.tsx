'use client';

import { useEffect } from 'react';

export function PreloadResources() {
  useEffect(() => {
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

    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    fontLink.href = '/fonts/geist-sans.woff2';
    document.head.appendChild(fontLink);

    // Preload critical API endpoints
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

    // Preload next page
    const nextPageLink = document.createElement('link');
    nextPageLink.rel = 'prefetch';
    nextPageLink.href = '/discover';
    document.head.appendChild(nextPageLink);

  }, []);

  return null;
}
