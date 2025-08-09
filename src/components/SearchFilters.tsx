'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchFilters as SearchFiltersType } from '@/lib/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
}

// Filter data based on requirements
const filterData = {
  preference: [
    { id: 'families', label: 'Families only', icon: '👨‍👩‍👧‍👦' },
    { id: 'females', label: 'Females only', icon: '👩' }
  ],
  destination: [
    'Rishikesh', 'Kanatal', 'Dhanaulti', 'Landour', 'Mussoorie', 'Lansdowne', 
    'Nainital', 'Pangot', 'Mukhteshwar', 'Kasauli', 'Shimla', 'Bir Billing', 
    'Khajjiar', 'Dalhousie', 'Mcleod Ganj', 'Manali', 'Kashmir', 'Ladakh', 
    'Sikkim', 'Asaam', 'Meghalaya', 'Nagaland', 'Arunachal'
  ],
  propertyType: [
    { id: 'homely', label: 'Homely', icon: '🏠' },
    { id: 'boutique', label: 'Boutique', icon: '🏨' },
    { id: 'unique', label: 'Unique', icon: '✨' },
    { id: 'cottage', label: 'Cottage', icon: '🏡' }
  ],
  price: [
    { id: 'under2500', label: 'Under ₹2,500', icon: '💰' },
    { id: 'under4500', label: 'Under ₹4,500', icon: '💰' },
    { id: 'under7000', label: 'Under ₹7,000', icon: '💰' },
    { id: 'under9000', label: 'Under ₹9,000', icon: '💰' }
  ],
  amenities: [
    { id: 'pet-friendly', label: 'Pet-Friendly', icon: '🐕' },
    { id: 'pure-veg', label: 'Pure-Veg', icon: '🥗' }
  ]
};

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    preference: [],
    destination: [],
    propertyType: [],
    price: [],
    amenities: []
  });
  
  const [showAllFilters, setShowAllFilters] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleFilterToggle = (category: string, filterId: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(filterId)
        ? current.filter(id => id !== filterId)
        : [...current, filterId];
      
      return {
        ...prev,
        [category]: updated
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      preference: [],
      destination: [],
      propertyType: [],
      price: [],
      amenities: []
    });
  };

  const applyFilters = () => {
    // Convert selected filters to the format expected by the parent component
    const newFilters: SearchFiltersType = {};
    
    if (selectedFilters.preference.length > 0) {
      newFilters.preference = selectedFilters.preference;
    }
    if (selectedFilters.destination.length > 0) {
      newFilters.location = selectedFilters.destination[0]; // Take first selected destination
    }
    if (selectedFilters.propertyType.length > 0) {
      const propertyType = selectedFilters.propertyType[0];
      // Map our custom types to the PropertyType enum
      if (propertyType === 'homely') newFilters.propertyType = 'Homely';
      else if (propertyType === 'boutique') newFilters.propertyType = 'Boutique';
      else if (propertyType === 'cottage') newFilters.propertyType = 'Cottage';
      else if (propertyType === 'unique') newFilters.propertyType = 'Off-Beat'; // Map unique to Off-Beat
    }
    if (selectedFilters.price.length > 0) {
      // Handle multiple price selections - use the highest selected price
      const maxPrice = Math.max(...selectedFilters.price.map(price => {
        switch (price) {
          case 'under2500': return 2500;
          case 'under4500': return 4500;
          case 'under7000': return 7000;
          case 'under9000': return 9000;
          default: return 0;
        }
      }));
      newFilters.maxPrice = maxPrice;
    }
    if (selectedFilters.amenities.length > 0) {
      newFilters.amenities = selectedFilters.amenities;
    }
    
    // Apply filters immediately when they change
    onFilterChange(newFilters);
  };

  // Auto-apply filters when selections change
  useEffect(() => {
    applyFilters();
  }, [selectedFilters]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const modal = target.closest('[data-filter-modal]');
      const modalBackdrop = target.closest('[data-modal-backdrop]');
      const allFiltersButton = target.closest('[data-all-filters-button]');
      
      if (showAllFilters && modalBackdrop && !modal && !allFiltersButton) {
        setShowAllFilters(false);
      }
    };

    if (showAllFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showAllFilters]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAllFilters) {
        setShowAllFilters(false);
      }
    };

    if (showAllFilters) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAllFilters]);

  const FilterChip = ({ 
    icon, 
    label, 
    isSelected, 
    onClick 
  }: { 
    icon: string; 
    label: string; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap text-sm font-medium ${
        isSelected
          ? 'bg-gray-900 border-gray-900 text-white'
          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <div className="w-full bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm" style={{ position: 'sticky', top: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Horizontal Scrollable Filter Bar */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide" ref={scrollContainerRef}>
            {/* All Filters Button */}
            <button
              data-all-filters-button
              onClick={() => setShowAllFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-blue-600 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0 text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              All filters
            </button>

            {/* Preference Filters */}
            {filterData.preference.map((pref) => (
              <FilterChip
                key={pref.id}
                icon={pref.icon}
                label={pref.label}
                isSelected={selectedFilters.preference.includes(pref.id)}
                onClick={() => handleFilterToggle('preference', pref.id)}
              />
            ))}

            {/* Amenities Filters */}
            {filterData.amenities.map((amenity) => (
              <FilterChip
                key={amenity.id}
                icon={amenity.icon}
                label={amenity.label}
                isSelected={selectedFilters.amenities.includes(amenity.id)}
                onClick={() => handleFilterToggle('amenities', amenity.id)}
              />
            ))}

            {/* Special Offers */}
            <FilterChip
              icon="🏷️"
              label="Special offers"
              isSelected={false}
              onClick={() => {}} // TODO: Implement special offers filter
            />

            {/* Scroll Indicator */}
            <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showAllFilters && (
        <div 
          data-modal-backdrop
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Modal Content */}
          <div 
            data-filter-modal
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => setShowAllFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              <div className="w-6"></div> {/* Spacer for centering */}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Price */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price</h3>
                  <div className="space-y-3">
                    {filterData.price.map((price) => (
                      <label key={price.id} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFilters.price.includes(price.id)}
                          onChange={() => handleFilterToggle('price', price.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="ml-3 text-sm text-gray-700 select-none group-hover:text-gray-900">{price.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinations</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {filterData.destination.map((dest) => (
                      <label key={dest} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFilters.destination.includes(dest)}
                          onChange={() => handleFilterToggle('destination', dest)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="ml-3 text-sm text-gray-700 select-none group-hover:text-gray-900">{dest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type</h3>
                  <div className="space-y-3">
                    {filterData.propertyType.map((type) => (
                      <label key={type.id} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFilters.propertyType.includes(type.id)}
                          onChange={() => handleFilterToggle('propertyType', type.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="ml-3 text-sm text-gray-700 select-none group-hover:text-gray-900">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  clearAllFilters();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Reset all
              </button>
              <button
                onClick={() => {
                  setShowAllFilters(false);
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 