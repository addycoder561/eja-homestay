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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testProperties() {
  try {
    console.log('🔍 Testing property data from database...');
    console.log('');

    // Test 1: Fetch all properties
    console.log('📋 Fetching all properties...');
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return;
    }

    console.log(`✅ Found ${properties.length} properties in database`);
    console.log('');

    if (properties.length === 0) {
      console.log('⚠️  No properties found. Make sure:');
      console.log('   1. Your CSV file was uploaded successfully');
      console.log('   2. Properties have is_available = true');
      console.log('   3. The table structure matches your data');
      return;
    }

    // Show sample properties
    console.log('📄 Sample properties:');
    properties.slice(0, 3).forEach((property, index) => {
      console.log(`\n${index + 1}. ${property.title}`);
      console.log(`   Location: ${property.city}, ${property.country}`);
      console.log(`   Price: ₹${property.price_per_night}/night`);
      console.log(`   Images: ${property.images ? property.images.length : 0} images`);
      console.log(`   Available: ${property.is_available ? 'Yes' : 'No'}`);
    });

    // Test 2: Check image URLs
    console.log('\n🖼️  Testing image URLs...');
    const propertyWithImages = properties.find(p => p.images && p.images.length > 0);
    if (propertyWithImages) {
      console.log(`✅ Found property with ${propertyWithImages.images.length} images`);
      console.log(`   Sample image: ${propertyWithImages.images[0]}`);
    } else {
      console.log('⚠️  No properties with images found');
    }

    // Test 3: Check amenities
    console.log('\n🏠 Testing amenities...');
    const propertyWithAmenities = properties.find(p => p.amenities && p.amenities.length > 0);
    if (propertyWithAmenities) {
      console.log(`✅ Found property with ${propertyWithAmenities.amenities.length} amenities`);
      console.log(`   Sample amenities: ${propertyWithAmenities.amenities.slice(0, 3).join(', ')}`);
    } else {
      console.log('⚠️  No properties with amenities found');
    }

    console.log('\n🎉 Database connection and property data look good!');
    console.log('🚀 Your application should now display real properties.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProperties(); 