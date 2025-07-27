const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRatingDisplay() {
  console.log('🧪 Testing Rating Display Logic\n');

  try {
    // Get a sample property
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    const property = properties[0];
    console.log('Sample Property Data:');
    console.log(`  Title: ${property.title}`);
    console.log(`  average_rating: ${property.average_rating}`);
    console.log(`  review_count: ${property.review_count}`);
    console.log(`  google_rating: ${property.google_rating}`);
    console.log(`  google_reviews_count: ${property.google_reviews_count}`);

    // Simulate the database function logic
    const finalAverageRating = property.average_rating || 0;
    const finalReviewCount = property.review_count || 0;

    console.log('\nDatabase Function Returns:');
    console.log(`  average_rating: ${finalAverageRating}`);
    console.log(`  review_count: ${finalReviewCount}`);

    // Simulate CombinedRating logic
    const platformRating = finalAverageRating;
    const platformReviewCount = finalReviewCount;
    const googleRating = property.google_rating;
    const googleReviewCount = property.google_reviews_count;

    const hasPlatformRating = platformRating && platformRating > 0 && platformReviewCount && platformReviewCount >= 10;
    const hasGoogleRating = googleRating && googleRating > 0;

    console.log('\nCombinedRating Logic:');
    console.log(`  platformRating: ${platformRating}`);
    console.log(`  platformReviewCount: ${platformReviewCount}`);
    console.log(`  googleRating: ${googleRating}`);
    console.log(`  googleReviewCount: ${googleReviewCount}`);
    console.log(`  hasPlatformRating: ${hasPlatformRating}`);
    console.log(`  hasGoogleRating: ${hasGoogleRating}`);

    console.log('\nExpected Display:');
    if (!hasPlatformRating && !hasGoogleRating) {
      console.log('  → "New" badge');
    } else if (hasPlatformRating && hasGoogleRating) {
      console.log('  → Both platform and Google ratings');
    } else if (hasGoogleRating) {
      console.log('  → Only Google rating');
    } else {
      console.log('  → Only platform rating');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRatingDisplay(); 