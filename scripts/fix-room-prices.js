import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixRoomPrices() {
  try {
    console.log('🔧 Starting room price fix...');
    
    // First, let's check what rooms exist and their current state
    console.log('📋 Fetching existing rooms...');
    const { data: rooms, error: fetchError } = await supabase
      .from('rooms')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching rooms:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${rooms.length} rooms`);
    
    // Check which rooms need fixing
    const roomsToFix = rooms.filter(room => !room.price_per_night || room.price_per_night === 0);
    console.log(`🔧 ${roomsToFix.length} rooms need price fixing`);
    
    if (roomsToFix.length === 0) {
      console.log('✅ All rooms already have proper prices!');
      return;
    }
    
    // Get property prices to calculate room prices
    const propertyIds = [...new Set(roomsToFix.map(room => room.property_id))];
    console.log(`📋 Fetching ${propertyIds.length} properties for price calculation...`);
    
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, price_per_night')
      .in('id', propertyIds);
    
    if (propError) {
      console.error('❌ Error fetching properties:', propError);
      return;
    }
    
    const propertyPrices = {};
    properties.forEach(prop => {
      propertyPrices[prop.id] = prop.price_per_night;
    });
    
    // Fix each room
    console.log('🔄 Fixing room prices...');
    for (const room of roomsToFix) {
      const propertyPrice = propertyPrices[room.property_id];
      if (!propertyPrice) {
        console.log(`⚠️  No property price found for room ${room.id}, skipping`);
        continue;
      }
      
      // Calculate room price based on room type
      let roomPrice = propertyPrice; // Default to property price
      
      if (room.room_type === 'deluxe') {
        roomPrice = Math.round(propertyPrice * 1.3); // 30% increase
      } else if (room.room_type === 'premium') {
        roomPrice = Math.round(propertyPrice * 1.5); // 50% increase
      }
      
      // Update the room
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ 
          price_per_night: roomPrice
        })
        .eq('id', room.id);
      
      if (updateError) {
        console.error(`❌ Error updating room ${room.id}:`, updateError);
      } else {
        console.log(`✅ Fixed room ${room.name}: ₹${roomPrice}/night`);
      }
    }
    
    console.log('🎉 Room price fix completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
fixRoomPrices();
