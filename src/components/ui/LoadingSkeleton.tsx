import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  );
}

// Property Card Skeleton
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

// Experience Card Skeleton
export function ExperienceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

// Modal Skeleton
export function ModalSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
      <Skeleton className="h-64 w-full" />
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      
      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Button Skeleton
export function ButtonSkeleton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-10 w-24 rounded-lg ${className}`} />;
}

// Text Skeleton
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}