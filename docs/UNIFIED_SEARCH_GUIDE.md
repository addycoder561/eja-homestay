# Unified Search System Guide

## Overview

The Unified Search System provides a single interface to search across all card types (properties, experiences, and retreats) without merging the underlying database tables. This approach maintains data integrity while providing the benefits of unified search functionality.

## Architecture

### Database Layer
- **Unified Search View**: `public.unified_search_view` - Combines all card types into a single queryable view
- **Search Function**: `public.search_all_cards()` - Advanced search with filtering and ranking
- **Underlying Tables**: `properties`, `experiences`, `retreats` - Remain separate for data integrity

### Application Layer
- **TypeScript Types**: `src/lib/unified-search-types.ts` - Type-safe interfaces
- **API Functions**: `src/lib/unified-search-api.ts` - Database interaction functions
- **React Hooks**: `src/hooks/useUnifiedSearch.ts` - Easy-to-use React hooks
- **Example Component**: `src/components/UnifiedSearchExample.tsx` - Usage demonstration

## Quick Start

### 1. Basic Search

```typescript
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';

function MySearchComponent() {
  const { results, loading, error, searchWithFilters } = useUnifiedSearch();

  const handleSearch = () => {
    searchWithFilters({
      card_types: ['property', 'experience'],
      price_range: { min: 1000, max: 5000 },
      locations: ['Kashmir'],
      categories: ['Nature']
    }, 'mountain');
  };

  return (
    <div>
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error}</div>}
      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>{result.description}</p>
          <span>₹{result.price}</span>
        </div>
      ))}
    </div>
  );
}
```

### 2. Advanced Search with Filters

```typescript
import { searchAllCards } from '@/lib/unified-search-api';

const performAdvancedSearch = async () => {
  const response = await searchAllCards({
    search_term: 'mountain view',
    card_types: ['property'],
    min_price: 2000,
    max_price: 10000,
    locations: ['Kashmir', 'Himachal'],
    categories: ['Nature', 'Family'],
    limit: 20,
    offset: 0
  });

  console.log('Found', response.total_count, 'results');
  return response.results;
};
```

## API Reference

### Core Functions

#### `searchAllCards(request: SearchRequest): Promise<SearchResponse>`

Main search function that queries the unified view.

**Parameters:**
- `search_term`: Text to search for in title, description, or location
- `card_types`: Array of card types to include ('property', 'experience', 'retreat')
- `min_price` / `max_price`: Price range filter
- `locations`: Array of location names to filter by
- `categories`: Array of category names to filter by
- `limit`: Number of results to return (default: 20)
- `offset`: Number of results to skip for pagination

**Returns:**
```typescript
{
  results: UnifiedSearchResult[];
  total_count: number;
  has_more: boolean;
}
```

#### `searchWithFilters(filters: SearchFilters, searchTerm?: string): Promise<SearchResponse>`

Convenience function for filtered searches.

#### `getSearchStats(): Promise<SearchStats>`

Get counts of all card types.

#### `getFilterOptions(): Promise<FilterOptions>`

Get available filter options (locations, categories, price ranges).

### React Hooks

#### `useUnifiedSearch(options?: UseUnifiedSearchOptions)`

Main hook for search functionality.

**Options:**
- `initialLimit`: Number of results per page (default: 20)
- `autoLoad`: Whether to load results on mount (default: false)
- `defaultFilters`: Initial filter configuration
- `defaultSearchTerm`: Initial search term

**Returns:**
```typescript
{
  // State
  results: UnifiedSearchResult[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  stats: SearchStats | null;
  filterOptions: FilterOptions | null;
  
  // Actions
  search: (request: SearchRequest) => Promise<void>;
  searchWithFilters: (filters: SearchFilters, searchTerm?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearResults: () => void;
  sortResults: (sortOption: SortOption) => void;
}
```

#### `useCardTypeSearch(cardType: CardType, limit?: number)`

Hook for searching specific card types.

#### `useFeaturedCards(limit?: number)`

Hook for getting featured/recent cards.

#### `useSearchStats()`

Hook for getting search statistics.

#### `useFilterOptions()`

Hook for getting available filter options.

## Data Types

### UnifiedSearchResult

The main result type containing all card data:

```typescript
interface UnifiedSearchResult {
  id: string;
  card_type: 'property' | 'experience' | 'retreat';
  title: string;
  subtitle: string | null;
  description: string;
  location: string;
  price: number;
  currency: string;
  cover_image: string;
  images: string[];
  categories: string[];
  average_rating: number | null;
  review_count: number | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  host_name: string;
  host_type: string;
  host_tenure: string;
  host_description: string;
  host_image: string;
  host_usps: string[];
  unique_propositions: string[];
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  
  // Property-specific fields (null for other card types)
  property_type: string | null;
  room_type: string | null;
  max_guests: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  amenities: string[] | null;
  min_nights: number | null;
  max_nights: number | null;
  cancellation_policy: string | null;
  house_rules: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  usps: string[] | null;
  room_config: any | null;
  google_last_updated: string | null;
  google_place_id: string | null;
  
  // Common fields
  duration: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  postal_code: string | null;
}
```

### SearchFilters

```typescript
interface SearchFilters {
  card_types: CardType[];
  price_range: {
    min: number | null;
    max: number | null;
  };
  locations: string[];
  categories: string[];
}
```

### SortOption

```typescript
type SortOption = 
  | 'relevance'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'rating'
  | 'newest'
  | 'oldest';
```

## Usage Examples

### 1. Simple Search Component

```typescript
function SimpleSearch() {
  const { results, loading, searchWithFilters } = useUnifiedSearch();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    searchWithFilters({
      card_types: [],
      price_range: { min: null, max: null },
      locations: [],
      categories: []
    }, searchTerm);
  };

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleSearch}>Search</button>
      
      {loading && <div>Loading...</div>}
      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>{result.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Filtered Search

```typescript
function FilteredSearch() {
  const { results, loading, searchWithFilters, filterOptions } = useUnifiedSearch();
  const [filters, setFilters] = useState<SearchFilters>({
    card_types: ['property'],
    price_range: { min: 1000, max: 5000 },
    locations: [],
    categories: []
  });

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    searchWithFilters(newFilters);
  };

  return (
    <div>
      {/* Filter UI */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={filters.card_types.includes('property')}
            onChange={(e) => {
              const newTypes = e.target.checked 
                ? [...filters.card_types, 'property']
                : filters.card_types.filter(t => t !== 'property');
              handleFilterChange({ ...filters, card_types: newTypes });
            }}
          />
          Properties
        </label>
        {/* More filters... */}
      </div>

      {/* Results */}
      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>₹{result.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Pagination

```typescript
function PaginatedSearch() {
  const { results, loading, hasMore, loadMore } = useUnifiedSearch({
    initialLimit: 10
  });

  return (
    <div>
      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
        </div>
      ))}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### 4. Sorting

```typescript
function SortableSearch() {
  const { results, sortResults } = useUnifiedSearch();

  const handleSort = (sortOption: SortOption) => {
    sortResults(sortOption);
  };

  return (
    <div>
      <select onChange={(e) => handleSort(e.target.value as SortOption)}>
        <option value="relevance">Relevance</option>
        <option value="price_low_to_high">Price: Low to High</option>
        <option value="price_high_to_low">Price: High to Low</option>
        <option value="rating">Rating</option>
        <option value="newest">Newest</option>
      </select>

      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>₹{result.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## Performance Considerations

### Database Optimization
- The unified view uses `UNION ALL` for efficient data combination
- Search function includes smart ranking (title matches first)
- Indexes on key fields for fast filtering
- Pagination support to limit result sets

### Frontend Optimization
- React hooks provide memoized results
- Lazy loading with `loadMore` functionality
- Client-side sorting for better UX
- Debounced search inputs (implement as needed)

## Best Practices

### 1. Error Handling
Always handle errors gracefully:

```typescript
const { results, loading, error } = useUnifiedSearch();

if (error) {
  return <div>Error: {error}</div>;
}
```

### 2. Loading States
Show loading indicators:

```typescript
if (loading) {
  return <div>Searching...</div>;
}
```

### 3. Empty States
Handle no results:

```typescript
if (!loading && results.length === 0) {
  return <div>No results found</div>;
}
```

### 4. Type Safety
Use TypeScript for better development experience:

```typescript
import { UnifiedSearchResult, CardType } from '@/lib/unified-search-types';

function CardComponent({ result }: { result: UnifiedSearchResult }) {
  // TypeScript will provide autocomplete and type checking
}
```

### 5. Filter Validation
Validate filters before searching:

```typescript
const validateFilters = (filters: SearchFilters) => {
  if (filters.price_range.min && filters.price_range.max) {
    if (filters.price_range.min > filters.price_range.max) {
      throw new Error('Min price cannot be greater than max price');
    }
  }
};
```

## Migration from Separate APIs

If you're migrating from separate property/experience/retreat APIs:

### Before (Separate APIs)
```typescript
// Old way - separate calls
const properties = await getProperties();
const experiences = await getExperiences();
const retreats = await getRetreats();
const allResults = [...properties, ...experiences, ...retreats];
```

### After (Unified API)
```typescript
// New way - single call
const { results } = await searchAllCards({
  card_types: ['property', 'experience', 'retreat']
});
```

## Troubleshooting

### Common Issues

1. **No results returned**
   - Check if `is_active` is true for the cards
   - Verify search terms match case-insensitive
   - Ensure filter values exist in the database

2. **Performance issues**
   - Use pagination with reasonable limits
   - Add database indexes if needed
   - Consider caching frequently searched terms

3. **Type errors**
   - Ensure all imports are correct
   - Check TypeScript configuration
   - Verify database schema matches types

### Debug Mode

Enable debug logging:

```typescript
const { results, loading, error } = useUnifiedSearch({
  debug: true // Add this option to the hook if needed
});
```

## Conclusion

The Unified Search System provides a powerful, type-safe, and performant way to search across all card types while maintaining data integrity. Use the provided hooks and API functions to build rich search experiences in your application.
