'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Enhanced destination data with categories and custom icons
const DESTINATIONS = [
  // Mountain & Adventure Destinations
  { name: 'Rishikesh', state: 'Uttarakhand', country: 'India', category: 'Adventure', icon: '🏔️' },
  { name: 'Manali', state: 'Himachal Pradesh', country: 'India', category: 'Mountains', icon: '🏔️' },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'India', category: 'Mountains', icon: '🏔️' },
  { name: 'Mussoorie', state: 'Uttarakhand', country: 'India', category: 'Mountains', icon: '🏔️' },
  { name: 'Nainital', state: 'Uttarakhand', country: 'India', category: 'Lakes', icon: '🏞️' },
  { name: 'Kashmir', state: 'Jammu & Kashmir', country: 'India', category: 'Valleys', icon: '🏔️' },
  { name: 'Ladakh', state: 'Ladakh', country: 'India', category: 'Highlands', icon: '🏔️' },
  
  // Hill Stations & Retreats
  { name: 'Kanatal', state: 'Uttarakhand', country: 'India', category: 'Hill Station', icon: '🌲' },
  { name: 'Dhanaulti', state: 'Uttarakhand', country: 'India', category: 'Hill Station', icon: '🌲' },
  { name: 'Landour', state: 'Uttarakhand', country: 'India', category: 'Hill Station', icon: '🌲' },
  { name: 'Lansdowne', state: 'Uttarakhand', country: 'India', category: 'Hill Station', icon: '🌲' },
  { name: 'Kasauli', state: 'Himachal Pradesh', country: 'India', category: 'Hill Station', icon: '🌲' },
  { name: 'Dalhousie', state: 'Himachal Pradesh', country: 'India', category: 'Hill Station', icon: '🌲' },
  { name: 'Mcleod Ganj', state: 'Himachal Pradesh', country: 'India', category: 'Spiritual', icon: '🕉️' },
  
  // Adventure & Sports
  { name: 'Bir Billing', state: 'Himachal Pradesh', country: 'India', category: 'Adventure', icon: '🪂' },
  { name: 'Khajjiar', state: 'Himachal Pradesh', country: 'India', category: 'Adventure', icon: '🏞️' },
  
  // Lakes & Nature
  { name: 'Pangot', state: 'Uttarakhand', country: 'India', category: 'Nature', icon: '🦅' },
  { name: 'Mukhteshwar', state: 'Uttarakhand', country: 'India', category: 'Nature', icon: '🌿' },
  
  // Northeast Destinations
  { name: 'Sikkim', state: 'Sikkim', country: 'India', category: 'Northeast', icon: '🏔️' },
  { name: 'Assam', state: 'Assam', country: 'India', category: 'Northeast', icon: '🌿' },
  { name: 'Meghalaya', state: 'Meghalaya', country: 'India', category: 'Northeast', icon: '🌧️' },
  { name: 'Nagaland', state: 'Nagaland', country: 'India', category: 'Northeast', icon: '🏹' },
  { name: 'Arunachal Pradesh', state: 'Arunachal Pradesh', country: 'India', category: 'Northeast', icon: '🏔️' }
];

// Trending destinations for quick access
const TRENDING_DESTINATIONS = [
  { name: 'Rishikesh', state: 'Uttarakhand', country: 'India', category: 'Trending', icon: '🔥' },
  { name: 'Manali', state: 'Himachal Pradesh', country: 'India', category: 'Trending', icon: '🔥' },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'India', category: 'Trending', icon: '🔥' },
  { name: 'Nainital', state: 'Uttarakhand', country: 'India', category: 'Trending', icon: '🔥' },
  { name: 'Mussoorie', state: 'Uttarakhand', country: 'India', category: 'Trending', icon: '🔥' },
  { name: 'Kashmir', state: 'Jammu & Kashmir', country: 'India', category: 'Trending', icon: '🔥' }
];



interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DestinationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Destination",
  className = ""
}: DestinationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<typeof DESTINATIONS>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter destinations based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredDestinations([]); // Don't show any destinations when empty, we'll show trending instead
      return;
    }

    const filtered = DESTINATIONS.filter(destination => 
      destination.name.toLowerCase().includes(value.toLowerCase()) ||
      destination.state.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredDestinations(filtered.slice(0, 8)); // Limit to 8 results
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setHighlightedIndex(-1); // Don't highlight anything initially
      }
      return;
    }

    // When input is empty, we show trending/categories, so disable keyboard navigation
    if (!value.trim()) {
      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
      return;
    }

    // Only enable keyboard navigation when showing filtered results
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredDestinations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDestinations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDestinations[highlightedIndex]) {
          const selected = filteredDestinations[highlightedIndex];
          onChange(selected.name);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && inputRef.current && dropdownRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        dropdownRef.current.style.top = `${rect.bottom + 4}px`;
        dropdownRef.current.style.left = `${rect.left}px`;
        dropdownRef.current.style.width = `${rect.width}px`;
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // If input becomes empty, clear filtered destinations to show trending
    if (!newValue.trim()) {
      setFilteredDestinations([]);
    }
  };

  const handleDestinationClick = (destination: typeof DESTINATIONS[0]) => {
    onChange(destination.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // If input is empty, show trending destinations
    if (!value.trim()) {
      setFilteredDestinations([]);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id="destination"
          name="destination"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`pl-3 ${className}`}
        />
      </div>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
          style={{
            top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 4 : 0,
            left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
            width: inputRef.current ? inputRef.current.offsetWidth : 'auto',
            minWidth: '320px'
          }}
        >
          {!value.trim() ? (
            // Show trending destinations when input is empty
            <div className="p-4">
              {/* Trending Destinations */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🔥</span>
                  Trending destinations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {TRENDING_DESTINATIONS.map((destination) => (
                    <div
                      key={`trending-${destination.name}`}
                      className="flex items-start p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleDestinationClick(destination)}
                    >
                      <span className="text-lg mr-2 mt-0.5">{destination.icon}</span>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-medium text-gray-900 text-sm truncate">{destination.name}</div>
                        <div className="text-xs text-gray-500 truncate">{destination.state}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Show filtered destinations when user is typing
            <div>
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination, index) => (
                  <div
                    key={`${destination.name}-${destination.state}`}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      index === highlightedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleDestinationClick(destination)}
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-3 mt-0.5">{destination.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{destination.name}</div>
                        <div className="text-sm text-gray-500">{destination.state}, {destination.country}</div>
                        <div className="text-xs text-blue-600 font-medium">{destination.category}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No destinations found for "{value}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 