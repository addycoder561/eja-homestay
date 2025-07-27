const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRatings() {
  console.log('🔍 Debugging Rating Data\n');

  try {
    // Check raw database data
    console.log('1. Raw database data:');
    const { data: rawData, error: rawError } = await supabase
      .from('properties')
      .select('title, average_rating, review_count, google_rating, google_reviews_count')
      .limit(5);

    if (rawError) {
      console.error('Error fetching raw data:', rawError);
      return;
    }

    rawData.forEach(property => {
      console.log(`   ${property.title}:`);
      console.log(`     average_rating: ${property.average_rating}`);
      console.log(`     review_count: ${property.review_count}`);
      console.log(`     google_rating: ${property.google_rating}`);
      console.log(`     google_review_count: ${property.google_review_count}`);
      console.log('');
    });

    // Check if there are any reviews in the reviews table
    console.log('2. Reviews table data:');
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('property_id, rating')
      .limit(10);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    } else {
      console.log(`   Total reviews found: ${reviewsData?.length || 0}`);
      if (reviewsData && reviewsData.length > 0) {
        console.log('   Sample reviews:');
        reviewsData.slice(0, 3).forEach(review => {
          console.log(`     Property ${review.property_id}: ${review.rating} stars`);
        });
      }
    }

    // Test the getProperties function logic
    console.log('\n3. Testing getProperties logic:');
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
      const calculatedRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      console.log(`   ${property.title}:`);
      console.log(`     Reviews count: ${reviews.length}`);
      console.log(`     Calculated rating: ${calculatedRating}`);
      console.log(`     Google rating: ${property.google_rating}`);
      console.log(`     Final average_rating should be: ${property.google_rating || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugRatings(); 