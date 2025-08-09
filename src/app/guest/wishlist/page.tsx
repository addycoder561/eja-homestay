"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getWishlist, removeFromWishlist } from "@/lib/database";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

interface WishlistItem {
  id: string;
  _type: 'property' | 'experience' | 'trip';
  title: string;
  description?: string;
  city?: string;
  country?: string;
  location?: string;
  images?: string[];
  image?: string;
}

export default function MyWishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setItems([]);
      return;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get wishlist records
        const wishlistRecords = await getWishlist(user.id);
        console.log('Wishlist records:', wishlistRecords);
        
        if (!wishlistRecords || wishlistRecords.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
      
        // Fetch all items in a single query for each type
        const propertyIds = wishlistRecords
          .filter(b => b.item_type === 'property')
          .map(b => b.item_id);
        
        const experienceIds = wishlistRecords
          .filter(b => b.item_type === 'experience')
          .map(b => b.item_id);
        
        const tripIds = wishlistRecords
          .filter(b => b.item_type === 'trip')
          .map(b => b.item_id);

        const allItems: WishlistItem[] = [];

        // Fetch properties in batch
        if (propertyIds.length > 0) {
          const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);
          
          if (!propError && properties) {
            properties.forEach(prop => {
              allItems.push({
                id: prop.id,
                _type: 'property',
                title: prop.title,
                description: prop.description,
                city: prop.city,
                country: prop.country,
                images: prop.images
              });
            });
          }
          
          // Log any missing properties for debugging
          if (properties && properties.length < propertyIds.length) {
            const foundIds = properties.map(prop => prop.id);
            const missingIds = propertyIds.filter(id => !foundIds.includes(id));
            console.log('Missing properties:', missingIds);
          }
        }

        // Fetch experiences in batch
        if (experienceIds.length > 0) {
          const { data: experiences, error: expError } = await supabase
            .from('experiences')
            .select('*')
            .in('id', experienceIds);
          
          if (!expError && experiences) {
            experiences.forEach(exp => {
              allItems.push({
                id: exp.id,
                _type: 'experience',
                title: exp.title,
                description: exp.description,
                location: exp.location,
                images: exp.images
              });
            });
          }
          
          // Log any missing experiences for debugging
          if (experiences && experiences.length < experienceIds.length) {
            const foundIds = experiences.map(exp => exp.id);
            const missingIds = experienceIds.filter(id => !foundIds.includes(id));
            console.log('Missing experiences:', missingIds);
          }
        }

        // Fetch trips in batch
        if (tripIds.length > 0) {
          const { data: trips, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .in('id', tripIds);
          
          if (!tripError && trips) {
            trips.forEach(trip => {
              allItems.push({
                id: trip.id,
                _type: 'trip',
                title: trip.title,
                description: trip.description,
                location: trip.location,
                images: trip.images
              });
            });
          }
          
          // Log any missing trips for debugging
          if (trips && trips.length < tripIds.length) {
            const foundIds = trips.map(trip => trip.id);
            const missingIds = tripIds.filter(id => !foundIds.includes(id));
            console.log('Missing trips:', missingIds);
          }
        }

        console.log('All fetched items:', allItems);
        console.log(`Summary: Found ${allItems.length} items out of ${wishlistRecords.length} wishlist items`);
        console.log(`- Properties: ${propertyIds.length} wishlisted, ${allItems.filter(item => item._type === 'property').length} found`);
        console.log(`- Experiences: ${experienceIds.length} wishlisted, ${allItems.filter(item => item._type === 'experience').length} found`);
        console.log(`- Trips: ${tripIds.length} wishlisted, ${allItems.filter(item => item._type === 'trip').length} found`);
        setItems(allItems);
        
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
      } finally {
      setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?.id]);

  const handleRemoveFromWishlist = async (item: WishlistItem) => {
    if (!user) return;
    
    setRemovingIds(prev => [...prev, item.id + '-' + item._type]);
    
    try {
      await removeFromWishlist(user.id, item.id, item._type);
      setItems(prev => prev.filter(i => i.id !== item.id || i._type !== item._type));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingIds(prev => prev.filter(id => id !== item.id + '-' + item._type));
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            Loading...
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
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600">
          Please sign in to view your wishlist.
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>
          <div className="text-center text-red-500 mb-4">{error}</div>
          <div className="text-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>
      
      {loading ? (
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          Loading your wishlist...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg mb-2">No wishlist items yet</p>
          <p className="text-sm text-gray-400">Start exploring and save your favorite places!</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center text-gray-600">
            {items.length} wishlist item{items.length !== 1 ? 's' : ''} saved
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map(item => {
            const isRemoving = removingIds.includes(item.id + '-' + item._type);
            return (
              <Card
                key={item.id + '-' + item._type}
                  className={`group hover:shadow-lg transition-all duration-300 cursor-pointer relative ${
                    isRemoving ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                  }`}
                onClick={() => {
                  if (item._type === 'property') router.push(`/property/${item.id}`);
                  else if (item._type === 'experience') router.push(`/experiences/${item.id}`);
                  else if (item._type === 'trip') router.push(`/retreats/${item.id}`);
                }}
              >
                <div className="relative h-40 overflow-hidden rounded-t-lg">
                  <img
                    src={item.images?.[0] || item.image || '/placeholder-property.jpg'}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.jpg';
                      }}
                  />
                  <button
                      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                      e.stopPropagation();
                        handleRemoveFromWishlist(item);
                    }}
                    aria-label="Remove from wishlist"
                  >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a2 2 0 00-2 2v14l6-3 6 3V4a2 2 0 00-2-2H6z" />
                      </svg>
                  </button>
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                    {item._type === 'property' && item.city && item.country && (
                      <div className="text-gray-600 text-sm mb-1">
                        {item.city}, {item.country}
                      </div>
                    )}
                    {(item._type === 'experience' || item._type === 'trip') && item.location && (
                      <div className="text-gray-600 text-sm mb-1">
                        {item.location}
                      </div>
                    )}
                    {item.description && (
                      <div className="text-gray-700 text-sm">
                        {item.description.length > 80 
                          ? `${item.description.slice(0, 80)}...` 
                          : item.description
                        }
                      </div>
                    )}
                </CardContent>
              </Card>
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