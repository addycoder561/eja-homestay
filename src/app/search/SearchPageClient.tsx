"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchFilters } from '@/components/SearchFilters';
import { getProperties, searchProperties } from '@/lib/database';
import { PropertyWithHost, SearchFilters as SearchFiltersType } from '@/lib/types';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { SearchResultSkeleton } from '@/components/ui/LoadingSkeleton';

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    rooms: searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : undefined,
    adults: searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const startTime = Date.now();
      
      try {
        let data;
        
        // Check if any filters are applied
        const hasFilters = Object.values(filters).some(value => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== undefined && value !== null && value !== '';
        });

        if (hasFilters) {
          console.log('Applying filters:', filters);
          data = await searchProperties(filters);
        } else {
          console.log('No filters applied, fetching all properties');
          data = await getProperties();
        }
        
        console.log('Fetched properties:', data);
        setProperties(data);
        setTotalResults(data.length);
        setSearchTime(Date.now() - startTime);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      location: '',
      checkIn: '',
      checkOut: '',
      rooms: undefined,
      adults: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="relative">
        <SearchFilters filters={filters} onFilterChange={setFilters} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {filters.location ? `Properties in ${filters.location}` : 'All Properties'}
                </h1>
                {!loading && (
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{totalResults} properties found</span>
                    {searchTime > 0 && (
                      <span>• Found in {searchTime}ms</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filters
                </button>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div 
                className="flex flex-wrap gap-2 mt-4 animate-fade-in"
              >
                {filters.location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <MapPinIcon className="w-4 h-4" />
                    {filters.location}
                  </span>
                )}
                {filters.checkIn && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Check-in: {filters.checkIn}
                  </span>
                )}
                {filters.checkOut && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Check-out: {filters.checkOut}
                  </span>
                )}
                {filters.adults && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {filters.adults} adults
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div
              className="sm:hidden mb-6 p-4 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {/* Add mobile filter components here */}
              <div className="text-gray-500 text-sm">
                Mobile filter components would go here
              </div>
            </div>
          )}

          {/* Results Section */}
          {loading ? (
            <SearchResultSkeleton count={6} />
          ) : properties.length === 0 ? (
            <div 
              className="text-center py-16 animate-fade-in"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or browse our popular destinations
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse All Properties
                </Link>
              </div>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {properties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          )}

          {/* Load More Button (if needed) */}
          {!loading && properties.length > 0 && properties.length >= 12 && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Load More Properties
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
} 