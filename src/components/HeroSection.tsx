'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';

export function HeroSection() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    children: 0,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setGuestsOpen(false);
      }
    }
    if (guestsOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [guestsOpen]);

  const totalGuests = searchData.adults + searchData.children;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut);
    if (searchData.adults) params.append('adults', String(searchData.adults));
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="block text-blue-200">Stay</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Discover amazing properties around the world. From cozy cabins to luxury villas, 
            find the perfect accommodation for your next adventure.
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative overflow-visible">
                {/* Location */}
                <div className="px-4">
                  <Input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchData.location}
                    onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                    className="text-gray-400 font-normal text-sm font-[Arial,Helvetica,sans-serif] text-ellipsis overflow-hidden whitespace-nowrap placeholder-gray-400 placeholder:font-normal placeholder:text-sm placeholder:font-[Arial,Helvetica,sans-serif] px-0"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', fontWeight: 400 }}
                  />
                </div>

                {/* Check-in Date */}
                <div className="relative px-4">
                  <Input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    className="text-gray-400 font-normal text-sm font-[Arial,Helvetica,sans-serif] text-ellipsis overflow-hidden whitespace-nowrap placeholder-gray-400 placeholder:font-normal placeholder:text-sm placeholder:font-[Arial,Helvetica,sans-serif] px-0"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', fontWeight: 400 }}
                  />
                </div>

                {/* Check-out Date */}
                <div className="relative px-4">
                  <Input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                    className="text-gray-400 font-normal text-sm font-[Arial,Helvetica,sans-serif] text-ellipsis overflow-hidden whitespace-nowrap placeholder-gray-400 placeholder:font-normal placeholder:text-sm placeholder:font-[Arial,Helvetica,sans-serif] px-0"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', fontWeight: 400 }}
                  />
                </div>

                {/* Guests Dropdown */}
                <div className="relative" ref={guestsRef} style={{ width: '100%' }}>
                  <div
                    className={`flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer min-w-[195px] w-[75%] max-w-[195px] ${guestsOpen ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setGuestsOpen((v) => !v)}
                    tabIndex={0}
                    style={{ height: '44px' }}
                  >
                    <UserGroupIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400 text-sm font-normal select-none">
                      {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
                    </span>
                    <ChevronUpDownIcon className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>
                  {guestsOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4 min-w-[260px] max-w-full" style={{ boxSizing: 'border-box', overflowX: 'auto' }}>
                      {/* Rooms */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <div className="font-normal text-gray-900 text-sm text-left">Rooms</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-lg" onClick={() => setSearchData(d => ({ ...d, rooms: Math.max(1, d.rooms - 1) }))} disabled={searchData.rooms <= 1}>-</button>
                          <span className="w-4 text-center">{searchData.rooms}</span>
                          <button type="button" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-lg" onClick={() => setSearchData(d => ({ ...d, rooms: d.rooms + 1 }))}>+</button>
                        </div>
                      </div>
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <div className="font-normal text-gray-900 text-sm text-left">Adults</div>
                          <div className="text-xs text-gray-500 text-left">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-lg" onClick={() => setSearchData(d => ({ ...d, adults: Math.max(1, d.adults - 1) }))} disabled={searchData.adults <= 1}>-</button>
                          <span className="w-4 text-center">{searchData.adults}</span>
                          <button type="button" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-lg" onClick={() => setSearchData(d => ({ ...d, adults: d.adults + 1 }))}>+</button>
                        </div>
                      </div>
                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <div className="font-normal text-gray-900 text-sm text-left">Children</div>
                          <div className="text-xs text-gray-500 text-left">Ages 2–12</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-lg" onClick={() => setSearchData(d => ({ ...d, children: Math.max(0, d.children - 1) }))} disabled={searchData.children <= 0}>-</button>
                          <span className="w-4 text-center">{searchData.children}</span>
                          <button type="button" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-lg" onClick={() => setSearchData(d => ({ ...d, children: d.children + 1 }))}>+</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Search Properties
                </Button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-blue-200">Properties Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-200">Destinations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-blue-200">Happy Guests</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 