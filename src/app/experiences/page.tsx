'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { OptimizedImage } from '@/components/OptimizedImage';
import ExperienceModal from '@/components/ExperienceModal';
import { getExperiences } from '@/lib/database';
import { Experience } from '@/lib/types';
import { 
  MapPinIcon, 
  ClockIcon, 
  StarIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getExperiences();
        setExperiences(data || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setError('Failed to load experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleExperienceClick = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return '🌟';
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('thrill') || moodLower.includes('adventure')) return '🧗';
    if (moodLower.includes('chill') || moodLower.includes('playful')) return '🎮';
    if (moodLower.includes('foodie') || moodLower.includes('culinary')) return '🍽️';
    if (moodLower.includes('soulful') || moodLower.includes('meaningful')) return '❤️';
    if (moodLower.includes('artistic') || moodLower.includes('creative')) return '🎨';
    return '🌟';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading experiences...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Experiences</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Unique Experiences</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover authentic local experiences that will create lasting memories. 
            From cultural immersions to adventure activities, find your perfect experience.
          </p>
        </div>

        {/* Experiences Grid */}
        {experiences.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Experiences Available</h2>
            <p className="text-gray-600">Check back soon for amazing new experiences!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {experiences.map((experience, index) => (
              <div
                key={experience.id}
                onClick={() => handleExperienceClick(experience)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <OptimizedImage 
                    src={experience.cover_image || '/placeholder-experience.jpg'} 
                    alt={experience.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Category Badge */}
                  {experience.mood && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                        <span className="text-lg">{getMoodIcon(experience.mood)}</span>
                        {experience.mood}
                      </span>
                    </div>
                  )}
                  
                  {/* Upcoming Label - Top Right (except for Karaoke Nights) */}
                  {experience.title !== 'Karaoke Nights' && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-yellow-500/95 backdrop-blur-sm shadow-lg text-white border-yellow-400">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Upcoming
                      </span>
                    </div>
                  )}
                  
                  {/* Verified Badge - Bottom Right (when Upcoming label is shown) */}
                  {experience.title !== 'Karaoke Nights' && (
                    <div className="absolute bottom-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <ShieldCheckIcon className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  
                  {/* Verified Badge - Top Right (only for Karaoke Nights) */}
                  {experience.title === 'Karaoke Nights' && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <ShieldCheckIcon className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {experience.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">{experience.location}</span>
                    </div>
                    {experience.duration_hours && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{experience.duration_hours}h</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-blue-600">₹{experience.price?.toLocaleString()}</div>
                    <span className="text-gray-500 text-sm">/person</span>
                  </div>
                  
                  {/* Check-in Button */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Check-in
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      
      {/* Experience Modal */}
      <ExperienceModal 
        experience={selectedExperience}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
