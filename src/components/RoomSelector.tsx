'use client';

import { useState } from 'react';
import { UsersIcon, WifiIcon } from '@heroicons/react/24/outline';

interface RoomSelectorProps {
  rooms: any[];
  selections: { [roomId: string]: number };
  checkIn?: string;
  checkOut?: string;
  onSelectionsChange: (selections: { [roomId: string]: number }) => void;
}

export function RoomSelector({ rooms, selections, checkIn, checkOut, onSelectionsChange }: RoomSelectorProps) {
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);

  const handleQuantityChange = (roomId: string, quantity: number) => {
    const newSelections = { ...selections };
    if (quantity === 0) {
      delete newSelections[roomId];
    } else {
      newSelections[roomId] = quantity;
    }
    onSelectionsChange(newSelections);
  };

  const getTotalUnits = () => {
    return Object.values(selections).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!checkIn || !checkOut) {
      // If no dates selected, show base price for 1 night
      return Object.entries(selections).reduce((total, [roomId, qty]) => {
        const room = rooms.find(r => r.id === roomId);
        return total + (room ? room.price_per_night * qty : 0);
      }, 0);
    }

    // Calculate number of nights
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return Object.entries(selections).reduce((total, [roomId, qty]) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room ? room.price_per_night * qty * nights : 0);
    }, 0);
  };

  const roomTypes = Array.from(new Set(rooms.map(room => room.room_type)));

  return (
    <div className="space-y-6">

      {/* Room Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRoomType(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRoomType === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Rooms
        </button>
        {roomTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedRoomType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRoomType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Room Cards */}
      <div className="space-y-4">
        {rooms
          .filter(room => !selectedRoomType || room.room_type === selectedRoomType)
          .map((room) => (
            <div
              key={room.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg">{room.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {room.room_type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{room.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>Up to {room.max_guests} guests</span>
                    </div>
                    {room.amenities?.includes('WiFi') && (
                      <div className="flex items-center gap-1">
                        <WifiIcon className="w-4 h-4" />
                        <span>WiFi</span>
                      </div>
                    )}
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 3).map((amenity: string) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ₹{room.price_per_night}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">per night</div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(room.id, (selections[room.id] || 0) - 1)}
                      disabled={(selections[room.id] || 0) <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">
                      {selections[room.id] || 0}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(room.id, (selections[room.id] || 0) + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

             {/* Summary */}
       {getTotalUnits() > 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-gray-600">Total Units Selected</p>
               <p className="font-medium text-lg">{getTotalUnits()} unit{getTotalUnits() !== 1 ? 's' : ''}</p>
               {checkIn && checkOut && (
                 <p className="text-xs text-gray-500 mt-1">
                   {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} night{Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                 </p>
               )}
             </div>
             <div className="text-right">
               <p className="text-sm text-gray-600">
                 {checkIn && checkOut ? 'Estimated Total' : 'Base Price (per night)'}
               </p>
               <p className="font-medium text-lg">₹{getTotalPrice().toLocaleString()}</p>
             </div>
           </div>
         </div>
       )}

      {rooms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No rooms available for this property.</p>
        </div>
      )}
    </div>
  );
} 