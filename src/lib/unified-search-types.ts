// =====================================================
// UNIFIED SEARCH TYPES
// =====================================================
// TypeScript interfaces for the unified search view

// =====================================================
// CORE SEARCH TYPES
// =====================================================

export type CardType = 'property' | 'experience' | 'retreat';

export interface UnifiedSearchResult {
  id: string;
  card_type: CardType;
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
  
  // Property-specific fields
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

// =====================================================
// SEARCH REQUEST TYPES
// =====================================================

export interface SearchRequest {
  search_term?: string;
  card_types?: CardType[];
  min_price?: number;
  max_price?: number;
  locations?: string[];
  categories?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: UnifiedSearchResult[];
  total_count: number;
  has_more: boolean;
}

// =====================================================
// FILTER TYPES
// =====================================================

export interface SearchFilters {
  card_types: CardType[];
  price_range: {
    min: number | null;
    max: number | null;
  };
  locations: string[];
  categories: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptions {
  locations: FilterOption[];
  categories: FilterOption[];
  price_ranges: FilterOption[];
}

// =====================================================
// CARD-SPECIFIC TYPES
// =====================================================

export interface PropertyCard extends UnifiedSearchResult {
  card_type: 'property';
  property_type: string;
  room_type: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  min_nights: number;
  max_nights: number;
  cancellation_policy: string;
  house_rules: string;
  check_in_time: string;
  check_out_time: string;
  usps: string[];
  room_config: any;
  google_last_updated: string;
  google_place_id: string;
  latitude: number;
  longitude: number;
  address: string;
  postal_code: string;
}

export interface ExperienceCard extends UnifiedSearchResult {
  card_type: 'experience';
  duration: string;
}

export interface RetreatCard extends UnifiedSearchResult {
  card_type: 'retreat';
  duration: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type TypedSearchResult<T extends CardType> = 
  T extends 'property' ? PropertyCard :
  T extends 'experience' ? ExperienceCard :
  T extends 'retreat' ? RetreatCard :
  UnifiedSearchResult;

export interface SearchStats {
  total_properties: number;
  total_experiences: number;
  total_retreats: number;
  total_results: number;
}

// =====================================================
// SORT TYPES
// =====================================================

export type SortOption = 
  | 'relevance'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'rating'
  | 'newest'
  | 'oldest';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// =====================================================
// PAGINATION TYPES
// =====================================================

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
  limit: number;
  offset: number;
}
