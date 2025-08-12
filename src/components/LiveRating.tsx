import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LiveRatingProps {
  propertyId: string;
  propertyTitle: string;
  size?: 'sm' | 'md' | 'lg';
}

interface RatingData {
  platformRating: number;
  platformReviewCount: number;
  googleRating: number;
  googleReviewCount: number;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const starSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export function LiveRating({ propertyId, propertyTitle, size = 'md' }: LiveRatingProps) {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatingData();
  }, [propertyId]);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch platform ratings from reviews table
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('property_id', propertyId);

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        setError('Failed to fetch platform ratings');
        return;
      }

      const platformReviewCount = reviews?.length || 0;
      const platformRating = platformReviewCount > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / platformReviewCount
        : 0;

      // 2. Fetch Google ratings from properties table
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('google_rating, google_reviews_count')
        .eq('id', propertyId)
        .single();

      if (propertyError) {
        console.error('Error fetching property Google ratings:', propertyError);
        setError('Failed to fetch Google ratings');
        return;
      }

      setRatingData({
        platformRating,
        platformReviewCount,
        googleRating: property?.google_rating || 0,
        googleReviewCount: property?.google_reviews_count || 0
      });

    } catch (err) {
      console.error('Error fetching rating data:', err);
      setError('Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center">
        <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
          Error
        </span>
      </div>
    );
  }

  if (!ratingData) {
    return (
      <div className="flex items-center">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          No Rating
        </span>
      </div>
    );
  }

  // Logic: Show platform rating if >= 10 reviews, otherwise show Google rating
  const shouldShowPlatformRating = ratingData.platformReviewCount >= 10;

  if (shouldShowPlatformRating) {
    // Show Platform Rating
    return (
      <div className="flex items-center">
        <svg className={`${starSizeClasses[size]} text-yellow-400 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className={`ml-1 font-medium text-gray-600 ${sizeClasses[size]}`}>
          {ratingData.platformRating.toFixed(1)}
        </span>
        <span className={`text-gray-600 ml-1 ${sizeClasses[size]}`}>
          ({ratingData.platformReviewCount})
        </span>
      </div>
    );
  } else {
    // Show Google Rating
    return (
      <div className="flex items-center gap-1">
        <svg className={`${starSizeClasses[size]} text-yellow-400 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className={`ml-1 font-medium text-gray-600 ${sizeClasses[size]}`}>
          {ratingData.googleRating.toFixed(1)}
        </span>
        <span className={`text-gray-600 ml-1 ${sizeClasses[size]}`}>
          ({ratingData.googleReviewCount})
        </span>
        <span className={`text-gray-500 ${sizeClasses[size]}`}>
          Google
        </span>
      </div>
    );
  }
} 