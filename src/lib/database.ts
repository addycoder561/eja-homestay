import { supabase } from './supabase';
import { 
  Property, 
  PropertyWithHost, 
  PropertyWithReviews, 
  Booking, 
  BookingWithProperty, 
  Profile, 
  SearchFilters,
  BookingStatus,
  Room,
  RoomInventory,
  BookingRoom,
  Experience,
  Trip,
  BookingWithPropertyAndGuest,
  CardCollaboration
} from './types';

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
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
  } catch (error) {
    console.error('Unexpected error in getProfile:', error);
    return null;
  }
}

export async function ensureProfile(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  // First try to get existing profile
  let profile = await getProfile(userId);
  
  if (!profile) {
    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        is_host: false,
      })
      .select()
      .single();
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating profile:', error);
      }
      return null;
    }
    
    profile = data;
  } else {
    // Update profile if email or name doesn't match
    const needsUpdate = profile.email !== email || 
                       (fullName && profile.full_name !== fullName);
    
    if (needsUpdate) {
      const updates: Partial<Profile> = {};
      if (profile.email !== email) updates.email = email;
      if (fullName && profile.full_name !== fullName) updates.full_name = fullName;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating profile:', error);
        }
      } else {
        profile = data;
      }
    }
  }
  
  return profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Error updating profile:', error);
    }
    return null;
  }

  return data;
}

// Property functions
export async function getProperties(filters?: SearchFilters): Promise<PropertyWithHost[]> {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_available', true);

  if (filters?.location) {
    query = query.ilike('city', `%${filters.location}%`);
  }

  if (filters?.minPrice) {
    query = query.gte('base_price', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('base_price', filters.maxPrice);
  }

  if (filters?.propertyType) {
    query = query.eq('property_type', filters.propertyType);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Error fetching properties:', error);
    }
    return [];
  }

  // Keep original platform ratings separate from Google ratings
  const propertiesWithRatings = (data || []).map(property => {
    return {
      ...property,
      host: null, // Placeholder since we don't have host relationship
      average_rating: property.average_rating || 0, // Keep original platform rating
      review_count: property.review_count || 0 // Keep original platform review count
    };
  });

  return propertiesWithRatings;
}

export async function getProperty(id: string): Promise<PropertyWithHost | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  return data ? { ...data, host: null } : null;
}

export async function getPropertyWithHost(id: string): Promise<PropertyWithHost | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      host:profiles!host_id(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property with host:', error);
    return null;
  }

  return data;
}

export async function getPropertyWithReviews(id: string): Promise<PropertyWithReviews | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`*`)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property with reviews:', error, 'for id:', id);
    return null;
  }

  if (!data) return null;

  // Fetch reviews separately
  const { data: reviews, error: reviewsError } = await supabase
    .from('tales')
    .select('*')
    .eq('item_id', id)
    .eq('review_type', 'property');

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
  }

  return {
    ...data,
    reviews: reviews || [],
    average_rating: data.average_rating || 0, // Keep original platform rating
    review_count: data.review_count || 0 // Keep original platform review count
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
      property:properties!bookings_item_id_fkey(*),
      experience:experiences!bookings_item_id_fkey(*),
      retreat:micro_experiences!bookings_item_id_fkey(*)
    `)
    .eq('user_id', userId) // Changed from guest_id
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function getHostBookings(userId: string): Promise<BookingWithProperty[]> {
  // Query bookings where the host owns the property/experience/retreat
  // Need to join with properties, experiences, and micro_experiences tables
  const { data: propertyBookings, error: propertyError } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties!bookings_item_id_fkey(*)
    `)
    .eq('booking_type', 'property')
    .eq('property.host_id', userId)
    .order('created_at', { ascending: false });

  const { data: experienceBookings, error: experienceError } = await supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences!bookings_item_id_fkey(*)
    `)
    .eq('booking_type', 'experience')
    .eq('experience.host_id', userId)
    .order('created_at', { ascending: false });

  const { data: retreatBookings, error: retreatError } = await supabase
    .from('bookings')
    .select(`
      *,
      retreat:micro_experiences!bookings_item_id_fkey(*)
    `)
    .eq('booking_type', 'retreat')
    .eq('retreat.host_id', userId)
    .order('created_at', { ascending: false });

  if (propertyError || experienceError || retreatError) {
    console.error('Error fetching host bookings:', propertyError || experienceError || retreatError);
    return [];
  }

  // Combine all bookings and sort by created_at
  const allBookings = [
    ...(propertyBookings || []),
    ...(experienceBookings || []),
    ...(retreatBookings || [])
  ].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allBookings;
}

export async function getAllBookings(): Promise<BookingWithPropertyAndGuest[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties!bookings_item_id_fkey(*),
      experience:experiences!bookings_item_id_fkey(*),
      retreat:micro_experiences!bookings_item_id_fkey(*),
      guest:profiles!bookings_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching all bookings:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }
  return data || [];
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
  if (!booking.user_id) {
    console.error('Booking creation failed: user_id is required.');
    return null;
  }
  if (!booking.booking_type) {
    console.error('Booking creation failed: booking_type is required.');
    return null;
  }
  if (!booking.item_id) {
    console.error('Booking creation failed: item_id is required.');
    return null;
  }
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
  if (error) {
    console.error('Error creating booking:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
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
    .eq('booking_type', 'property') // New field - filter by booking type
    .eq('item_id', propertyId) // Changed from property_id
    .in('status', ['confirmed', 'pending'])
    .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`);

  if (error) {
    console.error('Error checking availability:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }

  return (data || []).length === 0;
}

// Search properties
export async function searchProperties(filters: SearchFilters): Promise<PropertyWithHost[]> {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_available', true);

  if (filters.location) {
    query = query.or(`city.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
  }

  if (filters.minPrice) {
    query = query.gte('base_price', filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte('base_price', filters.maxPrice);
  }

  if (filters.propertyType) {
    query = query.eq('property_type', filters.propertyType);
  }

  if (filters.amenities && filters.amenities.length > 0) {
    // Convert amenity IDs to actual amenity names for database query
    const amenityMap: Record<string, string> = {
      'pet-friendly': 'Pet Friendly',
      'pure-veg': 'Pure-Veg'
    };
    
    const dbAmenities = filters.amenities.map(id => amenityMap[id]).filter(Boolean);
    if (dbAmenities.length > 0) {
      query = query.overlaps('amenities', dbAmenities);
    }
  }

  // Handle filter chips
  if (filters.selectedChips && filters.selectedChips.length > 0) {
    const propertyTypeChips = filters.selectedChips.filter(chip => 
              ['Boutique', 'Homely', 'Off-Beat'].includes(chip)
    );
    const tagChips = filters.selectedChips.filter(chip => 
      ['Families-only', 'Females-only', 'Pet Friendly', 'Pure-Veg'].includes(chip)
    );
    const amenityChips = filters.selectedChips.filter(chip => 
      ['WiFi', 'Mountain View'].includes(chip)
    );

    // Filter by property type chips (case-insensitive)
    if (propertyTypeChips.length > 0) {
      // Convert to lowercase for case-insensitive matching
      const dbPropertyTypes = propertyTypeChips.map(chip => chip.toLowerCase());
      query = query.in('property_type', dbPropertyTypes);
    }

    // Filter by tag chips (handle different formats)
    if (tagChips.length > 0) {
      // Tags are already in the correct format (Families-only, Females-only)
      query = query.overlaps('tags', tagChips);
    }

    // Filter by amenity chips (convert to database format)
    if (amenityChips.length > 0) {
      const amenityMap: Record<string, string> = {
        'WiFi': 'WiFi',
        'Mountain View': 'Mountain View'
      };
      const dbAmenities = amenityChips.map(chip => amenityMap[chip]).filter(Boolean);
      if (dbAmenities.length > 0) {
        query = query.overlaps('amenities', dbAmenities);
      }
    }
  }

  // Filter by max adult capacity
  if (filters.adults) {
    query = query.gte('max_guests', filters.adults);
  }

  // Filter by total guest capacity (adults + children)
  if (filters.guests) {
    query = query.gte('max_guests', filters.guests);
  }

  // Filter by max rooms (bedrooms)
  if (filters.rooms) {
    query = query.gte('bedrooms', filters.rooms);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching properties:', error);
    return [];
  }


  let filteredProperties = data || [];

  // Handle preference filters (client-side filtering)
  if (filters.preference && filters.preference.length > 0) {
    filteredProperties = filteredProperties.filter(property => {
      // For now, we'll implement basic preference filtering
      // This can be enhanced based on your specific requirements
      if (filters.preference?.includes('families')) {
        // Filter for family-friendly properties (you can add specific logic)
        return property.max_guests >= 4; // Example: properties that can accommodate families
      }
      if (filters.preference?.includes('females')) {
        // Filter for female-only properties (you can add specific logic)
        return true; // For now, return all properties
      }
      return true;
    });
  }

  // Additional date-based availability filtering
  if (filters.checkIn && filters.checkOut) {
    const checkInDate = new Date(filters.checkIn);
    const checkOutDate = new Date(filters.checkOut);
    
    // Filter out properties that have conflicting bookings
    const availabilityPromises = filteredProperties.map(async (property) => {
      const isAvailable = await checkAvailability(property.id, filters.checkIn!, filters.checkOut!);
      return isAvailable ? property : null;
    });

    const availabilityResults = await Promise.all(availabilityPromises);
    filteredProperties = availabilityResults.filter((property): property is NonNullable<typeof property> => property !== null);
  }

  // Keep original platform ratings separate from Google ratings
  const propertiesWithRatings = filteredProperties.map(property => {
    return {
      ...property,
      host: null, // Placeholder since we don't have host relationship
      average_rating: property.average_rating || 0, // Keep original platform rating
      review_count: property.review_count || 0 // Keep original platform review count
    };
  });

  return propertiesWithRatings;
} 

export async function createExperienceBooking({ experienceId, email, name, date, guests, totalPrice, guestId }: { experienceId: string, email: string, name: string, date: string, guests: number, totalPrice: number, guestId: string }) {
  // Insert booking for authenticated user using new schema
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: guestId, // Changed from guest_id
      booking_type: 'experience' as const, // New field - enum
      item_id: experienceId, // Changed from property_id
      check_in_date: date,
      check_out_date: date, // Using same date for experiences
      guests_count: guests,
      total_price: totalPrice,
      status: 'confirmed' as const, // Enum value
      special_requests: null,
    })
    .select()
    .single();
  if (error) {
    console.error('🔍 Error creating experience booking:', error);
    console.error('🔍 Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
}

export async function createTripBooking({ tripId, email, name, date, guests, totalPrice, guestId }: { tripId: string, email: string, name: string, date: string, guests: number, totalPrice: number, guestId: string }) {
  // Insert booking for authenticated user using new schema
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: guestId, // Changed from guest_id
      booking_type: 'retreat' as const, // Assuming trip is a retreat type
      item_id: tripId, // Changed from trip_id
      check_in_date: date,
      check_out_date: date,
      guests_count: guests,
      total_price: totalPrice,
      status: 'pending' as const, // Enum value
      special_requests: null,
    })
    .select()
    .single();
  if (error) {
    console.error('🔍 Error creating trip booking:', error);
    console.error('🔍 Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
} 



export async function hasCompletedBooking(userId: string, propertyId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', userId) // Changed from guest_id
    .eq('booking_type', 'property') // New field - filter by booking type
    .eq('item_id', propertyId) // Changed from property_id
    .eq('status', 'completed')
    .lte('check_out_date', today);
  if (error) {
    console.error('Error checking completed booking:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
  return (data || []).length > 0;
}

// Engagement features functions

// Like functions (using dare_engagements table with item_id/item_type)
export async function isLiked(userId: string, itemId: string, itemType: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('dare_engagements')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .eq('engagement_type', 'smile')
    .single();
  return !!data;
}

export async function addLike(userId: string, itemId: string, itemType: string): Promise<boolean> {
  // Check if already liked (smile engagement exists)
  const existing = await isLiked(userId, itemId, itemType);
  if (existing) {
    return true; // Already liked
  }
  
  const { error } = await supabase
    .from('dare_engagements')
    .insert([{ 
      user_id: userId, 
      item_id: itemId, 
      item_type: itemType,
      engagement_type: 'smile'
    }]);
  return !error;
}

export async function removeLike(userId: string, itemId: string, itemType: string): Promise<boolean> {
  const { error } = await supabase
    .from('dare_engagements')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .eq('engagement_type', 'smile');
  return !error;
}

export async function getLikesCount(itemId: string, itemType: string): Promise<number> {
  const { count, error } = await supabase
    .from('dare_engagements')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .eq('engagement_type', 'smile');
  return error ? 0 : (count || 0);
}

// Share functions (using dare_engagements table with item_id/item_type)
export async function addShare(userId: string, itemId: string, itemType: string, platform: string): Promise<boolean> {
  const { error } = await supabase
    .from('dare_engagements')
    .insert([{ 
      user_id: userId, 
      item_id: itemId, 
      item_type: itemType, 
      engagement_type: 'share',
      engagement_value: platform
    }]);
  return !error;
}

export async function getSharesCount(itemId: string, itemType: string): Promise<number> {
  const { count, error } = await supabase
    .from('dare_engagements')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .eq('engagement_type', 'share');
  return error ? 0 : (count || 0);
}





// Test function to check if bucketlist table exists
export async function testBucketlistTable() {
  if (process.env.NODE_ENV !== 'production') {
  console.log('🧪 Testing bucketlist table access...');
  }
  
  try {
    const { data, error } = await supabase
      .from('bucketlist')
      .select('count')
      .limit(1);
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Bucketlist table test failed:', error);
      }
      return false;
    }
    
    if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Bucketlist table is accessible');
    }
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Bucketlist table test error:', err);
    }
    return false;
  }
}

// Bucketlist functions
export async function getBucketlist(userId: string) {
  const { data, error } = await supabase
    .from('bucketlist')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error fetching bucketlist:', error);
    }
    return [];
  }
  
  return data || [];
}

export async function isBucketlisted(userId: string, itemId: string, itemType: string) {
  const { data, error } = await supabase
    .from('bucketlist')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType);
    
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error checking bucketlist status:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    }
    return false;
  }
  
  return !!data && data.length > 0;
}

export async function addToBucketlist(userId: string, itemId: string, itemType: string) {
  // Validate inputs
  if (!userId || !itemId || !itemType) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Invalid inputs for addToBucketlist:', { userId, itemId, itemType });
    }
    return false;
  }
  
  // Check if userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Invalid user ID format (not UUID):', userId);
    }
    return false;
  }
  
  // Check if item is already in bucketlist
  const isAlreadyBucketlisted = await isBucketlisted(userId, itemId, itemType);
  if (isAlreadyBucketlisted) {
    return true; // Return true since the item is already bucketlisted
  }
  
  try {
    const { data, error } = await supabase
      .from('bucketlist')
      .insert({ user_id: userId, item_id: itemId, item_type: itemType })
      .select();
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error adding to bucketlist:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      }
      return false;
    }
    
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Exception in addToBucketlist:', err);
    }
    return false;
  }
}

export async function removeFromBucketlist(userId: string, itemId: string, itemType: string) {
  try {
    // First, let's check what records exist for this user and item (any type)
    const { data: allUserRecords } = await supabase
      .from('bucketlist')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId);
    
    // Then check for the specific type we're trying to delete
    const { data: existingRecords, error: fetchError } = await supabase
      .from('bucketlist')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
      
    if (fetchError && process.env.NODE_ENV !== 'production') {
      console.error('❌ Error fetching existing records:', fetchError);
    }
    
    // Try to delete with the specific type first
    let { error } = await supabase
      .from('bucketlist')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
      
    // If no records were found with the specific type, try deleting all records for this user+item
    if (!error && allUserRecords && allUserRecords.length > 0 && existingRecords && existingRecords.length === 0) {
      const { error: deleteAllError } = await supabase
        .from('bucketlist')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
        
      if (deleteAllError) {
        error = deleteAllError;
      }
    }
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error removing from bucketlist:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      }
      return false;
    }
    
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Exception in removeFromBucketlist:', err);
    }
    return false;
  }
} 

// --- Multi-room inventory functions ---

// Get all rooms for a property
export async function getRoomsForProperty(propertyId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId);
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  return data || [];
}

// Get room inventory for a room in a date range
export async function getRoomInventory(roomId: string, startDate: string, endDate: string): Promise<RoomInventory[]> {
  const { data, error } = await supabase
    .from('room_inventory')
    .select('*')
    .eq('room_id', roomId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) {
    console.error('Error fetching room inventory:', error);
    return [];
  }
  return data || [];
}

// Check if a room is available for the given date range
export async function checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('room_inventory')
    .select('available, date')
    .eq('room_id', roomId)
    .gte('date', checkIn)
    .lt('date', checkOut); // checkOut is exclusive
  if (error) {
    console.error('Error checking room availability:', error);
    return false;
  }
  // Room is available if all days in range have available > 0
  return (data || []).every((inv: { available: number }) => inv.available > 0);
}

// Check if all requested rooms/units are available for the date range
export async function checkMultiRoomAvailability(
  requests: { room_id: string; quantity: number; check_in: string; check_out: string }[]
): Promise<boolean> {
  for (const req of requests) {
    const { room_id, quantity, check_in, check_out } = req;
    const { data, error } = await supabase
      .from('room_inventory')
      .select('available, date')
      .eq('room_id', room_id)
      .gte('date', check_in)
      .lt('date', check_out);
    if (error) {
      console.error('Error checking room availability:', error);
      return false;
    }
    if ((data || []).some((inv: { available: number }) => inv.available < quantity)) {
      return false;
    }
  }
  return true;
}

// Create a booking for multiple rooms/units and decrement inventory
export async function createMultiRoomBooking(
  booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>,
  rooms: { room_id: string; quantity: number; check_in: string; check_out: string }[],
  payment_ref?: string | null // Note: payment_ref field removed from schema, keeping param for backward compatibility
): Promise<Booking | null> {
  // 1. Check availability for all rooms
  const isAvailable = await checkMultiRoomAvailability(rooms);
  if (!isAvailable) {
    console.error('One or more rooms are not available for selected dates/quantities');
    return null;
  }
  // 2. Create booking using new schema (payment_ref field removed)
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .insert(booking) // payment_ref field removed from schema
    .select()
    .single();
  if (bookingError || !bookingData) {
    console.error('Error creating booking:', bookingError);
    console.error('Error details:', JSON.stringify(bookingError, null, 2));
    return null;
  }
  // 3. Update booking with room information and decrement inventory
  // Note: booking_rooms table doesn't exist - room info stored in bookings table
  for (const req of rooms) {
    // Room information should be stored in the booking record itself
    // If separate room tracking is needed, update the booking with room details
    // TODO: Determine how to store multiple rooms per booking in the bookings table
    // Decrement inventory for each date
    const start = new Date(req.check_in);
    const end = new Date(req.check_out);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      // Fetch current available
      const { data: invData, error: invError } = await supabase
        .from('room_inventory')
        .select('available')
        .eq('room_id', req.room_id)
        .eq('date', dateStr)
        .single();
      if (invError || !invData) {
        console.error('Error fetching inventory:', invError);
        continue;
      }
      const newAvailable = invData.available - req.quantity;
      await supabase
        .from('room_inventory')
        .update({ available: newAvailable })
        .eq('room_id', req.room_id)
        .eq('date', dateStr);
    }
  }
  return bookingData;
} 

// Experience functions
export async function getExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('experiences_with_host')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
  return data || [];
}

export async function getExperience(id: string): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences_with_host')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching experience:', error);
    return null;
  }
  return data;
}

export async function createExperience(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences')
    .insert(experience)
    .select()
    .single();
  if (error) {
    console.error('Error creating experience:', error);
    return null;
  }
  return data;
}

export async function updateExperience(id: string, updates: Partial<Experience>): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating experience:', error);
    return null;
  }
  return data;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting experience:', error);
    return false;
  }
  return true;
} 

// Trip functions (redirected to retreats since trips table doesn't exist)
export async function getTrips(): Promise<Trip[]> {
  return getRetreats() as any;
}

// New: Retreat functions (now using unified table)
export async function getRetreats(): Promise<any[]> {
  try {
    // Fetch from unified table, filtering for Retreats
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('is_active', true)
      .eq('location', 'Retreats')
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching retreats from unified table:', error);
      }
      return [];
    }

    const retreats = (data || []).map((row: any) => ({
      ...row,
      image: row.cover_image,
    }));

    return retreats;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Unexpected error in getRetreats:', error);
    }
    return [];
  }
}

export async function getTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .eq('location', 'Retreats')
    .single();
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Error fetching trip from unified table:', error);
    }
    return null;
  }
  return data;
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('experiences')
    .insert(trip)
    .select()
    .single();
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating trip in experiences:', error);
    }
    return null;
  }
  return data;
}

export async function updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('experiences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating trip in experiences:', error);
  }
  return null;
  }
  return data;
}

export async function deleteTrip(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id);
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting trip from experiences:', error);
    }
    return false;
  }
  return true;
} 

export async function setRoomInventory(roomId: string, date: string, available: number): Promise<boolean> {
  const { error } = await supabase
    .from('room_inventory')
    .upsert({ room_id: roomId, date, available }, { onConflict: 'room_id,date' });
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Error setting room inventory:', error);
    }
    return false;
  }
  return true;
}




// Function to get unique experience categories
export async function getExperienceCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('categories')
      .eq('is_active', true);
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching experience categories:', error);
      }
      return [];
    }
    
    const allCategories = data?.flatMap(exp => {
      if (Array.isArray(exp.categories)) {
        return exp.categories;
      } else if (exp.categories) {
        return [exp.categories];
      }
      return [];
    }).filter(Boolean) || [];
    
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Unexpected error fetching experience categories:', error);
    }
    return [];
  }
}

// Function to get unique retreat categories (now using experiences)
export async function getRetreatCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('categories')
      .eq('is_active', true);
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching retreat categories:', error);
      }
      return [];
    }
    
    const allCategories = data?.flatMap(retreat => {
      if (Array.isArray(retreat.categories)) {
        return retreat.categories;
      } else if (retreat.categories) {
        return [retreat.categories];
      }
      return [];
    }).filter(Boolean) || [];
    
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Unexpected error fetching retreat categories:', error);
    }
    return [];
  }
}

// Notification functions
export async function getNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error fetching notifications:', error);
      }
      return [];
    }
    
    return data || [];
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ getNotifications error:', error);
    }
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error fetching unread notification count:', error);
      }
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ getUnreadNotificationCount error:', error);
    }
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error marking notification as read:', error);
      }
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ markNotificationAsRead error:', error);
    }
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error marking all notifications as read:', error);
      }
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ markAllNotificationsAsRead error:', error);
    }
    throw error;
  }
}

export async function createNotification(userId: string, title: string, message: string, type: string = 'info', actionUrl?: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl
      })
      .select();
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error creating notification:', error);
      }
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ createNotification error:', error);
    }
    throw error;
  }
}

export async function createWelcomeNotifications(userId: string) {
  try {
    const welcomeNotifications = [
      {
        user_id: userId,
        title: 'Welcome to EJA!',
        message: 'Welcome to EJA Homestay! Start exploring amazing experiences and create your own.',
        type: 'success',
        action_url: '/discover'
      },
      {
        user_id: userId,
        title: 'Discover Experiences',
        message: 'Check out the latest adventure experiences near you. Find your perfect match!',
        type: 'info',
        action_url: '/discover?mood=Adventure'
      },
      {
        user_id: userId,
        title: 'Create Your First Experience',
        message: 'Ready to share your passion? Create and host your own unique experience.',
        type: 'info',
        action_url: '/'
      }
    ];

    const { data, error } = await supabase
      .from('notifications')
      .insert(welcomeNotifications)
      .select();
      
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error creating welcome notifications:', error);
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ createWelcomeNotifications error:', error);
    }
    throw error;
  }
} 