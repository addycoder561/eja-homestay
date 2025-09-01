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
  CardCollaboration,
  AdCampaign,
  Coupon
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
  let query = supabase
    .from('properties')
    .select(`
      *,
      reviews(*)
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

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  // Keep original platform ratings separate from Google ratings
  const propertiesWithRatings = (data || []).map(property => {
    const reviews = property.reviews || [];
    
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
    .select(`*, reviews(*)`)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property with reviews:', error, 'for id:', id);
    return null;
  }

  if (!data) return null;

  // Keep original platform ratings separate from Google ratings
  const reviews = data.reviews || [];

  return {
    ...data,
    reviews,
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
    .select(`
      *,
      reviews(*)
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
    console.log('🔍 DEBUG - Applying propertyType filter:', filters.propertyType);
    query = query.eq('property_type', filters.propertyType.toLowerCase());
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
    const reviews = property.reviews || [];
    
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

// --- Marketing: Ad campaigns and coupons ---
export async function getAdCampaigns(limit = 4): Promise<AdCampaign[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,and(start_date.lte.${today})`)
    .or(`end_date.is.null,and(end_date.gte.${today})`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Error fetching ad campaigns:', error);
    return [];
  }
  return (data || []) as AdCampaign[];
}

export async function getActiveCoupons(limit = 10): Promise<Coupon[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .or(`valid_from.is.null,and(valid_from.lte.${today})`)
    .or(`valid_to.is.null,and(valid_to.gte.${today})`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Error fetching active coupons:', error);
    return [];
  }
  return (data || []) as Coupon[];
}

// Wishlist functions
export async function getWishlist(userId: string) {
  console.log('🔍 getWishlist called with userId:', userId);
  
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('❌ Error fetching wishlist:', error);
    return [];
  }
  
  console.log('✅ getWishlist result:', data);
  return data || [];
}

export async function isWishlisted(userId: string, itemId: string, itemType: string) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .single();
  return !!data;
}

export async function addToWishlist(userId: string, itemId: string, itemType: string) {
  console.log('🔖 addToWishlist called:', { userId, itemId, itemType });
  
  // Validate inputs
  if (!userId || !itemId || !itemType) {
    console.error('❌ Invalid inputs for addToWishlist:', { userId, itemId, itemType });
    return false;
  }
  
  // Check if userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error('❌ Invalid user ID format (not UUID):', userId);
    return false;
  }
  
  // Check if item is already in wishlist
  const isAlreadyWishlisted = await isWishlisted(userId, itemId, itemType);
  if (isAlreadyWishlisted) {
    console.log('⚠️ Item already in wishlist, skipping duplicate insert');
    return true; // Return true since the item is already wishlisted
  }
  
  const { error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, item_id: itemId, item_type: itemType });
    
  if (error) {
    console.error('❌ Error adding to wishlist:', error);
    return false;
  }
  
  console.log('✅ Item added to wishlist successfully');
  return true;
}

export async function removeFromWishlist(userId: string, itemId: string, itemType: string) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType);
  if (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
  return true;
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
    .from('experiences')
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
    .from('experiences')
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
  console.log('⚠️ getTrips() called - trips table doesn\'t exist, redirecting to retreats');
  return getRetreats() as any;
}

// New: Retreat functions
export async function getRetreats(): Promise<any[]> {
  try {
    // First try to fetch from retreats table
    const { data, error } = await supabase
      .from('retreats')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching from retreats table:', error);
      // Fallback to trips table if retreats table doesn't exist
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (tripsError) {
        console.error('Error fetching from trips table:', tripsError);
        return [];
      }

      const trips = (tripsData || []).map((row: any) => ({
        ...row,
        image: row.cover_image || (Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null),
      }));

      return trips;
    }

    const retreats = (data || []).map((row: any) => ({
      ...row,
      image: row.cover_image || (Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null),
    }));

    return retreats;
  } catch (error) {
    console.error('Unexpected error in getRetreats:', error);
    return [];
  }
}

export async function getTrip(id: string): Promise<Trip | null> {
  console.log('⚠️ getTrip() called - trips table doesn\'t exist, redirecting to retreats');
  const { data, error } = await supabase
    .from('retreats')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching trip from retreats:', error);
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