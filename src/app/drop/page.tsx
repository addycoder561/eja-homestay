'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FireIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  TagIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CompleteDareModal } from '@/components/CompleteDareModal';
import { DareCard } from '@/components/DareCard';
import { CompletedDareCard } from '@/components/CompletedDareCard';
import { Navigation } from '@/components/Navigation';
import { MobileBottomNavigation } from '@/components/MobileBottomNavigation';

interface Dare {
  id: string;
  title: string;
  description: string;
  hashtag?: string;
  vibe: 'Happy' | 'Chill' | 'Bold' | 'Social';
  creator: {
    full_name: string;
    avatar_url?: string;
  };
  completion_count: number;
  smile_count: number;
  comment_count: number;
  share_count: number;
  expiry_date: string;
  created_at: string;
  hours_remaining?: number;
}

interface CompletedDare {
  id: string;
  dare_id: string;
  media_urls: string[];
  caption?: string;
  location?: string;
  created_at: string;
  completer: {
    full_name: string;
    avatar_url?: string;
  };
  dare: {
    title: string;
    description: string;
    hashtag?: string;
    vibe: string;
    creator?: {
      full_name: string;
      avatar_url?: string;
    } | null;
  };
  smile_count: number;
  comment_count: number;
  share_count: number;
};

const VIBE_FILTERS = [
  { id: 'all', name: 'All Vibes', color: 'gray' },
  { id: 'Happy', name: 'Happy', color: 'yellow' },
  { id: 'Chill', name: 'Chill', color: 'blue' },
  { id: 'Bold', name: 'Bold', color: 'red' },
  { id: 'Social', name: 'Social', color: 'green' }
];


export default function DaresPage() {
  const { user } = useAuth();
  // Initialize with empty array - real data loads immediately
  const [completedDares, setCompletedDares] = useState<CompletedDare[]>([]);
  const [loading, setLoading] = useState(false); // Never block UI with loading
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedDare, setSelectedDare] = useState<Dare | null>(null);

  // Fetch all completed dares - non-blocking, loads real data immediately
  const fetchAllCompletedDares = async () => {
    try {
      // Reduced timeout for faster failure recovery
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      // Reduced initial limit for faster loading
      const response = await fetch('/api/dares/completed?limit=20', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && Array.isArray(data.completed_dares)) {
        // Set real data immediately
        setCompletedDares(data.completed_dares);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('API error:', data?.error || 'unknown');
        }
        // Keep empty array - show empty state
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('API failed:', error);
        }
      }
      // Keep empty array on error - show empty state
    }
    // Never set loading to true - UI should always show immediately
  };

  useEffect(() => {
    fetchAllCompletedDares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompleteDare = (dare: Dare) => {
    setSelectedDare(dare);
    setShowCompleteModal(true);
  };

  const handleTryDare = (dareId: string) => {
    const mockDare: Dare = {
      id: dareId,
      title: "Try this dare!",
      description: "Complete this challenge and share your experience.",
      hashtag: "challenge",
      vibe: "Happy" as const,
      creator: {
        full_name: "Community",
        avatar_url: undefined
      },
      completion_count: 0,
      smile_count: 0,
      comment_count: 0,
      share_count: 0,
      expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    
    setSelectedDare(mockDare);
    setShowCompleteModal(true);
  };

  const handleDareCompleted = () => {
    setShowCompleteModal(false);
    setSelectedDare(null);
    fetchAllCompletedDares();
  };

  const handleEngagement = async (dareId: string, engagementType: string, content?: string) => {
    try {
      const response = await fetch('/api/dares/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dare_id: dareId,
          engagement_type: engagementType,
          content
        })
      });

      if (response.ok) {
        fetchAllCompletedDares();
      }
    } catch (error) {
      console.error('Error creating engagement:', error);
    }
  };

  const handleTagUsers = async (completedDareId: string, userIds: string[]) => {
    try {
      const tagPromises = userIds.map(userId => 
        fetch('/api/dares/engagements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completed_dare_id: completedDareId,
            engagement_type: 'tag',
            content: userId
          })
        })
      );

      await Promise.all(tagPromises);
      console.log(`Tagged ${userIds.length} users in dare ${completedDareId}`);
    } catch (error) {
      console.error('Error tagging users:', error);
    }
  };

  const getVibeColor = (vibe: string) => {
    const colors = {
      Happy: 'bg-yellow-100 text-yellow-800',
      Chill: 'bg-blue-100 text-blue-800',
      Bold: 'bg-red-100 text-red-800',
      Social: 'bg-green-100 text-green-800'
    };
    return colors[vibe as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getVibeGradient = (vibeId: string) => {
    switch (vibeId) {
      case 'Happy': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Chill': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'Bold': return 'bg-gradient-to-r from-red-400 to-pink-500';
      case 'Social': return 'bg-gradient-to-r from-green-400 to-teal-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const formatTimeRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Grid layout for Discover-style cards: 1/2/3 columns - Always show immediately */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedDares.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No completed dares yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Complete some dares to see them here!
                </p>
              </div>
            ) : (
              completedDares.map((completedDare) => (
                <div key={completedDare.id} className="w-full">
                  <CompletedDareCard
                    completedDare={completedDare}
                    onEngagement={(type, content) => handleEngagement(completedDare.id, type, content)}
                    onTryDare={handleTryDare}
                    onTagUsers={(userIds) => handleTagUsers(completedDare.id, userIds)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {showCompleteModal && selectedDare && (
          <CompleteDareModal
            isOpen={showCompleteModal}
            onClose={() => {
              setShowCompleteModal(false);
              setSelectedDare(null);
            }}
            dare={selectedDare}
            onDareCompleted={handleDareCompleted}
          />
        )}
      </div>
      <MobileBottomNavigation />
    </>
  );
}
