import Link from 'next/link';
import Image from 'next/image';
import { ImageCarousel } from './ImageCarousel';
import { buildCoverFirstImages } from '@/lib/media';
import { PropertyWithHost } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { isWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { LiveRating } from './LiveRating';
import { 
  MapPinIcon, 
  UserGroupIcon, 
  StarIcon,
  WifiIcon,
  TruckIcon,
  FireIcon,
  HomeIcon,
  SparklesIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: PropertyWithHost;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    <div
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/property/${property.id}`}>
        <Card className="overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-3 relative">
          {/* Enhanced Image Section */}
          <div className="relative h-64 overflow-hidden">
            {/* Image */}
            <div className="relative w-full h-full">
              <ImageCarousel
                images={buildCoverFirstImages(property.cover_image, property.images)}
                alt={property.title}
                className="transition-all duration-500 group-hover:scale-110"
              />
            </div>

            {/* Property Type Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${getPropertyTypeColor(property.property_type)}`}>
                <HomeIcon className="w-3 h-3" />
                {property.property_type}
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-900 shadow-lg border border-gray-200">
              ₹{property.price_per_night.toLocaleString()}/night
            </div>

            {/* Wishlist Button */}
            {user && (
              <button
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-pink-50 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                ) : wishlisted ? (
                  <HeartSolid className="w-5 h-5 text-pink-500" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
                )}
              </button>
            )}

            {/* Quick Amenities */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              {property.amenities.slice(0, 3).map((amenity, idx) => {
                const icon = getAmenityIcon(amenity);
                if (icon) {
                  return (
                    <div key={idx} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-white/50">
                      {icon}
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Quick View Overlay */}
            <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-white text-center">
                <EyeIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Quick View</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Title and Rating */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight flex-1">
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

            {/* Guest Capacity and Host Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <UserGroupIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span>Up to {property.max_guests} guests</span>
              </div>
              
              {/* Host Info */}
              {property.host && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-blue-600 font-semibold text-xs">
                      {property.host.full_name?.charAt(0) || 'H'}
                    </span>
                  </div>
                  <span className="text-xs">Hosted by {property.host.full_name?.split(' ')[0] || 'Host'}</span>
                </div>
              )}
            </div>

            {/* Enhanced Amenities Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {property.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  {getAmenityIcon(amenity)}
                  <span className="truncate max-w-16">{amenity}</span>
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-100">
                  +{property.amenities.length - 4} more
                </span>
              )}
            </div>

            {/* Price and Availability */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">₹{property.price_per_night.toLocaleString()}</span>
                <span className="text-sm text-gray-500">/ night</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100">
                  <SparklesIcon className="w-3 h-3 inline mr-1" />
                  Available
                </div>
                <button className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                  <CalendarIcon className="w-3 h-3 inline mr-1" />
                  Book Now
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                <span>{property.max_guests} guest{property.max_guests !== 1 ? 's' : ''} max</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
} 