"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Script from 'next/script';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  HomeIcon, 
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { DatePicker } from './DatePicker';
import { getRoomsForProperty, checkMultiRoomAvailability, createMultiRoomBooking, ensureProfile } from '@/lib/database';
import { Room, Property } from '@/lib/types';
import { format, addDays, differenceInDays } from 'date-fns';

interface BookingFormProps {
  property: Property;
  preselectedRoomId?: string | null;
}

interface RoomSelection {
  roomId: string;
  quantity: number;
  adults: number;
  children: number;
}

const EXTRA_ADULT_PRICE = 1500;
const BASE_ADULT_CAPACITY = 2;
const BASE_CHILD_CAPACITY = 1;

export default function BookingForm({ property, preselectedRoomId }: BookingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [roomSelections, setRoomSelections] = useState<RoomSelection[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');

  // Test button at the very top
  console.log('🔍 BookingForm component is rendering');

  useEffect(() => {
    const loadRooms = async () => {
      const propertyRooms = await getRoomsForProperty(property.id);
      setRooms(propertyRooms);
      
      if (preselectedRoomId && propertyRooms.length > 0) {
        const preselectedRoom = propertyRooms.find(r => r.id === preselectedRoomId);
        if (preselectedRoom) {
          setRoomSelections([{
            roomId: preselectedRoom.id,
            quantity: 1,
            adults: Math.min(2, preselectedRoom.max_guests || 3),
            children: Math.max(0, Math.min(1, (preselectedRoom.max_guests || 3) - 2))
          }]);
        }
      }
    };
    
    loadRooms();
  }, [property.id, preselectedRoomId]);

  useEffect(() => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const dayAfter = format(addDays(new Date(), 2), 'yyyy-MM-dd');
    setCheckIn(tomorrow);
    setCheckOut(dayAfter);
  }, []);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  const calculateTotalPrice = (): number => {
    const nights = calculateNights();
    if (nights <= 0) return 0;

    let total = 0;
    
    roomSelections.forEach(selection => {
      const room = rooms.find(r => r.id === selection.roomId);
      if (!room) {
        return;
      }

      const quantity = selection.quantity || 0;
      const adults = selection.adults || 0;
      const pricePerNight = room.price || 0;

      const basePrice = pricePerNight * quantity * nights;
      total += basePrice;

      const extraAdults = Math.max(0, adults - BASE_ADULT_CAPACITY);
      const extraAdultCharges = extraAdults * EXTRA_ADULT_PRICE * nights;
      total += extraAdultCharges;
    });

    return total;
  };

  const getTotalGuests = () => {
    return roomSelections.reduce((total, selection) => {
      const adults = selection.adults || 0;
      const children = selection.children || 0;
      const quantity = selection.quantity || 0;
      return total + (adults + children) * quantity;
    }, 0);
  };

  const handleRoomSelection = (roomId: string, quantity: number) => {
    const existingIndex = roomSelections.findIndex(rs => rs.roomId === roomId);
    
    if (quantity === 0) {
      setRoomSelections(prev => prev.filter(rs => rs.roomId !== roomId));
    } else {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

             // Ensure max_guests is a valid number - default to 3 (2 adults + 1 child)
       const maxGuests = typeof room.max_guests === 'number' ? room.max_guests : 3;
       // Start with 2 adults and 1 child as default
       const adults = Math.min(2, maxGuests);
       const children = Math.max(0, Math.min(1, maxGuests - adults));

       const newSelection: RoomSelection = {
         roomId,
         quantity,
         adults,
         children
       };

      if (existingIndex >= 0) {
        setRoomSelections(prev => prev.map((rs, index) => 
          index === existingIndex ? { ...rs, quantity } : rs
        ));
      } else {
        setRoomSelections(prev => [...prev, newSelection]);
      }
    }
  };

    const handleGuestChange = (roomId: string, type: 'adults' | 'children', change: number) => {
    setRoomSelections(prev => {
      return prev.map(rs => {
        if (rs.roomId !== roomId) return rs;
        
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
          return rs;
        }

        const currentValue = rs[type] || 0;
        const newValue = currentValue + change;
        const maxCapacity = typeof room.max_guests === 'number' ? room.max_guests : 3;
        const otherType = type === 'adults' ? 'children' : 'adults';
        const otherTypeValue = rs[otherType] || 0;
        
        // Special validation for adults and children
        let isValid = true;
        
        if (type === 'adults') {
          // Adults can be 1-3, but if adults > 2, children must be 0
          if (newValue < 1 || newValue > 3) isValid = false;
          if (newValue > 2 && otherTypeValue > 0) isValid = false;
        } else if (type === 'children') {
          // Children can be 0-1, but only if adults <= 2
          if (newValue < 0 || newValue > 1) isValid = false;
          if (newValue > 0 && otherTypeValue > 2) isValid = false;
        }
        
        // Also check total capacity
        if ((otherTypeValue + newValue) > maxCapacity) isValid = false;
        
        if (!isValid) {
          return rs;
        }

        const updatedSelection = { ...rs, [type]: newValue };
        return updatedSelection;
      });
    });
  };

  const getRoomSelection = (roomId: string) => {
    return roomSelections.find(rs => rs.roomId === roomId);
  };

  const processBooking = async () => {
    console.log('🔍 Starting payment process...');
    console.log('🔍 User:', user);
    console.log('🔍 Property:', property.id);
    
    if (!user) {
      toast.error('Please sign in to book');
      router.push('/auth/signin');
      return;
    }

    // Debug: Check user profile
    try {
      const profileRes = await fetch('/api/user/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log('🔍 Profile check:', profileData);
      } else {
        console.error('🔍 Profile check failed:', await profileRes.text());
      }
    } catch (error) {
      console.error('🔍 Profile check error:', error);
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (roomSelections.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Room selections:', roomSelections);
      
      const roomRequests = roomSelections.map(rs => ({
        room_id: rs.roomId,
        quantity: rs.quantity,
        check_in: checkIn,
        check_out: checkOut,
      }));

      console.log('🔍 Checking availability...');
      const isAvailable = await checkMultiRoomAvailability(roomRequests);
      console.log('🔍 Availability result:', isAvailable);
      
      if (!isAvailable) {
        toast.error('Selected rooms are not available for the chosen dates');
        setLoading(false);
        return;
      }

      const totalPrice = calculateTotalPrice();
      console.log('🔍 Total price:', totalPrice);
      
      console.log('🔍 Creating Razorpay order...');
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100),
          currency: 'INR',
          notes: {
            type: 'homestay',
            propertyId: property.id,
            checkIn,
            checkOut,
            guests: getTotalGuests()
          }
        }),
      });

      console.log('🔍 Order response status:', orderRes.status);
      
      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error('🔍 Order creation failed:', errorText);
        throw new Error(`Failed to create payment order: ${errorText}`);
      }

      const orderData = await orderRes.json();
      console.log('🔍 Order created successfully:', orderData);
      const { order } = orderData;

      // Ensure profile exists and is up to date
      console.log('🔍 Ensuring profile is up to date...');
      const profile = await ensureProfile(
        user.id!, 
        user.email!, 
        user.user_metadata?.full_name
      );
      
      if (!profile) {
        toast.error('Failed to create/update user profile');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Profile ensured:', profile);

      console.log('🔍 Setting up Razorpay options...');
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: property.title,
        description: `Booking for ${calculateNights()} night${calculateNights() > 1 ? 's' : ''}`,
        order_id: order.id,
        handler: async function (response: { razorpay_payment_id: string }) {
          console.log('🔍 Payment successful! Response:', response);
          try {
            const roomRequests = roomSelections.map(rs => ({
              room_id: rs.roomId,
              quantity: rs.quantity,
              check_in: checkIn,
              check_out: checkOut,
            }));

            console.log('🔍 Creating booking after payment...');
            const booking = await createMultiRoomBooking({
              user_id: user.id!, // Changed from guest_id
              booking_type: 'property' as const, // New field - enum
              item_id: property.id, // Changed from property_id
              check_in_date: checkIn,
              check_out_date: checkOut,
              guests_count: getTotalGuests(),
              total_price: totalPrice,
              special_requests: specialRequests || null,
              status: 'confirmed' as const, // Enum value
            }, roomRequests, response.razorpay_payment_id);

            console.log('🔍 Booking result:', booking);
            
            if (booking) {
              toast.success('Booking confirmed! Payment successful.');
              router.push('/guest/dashboard');
            } else {
              toast.error('Failed to create booking after payment');
            }
          } catch (error) {
            console.error('🔍 Error creating booking:', error);
            toast.error('Payment successful but booking creation failed');
          }
        },
        prefill: {
          email: profile.email || user.email || '',
          name: profile.full_name || user.user_metadata?.full_name || '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            console.log('🔍 Payment modal dismissed');
            setLoading(false);
            toast.error('Payment was cancelled');
          }
        }
      };

      console.log('🔍 Razorpay options:', options);
      console.log('🔍 Checking if Razorpay is loaded...');
      
      // Check if Razorpay is loaded
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        console.log('🔍 Razorpay is loaded, opening payment modal...');
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        console.error('🔍 Razorpay not loaded');
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('🔍 Booking error:', error);
      toast.error(`An error occurred while processing your booking: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <>
    {/* TEST BUTTON - Should be visible */}
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
      <button
        onClick={() => {
          console.log('🔍 TEST BUTTON CLICKED!');
          console.log('🔍 User:', user);
          console.log('🔍 Property:', property);
        }}
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        🔴 TEST BUTTON
      </button>
    </div>

    <Card className="bg-white shadow-xl border-0 sticky top-8">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-gray-900">₹{property.base_price}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>per night</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{property.google_average_rating || 4.5}</span>
            <span>•</span>
            <span>{property.google_reviews_count || 0} reviews</span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <DatePicker
                value={checkIn}
                onChange={setCheckIn}
                placeholder="Select check-in date"
                minDate={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                className="w-full"
                variant="default"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <DatePicker
                value={checkOut}
                onChange={setCheckOut}
                placeholder="Select check-out date"
                minDate={checkIn || format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                className="w-full"
                variant="default"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {calculateNights() > 0 ? `${calculateNights()} night${calculateNights() > 1 ? 's' : ''}` : 'Select dates'}
          </p>
        </div>

        {/* Room Selection */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <HomeIcon className="w-5 h-5 mr-2 text-blue-600" />
            Select Rooms
          </h4>
          
                     {rooms.length === 0 ? (
             <div className="text-center py-8">
               <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-600">No rooms available</p>
             </div>
           ) : (
            <div className="space-y-4">
              {rooms.map(room => {
                const selection = getRoomSelection(room.id);
                
                                 return (
                   <div key={room.id} className="border border-gray-200 rounded-xl p-4">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h5 className="font-semibold text-gray-900">{room.name}</h5>
                         <p className="text-sm text-gray-600">{room.room_type}</p>
                         <p className="text-sm text-gray-600">₹{room.price || 'Price not set'}/night • Up to {room.max_guests || 3} guests</p>

                       </div>
                      
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleRoomSelection(room.id, Math.max(0, (selection?.quantity || 0) - 1))}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={!selection || selection.quantity <= 0}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 font-semibold text-gray-900">
                          {selection?.quantity || 0}
                        </span>
                        <button
                          onClick={() => handleRoomSelection(room.id, (selection?.quantity || 0) + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {selection && selection.quantity > 0 && (
                      <div className="border-t pt-4">
                        <h6 className="font-medium text-gray-900 mb-3">Guest Allocation</h6>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Adults:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleGuestChange(room.id, 'adults', -1)}
                                className="p-1 hover:bg-gray-100 transition-colors"
                                disabled={selection.adults <= 0}
                              >
                                <MinusIcon className="w-3 h-3" />
                              </button>
                              <span className="px-2 py-1 font-semibold text-gray-900">
                                {selection.adults}
                              </span>
                                                             <button
                                 onClick={() => handleGuestChange(room.id, 'adults', 1)}
                                 className="p-1 hover:bg-gray-100 transition-colors"
                                 disabled={selection.adults >= 3 || (selection.adults >= 2 && selection.children > 0)}
                               >
                                <PlusIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Children:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleGuestChange(room.id, 'children', -1)}
                                className="p-1 hover:bg-gray-100 transition-colors"
                                disabled={selection.children <= 0}
                              >
                                <MinusIcon className="w-3 h-3" />
                              </button>
                              <span className="px-2 py-1 font-semibold text-gray-900">
                                {selection.children}
                              </span>
                                                             <button
                                 onClick={() => handleGuestChange(room.id, 'children', 1)}
                                 className="p-1 hover:bg-gray-100 transition-colors"
                                 disabled={selection.children >= 1 || selection.adults > 2}
                               >
                                <PlusIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                                                 {selection.adults > BASE_ADULT_CAPACITY && (
                           <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                             <p className="text-sm text-yellow-800">
                               Extra adult charge: ₹{EXTRA_ADULT_PRICE} per night per extra adult (3rd adult)
                             </p>
                           </div>
                         )}
                         {selection.adults > 2 && (
                           <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                             <p className="text-xs text-blue-800">
                               Note: Children not allowed when 3 adults are selected
                             </p>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-purple-600" />
            Special Requests (Optional)
          </h4>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requests or preferences..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

                 {/* Price Summary */}
         <div className="border-t pt-4 mb-6">
           <div className="space-y-3">
             {/* Room-wise prices */}
             {roomSelections.map(rs => {
               const room = rooms.find(r => r.id === rs.roomId);
               if (!room) return null;
               
                               const roomPrice = (room.price || 0) * rs.quantity * calculateNights();
               const extraAdults = Math.max(0, rs.adults - BASE_ADULT_CAPACITY);
               const extraAdultCharges = extraAdults * EXTRA_ADULT_PRICE * calculateNights();
               
               return (
                 <div key={rs.roomId} className="border-b pb-2">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-sm text-gray-600">{room.name} ({rs.quantity}x)</span>
                     <span className="text-sm text-gray-900">₹{roomPrice.toLocaleString()}</span>
                   </div>
                   {extraAdultCharges > 0 && (
                     <div className="flex items-center justify-between">
                       <span className="text-xs text-gray-500">Extra adult charges</span>
                       <span className="text-xs text-gray-700">₹{extraAdultCharges.toLocaleString()}</span>
                     </div>
                   )}
                 </div>
               );
             })}
             
             <div className="border-t pt-2">
               <div className="flex items-center justify-between">
                 <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                 <span className="text-2xl font-bold text-green-600">₹{calculateTotalPrice().toLocaleString()}</span>
               </div>
               <p className="text-sm text-gray-600">Including all taxes and charges</p>
             </div>
           </div>
         </div>

        {/* Check-in Button */}
        <Button
          onClick={processBooking}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading || roomSelections.length === 0 || getTotalGuests() === 0}
          className="w-full"
        >
          <CreditCardIcon className="w-5 h-5 mr-2" />
          Check-in
        </Button>


        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You won't be charged yet • Free cancellation until 24 hours before check-in
          </p>
        </div>
      </CardContent>
    </Card>
    
    {/* Razorpay Script */}
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
  </>
  );
}
