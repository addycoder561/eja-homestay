'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HeartIcon as HeartOutline,
  HeartIcon as HeartSolid,
  ShareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidFilled } from '@heroicons/react/24/solid';
import { 
  isLiked, 
  addLike, 
  removeLike, 
  getLikesCount,
  addShare,
  addCardCollaboration
} from '@/lib/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [collaborationType, setCollaborationType] = useState<'reel' | 'co_host'>('reel');

  // Collaboration form state
  const [collaborationForm, setCollaborationForm] = useState({
    instagram: '',
    proposal: ''
  });

  // Contribute form state
  const [contributeForm, setContributeForm] = useState({
    story: ''
  });

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

  const handleCollaborateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCollaborateModal(true);
  };

  const handleContributeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContributeModal(true);
  };

  const handleModalClose = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowShareModal(false);
    setShowCollaborateModal(false);
    setShowContributeModal(false);
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



  const handleCollaborationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to collaborate');
      return;
    }

    if (!collaborationForm.instagram.trim() || !collaborationForm.proposal.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await addCardCollaboration(
        user.id,
        itemId,
        itemType,
        collaborationType,
        {
          name: user.email?.split('@')[0] || 'User', // Use email prefix as name
          email: user.email || '', // Use user's email
          instagram: collaborationForm.instagram,
          proposal: collaborationForm.proposal
        }
      );
      toast.success('Collaboration request submitted successfully!');
      setShowCollaborateModal(false);
      setCollaborationForm({
        instagram: '',
        proposal: ''
      });
    } catch (error) {
      console.error('Error submitting collaboration:', error);
      toast.error('Failed to submit collaboration request');
    } finally {
      setLoading(false);
    }
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to contribute');
      return;
    }

    if (!contributeForm.story.trim()) {
      toast.error('Please share your story');
      return;
    }

    setLoading(true);
    try {
      // Add contribute story to database
      const { error } = await supabase
        .from('contribute_stories')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
          story: contributeForm.story,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success('Your story has been shared!');
      setShowContributeModal(false);
      setContributeForm({
        story: ''
      });
    } catch (error) {
      console.error('Error submitting story:', error);
      toast.error('Failed to share your story');
    } finally {
      setLoading(false);
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

          {/* Contribute Button */}
          <button
            onClick={handleContributeClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-200 group"
            title="Share your story"
          >
            <svg className="w-5 h-5 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
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

        {/* Right side - Collaborate Button */}
        <button
          onClick={handleCollaborateClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-500 hover:bg-purple-50 transition-all duration-200 group border border-gray-200 hover:border-purple-300"
          title="Collaborate with host"
        >
          <SparklesIcon className="w-5 h-5 group-hover:text-purple-500" />
          <span className="text-sm font-medium">Collaborate</span>
        </button>
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



      {/* Collaborate Modal */}
      <Modal open={showCollaborateModal} onClose={handleModalClose} title="Collaborate">
        <div className="space-y-4">
          <form onSubmit={handleCollaborationSubmit} className="space-y-4">
            {/* Collaboration Type - Simplified */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCollaborationType('reel');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    collaborationType === 'reel' 
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  📱 Instagram Reel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCollaborationType('co_host');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    collaborationType === 'co_host' 
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  👥 Co-Host
                </button>
              </div>
            </div>
            
            {/* Instagram Handle */}
            <Input
              label="Instagram Username"
              value={collaborationForm.instagram}
              onChange={(e) => setCollaborationForm(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="@yourhandle"
              required
            />
            
            {/* Proposal - Simplified */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Idea <span className="text-red-500">*</span>
              </label>
              <textarea
                value={collaborationForm.proposal}
                onChange={(e) => setCollaborationForm(prev => ({ ...prev, proposal: e.target.value }))}
                placeholder={`Tell us about your ${collaborationType === 'reel' ? 'reel idea and audience' : 'co-hosting experience'}...`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about what you can offer
              </p>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              loading={loading} 
              disabled={loading}
            >
              Send Request
            </Button>
          </form>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal open={showContributeModal} onClose={handleModalClose} title="Share Your Story">
        <div className="space-y-4">
          <div className="text-center pb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-xl">✍️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Share Your Experience</h3>
            <p className="text-sm text-gray-600 mt-1">Tell others about your amazing time here</p>
          </div>

          <form onSubmit={handleContributeSubmit} className="space-y-4">
            {/* Story Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story <span className="text-red-500">*</span>
              </label>
              <textarea
                value={contributeForm.story}
                onChange={(e) => setContributeForm(prev => ({ ...prev, story: e.target.value }))}
                placeholder="Share your experience, memories, or tips about this place..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Share what made this experience special for you
              </p>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              loading={loading} 
              disabled={loading}
            >
              Share Story
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
