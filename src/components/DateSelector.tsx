'use client';

import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DateSelectorProps {
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
}

export function DateSelector({ checkIn, checkOut, onDatesChange }: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (1 year from today)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleCheckInChange = (date: string) => {
    onDatesChange(date, checkOut);
    // If checkout is before new checkin, reset checkout
    if (checkOut && date >= checkOut) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(newCheckOut.getDate() + 1);
      onDatesChange(date, newCheckOut.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (date: string) => {
    onDatesChange(checkIn, date);
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={today}
              max={maxDateStr}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              min={checkIn || today}
              max={maxDateStr}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stay Summary */}
      {checkIn && checkOut && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p className="font-medium">{new Date(checkIn).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Check-out</p>
              <p className="font-medium">{new Date(checkOut).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Date Suggestions */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Options</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '1 Night', nights: 1 },
            { label: '2 Nights', nights: 2 },
            { label: '3 Nights', nights: 3 },
            { label: '1 Week', nights: 7 },
          ].map((option) => (
            <button
              key={option.nights}
              onClick={() => {
                if (checkIn) {
                  const newCheckOut = new Date(checkIn);
                  newCheckOut.setDate(newCheckOut.getDate() + option.nights);
                  onDatesChange(checkIn, newCheckOut.toISOString().split('T')[0]);
                }
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 