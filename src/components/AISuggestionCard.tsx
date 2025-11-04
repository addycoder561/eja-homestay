'use client';

import { Button } from '@/components/ui/Button';
import { 
  MapPinIcon, 
  ClockIcon
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
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(suggestion);
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col">
      {/* Image */}
      <div className="relative h-40 w-full flex-shrink-0">
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
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMoodColor(suggestion.mood)}`}>
            {suggestion.mood}
          </span>
        </div>
        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-900 shadow-sm">
            ₹{suggestion.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1.5 line-clamp-2 flex-shrink-0">
          {suggestion.title}
        </h3>

        {/* Details - Compact */}
        <div className="space-y-1 mb-3 flex-shrink-0">
          <div className="flex items-center text-gray-600 text-xs">
            <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{suggestion.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <ClockIcon className="w-3 h-3 mr-1 flex-shrink-0" />
            <span>{suggestion.duration}</span>
          </div>
        </div>

        {/* Action Button - Full Width */}
        <div className="mt-auto">
          <Button
            onClick={handleViewDetails}
            variant="primary"
            size="sm"
            className="w-full text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-2"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
