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
  tags?: string[]; // Add tags field for Families only, Females only filtering
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
  // Host-related columns
  host_name?: string | null;
  host_type?: string | null;
  host_tenure?: string | null;
  host_description?: string | null;
  host_image?: string | null;
  host_usps?: string[];
  // Property features
  unique_propositions?: string[];
  beds?: number;
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
  guests?: number; // Total guests (adults + children)
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  amenities?: string[];
  preference?: string[];
  // New filter chip fields
  selectedChips?: string[]; // For filter chips (Boutique, Homely, Off-Beat, Families only, Females only, Pet-Friendly, Pure-Veg)
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

export interface Retreat {
  id: string;
  host_id: string | null;
  title: string;
  subtitle?: string | null;
  description: string | null;
  location: string;
  price: number;
  images: string[];
  cover_image?: string | null;
  duration?: string;
  categories?: string | string[];
  is_active: boolean;
  // Host-related columns
  host_name?: string | null;
  host_type?: string | null;
  host_tenure?: string | null;
  host_description?: string | null;
  host_image?: string | null;
  host_usps?: string[];
  // Retreat features
  unique_propositions?: string[];
  created_at: string;
  updated_at: string;
}

// Engagement features types
export interface Like {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'property' | 'experience' | 'retreat';
  created_at: string;
}

export interface Share {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'property' | 'experience' | 'retreat';
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'telegram' | 'copy_link';
  created_at: string;
}



export interface CardCollaboration {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'property' | 'experience' | 'retreat';
  collaboration_type: 'reel' | 'co_host';
  user_name: string;
  user_email: string;
  user_phone?: string;
  user_instagram?: string;
  user_youtube?: string;
  user_tiktok?: string;
  proposal: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  host_response?: string;
  created_at: string;
  updated_at: string;
}

// Marketing: Ad campaigns and coupons
export interface AdCampaign {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  target_url?: string | null;
  start_date?: string | null; // YYYY-MM-DD
  end_date?: string | null;   // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  max_uses?: number | null;
  used_count: number;
  valid_from?: string | null; // YYYY-MM-DD
  valid_to?: string | null;   // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Razorpay TypeScript declarations
declare global {
  interface Window {
    Razorpay: any;
  }
}

 