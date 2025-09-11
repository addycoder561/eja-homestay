'use client';

import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { Footer } from '@/components/Footer';

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
  }
];

export default function TestHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <HeroSection />

        {/* Explore Happiness Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Happiness</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {EXPERIENCE_CATEGORIES.map((category, index) => (
                <div
                  key={`category-${category.name}`} 
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
