'use client';

import { useState, useRef, MutableRefObject } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PropertyWithReviews } from '@/lib/types';
import { createMultiRoomBooking, checkMultiRoomAvailability, getRoomsForProperty, getRoomInventory } from '@/lib/database';
import { Room } from '@/lib/types';
import { GuestSelector } from '@/components/GuestSelector';
import toast from 'react-hot-toast';
import { sendBookingConfirmationEmail, sendBookingConfirmationSMS } from '@/lib/notifications';
import Script from 'next/script';
import { useEffect } from 'react';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { BookingStatus } from '@/lib/types';
import { addDays, format, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Add RazorpayInstance type at the top
type RazorpayInstance = {
  open: () => void;
};

interface BookingFormProps {
  property: PropertyWithReviews;
  preselectedRoomId?: string | null;
}

export function BookingForm({ property, preselectedRoomId }: BookingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  // State for multi-room selection
  const [roomSelections, setRoomSelections] = useState<{ [roomId: string]: number }>({});
  // Track both adults and children in formData
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    children: 0,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const paymentRef = useRef<RazorpayInstance | null>(null);
  // Add state for roomInventory
  const [roomInventory, setRoomInventory] = useState<{ [roomId: string]: { [date: string]: number } }>({});

  // Fetch rooms and inventory for all rooms in the selected date range
  useEffect(() => {
    getRoomsForProperty(property.id).then((data: Room[]) => {
      setRooms(data);
      // Fetch inventory for all rooms for the selected date range
      if (formData.checkIn && formData.checkOut) {
        Promise.all(
          data.map(room =>
            getRoomInventory(room.id, formData.checkIn, formData.checkOut).then(inv => ({ roomId: room.id, inv }))
          )
        ).then(results => {
          const inventoryMap: { [roomId: string]: { [date: string]: number } } = {};
          results.forEach(({ roomId, inv }) => {
            inventoryMap[roomId] = {};
            inv.forEach(i => { inventoryMap[roomId][i.date] = i.available; });
          });
          setRoomInventory(inventoryMap);
        });
      } else {
        setRoomInventory({});
      }
    });
  }, [property.id, formData.checkIn, formData.checkOut]);

  // On room or date change, update available quantities
  useEffect(() => {
    // Reset roomSelections if checkIn/checkOut changes
    setRoomSelections({});
  }, [formData.checkIn, formData.checkOut, rooms]);

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate total capacity for selected rooms
  let totalCapacity = Object.entries(roomSelections).reduce((sum, [roomId, qty]) => {
    const room = rooms.find(r => r.id === roomId);
    return sum + (room ? room.max_guests * qty : 0);
  }, 0);
  if (isNaN(totalCapacity) || totalCapacity < 1) totalCapacity = 0;
  // Limit adults to totalCapacity + 1, but always at least 1
  let maxAdults = Math.max(totalCapacity + 1, 1);
  let adults = Math.max(1, Math.min(formData.adults, maxAdults));

  // Calculate maxChildren as 2 * total selected room units
  const totalRoomUnits = Object.values(roomSelections).reduce((sum, qty) => sum + qty, 0);
  const maxChildren = 2 * totalRoomUnits;

  const calculateTotalPrice = () => {
    let total = 0;
    if (!formData.checkIn || !formData.checkOut) return total;
    const nights = (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24);
    Object.entries(roomSelections).forEach(([roomId, qty]) => {
      if (qty > 0) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          total += nights * room.price * qty;
        }
      }
    });
    // Extra adult charge
    if (adults > totalCapacity) {
      total += nights * 1500 * (adults - totalCapacity);
    }
    // Children breakfast charge
    if (formData.children > 0) {
      total += nights * 250 * formData.children;
    }
    return total;
  };

  // Check if all dates in range are available
  const isRoomAvailable = () => {
    if (!formData.checkIn || !formData.checkOut) return true;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      for (const roomId in roomSelections) {
        if ((roomInventory[roomId]?.[dateStr] || 0) < roomSelections[roomId]) return false;
      }
    }
    return true;
  };

  const handleRoomQuantityChange = (roomId: string, quantity: number) => {
    setRoomSelections(prev => ({ ...prev, [roomId]: quantity }));
  };

  // In handleSubmit, integrate Razorpay payment before booking creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a property');
      const redirectUrl = `/auth/signin?redirect=/property/${property.id}`;
      router.push(redirectUrl);
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    // Prepare room requests
    const roomRequests = Object.entries(roomSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([room_id, quantity]) => ({
        room_id,
        quantity,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
      }));
    if (roomRequests.length === 0) {
      toast.error('Please select at least one room type and quantity');
      return;
    }
    // Check availability for all selected rooms
    setLoading(true);
    const isAvailable = await checkMultiRoomAvailability(roomRequests);
    if (!isAvailable) {
      setLoading(false);
      toast.error('One or more selected room types are not available for the chosen dates/quantities');
      return;
    }
    // Calculate total price
    const totalPrice = calculateTotalPrice();
    // Trigger Razorpay payment
    setPaymentInProgress(true);
    try {
      const options = {
        key: 'rzp_test_C7d9Vbcc9JM8dp',
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: property.title,
        description: 'Booking Payment',
        handler: async function (response: { razorpay_payment_id: string }) {
          // On payment success, create booking
          const booking = await createMultiRoomBooking({
            property_id: property.id,
            guest_id: user.id,
            check_in_date: formData.checkIn,
            check_out_date: formData.checkOut,
            guests_count: adults,
            total_price: totalPrice,
            special_requests: formData.specialRequests || null,
            status: 'paid' as BookingStatus,
          }, roomRequests, response.razorpay_payment_id);
          setPaymentInProgress(false);
          setLoading(false);
          if (booking) {
            await sendPaymentReceiptEmail({
              to: user.email,
              guestName: user.user_metadata?.full_name || user.email,
              bookingType: 'Homestay',
              title: property.title,
              checkIn: formData.checkIn,
              checkOut: formData.checkOut,
              guests: adults,
              totalPrice,
              paymentRef: response.razorpay_payment_id
            });
            toast.success(
              <span>Booking created and payment successful!<br/><span className="text-xs text-gray-500">Payment Ref: {response.razorpay_payment_id}</span></span>
            );
            router.push('/guest/dashboard');
          } else {
            toast.error('Failed to create booking after payment');
          }
        },
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            setPaymentInProgress(false);
            setLoading(false);
            toast.error('Payment was cancelled. Please try again.');
          }
        }
      };
      // @ts-expect-error: Razorpay is a global injected by the script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setPaymentInProgress(false);
      setLoading(false);
      toast.error('An error occurred while processing payment');
    }
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {paymentInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <div className="text-lg font-semibold text-blue-700">Processing payment…</div>
          </div>
        </div>
      )}
      <Card className="sticky top-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">₹{property.price_per_night}</span>
            <span className="text-gray-600">per night</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{property.average_rating?.toFixed(1) || '0.0'} ({property.review_count || 0} reviews)</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room selection */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">Select Room Types & Quantities</label>
              <div className="space-y-2">
                {rooms.map(room => {
                  // Set maxAvailable to 2 for all room types for now
                  let maxAvailable = 2;
                  return (
                    <div key={room.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="font-semibold">{room.name}</span> <span className="text-xs text-gray-500">({room.room_type})</span>
                        <span className="ml-2 text-green-700 font-bold">₹{room.price}</span>
                      </div>
                      <label className="text-sm">Qty:</label>
                      <select
                        value={roomSelections[room.id] || 0}
                        onChange={e => handleRoomQuantityChange(room.id, Number(e.target.value))}
                        className="border rounded px-2 py-1"
                      >
                        {Array.from({ length: maxAvailable + 1 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-500">(max {maxAvailable})</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Check-in"
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="Check-out"
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Show unavailable warning if needed */}
            {!isRoomAvailable() && (
              <div className="text-red-600 text-sm mb-2">Selected room is not available for the chosen dates.</div>
            )}
            {/* Guest Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Guests</label>
              <GuestSelector
                value={{ adults: adults, children: formData.children }}
                onChange={(val) => setFormData({ ...formData, ...val })}
                showRoomsSelector={false}
                maxAdults={maxAdults}
                maxChildren={maxChildren}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special requests (optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any special requests or requirements..."
              />
            </div>
            {nights > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>₹{property.price_per_night} × {nights} nights</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
                {adults > totalCapacity && (
                  <div className="flex justify-between text-sm text-red-700">
                    <span>Extra Adult Charge (₹1500 x {adults - totalCapacity} x {nights} nights)</span>
                    <span>₹{nights * 1500 * (adults - totalCapacity)}</span>
                  </div>
                )}
                {formData.children > 0 && (
                  <div className="flex justify-between text-sm text-yellow-700">
                    <span>Children Breakfast (₹250 x {formData.children} x {nights} nights)</span>
                    <span>₹{nights * 250 * formData.children}</span>
                  </div>
                )}
              </div>
            )}
            <Button
              type="submit"
              loading={loading || paymentInProgress}
              className="w-full"
              disabled={!formData.checkIn || !formData.checkOut || loading || paymentInProgress || Object.values(roomSelections).every(qty => qty === 0)}
            >
              Book Now & Pay
            </Button>
            {!user && (
              <p className="text-sm text-gray-600 text-center">
                You need to be signed in to book this property
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
} 