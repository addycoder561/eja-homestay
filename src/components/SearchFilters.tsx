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
const amenities = [...AMENITIES];

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleInputChange = (field: keyof SearchFiltersType, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleGuestChange = (val: { rooms: number; adults: number }) => {
    setLocalFilters({ ...localFilters, rooms: val.rooms, adults: val.adults });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900">Search Filters</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <Input
            label="Location"
            placeholder="Where are you going?"
            value={localFilters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Check-in"
              type="date"
              value={localFilters.checkIn || ''}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
            />
            <Input
              label="Check-out"
              type="date"
              value={localFilters.checkOut || ''}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
            />
          </div>

          {/* Guest Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Guests</label>
            <GuestSelector
              value={{ rooms: localFilters.rooms || 1, adults: localFilters.adults || 1 }}
              onChange={handleGuestChange}
            />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Min price"
              type="number"
              min="2500"
              placeholder="2500"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Max price"
              type="number"
              min="2500"
              max="7500"
              placeholder="7500"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Property Type
            </label>
            <div className="space-y-2">
              {propertyTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value={type}
                    checked={localFilters.propertyType === type}
                    onChange={(e) => handleInputChange('propertyType', e.target.value as PropertyType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters} className="font-bold text-gray-900">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900">Amenities</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {amenities.map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-bold text-gray-900">{amenity}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 