"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBucketlist, removeFromBucketlist } from "@/lib/database";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { 
  HeartIcon, 
  TrashIcon, 
  CalendarIcon, 
  MapPinIcon,
  StarIcon,
  EyeIcon,
  BookmarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { buildCoverFirstImages } from '@/lib/media';

interface BucketlistItem {
  id: string;
  _type: 'property' | 'hyper-local' | 'online' | 'retreat'; // Updated classifications
  title: string;
  description?: string;
  city?: string;
  country?: string;
  location?: string;
  images?: string[];
  image?: string;
  price?: number;
  price_per_night?: number; // Added for properties
  rating?: number;
  reviews?: number;
  review_count?: number; // Added for experiences and retreats
}

type FilterType = 'stays' | 'experiences';

// Loading skeleton for wishlist cards
function BucketlistCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-48 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyBucketlistState({ activeFilter }: { activeFilter: FilterType }) {
  const getEmptyMessage = () => {
    switch (activeFilter) {
      case 'stays':
        return {
          title: "No saved stays yet",
          message: "",
          icon: "🏠",
          buttonText: "Explore",
          buttonLink: "/search"
        };
      case 'experiences':
        return {
          title: "No saved experiences yet", 
          message: "",
          icon: "🌟",
          buttonText: "Explore",
          buttonLink: "/discover"
        };
      default:
        return {
          title: "Your bucketlist is empty",
          message: "Start exploring and save places you love",
          icon: "💝",
          buttonText: "Explore",
          buttonLink: "/search"
        };
    }
  };

  const { title, message, icon, buttonText, buttonLink } = getEmptyMessage();

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
      <button 
        onClick={() => window.location.href = buttonLink}
        className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default function MyBucketlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<BucketlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BucketlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('stays');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setItems([]);
      setDataLoaded(false);
      return;
    }

    // If data is already loaded, don't fetch again
    if (dataLoaded) {
      return;
    }

    const fetchBucketlist = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const wishlistRecords = await getBucketlist(user.id);
        console.log('Bucketlist records:', wishlistRecords);
        
        if (!wishlistRecords || wishlistRecords.length === 0) {
          setItems([]);
          setLoading(false);
          setDataLoaded(true);
          return;
        }
      
        const propertyIds = wishlistRecords
          .filter(b => b.item_type === 'stays' || b.item_type === 'property')
          .map(b => b.item_id);
        
        const experienceIds = wishlistRecords
          .filter(b => b.item_type === 'experiences')
          .map(b => b.item_id);

        const allItems: BucketlistItem[] = [];

        console.log('🔍 Processing bucketlist items:', {
          propertyIds,
          experienceIds,
          totalRecords: wishlistRecords.length
        });
        
        console.log('🔍 Raw bucketlist records:', wishlistRecords);
        console.log('🔍 Experience IDs found:', experienceIds);
        
        console.log('📊 Total bucketlist records:', wishlistRecords);
        console.log('🔍 Bucketlist records breakdown:', {
          stays: wishlistRecords.filter(b => b.item_type === 'stays').length,
          experiences: wishlistRecords.filter(b => b.item_type === 'experiences').length
        });

        // Fetch properties
        if (propertyIds.length > 0) {
          const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);
          
          if (!propError && properties) {
            console.log('🏠 Properties fetched:', properties);
            properties.forEach(prop => {
              console.log('🏠 Property image data:', { 
                id: prop.id, 
                title: prop.title, 
                cover_image: prop.cover_image,
                gallery: prop.gallery,
                base_price: prop.base_price,
                rating: prop.google_average_rating
              });
              const propertyImages = buildCoverFirstImages(prop.cover_image, prop.gallery);
              console.log('🏠 Processed property images:', propertyImages);
              allItems.push({
                id: prop.id,
                _type: 'property',
                title: prop.title,
                description: prop.description,
                city: prop.city,
                country: prop.country,
                images: propertyImages,
                image: propertyImages[0],
                price_per_night: prop.base_price,
                rating: prop.google_average_rating,
                review_count: prop.google_reviews_count
              });
            });
          }
        }

        // Fetch experiences from experiences_with_host view and separate by location
        if (experienceIds.length > 0) {
          const { data: experiences, error: expError } = await supabase
            .from('experiences_with_host')
            .select('*')
            .in('id', experienceIds)
            // Include all experiences (hyper-local, online, retreats)
          
          if (expError) {
            console.error('❌ Error fetching experiences:', expError);
          }
          
          if (!expError && experiences) {
            console.log('🔍 Experiences fetched from database:', experiences);
            experiences.forEach(exp => {
              // Determine the type based on location
              let itemType = 'hyper-local'; // Default
              
              if (exp.location?.toLowerCase() === 'online' || 
                  exp.location?.toLowerCase().includes('virtual') || 
                  exp.location?.toLowerCase().includes('remote')) {
                itemType = 'online';
              } else if (exp.location?.toLowerCase() === 'retreats' || 
                         exp.location?.toLowerCase().includes('retreat')) {
                itemType = 'retreat';
              }
              
              allItems.push({
                id: exp.id,
                _type: itemType as 'hyper-local' | 'online' | 'retreat',
                title: exp.title,
                description: exp.description,
                location: exp.location,
                image: exp.cover_image,
                price: exp.price,
                rating: exp.rating,
                review_count: exp.review_count
              });
            });
          }
        }

        // All experiences (hyper-local, online, retreats) are now handled above

        console.log('✅ All items processed:', allItems);
        console.log('📋 Final items breakdown:', {
          properties: allItems.filter(item => item._type === 'property').length,
          hyperLocal: allItems.filter(item => item._type === 'hyper-local').length,
          online: allItems.filter(item => item._type === 'online').length,
          retreats: allItems.filter(item => item._type === 'retreat').length
        });
        setItems(allItems);
        setDataLoaded(true);
      } catch (err) {
        console.error('Error fetching bucketlist:', err);
        setError('Failed to load your bucketlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBucketlist();
  }, [user]); // Remove dataLoaded from dependencies to prevent infinite loop

  // Add refresh mechanism for modal forms
  useEffect(() => {
    const refreshBucketlist = () => {
      console.log('🔄 Refreshing bucketlist from modal...');
      setDataLoaded(false);
      setItems([]);
      setFilteredItems([]);
    };
    
    // Make refresh function available globally
    (window as any).refreshBucketlistCount = refreshBucketlist;
    
    return () => {
      delete (window as any).refreshBucketlistCount;
    };
  }, []);

  useEffect(() => {
    if (activeFilter === 'stays') {
      setFilteredItems(items.filter(item => item._type === 'property'));
    } else if (activeFilter === 'experiences') {
      setFilteredItems(items.filter(item => 
        item._type === 'hyper-local' || 
        item._type === 'online' || 
        item._type === 'retreat'
      ));
    }
  }, [items, activeFilter]);

  const handleRemoveFromBucketlist = async (item: BucketlistItem) => {
    const itemKey = item.id + '-' + item._type;
    setRemovingIds(prev => [...prev, itemKey]);
    
    try {
      // Map display type back to database type
      let dbItemTypes = [];
      if (item._type === 'property') {
        dbItemTypes = ['stays', 'property']; // Try both old and new types
      } else if (item._type === 'hyper-local' || item._type === 'online' || item._type === 'retreat') {
        dbItemTypes = ['experiences']; // All experiences and retreats are stored as 'experiences'
      }
      
      console.log('🗑️ Removing from bucketlist:', { 
        userId: user!.id, 
        itemId: item.id, 
        displayType: item._type, 
        dbItemTypes 
      });
      
      let success = false;
      for (const dbItemType of dbItemTypes) {
        const result = await removeFromBucketlist(user!.id, item.id, dbItemType);
        if (result) {
          success = true;
          break; // Stop trying other types once one succeeds
        }
      }
      
      console.log('🗑️ Remove result:', success);
      
      if (success) {
        console.log('✅ Removal successful, updating local state...');
        setItems(prev => {
          const filtered = prev.filter(i => !(i.id === item.id && i._type === item._type));
          console.log('📊 Items before removal:', prev.length);
          console.log('📊 Items after removal:', filtered.length);
          return filtered;
        });
        
        // Refresh bucketlist count in navigation
        if ((window as any).refreshBucketlistCount) {
          (window as any).refreshBucketlistCount();
        }
        
        // Force a re-fetch of the bucketlist data to ensure consistency
        console.log('🔄 Re-fetching bucketlist data to ensure consistency...');
        try {
          const freshData = await getBucketlist(user!.id);
          console.log('🔄 Fresh bucketlist data length:', freshData.length);
          
          // Re-process the fresh data to match our local state format
          const processedItems: BucketlistItem[] = [];
          
          // Process properties
          const propertyIds = freshData
            .filter(b => b.item_type === 'stays' || b.item_type === 'property')
            .map(b => b.item_id);
            
          if (propertyIds.length > 0) {
            const { data: properties, error: propError } = await supabase
              .from('properties')
              .select('*')
              .in('id', propertyIds);
              
            if (!propError && properties) {
              properties.forEach(prop => {
                const propertyImages = buildCoverFirstImages(prop.cover_image, prop.gallery);
                processedItems.push({
                  id: prop.id,
                  _type: 'property',
                  title: prop.title,
                  description: prop.description,
                  city: prop.city,
                  country: prop.country,
                  images: propertyImages,
                  image: propertyImages[0],
                  price_per_night: prop.base_price,
                  rating: prop.google_average_rating,
                  review_count: prop.google_reviews_count
                });
              });
            }
          }
          
          // Process experiences
          const experienceIds = freshData
            .filter(b => b.item_type === 'experiences')
            .map(b => b.item_id);
            
          if (experienceIds.length > 0) {
            const { data: experiences, error: expError } = await supabase
              .from('experiences_with_host')
              .select('*')
              .in('id', experienceIds);
              
            if (!expError && experiences) {
              experiences.forEach(exp => {
                let itemType = 'hyper-local';
                if (exp.location?.toLowerCase() === 'online' || 
                    exp.location?.toLowerCase().includes('virtual') || 
                    exp.location?.toLowerCase().includes('remote')) {
                  itemType = 'online';
                } else if (exp.location?.toLowerCase() === 'retreats' || 
                           exp.location?.toLowerCase().includes('retreat')) {
                  itemType = 'retreat';
                }
                
                processedItems.push({
                  id: exp.id,
                  _type: itemType as 'hyper-local' | 'online' | 'retreat',
                  title: exp.title,
                  description: exp.description,
                  location: exp.location,
                  image: exp.cover_image,
                  price: exp.price,
                  rating: exp.rating,
                  review_count: exp.review_count
                });
              });
            }
          }
          
          console.log('🔄 Setting fresh processed items:', processedItems.length);
          setItems(processedItems);
        } catch (error) {
          console.error('❌ Error re-fetching bucketlist:', error);
        }
      } else {
        console.error('❌ Failed to remove from bucketlist');
      }
    } catch (error) {
      console.error('Error removing from bucketlist:', error);
    } finally {
      setRemovingIds(prev => prev.filter(id => id !== itemKey));
    }
  };

  const handleBookNow = (item: BucketlistItem) => {
    switch (item._type) {
      case 'property':
        router.push(`/property/${item.id}`);
        break;
      case 'hyper-local':
      case 'online':
        router.push(`/experiences/${item.id}`);
        break;
      case 'retreat':
        router.push(`/retreats/${item.id}`);
        break;
    }
  };

  const getFilterCount = (type: FilterType) => {
    if (type === 'stays') return items.filter(item => item._type === 'property').length;
    if (type === 'experiences') return items.filter(item => 
      item._type === 'hyper-local' || 
      item._type === 'online' || 
      item._type === 'retreat'
    ).length;
    return 0;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stays':
        return <BookmarkIcon className="w-4 h-4" />;
      case 'experiences':
        return <StarIcon className="w-4 h-4" />;
      default:
        return <BookmarkIcon className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stays':
        return 'Stays';
      case 'experiences':
        return 'Experiences';
      default:
        return 'All';
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  const getImageUrl = (item: BucketlistItem) => {
    console.log('🖼️ getImageUrl called for:', { 
      id: item.id, 
      type: item._type, 
      images: item.images, 
      image: item.image 
    });
    const imageUrl = item.images?.[0] || item.image;
    console.log('🖼️ Final imageUrl:', imageUrl);
    return imageErrors.has(imageUrl) ? null : imageUrl;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bucketlist...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view your bucketlist</h1>
            <p className="text-gray-600 mb-8">Please sign in to access your saved places and experiences.</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/auth/signin')}
                className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors w-full max-w-xs"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/auth/signup')}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors w-full max-w-xs"
              >
                Create Account
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bucketlist</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg flex gap-2">
            {(['stays', 'experiences'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {getTypeIcon(filter)}
                <span>{getTypeLabel(filter)}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeFilter === filter 
                    ? 'bg-white/20' 
                    : 'bg-gray-200'
                }`}>
                  {getFilterCount(filter)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <BucketlistCardSkeleton key={index} index={index} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyBucketlistState activeFilter={activeFilter} />
        ) : (
          <>
            {/* Bucketlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => {
                const isRemoving = removingIds.includes(item.id + '-' + item._type);
                return (
                  <div
                    key={item.id + '-' + item._type}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                      isRemoving 
                        ? 'opacity-50 scale-95 pointer-events-none' 
                        : 'opacity-100 scale-100 hover:-translate-y-2'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      {getImageUrl(item) ? (
                        <Image
                          src={getImageUrl(item)!}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={() => handleImageError(item.images?.[0] || item.image || '')}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-gray-400 text-4xl">🏠</div>
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                        {getTypeIcon(item._type)}
                        {getTypeLabel(item._type)}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-gray-900 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromBucketlist(item);
                        }}
                        aria-label="Remove from bucketlist"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-yellow-600 transition-colors mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-sm">
                          {item._type === 'property' 
                            ? `${item.city}, ${item.country}` 
                            : item.location
                          }
                        </span>
                      </div>
                      
                      {item.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{item.rating}</span>
                          </div>
                          {item.reviews && (
                            <span className="text-sm text-gray-500">
                              ({item.reviews} reviews)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {item.price && (
                        <div className="text-lg font-bold text-gray-900 mb-4">
                          ₹{item.price.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500">
                            {item._type === 'property' ? '/night' : ''}
                          </span>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleBookNow(item)}
                          className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 