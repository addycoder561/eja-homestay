export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PropertyType = 'Boutique' | 'Cottage' | 'Homely' | 'Off-Beat';

export const AMENITIES = [
  'WiFi',
  'Power Backup',
  'Geyser',
  'Meals',
  'Pure-Veg',
  'Mountain View',
  'Pool',
  'Clubhouse',
  'Fireplace',
  'Parking',
  'Pet Friendly',
] as const;

export type Amenity = typeof AMENITIES[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_host: boolean;
  role?: 'host' | 'guest';
  host_bio?: string | null;
  host_usps?: string[];
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  host_id: string;
  title: string;
  subtitle?: string | null;
  description: string | null;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  gallery?: Record<string, string[]>; // { living: [url], kitchen: [url], ... }
  usps?: string[];
  house_rules?: string | null;
  cancellation_policy?: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  property_id: string;
  guest_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PropertyWithHost extends Property {
  host: Profile;
}

export interface PropertyWithReviews extends Property {
  host: Profile;
  reviews: Review[];
  average_rating: number;
  review_count: number;
}

export interface BookingWithProperty extends Booking {
  property: Property;
}

export interface BookingWithPropertyAndGuest extends Booking {
  property: Property;
  guest: Profile;
}

export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  amenities?: string[];
} 