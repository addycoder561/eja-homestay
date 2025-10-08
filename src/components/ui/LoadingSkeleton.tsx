import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'image' | 'button';
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
  style?: React.CSSProperties;
}

export function LoadingSkeleton({ 
  type = 'card', 
  className = '', 
  lines = 3, 
  height = 'h-4', 
  width = 'w-full',
  style
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded';
  
  switch (type) {
    case 'card':
      return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`} style={style}>
          <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
          </div>
        </div>
      );
    
    case 'list':
      return (
        <div className={`space-y-4 ${className}`} style={style}>
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    
    case 'text':
      return (
        <div className={`space-y-2 ${className}`} style={style}>
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index} 
              className={`${baseClasses} ${height} ${index === lines - 1 ? 'w-2/3' : width}`}
            ></div>
          ))}
        </div>
      );
    
    case 'image':
      return (
        <div className={`${baseClasses} ${height} ${width} ${className}`} style={style}></div>
      );
    
    case 'button':
      return (
        <div className={`${baseClasses} h-10 w-24 rounded-lg ${className}`} style={style}></div>
      );
    
    default:
      return (
        <div className={`${baseClasses} ${height} ${width} ${className}`} style={style}></div>
      );
  }
}

export function SearchResultSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 12 }).map((_, index) => (
        <LoadingSkeleton 
          key={index} 
          type="card" 
          className="animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div 
          key={index}
          className="flex-shrink-0 h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"
          style={{ animationDelay: `${index * 0.05}s` }}
        ></div>
      ))}
    </div>
  );
}


