const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRoomBookingSystem() {
  console.log('🧪 Testing Room-Based Booking System\n');

  try {
    // 1. Test fetching all properties with rooms
    console.log('1. Fetching all properties with rooms...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, price_per_night')
      .eq('is_available', true)
      .neq('id', '02b77cb1-ff10-4f81-b0b5-9959b6e06628'); // Exclude target property

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return;
    }

    console.log(`✅ Found ${properties.length} properties\n`);

    // 2. Test fetching rooms for each property
    console.log('2. Testing room data for each property...');
    let totalRooms = 0;
    let propertiesWithRooms = 0;

    for (const property of properties) {
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, room_type, price, total_inventory, amenities')
        .eq('property_id', property.id);

      if (roomsError) {
        console.error(`❌ Error fetching rooms for ${property.title}:`, roomsError);
        continue;
      }

      if (rooms && rooms.length > 0) {
        propertiesWithRooms++;
        totalRooms += rooms.length;
        console.log(`✅ ${property.title}: ${rooms.length} room types`);
        
        // Verify pricing structure
        const prices = rooms.map(r => r.price).sort((a, b) => a - b);
        const basePrice = prices[0];
        const expectedDeluxe = Math.round(basePrice * 1.5);
        const expectedPremium = Math.round(basePrice * 1.8);
        
        console.log(`   Base: ₹${basePrice}, Deluxe: ₹${expectedDeluxe}, Premium: ₹${expectedPremium}`);
        
        // Check if actual prices match expected
        const deluxeRoom = rooms.find(r => r.room_type === 'deluxe');
        const premiumRoom = rooms.find(r => r.room_type === 'premium');
        
        if (deluxeRoom && Math.abs(deluxeRoom.price - expectedDeluxe) > 50) {
          console.log(`   ⚠️  Deluxe price mismatch: expected ~₹${expectedDeluxe}, got ₹${deluxeRoom.price}`);
        }
        if (premiumRoom && Math.abs(premiumRoom.price - expectedPremium) > 50) {
          console.log(`   ⚠️  Premium price mismatch: expected ~₹${expectedPremium}, got ₹${premiumRoom.price}`);
        }
      } else {
        console.log(`❌ ${property.title}: No rooms found`);
      }
    }

    console.log(`\n✅ ${propertiesWithRooms}/${properties.length} properties have room data`);
    console.log(`✅ Total rooms: ${totalRooms}\n`);

    // 3. Test room inventory
    console.log('3. Testing room inventory...');
    const { data: inventory, error: inventoryError } = await supabase
      .from('room_inventory')
      .select('id, room_id, date, available')
      .gte('date', new Date().toISOString().split('T')[0])
      .lte('date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .limit(10);

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
    } else {
      console.log(`✅ Found ${inventory?.length || 0} inventory records (sample)`);
      if (inventory && inventory.length > 0) {
        console.log(`   Sample: Room ${inventory[0].room_id} on ${inventory[0].date} - ${inventory[0].available} available`);
      }
    }

    // 4. Test booking creation (simulation)
    console.log('\n4. Testing booking creation simulation...');
    
    // Get a sample room
    const { data: sampleRooms, error: sampleError } = await supabase
      .from('rooms')
      .select('id, property_id, name, price')
      .limit(1);

    if (sampleError || !sampleRooms || sampleRooms.length === 0) {
      console.error('Error fetching sample room:', sampleError);
    } else {
      const sampleRoom = sampleRooms[0];
      const checkIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const checkOut = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log(`✅ Sample booking simulation:`);
      console.log(`   Room: ${sampleRoom.name} (₹${sampleRoom.price}/night)`);
      console.log(`   Dates: ${checkIn} to ${checkOut}`);
      console.log(`   Nights: 3`);
      console.log(`   Base cost: ₹${sampleRoom.price * 3}`);
      console.log(`   Extra adult (if any): ₹1500 × 3 = ₹4500`);
      console.log(`   Children breakfast (if any): ₹250 × 3 = ₹750`);
    }

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Total properties: ${properties.length}`);
    console.log(`✅ Properties with rooms: ${propertiesWithRooms}`);
    console.log(`✅ Total room types: ${totalRooms}`);
    console.log(`✅ Average rooms per property: ${(totalRooms / propertiesWithRooms).toFixed(1)}`);
    
    if (propertiesWithRooms === properties.length) {
      console.log('\n🎉 SUCCESS: All properties have room-based booking functionality!');
    } else {
      console.log('\n⚠️  WARNING: Some properties are missing room data');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRoomBookingSystem(); 