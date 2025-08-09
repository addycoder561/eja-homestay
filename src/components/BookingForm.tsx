'use client';

import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PropertyWithReviews, Room, BookingStatus } from '@/lib/types';
import { createMultiRoomBooking, checkMultiRoomAvailability, getRoomsForProperty, getRoomInventory } from '@/lib/database';
import { GuestSelector } from '@/components/GuestSelector';
import { LiveRating } from '@/components/LiveRating';
import toast from 'react-hot-toast';
import { sendBookingConfirmationEmail, sendBookingConfirmationSMS, sendPaymentReceiptEmail } from '@/lib/notifications';
import Script from 'next/script';
import { addDays, format, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useBookingPersistence } from '@/hooks/useBookingPersistence';

// Add RazorpayInstance type at the top
type RazorpayInstance = {
  open: () => void;
};

// ------------------------------
// CONFIGURATION CONSTANTS
// ------------------------------
const BASE_ADULT_ALLOWANCE = 2; // per room
const BASE_CHILD_ALLOWANCE = 1; // per room
const MAX_CAPACITY = 4; // total guests per room

const EXTRA_ADULT_PRICE = 1500; // per night
const BREAKFAST_CHILD_PRICE = 250; // per night
const BREAKFAST_ADULT_PRICE = 350; // per night

// ------------------------------
// HELPER FUNCTION: Date Difference in Nights
// ------------------------------
function dateDiff(checkIn: string | Date, checkOut: string | Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  return Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / oneDay)); 
}

// ------------------------------
// MAIN BOOKING PRICE CALCULATOR
// ------------------------------
interface UnitSelection {
  adults: number;
  children: number;
}

interface RoomCategory {
  basePrice: number; // per night price for this category
  units: UnitSelection[];
}

interface BookingData {
  checkIn: string | Date;
  checkOut: string | Date;
  categories: RoomCategory[];
}

export function calculateBookingTotal(booking: BookingData): number {
  let grandTotal = 0;
  const nights = dateDiff(booking.checkIn, booking.checkOut);

  booking.categories.forEach((category) => {
    const { basePrice, units } = category;

    units.forEach((unit) => {
      const { adults, children } = unit;

      // SAFETY: Prevent overbooking beyond max capacity
      if (adults + children > MAX_CAPACITY) {
        throw new Error(`Guest count exceeds maximum capacity of ${MAX_CAPACITY} for a room.`);
      }

      // 1. Base price
      let roomTotal = basePrice * nights;

      // 2. Extra adult charges
      if (adults > BASE_ADULT_ALLOWANCE) {
        const extraAdults = adults - BASE_ADULT_ALLOWANCE;
        roomTotal += extraAdults * EXTRA_ADULT_PRICE * nights;
      }

      // 3. Breakfast charges
      const chargeableAdultsForBreakfast = Math.max(0, adults - BASE_ADULT_ALLOWANCE);
      const chargeableChildrenForBreakfast = Math.max(0, children - BASE_CHILD_ALLOWANCE);

      roomTotal += (chargeableAdultsForBreakfast * BREAKFAST_ADULT_PRICE * nights);
      roomTotal += (chargeableChildrenForBreakfast * BREAKFAST_CHILD_PRICE * nights);

      // 4. Add this unit's total to grand total
      grandTotal += roomTotal;
    });
  });

  return grandTotal;
}

// ------------------------------
// BOOKING FLOW STEPS
// ------------------------------
type BookingStep = 'form' | 'review' | 'payment';

interface BookingFormProps {
  property: PropertyWithReviews;
  preselectedRoomId?: string | null;
}

export function BookingForm({ property, preselectedRoomId }: BookingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { storeBookingData, retrieveBookingData, clearBookingData, redirectToSignIn } = useBookingPersistence();
  
  // State management
  const [currentStep, setCurrentStep] = useState<BookingStep>('form');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSelections, setRoomSelections] = useState<{ [roomId: string]: number }>({});
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 0,
    children: 0,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [roomInventory, setRoomInventory] = useState<{ [roomId: string]: { [date: string]: number } }>({});
  const [dataRestored, setDataRestored] = useState(false);
  const isRestoringData = useRef(false);

  // Fetch rooms and inventory
  useEffect(() => {
    getRoomsForProperty(property.id).then((data: Room[]) => {
      console.log('Loaded rooms:', data);
      setRooms(data);
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
    }).catch(error => {
      console.error('Error loading rooms:', error);
    });
  }, [property.id, formData.checkIn, formData.checkOut]);

  // Restore booking data
  useEffect(() => {
    if (user && !dataRestored && rooms.length > 0) {
      const bookingData = retrieveBookingData();
      if (bookingData && bookingData.propertyId === property.id) {
        isRestoringData.current = true;
        setFormData(bookingData.formData);
        setRoomSelections(bookingData.roomSelections);
        setDataRestored(true);
        setTimeout(() => {
          isRestoringData.current = false;
        }, 1000);
        toast.success('Your booking details have been restored!');
      }
    }
  }, [user, dataRestored, rooms.length, property.id, retrieveBookingData]);

  // Reset room selections when dates change
  useEffect(() => {
    if (!isRestoringData.current && (formData.checkIn || formData.checkOut)) {
      setRoomSelections({});
    }
  }, [formData.checkIn, formData.checkOut, rooms, dataRestored]);

  // Helper functions
  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    return dateDiff(formData.checkIn, formData.checkOut);
  };

  const totalRoomUnits = Object.values(roomSelections).reduce((sum, qty) => sum + qty, 0);
  const maxAdults = totalRoomUnits * MAX_CAPACITY;
  const maxChildren = totalRoomUnits * MAX_CAPACITY;
  const adults = formData.adults;
  const children = formData.children;

  // Pricing calculation (keeping the existing logic)
  const calculateTotalPrice = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    
    // If no rooms selected, calculate based on property base price with guest logic
    if (totalRoomUnits === 0) {
      const nights = calculateNights();
      let total = property.price_per_night * nights;
      
      // Apply extra adult charges if more than base allowance
      if (adults > BASE_ADULT_ALLOWANCE) {
        const extraAdults = adults - BASE_ADULT_ALLOWANCE;
        total += extraAdults * EXTRA_ADULT_PRICE * nights;
      }
      
      // Apply breakfast charges
      const chargeableAdultsForBreakfast = Math.max(0, adults - BASE_ADULT_ALLOWANCE);
      const chargeableChildrenForBreakfast = Math.max(0, children - BASE_CHILD_ALLOWANCE);
      
      total += (chargeableAdultsForBreakfast * BREAKFAST_ADULT_PRICE * nights);
      total += (chargeableChildrenForBreakfast * BREAKFAST_CHILD_PRICE * nights);
      
      return total;
    }

    try {
      // Debug logging
      console.log('Calculating total price:', {
        rooms: rooms.length,
        roomSelections,
        adults,
        children,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut
      });

      const bookingData: BookingData = {
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        categories: []
      };

      const roomGroups: { [basePrice: number]: { roomIds: string[], quantity: number } } = {};
      
      Object.entries(roomSelections).forEach(([roomId, qty]) => {
        if (qty > 0) {
          let basePrice: number;
          
          if (roomId === 'default') {
            // Use property base price for fallback
            basePrice = property.price_per_night;
            console.log('Using property base price:', basePrice);
          } else {
            const room = rooms.find(r => r.id === roomId);
            console.log('Found room:', room);
            if (room) {
              basePrice = room.price_per_night;
              console.log('Room base price:', basePrice);
            } else {
              console.log('Room not found, skipping');
              return;
            }
          }
          
          if (!roomGroups[basePrice]) {
            roomGroups[basePrice] = { roomIds: [], quantity: 0 };
          }
          roomGroups[basePrice].roomIds.push(roomId);
          roomGroups[basePrice].quantity += qty;
        }
      });

      Object.entries(roomGroups).forEach(([basePrice, group]) => {
        const category: RoomCategory = {
          basePrice: parseInt(basePrice),
          units: []
        };

        let remainingAdults = adults;
        let remainingChildren = children;

        for (let i = 0; i < group.quantity; i++) {
          const unit: UnitSelection = {
            adults: Math.min(remainingAdults, MAX_CAPACITY),
            children: Math.min(remainingChildren, MAX_CAPACITY - Math.min(remainingAdults, MAX_CAPACITY))
          };

          remainingAdults -= unit.adults;
          remainingChildren -= unit.children;

          category.units.push(unit);

          if (remainingAdults <= 0 && remainingChildren <= 0) break;
        }

        bookingData.categories.push(category);
      });

      const total = calculateBookingTotal(bookingData);
      console.log('Calculated total:', total);
      return total;
    } catch (error) {
      console.error('Error calculating total price:', error);
      return 0;
    }
  };

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

  // Step navigation
  const handleBookNow = () => {
    if (!user) {
      const bookingData = {
        formData,
        roomSelections,
        propertyId: property.id,
        timestamp: Date.now()
      };
      storeBookingData(bookingData);
      toast.success('Please sign in to complete your booking. Your details will be saved.');
      redirectToSignIn(property.id);
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (Object.values(roomSelections).every(qty => qty === 0)) {
      toast.error('Please select at least one room type and quantity');
      return;
    }

    setCurrentStep('review');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleConfirmBooking = async () => {
    setCurrentStep('payment');
    await processPayment();
  };

  // Payment processing
  const processPayment = async () => {
    const roomRequests = Object.entries(roomSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([room_id, quantity]) => ({
        room_id,
        quantity,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
      }));

    setLoading(true);
    const isAvailable = await checkMultiRoomAvailability(roomRequests);
    if (!isAvailable) {
      setLoading(false);
      toast.error('One or more selected room types are not available for the chosen dates/quantities');
      setCurrentStep('form');
      return;
    }

    const totalPrice = calculateTotalPrice();
    setPaymentInProgress(true);

    try {
      // Create order on server
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(totalPrice * 100), currency: 'INR', notes: { type: 'homestay', propertyId: property.id } }),
      });
      const { order, error } = await orderRes.json();
      if (!order) throw new Error(error || 'Failed to initialize payment');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: property.title,
        description: 'Booking Payment',
        order_id: order.id,
        handler: async function (response: { razorpay_payment_id: string }) {
          const booking = await createMultiRoomBooking({
            property_id: property.id,
            guest_id: user!.id!,
            check_in_date: formData.checkIn,
            check_out_date: formData.checkOut,
            guests_count: adults,
            total_price: totalPrice,
            special_requests: formData.specialRequests || null,
            status: 'confirmed' as BookingStatus,
          }, roomRequests, response.razorpay_payment_id);

          setPaymentInProgress(false);
          setLoading(false);

          if (booking) {
            await sendPaymentReceiptEmail({
              to: user!.email || '',
              guestName: user!.user_metadata?.full_name || user!.email || '',
              bookingType: 'Homestay',
              title: property.title,
              checkIn: formData.checkIn,
              checkOut: formData.checkOut,
              guests: adults,
              totalPrice,
              paymentRef: response.razorpay_payment_id
            });

            clearBookingData();
            toast.success(
              <span>Booking created and payment successful!<br/><span className="text-xs text-gray-500">Payment Ref: {response.razorpay_payment_id}</span></span>
            );
            router.push('/guest/dashboard');
          } else {
            toast.error('Failed to create booking after payment');
          }
        },
        prefill: {
          email: user!.email || '',
          name: user!.user_metadata?.full_name || '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            setPaymentInProgress(false);
            setLoading(false);
            setCurrentStep('review');
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
      setCurrentStep('review');
      toast.error('An error occurred while processing payment');
    }
  };

  // Pricing breakdown
  const getPricingBreakdown = () => {
    if (!formData.checkIn || !formData.checkOut) return [];
    
    const breakdown: Array<{ label: string; amount: number; type: 'base' | 'extra' | 'breakfast' }> = [];
    const nights = calculateNights();
    
    // If no rooms selected, show property base price with guest charges
    if (totalRoomUnits === 0) {
      breakdown.push({
        label: `Property Base Price (₹${property.price_per_night} × ${nights} nights)`,
        amount: property.price_per_night * nights,
        type: 'base'
      });
      
      // Add extra adult charges
      if (adults > BASE_ADULT_ALLOWANCE) {
        const extraAdults = adults - BASE_ADULT_ALLOWANCE;
        breakdown.push({
          label: `Extra Adult Charge (₹${EXTRA_ADULT_PRICE} × ${extraAdults} × ${nights} nights)`,
          amount: EXTRA_ADULT_PRICE * extraAdults * nights,
          type: 'extra'
        });
      }
      
      // Add breakfast charges
      const chargeableAdultsForBreakfast = Math.max(0, adults - BASE_ADULT_ALLOWANCE);
      const chargeableChildrenForBreakfast = Math.max(0, children - BASE_CHILD_ALLOWANCE);
      
      if (chargeableAdultsForBreakfast > 0) {
        breakdown.push({
          label: `Adult Breakfast (₹${BREAKFAST_ADULT_PRICE} × ${chargeableAdultsForBreakfast} × ${nights} nights)`,
          amount: BREAKFAST_ADULT_PRICE * chargeableAdultsForBreakfast * nights,
          type: 'breakfast'
        });
      }
      
      if (chargeableChildrenForBreakfast > 0) {
        breakdown.push({
          label: `Children Breakfast (₹${BREAKFAST_CHILD_PRICE} × ${chargeableChildrenForBreakfast} × ${nights} nights)`,
          amount: BREAKFAST_CHILD_PRICE * chargeableChildrenForBreakfast * nights,
          type: 'breakfast'
        });
      }
      
      return breakdown;
    }

    console.log('Getting pricing breakdown:', {
      rooms: rooms.length,
      roomSelections,
      nights,
      adults,
      children
    });

    Object.entries(roomSelections).forEach(([roomId, qty]) => {
      if (qty > 0) {
        let roomName: string;
        let roomPrice: number;
        
        if (roomId === 'default') {
          // Use property base price for fallback
          roomName = 'Standard Room';
          roomPrice = property.price_per_night;
          console.log('Using property price for breakdown:', roomPrice);
        } else {
          const room = rooms.find(r => r.id === roomId);
          console.log('Room for breakdown:', room);
          if (room) {
            roomName = room.name;
            roomPrice = room.price_per_night;
          } else {
            console.log('Room not found for breakdown, skipping');
            return;
          }
        }
        
        const roomTotal = roomPrice * qty * nights;
        console.log('Room total:', roomTotal);
        breakdown.push({
          label: `${roomName} (₹${roomPrice} × ${qty} × ${nights} nights)`,
          amount: roomTotal,
          type: 'base'
        });
      }
    });

    const totalBaseAdultAllowance = totalRoomUnits * BASE_ADULT_ALLOWANCE;
    if (adults > totalBaseAdultAllowance) {
      const extraAdults = adults - totalBaseAdultAllowance;
      breakdown.push({
        label: `Extra Adult Charge (₹${EXTRA_ADULT_PRICE} × ${extraAdults} × ${nights} nights)`,
        amount: EXTRA_ADULT_PRICE * extraAdults * nights,
        type: 'extra'
      });
    }

    const totalBaseChildAllowance = totalRoomUnits * BASE_CHILD_ALLOWANCE;
    const chargeableAdultsForBreakfast = Math.max(0, adults - totalBaseAdultAllowance);
    const chargeableChildrenForBreakfast = Math.max(0, children - totalBaseChildAllowance);

    if (chargeableAdultsForBreakfast > 0) {
      breakdown.push({
        label: `Adult Breakfast (₹${BREAKFAST_ADULT_PRICE} × ${chargeableAdultsForBreakfast} × ${nights} nights)`,
        amount: BREAKFAST_ADULT_PRICE * chargeableAdultsForBreakfast * nights,
        type: 'breakfast'
      });
    }

    if (chargeableChildrenForBreakfast > 0) {
      breakdown.push({
        label: `Children Breakfast (₹${BREAKFAST_CHILD_PRICE} × ${chargeableChildrenForBreakfast} × ${nights} nights)`,
        amount: BREAKFAST_CHILD_PRICE * chargeableChildrenForBreakfast * nights,
        type: 'breakfast'
      });
    }

    return breakdown;
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();
  const pricingBreakdown = getPricingBreakdown();

  // Use the calculated price (no fallback needed since we handle all cases now)
  const displayPrice = totalPrice;

  // Debug logging for price display
  console.log('Price calculation debug:', {
    nights,
    totalPrice,
    displayPrice,
    pricingBreakdown,
    formData,
    roomSelections,
    adults,
    children,
    rooms: rooms.length,
    propertyPrice: property.price_per_night,
    totalRoomUnits,
    BASE_ADULT_ALLOWANCE,
    BASE_CHILD_ALLOWANCE
  });

  // Render different steps
  if (currentStep === 'review') {
    return (
      <>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <Card className="sticky top-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Review & Confirm Booking</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToForm}
                disabled={loading}
              >
                ← Back to Form
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Info */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-2">{property.title}</h4>
              <p className="text-gray-600">{property.address}</p>
            </div>

            {/* Booking Summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-in</label>
                  <p className="text-sm">{format(new Date(formData.checkIn), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-out</label>
                  <p className="text-sm">{format(new Date(formData.checkOut), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Guests</label>
                <p className="text-sm">{adults} Adults, {children} Children</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Rooms Selected</label>
                <div className="space-y-2">
                  {Object.entries(roomSelections).map(([roomId, qty]) => {
                    if (qty > 0) {
                      const room = rooms.find(r => r.id === roomId);
                      return (
                        <div key={roomId} className="flex justify-between text-sm">
                          <span>{room?.name}</span>
                          <span>Qty: {qty}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {formData.specialRequests && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Special Requests</label>
                  <p className="text-sm text-gray-600">{formData.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Price Breakdown</h4>
              <div className="space-y-2">
                {pricingBreakdown.map((item, index) => (
                  <div key={index} className={`flex justify-between text-sm ${
                    item.type === 'extra' ? 'text-red-700' : 
                    item.type === 'breakfast' ? 'text-yellow-700' : 
                    'text-gray-700'
                  }`}>
                    <span>{item.label}</span>
                    <span>₹{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-3">
                <span>Total</span>
                <span>₹{displayPrice}</span>
              </div>
            </div>

            <Button
              onClick={handleConfirmBooking}
              loading={loading || paymentInProgress}
              className="w-full"
              size="lg"
            >
              Confirm Booking & Pay
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  // Main booking form
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
          {/* Base Price Display */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">₹{property.price_per_night}</span>
            <span className="text-gray-600">per night</span>
          </div>
          <LiveRating 
            propertyId={property.id}
            propertyTitle={property.title}
            size="sm"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Select Dates</label>
            <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Room Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Select Rooms</label>
            <div className="space-y-3">
              {rooms.length > 0 ? (
                rooms.map(room => {
                  const maxAvailable = 2;
                  return (
                    <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{room.name}</div>
                        <div className="text-xs text-gray-500">{room.room_type}</div>
                        <div className="text-green-700 font-bold">₹{room.price_per_night}/night</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Qty:</label>
                        <select
                          value={roomSelections[room.id] || 0}
                          onChange={e => handleRoomQuantityChange(room.id, Number(e.target.value))}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {Array.from({ length: maxAvailable + 1 }, (_, i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback when no rooms are available - use property base price
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">Standard Room</div>
                    <div className="text-xs text-gray-500">Default</div>
                    <div className="text-green-700 font-bold">₹{property.price_per_night}/night</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Qty:</label>
                    <select
                      value={roomSelections['default'] || 0}
                      onChange={e => handleRoomQuantityChange('default', Number(e.target.value))}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 3 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guest Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Guests</label>
            <GuestSelector
              value={{ adults: adults, children: formData.children }}
              onChange={(val) => setFormData({ ...formData, ...val })}
              showRoomsSelector={false}
              maxAdults={maxAdults}
              maxChildren={maxChildren}
            />
            {totalRoomUnits > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Guest limits: {totalRoomUnits * BASE_ADULT_ALLOWANCE} adults + {totalRoomUnits * BASE_CHILD_ALLOWANCE} children included, 
                extra adults ₹{EXTRA_ADULT_PRICE}/night, breakfast charges apply
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
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

          {/* Price Estimate */}
          {nights > 0 && totalPrice > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Estimated Total</span>
                <span className="text-xl font-bold">₹{displayPrice}</span>
              </div>
              <div className="text-xs text-gray-500">
                {nights} night{nights > 1 ? 's' : ''} • {totalRoomUnits} room{totalRoomUnits > 1 ? 's' : ''} • {adults + children} guest{adults + children > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <Button
            onClick={handleBookNow}
            loading={loading}
            className="w-full"
            size="lg"
            disabled={!formData.checkIn || !formData.checkOut || Object.values(roomSelections).every(qty => qty === 0)}
          >
            Book Now
          </Button>

          {!user && (
            <p className="text-sm text-gray-600 text-center">
              You need to be signed in to book this property
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
} 