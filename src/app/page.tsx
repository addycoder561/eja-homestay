'use client';

import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { Footer } from '@/components/Footer';
import { CategoryCard } from '@/components/CategoryCard';
import Link from 'next/link';
import { 
  MapPinIcon,
  BookmarkIcon as BookmarkOutline
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { getRetreats, getExperiences, getProperties, addToBucketlist, removeFromBucketlist } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { PropertyWithHost } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AIChatAssistant } from '@/components/AIChatAssistant';

// Lazy load heavy modals - only load when needed
const ExperienceModal = lazy(() => import('@/components/ExperienceModal'));
const RetreatModal = lazy(() => import('@/components/RetreatModal'));





const EXPERIENCE_CATEGORIES = [
  { 
    name: 'Immersive', 
    description: 'Deep cultural experiences and local connections',
    image: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&fit=crop&w=800&q=80',
    icon: '🎭',
    type: 'experience'
  },
  { 
    name: 'Culinary', 
    description: 'Food tours and authentic local cuisine',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    icon: '🍽️',
    type: 'experience'
  },
  { 
    name: 'Try', 
    description: 'New experiences and exciting discoveries',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
    icon: '✨',
    type: 'retreat'
  },
  { 
    name: 'Group', 
    description: 'Group retreats and team experiences',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    icon: '👥',
    type: 'retreat'
  },
  { 
    name: 'Couple', 
    description: 'Romantic retreats and couple experiences',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    icon: '💕',
    type: 'retreat'
  }
];

export default function Home() {
  const { user } = useAuth();
  const [retreats, setRetreats] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<any>(null);
  const [isRetreatModalOpen, setIsRetreatModalOpen] = useState(false);
  const [bucketlistedItems, setBucketlistedItems] = useState<Set<string>>(new Set());
  const [moods, setMoods] = useState<string[]>([]);

  // Scroll to top on initial page load
  useEffect(() => {
    // Ensure page starts at top when user visits or refreshes
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data with timeout and better error handling
        const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number = 8000): Promise<any | null> => {
          try {
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            );
            return await Promise.race([promise, timeoutPromise]);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
            console.error('Request failed or timed out:', error);
            }
            return null;
          }
        };

        const [retreatsData, experiencesData, propertiesData, moodData] = await Promise.allSettled([
          fetchWithTimeout(getRetreats()),
          fetchWithTimeout(getExperiences()),
          fetchWithTimeout(getProperties()),
          fetchWithTimeout(
            supabase
              .from('experiences_with_host')
              .select('mood')
              .not('mood', 'is', null)
              .neq('mood', '')
              .then(({ data, error }) => {
                if (error) throw error;
                return data;
              })
          )
        ]);

        const retreatsResult = retreatsData.status === 'fulfilled' ? (retreatsData.value || []) : [];
        const experiencesResult = experiencesData.status === 'fulfilled' ? (experiencesData.value || []) : [];
        const propertiesResult = propertiesData.status === 'fulfilled' ? (propertiesData.value || []) : [];
        const moodResult = moodData.status === 'fulfilled' ? (moodData.value || []) : [];
        
        setRetreats(retreatsResult);
        setExperiences(experiencesResult);
        setProperties(propertiesResult);

        if (moodResult.length > 0) {
          const uniqueMoods = [...new Set(moodResult.map(item => item.mood).filter(Boolean))];
          setMoods(uniqueMoods.slice(0, 9)); // Limit to 9 moods
        }

      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExperienceClick = useCallback((experience: any) => {
    if (experience?.id) {
    setSelectedExperience(experience);
    setIsModalOpen(true);
      }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  }, []);

  const handleRetreatClick = useCallback((retreat: any) => {
    if (retreat?.id) {
    setSelectedRetreat(retreat);
    setIsRetreatModalOpen(true);
      }
  }, []);

  const handleBucketlistToggle = useCallback(async (item: any, isExperience: boolean) => {
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }

    const itemId = item.id;
    const itemType = isExperience ? 'experience' : 'trip';
    const isCurrentlyBucketlisted = bucketlistedItems.has(itemId);

    try {
      if (isCurrentlyBucketlisted) {
        await removeFromBucketlist(user.id, itemId, itemType);
        setBucketlistedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        await addToBucketlist(user.id, itemId, itemType);
        setBucketlistedItems(prev => new Set(prev).add(itemId));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Error toggling bucketlist:', error);
    }
    }
  }, [user, bucketlistedItems]);

  const handleMoodClick = useCallback((mood: string) => {
    window.location.href = `/discover?mood=${encodeURIComponent(mood)}`;
  }, []);

  const handleCloseRetreatModal = useCallback(() => {
    setIsRetreatModalOpen(false);
    setSelectedRetreat(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .animate-fade-in {
              animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <Navigation />
        <main className="md:hidden">
          {/* Mobile Hero Gallery - Hyper-local Experiences & Retreats */}
          <section className="px-4 py-6 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 text-center">Experiences for Everyone</h2>
            </div>
            {(() => {
              // Filter hyper-local experiences
              const hyperLocalExperiences = experiences.filter(
                (exp: any) => {
                  const location = exp.location?.toLowerCase() || '';
                  return location === 'hyper-local' || location.includes('hyper-local') || 
                         (location !== 'online' && location !== 'retreats' && location !== 'retreat');
                }
              );
              
              // Combine hyper-local experiences and retreats - filter out photography and walking tours
              let galleryItems = [
                ...hyperLocalExperiences.slice(0, 10).map((exp: any) => ({
                  ...exp,
                  type: 'experience' as const
                })),
                ...retreats.slice(0, 10).map((ret: any) => ({
                  ...ret,
                  type: 'retreat' as const
                }))
              ].filter((item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                return !title.includes('photography') && !title.includes('walking');
              });

              // Replace specific items with correct ones from database
              // Find replacement items from the data
              const familyGetaways = retreats.find((ret: any) => {
                const title = (ret.title || ret.name || '').toLowerCase();
                return title.includes('family getaway');
              });
              const corporateRetreats = retreats.find((ret: any) => {
                const title = (ret.title || ret.name || '').toLowerCase();
                return title.includes('corporate retreat');
              });
              const streetFoodTour = [...hyperLocalExperiences, ...retreats].find((item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                return title.includes('street food');
              });
              const communityDining = [...hyperLocalExperiences, ...retreats].find((item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                return title.includes('community dining');
              });
              const cyclingTour = [...hyperLocalExperiences, ...retreats].find((item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                return title.includes('cycling');
              });

              // Apply replacements for mobile gallery
              galleryItems = galleryItems.map((item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                
                // Replace "Birthday Surprise" with "Family Getaways"
                if ((title.includes('birthday') && title.includes('surprise')) || title.includes('birthday surprise')) {
                  if (familyGetaways) {
                    return {
                      ...familyGetaways,
                      type: 'retreat' as const
                    };
                  }
                }
                
                // Replace "Stranger Potluck" with "Community Dining"
                if ((title.includes('stranger') && title.includes('potluck')) || title.includes('stranger potluck')) {
                  if (communityDining) {
                    return {
                      ...communityDining,
                      type: communityDining.type || 'experience' as const
                    };
                  }
                }
                
                // Replace "Festival Immersion" with "Street Food Tour"
                if ((title.includes('festival') && title.includes('immersion')) || title.includes('festival immersion')) {
                  if (streetFoodTour) {
                    return {
                      ...streetFoodTour,
                      type: streetFoodTour.type || 'experience' as const
                    };
                  }
                }
                
                // Replace "Mystic Trails" with "Corporate Retreats"
                if ((title.includes('mystic') && title.includes('trails')) || title.includes('mystic trails')) {
                  if (corporateRetreats) {
                    return {
                      ...corporateRetreats,
                      type: 'retreat' as const
                    };
                  }
                }
                
                // Replace "Karaoke Nights" with "Cycling Tour"
                if ((title.includes('karaoke') && title.includes('nights')) || title.includes('karaoke nights')) {
                  if (cyclingTour) {
                    return {
                      ...cyclingTour,
                      type: cyclingTour.type || 'experience' as const
                    };
                  }
                }
                
                return item;
              });

              // Get image helper
              const getImageUrl = (item: any) => {
                if (!item) return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                return item.cover_image || item.image || item.images?.[0] || 
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
              };

              // Helper to check if item is spiritual tour
              const isSpiritualTour = (item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                return title.includes('spiritual');
              };

              // Helper to check if item is street food tour
              const isStreetFoodTour = (item: any) => {
                const title = (item.title || item.name || '').toLowerCase();
                return title.includes('street food');
              };

              // For mobile: Specific layout - 5 images total
              // Layout: Col 1 (2 images), Col 2 (1 image double-height), Col 3 (2 images)
              const maxItems = 5;
              const itemsToDisplay = galleryItems.slice(0, maxItems);
              
              if (itemsToDisplay.length === 0) {
                return (
                  <div className="grid grid-cols-3 gap-2" style={{ gridTemplateRows: '120px 120px', overflow: 'hidden' }}>
                    <div className="h-[120px] bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-[244px] bg-gray-200 rounded-xl animate-pulse row-span-2" />
                    <div className="h-[120px] bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-[120px] bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-[120px] bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                );
              }

              // Layout structure:
              // Item 0: Col 1, Row 1
              // Item 1: Col 1, Row 2
              // Item 2: Col 2, Rows 1-2 (double-height, spans both rows)
              // Item 3: Col 3, Row 1
              // Item 4: Col 3, Row 2
              return (
                <div className="grid grid-cols-3 gap-2" style={{ gridTemplateRows: '120px 120px', overflow: 'hidden' }}>
                  {itemsToDisplay.map((item, index) => {
                    let gridColumn = '';
                    let gridRow = '';
                    let height = '120px';
                    
                    if (index === 0) {
                      // Col 1, Row 1
                      gridColumn = '1';
                      gridRow = '1';
                    } else if (index === 1) {
                      // Col 1, Row 2
                      gridColumn = '1';
                      gridRow = '2';
                    } else if (index === 2) {
                      // Col 2, Rows 1-2 (double-height)
                      gridColumn = '2';
                      gridRow = '1 / 3';
                      height = '244px';
                    } else if (index === 3) {
                      // Col 3, Row 1
                      gridColumn = '3';
                      gridRow = '1';
                    } else if (index === 4) {
                      // Col 3, Row 2
                      gridColumn = '3';
                      gridRow = '2';
                    }
                    
                    return (
                      <div
                        key={`mobile-gallery-item-${index}`}
                        onClick={() => {
                          if (item.type === 'experience') {
                            handleExperienceClick(item);
                          } else {
                            handleRetreatClick(item);
                          }
                        }}
                        className={`relative ${index === 2 ? 'row-span-2' : ''} rounded-xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform duration-200`}
                        style={{
                          height: height,
                          gridColumn: gridColumn,
                          gridRow: gridRow,
                        }}
                      >
                      <img
                          src={getImageUrl(item)}
                          alt={item.title || item.name || 'Gallery item'}
                        className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
                            {item.title || item.name || 'Untitled'}
                         </h3>
                       </div>
                    </div>
                    );
                  })}
                  </div>
              );
            })()}
            {/* Chat Assistant - Below Gallery (Inline) */}
            <div className="mt-6 flex justify-center">
              <AIChatAssistant inline={true} />
            </div>
          </section>

          {/* Trending Section - Mobile Version */}
          <section className="px-4 py-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">trending</h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {(() => {
                const mixedCards = [];
                const maxCards = 6; // Reduced for mobile
                let cardIndex = 0;
                
                // Create alternating pattern: 2 experiences, 2 retreats, repeat
                for (let i = 0; i < maxCards; i++) {
                  const isExperience = Math.floor(i / 2) % 2 === 0;
                  const dataArray = isExperience ? experiences : retreats;
                  const dataIndex = Math.floor(i / 4) * 2 + (i % 2);
                  const item = dataArray[dataIndex];
                  
                  // Helper function to get image URL
                  const getImageUrl = (item: any, isExp: boolean) => {
                    if (!item) {
                      return isExp 
                        ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                        : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                    }
                    
                    // Try different image field names
                    const possibleImages = [
                      item.cover_image,
                      item.image,
                      item.images?.[0],
                      item.images,
                      item.photo,
                      item.thumbnail,
                      item.picture
                    ];
                    
                    for (const img of possibleImages) {
                      if (img && typeof img === 'string' && img.startsWith('http')) {
                        return img;
                      }
                    }
                    
                    // Fallback to default images
                    return isExp 
                      ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                      : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                  };
                  
                  if (item) {
                    mixedCards.push(
                      <div
                        key={`${isExperience ? 'experience' : 'retreat'}-${item.id || cardIndex}`}
                        className="group animate-fade-in flex-shrink-0 w-80"
                        style={{ animationDelay: `${cardIndex * 0.1}s` }}
                      >
                        <div 
                          onClick={() => isExperience ? handleExperienceClick(item) : handleRetreatClick(item)}
                          className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 relative"
                        >
                          {/* Saved Icon */}
                          {user && (
                            <button 
                              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBucketlistToggle(item, isExperience);
                              }}
                              aria-label={bucketlistedItems.has(item.id) ? 'Remove from bucketlist' : 'Add to bucketlist'}
                            >
                              {bucketlistedItems.has(item.id) ? (
                                <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <BookmarkOutline className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                              )}
                            </button>
                          )}
                          
                          <div className="flex h-40">
                            {/* Image on the left */}
                            <div className="relative w-32 h-40">
                              <img
                                src={getImageUrl(item, isExperience)}
                                alt={item.title || (isExperience ? 'Experience' : 'Retreat')}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = isExperience 
                                    ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                                    : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                                }}
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            
                            {/* Content on the right */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                {/* Category */}
                                <div className="mb-2">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isExperience 
                                      ? 'text-green-600 bg-green-50' 
                                      : 'text-blue-600 bg-blue-50'
                                  }`}>
                                    {item.mood || (isExperience ? 'Experience' : 'Retreat')}
                                  </span>
                                </div>
                                
                                {/* Title */}
                                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                  {item.title || (isExperience ? 'Experience' : 'Retreat')}
                                </h3>
                                
                                {/* Description */}
                                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                                  {item.description || (isExperience ? 'Discover amazing experiences' : 'Discover amazing retreats')}
                                </p>
                              </div>
                              
                              {/* Bottom row: Location and Price */}
                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center text-gray-500 text-xs">
                                  <MapPinIcon className="w-3 h-3 mr-1" />
                                  <span>{item.location || 'Location TBD'}</span>
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  ₹{item.price ? item.price.toLocaleString() : '0'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    cardIndex++;
                  }
                }
                
                // If we don't have enough real data, fill with sample cards
                while (mixedCards.length < maxCards) {
                  const isExperience = Math.floor(mixedCards.length / 2) % 2 === 0;
                  const sampleData = isExperience 
                    ? {
                        id: `sample-exp-${mixedCards.length}`,
                        title: 'Mountain Adventure',
                        description: 'Experience breathtaking mountain views and thrilling adventures',
                        location: 'Hyper-local',
                        mood: 'Thrill',
                        price: 2500,
                        cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                      }
                    : {
                        id: `sample-retreat-${mixedCards.length}`,
                        title: 'Yoga Retreat',
                        description: 'Rejuvenate your mind and body with our peaceful yoga retreat',
                        location: 'Retreats',
                        mood: 'Soulful',
                        price: 5000,
                        cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
                      };
                  
                  mixedCards.push(
                    <div
                      key={`sample-${isExperience ? 'experience' : 'retreat'}-${mixedCards.length}`}
                      className="group animate-fade-in flex-shrink-0 w-80"
                      style={{ animationDelay: `${cardIndex * 0.1}s` }}
                    >
                      <div 
                        onClick={() => isExperience ? handleExperienceClick(sampleData) : handleRetreatClick(sampleData)}
                        className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                      >
                        <div className="flex h-40">
                          {/* Image on the left */}
                          <div className="relative w-32 h-40">
                            <img
                              src={sampleData.cover_image}
                              alt={sampleData.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          
                          {/* Content on the right */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              {/* Category */}
                              <div className="mb-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  isExperience 
                                    ? 'text-green-600 bg-green-50' 
                                    : 'text-blue-600 bg-blue-50'
                                }`}>
                                  {sampleData.mood}
                                </span>
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                {sampleData.title}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                                {sampleData.description}
                              </p>
                            </div>
                            
                            {/* Bottom row: Location and Price */}
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center text-gray-500 text-xs">
                                <MapPinIcon className="w-3 h-3 mr-1" />
                                <span>{sampleData.location}</span>
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                ₹{sampleData.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
            </div>
                  );
                  cardIndex++;
                }
                
                return mixedCards;
              })()}
          </div>
        </section>

          {/* Mood Vibes Section - Mobile Version */}
          <section className="px-4 py-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Mood Vibes</h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {moods.map((mood, index) => {
                const getMoodImage = (moodName: string) => {
                  const moodImages: { [key: string]: string } = {
                    'Adventure': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80',
                    'Relaxation': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
                    'Cultural': 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&fit=crop&w=400&q=80',
                    'Social': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
                    'Learning': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
                    'Wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
                    'Creative': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&q=80',
                    'Nature': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80',
                    'Foodie': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8Mg%3D%3D&v=2',
                    'Soulful': 'https://images.unsplash.com/photo-1609961195485-8278b1a9c919?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fG9yYW5nZSUyMGxlYXZlcyUyMHBhdGh8ZW58MHx8MHx8fDI%3D',
                    'Thrill': 'https://images.unsplash.com/photo-1534146789009-76ed5060ec70?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmlrZXxlbnwwfHwwfHx8Mg%3D%3D',
                    'Artistic': 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=400&q=80',
                    'Meaningful': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
                    'Playful': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
                    'Chill': 'https://images.unsplash.com/photo-1550475476-44c382c5f2a2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZW5qb3l8ZW58MHx8MHx8fDI%3D',
                    'Group': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3JvdXB8ZW58MHx8MHx8fDI%3D',
                    'Couple': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
                    'Family': 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=400&q=80',
                    'Try': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80'
                  };
                  return moodImages[moodName] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80';
                };

                return (
                  <div
                    key={mood}
                    onClick={() => handleMoodClick(mood)}
                    className="group flex-shrink-0 w-32 h-40 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={getMoodImage(mood)}
                        alt={mood}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-bold text-sm capitalize text-center">
                          {mood}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>


        {/* Desktop Layout - Keep existing for desktop */}
        <main className="hidden md:block">
          {/* Desktop Hero Gallery - Hyper-local Experiences & Retreats */}
          <section className="py-8 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Experiences for Everyone</h2>
              {(() => {
                // Filter hyper-local experiences
                const hyperLocalExperiences = experiences.filter(
                  (exp: any) => {
                    const location = exp.location?.toLowerCase() || '';
                    return location === 'hyper-local' || location.includes('hyper-local') || 
                           (location !== 'online' && location !== 'retreats' && location !== 'retreat');
                  }
                );
                
                // Combine hyper-local experiences and retreats - filter out photography and walking tours
                let galleryItems = [
                  ...hyperLocalExperiences.slice(0, 10).map((exp: any) => ({
                    ...exp,
                    type: 'experience' as const
                  })),
                  ...retreats.slice(0, 10).map((ret: any) => ({
                    ...ret,
                    type: 'retreat' as const
                  }))
                ].filter((item: any) => {
                  const title = (item.title || item.name || '').toLowerCase();
                  return !title.includes('photography') && !title.includes('walking');
                });

                // Replace specific items with correct ones from database
                // Find replacement items from the data
                const familyGetaways = retreats.find((ret: any) => {
                  const title = (ret.title || ret.name || '').toLowerCase();
                  return title.includes('family getaway');
                });
                const corporateRetreats = retreats.find((ret: any) => {
                  const title = (ret.title || ret.name || '').toLowerCase();
                  return title.includes('corporate retreat');
                });
                const streetFoodTour = [...hyperLocalExperiences, ...retreats].find((item: any) => {
                  const title = (item.title || item.name || '').toLowerCase();
                  return title.includes('street food');
                });
                const communityDining = [...hyperLocalExperiences, ...retreats].find((item: any) => {
                  const title = (item.title || item.name || '').toLowerCase();
                  return title.includes('community dining');
                });
                const musicFestival = [...hyperLocalExperiences, ...retreats].find((item: any) => {
                  const title = (item.title || item.name || '').toLowerCase();
                  return title.includes('music festival');
                });

                // Replace items in gallery
                galleryItems = galleryItems.map((item: any) => {
                  const title = (item.title || item.name || '').toLowerCase();
                  
                  // Replace "Birthday Surprise" with "Family Getaways"
                  if ((title.includes('birthday') && title.includes('surprise')) || title.includes('birthday surprise')) {
                    if (familyGetaways) {
                      return {
                        ...familyGetaways,
                        type: 'retreat' as const
                      };
                    }
                  }
                  
                  // Replace "Stranger Potluck" with "Community Dining"
                  if ((title.includes('stranger') && title.includes('potluck')) || title.includes('stranger potluck')) {
                    if (communityDining) {
                      return {
                        ...communityDining,
                        type: communityDining.type || 'experience' as const
                      };
                    }
                  }
                  
                  // Replace "Festival Immersion" with "Street Food Tour"
                  if ((title.includes('festival') && title.includes('immersion')) || title.includes('festival immersion')) {
                    if (streetFoodTour) {
                      return {
                        ...streetFoodTour,
                        type: streetFoodTour.type || 'experience' as const
                      };
                    }
                  }
                  
                  // Replace "Mystic Trails" with "Corporate Retreats"
                  if ((title.includes('mystic') && title.includes('trails')) || title.includes('mystic trails')) {
                    if (corporateRetreats) {
                      return {
                        ...corporateRetreats,
                        type: 'retreat' as const
                      };
                    }
                  }
                  
                  // Replace "Theatre" or "Theater" with "Music Festival"
                  if (title.includes('theatre') || title.includes('theater')) {
                    if (musicFestival) {
                      return {
                        ...musicFestival,
                        type: musicFestival.type || 'experience' as const
                      };
                    }
                  }
                  
                  return item;
                });

                // Layout pattern: 2-1-2-1-2 images across 5 columns (total 8 images)
                // Col 1: 2 images (one below another)
                // Col 2: 1 image (double-height, spans both rows)
                // Col 3: 2 images (one below another)
                // Col 4: 1 image (double-height, spans both rows)
                // Col 5: 2 images (one below another)
                const maxItems = 8;
                galleryItems = galleryItems.slice(0, maxItems);

                // Get image helper
                const getImageUrl = (item: any) => {
                  if (!item) return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                  return item.cover_image || item.image || item.images?.[0] || 
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                };

                if (galleryItems.length === 0) {
                  return (
                    <div className="grid grid-cols-5 gap-4" style={{ gridTemplateRows: '140px 140px', overflow: 'hidden' }}>
                      {/* Skeleton layout matching the pattern */}
                      <div className="h-[140px] bg-gray-200 rounded-xl animate-pulse" style={{ gridColumn: '1', gridRow: '1' }} />
                      <div className="h-[140px] bg-gray-200 rounded-xl animate-pulse" style={{ gridColumn: '1', gridRow: '2' }} />
                      <div className="h-[296px] bg-gray-200 rounded-xl animate-pulse row-span-2" style={{ gridColumn: '2', gridRow: '1 / 3' }} />
                      <div className="h-[140px] bg-gray-200 rounded-xl animate-pulse" style={{ gridColumn: '3', gridRow: '1' }} />
                      <div className="h-[140px] bg-gray-200 rounded-xl animate-pulse" style={{ gridColumn: '3', gridRow: '2' }} />
                      <div className="h-[296px] bg-gray-200 rounded-xl animate-pulse row-span-2" style={{ gridColumn: '4', gridRow: '1 / 3' }} />
                      <div className="h-[140px] bg-gray-200 rounded-xl animate-pulse" style={{ gridColumn: '5', gridRow: '1' }} />
                      <div className="h-[140px] bg-gray-200 rounded-xl animate-pulse" style={{ gridColumn: '5', gridRow: '2' }} />
                    </div>
                  );
                }

                // Render items in 2-1-2-1-2 pattern
                return (
                  <div className="grid grid-cols-5 gap-4" style={{ gridTemplateRows: '140px 140px', overflow: 'hidden' }}>
                    {galleryItems.map((item, index) => {
                      let gridColumn = '';
                      let gridRow = '';
                      let height = '140px';
                      let className = 'relative rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform duration-200';
                      
                      // Column 1: 2 images (index 0, 1)
                      if (index === 0) {
                        gridColumn = '1';
                        gridRow = '1';
                      } else if (index === 1) {
                        gridColumn = '1';
                        gridRow = '2';
                      }
                      // Column 2: 1 image double-height (index 2)
                      else if (index === 2) {
                        gridColumn = '2';
                        gridRow = '1 / 3';
                        height = '296px';
                        className += ' row-span-2';
                      }
                      // Column 3: 2 images (index 3, 4)
                      else if (index === 3) {
                        gridColumn = '3';
                        gridRow = '1';
                      } else if (index === 4) {
                        gridColumn = '3';
                        gridRow = '2';
                      }
                      // Column 4: 1 image double-height (index 5)
                      else if (index === 5) {
                        gridColumn = '4';
                        gridRow = '1 / 3';
                        height = '296px';
                        className += ' row-span-2';
                      }
                      // Column 5: 2 images (index 6, 7)
                      else if (index === 6) {
                        gridColumn = '5';
                        gridRow = '1';
                      } else if (index === 7) {
                        gridColumn = '5';
                        gridRow = '2';
                      }
                      
                      return (
                        <div
                          key={`gallery-item-${index}`}
                          onClick={() => {
                            if (item.type === 'experience') {
                              handleExperienceClick(item);
                            } else {
                              handleRetreatClick(item);
                            }
                          }}
                          className={className}
                          style={{ 
                            gridColumn: gridColumn,
                            gridRow: gridRow,
                            height: height
                          }}
                        >
                          <img
                            src={getImageUrl(item)}
                            alt={item.title || item.name || 'Gallery item'}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-semibold text-base line-clamp-2 leading-tight">
                              {item.title || item.name || 'Untitled'}
                            </h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            {/* Chat Assistant - Below Gallery (Inline) */}
            <div className="mt-8 flex justify-center">
              <AIChatAssistant inline={true} />
            </div>
          </section>

        {/* Trending Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending</h2>
            </div>
            
            <div className="relative">
              <div 
                className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Mixed Experiences and Retreats - 15 cards alternating pattern */}
                {(() => {
                  const mixedCards = [];
                  const maxCards = 15;
                  let cardIndex = 0;
                  
                  // Create alternating pattern: 2 experiences, 2 retreats, repeat
                  for (let i = 0; i < maxCards; i++) {
                    const isExperience = Math.floor(i / 2) % 2 === 0;
                    const dataArray = isExperience ? experiences : retreats;
                    const dataIndex = Math.floor(i / 4) * 2 + (i % 2);
                    const item = dataArray[dataIndex];
                    
                    // Helper function to get image URL
                    const getImageUrl = (item: any, isExp: boolean) => {
                      console.log('Getting image for item:', item);
                      console.log('Is experience:', isExp);
                      
                      if (!item) {
                        console.log('No item, using fallback');
                        return isExp 
                          ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                          : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                      }
                      
                      // Try different image field names
                      const possibleImages = [
                        item.cover_image,
                        item.image,
                        item.images?.[0],
                        item.images,
                        item.photo,
                        item.thumbnail,
                        item.picture
                      ];
                      
                      console.log('Possible images:', possibleImages);
                      
                      for (const img of possibleImages) {
                        if (img && typeof img === 'string' && img.startsWith('http')) {
                          console.log('Found valid image:', img);
                          return img;
                        }
                      }
                      
                      console.log('No valid image found, using fallback');
                      // Fallback to default images
                      return isExp 
                        ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                        : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                    };
                    
                    if (item) {
                      mixedCards.push(
                        <div
                          key={`${isExperience ? 'experience' : 'retreat'}-${item.id || cardIndex}`}
                          className="group animate-fade-in flex-shrink-0 w-full sm:w-96 lg:w-[calc(50vw-2rem)] xl:w-[calc(25rem+1rem)] max-w-lg"
                          style={{ animationDelay: `${cardIndex * 0.1}s` }}
                        >
                          <div 
                            onClick={() => isExperience ? handleExperienceClick(item) : handleRetreatClick(item)}
                            className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 relative"
                          >
                            {/* Saved Icon */}
                            {user && (
                              <button 
                                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBucketlistToggle(item, isExperience);
                                }}
                                aria-label={bucketlistedItems.has(item.id) ? 'Remove from bucketlist' : 'Add to bucketlist'}
                              >
                                {bucketlistedItems.has(item.id) ? (
                                  <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                                ) : (
                                  <BookmarkOutline className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                                )}
                              </button>
                            )}
                            <div className="flex flex-col md:flex-row h-48">
                              {/* Image on the left */}
                              <div className="relative w-full md:w-1/3 h-48 md:h-full">
                                <img
                                  src={getImageUrl(item, isExperience)}
                                  alt={item.title || (isExperience ? 'Experience' : 'Retreat')}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = isExperience 
                                      ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                                      : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                                  }}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              
                              {/* Content on the right */}
                              <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                  {/* Category */}
                                  <div className="mb-2">
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                      isExperience 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-blue-600 bg-blue-50'
                                    }`}>
                                      {item.mood || (isExperience ? 'Experience' : 'Retreat')}
                                    </span>
                                  </div>
                                  
                                  {/* Title */}
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {item.title || (isExperience ? 'Experience' : 'Retreat')}
                                  </h3>
                                  
                                  {/* Description */}
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {item.description || (isExperience ? 'Discover amazing experiences' : 'Discover amazing retreats')}
                                  </p>
                                </div>
                                
                                {/* Bottom row: Location and Price */}
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center text-gray-500 text-sm">
                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                    <span>{item.location || 'Location TBD'}</span>
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">
                                    ₹{item.price ? item.price.toLocaleString() : '0'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      cardIndex++;
                    }
                  }
                  
                  // If we don't have enough real data, fill with sample cards
                  while (mixedCards.length < maxCards) {
                    const isExperience = Math.floor(mixedCards.length / 2) % 2 === 0;
                    const sampleData = isExperience 
                      ? {
                          id: `sample-exp-${mixedCards.length}`,
                          title: 'Mountain Adventure',
                          description: 'Experience breathtaking mountain views and thrilling adventures',
                          location: 'Hyper-local',
                          mood: 'Thrill',
                          price: 2500,
                          cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                        }
                      : {
                          id: `sample-retreat-${mixedCards.length}`,
                          title: 'Yoga Retreat',
                          description: 'Rejuvenate your mind and body with our peaceful yoga retreat',
                          location: 'Retreats',
                          mood: 'Soulful',
                          price: 5000,
                          cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
                        };
                    
                    mixedCards.push(
                      <div
                        key={`sample-${isExperience ? 'experience' : 'retreat'}-${mixedCards.length}`}
                        className="group animate-fade-in flex-shrink-0 w-full sm:w-96 lg:w-[calc(50vw-2rem)] xl:w-[calc(25rem+1rem)] max-w-lg"
                        style={{ animationDelay: `${cardIndex * 0.1}s` }}
                      >
                        <div 
                          onClick={() => isExperience ? handleExperienceClick(sampleData) : handleRetreatClick(sampleData)}
                          className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                        >
                          <div className="flex flex-col md:flex-row h-48">
                            {/* Image on the left */}
                            <div className="relative w-full md:w-1/3 h-48 md:h-full">
                              <img
                                src={sampleData.cover_image}
                                alt={sampleData.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            
                            {/* Content on the right */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                              <div>
                                {/* Category */}
                                <div className="mb-2">
                                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    isExperience 
                                      ? 'text-green-600 bg-green-50' 
                                      : 'text-blue-600 bg-blue-50'
                                  }`}>
                                    {sampleData.mood}
                                  </span>
                                </div>
                                
                                {/* Title */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                  {sampleData.title}
                                </h3>
                                
                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {sampleData.description}
                                </p>
                              </div>
                              
                              {/* Bottom row: Location and Price */}
                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center text-gray-500 text-sm">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  <span>{sampleData.location}</span>
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                  ₹{sampleData.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    cardIndex++;
                  }
                  
                  return mixedCards;
                })()}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Mood Cards Section - Desktop Version */}
      <section className="py-20 bg-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mood Vibes</h2>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {moods.map((mood, index) => {
              // Get appropriate cover image based on mood
              const getMoodImage = (moodName: string) => {
                const moodImages: { [key: string]: string } = {
                  'Adventure': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80',
                  'Relaxation': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
                  'Cultural': 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&fit=crop&w=400&q=80',
                  'Social': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
                  'Learning': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
                  'Wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
                  'Creative': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&q=80',
                  'Nature': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80',
                  'Foodie': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8Mg%3D%3D&v=2',
                  'Soulful': 'https://images.unsplash.com/photo-1609961195485-8278b1a9c919?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fG9yYW5nZSUyMGxlYXZlcyUyMHBhdGh8ZW58MHx8MHx8fDI%3D',
                  'Thrill': 'https://images.unsplash.com/photo-1534146789009-76ed5060ec70?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmlrZXxlbnwwfHwwfHx8Mg%3D%3D',
                  'Artistic': 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=400&q=80',
                  'Meaningful': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
                  'Playful': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
                  'Chill': 'https://images.unsplash.com/photo-1550475476-44c382c5f2a2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZW5qb3l8ZW58MHx8MHx8fDI%3D',
                  'Group': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3JvdXB8ZW58MHx8MHx8fDI%3D',
                  'Couple': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
                  'Family': 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=400&q=80',
                  'Try': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80'
                };
                return moodImages[moodName] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80';
              };

              return (
                <div
                  key={mood}
                  onClick={() => handleMoodClick(mood)}
                  className="group flex-shrink-0 w-48 h-60 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={getMoodImage(mood)}
                      alt={mood}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg capitalize text-center">
                        {mood}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Experience Modal - Lazy loaded */}
      {isModalOpen && selectedExperience && (
        <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <ExperienceModal 
        experience={selectedExperience}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
        </Suspense>
      )}
      
      {/* Retreat Modal - Lazy loaded */}
      {isRetreatModalOpen && selectedRetreat && (
        <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <RetreatModal 
        retreat={selectedRetreat}
        isOpen={isRetreatModalOpen}
        onClose={handleCloseRetreatModal}
      />
        </Suspense>
      )}
      </div>
  );
}
