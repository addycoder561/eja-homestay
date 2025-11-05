'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateDareModal } from './CreateDareModal';
import { ComingSoonModal } from './ComingSoonModal';
import { 
  XMarkIcon, 
  ChevronRightIcon,
  PhotoIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  PlusIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  PhotoIcon as PhotoIconSolid,
  UserIcon as UserIconSolid,
  MapPinIcon as MapPinIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClockIcon as ClockIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  SparklesIcon as SparklesIconSolid,
  PlusIcon as PlusIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';

interface CreateExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  isCover: boolean;
  overlayText?: string;
}

interface ExperienceFormData {
  title: string;
  description: string;
  vibe: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  isPaid: boolean;
  price: string;
  collaborators: string[];
}

const VIBES = [
  'Adventure', 'Relaxing', 'Cultural', 'Food & Drink', 'Nature', 
  'Art & Design', 'Music', 'Sports', 'Wellness', 'Social'
];

// Dropdown component for Create button
export function CreateDropdown({ isOpen, onClose, buttonRef }: { 
  isOpen: boolean; 
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'experience' | 'dare' | null>(null);
  const [showDareModal, setShowDareModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleOptionSelect = (option: 'experience' | 'dare') => {
    setSelectedOption(option);
    // Show Coming Soon modal instead of actual forms
    setShowComingSoonModal(true);
    // Keep the original modals commented out for future use:
    // if (option === 'experience') {
    //   setShowModal(true);
    // } else if (option === 'dare') {
    //   setShowDareModal(true);
    // }
  };

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 192px
      const dropdownHeight = 80; // Approximate height of dropdown
      const buttonCenter = rect.left + (rect.width / 2);
      const dropdownLeft = buttonCenter - (dropdownWidth / 2);
      
      // Check if we're on mobile (screen width < 768px) or if button is in bottom half of screen
      const isMobile = window.innerWidth < 768;
      const isBottomHalf = rect.top > window.innerHeight / 2;
      
      let topPosition;
      if (isMobile || isBottomHalf) {
        // Show above button on mobile or when button is in bottom half
        topPosition = rect.top - dropdownHeight - 8;
      } else {
        // Show below button on desktop when button is in top half
        topPosition = rect.bottom + 8;
      }
      
      setPosition({
        top: Math.max(8, topPosition), // Ensure it doesn't go above viewport
        left: Math.max(8, Math.min(dropdownLeft, window.innerWidth - dropdownWidth - 8)) // Keep within viewport
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-25 z-50" onClick={onClose} />
      <div 
        className="fixed z-50"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <div className="w-48 transform overflow-hidden rounded-lg bg-white shadow-xl border border-gray-200 transition-all">
          <div className="p-1">
            <button
              onClick={() => handleOptionSelect('experience')}
              className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-yellow-50 rounded transition-colors"
            >
              <SparklesIcon className="w-4 h-4 inline mr-2" />
              Create an Experience
            </button>
            <button
              onClick={() => handleOptionSelect('dare')}
              className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-yellow-50 rounded transition-colors"
            >
              <FireIcon className="w-4 h-4 inline mr-2" />
              Drop a Dare
            </button>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal - Shows for both options */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => {
          setShowComingSoonModal(false);
          setSelectedOption(null);
          onClose();
        }}
      />

      {/* Original modals kept but not shown - for future use */}
      {false && showModal && (
        <CreateExperienceModal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false);
            setSelectedOption(null);
            onClose();
          }} 
        />
      )}

      {false && showDareModal && (
        <CreateDareModal 
          isOpen={showDareModal} 
          onClose={() => {
            setShowDareModal(false);
            setSelectedOption(null);
            onClose();
          }} 
        />
      )}
    </>
  );
}

export default function CreateExperienceModal({ isOpen, onClose }: CreateExperienceModalProps) {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'experience' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [textColor, setTextColor] = useState<string>('white');
  const [formData, setFormData] = useState<ExperienceFormData>({
    title: '',
    description: '',
    vibe: '',
    location: '',
    date: '',
    time: '',
    duration: '',
    isPaid: false,
    price: '',
    collaborators: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages: UploadedImage[] = files.slice(0, 10 - uploadedImages.length).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isCover: uploadedImages.length === 0 && index === 0
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
    // Reset to first image when new images are added
    if (uploadedImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const setCoverImage = (imageId: string) => {
    setUploadedImages(prev => 
      prev.map(img => ({ ...img, isCover: img.id === imageId }))
    );
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      // If we removed the cover image, set the first remaining as cover
      if (filtered.length > 0 && !filtered.some(img => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
    
    // Adjust current image index if needed
    setCurrentImageIndex(prev => {
      const newLength = uploadedImages.length - 1;
      if (newLength === 0) return 0;
      return prev >= newLength ? newLength - 1 : prev;
    });
  };

  const updateOverlayText = (imageId: string, text: string) => {
    setUploadedImages(prev => 
      prev.map(img => img.id === imageId ? { ...img, overlayText: text } : img)
    );
  };

  const clearCurrentText = () => {
    if (uploadedImages[currentImageIndex]) {
      updateOverlayText(uploadedImages[currentImageIndex].id, '');
    }
  };

  const applyToAllImages = () => {
    const currentText = uploadedImages[currentImageIndex]?.overlayText || '';
    setUploadedImages(prev => 
      prev.map(img => ({ ...img, overlayText: currentText }))
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', { uploadedImages, formData });
    // TODO: Implement save draft functionality
    onClose();
  };

  const handlePublish = () => {
    console.log('Publishing experience:', { uploadedImages, formData });
    // TODO: Implement publish functionality
    onClose();
  };

  if (!isOpen) return null;

  // Show dropdown first
  if (showDropdown) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setSelectedOption('experience');
                setShowDropdown(false);
                setCurrentStep(1);
              }}
              className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Create an experience</h3>
                <p className="text-sm text-gray-600">Share your knowledge and skills</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full flex flex-col ${
        currentStep === 3 ? 'max-w-2xl max-h-[80vh]' : 'max-w-md max-h-[70vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Back button - show when images are uploaded or on step > 1 */}
            {(uploadedImages.length > 0 || currentStep > 1) && (
              <button
                onClick={() => {
                  if (currentStep === 1 && uploadedImages.length > 0) {
                    // Go back to upload area
                    setUploadedImages([]);
                    setCurrentImageIndex(0);
                  } else {
                    handleBack();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600 rotate-180" />
              </button>
            )}
            <h2 className="text-sm font-medium text-gray-900">
              {currentStep === 1 ? 'Create Experience' : 
               currentStep === 2 ? 'Add Text Overlays' : 'Experience Details'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Next button - show when images are uploaded or on step > 1 */}
            {(uploadedImages.length > 0 || currentStep > 1) && (
              <button
                onClick={handleNext}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentStep === 1 && (
            <div className="h-full flex flex-col items-center justify-center p-6">
              {/* Upload Area - Only show if no images uploaded */}
              {uploadedImages.length === 0 && (
                <div className="w-full">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Media
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload up to 10 photos or videos
                    </p>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                      Select from device
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Uploaded Images Carousel */}
              {uploadedImages.length > 0 && (
                <div className="w-full max-w-md">
                  <div className="relative">
                    {/* Main Image Display */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                      <img
                        src={uploadedImages[currentImageIndex]?.url}
                        alt={`Upload ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Cover Badge */}
                      {uploadedImages[currentImageIndex]?.isCover && (
                        <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Cover
                        </div>
                      )}
                      
                      {/* Navigation Arrows */}
                      {uploadedImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : uploadedImages.length - 1)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                          >
                            <ChevronRightIcon className="w-4 h-4 rotate-180" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => prev < uploadedImages.length - 1 ? prev + 1 : 0)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} of {uploadedImages.length}
                      </div>
                    </div>
                    
                    {/* Thumbnail Strip */}
                    {uploadedImages.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {uploadedImages.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex 
                                ? 'border-blue-500' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Image Actions */}
                    <div className="flex justify-center gap-3 mt-4">
                      <button
                        onClick={() => setCoverImage(uploadedImages[currentImageIndex]?.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Set as Cover
                      </button>
                      <button
                        onClick={() => removeImage(uploadedImages[currentImageIndex]?.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="h-full p-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Image Carousel */}
                <div className="space-y-3">
                  
                  {/* Main Image Display */}
                  <div className="relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                      <img
                        src={uploadedImages[currentImageIndex]?.url}
                        alt={`Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {uploadedImages[currentImageIndex]?.overlayText && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className={`px-4 py-2 rounded-lg font-medium ${
                              textSize === 'small' ? 'text-xs' : 
                              textSize === 'medium' ? 'text-sm' : 'text-lg'
                            } ${
                              textColor === 'white' ? 'bg-black bg-opacity-70 text-white' :
                              textColor === 'black' ? 'bg-white bg-opacity-90 text-black' :
                              textColor === 'red' ? 'bg-red-500 bg-opacity-80 text-white' :
                              textColor === 'blue' ? 'bg-blue-500 bg-opacity-80 text-white' :
                              textColor === 'yellow' ? 'bg-yellow-500 bg-opacity-80 text-black' :
                              'bg-black bg-opacity-70 text-white'
                            }`}
                          >
                            {uploadedImages[currentImageIndex]?.overlayText}
                          </div>
                        </div>
                      )}
                      
                      {/* Navigation Arrows */}
                      {uploadedImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : uploadedImages.length - 1)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                          >
                            <ChevronRightIcon className="w-4 h-4 rotate-180" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => prev < uploadedImages.length - 1 ? prev + 1 : 0)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} of {uploadedImages.length}
                      </div>
                    </div>
                    
                    {/* Thumbnail Strip */}
                    {uploadedImages.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {uploadedImages.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex 
                                ? 'border-blue-500' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                </div>

                {/* Text Editing Interface */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add Text Overlay</h4>
                  
                  {/* Text Input */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Type your text here..."
                      value={uploadedImages[currentImageIndex]?.overlayText || ''}
                      onChange={(e) => updateOverlayText(uploadedImages[currentImageIndex]?.id || '', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    
                    {/* Text Style Options */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700">Size:</label>
                        <select 
                          value={textSize}
                          onChange={(e) => setTextSize(e.target.value as 'small' | 'medium' | 'large')}
                          className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700">Color:</label>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setTextColor('white')}
                            className={`w-6 h-6 bg-white border-2 rounded-full hover:scale-110 transition-transform ${
                              textColor === 'white' ? 'border-blue-500' : 'border-gray-300'
                            }`}
                          ></button>
                          <button 
                            onClick={() => setTextColor('black')}
                            className={`w-6 h-6 bg-black rounded-full hover:scale-110 transition-transform ${
                              textColor === 'black' ? 'ring-2 ring-blue-500' : ''
                            }`}
                          ></button>
                          <button 
                            onClick={() => setTextColor('red')}
                            className={`w-6 h-6 bg-red-500 rounded-full hover:scale-110 transition-transform ${
                              textColor === 'red' ? 'ring-2 ring-blue-500' : ''
                            }`}
                          ></button>
                          <button 
                            onClick={() => setTextColor('blue')}
                            className={`w-6 h-6 bg-blue-500 rounded-full hover:scale-110 transition-transform ${
                              textColor === 'blue' ? 'ring-2 ring-blue-500' : ''
                            }`}
                          ></button>
                          <button 
                            onClick={() => setTextColor('yellow')}
                            className={`w-6 h-6 bg-yellow-500 rounded-full hover:scale-110 transition-transform ${
                              textColor === 'yellow' ? 'ring-2 ring-blue-500' : ''
                            }`}
                          ></button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={clearCurrentText}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={applyToAllImages}
                        className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Apply All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="h-full flex">
              {/* Image Gallery */}
              <div className="w-1/2 p-6 border-r border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Experience</h3>
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={image.id} className="relative">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={image.url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {image.isCover && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Cover
                          </div>
                        )}
                        {image.overlayText && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                              {image.overlayText}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
        </div>

        {/* Form */}
              <div className="w-1/2 p-8 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-8">
                  {/* Creator Profile */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      <UserIcon className="w-7 h-7 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Your Name</h4>
                      <p className="text-sm text-gray-600">Creator</p>
                    </div>
                  </div>

                  {/* Experience Title */}
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Experience Title *
            </label>
              <input
              type="text"
              value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What's your experience about?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Description
            </label>
            <textarea
              value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell people about your experience..."
              rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

                  {/* Vibe Selector */}
                  <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vibe *
            </label>
                    <div className="grid grid-cols-2 gap-2">
                      {VIBES.map((vibe) => (
                        <button
                          key={vibe}
                          onClick={() => setFormData(prev => ({ ...prev, vibe }))}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.vibe === vibe
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {vibe}
                </button>
              ))}
                    </div>
                  </div>

                  {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Where is this happening?"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                      </div>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
            </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  value={formData.time}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                      </div>
            </div>
          </div>

                  {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
            </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select duration</option>
                      <option value="30min">30 minutes</option>
                      <option value="1hour">1 hour</option>
                      <option value="2hours">2 hours</option>
                      <option value="3hours">3 hours</option>
                      <option value="half-day">Half day (4 hours)</option>
                      <option value="full-day">Full day (8 hours)</option>
                    </select>
          </div>

                  {/* Free or Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing *
            </label>
                    <div className="flex gap-4">
                <button
                        onClick={() => setFormData(prev => ({ ...prev, isPaid: false, price: '' }))}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                          !formData.isPaid
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <SparklesIcon className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Free</div>
                        <div className="text-sm">No cost to participants</div>
                </button>
                  <button
                        onClick={() => setFormData(prev => ({ ...prev, isPaid: true }))}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.isPaid
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CurrencyDollarIcon className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Paid</div>
                        <div className="text-sm">Set your price</div>
                  </button>
            </div>
          </div>

                  {/* Price Input */}
                  {formData.isPaid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per person *
              </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
            type="number"
                  value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
                  )}

                  {/* Collaborators */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Collaborators
              </label>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                        placeholder="Search for collaborators..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Invite other creators to collaborate on this experience
                    </p>
              </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep === 3 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Publish Experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
}