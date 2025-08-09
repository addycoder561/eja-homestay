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

async function testRatings() {
  try {
    console.log('🔍 Testing rating system...');
    console.log('');

    // Test 1: Fetch properties with reviews
    console.log('📋 Fetching properties with reviews...');
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        reviews(*)
      `)
      .eq('is_available', true)
      .limit(5);

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return;
    }

    console.log(`✅ Found ${properties.length} properties`);
    console.log('');

    // Calculate and display ratings
    properties.forEach((property, index) => {
      const reviews = property.reviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      console.log(`${index + 1}. ${property.title}`);
      console.log(`   Rating: ${averageRating.toFixed(1)} (${reviews.length} reviews)`);
      console.log(`   Price: ₹${property.price_per_night}/night`);
      console.log('');
    });

    // Test 2: Check if there are any reviews in the system
    console.log('📊 Checking review system...');
    const { data: allReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(10);

    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError);
    } else {
      console.log(`✅ Found ${allReviews.length} total reviews in system`);
      if (allReviews.length > 0) {
        console.log('   Sample reviews:');
        allReviews.slice(0, 3).forEach((review, index) => {
          console.log(`   ${index + 1}. Rating: ${review.rating}/5 - "${review.comment?.substring(0, 50)}..."`);
        });
      } else {
        console.log('   ⚠️  No reviews found. Properties will show 0.0 rating.');
      }
    }

    console.log('\n🎉 Rating system test completed!');
    console.log('💡 Properties without reviews will show 0.0 rating');
    console.log('💡 Properties with reviews will show their average rating');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRatings(); 