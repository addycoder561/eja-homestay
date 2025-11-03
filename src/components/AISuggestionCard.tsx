'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface Suggestion {
  id: string;
  type: 'experience' | 'retreat';
  title: string;
  description: string;
  location: string;
  price: number;
  mood: string;
  cover_image?: string;
  duration: string;
  booking_url: string;
  itinerary: string;
}

interface AISuggestionCardProps {
  suggestion: Suggestion;
  onViewDetails: (suggestion: Suggestion) => void;
  onBook: (suggestion: Suggestion) => void;
}

export function AISuggestionCard({ suggestion, onViewDetails, onBook }: AISuggestionCardProps) {
  const [showItinerary, setShowItinerary] = useState(false);

  const handleViewDetails = () => {
    onViewDetails(suggestion);
  };

  const handleBook = () => {
    onBook(suggestion);
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      'Adventure': 'bg-red-100 text-red-800',
      'Thrill': 'bg-red-100 text-red-800',
      'Chill': 'bg-blue-100 text-blue-800',
      'Soulful': 'bg-purple-100 text-purple-800',
      'Wellness': 'bg-green-100 text-green-800',
      'Social': 'bg-yellow-100 text-yellow-800',
      'Cultural': 'bg-indigo-100 text-indigo-800',
      'Artistic': 'bg-pink-100 text-pink-800',
      'Foodie': 'bg-orange-100 text-orange-800',
      'Retreat': 'bg-purple-100 text-purple-800',
    };
    return moodColors[mood] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-32 w-full">
        <img
          src={suggestion.cover_image || '/placeholder-experience.jpg'}
          alt={suggestion.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-experience.jpg';
          }}
        />
        {/* Mood Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(suggestion.mood)}`}>
            {suggestion.mood}
          </span>
        </div>
        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            suggestion.type === 'experience' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {suggestion.type === 'experience' ? 'Experience' : 'Retreat'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {suggestion.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {suggestion.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500 text-xs">
            <MapPinIcon className="w-3 h-3 mr-1" />
            <span>{suggestion.location}</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>{suggestion.duration}</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <CurrencyDollarIcon className="w-3 h-3 mr-1" />
            <span>₹{suggestion.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Itinerary Toggle */}
        <button
          onClick={() => setShowItinerary(!showItinerary)}
          className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 mb-3 transition-colors"
        >
          <CalendarDaysIcon className="w-3 h-3" />
          <span>{showItinerary ? 'Hide' : 'Show'} Itinerary</span>
        </button>

        {/* Itinerary */}
        {showItinerary && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
              {suggestion.itinerary}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <EyeIcon className="w-3 h-3 mr-1" />
            View Details
          </Button>
          <Button
            onClick={handleBook}
            variant="primary"
            size="sm"
            className="flex-1 text-xs bg-yellow-500 hover:bg-yellow-600"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
