'use client';

import { MapPinIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

interface PaymentSummaryProps {
  property: any;
  bookingData: any;
  rooms: any[];
  totalPrice: number;
  nights: number;
}

export function PaymentSummary({ property, bookingData, rooms, totalPrice, nights }: PaymentSummaryProps) {
  const calculateRoomPrice = () => {
    let roomPrice = 0;
    Object.entries(bookingData.roomSelections).forEach(([roomId, qty]) => {
      if (qty > 0) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          roomPrice += room.price_per_night * qty * nights;
        }
      }
    });
    return roomPrice;
  };

  const calculateExtraAdultCharge = () => {
    const totalRoomUnits = Object.values(bookingData.roomSelections).reduce((sum, qty) => sum + qty, 0);
    const maxBaseGuests = totalRoomUnits * 2;
    if (bookingData.adults > maxBaseGuests) {
      const extraAdults = bookingData.adults - maxBaseGuests;
      return nights * 1500 * extraAdults;
    }
    return 0;
  };

  const calculateChildrenCharge = () => {
    return nights * 250 * bookingData.children;
  };

  const roomPrice = calculateRoomPrice();
  const extraAdultCharge = calculateExtraAdultCharge();
  const childrenCharge = calculateChildrenCharge();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Your Booking</h3>
        <p className="text-gray-600 mb-6">
          Please review your booking details before confirming.
        </p>
      </div>

      {/* Property Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <img
            src={property.images?.[0] || property.gallery?.living?.[0] || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{property.title}</h4>
            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{property.city}, {property.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4">
        <h4 className="font-semibold">Booking Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p className="font-medium">
                {new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Check-out</p>
              <p className="font-medium">
                {new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <UsersIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Guests</p>
              <p className="font-medium">
                {bookingData.adults} adult{bookingData.adults !== 1 ? 's' : ''}
                {bookingData.children > 0 && `, ${bookingData.children} child${bookingData.children !== 1 ? 'ren' : ''}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-5 h-5 text-gray-500">🏨</span>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Room Selections */}
      {Object.entries(bookingData.roomSelections).some(([_, qty]) => qty > 0) && (
        <div className="space-y-4">
          <h4 className="font-semibold">Selected Rooms</h4>
          <div className="space-y-2">
            {Object.entries(bookingData.roomSelections).map(([roomId, qty]) => {
              if (qty === 0) return null;
              const room = rooms.find(r => r.id === roomId);
              return (
                <div key={roomId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{room?.name || `Room Type ${roomId}`}</span>
                  <span className="text-gray-600">{qty} unit{qty !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guest Information */}
      <div className="space-y-4">
        <h4 className="font-semibold">Guest Information</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{bookingData.guestInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{bookingData.guestInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{bookingData.guestInfo.phone}</span>
          </div>
          {bookingData.guestInfo.specialRequests && (
            <div className="pt-2 border-t">
              <span className="text-gray-600">Special Requests:</span>
              <p className="text-sm mt-1">{bookingData.guestInfo.specialRequests}</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4">
        <h4 className="font-semibold">Price Breakdown</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span>Room charges ({nights} night{nights !== 1 ? 's' : ''})</span>
            <span>₹{roomPrice.toLocaleString()}</span>
          </div>
          
          {extraAdultCharge > 0 && (
            <div className="flex justify-between">
              <span>Extra adult charges</span>
              <span>₹{extraAdultCharge.toLocaleString()}</span>
            </div>
          )}
          
          {childrenCharge > 0 && (
            <div className="flex justify-between">
              <span>Children breakfast charges</span>
              <span>₹{childrenCharge.toLocaleString()}</span>
            </div>
          )}
          
          <div className="pt-3 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Cancellation Policy</h4>
        <p className="text-sm text-yellow-700">
          Free cancellation up to 24 hours before check-in. Cancellations made within 24 hours of check-in may be subject to charges.
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Terms & Conditions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Check-in time: 2:00 PM</li>
          <li>• Check-out time: 11:00 AM</li>
          <li>• Smoking is not allowed</li>
          <li>• Pets are not allowed</li>
          <li>• Quiet hours: 10:00 PM - 7:00 AM</li>
        </ul>
      </div>
    </div>
  );
} 