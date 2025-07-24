import { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface GuestSelectorProps {
  value: { rooms?: number; adults: number; children: number };
  onChange: (val: { rooms?: number; adults: number; children: number }) => void;
  showRoomsSelector?: boolean;
  maxAdults?: number;
  maxChildren?: number;
}

export function GuestSelector({ value, onChange, showRoomsSelector = true, maxAdults = Infinity, maxChildren = Infinity }: GuestSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-8 items-center">
        {showRoomsSelector && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m0 0A4 4 0 0112 4a4 4 0 015 3.13M7 13h10" /></svg>
              Rooms
            </span>
            <button type="button" className="rounded-full border w-8 h-8 flex items-center justify-center text-lg" onClick={() => onChange({ ...value, rooms: Math.max((value.rooms || 1) - 1, 1) })} disabled={(value.rooms || 1) <= 1}>-</button>
            <span className="w-4 text-center">{value.rooms || 1}</span>
            <button type="button" className="rounded-full border w-8 h-8 flex items-center justify-center text-lg" onClick={() => onChange({ ...value, rooms: (value.rooms || 1) + 1 })}>+</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m0 0A4 4 0 0112 4a4 4 0 015 3.13M7 13h10" /></svg>
            Adults
          </span>
          <button type="button" className="rounded-full border w-8 h-8 flex items-center justify-center text-lg" onClick={() => onChange({ ...value, adults: Math.max(value.adults - 1, 1) })} disabled={value.adults <= 1}>-</button>
          <span className="w-4 text-center">{value.adults}</span>
          <button type="button" className="rounded-full border w-8 h-8 flex items-center justify-center text-lg" onClick={() => onChange({ ...value, adults: Math.min(value.adults + 1, maxAdults) })} disabled={value.adults >= maxAdults}>+</button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="inline-flex items-center gap-1 text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m0 0A4 4 0 0112 4a4 4 0 015 3.13M7 13h10" /></svg>
          Children
        </span>
        <button type="button" className="rounded-full border w-8 h-8 flex items-center justify-center text-lg" onClick={() => onChange({ ...value, children: Math.max((value.children || 0) - 1, 0) })} disabled={value.children <= 0}>-</button>
        <span className="w-4 text-center">{value.children || 0}</span>
        <button type="button" className="rounded-full border w-8 h-8 flex items-center justify-center text-lg" onClick={() => onChange({ ...value, children: Math.min((value.children || 0) + 1, maxChildren) })} disabled={value.children >= maxChildren}>+</button>
      </div>
    </div>
  );
} 