'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HeartIcon as HeartOutline,
  HeartIcon as HeartSolid,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidFilled } from '@heroicons/react/24/solid';
import { 
  isLiked, 
  addLike, 
  removeLike, 
  getLikesCount,
  addShare,
} from '@/lib/database';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface EngagementIconsProps {
  itemId: string;
  itemType: 'property' | 'experience' | 'retreat';
  itemTitle: string;
  itemUrl: string;
}

export function EngagementIcons({ itemId, itemType, itemTitle, itemUrl }: EngagementIconsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);


  useEffect(() => {
    if (user) {
      // Check if user has liked this item
      isLiked(user.id, itemId, itemType).then(setLiked);
    }
    // Get likes count
    getLikesCount(itemId, itemType).then(setLikesCount);
  }, [user, itemId, itemType]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to like items');
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        await removeLike(user.id, itemId, itemType);
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success('Removed from likes');
      } else {
        await addLike(user.id, itemId, itemType);
        setLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('Added to likes');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleModalClose = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowShareModal(false);
  };

  const handleShare = async (platform: string) => {
    if (!user) {
      toast.error('Please login to share items');
      return;
    }

    try {
      await addShare(user.id, itemId, itemType, platform);
      
      // Convert relative URL to absolute URL for sharing
      const absoluteUrl = `${window.location.origin}${itemUrl}`;
      
      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=Check out this amazing ${itemType} on EJA!&url=${encodeURIComponent(absoluteUrl)}`,
        instagram: `https://www.instagram.com/`,
        whatsapp: `https://wa.me/?text=Check out this amazing ${itemType} on EJA! ${encodeURIComponent(absoluteUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(absoluteUrl)}&text=Check out this amazing ${itemType} on EJA!`,
        copy_link: ''
      };

      if (platform === 'copy_link') {
        navigator.clipboard.writeText(absoluteUrl);
        toast.success('Link copied to clipboard!');
      } else if (platform === 'instagram') {
        toast.success('Please share manually on Instagram');
      } else {
        window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
        toast.success(`Shared on ${platform}!`);
      }
      
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };





  const sharePlatforms = [
    { name: 'WhatsApp', icon: '💬', value: 'whatsapp' },
    { name: 'Facebook', icon: '📘', value: 'facebook' },
    { name: 'Copy Link', icon: '🔗', value: 'copy_link' }
  ];

  return (
    <>
      {/* Engagement Icons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        {/* Left side - Icons only */}
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
            title={liked ? "Remove from likes" : "Add to likes"}
          >
            {liked ? (
              <HeartSolidFilled className="w-5 h-5 text-red-500" />
            ) : (
              <HeartOutline className="w-5 h-5 group-hover:text-red-500" />
            )}
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            title="Share this item"
          >
            <ShareIcon className="w-5 h-5 group-hover:text-blue-500" />
          </button>
        </div>

      </div>

                   {/* Share Modal */}
      <Modal open={showShareModal} onClose={handleModalClose} title="Share">
        <div className="grid grid-cols-3 gap-3">
          {sharePlatforms.map((platform) => (
            <button
              key={platform.value}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare(platform.value);
              }}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
            >
              <span className="text-2xl">{platform.icon}</span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{platform.name}</span>
            </button>
          ))}
        </div>
      </Modal>



    </>
  );
}
