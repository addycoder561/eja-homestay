// =====================================================
// UNIFIED SEARCH HOOK
// =====================================================
// React hook for unified search functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  searchAllCards,
  searchWithFilters,
  getSearchStats,
  getFilterOptions,
  getFilterOptionsWithCounts,
  sortSearchResults
} from '@/lib/unified-search-api';
import {
  SearchRequest,
  SearchResponse,
  SearchFilters,
  FilterOptions,
  SearchStats,
  UnifiedSearchResult,
  CardType,
  SortOption
} from '@/lib/unified-search-types';

// =====================================================
// HOOK STATE INTERFACE
// =====================================================

interface UseUnifiedSearchState {
  results: UnifiedSearchResult[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  stats: SearchStats | null;
  filterOptions: FilterOptions | null;
}

interface UseUnifiedSearchActions {
  search: (request: SearchRequest) => Promise<void>;
  searchWithFilters: (filters: SearchFilters, searchTerm?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearResults: () => void;
  sortResults: (sortOption: SortOption) => void;
}

interface UseUnifiedSearchOptions {
  initialLimit?: number;
  autoLoad?: boolean;
  defaultFilters?: SearchFilters;
  defaultSearchTerm?: string;
}

// =====================================================
// MAIN HOOK
// =====================================================

export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}): UseUnifiedSearchState & UseUnifiedSearchActions {
  const {
    initialLimit = 20,
    autoLoad = false,
    defaultFilters = {
      card_types: [],
      price_range: { min: null, max: null },
      locations: [],
      categories: []
    },
    defaultSearchTerm = ''
  } = options;

  // State
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [currentRequest, setCurrentRequest] = useState<SearchRequest | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(defaultFilters);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(defaultSearchTerm);
  const [currentSort, setCurrentSort] = useState<SortOption>('relevance');

  // =====================================================
  // CORE SEARCH FUNCTION
  // =====================================================

  const performSearch = useCallback(async (request: SearchRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response: SearchResponse = await searchAllCards(request);
      
      setResults(response.results);
      setTotalCount(response.total_count);
      setHasMore(response.has_more);
      setCurrentRequest(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // PUBLIC ACTIONS
  // =====================================================

  const search = useCallback(async (request: SearchRequest) => {
    await performSearch(request);
  }, [performSearch]);

  const searchWithFiltersAction = useCallback(async (filters: SearchFilters, searchTerm?: string) => {
    setCurrentFilters(filters);
    setCurrentSearchTerm(searchTerm || '');
    
    const request: SearchRequest = {
      search_term: searchTerm,
      card_types: filters.card_types.length > 0 ? filters.card_types : undefined,
      min_price: filters.price_range.min || undefined,
      max_price: filters.price_range.max || undefined,
      locations: filters.locations.length > 0 ? filters.locations : undefined,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      limit: initialLimit,
      offset: 0
    };

    await performSearch(request);
  }, [performSearch, initialLimit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !currentRequest) return;

    try {
      setLoading(true);
      setError(null);

      const nextRequest: SearchRequest = {
        ...currentRequest,
        offset: results.length
      };

      const response: SearchResponse = await searchAllCards(nextRequest);
      
      setResults(prev => [...prev, ...response.results]);
      setHasMore(response.has_more);
      setCurrentRequest(nextRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more results');
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentRequest, results.length]);

  const refresh = useCallback(async () => {
    if (currentRequest) {
      await performSearch(currentRequest);
    } else if (autoLoad) {
      await searchWithFiltersAction(currentFilters, currentSearchTerm);
    }
  }, [currentRequest, performSearch, autoLoad, searchWithFiltersAction, currentFilters, currentSearchTerm]);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalCount(0);
    setHasMore(false);
    setCurrentRequest(null);
    setError(null);
  }, []);

  const sortResults = useCallback((sortOption: SortOption) => {
    setCurrentSort(sortOption);
    const sortedResults = sortSearchResults(results, sortOption);
    setResults(sortedResults);
  }, [results]);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  // Load stats and filter options on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [statsData, filterOptionsData] = await Promise.all([
          getSearchStats(),
          getFilterOptionsWithCounts()
        ]);

        setStats(statsData);
        setFilterOptions(filterOptionsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadInitialData();
  }, []);

  // Auto-load if enabled
  useEffect(() => {
    if (autoLoad) {
      searchWithFiltersAction(currentFilters, currentSearchTerm);
    }
  }, [autoLoad, searchWithFiltersAction, currentFilters, currentSearchTerm]);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const sortedResults = useMemo(() => {
    return sortSearchResults(results, currentSort);
  }, [results, currentSort]);

  // =====================================================
  // RETURN STATE AND ACTIONS
  // =====================================================

  return {
    // State
    results: sortedResults,
    loading,
    error,
    totalCount,
    hasMore,
    stats,
    filterOptions,
    
    // Actions
    search,
    searchWithFilters: searchWithFiltersAction,
    loadMore,
    refresh,
    clearResults,
    sortResults
  };
}

// =====================================================
// SPECIALIZED HOOKS
// =====================================================

export function useCardTypeSearch(cardType: CardType, limit: number = 20) {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await searchAllCards({
        card_types: [cardType],
        limit
      });

      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [cardType, limit]);

  useEffect(() => {
    search();
  }, [search]);

  return { results, loading, error, refresh: search };
}

export function useFeaturedCards(limit: number = 10) {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { getFeaturedCards } = await import('@/lib/unified-search-api');
      const featured = await getFeaturedCards(limit);

      setResults(featured);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load featured cards');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  return { results, loading, error, refresh: loadFeatured };
}

// =====================================================
// UTILITY HOOKS
// =====================================================

export function useSearchStats() {
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await getSearchStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}

export function useFilterOptions() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const options = await getFilterOptionsWithCounts();
      setFilterOptions(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filter options');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  return { filterOptions, loading, error, refresh: loadFilterOptions };
}
