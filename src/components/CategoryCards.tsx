'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getHyperLocalExperiences, getRetreats, getOnlineExperiences, getPopularExperiences } from '@/lib/database';

const CATEGORIES = [
  {
    id: 'hyper-local',
    title: 'hyper-local',
    subtitle: 'in your city',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
    dotColor: 'bg-green-400',
    href: '/discover?filter=hyper-local'
  },
  {
    id: 'retreats',
    title: 'retreats',
    subtitle: "far-away",
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
    dotColor: 'bg-orange-400',
    href: '/discover?filter=retreats'
  },
  {
    id: 'online',
    title: 'online',
    subtitle: 'at home',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80',
    dotColor: 'bg-purple-400',
    href: '/discover?filter=online'
  },
  {
    id: 'popular',
    title: 'popular',
    subtitle: 'all time favorites',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
    dotColor: 'bg-pink-400',
    href: '/discover?filter=popular'
  }
];

export function CategoryCards() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState({
    hyperLocal: 0,
    retreats: 0,
    online: 0,
    popular: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        const [hyperLocalData, retreatsData, onlineData, popularData] = await Promise.allSettled([
          getHyperLocalExperiences(),
          getRetreats(),
          getOnlineExperiences(),
          getPopularExperiences()
        ]);

        setCategoryData({
          hyperLocal: hyperLocalData.status === 'fulfilled' ? hyperLocalData.value?.length || 0 : 0,
          retreats: retreatsData.status === 'fulfilled' ? retreatsData.value?.length || 0 : 0,
          online: onlineData.status === 'fulfilled' ? onlineData.value?.length || 0 : 0,
          popular: popularData.status === 'fulfilled' ? popularData.value?.length || 0 : 0
        });
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-[90%] md:w-[70%] mt-8 p-6 bg-gray-50 rounded-2xl">
      {CATEGORIES.map((category, index) => (
        <div
          key={category.id}
          onClick={() => handleCardClick(category.href)}
          onMouseEnter={() => setHoveredCard(category.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 active:scale-95"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="p-6 flex items-center gap-4">
            {/* Image */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${category.dotColor}`} />
                <h3 className="font-bold text-gray-900 text-lg capitalize group-hover:text-yellow-500 transition-colors">
                  {category.title}
                </h3>
                {!loading && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {categoryData[category.id as keyof typeof categoryData] || 0}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {category.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
