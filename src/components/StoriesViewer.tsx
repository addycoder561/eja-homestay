import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface Story {
  id: string;
  experience_id: string;
  guest_id?: string;
  guest_name?: string;
  guest_email?: string;
  rating: number;
  comment?: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
}

interface StoriesViewerProps {
  stories: Story[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function StoriesViewer({ stories, isOpen, onClose, initialIndex = 0 }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure stories is an array and has valid data
  const validStories = Array.isArray(stories) ? stories.filter(story => story && story.id) : [];
  const currentStory = validStories[currentIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  // Debug logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('StoriesViewer props:', { stories, isOpen, initialIndex, validStories, currentStory });
  }

  const nextStory = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < validStories.length - 1) {
        return prevIndex + 1;
      } else {
        onClose();
        return prevIndex;
      }
    });
  }, [validStories.length, onClose]);

  const prevStory = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying((prevIsPlaying) => {
      const newIsPlaying = !prevIsPlaying;
      if (prevIsPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        const startTime = Date.now() - (progress / 100) * STORY_DURATION;
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
          setProgress(newProgress);

          if (newProgress >= 100) {
            nextStory();
          }
        }, 50);
      }
      return newIsPlaying;
    });
  }, [progress, nextStory]);

  useEffect(() => {
    if (!isOpen || !currentStory || validStories.length === 0) return;

    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsPlaying(true);

    const startProgress = () => {
      setProgress(0);
      const startTime = Date.now();
      
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          nextStory();
        }
      }, 50);
    };

    startProgress();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, initialIndex, validStories.length, currentStory, nextStory]);

  // Don't render if no valid stories - moved after hooks
  if (!isOpen || !currentStory || validStories.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('StoriesViewer not rendering:', { isOpen, currentStory, validStoriesLength: validStories.length });
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-1">
          {validStories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-75 ${
                  index < currentIndex ? 'w-full' : 
                  index === currentIndex ? 'w-full' : 'w-0'
                }`}
                style={{
                  width: index === currentIndex ? `${progress}%` : 
                         index < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-12 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {currentStory.guest_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {currentStory.guest_name || 'Anonymous'}
            </p>
            <p className="text-white/70 text-xs">
              {new Date(currentStory.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background image/video */}
        {currentStory.image_url ? (
          <img
            src={currentStory.image_url}
            alt="Story"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <div className="text-center text-white">
              <CameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Story Moment</p>
            </div>
          </div>
        )}

        {/* Overlay content */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Rating stars */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 bg-black/50 rounded-full px-4 py-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${i < currentStory.rating ? 'text-yellow-400' : 'text-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        {currentStory.comment && (
          <div className="absolute bottom-32 left-4 right-4">
            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-white text-sm leading-relaxed">
                {currentStory.comment}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="absolute inset-0 flex">
        {/* Previous story */}
        <button
          onClick={prevStory}
          className="flex-1 flex items-center justify-start p-4"
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="w-8 h-8 text-white/50" />
        </button>

        {/* Next story */}
        <button
          onClick={nextStory}
          className="flex-1 flex items-center justify-end p-4"
          disabled={currentIndex === stories.length - 1}
        >
          <ChevronRightIcon className="w-8 h-8 text-white/50" />
        </button>
      </div>

      {/* Play/Pause overlay */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handlePause}
      />
    </div>
  );
}

interface StoryThumbnailProps {
  story: Story;
  onClick: () => void;
}

export function StoryThumbnail({ story, onClick }: StoryThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform duration-200"
    >
      {story.image_url ? (
        <img
          src={story.image_url}
          alt="Story"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
          <PhotoIcon className="w-6 h-6 text-white" />
        </div>
      )}
      
      {/* Viewed indicator */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Rating indicator */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
        <div className="flex justify-center">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`w-2 h-2 ${i < story.rating ? 'text-yellow-400' : 'text-white/30'}`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

interface AddStoryButtonProps {
  onClick: () => void;
}

export function AddStoryButton({ onClick }: AddStoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white shadow-lg hover:scale-105 transition-transform duration-200"
    >
      <PlusIcon className="w-8 h-8 text-white" />
    </button>
  );
}
