// Test script to verify experiences and trips data fetching
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExperiencesAndTrips() {
  console.log('🧪 Testing Experiences and Trips Data Fetching...\n');

  try {
    // Test Experiences
    console.log('📋 Testing Experiences:');
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*')
      .order('date', { ascending: false });

    if (expError) {
      console.error('❌ Error fetching experiences:', expError);
    } else {
      console.log(`✅ Found ${experiences.length} experiences`);
      if (experiences.length > 0) {
        console.log('📝 Sample experience:');
        console.log(`   Title: ${experiences[0].title}`);
        console.log(`   Location: ${experiences[0].location}`);
        console.log(`   Price: ₹${experiences[0].price}`);
        console.log(`   Image: ${experiences[0].image ? '✅' : '❌'}`);
        console.log(`   Date: ${experiences[0].date}`);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test Trips
    console.log('🚗 Testing Trips:');
    const { data: trips, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: false });

    if (tripError) {
      console.error('❌ Error fetching trips:', tripError);
    } else {
      console.log(`✅ Found ${trips.length} trips`);
      if (trips.length > 0) {
        console.log('📝 Sample trip:');
        console.log(`   Title: ${trips[0].title}`);
        console.log(`   Location: ${trips[0].location}`);
        console.log(`   Price: ₹${trips[0].price}`);
        console.log(`   Image: ${trips[0].image ? '✅' : '❌'}`);
        console.log(`   Duration: ${trips[0].duration || 'Not set'}`);
        console.log(`   Start Date: ${trips[0].start_date}`);
        console.log(`   End Date: ${trips[0].end_date}`);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test table structure
    console.log('🏗️  Testing Table Structure:');
    
    // Check experiences table structure by trying to get column info
    try {
      const { data: expSample, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .limit(1);
      
      if (expError) {
        console.log('❌ Could not verify experiences table structure');
      } else {
        console.log('✅ Experiences table structure verified');
        if (expSample && expSample.length > 0) {
          console.log('📋 Available columns:', Object.keys(expSample[0]).join(', '));
        }
      }
    } catch (error) {
      console.log('ℹ️  Could not check experiences table structure');
    }

    // Check trips table structure by trying to get column info
    try {
      const { data: tripSample, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .limit(1);
      
      if (tripError) {
        console.log('❌ Could not verify trips table structure');
      } else {
        console.log('✅ Trips table structure verified');
        if (tripSample && tripSample.length > 0) {
          console.log('📋 Available columns:', Object.keys(tripSample[0]).join(', '));
        }
      }
    } catch (error) {
      console.log('ℹ️  Could not check trips table structure');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Experiences: ${experiences?.length || 0} records`);
    console.log(`   Trips: ${trips?.length || 0} records`);
    
    if ((experiences?.length || 0) > 0 && (trips?.length || 0) > 0) {
      console.log('\n🎉 SUCCESS: Both experiences and trips are working correctly!');
      console.log('   You can now run the application and visit /experiences and /trips pages.');
    } else {
      console.log('\n⚠️  WARNING: Some data might be missing. Please run the SQL setup script.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testExperiencesAndTrips(); 