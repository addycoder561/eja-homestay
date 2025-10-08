import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = false,
  animate = true 
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={style}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Profile Picture Skeleton */}
        <Skeleton width={128} height={128} rounded />
        
        {/* Profile Info Skeleton */}
        <div className="flex-1 space-y-3">
          <Skeleton width={200} height={32} />
          <Skeleton width={300} height={20} />
          <Skeleton width={100} height={24} />
          
          {/* Metrics Skeleton */}
          <div className="flex gap-6 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton width={40} height={24} className="mx-auto mb-1" />
                <Skeleton width={60} height={16} className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BucketlistSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={80} height={32} />
        ))}
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <Skeleton width="100%" height={200} />
            <div className="p-4 space-y-2">
              <Skeleton width="80%" height={20} />
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExperienceGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="group cursor-pointer">
          <Skeleton width="100%" height={200} className="rounded-lg" />
          <div className="mt-2 space-y-1">
            <Skeleton width="90%" height={16} />
            <Skeleton width="60%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="space-y-4">
        <Skeleton width="60%" height={24} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="80%" height={16} />
        <Skeleton width="40%" height={16} />
      </div>
    </div>
  );
}