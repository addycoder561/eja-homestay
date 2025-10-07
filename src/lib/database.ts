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

export async function ensureProfile(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  console.log('🔍 Ensuring profile exists for user:', userId);
  
  // First try to get existing profile
  let profile = await getProfile(userId);
  
  if (!profile) {
    console.log('🔍 Profile not found, creating new profile...');
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
      console.error('Error creating profile:', error);
      return null;
    }
    
    profile = data;
    console.log('🔍 New profile created:', profile);
  } else {
    console.log('🔍 Existing profile found:', profile);
    
    // Update profile if email or name doesn't match
    const needsUpdate = profile.email !== email || 
                       (fullName && profile.full_name !== fullName);
    
    if (needsUpdate) {
      console.log('🔍 Updating profile to match auth data...');
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
        console.error('Error updating profile:', error);
      } else {
        profile = data;
        console.log('🔍 Profile updated:', profile);
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
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

// Property functions
export async function getProperties(filters?: SearchFilters): Promise<PropertyWithHost[]> {
  console.log('🔍 DEBUG - getProperties called with filters:', filters);
  
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
    console.error('Error fetching properties:', error);
    return [];
  }

  console.log('🔍 DEBUG - getProperties found', data?.length || 0, 'properties');
  console.log('🔍 DEBUG - First few properties:', data?.slice(0, 3).map(p => ({ id: p.id, title: p.title, is_available: p.is_available })));

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
    .from('reviews')
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

export async function getAllBookings(): Promise<BookingWithPropertyAndGuest[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, property:properties(*), guest:profiles(*)`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching all bookings:', error);
    return [];
  }
  return data || [];
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
  if (!booking.guest_id) {
    console.error('Booking creation failed: guest_id is required.');
    return null;
  }
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
  console.log('🔍 DEBUG - searchProperties called with filters:', filters);
  
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
    console.log('🔍 DEBUG - Applying propertyType filter:', filters.propertyType);
    query = query.eq('property_type', filters.propertyType);
  }

  if (filters.amenities && filters.amenities.length > 0) {
    console.log('🔍 DEBUG - Applying amenities filter:', filters.amenities);
    // Convert amenity IDs to actual amenity names for database query
    const amenityMap: Record<string, string> = {
      'pet-friendly': 'Pet Friendly',
      'pure-veg': 'Pure-Veg'
    };
    
    const dbAmenities = filters.amenities.map(id => amenityMap[id]).filter(Boolean);
    console.log('🔍 DEBUG - Converted amenities:', dbAmenities);
    if (dbAmenities.length > 0) {
      query = query.overlaps('amenities', dbAmenities);
    }
  }

  // Handle filter chips
  if (filters.selectedChips && filters.selectedChips.length > 0) {
    console.log('🔍 DEBUG - Processing selectedChips:', filters.selectedChips);
    
    const propertyTypeChips = filters.selectedChips.filter(chip => 
              ['Boutique', 'Homely', 'Off-Beat'].includes(chip)
    );
    const tagChips = filters.selectedChips.filter(chip => 
      ['Families-only', 'Females-only', 'Pet Friendly', 'Pure-Veg'].includes(chip)
    );
    const amenityChips = filters.selectedChips.filter(chip => 
      ['WiFi', 'Mountain View'].includes(chip)
    );

    console.log('🔍 DEBUG - Property type chips:', propertyTypeChips);
    console.log('🔍 DEBUG - Tag chips:', tagChips);
    console.log('🔍 DEBUG - Amenity chips:', amenityChips);

    // Filter by property type chips (case-insensitive)
    if (propertyTypeChips.length > 0) {
      console.log('🔍 DEBUG - Applying property type chips filter:', propertyTypeChips);
      // Convert to lowercase for case-insensitive matching
      const dbPropertyTypes = propertyTypeChips.map(chip => chip.toLowerCase());
      query = query.in('property_type', dbPropertyTypes);
    }

    // Filter by tag chips (handle different formats)
    if (tagChips.length > 0) {
      console.log('🔍 DEBUG - Applying tag chips filter:', tagChips);
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
      console.log('🔍 DEBUG - Converted amenity chips:', dbAmenities);
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

  console.log('🔍 DEBUG - Query results:', data?.length || 0, 'properties found');
  console.log('🔍 DEBUG - First few properties:', data?.slice(0, 3).map(p => ({ id: p.id, title: p.title, property_type: p.property_type, amenities: p.amenities, tags: p.tags })));

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
  // Insert booking for authenticated user
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      experience_id: experienceId,
      guest_id: guestId,
      check_in_date: date,
      check_out_date: date,
      guests_count: guests,
      total_price: totalPrice,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createTripBooking({ tripId, email, name, date, guests, totalPrice, guestId }: { tripId: string, email: string, name: string, date: string, guests: number, totalPrice: number, guestId: string }) {
  // Insert booking for authenticated user
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      trip_id: tripId,
      guest_id: guestId,
      check_in_date: date,
      check_out_date: date,
      guests_count: guests,
      total_price: totalPrice,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
} 



export async function hasCompletedBooking(userId: string, propertyId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('guest_id', userId)
    .eq('property_id', propertyId)
    .eq('status', 'completed')
    .lte('check_out_date', today);
  if (error) {
    console.error('Error checking completed booking:', error);
    return false;
  }
  return (data || []).length > 0;
}

// Engagement features functions

// Like functions
export async function isLiked(userId: string, itemId: string, itemType: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .single();
  return !!data;
}

export async function addLike(userId: string, itemId: string, itemType: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .insert([{ user_id: userId, item_id: itemId, item_type: itemType }]);
  return !error;
}

export async function removeLike(userId: string, itemId: string, itemType: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType);
  return !error;
}

export async function getLikesCount(itemId: string, itemType: string): Promise<number> {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('item_type', itemType);
  return error ? 0 : (count || 0);
}

// Share functions
export async function addShare(userId: string, itemId: string, itemType: string, platform: string): Promise<boolean> {
  const { error } = await supabase
    .from('shares')
    .insert([{ user_id: userId, item_id: itemId, item_type: itemType, platform }]);
  return !error;
}

export async function getSharesCount(itemId: string, itemType: string): Promise<number> {
  const { count, error } = await supabase
    .from('shares')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('item_type', itemType);
  return error ? 0 : (count || 0);
}



// Collaboration functions
export async function addCardCollaboration(
  userId: string, 
  itemId: string, 
  itemType: string, 
  collaborationType: string,
  userData: {
    name: string;
    email: string;
    phone?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    proposal: string;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('card_collaborations')
    .insert([{
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      collaboration_type: collaborationType,
      user_name: userData.name,
      user_email: userData.email,
      user_phone: userData.phone,
      user_instagram: userData.instagram,
      user_youtube: userData.youtube,
      user_tiktok: userData.tiktok,
      proposal: userData.proposal
    }]);
  return !error;
}

export async function getUserCollaborations(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('card_collaborations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
} 


// Test function to check if wishlist table exists
export async function testWishlistTable() {
  console.log('🧪 Testing wishlist table access...');
  
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('❌ Wishlist table test failed:', error);
      return false;
    }
    
    console.log('✅ Wishlist table is accessible');
    return true;
  } catch (err) {
    console.error('❌ Wishlist table test error:', err);
    return false;
  }
}

// Bucketlist functions
export async function getBucketlist(userId: string) {
  console.log('🔍 getBucketlist called with userId:', userId);
  
  const { data, error } = await supabase
    .from('bucketlist')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('❌ Error fetching bucketlist:', error);
    return [];
  }
  
  console.log('✅ getBucketlist result:', data);
  return data || [];
}

export async function isBucketlisted(userId: string, itemId: string, itemType: string) {
  console.log('🔍 isBucketlisted called:', { userId, itemId, itemType });
  
  const { data, error } = await supabase
    .from('bucketlist')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType);
    
  if (error) {
    console.error('❌ Error checking bucketlist status:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }
  
  console.log('✅ isBucketlisted result:', !!data && data.length > 0, 'Data:', data);
  return !!data && data.length > 0;
}

export async function addToBucketlist(userId: string, itemId: string, itemType: string) {
  console.log('🔖 addToBucketlist called:', { userId, itemId, itemType });
  
  // Validate inputs
  if (!userId || !itemId || !itemType) {
    console.error('❌ Invalid inputs for addToBucketlist:', { userId, itemId, itemType });
    return false;
  }
  
  // Check if userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error('❌ Invalid user ID format (not UUID):', userId);
    return false;
  }
  
  // Check if item is already in bucketlist
  const isAlreadyBucketlisted = await isBucketlisted(userId, itemId, itemType);
  if (isAlreadyBucketlisted) {
    console.log('⚠️ Item already in bucketlist, skipping duplicate insert');
    return true; // Return true since the item is already bucketlisted
  }
  
  console.log('🔄 Attempting to insert into bucketlist table...');
  try {
    const { data, error } = await supabase
      .from('bucketlist')
      .insert({ user_id: userId, item_id: itemId, item_type: itemType })
      .select();
      
    if (error) {
      console.error('❌ Error adding to bucketlist:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Item added to wishlist successfully:', data);
    return true;
  } catch (err) {
    console.error('❌ Exception in addToBucketlist:', err);
    return false;
  }
}

export async function removeFromBucketlist(userId: string, itemId: string, itemType: string) {
  console.log('🗑️ removeFromBucketlist called:', { userId, itemId, itemType });
  
  try {
    const { error } = await supabase
      .from('bucketlist')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
      
    if (error) {
      console.error('❌ Error removing from bucketlist:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Item removed from wishlist successfully');
    return true;
  } catch (err) {
    console.error('❌ Exception in removeFromBucketlist:', err);
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
  payment_ref?: string | null
): Promise<Booking | null> {
  // 1. Check availability for all rooms
  const isAvailable = await checkMultiRoomAvailability(rooms);
  if (!isAvailable) {
    console.error('One or more rooms are not available for selected dates/quantities');
    return null;
  }
  // 2. Create booking
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .insert({ ...booking, payment_ref })
    .select()
    .single();
  if (bookingError || !bookingData) {
    console.error('Error creating booking:', bookingError);
    return null;
  }
  // 3. Create booking_rooms and decrement inventory
  for (const req of rooms) {
    // Create booking_rooms entry
    const { error: brError } = await supabase
      .from('booking_rooms')
      .insert({
        booking_id: bookingData.id,
        room_id: req.room_id,
        quantity: req.quantity,
        check_in: req.check_in,
        check_out: req.check_out,
      });
    if (brError) {
      console.error('Error creating booking_rooms:', brError);
      // Optionally: rollback booking here
    }
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
    .from('experiences_unified')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
  return data || [];
}

export async function getExperience(id: string): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences_unified')
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
    .from('experiences_unified')
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
    .from('experiences_unified')
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
    .from('experiences_unified')
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
  console.log('⚠️ getTrips() called - trips table doesn\'t exist, redirecting to retreats');
  return getRetreats() as any;
}

// New: Retreat functions (now using unified table)
export async function getRetreats(): Promise<any[]> {
  try {
    // Fetch from unified table, filtering for Retreats
    const { data, error } = await supabase
      .from('experiences_unified')
      .select('*')
      .eq('is_active', true)
      .eq('location', 'Retreats')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching retreats from unified table:', error);
      return [];
    }

    const retreats = (data || []).map((row: any) => ({
      ...row,
      image: row.cover_image,
    }));

    return retreats;
  } catch (error) {
    console.error('Unexpected error in getRetreats:', error);
    return [];
  }
}

export async function getTrip(id: string): Promise<Trip | null> {
  console.log('⚠️ getTrip() called - using unified table for retreats');
  const { data, error } = await supabase
    .from('experiences_unified')
    .select('*')
    .eq('id', id)
    .eq('location', 'Retreats')
    .single();
  if (error) {
    console.error('Error fetching trip from unified table:', error);
    return null;
  }
  return data;
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip | null> {
  console.log('⚠️ createTrip() called - trips table doesn\'t exist, redirecting to retreats');
  const { data, error } = await supabase
    .from('retreats')
    .insert(trip)
    .select()
    .single();
  if (error) {
    console.error('Error creating trip in retreats:', error);
    return null;
  }
  return data;
}

export async function updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
  console.log('⚠️ updateTrip() called - trips table doesn\'t exist, redirecting to retreats');
  const { data, error } = await supabase
    .from('retreats')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating trip in retreats:', error);
    return null;
  }
  return null;
}

export async function deleteTrip(id: string): Promise<boolean> {
  console.log('⚠️ deleteTrip() called - trips table doesn\'t exist, redirecting to retreats');
  const { error } = await supabase
    .from('retreats')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting trip from retreats:', error);
    return false;
  }
  return true;
} 

export async function setRoomInventory(roomId: string, date: string, available: number): Promise<boolean> {
  const { error } = await supabase
    .from('room_inventory')
    .upsert({ room_id: roomId, date, available }, { onConflict: 'room_id,date' });
  if (error) {
    console.error('Error setting room inventory:', error);
    return false;
  }
  return true;
}

// Function to check database content for debugging
export async function checkDatabaseContent(): Promise<void> {
  console.log('🔍 DEBUG - Checking database content...');
  
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, property_type, amenities, tags')
    .eq('is_available', true)
    .limit(10);
  
  if (error) {
    console.error('🔍 DEBUG - Error fetching data:', error);
    return;
  }
  
  console.log('🔍 DEBUG - Total properties found:', data?.length || 0);
  
  // Check property types
  const propertyTypes = [...new Set(data?.map(p => p.property_type).filter(Boolean))];
  console.log('🔍 DEBUG - Available property types:', propertyTypes);
  
  // Check amenities
  const allAmenities = data?.flatMap(p => p.amenities || []).filter(Boolean);
  const uniqueAmenities = [...new Set(allAmenities)];
  console.log('🔍 DEBUG - Available amenities:', uniqueAmenities);
  
  // Check tags
  const allTags = data?.flatMap(p => p.tags || []).filter(Boolean);
  const uniqueTags = [...new Set(allTags)];
  console.log('🔍 DEBUG - Available tags:', uniqueTags);
  
  // Show sample properties
  console.log('🔍 DEBUG - Sample properties:');
  data?.slice(0, 3).forEach((property, index) => {
    console.log(`  Property ${index + 1}:`, {
      id: property.id,
      title: property.title,
      property_type: property.property_type,
      amenities: property.amenities,
      tags: property.tags
    });
  });
}

// Function to check experiences database content for debugging
export async function checkExperiencesContent(): Promise<void> {
  console.log('🔍 DEBUG - Checking experiences database content...');
  
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('is_active', true)
    .limit(10);
  
  if (error) {
    console.error('🔍 DEBUG - Error fetching experiences:', error);
    return;
  }
  
  console.log('🔍 DEBUG - Total experiences found:', data?.length || 0);
  
  // Check categories
  const allCategories = data?.flatMap(exp => {
    if (Array.isArray(exp.categories)) {
      return exp.categories;
    } else if (exp.categories) {
      return [exp.categories];
    }
    return [];
  }).filter(Boolean);
  const uniqueCategories = [...new Set(allCategories)];
  console.log('🔍 DEBUG - Available experience categories:', uniqueCategories);
  console.log('🔍 DEBUG - Experience categories data types:', data?.map(e => ({ 
    id: e.id, 
    title: e.title, 
    categories: e.categories, 
    isArray: Array.isArray(e.categories) 
  })));
  
  // Check host names
  const hostNames = [...new Set(data?.map(exp => exp.host_name).filter(Boolean))];
  console.log('🔍 DEBUG - Available host names:', hostNames);
  
  // Show sample experiences
  console.log('🔍 DEBUG - Sample experiences:');
  data?.slice(0, 3).forEach((experience, index) => {
    console.log(`  Experience ${index + 1}:`, {
      id: experience.id,
      title: experience.title,
      location: experience.location,
      price: experience.price,
      duration: experience.duration,
      categories: experience.categories,
      host_name: experience.host_name,
      host_type: experience.host_type,
      images: experience.images?.length || 0,
      cover_image: experience.cover_image ? 'Yes' : 'No',
      unique_propositions: experience.unique_propositions?.length || 0
    });
  });
}

// Function to check retreats database content for debugging
export async function checkRetreatsContent(): Promise<void> {
  console.log('🔍 DEBUG - Checking retreats database content...');
  
  const { data, error } = await supabase
    .from('retreats')
    .select('id, title, subtitle, location, price, duration, categories, host_name, host_type, unique_propositions')
    .eq('is_active', true)
    .limit(10);
  
  if (error) {
    console.error('🔍 DEBUG - Error fetching retreats:', error);
    return;
  }
  
  console.log('🔍 DEBUG - Total retreats found:', data?.length || 0);
  
  // Check categories
  const allCategories = data?.flatMap(r => Array.isArray(r.categories) ? r.categories : [r.categories]).filter(Boolean);
  const uniqueCategories = [...new Set(allCategories)];
  console.log('🔍 DEBUG - Available retreat categories:', uniqueCategories);
  console.log('🔍 DEBUG - Categories data types:', data?.map(r => ({ 
    id: r.id, 
    title: r.title, 
    categories: r.categories, 
    isArray: Array.isArray(r.categories) 
  })));
  
  // Check host types
  const hostTypes = [...new Set(data?.map(r => r.host_type).filter(Boolean))];
  console.log('🔍 DEBUG - Available host types:', hostTypes);
  
  // Check unique propositions
  const allPropositions = data?.flatMap(r => r.unique_propositions || []).filter(Boolean);
  const uniquePropositions = [...new Set(allPropositions)];
  console.log('🔍 DEBUG - Available unique propositions:', uniquePropositions);
  
  // Log sample retreat data
  if (data && data.length > 0) {
    console.log('🔍 DEBUG - Sample retreat data:', data[0]);
  }
  
  // Show sample retreats
  console.log('🔍 DEBUG - Sample retreats:');
  data?.slice(0, 3).forEach((retreat, index) => {
    console.log(`  Retreat ${index + 1}:`, {
      id: retreat.id,
      title: retreat.title,
      subtitle: retreat.subtitle,
      location: retreat.location,
      price: retreat.price,
      duration: retreat.duration,
      categories: retreat.categories,
      host_name: retreat.host_name,
      host_type: retreat.host_type,
      unique_propositions: retreat.unique_propositions?.length || 0
    });
  });
}

// Function to get unique experience categories
export async function getExperienceCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('categories')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching experience categories:', error);
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
    console.error('Unexpected error fetching experience categories:', error);
    return [];
  }
}

// Function to get unique retreat categories
export async function getRetreatCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('retreats')
      .select('categories')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching retreat categories:', error);
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
    console.error('Unexpected error fetching retreat categories:', error);
    return [];
  }
}

// Notification functions
export async function getNotifications(userId: string) {
  console.log('🔔 getNotifications called for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
    
    console.log('✅ Notifications fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ getNotifications error:', error);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string) {
  console.log('🔔 getUnreadNotificationCount called for user:', userId);
  
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) {
      console.error('❌ Error fetching unread notification count:', error);
      return 0;
    }
    
    console.log('✅ Unread notifications count:', count || 0);
    return count || 0;
  } catch (error) {
    console.error('❌ getUnreadNotificationCount error:', error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  console.log('🔔 markNotificationAsRead called for notification:', notificationId);
  
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
    
    console.log('✅ Notification marked as read');
    return { success: true };
  } catch (error) {
    console.error('❌ markNotificationAsRead error:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  console.log('🔔 markAllNotificationsAsRead called for user:', userId);
  
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
    
    console.log('✅ All notifications marked as read');
    return { success: true };
  } catch (error) {
    console.error('❌ markAllNotificationsAsRead error:', error);
    throw error;
  }
}

export async function createNotification(userId: string, title: string, message: string, type: string = 'info', actionUrl?: string) {
  console.log('🔔 createNotification called:', { userId, title, message, type, actionUrl });
  
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
      console.error('❌ Error creating notification:', error);
      throw error;
    }
    
    console.log('✅ Notification created:', data);
    return data?.[0];
  } catch (error) {
    console.error('❌ createNotification error:', error);
    throw error;
  }
}

export async function createWelcomeNotifications(userId: string) {
  console.log('🔔 createWelcomeNotifications called for user:', userId);
  
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
      console.error('❌ Error creating welcome notifications:', error);
      throw error;
    }
    
    console.log('✅ Welcome notifications created:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ createWelcomeNotifications error:', error);
    throw error;
  }
} 