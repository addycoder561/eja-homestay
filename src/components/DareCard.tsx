'use client';

import { useState } from 'react';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  TagIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  FireIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CompletedDareCard } from './CompletedDareCard';

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

interface DareCardProps {
  dare: Dare;
  completedDares: any[];
  loadingCompleted?: boolean;
  onComplete: () => void;
  onEngagement: (type: string, content?: string) => void;
  onViewCompleted: () => void;
  getVibeColor: (vibe: string) => string;
  formatTimeRemaining: (expiryDate: string) => string;
}

export function DareCard({ 
  dare, 
  completedDares,
  loadingCompleted = false,
  onComplete, 
  onEngagement, 
  onViewCompleted,
  getVibeColor,
  formatTimeRemaining 
}: DareCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSmiled, setIsSmiled] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [smileCount, setSmileCount] = useState(dare.smile_count);
  const [commentCount, setCommentCount] = useState(dare.comment_count);
  const [shareCount, setShareCount] = useState(dare.share_count);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow functionality
  };

  const handleSmile = () => {
    setIsSmiled(!isSmiled);
    setSmileCount(prev => isSmiled ? prev - 1 : prev + 1);
    onEngagement('smile');
  };

  const handleComment = () => {
    const comment = prompt('Add a comment:');
    if (comment) {
      setCommentCount(prev => prev + 1);
      onEngagement('comment', comment);
    }
  };

  const handleShare = () => {
    setShareCount(prev => prev + 1);
    onEngagement('share');
    // TODO: Implement share functionality
  };

  const handleTag = () => {
    onEngagement('tag');
    // TODO: Implement tag functionality
  };

  const handleViewCompleted = async () => {
    if (!showCompleted) {
      onViewCompleted();
    }
    setShowCompleted(!showCompleted);
  };

  const isExpiringSoon = dare.hours_remaining && dare.hours_remaining < 24;
  const isExpired = new Date(dare.expiry_date) < new Date();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        {/* Vibe Badge */}
        <div className={`${getVibeColor(dare.vibe)} rounded-xl px-4 py-3 mb-4 flex items-center gap-3`}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {dare.vibe === 'Happy' && '😊'}
            {dare.vibe === 'Chill' && '😌'}
            {dare.vibe === 'Bold' && '🔥'}
            {dare.vibe === 'Social' && '👥'}
          </div>
          <div>
            <h3 className="font-bold text-lg">{dare.vibe} Vibe</h3>
            <p className="text-sm opacity-80">Ready to challenge yourself?</p>
          </div>
        </div>

        {/* Dare Content */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{dare.title}</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-3">{dare.description}</p>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {dare.hashtag && (
              <span className="font-medium">#{dare.hashtag}</span>
            )}
            <span>•</span>
            <span>expires {formatTimeRemaining(dare.expiry_date)}</span>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {dare.creator.avatar_url ? (
              <img 
                src={dare.creator.avatar_url} 
                alt={dare.creator.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-sm">
                {dare.creator.full_name.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">by {dare.creator.full_name}</span>
        </div>

        {/* Complete Button */}
        {!isExpired && (
          <Button
            onClick={onComplete}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 mb-4 rounded-xl"
          >
            Complete this Dare
          </Button>
        )}

        {/* Engagement Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleSmile}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isSmiled ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            {isSmiled ? (
              <HeartSolidIcon className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span>{smileCount}</span>
          </button>
          
          <button
            onClick={handleComment}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 text-sm font-medium transition-colors"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span>{commentCount}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-500 hover:text-green-500 text-sm font-medium transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span>{shareCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
