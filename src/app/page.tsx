'use client';

import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { Footer } from '@/components/Footer';
import { OptimizedImage } from '@/components/OptimizedImage';
import Link from 'next/link';
import { 
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getRetreats, getExperiences, getProperties } from '@/lib/database';
import { PropertyWithHost } from '@/lib/types';
import ExperienceModal from '@/components/ExperienceModal';
import RetreatModal from '@/components/RetreatModal';





const EXPERIENCE_CATEGORIES = [
  { 
    name: 'Immersive', 
    description: 'Deep cultural experiences and local connections',
    image: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&fit=crop&w=800&q=80',
    icon: '🎭'
  },
  { 
    name: 'Culinary', 
    description: 'Food tours and authentic local cuisine',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    icon: '🍽️'
  },
  { 
    name: 'Try', 
    description: 'New experiences and exciting discoveries',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
    icon: '✨'
  },
  { 
    name: 'Group', 
    description: 'Group retreats and team experiences',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    icon: '👥'
  },
  { 
    name: 'Couple', 
    description: 'Romantic retreats and couple experiences',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    icon: '💕'
  }
];

export default function Home() {
  const [retreats, setRetreats] = useState<unknown[]>([]);
  const [experiences, setExperiences] = useState<unknown[]>([]);
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<unknown>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<unknown>(null);
  const [isRetreatModalOpen, setIsRetreatModalOpen] = useState(false);

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

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExperienceClick = (experience: unknown) => {
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

  const handleRetreatClick = (retreat: unknown) => {
    try {
      if (retreat && retreat.id) {
    setSelectedRetreat(retreat);
    setIsRetreatModalOpen(true);
      }
    } catch (error) {
      console.error('Error handling retreat click:', error);
    }
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
        <main>
          <HeroSection />


        {/* Explore Happiness Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Happiness</h2>
            </div>
            
            <div className="relative">
              <div 
                className="flex gap-5 overflow-x-auto pb-12 pt-8 px-8 -mx-8 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Experience Categories */}
                {EXPERIENCE_CATEGORIES.map((category, index) => (
                  <div
                    key={`category-${category.name}`} 
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link 
                      href={`/search?type=experiences&category=${encodeURIComponent(category.name)}`} 
                      className="block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-64">
                        <img
                          src={category.image}
                          alt={`${category.name} experiences`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.log('Category image failed to load:', target.src);
                            // Fallback to a different image if the first one fails
                            target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 right-4 text-4xl">{category.icon}</div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="mb-2">
                          <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                          <p className="text-sm text-gray-200">Experiences</p>
                        </div>
                        <p className="text-sm text-gray-300">{category.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Travel Inspirations Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Travel Inspirations</h2>
            </div>
            
            <div className="relative">
              <div 
                className="flex gap-5 overflow-x-auto pb-12 pt-8 px-8 -mx-8 scrollbar-hide"
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
                    const getImageUrl = (item: unknown, isExp: boolean) => {
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
                    className="group animate-fade-in flex-shrink-0 w-72"
                          style={{ animationDelay: `${cardIndex * 0.1}s` }}
                  >
                    <div 
                            onClick={() => isExperience ? handleExperienceClick(item) : handleRetreatClick(item)}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                            <div className="relative h-48">
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
                        
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                  isExperience 
                                    ? 'text-green-600 bg-green-50' 
                                    : 'text-blue-600 bg-blue-50'
                                }`}>
                                  {item.categories ? (
                                    Array.isArray(item.categories) 
                                      ? item.categories[0] 
                                      : item.categories
                                  ) : (
                                    isExperience ? 'Experience' : 'Retreat'
                                  )}
                            </span>
                          </div>
                              
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {item.title || (isExperience ? 'Experience' : 'Retreat')}
                              </h3>
                              
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {item.description || (isExperience ? 'Discover amazing experiences' : 'Discover amazing retreats')}
                              </p>
                              
                              <div className="flex items-center justify-between">
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
                          location: 'Himalayas',
                          price: 2500,
                          categories: 'Mountain',
                          cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
                        }
                      : {
                          id: `sample-retreat-${mixedCards.length}`,
                          title: 'Yoga Retreat',
                          description: 'Rejuvenate your mind and body with our peaceful yoga retreat',
                          location: 'Rishikesh',
                          price: 5000,
                          categories: 'Wellness',
                          cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
                        };
                    
                    mixedCards.push(
                      <div
                        key={`sample-${isExperience ? 'experience' : 'retreat'}-${mixedCards.length}`}
                    className="group animate-fade-in flex-shrink-0 w-72"
                        style={{ animationDelay: `${cardIndex * 0.1}s` }}
                  >
                        <div 
                          onClick={() => isExperience ? handleExperienceClick(sampleData) : handleRetreatClick(sampleData)}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                          <div className="relative h-48">
                        <OptimizedImage 
                              src={sampleData.cover_image}
                              alt={sampleData.title}
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        </div>
                          
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                isExperience 
                                  ? 'text-green-600 bg-green-50' 
                                  : 'text-blue-600 bg-blue-50'
                              }`}>
                                {sampleData.categories}
                              </span>
                        </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {sampleData.title}
                            </h3>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {sampleData.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
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
