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
  role?: 'host' | 'guest' | 'admin';
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
  cover_image?: string | null;
  gallery?: Record<string, string[]>; // { living: [url], kitchen: [url], ... }
  usps?: string[];
  house_rules?: string | null;
  cancellation_policy?: string | null;
  room_config?: {
    room_types: {
      name: string;
      description: string;
      room_type: string;
      base_price: number;
      total_inventory: number;
      amenities: string[];
      extra_adult_price: number;
      child_breakfast_price: number;
    }[];
  };
  google_rating?: number | null;
  google_reviews_count?: number | null;
  google_place_id?: string | null;
  google_last_updated?: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  name: string;
  description: string | null;
  room_type: string;
  price: number; // Changed from price_per_night to match actual database
  total_inventory: number;
  max_guests?: number; // Made optional since it might not exist in DB
  amenities: string[] | null;
  images: string[]; // per-room images
  extra_adult_price?: number;
  child_breakfast_price?: number;
  created_at: string;
}

export interface RoomInventory {
  id: string;
  room_id: string;
  date: string; // YYYY-MM-DD
  available: number;
  created_at: string;
}

export interface BookingRoom {
  id: string;
  booking_id: string;
  room_id: string;
  quantity: number;
  check_in: string;
  check_out: string;
}

// Update Booking to remove room_id (now handled by booking_rooms)
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
  payment_ref?: string | null;
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
  average_rating?: number;
  review_count?: number;
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
  preference?: string[];
}

export interface Experience {
  id: string;
  host_id: string | null;
  title: string;
  subtitle?: string | null;
  description: string | null;
  location: string;
  date: string; // YYYY-MM-DD
  price: number;
  max_guests: number;
  images: string[];
  cover_image?: string;
  duration?: string;
  categories?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  host_id: string | null;
  title: string;
  subtitle?: string | null;
  description: string | null;
  location: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  duration?: string;
  price: number;
  max_guests: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collaboration {
  id: string;
  type: 'create' | 'retreat' | 'campaign';
  name: string;
  email: string;
  role: string;
  details: string;
  created_at: string;
} 