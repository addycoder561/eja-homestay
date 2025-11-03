import { supabase } from './supabase';

/**
 * Calculate and update property ratings when a new review is added
 */
export async function updatePropertyRating(propertyId: string): Promise<void> {
  try {
    // Get all reviews for the property
    const { data: reviews, error } = await supabase
      .from('tales')
      .select('rating')
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error fetching reviews for rating calculation:', error);
      return;
    }

    const reviewCount = reviews?.length || 0;
    const averageRating = reviewCount > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    // Update the property with new rating data
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        average_rating: averageRating,
        review_count: reviewCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('Error updating property rating:', updateError);
    } else {
      console.log(`Updated property ${propertyId} rating: ${averageRating.toFixed(1)} (${reviewCount} reviews)`);
    }
  } catch (error) {
    console.error('Error in updatePropertyRating:', error);
  }
}

/**
 * Get calculated rating data for a property
 */
export async function getPropertyRatingData(propertyId: string): Promise<{
  averageRating: number;
  reviewCount: number;
}> {
  try {
    const { data: reviews, error } = await supabase
      .from('tales')
      .select('rating')
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error fetching reviews:', error);
      return { averageRating: 0, reviewCount: 0 };
    }

    const reviewCount = reviews?.length || 0;
    const averageRating = reviewCount > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    return { averageRating, reviewCount };
  } catch (error) {
    console.error('Error in getPropertyRatingData:', error);
    return { averageRating: 0, reviewCount: 0 };
  }
}

/**
 * Check if a property has enough reviews to show platform rating
 */
export function hasEnoughPlatformReviews(reviewCount: number): boolean {
  return reviewCount >= 10;
} 