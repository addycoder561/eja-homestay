'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SearchFilters as SearchFiltersType, PropertyType, AMENITIES } from '@/lib/types';
import { GuestSelector } from '@/components/GuestSelector';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
}

const propertyTypes: PropertyType[] = ['Boutique', 'Cottage', 'Homely', 'Off-Beat'];
const amenities = ['Pure-Veg', 'Pet Friendly'];

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleInputChange = (field: keyof SearchFiltersType, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(newAmenities);
  };

  const applyFilters = () => {
    onFilterChange({
      ...localFilters,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined
    });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {};
    setLocalFilters(clearedFilters);
    setSelectedAmenities([]);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="">
      {/* Top: Price Range & Property Type side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Price Range */}
        <Card className="p-0 shadow-none border border-gray-200">
          <CardHeader className="py-2 px-3">
            <h3 className="text-base font-semibold text-gray-900">Price Range</h3>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min"
                type="number"
                min="2500"
                placeholder="2500"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-sm"
              />
              <Input
                label="Max"
                type="number"
                min="2500"
                max="7500"
                placeholder="7500"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
        {/* Property Type */}
        <Card className="p-0 shadow-none border border-gray-200">
          <CardHeader className="py-2 px-3">
            <h3 className="text-base font-semibold text-gray-900">Property Type</h3>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <div className="space-y-1">
              {propertyTypes.map((type) => (
                <label key={type} className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="propertyType"
                    value={type}
                    checked={localFilters.propertyType === type}
                    onChange={(e) => handleInputChange('propertyType', e.target.value as PropertyType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Divider */}
      <div className="border-t border-gray-100 my-2" />
      {/* Bottom: Amenities full width */}
      <Card className="mb-2 bg-blue-50 border-0 shadow-none">
        <CardHeader className="py-2 px-3">
          <h3 className="text-base font-semibold text-gray-900">Special Features</h3>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            {amenities.map((amenity) => (
              <label key={amenity} className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm border border-gray-200 cursor-pointer transition hover:shadow-md text-sm">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 font-semibold text-gray-900">{amenity}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Buttons at bottom */}
      <div className="flex gap-2 mt-2">
        <Button onClick={applyFilters} className="flex-1 py-2 text-sm">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} className="font-bold text-gray-900 py-2 text-sm">
          Clear
        </Button>
      </div>
    </div>
  );
} 