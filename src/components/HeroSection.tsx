'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  StarIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { DatePicker } from './DatePicker';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isBefore, isAfter, addDays } from 'date-fns';

export function HeroSection() {
  const router = useRouter();
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search state
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  const targetWord = 'Everyone';
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 2000;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        return;
      }
      
      const timeout = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1));
      }, deletingSpeed);
      
      return () => clearTimeout(timeout);
    } else {
      if (currentText === targetWord) {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        
        return () => clearTimeout(timeout);
      }
      
      const timeout = setTimeout(() => {
        setCurrentText(targetWord.slice(0, currentText.length + 1));
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentText, isDeleting, targetWord]);

  // Close guest dropdown when clicking outside
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search parameters - allow empty values for broader search
    const params = new URLSearchParams();
    
    // Only add non-empty parameters
    if (searchData.location.trim()) {
      params.append('location', searchData.location.trim());
    }
    if (searchData.checkIn) {
      params.append('checkIn', searchData.checkIn);
    }
    if (searchData.checkOut) {
      params.append('checkOut', searchData.checkOut);
    }
    if (searchData.adults > 0) {
      params.append('adults', searchData.adults.toString());
    }
    if (searchData.children > 0) {
      params.append('children', searchData.children.toString());
    }
    
    // Calculate total guests for capacity filtering (only if there are guests)
    const totalGuests = searchData.adults + searchData.children;
    if (totalGuests > 0) {
      params.append('guests', totalGuests.toString());
    }
    
    // Navigate to search page with parameters (even if empty)
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-1" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-300/30 rounded-full blur-xl animate-float-2" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-orange-400/25 rounded-full blur-xl animate-float-3" />
        <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl animate-float-1" />
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-orange-300/25 rounded-full blur-xl animate-float-2" />
        
        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-orange-200 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-16 flex flex-col justify-center min-h-[60vh]">
          {/* Reduced Main Heading */}
          <h1 
            className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Travel for{' '}
            <span className="block text-white relative">
              {currentText}
              <span className="animate-pulse text-yellow-200">|</span>
            </span>
          </h1>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-1.5">
              <div className="flex flex-col lg:flex-row items-stretch">
                {/* Where Section */}
                <div className="flex-1 p-2.5 border-r border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    Where
                  </div>
                  <DestinationAutocomplete
                    value={searchData.location}
                    onChange={(location) => setSearchData({ ...searchData, location })}
                    placeholder="Search destinations"
                    className="w-full text-sm text-gray-900 placeholder-gray-600 border-none outline-none bg-transparent"
                  />
                </div>

                {/* Check-in Section */}
                <div className="flex-1 p-2.5 border-r border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Check in
                  </div>
                  <DatePicker
                    value={searchData.checkIn}
                    onChange={(date) => setSearchData({ ...searchData, checkIn: date })}
                    placeholder="Select check-in date"
                    minDate={new Date().toISOString().split('T')[0]}
                    className="w-full"
                    variant="navigation"
                  />
                </div>

                {/* Check-out Section */}
                <div className="flex-1 p-2.5 border-r border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Check out
                  </div>
                  <DatePicker
                    value={searchData.checkOut}
                    onChange={(date) => setSearchData({ ...searchData, checkOut: date })}
                    placeholder="Select check-out date"
                    minDate={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split('T')[0];
                    })()}
                    className="w-full"
                    variant="navigation"
                  />
                </div>

                {/* Who Section */}
                <div className="flex-1 p-2.5 border-r border-gray-200 relative" ref={guestsRef}>
                  <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    Who
                  </div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setGuestsOpen((v) => !v)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setGuestsOpen(false); }}
                    tabIndex={0}
                  >
                    <span className="text-gray-600 text-sm">
                      {searchData.adults} Adult{searchData.adults !== 1 ? 's' : ''}, {searchData.children} Child{searchData.children !== 1 ? 'ren' : ''}
                    </span>
                    <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Guest Selector Dropdown - Fixed Positioning */}
                  {guestsOpen && (
                    <div 
                      className="absolute z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 space-y-3 min-w-[280px] animate-scale-in"
                      style={{
                        top: '100%',
                        left: '0',
                        marginTop: '8px'
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-900 font-bold text-base">Select Guests</div>
                        <button 
                          onClick={() => setGuestsOpen(false)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium text-sm">Adults</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSearchData({ ...searchData, adults: Math.max(searchData.adults - 1, 1) })}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold text-sm"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-gray-900 font-semibold text-sm">{searchData.adults}</span>
                            <button
                              type="button"
                              onClick={() => setSearchData({ ...searchData, adults: searchData.adults + 1 })}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium text-sm">Children</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSearchData({ ...searchData, children: Math.max(searchData.children - 1, 0) })}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold text-sm"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-gray-900 font-semibold text-sm">{searchData.children}</span>
                            <button
                              type="button"
                              onClick={() => setSearchData({ ...searchData, children: searchData.children + 1 })}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="p-2">
                  <button 
                    type="submit" 
                    className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white flex items-center justify-center p-0 shadow-lg rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-white text-center">
                <PlayIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video player would be integrated here</p>
                <p className="text-sm text-gray-400 mt-2">Showcasing our properties and experiences</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 