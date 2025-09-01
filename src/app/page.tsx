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
import { getRetreats, getExperiences, getProperties, getAdCampaigns, getActiveCoupons } from '@/lib/database';
import { buildCoverFirstImages } from '@/lib/media';
import { PropertyWithHost } from '@/lib/types';
import { LiveRating } from '@/components/LiveRating';





const POPULAR_DESTINATIONS = [
  { 
    city: 'Rishikesh', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    description: 'Spiritual capital of yoga'
  },
  { 
    city: 'Mussoorie', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1504609813440-554e64a8f005?auto=format&fit=crop&w=800&q=80',
    description: 'Queen of the hills'
  },
  { 
    city: 'Kanatal', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Serene hill station'
  },
  { 
    city: 'Manali', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    description: 'Adventure paradise'
  },
  { 
    city: 'Ladakh', 
    state: 'Ladakh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'Land of high passes'
  },
  { 
    city: 'Shimla', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
    description: 'Summer capital of British India'
  },
  { 
    city: 'Nainital', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    description: 'Lake city of Uttarakhand'
  },
  { 
    city: 'Dehradun', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    description: 'Gateway to the hills'
  },
  { 
    city: 'McLeod Ganj', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    description: 'Little Lhasa of India'
  },
  { 
    city: 'Kasol', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Mini Israel of India'
  },
  { 
    city: 'Kullu', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    description: 'Valley of Gods'
  },
  { 
    city: 'Dalhousie', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'Switzerland of India'
  }
];

export default function Home() {
  const [retreats, setRetreats] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingRetreats, setLoadingRetreats] = useState(true);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetreats = async () => {
      try {
        setLoadingRetreats(true);
        setError(null);
        const data = await getRetreats();
        setRetreats(data || []);
      } catch (error) {
        console.error('Error fetching retreats:', error);
        setError('Failed to load retreats');
      } finally {
        setLoadingRetreats(false);
      }
    };

    const fetchExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const data = await getExperiences();
        setExperiences(data || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoadingExperiences(false);
      }
    };

    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const data = await getProperties();
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    const fetchCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const data = await getAdCampaigns(4);
        setCampaigns(data || []);
      } catch (error) {
        console.error('Error fetching ad campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const data = await getActiveCoupons(5);
        setCoupons(data || []);
      } catch (error) {
        console.error('Error fetching active coupons:', error);
        setCoupons([]);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchRetreats();
    fetchExperiences();
    fetchProperties();
    fetchCampaigns();
    fetchCoupons();
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

        {/* Explore Destinations Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Destinations</h2>
            </div>
            
            <div className="relative">
              <div 
                className="flex gap-5 overflow-x-auto pb-12 pt-8 px-8 -mx-8 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Popular Destinations */}
                {POPULAR_DESTINATIONS.map((dest, index) => (
                  <div
                    key={`dest-${dest.city}`} 
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link 
                      href={`/search?location=${encodeURIComponent(dest.city)}`} 
                      className="block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-48 w-full">
                        <OptimizedImage 
                          src={dest.image} 
                          alt={dest.city} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                        {/* Destination info */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-bold text-lg">{dest.city}</span>
                            <span className="text-white text-sm">🇮🇳</span>
                          </div>
                          <div className="text-white/90 text-sm mb-3">{dest.description}</div>
                          
                          {/* Enhanced CTA */}
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                            <span className="text-white font-semibold text-sm">Explore Now</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Best Deals Section */}
        <section className="py-16 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Best Deals & Offers</h2>
            </div>
            {campaigns && campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {campaigns.slice(0, 4).map((c: any, index: number) => (
                  <Link
                    key={c.id || index}
                    href={c.target_url || '#'}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105 border-2 border-yellow-200 flex"
                  >
                    <div className="relative w-1/3 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <div className="text-center text-white px-3">
                        <div className="text-3xl font-bold mb-1">🔥</div>
                        <div className="text-lg font-bold line-clamp-1">{c.title}</div>
                        {c.start_date && c.end_date && (
                          <div className="text-xs opacity-90">{new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{c.title}</h3>
                        {c.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{c.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-600 font-bold text-sm">Featured Offer</span>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Explore
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Fallback to existing hardcoded offers when there are no active campaigns */}
                <div className="space-y-6">
                  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105 border-2 border-red-200 flex">
                    <div className="relative w-1/3 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold mb-1">⚡</div>
                        <div className="text-lg font-bold">FLASH DEAL</div>
                        <div className="text-xs opacity-90">Limited Time</div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                        -30%
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Weekend Getaways</h3>
                        <p className="text-gray-600 text-sm mb-3">Book any weekend stay and get 30% off on properties above ₹5,000</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-600 font-bold text-sm">Valid till 31st Dec</span>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105 border-2 border-yellow-200 flex">
                    <div className="relative w-1/3 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold mb-1">🐦</div>
                        <div className="text-lg font-bold">EARLY BIRD</div>
                        <div className="text-xs opacity-90">Book Early</div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white text-yellow-600 px-2 py-1 rounded-full text-xs font-bold">
                        -25%
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Advance Booking</h3>
                        <p className="text-gray-600 text-sm mb-3">Book 30+ days in advance and save 25% on your stay</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-600 font-bold text-sm">No Expiry</span>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105 border-2 border-orange-200 flex">
                    <div className="relative w-1/3 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold mb-1">🎓</div>
                        <div className="text-lg font-bold">STUDENT</div>
                        <div className="text-xs opacity-90">Special Offer</div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white text-orange-600 px-2 py-1 rounded-full text-xs font-bold">
                        -20%
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Student Discount</h3>
                        <p className="text-gray-600 text-sm mb-3">Valid student ID gets you 20% off on all properties</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-600 font-bold text-sm">Always Active</span>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Verify ID
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105 border-2 border-amber-200 flex">
                    <div className="relative w-1/3 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold mb-1">👨‍👩‍👧‍👦</div>
                        <div className="text-lg font-bold">FAMILY</div>
                        <div className="text-xs opacity-90">Package Deal</div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white text-amber-600 px-2 py-1 rounded-full text-xs font-bold">
                        -15%
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Family Package</h3>
                        <p className="text-gray-600 text-sm mb-3">Book for 4+ guests and get 15% off + free breakfast</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-600 font-bold text-sm">4+ Guests</span>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Promotional Banner with Active Coupons */}
            {coupons && coupons.length > 0 ? (
              <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-3xl font-bold text-white mb-4">🎉 Special Offers</h3>
                  <p className="text-xl text-white mb-6">Limited time discounts - grab them before they expire!</p>
                  
                  {/* Coupon Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {coupons.slice(0, 6).map((coupon, index) => (
                      <div key={coupon.id || index} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-200 cursor-pointer group">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-2">
                            {coupon.discount_type === 'percent' 
                              ? `${coupon.discount_value}% OFF`
                              : `₹${coupon.discount_value} OFF`
                            }
                          </div>
                          <div className="text-white/90 text-sm mb-2 font-medium">
                            {coupon.description || 'Special Discount'}
                          </div>
                          <div className="bg-white text-orange-600 px-3 py-2 rounded-lg font-bold text-lg tracking-wider">
                            {coupon.code}
                          </div>
                          {coupon.valid_to && (
                            <div className="text-white/80 text-xs mt-2">
                              Valid till {new Date(coupon.valid_to).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                    View All Offers
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback to existing hardcoded banner when no active coupons */
              <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-3xl font-bold text-white mb-4">🎉 Welcome EJA</h3>
                  <p className="text-xl text-white mb-6">Sponsored 2D/1N Getaway with Every Signup/Collab this September–October 2025.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <span className="text-white font-semibold">Use Code: EJASTART</span>
                    </div>
                    <button className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                      Claim Offer
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                {/* Trending Getaways */}
                {!loadingRetreats && retreats.slice(0, 4).map((retreat, index) => (
                  <div
                    key={`retreat-${retreat.id}`}
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link 
                      href={`/retreats/${retreat.id}`} 
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        <OptimizedImage 
                          src={retreat.image || retreat.cover_image || '/placeholder-experience.jpg'} 
                          alt={retreat.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                          Retreat
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <ShieldCheckIcon className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-lg text-gray-900 mb-2 group-hover:text-yellow-500 transition-colors">
                          {retreat.title}
                        </div>
                        <div className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {retreat.location}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-yellow-500 font-bold text-lg">₹{retreat.price?.toLocaleString()}</div>
                          <span className="text-gray-500 text-sm">/person</span>
                        </div>
                        
                        {/* Enhanced CTA Button */}
                        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Book Now
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}

                {/* Unique Experiences */}
                {!loadingExperiences && experiences.slice(0, 4).map((experience, index) => (
                  <div
                    key={`experience-${experience.id}`}
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                  >
                    <Link 
                      href={`/experiences/${experience.id}`} 
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        <OptimizedImage 
                          src={experience.image || experience.cover_image || '/placeholder-experience.jpg'} 
                          alt={experience.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                          Experience
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <ShieldCheckIcon className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-lg text-gray-900 mb-2 group-hover:text-yellow-500 transition-colors">
                          {experience.title}
                        </div>
                        <div className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {experience.location}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-yellow-500 font-bold text-lg">₹{experience.price?.toLocaleString()}</div>
                          <span className="text-gray-500 text-sm">/person</span>
                        </div>
                        
                        {/* Enhanced CTA Button */}
                        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Book Now
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}

                {/* Featured Properties */}
                {properties && properties.slice(0, 4).map((property, index) => (
                  <div
                    key={`property-${property.id}`}
                    className="group animate-fade-in flex-shrink-0 w-72"
                    style={{ animationDelay: `${(index + 8) * 0.1}s` }}
                  >
                    <Link 
                      href={`/property/${property.id}`} 
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        <OptimizedImage 
                          src={buildCoverFirstImages(property.cover_image, property.images)[0]} 
                          alt={property.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                          Property
                        </div>
                        <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                          ₹{property.price_per_night}/night
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-lg text-gray-900 mb-2 group-hover:text-yellow-500 transition-colors">
                          {property.title}
                        </div>
                        <div className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {property.city}, {property.country}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            <span>Up to {property.max_guests} guests</span>
                          </div>
                          <LiveRating 
                            propertyId={property.id}
                            propertyTitle={property.title}
                            size="sm"
                          />
                        </div>
                        
                        {/* Enhanced CTA Button */}
                        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Book Now
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
