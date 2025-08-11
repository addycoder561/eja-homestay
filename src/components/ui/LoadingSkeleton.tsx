interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export function Skeleton({ className = '', width = 'w-full', height = 'h-4', rounded = 'rounded' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${width} ${height} ${rounded} ${className}`}
    />
  );
}

interface PropertyCardSkeletonProps {
  index?: number;
}

export function PropertyCardSkeleton({ index = 0 }: PropertyCardSkeletonProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="h-64 skeleton rounded-t-2xl" />
      <div className="p-6">
        <div className="h-6 skeleton rounded mb-3" />
        <div className="h-4 skeleton rounded mb-2 w-3/4" />
        <div className="h-4 skeleton rounded mb-4 w-1/2" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 skeleton rounded-full w-16" />
          <div className="h-6 skeleton rounded-full w-20" />
          <div className="h-6 skeleton rounded-full w-14" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 skeleton rounded w-20" />
          <div className="h-6 skeleton rounded w-16" />
        </div>
      </div>
    </div>
  );
}

interface SearchResultSkeletonProps {
  count?: number;
}

export function SearchResultSkeleton({ count = 6 }: SearchResultSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

interface HeroSkeletonProps {
  className?: string;
}

export function HeroSkeleton({ className = '' }: HeroSkeletonProps) {
  return (
    <div className={`bg-gradient-to-br from-gray-200 to-gray-300 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <div className="h-16 skeleton rounded mb-6 max-w-2xl mx-auto" />
          <div className="h-8 skeleton rounded mb-12 max-w-3xl mx-auto" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <div className="h-12 skeleton rounded-lg w-48" />
            <div className="h-12 skeleton rounded-lg w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="h-20 skeleton rounded-lg" />
            <div className="h-20 skeleton rounded-lg" />
            <div className="h-20 skeleton rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavigationSkeletonProps {
  className?: string;
}

export function NavigationSkeleton({ className = '' }: NavigationSkeletonProps) {
  return (
    <div className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 skeleton rounded-lg" />
            <div className="h-6 skeleton rounded w-32" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <div className="h-4 skeleton rounded w-16" />
            <div className="h-4 skeleton rounded w-24" />
            <div className="h-4 skeleton rounded w-16" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 skeleton rounded-lg w-20" />
            <div className="w-10 h-10 skeleton rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterSkeletonProps {
  className?: string;
}

export function FilterSkeleton({ className = '' }: FilterSkeletonProps) {
  return (
    <div className={`bg-white border-b border-gray-200 py-4 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 skeleton rounded-lg" />
      </div>
    </div>
  );
}
