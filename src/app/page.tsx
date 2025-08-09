import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

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
];

const TRENDING_GETAWAYS = [
  { title: 'Cloud End Retreat', city: 'Mussoorie', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', price: 4200 },
  { title: 'Boutique Lakeview', city: 'Rishikesh', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800', price: 6000 },
  { title: 'Forest Cottage', city: 'Rishikesh', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800', price: 4200 },
  { title: 'Boutique Valleyview', city: 'Mussoorie', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', price: 6300 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <HeroSection />

        {/* Popular Destinations */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {POPULAR_DESTINATIONS.map((dest) => (
                <Link 
                  key={dest.city} 
                  href={`/search?location=${encodeURIComponent(dest.city)}`} 
                  className="group block relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-48 w-full">
                    <Image 
                      src={dest.image} 
                      alt={dest.city} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Destination name with Indian flag */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">{dest.city}</span>
                        <span className="text-white text-sm">🇮🇳</span>
                      </div>
                      <div className="text-white/80 text-sm mt-1">{dest.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Getaways */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Trending Getaways</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {TRENDING_GETAWAYS.map((getaway) => (
                <Link key={getaway.title} href={`/search?location=${encodeURIComponent(getaway.city)}`} className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden">
                  <div className="relative h-40 w-full">
                    <Image src={getaway.image} alt={getaway.title} fill className="object-cover" />
                  </div>
                  <div className="p-4 text-center">
                    <div className="font-bold text-lg text-gray-900">{getaway.title}</div>
                    <div className="text-gray-600 text-sm">{getaway.city}</div>
                    <div className="mt-2 text-blue-600 font-semibold">₹{getaway.price}/night</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Book with EJA? */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Book with EJA?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-lg p-6 shadow">
                <div className="text-4xl mb-4">🌄</div>
                <div className="font-bold text-lg mb-2">Curated Stays</div>
                <div className="text-gray-600">Handpicked boutique, homely, and off-beat properties for unique experiences.</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 shadow">
                <div className="text-4xl mb-4">🤝</div>
                <div className="font-bold text-lg mb-2">Trusted Hosts</div>
                <div className="text-gray-600">Verified hosts with a passion for hospitality and local culture.</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 shadow">
                <div className="text-4xl mb-4">🛡️</div>
                <div className="font-bold text-lg mb-2">Flexible & Secure</div>
                <div className="text-gray-600">Easy booking, flexible cancellation, and secure payments for peace of mind.</div>
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
