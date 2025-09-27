import Image from 'next/image';
import { PropertyWithHost } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { isWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { LiveRating } from './LiveRating';
import PropertyModal from './PropertyModal';
import { 
  MapPinIcon, 
  WifiIcon,
  TruckIcon,
  FireIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: PropertyWithHost;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (user) {
      isWishlisted(user.id, property.id, 'property').then((b) => {
        if (!ignore) setWishlisted(b);
      });
    } else {
      setWishlisted(false);
    }
    return () => { ignore = true; };
  }, [user, property.id]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(user.id, property.id, 'property');
        setWishlisted(false);
      } else {
        await addToWishlist(user.id, property.id, 'property');
        setWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <WifiIcon className="w-4 h-4" />;
    if (amenityLower.includes('parking')) return <TruckIcon className="w-4 h-4" />;
    if (amenityLower.includes('fire') || amenityLower.includes('heating')) return <FireIcon className="w-4 h-4" />;
    if (amenityLower.includes('kitchen') || amenityLower.includes('cooking')) return <HomeIcon className="w-4 h-4" />;
    return null;
  };

  const getPropertyTypeColor = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('villa')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (typeLower.includes('cabin')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (typeLower.includes('apartment')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (typeLower.includes('house')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <>
      <div
        className="group animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div onClick={() => setIsModalOpen(true)}>
          <Card className="overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-3 relative">
          {/* Enhanced Image Section */}
          <div className="relative h-64 overflow-hidden">
            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={property.cover_image || '/placeholder-experience.jpg'}
                alt={property.title}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110"
              />
            </div>

            {/* Property Type Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${getPropertyTypeColor(property.property_type)}`}>
                <HomeIcon className="w-3 h-3" />
                {property.property_type}
              </span>
            </div>

            {/* Saved Button - Top Right */}
            {user && (
              <button
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from saved' : 'Add to saved'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                ) : wishlisted ? (
                  <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                ) : (
                  <BookmarkOutline className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                )}
              </button>
            )}

            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          <CardContent className="p-6">
            {/* Title and Rating */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-yellow-500 transition-colors line-clamp-2 leading-tight flex-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <LiveRating 
                  propertyId={property.id}
                  propertyTitle={property.title}
                  size="sm"
                />
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center text-gray-600 mb-3">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {property.city}, {property.country}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">₹{property.base_price?.toLocaleString() || '0'}</span>
                <span className="text-sm text-gray-500">/ night</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      
      <PropertyModal
        property={property}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}