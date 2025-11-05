'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { 
  FaceSmileIcon as FaceSmileSolidIcon
} from '@heroicons/react/24/solid';
import { CommentModal } from '@/components/CommentModal';

// Custom paper-plane Share Icon (matches modal icon)
const ShareIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg 
    className={className}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
  } | null;
  dare: {
    title: string;
    description: string;
    hashtag?: string;
    vibe: string;
    expiry_date?: string;
    creator?: {
      full_name: string;
      avatar_url?: string;
    } | null;
  };
  smile_count: number;
  comment_count: number;
  share_count: number;
}

interface CompletedDareCardProps {
  completedDare: CompletedDare;
  onEngagement: (type: string, content?: string) => void;
  onTryDare?: (dareId: string) => void;
  onTagUsers?: (userIds: string[]) => void;
}

export const CompletedDareCard = memo(function CompletedDareCard({ completedDare, onEngagement, onTryDare, onTagUsers }: CompletedDareCardProps) {
  const [showCommentModal, setShowCommentModal] = useState(false);

  const completer = completedDare.completer ?? { full_name: 'Anonymous', avatar_url: undefined };
  const dareCreator = completedDare.dare.creator ?? { full_name: 'Anonymous', avatar_url: undefined };

  const formatTimeRemaining = (expiryDate?: string): string | null => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''} left`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes !== 1 ? 's' : ''} left`;
    } else {
      return 'Expired';
    }
  };

  const timeRemaining = formatTimeRemaining(completedDare.dare.expiry_date);

  const handleCardClick = () => {
    setShowCommentModal(true);
  };

  const handleAcceptDare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTryDare) {
      onTryDare(completedDare.dare_id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEngagement('share');
  };

  const submitComment = async (text: string) => {
    await fetch('/api/dares/engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed_dare_id: completedDare.id,
        engagement_type: 'comment',
        content: text,
      })
    });
    onEngagement('comment', text);
  };


  // Get the first image (navigation available in modal)
  const displayImage = completedDare.media_urls.length > 0 
    ? completedDare.media_urls[0] 
    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';

  return (
    <>
      <div 
        className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer aspect-square bg-gray-200"
        onClick={handleCardClick}
      >
        {/* Full Image - Optimized with Next.js Image */}
        <Image
          src={displayImage}
          alt={completedDare.dare.title || 'Completed dare'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          quality={85}
          unoptimized={displayImage.startsWith('http') && !displayImage.includes('supabase.co')}
        />

        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top Left: Circular Profile Picture + Dare Creator Name */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg relative">
            {completer?.avatar_url ? (
              <Image
                src={completer.avatar_url}
                alt={completer.full_name || 'User avatar'}
                fill
                className="object-cover"
                sizes="40px"
                loading="lazy"
                quality={75}
                unoptimized={completer.avatar_url.startsWith('http') && !completer.avatar_url.includes('supabase.co')}
              />
            ) : (
              <span className="text-gray-700 font-semibold text-sm">
                {(completer.full_name && completer.full_name.charAt(0).toUpperCase()) || '?'}
              </span>
            )}
          </div>
          <span className="text-white font-semibold text-sm drop-shadow-lg">
            {dareCreator.full_name || 'Anonymous'}
          </span>
        </div>
        
        {/* Top Right: Expiry Timer */}
        {timeRemaining && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-white font-semibold text-sm drop-shadow-lg">
              {timeRemaining}
            </span>
          </div>
        )}

        {/* Bottom Left: Dare Title + Smiles count + Tag icon */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2">
          {/* Dare Title */}
          <h3 className="text-white font-bold text-sm md:text-base drop-shadow-lg line-clamp-2 max-w-[60%]">
            {completedDare.dare.title}
          </h3>
          
          {/* Smiles count + Share icon */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
              <FaceSmileSolidIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-900">
                {completedDare.smile_count || 0}
                </span>
            </div>
            <button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
              aria-label="Share"
            >
              <ShareIcon className="w-5 h-5 text-gray-900" />
            </button>
          </div>
          </div>
          
        {/* Bottom Right: Accept Dare button */}
        <div className="absolute bottom-3 right-3 z-10">
          <button 
            onClick={handleAcceptDare}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-colors text-sm"
          >
            Accept Dare
          </button>
        </div>
      </div>

      <CommentModal
        open={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        completedDare={completedDare}
        onSubmitComment={submitComment}
        onEngagement={onEngagement}
        onTryDare={onTryDare}
      />
    </>
  );
});
