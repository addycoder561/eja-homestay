'use client';

import { useState } from 'react';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { DelightStory } from '@/lib/delight-api';
import toast from 'react-hot-toast';

interface DelightStoriesProps {
  stories: DelightStory[];
  likedStories: Set<string>;
  storyLikes: Record<string, number>;
  onLikeStory: (storyId: string) => void;
  onShareStory: (story: DelightStory) => void;
}

export function DelightStories({ 
  stories, 
  likedStories, 
  storyLikes, 
  onLikeStory, 
  onShareStory 
}: DelightStoriesProps) {
  const [selectedStory, setSelectedStory] = useState<DelightStory | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const handleStoryClick = (story: DelightStory) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const handleLikeInModal = (storyId: string) => {
    onLikeStory(storyId);
  };

  const handleShareInModal = (story: DelightStory) => {
    onShareStory(story);
  };

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stories Yet</h3>
        <p className="text-gray-600">Be the first to complete a delight task and share your story!</p>
      </div>
    );
  }

  return (
    <>
      {/* Instagram-style Stories Row */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => handleStoryClick(story)}
            className="flex-shrink-0 cursor-pointer group"
          >
            {/* Story Circle with Border */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                  <img
                    src={story.proof_media}
                    alt="Story"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              
              {/* User Name */}
              <div className="text-center mt-2">
                <p className="text-xs text-gray-600 truncate w-16 md:w-20">
                  {story.user?.full_name?.split(' ')[0] || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Modal */}
      {showStoryModal && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            {/* Close Button */}
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl font-bold hover:text-gray-300"
            >
              ×
            </button>

            {/* Story Content */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {/* Story Image */}
              <div className="relative">
                <img
                  src={selectedStory.proof_media}
                  alt="Story"
                  className="w-full h-64 object-cover"
                />
                
                {/* Story Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <p className="font-semibold">
                      {selectedStory.user?.full_name || 'Anonymous'} did{' '}
                      <span className="font-bold">{selectedStory.task?.title}</span>
                    </p>
                    <p className="text-sm text-gray-200 mt-1">
                      {formatTimeAgo(selectedStory.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 flex items-center justify-between">
                <button
                  onClick={() => handleLikeInModal(selectedStory.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    likedStories.has(selectedStory.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {likedStories.has(selectedStory.id) ? (
                    <HeartSolidIcon className="w-4 h-4" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                  {storyLikes[selectedStory.id] || 0}
                </button>
                
                <button
                  onClick={() => handleShareInModal(selectedStory)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
