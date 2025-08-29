// =====================================================
// BOOKING SYSTEM TYPES
// =====================================================
// TypeScript interfaces for the optimized booking system

// =====================================================
// CORE ENTITIES
// =====================================================

export interface Room {
  id: string;
  property_id: string;
  name: string;
  description: string;
  room_type: 'standard' | 'deluxe' | 'premium' | 'suite';
  price: number;
  total_inventory: number;
  amenities: string[];
  images: string[];
  max_guests: number;
  created_at: string;
  updated_at: string;
}

export interface RoomInventory {
  id: string;
  room_id: string;
  date: string; // YYYY-MM-DD
  available: number;
  created_at: string;
  updated_at: string;
}

// Booking and BookingRoom interfaces are commented out as tables are empty
// export interface Booking {
//   id: string;
//   user_id: string;
//   property_id: string;
//   check_in_date: string; // YYYY-MM-DD
//   check_out_date: string; // YYYY-MM-DD
//   total_guests: number;
//   total_amount: number;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   payment_status: 'pending' | 'paid' | 'refunded';
//   special_requests?: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface BookingRoom {
//   id: string;
//   booking_id: string;
//   room_id: string;
//   quantity: number;
//   price_per_night: number;
//   total_price: number;
//   created_at: string;
// }

// =====================================================
// OPTIMIZED VIEWS
// =====================================================

export interface RoomAvailabilityView {
  inventory_id: string;
  room_id: string;
  date: string;
  available: number;
  property_id: string;
  room_name: string;
  room_type: string;
  price: number;
  total_inventory: number;
  amenities: string[];
  max_guests: number;
  property_name: string;
  property_location: string;
  availability_status: 'available' | 'booked' | 'unavailable';
}

export interface PropertyRoomsSummary {
  property_id: string;
  property_name: string;
  location: string;
  total_rooms: number;
  standard_rooms: number;
  deluxe_rooms: number;
  premium_rooms: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  total_capacity: number;
}

export interface RoomCalendarView {
  room_id: string;
  room_name: string;
  room_type: string;
  price: number;
  property_id: string;
  property_name: string;
  date: string;
  available: number;
  booked: number;
  status: 'Fully Booked' | 'Partially Available' | 'Available';
}

// =====================================================
// FUNCTION RETURN TYPES
// =====================================================

export interface RoomAvailability {
  date: string;
  available: number;
  total_inventory: number;
  status: 'Fully Booked' | 'Partially Available' | 'Available';
}

export interface PropertyAvailability {
  room_id: string;
  room_name: string;
  room_type: string;
  price: number;
  available: number;
  total_inventory: number;
  occupancy_rate: number;
}

// =====================================================
// API REQUEST TYPES
// =====================================================

// CreateBookingRequest is commented out as booking tables are empty
// export interface CreateBookingRequest {
//   user_id: string;
//   property_id: string;
//   check_in_date: string;
//   check_out_date: string;
//   total_guests: number;
//   rooms: {
//     room_id: string;
//     quantity: number;
//   }[];
//   special_requests?: string;
// }

export interface UpdateRoomAvailabilityRequest {
  room_id: string;
  date: string;
  available: number;
}

export interface SearchRoomsRequest {
  property_id?: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  room_type?: string;
  min_price?: number;
  max_price?: number;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface SearchRoomsResponse {
  rooms: RoomAvailabilityView[];
  total_count: number;
  available_count: number;
}

// BookingResponse is commented out as booking tables are empty
// export interface BookingResponse {
//   booking: Booking;
//   rooms: BookingRoom[];
//   total_amount: number;
//   confirmation_code: string;
// }

// =====================================================
// UTILITY TYPES
// =====================================================

export type RoomType = 'standard' | 'deluxe' | 'premium' | 'suite';
// export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
// export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type AvailabilityStatus = 'available' | 'booked' | 'unavailable';
