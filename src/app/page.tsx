import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPinIcon, 
  StarIcon, 
  HeartIcon,
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const POPULAR_DESTINATIONS = [
  { 
    city: 'Rishikesh', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    description: 'Spiritual capital of yoga',
    properties: 45,
    avgPrice: 3200
  },
  { 
    city: 'Mussoorie', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1504609813440-554e64a8f005?auto=format&fit=crop&w=800&q=80',
    description: 'Queen of the hills',
    properties: 38,
    avgPrice: 4200
  },
  { 
    city: 'Kanatal', 
    state: 'Uttarakhand', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Serene hill station',
    properties: 22,
    avgPrice: 3800
  },
  { 
    city: 'Manali', 
    state: 'Himachal Pradesh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    description: 'Adventure paradise',
    properties: 67,
    avgPrice: 4500
  },
  { 
    city: 'Ladakh', 
    state: 'Ladakh', 
    country: 'India', 
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'Land of high passes',
    properties: 28,
    avgPrice: 5200
  },
];

const TRENDING_GETAWAYS = [
  { 
    title: 'Cloud End Retreat', 
    city: 'Mussoorie', 
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', 
    price: 4200,
    rating: 4.8,
    reviews: 124,
    type: 'Boutique Hotel'
  },
  { 
    title: 'Boutique Lakeview', 
    city: 'Rishikesh', 
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800', 
    price: 6000,
    rating: 4.9,
    reviews: 89,
    type: 'Luxury Villa'
  },
  { 
    title: 'Forest Cottage', 
    city: 'Rishikesh', 
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800', 
    price: 4200,
    rating: 4.7,
    reviews: 156,
    type: 'Cottage'
  },
  { 
    title: 'Boutique Valleyview', 
    city: 'Mussoorie', 
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', 
    price: 6300,
    rating: 4.6,
    reviews: 203,
    type: 'Boutique Hotel'
  },
];

const FEATURES = [
  {
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    title: "Verified Properties",
    description: "All properties are personally verified by our team for quality and safety."
  },
  {
    icon: <ClockIcon className="w-8 h-8" />,
    title: "24/7 Support",
    description: "Round-the-clock customer support to help you with any queries."
  },
  {
    icon: <CurrencyRupeeIcon className="w-8 h-8" />,
    title: "Best Price Guarantee",
    description: "We guarantee the best prices for all our properties."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <HeroSection />

        {/* Popular Destinations */}
        <section id="search-section" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center mb-12 animate-fade-in"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the most sought-after destinations in India, from spiritual retreats to adventure hotspots
              </p>
            </div>
            
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              {POPULAR_DESTINATIONS.map((dest, index) => (
                <div
                  key={dest.city} 
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link 
                    href={`/search?location=${encodeURIComponent(dest.city)}`} 
                    className="block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
                  >
                    <div className="relative h-64 w-full">
                    <Image 
                      src={dest.image} 
                      alt={dest.city} 
                      fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                      {/* Destination info */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-bold text-xl">{dest.city}</span>
                        <span className="text-white text-sm">🇮🇳</span>
                        </div>
                        <div className="text-white/90 text-sm mb-3">{dest.description}</div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-white/80 text-xs">
                          <span>{dest.properties} properties</span>
                          <span>₹{dest.avgPrice}/night avg</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Getaways */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center mb-12 animate-fade-in"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending Getaways</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Handpicked properties that are trending among our guests
              </p>
            </div>
            
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
            >
              {TRENDING_GETAWAYS.map((getaway, index) => (
                <div
                  key={getaway.title}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link 
                    href={`/search?location=${encodeURIComponent(getaway.city)}`} 
                    className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={getaway.image} 
                        alt={getaway.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                        {getaway.type}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {getaway.title}
                      </div>
                      <div className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {getaway.city}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{getaway.rating}</span>
                        </div>
                        <span className="text-gray-500 text-sm">({getaway.reviews} reviews)</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-blue-600 font-bold text-lg">₹{getaway.price.toLocaleString()}</div>
                        <span className="text-gray-500 text-sm">/night</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center mb-16 animate-fade-in"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EJA Homestay?</h2>
              <p className="text-xl text-gray-600">
                We're committed to providing you with the best travel experience
              </p>
            </div>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="text-center group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="animate-fade-in"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who have discovered amazing properties through EJA Homestay
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/search">
                  <button
                    className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    Start Exploring
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button
                    className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Sign Up Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
}
