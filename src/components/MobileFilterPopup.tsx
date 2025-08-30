'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  FunnelIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface MobileFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilterChips: string[];
  onFilterChipClick: (chip: string) => void;
  advancedFilters: {
    minPrice: number;
    maxPrice: number;
    propertyType: string;
    amenities: string[];
  };
  onAdvancedFilterChange: (filters: any) => void;
}

const PROPERTY_TYPES = ['Boutique', 'Homely', 'Off-Beat'];
const AMENITIES = ['WiFi', 'AC', 'Kitchen', 'Parking', 'Pool', 'Garden', 'Pet Friendly'];

export function MobileFilterPopup({ 
  isOpen, 
  onClose, 
  selectedFilterChips, 
  onFilterChipClick,
  advancedFilters,
  onAdvancedFilterChange
}: MobileFilterPopupProps) {
  const [activeSection, setActiveSection] = useState<'filters' | 'price' | 'type' | 'amenities'>('filters');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
             <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Filters</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSection('filters')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'filters' 
                ? 'border-yellow-400 text-yellow-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Quick Filters
          </button>
          <button
            onClick={() => setActiveSection('price')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'price' 
                ? 'border-yellow-400 text-yellow-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Price
          </button>
          <button
            onClick={() => setActiveSection('type')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'type' 
                ? 'border-yellow-400 text-yellow-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Type
          </button>
          <button
            onClick={() => setActiveSection('amenities')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'amenities' 
                ? 'border-yellow-400 text-yellow-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Amenities
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'filters' && (
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900">Property Types</h4>
              <div className="space-y-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => onFilterChipClick(type)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedFilterChips.includes(type)
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedFilterChips.includes(type) && (
                      <CheckIcon className="w-5 h-5 text-yellow-600" />
                    )}
                  </button>
                ))}
              </div>

              <h4 className="font-semibold text-gray-900 mt-6">Special Features</h4>
              <div className="space-y-2">
                {['Families-only', 'Females-only', 'Pet Friendly', 'Pure-Veg'].map((feature) => (
                  <button
                    key={feature}
                    onClick={() => onFilterChipClick(feature)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedFilterChips.includes(feature)
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{feature}</span>
                    {selectedFilterChips.includes(feature) && (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'price' && (
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900">Price Range</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Price</label>
                  <input
                    type="number"
                    value={advancedFilters.minPrice}
                    onChange={(e) => onAdvancedFilterChange({ ...advancedFilters, minPrice: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price</label>
                  <input
                    type="number"
                    value={advancedFilters.maxPrice}
                    onChange={(e) => onAdvancedFilterChange({ ...advancedFilters, maxPrice: parseInt(e.target.value) || 10000 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'type' && (
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900">Property Type</h4>
              <div className="space-y-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => onAdvancedFilterChange({ ...advancedFilters, propertyType: advancedFilters.propertyType === type ? '' : type })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      advancedFilters.propertyType === type
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type}</span>
                    {advancedFilters.propertyType === type && (
                      <CheckIcon className="w-5 h-5 text-yellow-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'amenities' && (
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900">Amenities</h4>
              <div className="space-y-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => {
                      const newAmenities = advancedFilters.amenities.includes(amenity)
                        ? advancedFilters.amenities.filter(a => a !== amenity)
                        : [...advancedFilters.amenities, amenity];
                      onAdvancedFilterChange({ ...advancedFilters, amenities: newAmenities });
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      advancedFilters.amenities.includes(amenity)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{amenity}</span>
                    {advancedFilters.amenities.includes(amenity) && (
                      <CheckIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
