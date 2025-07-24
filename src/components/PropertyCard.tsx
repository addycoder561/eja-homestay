import Link from 'next/link';
import Image from 'next/image';
import { PropertyWithHost } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: PropertyWithHost;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    let ignore = false;
    if (user) {
      isBookmarked(user.id, property.id, 'property').then((b) => {
        if (!ignore) setBookmarked(b);
      });
    } else {
      setBookmarked(false);
    }
    return () => { ignore = true; };
  }, [user, property.id]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (bookmarked) {
      await removeBookmark(user.id, property.id, 'property');
      setBookmarked(false);
    } else {
      await addBookmark(user.id, property.id, 'property');
      setBookmarked(true);
    }
  };
  console.log('PropertyCard property.id:', property.id);
  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={property.images[0] || '/placeholder-property.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
            ${property.price_per_night}/night
          </div>
          {user && (
            <button
              className="absolute top-4 left-4 z-10 p-1 rounded-full bg-white shadow hover:bg-pink-100"
              onClick={handleBookmark}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {bookmarked ? (
                <HeartSolid className="w-6 h-6 text-pink-500" />
              ) : (
                <HeartOutline className="w-6 h-6 text-gray-400" />
              )}
            </button>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">
              {property.city}, {property.country}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Up to {property.max_guests} guests</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">4.8</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 