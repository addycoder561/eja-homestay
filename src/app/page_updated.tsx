'use client';

import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { Footer } from '@/components/Footer';
import { OptimizedImage } from '@/components/OptimizedImage';
import Link from 'next/link';
import { 
  MapPinIcon, 
  StarIcon, 
  HeartIcon,
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { getRetreats, getExperiences, getProperties, getAdCampaigns, getActiveCoupons, checkExperiencesContent, checkRetreatsContent } from '@/lib/database';
import { buildCoverFirstImages } from '@/lib/media';
import { PropertyWithHost } from '@/lib/types';
import { LiveRating } from '@/components/LiveRating';
import ExperienceModal from '@/components/ExperienceModal';
import RetreatModal from '@/components/RetreatModal';

const EXPERIENCE_CATEGORIES = [
  { 
    name: 'Mountain', 
    description: 'High-altitude adventures and breathtaking views',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    icon: '🏔️'
  },
  { 
    name: 'Immersive', 
    description: 'Deep cultural experiences and local connections',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    icon: '🎭'
  },
  { 
    name: 'Culinary', 
    description: 'Food tours and authentic local cuisine',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    icon: '🍽️'
  },
  { 
    name: 'Adventure', 
    description: 'Thrilling outdoor activities and extreme sports',
    image: 'https://images.unsplash.com/photo-1551524164-6cf77ac2e7f8?auto=format&fit=crop&w=800&q=80',
    icon: '🏄‍♂️'
  },
  { 
    name: 'Wellness', 
    description: 'Yoga, meditation, and holistic healing',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    icon: '🧘‍♀️'
  },
  { 
    name: 'Photography', 
    description: 'Capture stunning moments and landscapes',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80',
    icon: '📸'
  }
];

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [retreats, setRetreats] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [loadingRetreats, setLoadingRetreats] = useState(true);
  const [adCampaigns, setAdCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<any>(null);
  const [isRetreatModalOpen, setIsRetreatModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check content for debugging
        await checkExperiencesContent();
        await checkRetreatsContent();

        const [propertiesData, experiencesData, retreatsData, campaignsData, couponsData] = await Promise.all([
          getProperties(),
          getExperiences(),
          getRetreats(),
          getAdCampaigns(),
          getActiveCoupons()
        ]);

        setProperties(propertiesData || []);
        setExperiences(experiencesData || []);
        setRetreats(retreatsData || []);
        setAdCampaigns(campaignsData || []);
        setCoupons(couponsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingProperties(false);
        setLoadingExperiences(false);
        setLoadingRetreats(false);
      }
    };

    fetchData();
  }, []);

  const handleExperienceClick = (experience: any) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  const handleRetreatClick = (retreat: any) => {
    setSelectedRetreat(retreat);
    setIsRetreatModalOpen(true);
  };

  const handleCloseRetreatModal = () => {
    setIsRetreatModalOpen(false);
    setSelectedRetreat(null);
  };

  return (
    <>
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
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
                      href={`/search?category=${encodeURIComponent(category.name)}`} 
                      className="block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-64">
                        <OptimizedImage
                          src={category.image}
                          alt={`${category.name} experiences`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

        {/* Featured Properties Section */}
        <FeaturedProperties properties={properties} loading={loadingProperties} />

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
                {/* Experiences */}
                {!loadingExperiences && experiences.slice(0, 6).map((experience, index) => (
                  <div
                    key={`experience-${experience.id}`}
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div 
                      onClick={() => handleExperienceClick(experience)}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-48">
                        <OptimizedImage
                          src={experience.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'}
                          alt={experience.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {Array.isArray(experience.categories) ? experience.categories.join(', ') : experience.categories}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {experience.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {experience.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span>{experience.location}</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₹{experience.price?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Retreats */}
                {!loadingRetreats && retreats.slice(0, 6).map((retreat, index) => (
                  <div
                    key={`retreat-${retreat.id}`}
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${(index + 6) * 0.1}s` }}
                  >
                    <div 
                      onClick={() => handleRetreatClick(retreat)}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-48">
                        <OptimizedImage
                          src={retreat.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'}
                          alt={retreat.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {Array.isArray(retreat.categories) ? retreat.categories.join(', ') : retreat.categories}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {retreat.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {retreat.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span>{retreat.location}</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₹{retreat.price?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ad Campaigns Section */}
        {adCampaigns.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Special Offers</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {adCampaigns.map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className="group animate-fade-in bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                        <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{campaign.title}</h3>
                        <p className="text-gray-600">{campaign.description}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {campaign.discount_percentage}% OFF
                        </span>
                        <span className="text-sm text-gray-500">
                          Valid until {new Date(campaign.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                      Use Offer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Active Coupons Section */}
        {coupons.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Coupons</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon, index) => (
                  <div
                    key={coupon.id}
                    className="group animate-fade-in bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-dashed border-green-200"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold text-lg">₹</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                          <p className="text-sm text-gray-600">{coupon.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-green-600">
                          ₹{coupon.discount_amount}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">Discount</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Min. Order: ₹{coupon.minimum_amount}</span>
                      <span>Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                    </div>
                    
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200">
                      Copy Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose EJA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EJA?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to providing you with exceptional experiences that create lasting memories
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Hosts</h3>
                <p className="text-gray-600">All our hosts are carefully vetted and verified for your safety and comfort</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock customer support to assist you whenever you need help</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">Handpicked properties and experiences that meet our high standards</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Memorable Experiences</h3>
                <p className="text-gray-600">Create unforgettable memories with our curated experiences and stays</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Experience Modal */}
      <ExperienceModal 
        experience={selectedExperience} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
      
      {/* Retreat Modal */}
      <RetreatModal 
        retreat={selectedRetreat} 
        isOpen={isRetreatModalOpen} 
        onClose={handleCloseRetreatModal} 
      />
    </>
  );
}
