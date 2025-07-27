const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPaths = [
  '.env.local',
  '../.env.local',
  '../../.env.local',
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '../.env.local')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('❌ No .env.local file found!');
  process.exit(1);
}

// Initialize Supabase client with service role key (if available) or anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Room type configurations
const ROOM_TYPES = [
  {
    name: 'Standard Room',
    description: 'Comfortable room with essential amenities for a pleasant stay',
    room_type: 'standard',
    price_multiplier: 1.0, // Base price
    extra_adult_price: 1500,
    amenities: ['WiFi', 'Fan', 'Geyser', 'Attached Bathroom']
  },
  {
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities and enhanced comfort',
    room_type: 'deluxe',
    price_multiplier: 1.3, // 30% increase
    extra_adult_price: 2000,
    amenities: ['WiFi', 'AC', 'Geyser', 'TV', 'Attached Bathroom', 'Mountain View']
  },
  {
    name: 'Premium Suite',
    description: 'Luxury suite with top-tier amenities and exclusive features',
    room_type: 'premium',
    price_multiplier: 1.5, // 50% increase (30% + 20%)
    extra_adult_price: 2500,
    amenities: ['WiFi', 'AC', 'Geyser', 'TV', 'Attached Bathroom', 'Mountain View', 'Balcony', 'Premium Bedding']
  }
];

// Generate room configuration for a property
function generateRoomConfig(basePrice) {
  return {
    room_types: ROOM_TYPES.map(roomType => ({
      name: roomType.name,
      description: roomType.description,
      room_type: roomType.room_type,
      base_price: Math.round(basePrice * roomType.price_multiplier),
      total_inventory: 2, // 2 units per room type as specified
      amenities: roomType.amenities,
      extra_adult_price: roomType.extra_adult_price,
      child_breakfast_price: 250 // Fixed as specified
    }))
  };
}

// Generate 180 days of inventory data
function generateInventoryData(roomId, totalInventory) {
  const inventory = [];
  const startDate = new Date();
  
  for (let i = 0; i < 180; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    inventory.push({
      room_id: roomId,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      available: totalInventory
    });
  }
  
  return inventory;
}

async function generateRoomData() {
  try {
    console.log('🚀 Starting room data generation...');
    
    // Fetch all properties except the target one
    console.log('📋 Fetching properties...');
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, price_per_night, property_type')
      .neq('id', '02b77cb1-ff10-4f81-b0b5-9959b6e06628');
    
    if (fetchError) {
      console.error('❌ Error fetching properties:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${properties.length} properties to update`);
    
    // Create room records and inventory data
    console.log('🔄 Creating room records and inventory...');
    let totalRoomsCreated = 0;
    let totalInventoryCreated = 0;
    
    for (const property of properties) {
      const roomConfig = generateRoomConfig(property.price_per_night);
      
      for (const roomType of roomConfig.room_types) {
        // Create room record
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .insert({
            property_id: property.id,
            name: roomType.name,
            description: roomType.description,
            room_type: roomType.room_type,
            price: roomType.base_price,
            total_inventory: roomType.total_inventory,
            amenities: roomType.amenities,
            images: [] // Will be populated later with property images
          })
          .select()
          .single();
        
        if (roomError) {
          console.error(`❌ Error creating room for ${property.title}:`, roomError);
          continue;
        }
        
        console.log(`✅ Created room: ${roomType.name} (₹${roomType.base_price}) for ${property.title}`);
        totalRoomsCreated++;
        
        // Generate inventory data for this room
        const inventoryData = generateInventoryData(roomData.id, roomType.total_inventory);
        
        // Insert inventory data in batches
        const batchSize = 50;
        for (let i = 0; i < inventoryData.length; i += batchSize) {
          const batch = inventoryData.slice(i, i + batchSize);
          
          const { error: inventoryError } = await supabase
            .from('room_inventory')
            .insert(batch);
          
          if (inventoryError) {
            console.error(`❌ Error creating inventory for ${property.title} - ${roomType.name}:`, inventoryError);
          }
        }
        
        totalInventoryCreated += inventoryData.length;
        console.log(`✅ Created ${inventoryData.length} inventory records for ${roomType.name}`);
      }
    }
    
    console.log('🎉 Room data generation completed successfully!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Properties processed: ${properties.length}`);
    console.log(`   Room types created: ${totalRoomsCreated}`);
    console.log(`   Inventory records: ${totalInventoryCreated}`);
    console.log(`   Days of availability: 180`);
    
    // Show sample pricing for verification
    console.log('\n💰 Sample Pricing (first property):');
    const firstProperty = properties[0];
    const firstRoomConfig = generateRoomConfig(firstProperty.price_per_night);
    console.log(`   Property: ${firstProperty.title} (Base: ₹${firstProperty.price_per_night})`);
    firstRoomConfig.room_types.forEach(room => {
      console.log(`   - ${room.name}: ₹${room.base_price} (Extra Adult: ₹${room.extra_adult_price})`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
generateRoomData(); 