'use client';

import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { Footer } from '@/components/Footer';
import { OptimizedImage } from '@/components/OptimizedImage';
import { CategoryCard } from '@/components/CategoryCard';
import Link from 'next/link';
import { 
  MapPinIcon,
  BookmarkIcon as BookmarkOutline
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { getRetreats, getExperiences, getProperties, isBucketlisted, addToBucketlist, removeFromBucketlist } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { PropertyWithHost } from '@/lib/types';
import ExperienceModal from '@/components/ExperienceModal';
import RetreatModal from '@/components/RetreatModal';
import { useAuth } from '@/contexts/AuthContext';





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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data with simple error handling
        const [retreatsData, experiencesData, propertiesData] = await Promise.allSettled([
          getRetreats(),
          getExperiences(),
          getProperties()
        ]);

        const retreatsResult = retreatsData.status === 'fulfilled' ? (retreatsData.value || []) : [];
        const experiencesResult = experiencesData.status === 'fulfilled' ? (experiencesData.value || []) : [];
        const propertiesResult = propertiesData.status === 'fulfilled' ? (propertiesData.value || []) : [];
        
        // Debug: Log the data structure
        console.log('Retreats data:', retreatsResult);
        console.log('Experiences data:', experiencesResult);
        console.log('Properties data:', propertiesResult);
        
        setRetreats(retreatsResult);
        setExperiences(experiencesResult);
        setProperties(propertiesResult);

        // Fetch unique moods from experiences_unified table
        const { data: moodData, error: moodError } = await supabase
          .from('experiences_unified')
          .select('mood')
          .not('mood', 'is', null)
          .neq('mood', '');

        if (!moodError && moodData) {
          const uniqueMoods = [...new Set(moodData.map(item => item.mood).filter(Boolean))];
          setMoods(uniqueMoods.slice(0, 9)); // Limit to 9 moods
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExperienceClick = (experience: any) => {
    try {
      if (experience && experience.id) {
    setSelectedExperience(experience);
    setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error handling experience click:', error);
    }
  };

  const handleCloseModal = () => {
    try {
    setIsModalOpen(false);
    setSelectedExperience(null);
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  };

  const handleRetreatClick = (retreat: any) => {
    try {
      if (retreat && retreat.id) {
    setSelectedRetreat(retreat);
    setIsRetreatModalOpen(true);
      }
    } catch (error) {
      console.error('Error handling retreat click:', error);
    }
  };

  const handleBucketlistToggle = async (item: any, isExperience: boolean) => {
    if (!user) {
      // Redirect to sign in or show auth modal
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
      console.error('Error toggling bucketlist:', error);
    }
  };

  const handleMoodClick = (mood: string) => {
    // Navigate to discover page with mood filter to fetch only experiences with that specific mood
    window.location.href = `/discover?mood=${encodeURIComponent(mood)}`;
  };

  const handleCloseRetreatModal = () => {
    try {
    setIsRetreatModalOpen(false);
    setSelectedRetreat(null);
    } catch (error) {
      console.error('Error closing retreat modal:', error);
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing experiences...</p>
        </div>
      </div>
    );
  }

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
          {/* Mobile Hero Banner - 4 Grid Categories */}
          <section className="px-4 py-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: 'just-opened',
                  title: 'just opened',
                  subtitle: 'be the first to go!',
                  image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80',
                  dotColor: 'bg-green-400',
                  href: '/discover?filter=just-opened'
                },
                {
                  id: 'trending',
                  title: 'trending',
                  subtitle: "buzzing now",
                  image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
                  dotColor: 'bg-orange-400',
                  href: '/discover?filter=trending'
                },
                {
                  id: 'lowkey',
                  title: 'lowkey',
                  subtitle: 'dare to try',
                  image: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&fit=crop&w=400&q=80',
                  dotColor: 'bg-purple-400',
                  href: '/discover?filter=lowkey'
                },
                {
                  id: 'popular',
                  title: 'popular',
                  subtitle: 'all time favorites',
                  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
                  dotColor: 'bg-pink-400',
                  href: '/discover?filter=popular'
                }
              ].map((category, index) => (
                <div
                  key={category.id}
                  onClick={() => window.location.href = category.href}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <div className={`w-2 h-2 rounded-full ${category.dotColor}`} />
                         <h3 className="font-semibold text-gray-900 text-xs capitalize">
                           {category.title}
                         </h3>
                       </div>
                       <p className="text-gray-600 text-xs">
                         {category.subtitle}
                       </p>
                    </div>
                  </div>
                </div>
              ))}
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
          <HeroSection />

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
                                    console.log('Image failed to load:', target.src);
                                    target.src = isExperience 
                                      ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                                      : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                                  }}
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
      
      {/* Experience Modal */}
      {isModalOpen && selectedExperience && (
      <ExperienceModal 
        experience={selectedExperience}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      )}
      
      {/* Retreat Modal */}
      {isRetreatModalOpen && selectedRetreat && (
      <RetreatModal 
        retreat={selectedRetreat}
        isOpen={isRetreatModalOpen}
        onClose={handleCloseRetreatModal}
      />
      )}
    </div>
  );
}
