'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { DatePicker } from './DatePicker';

interface MobileSearchFormProps {
  searchData: {
    location: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  };
  setSearchData: (data: any) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export function MobileSearchForm({ searchData, setSearchData, handleSearch }: MobileSearchFormProps) {
  const [activePopup, setActivePopup] = useState<'destination' | 'dates' | 'guests' | null>(null);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setGuestsOpen(false);
      }
    };

    if (guestsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [guestsOpen]);

  const openPopup = (popup: 'destination' | 'dates' | 'guests') => {
    setActivePopup(popup);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const handleGuestChange = (type: 'adults' | 'children', operation: 'add' | 'subtract') => {
    const newValue = operation === 'add' 
      ? searchData[type] + 1 
      : Math.max(0, searchData[type] - 1);
    
    setSearchData({ ...searchData, [type]: newValue });
  };

  return (
    <>
      {/* Mobile Search Form */}
             <div className="lg:hidden">
         <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-w-md mx-auto">
                     {/* Destination Row */}
           <div 
             className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
             onClick={() => openPopup('destination')}
           >
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Destination</div>
                <div className="text-gray-900 font-medium">
                  {searchData.location || 'Where are you going?'}
                </div>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>

                     {/* Check-in/Check-out Row */}
           <div 
             className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
             onClick={() => openPopup('dates')}
           >
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Check-in • Check-out</div>
                <div className="text-gray-900 font-medium">
                  {searchData.checkIn && searchData.checkOut 
                    ? `${searchData.checkIn} • ${searchData.checkOut}`
                    : 'Select dates'
                  }
                </div>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>

                     {/* Guests Row */}
           <div 
             className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
             onClick={() => openPopup('guests')}
           >
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Guests</div>
                <div className="text-gray-900 font-medium">
                  {searchData.adults + searchData.children} Guest{(searchData.adults + searchData.children) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>

                     {/* Search Button */}
           <button 
             type="submit"
             className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
           >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Search
          </button>
        </form>
      </div>

      {/* Destination Popup */}
      {activePopup === 'destination' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Where are you going?</h3>
                <button onClick={closePopup} className="p-2 hover:bg-gray-100 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <DestinationAutocomplete
                value={searchData.location}
                onChange={(location) => {
                  setSearchData({ ...searchData, location });
                  closePopup();
                }}
                placeholder="Search destinations"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dates Popup */}
      {activePopup === 'dates' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select dates</h3>
                <button onClick={closePopup} className="p-2 hover:bg-gray-100 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <DatePicker
                  value={searchData.checkIn}
                  onChange={(date) => setSearchData({ ...searchData, checkIn: date })}
                  placeholder="Select check-in date"
                  minDate={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <DatePicker
                  value={searchData.checkOut}
                  onChange={(date) => setSearchData({ ...searchData, checkOut: date })}
                  placeholder="Select check-out date"
                  minDate={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow.toISOString().split('T')[0];
                  })()}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <button 
                onClick={closePopup}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guests Popup */}
      {activePopup === 'guests' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Guests</h3>
                <button onClick={closePopup} className="p-2 hover:bg-gray-100 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Adults</div>
                  <div className="text-sm text-gray-500">Age 13+</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleGuestChange('adults', 'subtract')}
                    disabled={searchData.adults <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{searchData.adults}</span>
                  <button
                    onClick={() => handleGuestChange('adults', 'add')}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Children</div>
                  <div className="text-sm text-gray-500">Age 0-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleGuestChange('children', 'subtract')}
                    disabled={searchData.children <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{searchData.children}</span>
                  <button
                    onClick={() => handleGuestChange('children', 'add')}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                onClick={closePopup}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
