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
    
    onFilterChange(newFilters);
  };

  // Auto-apply filters when selections change
  useEffect(() => {
    applyFilters();
  }, [selectedFilters]);

  // Close "All filters" panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const allFiltersPanel = target.closest('[data-all-filters-panel]');
      const allFiltersButton = target.closest('[data-all-filters-button]');
      
      if (showAllFilters && !allFiltersPanel && !allFiltersButton) {
        setShowAllFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 whitespace-nowrap ${
        isSelected
          ? 'bg-blue-50 border-blue-200 text-blue-700'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Horizontal Scrollable Filter Bar */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* All Filters Button */}
          <button
            data-all-filters-button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0"
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
          <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showAllFilters && (
          <div data-all-filters-panel className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price</h3>
                <div className="space-y-2">
                  {filterData.price.map((price) => (
                    <label key={price.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.price.includes(price.id)}
                        onChange={() => handleFilterToggle('price', price.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="ml-2 text-sm text-gray-700 select-none">{price.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Destination</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filterData.destination.map((dest) => (
                    <label key={dest} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.destination.includes(dest)}
                        onChange={() => handleFilterToggle('destination', dest)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="ml-2 text-xs text-gray-700 select-none">{dest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h3>
                <div className="space-y-2">
                  {filterData.propertyType.map((type) => (
                    <label key={type.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.propertyType.includes(type.id)}
                        onChange={() => handleFilterToggle('propertyType', type.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="ml-2 text-sm text-gray-700 select-none">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear all
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllFilters(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 