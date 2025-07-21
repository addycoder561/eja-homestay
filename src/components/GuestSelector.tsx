import { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface GuestSelectorProps {
  value: { rooms: number; adults: number };
  onChange: (value: { rooms: number; adults: number }) => void;
}

export function GuestSelector({ value, onChange }: GuestSelectorProps) {
  const [rooms, setRooms] = useState(value.rooms || 1);
  const [adults, setAdults] = useState(value.adults || 1);

  const update = (newRooms: number, newAdults: number) => {
    setRooms(newRooms);
    setAdults(newAdults);
    onChange({ rooms: newRooms, adults: newAdults });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-normal text-gray-400 text-sm font-[Arial,Helvetica,sans-serif]" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', color: '#6B7280', fontWeight: 400 }}>
          <UserGroupIcon className="w-5 h-5 text-gray-400 mr-1" />
          Rooms
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-700 disabled:opacity-50"
            onClick={() => update(Math.max(1, rooms - 1), adults)}
            disabled={rooms <= 1}
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-gray-900">{rooms}</span>
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-700"
            onClick={() => update(rooms + 1, adults)}
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-normal text-gray-400 text-sm font-[Arial,Helvetica,sans-serif]" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', color: '#6B7280', fontWeight: 400 }}>
          Adults
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-700 disabled:opacity-50"
            onClick={() => update(rooms, Math.max(1, adults - 1))}
            disabled={adults <= 1}
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-gray-900">{adults}</span>
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-700"
            onClick={() => update(rooms, adults + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
} 