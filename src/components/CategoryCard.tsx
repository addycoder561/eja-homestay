"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryCardProps {
  name: string;
  description: string;
  image: string;
  icon: string;
  type: 'experience' | 'retreat';
  index: number;
}

export function CategoryCard({ name, description, image, icon, type, index }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackImage = () => {
    return type === 'experience' 
      ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
  };

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (process.env.NODE_ENV !== 'production') {
    console.log(`🎯 Category clicked: ${name} (${type})`);
    }
    
    const url = type === 'experience' 
      ? `/search?type=experiences&category=${encodeURIComponent(name)}` 
      : `/search?type=retreats&category=${encodeURIComponent(name)}`;
    
    router.push(url);
  }, [name, type, router]);

  return (
    <div
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div 
        className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 bg-white h-80"
        onClick={handleCardClick}
        data-category-card
      >
        <div className="relative h-64">
          <img
            src={imageError ? getFallbackImage() : image}
            alt={`${name} ${type === 'experience' ? 'experiences' : 'retreats'}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4 text-4xl drop-shadow-lg">{icon}</div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-2">
            <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{name}</h3>
            <p className="text-sm text-gray-100 drop-shadow-md">{type === 'experience' ? 'Experiences' : 'Retreats'}</p>
          </div>
          <p className="text-sm text-gray-200 drop-shadow-md">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default memo(CategoryCard);
