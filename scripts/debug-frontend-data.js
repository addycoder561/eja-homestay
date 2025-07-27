const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFrontendData() {
  console.log('🔍 Debugging Frontend Data Flow\n');

  try {
    // Simulate the getProperties function logic
    console.log('1. Simulating getProperties function:');
    const { data: propertiesWithReviews, error: propsError } = await supabase
      .from('properties')
      .select(`
        *,
        reviews(*)
      `)
      .eq('is_available', true)
      .limit(3);

    if (propsError) {
      console.error('Error fetching properties with reviews:', propsError);
      return;
    }

    propertiesWithReviews.forEach(property => {
      const reviews = property.reviews || [];
      
      // This is what the database function is doing
      const finalAverageRating = property.average_rating || 0;
      const finalReviewCount = property.review_count || 0;
      
      console.log(`   ${property.title}:`);
      console.log(`     Raw DB - average_rating: ${property.average_rating}`);
      console.log(`     Raw DB - review_count: ${property.review_count}`);
      console.log(`     Raw DB - google_rating: ${property.google_rating}`);
      console.log(`     Raw DB - google_reviews_count: ${property.google_reviews_count}`);
      console.log(`     Reviews table count: ${reviews.length}`);
      console.log(`     Function returns - average_rating: ${finalAverageRating}`);
      console.log(`     Function returns - review_count: ${finalReviewCount}`);
      console.log('');
    });

    // Test the CombinedRating logic
    console.log('2. Testing CombinedRating logic:');
    propertiesWithReviews.forEach(property => {
      const platformRating = property.average_rating || 0; // This is what's being passed
      const platformReviewCount = property.review_count || 0;
      const googleRating = property.google_rating;
      const googleReviewCount = property.google_reviews_count;
      
      const hasPlatformRating = platformRating && platformRating > 0 && platformReviewCount && platformReviewCount >= 10;
      const hasGoogleRating = googleRating && googleRating > 0;
      
      console.log(`   ${property.title}:`);
      console.log(`     platformRating: ${platformRating}`);
      console.log(`     platformReviewCount: ${platformReviewCount}`);
      console.log(`     googleRating: ${googleRating}`);
      console.log(`     googleReviewCount: ${googleReviewCount}`);
      console.log(`     hasPlatformRating: ${hasPlatformRating}`);
      console.log(`     hasGoogleRating: ${hasGoogleRating}`);
      console.log(`     Will show platform: ${hasPlatformRating}`);
      console.log(`     Will show Google: ${hasGoogleRating}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugFrontendData(); 