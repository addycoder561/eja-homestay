// =====================================================
// UNIFIED SEARCH EXAMPLE COMPONENT
// =====================================================
// Example component showing how to use the unified search functionality

'use client';

import React, { useState } from 'react';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import { CardType, SearchFilters, SortOption } from '@/lib/unified-search-types';

export default function UnifiedSearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardTypes, setSelectedCardTypes] = useState<CardType[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Initialize the search hook
  const {
    results,
    loading,
    error,
    totalCount,
    hasMore,
    stats,
    filterOptions,
    searchWithFilters,
    loadMore,
    sortResults
  } = useUnifiedSearch({
    initialLimit: 12,
    autoLoad: true
  });

  // Handle search
  const handleSearch = () => {
    const filters: SearchFilters = {
      card_types: selectedCardTypes,
      price_range: { min: null, max: null },
      locations: [],
      categories: []
    };

    searchWithFilters(filters, searchTerm);
  };

  // Handle sort change
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    sortResults(newSort);
  };

  // Handle card type toggle
  const toggleCardType = (cardType: CardType) => {
    setSelectedCardTypes(prev => 
      prev.includes(cardType) 
        ? prev.filter(type => type !== cardType)
        : [...prev, cardType]
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Unified Search Example
        </h1>
        
        {/* Search Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total_properties}</div>
              <div className="text-sm text-blue-800">Properties</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.total_experiences}</div>
              <div className="text-sm text-green-800">Experiences</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.total_retreats}</div>
              <div className="text-sm text-purple-800">Retreats</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.total_results}</div>
              <div className="text-sm text-gray-800">Total</div>
            </div>
          </div>
        )}

        {/* Search Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search for properties, experiences, or retreats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Card Type Filters */}
            <div className="flex gap-2">
              {(['property', 'experience', 'retreat'] as CardType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleCardType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCardTypes.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low_to_high">Price: Low to High</option>
                <option value="price_high_to_low">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">Error: {error}</div>
        </div>
      )}

      {/* Results */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results ({totalCount} found)
          </h2>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((result) => (
            <div
              key={`${result.card_type}-${result.id}`}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Image */}
              <div className="aspect-video bg-gray-200 relative">
                {result.cover_image && (
                  <img
                    src={result.cover_image}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.card_type === 'property' ? 'bg-blue-100 text-blue-800' :
                    result.card_type === 'experience' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {result.card_type.charAt(0).toUpperCase() + result.card_type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {result.title}
                </h3>
                
                {result.subtitle && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {result.subtitle}
                  </p>
                )}

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {result.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {result.location}
                  </div>
                  <div className="font-semibold text-gray-900">
                    ₹{result.price.toLocaleString()}
                  </div>
                </div>

                {/* Rating */}
                {(result.average_rating || result.google_rating) && (
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {result.average_rating || result.google_rating}
                      </span>
                    </div>
                    {result.duration && (
                      <span className="text-sm text-gray-500 ml-2">
                        • {result.duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No results found. Try adjusting your search criteria.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
