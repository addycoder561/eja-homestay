import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PropertyType } from '@/lib/types';

const PROPERTY_TYPES: PropertyType[] = ['Boutique', 'Cottage', 'Homely', 'Off-Beat'];
const AMENITIES = [
  { label: 'Pet-friendly', value: 'Pet Friendly' },
  { label: 'Pure-Veg', value: 'Pure-Veg' },
];

export interface FilterBarProps {
  filters: {
    propertyType?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
  };
  onChange: (filters: FilterBarProps['filters']) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState(filters);

  // Dropdown toggling
  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Property Type
  const handlePropertyType = (type: PropertyType) => {
    setLocalFilters((f) => ({ ...f, propertyType: type }));
    onChange({ ...localFilters, propertyType: type });
    setOpenDropdown(null);
  };

  // Price
  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: number) => {
    setLocalFilters((f) => ({ ...f, [field]: value }));
  };
  const applyPrice = () => {
    onChange({ ...localFilters });
    setOpenDropdown(null);
  };

  // Amenities (Preferences)
  const handleAmenityToggle = (amenity: string) => {
    const amenities = localFilters.amenities || [];
    const newAmenities = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    setLocalFilters((f) => ({ ...f, amenities: newAmenities }));
  };
  const applyAmenities = () => {
    onChange({ ...localFilters });
    setOpenDropdown(null);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center w-full py-2">
      {/* Property Type Dropdown */}
      <div className="relative">
        <button
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50 min-w-[140px]"
          onClick={() => toggleDropdown('propertyType')}
        >
          {localFilters.propertyType ? localFilters.propertyType : 'Property Type'}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {openDropdown === 'propertyType' && (
          <div className="absolute left-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px]">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${localFilters.propertyType === type ? 'font-bold text-blue-600' : ''}`}
                onClick={() => handlePropertyType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter Dropdown */}
      <div className="relative">
        <button
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50 min-w-[140px]"
          onClick={() => toggleDropdown('price')}
        >
          Price
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {openDropdown === 'price' && (
          <div className="absolute left-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] p-4">
            <div className="mb-2 text-xs text-gray-700">Price per night (₹)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={2500}
                max={7500}
                step={100}
                value={localFilters.minPrice || 2500}
                onChange={(e) => handlePriceChange('minPrice', Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs">Min: ₹{localFilters.minPrice || 2500}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min={2500}
                max={7500}
                step={100}
                value={localFilters.maxPrice || 7500}
                onChange={(e) => handlePriceChange('maxPrice', Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs">Max: ₹{localFilters.maxPrice || 7500}</span>
            </div>
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={applyPrice} className="text-xs px-3 py-1">Apply</Button>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Dropdown */}
      <div className="relative">
        <button
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50 min-w-[140px]"
          onClick={() => toggleDropdown('preferences')}
        >
          Preferences
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {openDropdown === 'preferences' && (
          <div className="absolute left-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] p-4">
            {AMENITIES.map((amenity) => (
              <label key={amenity.value} className="flex items-center gap-2 py-1 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={localFilters.amenities?.includes(amenity.value) || false}
                  onChange={() => handleAmenityToggle(amenity.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                {amenity.label}
              </label>
            ))}
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={applyAmenities} className="text-xs px-3 py-1">Apply</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 