// =====================================================
// UNIFIED SEARCH API
// =====================================================
// API functions for unified search across all card types

import { createClient } from '@supabase/supabase-js';
import {
  UnifiedSearchResult,
  SearchRequest,
  SearchResponse,
  SearchFilters,
  FilterOptions,
  SearchStats,
  SortOption,
  PaginationInfo,
  CardType
} from './unified-search-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =====================================================
// CORE SEARCH FUNCTIONS
// =====================================================

/**
 * Search across all card types using the unified search function
 */
export async function searchAllCards(request: SearchRequest): Promise<SearchResponse> {
  try {
    const { data, error } = await supabase
      .rpc('search_all_cards', {
        p_search_term: request.search_term || null,
        p_card_types: request.card_types || null,
        p_min_price: request.min_price || null,
        p_max_price: request.max_price || null,
        p_locations: request.locations || null,
        p_categories: request.categories || null,
        p_limit: request.limit || 20,
        p_offset: request.offset || 0
      });

    if (error) {
      console.error('Error searching cards:', error);
      throw error;
    }

    const results = data || [];
    const hasMore = results.length === (request.limit || 20);

    return {
      results,
      total_count: results.length,
      has_more: hasMore
    };
  } catch (error) {
    console.error('Error in searchAllCards:', error);
    throw error;
  }
}

/**
 * Search with filters and return typed results
 */
export async function searchWithFilters(
  filters: SearchFilters,
  searchTerm?: string,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  const request: SearchRequest = {
    search_term: searchTerm,
    card_types: filters.card_types.length > 0 ? filters.card_types : undefined,
    min_price: filters.price_range.min || undefined,
    max_price: filters.price_range.max || undefined,
    locations: filters.locations.length > 0 ? filters.locations : undefined,
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    limit,
    offset
  };

  return searchAllCards(request);
}

/**
 * Get search statistics
 */
export async function getSearchStats(): Promise<SearchStats> {
  try {
    // Get counts for each card type
    const [propertiesCount, experiencesCount, retreatsCount] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('experiences').select('*', { count: 'exact', head: true }),
      supabase.from('retreats').select('*', { count: 'exact', head: true })
    ]);

    const totalProperties = propertiesCount.count || 0;
    const totalExperiences = experiencesCount.count || 0;
    const totalRetreats = retreatsCount.count || 0;

    return {
      total_properties: totalProperties,
      total_experiences: totalExperiences,
      total_retreats: totalRetreats,
      total_results: totalProperties + totalExperiences + totalRetreats
    };
  } catch (error) {
    console.error('Error getting search stats:', error);
    throw error;
  }
}

// =====================================================
// FILTER FUNCTIONS
// =====================================================

/**
 * Get available filter options from the unified view
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    // Get unique locations
    const { data: locationData, error: locationError } = await supabase
      .from('unified_search_view')
      .select('location')
      .not('location', 'eq', '')
      .not('location', 'is', null);

    if (locationError) {
      console.error('Error getting locations:', locationError);
      throw locationError;
    }

    const locations = Array.from(new Set(locationData?.map(item => item.location) || []))
      .map(location => ({ value: location, label: location }));

    // Get unique categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('unified_search_view')
      .select('categories');

    if (categoryError) {
      console.error('Error getting categories:', categoryError);
      throw categoryError;
    }

    const allCategories = categoryData?.flatMap(item => item.categories || []) || [];
    const categories = Array.from(new Set(allCategories))
      .map(category => ({ value: category, label: category }));

    // Define price ranges
    const priceRanges = [
      { value: '0-1000', label: 'Under ₹1,000' },
      { value: '1000-5000', label: '₹1,000 - ₹5,000' },
      { value: '5000-10000', label: '₹5,000 - ₹10,000' },
      { value: '10000-20000', label: '₹10,000 - ₹20,000' },
      { value: '20000+', label: 'Above ₹20,000' }
    ];

    return {
      locations,
      categories,
      price_ranges: priceRanges
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    throw error;
  }
}

/**
 * Get filter options with counts
 */
export async function getFilterOptionsWithCounts(): Promise<FilterOptions> {
  try {
    const baseOptions = await getFilterOptions();
    
    // Get counts for each filter option
    const locationCounts = await Promise.all(
      baseOptions.locations.map(async (location) => {
        const { count } = await supabase
          .from('unified_search_view')
          .select('*', { count: 'exact', head: true })
          .eq('location', location.value);
        
        return { ...location, count: count || 0 };
      })
    );

    const categoryCounts = await Promise.all(
      baseOptions.categories.map(async (category) => {
        const { count } = await supabase
          .from('unified_search_view')
          .select('*', { count: 'exact', head: true })
          .contains('categories', [category.value]);
        
        return { ...category, count: count || 0 };
      })
    );

    return {
      locations: locationCounts,
      categories: categoryCounts,
      price_ranges: baseOptions.price_ranges
    };
  } catch (error) {
    console.error('Error getting filter options with counts:', error);
    throw error;
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get cards by type
 */
export async function getCardsByType(
  cardType: CardType,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  return searchAllCards({
    card_types: [cardType],
    limit,
    offset
  });
}

/**
 * Get featured cards (most recent)
 */
export async function getFeaturedCards(limit: number = 10): Promise<UnifiedSearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('unified_search_view')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting featured cards:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeaturedCards:', error);
    throw error;
  }
}

/**
 * Get cards by location
 */
export async function getCardsByLocation(
  location: string,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  return searchAllCards({
    locations: [location],
    limit,
    offset
  });
}

/**
 * Get cards by category
 */
export async function getCardsByCategory(
  category: string,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  return searchAllCards({
    categories: [category],
    limit,
    offset
  });
}

/**
 * Get cards by price range
 */
export async function getCardsByPriceRange(
  minPrice: number,
  maxPrice: number,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  return searchAllCards({
    min_price: minPrice,
    max_price: maxPrice,
    limit,
    offset
  });
}

// =====================================================
// PAGINATION HELPERS
// =====================================================

/**
 * Calculate pagination info
 */
export function calculatePagination(
  totalCount: number,
  currentPage: number,
  limit: number
): PaginationInfo {
  const totalPages = Math.ceil(totalCount / limit);
  const offset = (currentPage - 1) * limit;

  return {
    current_page: currentPage,
    total_pages: totalPages,
    total_count: totalCount,
    has_next: currentPage < totalPages,
    has_previous: currentPage > 1,
    limit,
    offset
  };
}

/**
 * Search with pagination
 */
export async function searchWithPagination(
  request: SearchRequest,
  page: number = 1
): Promise<SearchResponse & { pagination: PaginationInfo }> {
  const limit = request.limit || 20;
  const offset = (page - 1) * limit;

  const response = await searchAllCards({
    ...request,
    limit,
    offset
  });

  const pagination = calculatePagination(response.total_count, page, limit);

  return {
    ...response,
    pagination
  };
}

// =====================================================
// SORTING HELPERS
// =====================================================

/**
 * Apply sorting to search results
 */
export function sortSearchResults(
  results: UnifiedSearchResult[],
  sortOption: SortOption
): UnifiedSearchResult[] {
  const sorted = [...results];

  switch (sortOption) {
    case 'price_low_to_high':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price_high_to_low':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'rating':
      return sorted.sort((a, b) => {
        const ratingA = a.average_rating || a.google_rating || 0;
        const ratingB = b.average_rating || b.google_rating || 0;
        return ratingB - ratingA;
      });
    
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
    
    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA.getTime() - dateB.getTime();
      });
    
    case 'relevance':
    default:
      // Relevance is handled by the database function
      return sorted;
  }
}
