'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PhotoIcon, MapPinIcon, CalendarIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import ConfettiAnimation from '@/components/ConfettiAnimation';

interface CreateExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  mood: string;
  location: string;
  date: string;
  time: string;
  coverImage: File | null;
  carouselImages: File[];
  isPaid: boolean;
  price: string;
  capacity: string;
  coHosts: string;
  duration: string;
}


export default function CreateExperienceModal({ isOpen, onClose }: CreateExperienceModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    mood: '',
    location: '',
    date: '',
    time: '',
    coverImage: null,
    carouselImages: [],
    isPaid: false,
    price: '',
    capacity: '',
    coHosts: '',
    duration: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moodOptions, setMoodOptions] = useState<string[]>([]);
  const [showMoodDrawer, setShowMoodDrawer] = useState(false);
  
  const coverImageRef = useRef<HTMLInputElement>(null);
  const carouselImagesRef = useRef<HTMLInputElement>(null);
  const moodDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch mood options from database
  useEffect(() => {
    const fetchMoodOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('experiences_unified')
          .select('mood')
          .not('mood', 'is', null)
          .neq('mood', '');

        if (error) throw error;

        // Extract unique moods
        const uniqueMoods = [...new Set(data.map(item => item.mood).filter(Boolean))];
        setMoodOptions(uniqueMoods);
      } catch (error) {
        console.error('Error fetching mood options:', error);
        // Fallback to default moods if database fetch fails
        setMoodOptions(['Adventure', 'Relaxation', 'Cultural', 'Social', 'Learning', 'Wellness', 'Creative', 'Nature', 'Food', 'Music']);
      }
    };

    if (isOpen) {
      fetchMoodOptions();
    }
  }, [isOpen]);

  // Close mood dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(event.target as Node)) {
        setShowMoodDrawer(false);
      }
    };

    if (showMoodDrawer) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoodDrawer]);

  const handleInputChange = (field: keyof FormData, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null, type: 'cover' | 'carousel') => {
    if (!files) return;
    
    if (type === 'cover') {
      setFormData(prev => ({ ...prev, coverImage: files[0] }));
    } else {
      const newImages = Array.from(files);
      setFormData(prev => ({ 
        ...prev, 
        carouselImages: [...prev.carouselImages, ...newImages].slice(0, 5) // Max 5 images
      }));
    }
  };

  const removeCarouselImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      carouselImages: prev.carouselImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (publish: boolean = true) => {
    if (!formData.title || !formData.description || !formData.mood || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setIsDraft(!publish);

    try {
      // Upload cover image
      let coverImageUrl = '';
      if (formData.coverImage) {
        const coverFileExt = formData.coverImage.name.split('.').pop();
        const coverFileName = `${Date.now()}-cover.${coverFileExt}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('experience-images')
          .upload(coverFileName, formData.coverImage);
        
        if (coverError) throw coverError;
        coverImageUrl = coverData.path;
      }

      // Upload carousel images
      const carouselUrls: string[] = [];
      for (let i = 0; i < formData.carouselImages.length; i++) {
        const file = formData.carouselImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-carousel-${i}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('experience-images')
          .upload(fileName, file);
        
        if (error) throw error;
        carouselUrls.push(data.path);
      }

      // Create experience record
      const experienceData = {
        title: formData.title,
        description: formData.description,
        mood: formData.mood,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        cover_image: coverImageUrl,
        carousel_images: carouselUrls,
        is_paid: formData.isPaid,
        price: formData.isPaid ? parseFloat(formData.price) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        co_hosts: formData.coHosts,
        duration: formData.duration,
        status: publish ? 'published' : 'draft',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('experiences_unified')
        .insert(experienceData);

      if (error) throw error;

      // Success animation
      if (publish) {
        setShowConfetti(true);
        toast.success('🎉 Shared with the world!');
      } else {
        toast.success('Draft saved successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        mood: '',
        location: '',
        date: '',
        time: '',
        coverImage: null,
        carouselImages: [],
        isPaid: false,
        price: '',
        capacity: '',
        coHosts: '',
        duration: ''
      });

      onClose();
    } catch (error) {
      console.error('Error creating experience:', error);
      toast.error('Failed to create experience. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfettiAnimation 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full h-full md:max-w-2xl md:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create Experience</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
            </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
              <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="What's your experience about?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Tell people what they can expect..."
            />
          </div>

          {/* Mood & Location - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood *
            </label>
                <button
                  type="button"
                onClick={() => setShowMoodDrawer(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900"
              >
                {formData.mood || <span className="text-gray-500">Select a mood</span>}
                </button>
                
                {/* Desktop Dropdown */}
                {showMoodDrawer && (
                  <div ref={moodDropdownRef} className="hidden md:block absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {moodOptions.map(mood => (
                        <button
                          key={mood}
                          onClick={() => {
                            handleInputChange('mood', mood);
                            setShowMoodDrawer(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            formData.mood === mood
                              ? 'bg-yellow-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {mood}
                </button>
              ))}
                    </div>
                  </div>
                )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Where will this take place?"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Date *
              </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Time *
            </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PhotoIcon className="w-4 h-4 inline mr-1" />
              Cover Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {formData.coverImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(formData.coverImage)} 
                    alt="Cover preview" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleInputChange('coverImage', null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload cover image</p>
                  <input
                    ref={coverImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'cover')}
                    className="hidden"
                  />
                <button
                    onClick={() => coverImageRef.current?.click()}
                    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Choose Image
                </button>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PhotoIcon className="w-4 h-4 inline mr-1" />
              Additional Images (max 5)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formData.carouselImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Carousel ${index + 1}`} 
                    className="w-full h-20 object-cover rounded-lg"
                  />
                <button
                    onClick={() => removeCarouselImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                </button>
                </div>
              ))}
              {formData.carouselImages.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-center">
                  <input
                    ref={carouselImagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'carousel')}
                    className="hidden"
                  />
                  <button
                    onClick={() => carouselImagesRef.current?.click()}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <PlusIcon className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Co-hosts - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                Pricing
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-gray-900">
                  <input
                    type="radio"
                    checked={!formData.isPaid}
                    onChange={() => handleInputChange('isPaid', false)}
                    className="mr-2"
                  />
                  Free
                </label>
                <label className="flex items-center text-gray-900">
                  <input
                    type="radio"
                    checked={formData.isPaid}
                    onChange={() => handleInputChange('isPaid', true)}
                    className="mr-2"
                  />
                  Paid
                </label>
              </div>
              {formData.isPaid && (
                <input
            type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Price in USD"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Co-hosts
              </label>
              <input
                type="text"
                value={formData.coHosts}
                onChange={(e) => handleInputChange('coHosts', e.target.value)}
                placeholder="Mention any co-hosts or collaborators"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="Max participants"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Duration
            </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 2 hours"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
          </div>

          </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex space-x-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
          </div>

      {/* Mood Selection Drawer - Mobile Only */}
      {showMoodDrawer && (
        <div className="md:hidden fixed inset-0 bg-black/50 flex items-end justify-center z-[60]">
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] flex flex-col">
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Mood</h3>
                <button
                  onClick={() => setShowMoodDrawer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-5 gap-3">
                {moodOptions.map((mood, index) => (
                    <button
                    key={mood}
                      onClick={() => {
                      handleInputChange('mood', mood);
                      setShowMoodDrawer(false);
                    }}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      formData.mood === mood
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
