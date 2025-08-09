'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
}

// Sample categorized images - in real implementation, these would come from the database
const getCategorizedImages = (images: string[]) => {
  return {
    'Property Photos': images.slice(0, Math.ceil(images.length * 0.7)),
    'Guest Photos': images.slice(Math.ceil(images.length * 0.7)),
    'Rooms': images.slice(0, 5),
    'Property Views': images.slice(5, 10),
    'Facilities': images.slice(10, 15),
    'Dining': images.slice(15, 20),
    'Nearby Attractions': images.slice(20, 25),
  };
};

export function PropertyImageGallery({ images, propertyTitle }: PropertyImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const categorizedImages = getCategorizedImages(images);
  const allImages = images;
  const currentImages = selectedCategory === 'All' ? allImages : categorizedImages[selectedCategory as keyof typeof categorizedImages] || [];

  const handleImageClick = () => {
    setIsModalOpen(true);
    setSelectedCategory('All');
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(-1); // Reset full image view
  };

  // Handle click outside modal to close and keyboard navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          if (currentImageIndex >= 0) {
            event.preventDefault();
            prevImage();
          }
          break;
        case 'ArrowRight':
          if (currentImageIndex >= 0) {
            event.preventDefault();
            nextImage();
          }
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, currentImageIndex]);

  // Ensure we have at least 3 images for the layout
  const displayImages = images.length >= 3 ? images.slice(0, 3) : [
    ...images,
    ...Array(3 - images.length).fill(images[0] || '/placeholder-image.jpg')
  ];

  return (
    <>
      {/* Main Gallery Layout */}
      <div className="grid grid-cols-3 gap-2 h-96 mb-8">
        {/* Large main image (left) */}
        <div className="col-span-2 relative rounded-lg overflow-hidden cursor-pointer group" onClick={handleImageClick}>
          <Image
            src={displayImages[0]}
            alt={`${propertyTitle} - Main view`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
            +{images.length} Property Photos
          </div>
        </div>

        {/* Two smaller stacked images (right) */}
        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex-1 relative rounded-lg overflow-hidden cursor-pointer group" onClick={handleImageClick}>
            <Image
              src={displayImages[1]}
              alt={`${propertyTitle} - Interior view`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex-1 relative rounded-lg overflow-hidden cursor-pointer group" onClick={handleImageClick}>
            <Image
              src={displayImages[2]}
              alt={`${propertyTitle} - Guest view`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
              +{Math.floor(images.length * 0.3)} Guest Photos
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div ref={modalRef} className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white">
              <h2 className="text-xl font-semibold">{propertyTitle} - Photo Gallery</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Category Navigation */}
            <div className="bg-white border-b px-4 py-2">
              <div className="flex gap-6 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    All ({allImages.length})
                  </span>
                </button>
                {Object.entries(categorizedImages).map(([category, categoryImages]) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category} ({categoryImages.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
                {currentImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${propertyTitle} - ${selectedCategory} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Full Image View */}
            {currentImages.length > 0 && currentImageIndex >= 0 && (
              <div className="fixed inset-0 z-60 bg-black bg-opacity-95 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Navigation buttons */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6 text-white" />
                  </button>

                  {/* Close button */}
                  <button
                    onClick={() => setCurrentImageIndex(-1)}
                    className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors z-10"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>

                  {/* Image */}
                  <div className="relative max-w-4xl max-h-full p-4">
                    <Image
                      src={currentImages[currentImageIndex]}
                      alt={`${propertyTitle} - ${selectedCategory} ${currentImageIndex + 1}`}
                      width={800}
                      height={600}
                      className="object-contain max-h-[80vh]"
                    />
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                    {currentImageIndex + 1} of {currentImages.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 