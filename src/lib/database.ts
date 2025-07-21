import { supabase } from './supabase';
import { 
  Property, 
  PropertyWithHost, 
  PropertyWithReviews, 
  Booking, 
  BookingWithProperty, 
  Profile, 
  SearchFilters,
  BookingStatus 
} from './types';

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

// Property functions
export async function getProperties(filters?: SearchFilters): Promise<PropertyWithHost[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      host:profiles(*)
    `)
    .eq('is_available', true);

  if (filters?.location) {
    query = query.ilike('city', `%${filters.location}%`);
  }

  if (filters?.minPrice) {
    query = query.gte('price_per_night', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price_per_night', filters.maxPrice);
  }

  if (filters?.propertyType) {
    query = query.eq('property_type', filters.propertyType);
  }

  if (filters?.guests) {
    query = query.gte('max_guests', filters.guests);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  return data || [];
}

export async function getProperty(id: string): Promise<PropertyWithHost | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      host:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  return data;
}

export async function getPropertyWithReviews(id: string): Promise<PropertyWithReviews | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      host:profiles(*),
      reviews(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property with reviews:', error);
    return null;
  }

  if (!data) return null;

  // Calculate average rating
  const reviews = data.reviews || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length 
    : 0;

  return {
    ...data,
    reviews,
    average_rating: averageRating,
    review_count: reviews.length
  };
}

export async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single();

  if (error) {
    console.error('Error creating property:', error);
    return null;
  }

  return data;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating property:', error);
    return null;
  }

  return data;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    return false;
  }

  return true;
}

// Booking functions
export async function getBookings(userId: string): Promise<BookingWithProperty[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('guest_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  return data || [];
}

export async function getHostBookings(userId: string): Promise<BookingWithProperty[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('property.host_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching host bookings:', error);
    return [];
  }

  return data || [];
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    return null;
  }

  return data;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking status:', error);
    return null;
  }

  return data;
}

// Check availability
export async function checkAvailability(
  propertyId: string, 
  checkIn: string, 
  checkOut: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['confirmed', 'pending'])
    .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`);

  if (error) {
    console.error('Error checking availability:', error);
    return false;
  }

  return (data || []).length === 0;
}

// Search properties
export async function searchProperties(filters: SearchFilters): Promise<PropertyWithHost[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      host:profiles(*)
    `)
    .eq('is_available', true);

  if (filters.location) {
    query = query.or(`city.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
  }

  if (filters.minPrice) {
    query = query.gte('price_per_night', filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte('price_per_night', filters.maxPrice);
  }

  if (filters.propertyType) {
    query = query.eq('property_type', filters.propertyType);
  }

  if (filters.guests) {
    query = query.gte('max_guests', filters.guests);
  }

  if (filters.amenities && filters.amenities.length > 0) {
    query = query.overlaps('amenities', filters.amenities);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching properties:', error);
    return [];
  }

  return data || [];
} 

// --- Admin: Ad Campaigns ---
export async function getAdCampaigns() {
  const { data, error } = await supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAdCampaign(campaign: Omit<any, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('ad_campaigns').insert(campaign).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateAdCampaign(id: string, updates: Partial<any>) {
  const { data, error } = await supabase.from('ad_campaigns').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteAdCampaign(id: string) {
  const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- Admin: Coupons ---
export async function getCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCoupon(coupon: Omit<any, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('coupons').insert(coupon).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateCoupon(id: string, updates: Partial<any>) {
  const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
  return true;
} 