'use client';

import { useState, useEffect } from 'react';
import { CategoryCards } from './CategoryCards';

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative h-[85vh] bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-1" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-300/30 rounded-full blur-xl animate-float-2" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-orange-400/25 rounded-full blur-xl animate-float-3" />
        <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl animate-float-1" />
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-orange-300/25 rounded-full blur-xl animate-float-2" />
        
        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-orange-200 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col justify-center h-full">
          {/* Category Cards */}
          <div className={`transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <CategoryCards />
          </div>
        </div>
      </div>
    </div>
  );
} 