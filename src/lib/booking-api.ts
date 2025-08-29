// =====================================================
// BOOKING API CLIENT
// =====================================================
// Optimized API functions for the booking system

import { createClient } from '@supabase/supabase-js';
import {
  Room,
  RoomInventory,
  RoomAvailabilityView,
  PropertyRoomsSummary,
  RoomCalendarView,
  RoomAvailability,
  PropertyAvailability,
  UpdateRoomAvailabilityRequest,
  SearchRoomsRequest,
  SearchRoomsResponse
} from './booking-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =====================================================
// ROOM AVAILABILITY FUNCTIONS
// =====================================================

/**
 * Get room availability for a specific date range
 */
export async function getRoomAvailability(
  roomId: string,
  startDate: string,
  endDate: string
): Promise<RoomAvailability[]> {
  const { data, error } = await supabase
    .rpc('get_room_availability', {
      p_room_id: roomId,
      p_start_date: startDate,
      p_end_date: endDate
    });

  if (error) {
    console.error('Error getting room availability:', error);
    throw error;
  }

  return data || [];
}

/**
 * Update room availability for a specific date
 */
export async function updateRoomAvailability(
  roomId: string,
  date: string,
  available: number
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('update_room_availability', {
      p_room_id: roomId,
      p_date: date,
      p_available: available
    });

  if (error) {
    console.error('Error updating room availability:', error);
    throw error;
  }

  return data;
}

/**
 * Get property availability summary for a specific date
 */
export async function getPropertyAvailability(
  propertyId: string,
  date: string
): Promise<PropertyAvailability[]> {
  const { data, error } = await supabase
    .rpc('get_property_availability', {
      p_property_id: propertyId,
      p_date: date
    });

  if (error) {
    console.error('Error getting property availability:', error);
    throw error;
  }

  return data || [];
}

// =====================================================
// VIEW-BASED QUERIES
// =====================================================

/**
 * Search available rooms using the optimized view
 */
export async function searchAvailableRooms(
  request: SearchRoomsRequest
): Promise<SearchRoomsResponse> {
  let query = supabase
    .from('room_availability_view')
    .select('*')
    .gte('date', request.check_in_date)
    .lte('date', request.check_out_date)
    .gte('available', 1)
    .gte('max_guests', request.guests);

  if (request.property_id) {
    query = query.eq('property_id', request.property_id);
  }

  if (request.room_type) {
    query = query.eq('room_type', request.room_type);
  }

  if (request.min_price) {
    query = query.gte('price', request.min_price);
  }

  if (request.max_price) {
    query = query.lte('price', request.max_price);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching available rooms:', error);
    throw error;
  }

  const rooms = data || [];
  const totalCount = rooms.length;
  const availableCount = rooms.filter(r => r.availability_status === 'available').length;

  return {
    rooms,
    total_count: totalCount,
    available_count: availableCount
  };
}

/**
 * Get property rooms summary
 */
export async function getPropertyRoomsSummary(
  propertyId?: string
): Promise<PropertyRoomsSummary[]> {
  let query = supabase
    .from('property_rooms_summary')
    .select('*');

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting property rooms summary:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get room calendar view for the next 30 days
 */
export async function getRoomCalendar(
  roomId?: string,
  propertyId?: string
): Promise<RoomCalendarView[]> {
  let query = supabase
    .from('room_calendar_view')
    .select('*')
    .order('date', { ascending: true });

  if (roomId) {
    query = query.eq('room_id', roomId);
  }

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting room calendar:', error);
    throw error;
  }

  return data || [];
}

// =====================================================
// ROOM MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Get all rooms for a property
 */
export async function getPropertyRooms(propertyId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .order('room_type', { ascending: true })
    .order('price', { ascending: true });

  if (error) {
    console.error('Error getting property rooms:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific room by ID
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    console.error('Error getting room:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new room
 */
export async function createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert([room])
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    throw error;
  }

  return data;
}

/**
 * Update a room
 */
export async function updateRoom(
  roomId: string,
  updates: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at'>>
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', roomId)
    .select()
    .single();

  if (error) {
    console.error('Error updating room:', error);
    throw error;
  }

  return data;
}

// =====================================================
// BOOKING FUNCTIONS (SKIPPED FOR NOW AS TABLES ARE EMPTY)
// =====================================================

// /**
//  * Create a new booking
//  */
// export async function createBooking(request: CreateBookingRequest): Promise<BookingResponse> {
//   // Start a transaction
//   const { data: booking, error: bookingError } = await supabase
//     .from('bookings')
//     .insert([{
//       user_id: request.user_id,
//       property_id: request.property_id,
//       check_in_date: request.check_in_date,
//       check_out_date: request.check_out_date,
//       total_guests: request.total_guests,
//       status: 'pending',
//       payment_status: 'pending',
//       special_requests: request.special_requests
//     }])
//     .select()
//     .single();

//   if (bookingError) {
//     console.error('Error creating booking:', bookingError);
//     throw bookingError;
//   }

//   // Create booking rooms
//   const bookingRooms = request.rooms.map(room => ({
//     booking_id: booking.id,
//     room_id: room.room_id,
//     quantity: room.quantity
//   }));

//   const { data: rooms, error: roomsError } = await supabase
//     .from('booking_rooms')
//     .insert(bookingRooms)
//     .select();

//   if (roomsError) {
//     console.error('Error creating booking rooms:', roomsError);
//     throw roomsError;
//   }

//   // Generate confirmation code
//   const confirmationCode = `BK${booking.id.slice(0, 8).toUpperCase()}`;

//   return {
//     booking,
//     rooms: rooms || [],
//     total_amount: 0, // Calculate based on room prices and duration
//     confirmation_code: confirmationCode
//   };
// }

// /**
//  * Get user bookings
//  */
// export async function getUserBookings(userId: string): Promise<Booking[]> {
//   const { data, error } = await supabase
//     .from('bookings')
//     .select('*')
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false });

//   if (error) {
//     console.error('Error getting user bookings:', error);
//     throw error;
//   }

//   return data || [];
// }

// /**
//  * Get booking details with rooms
//  */
// export async function getBookingDetails(bookingId: string): Promise<{
//   booking: Booking;
//   rooms: BookingRoom[];
// } | null> {
//   const { data: booking, error: bookingError } = await supabase
//     .from('bookings')
//     .select('*')
//     .eq('id', bookingId)
//     .single();

//   if (bookingError) {
//     console.error('Error getting booking:', bookingError);
//     throw bookingError;
//   }

//   const { data: rooms, error: roomsError } = await supabase
//     .from('booking_rooms')
//     .select('*')
//     .eq('booking_id', bookingId);

//   if (roomsError) {
//     console.error('Error getting booking rooms:', roomsError);
//     throw roomsError;
//   }

//   return {
//     booking,
//     rooms: rooms || []
//   };
// }

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if a room is available for a date range
 */
export async function checkRoomAvailability(
  roomId: string,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<boolean> {
  const availability = await getRoomAvailability(roomId, startDate, endDate);
  
  return availability.every(day => day.available >= quantity);
}

/**
 * Get room price for a date range
 */
export async function calculateRoomPrice(
  roomId: string,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<number> {
  const room = await getRoom(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return room.price * nights * quantity;
}
