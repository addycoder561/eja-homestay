'use client';

import { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface CreateExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPERIENCE_TYPES = [
  { id: 'online', label: 'Online' },
  { id: 'hyper-local', label: 'Hyper-local' },
  { id: 'far-away', label: 'Retreats' }
];

const CATEGORIES = [
  'Adventure', 'Culinary', 'Cultural', 'Wellness', 'Art & Craft',
  'Photography', 'Music', 'Nature', 'Sports', 'Technology'
];

const DURATION_OPTIONS = [
  { id: 'custom', label: 'Custom' },
  { id: 'half-day', label: 'Half-day' },
  { id: '1-day', label: '1 day' },
  { id: 'multi-days', label: 'Multi-days' }
];

const MOOD_OPTIONS = [
  'Adventurous', 'Relaxing', 'Educational', 'Social', 'Creative',
  'Romantic', 'Family-friendly', 'Challenging', 'Inspirational', 'Fun'
];

export function CreateExperienceModal({ isOpen, onClose }: CreateExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    duration: '',
    mood: '',
    hasPrice: false,
    price: 0,
    location: '',
    maxGuests: 10
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would implement the actual experience creation logic
      console.log('Creating experience:', formData);
      console.log('Images:', selectedImages);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        type: '',
        category: '',
        duration: '',
        mood: '',
        hasPrice: false,
        price: 0,
        location: '',
        maxGuests: 10
      });
      setSelectedImages([]);
      onClose();
    } catch (error) {
      console.error('Error creating experience:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Implement draft saving logic
    console.log('Saving draft:', formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Experience</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Save Draft
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Photo/Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Photos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
              >
                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Add Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Uploaded Images */}
              {selectedImages.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Give your experience a catchy title"
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what makes your experience special"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                  className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                    formData.type === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryDrawer(true)}
              className="w-full p-3 text-left border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              {formData.category || 'Select Category'}
            </button>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((duration) => (
                <button
                  key={duration.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, duration: duration.id }))}
                  className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                    formData.duration === duration.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood }))}
                  className={`p-2 text-sm font-medium rounded-lg border transition-colors ${
                    formData.mood === mood
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Where will this experience take place?"
            required
          />

          {/* Max Guests */}
          <Input
            label="Maximum Guests"
            type="number"
            value={formData.maxGuests}
            onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: parseInt(e.target.value) }))}
            min="1"
            max="50"
          />

          {/* Price Toggle */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.hasPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, hasPrice: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">This experience has a price</span>
            </label>
            
            {formData.hasPrice && (
              <div className="mt-3">
                <Input
                  label="Price (₹)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  min="0"
                  placeholder="Enter price per person"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!formData.title || !formData.description || !formData.type || !formData.category || !formData.duration || !formData.mood || !formData.location}
              className="w-full"
              size="lg"
            >
              Create Experience
            </Button>
          </div>
        </form>

        {/* Category Drawer */}
        {showCategoryDrawer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[50vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Select Category</h3>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category }));
                        setShowCategoryDrawer(false);
                      }}
                      className="p-3 text-sm font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-left"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
