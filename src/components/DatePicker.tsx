'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isBefore, isAfter, addDays, subDays } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  variant?: 'default' | 'navigation';
}

export function DatePicker({ value, onChange, placeholder, minDate, maxDate, className = '', variant = 'default' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Check if click is on the input field or its container
      if (pickerRef.current && pickerRef.current.contains(target)) {
        return;
      }
      
      // Check if click is on the calendar portal
      const calendarElement = document.querySelector('[data-calendar-portal]');
      if (calendarElement && calendarElement.contains(target)) {
        return;
      }
      
      // If click is outside both, close the calendar
      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update current month when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(date);
      setSelectedDate(date);
    }
  }, [value]);

  // Update dropdown position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect();
        setCalendarPosition({
          top: rect.bottom + 8,
          left: rect.left
        });
      }
    };

    const handleResize = () => {
      if (isOpen && pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect();
        setCalendarPosition({
          top: rect.bottom + 8,
          left: rect.left
        });
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      // Update position immediately
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding days from previous month
    const startDay = start.getDay();
    const paddingStart = Array.from({ length: startDay }, (_, i) => 
      subDays(start, startDay - i)
    );

    // Add padding days from next month
    const endDay = end.getDay();
    const paddingEnd = Array.from({ length: 6 - endDay }, (_, i) => 
      addDays(end, i + 1)
    );

    return [...paddingStart, ...days, ...paddingEnd];
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, new Date(minDate))) return true;
    if (maxDate && isAfter(date, new Date(maxDate))) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };

  const isDateToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const days = getDaysInMonth();

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
             {/* Input Field */}
       <div
         className={`flex items-center justify-between cursor-pointer transition-all ${
           variant === 'navigation' 
             ? 'p-0 border-none hover:bg-transparent focus-within:bg-transparent' 
             : 'p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200'
         }`}
         onClick={() => {
           if (!isOpen && pickerRef.current) {
             const rect = pickerRef.current.getBoundingClientRect();
             setCalendarPosition({
               top: rect.bottom + 8,
               left: rect.left
             });
           }
           setIsOpen(!isOpen);
         }}
         onKeyDown={(e) => {
           if (e.key === 'Enter' || e.key === ' ') {
             e.preventDefault();
             setIsOpen(!isOpen);
           }
         }}
         tabIndex={0}
         role="button"
         aria-label="Open date picker"
       >
         <input
           type="text"
           value={value ? format(new Date(value), 'MMM dd, yyyy') : ''}
           placeholder={placeholder}
           readOnly
           className={`flex-1 bg-transparent border-none outline-none cursor-pointer ${
             variant === 'navigation'
               ? 'text-gray-900 placeholder-gray-600 text-sm p-0 m-0 focus:ring-0'
               : 'text-sm text-gray-900 placeholder-gray-600'
           }`}
         />
         {variant === 'default' && <CalendarIcon className="w-4 h-4 text-gray-400" />}
       </div>

             {/* Calendar Dropdown */}
       {isOpen && createPortal(
         <div 
           className="absolute bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] min-w-[240px]" 
           data-calendar-portal
           style={{ 
             zIndex: 99999,
             top: `${calendarPosition.top}px`,
             left: `${calendarPosition.left}px`,
             position: 'fixed'
           }}
         >
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-100">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-3 h-3 text-gray-700" />
            </button>
            <h3 className="font-semibold text-gray-900 text-sm">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-3 h-3 text-gray-700" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-0.5 p-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 p-1">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = value && isSameDay(day, new Date(value));
              const isToday = isSameDay(day, new Date());
              const isDisabled = minDate ? isBefore(day, new Date(minDate)) : false;

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  disabled={!isCurrentMonth || isDisabled}
                  className={`
                    w-6 h-6 rounded-lg text-xs font-medium transition-all
                    ${isCurrentMonth ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-300'}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="p-1.5 border-t border-gray-100">
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  const today = new Date();
                  if (!isDateDisabled(today)) {
                    handleDateSelect(today);
                  }
                }}
                className="flex-1 px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
              >
                Today
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
         </div>,
         document.body
       )}
    </div>
  );
}
