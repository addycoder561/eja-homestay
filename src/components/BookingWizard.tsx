'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GuestSelector } from './GuestSelector';
import { RoomSelector } from './RoomSelector';
import { DateSelector } from './DateSelector';
import { PaymentSummary } from './PaymentSummary';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useBookingWizardPersistence } from '@/hooks/useBookingWizardPersistence';

interface BookingWizardProps {
  property: any;
  onClose: () => void;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomSelections: { [roomId: string]: number };
  guestInfo: {
    name: string;
    email: string;
    phone: string;
    specialRequests: string;
  };
}

const STEPS = [
  { id: 1, title: 'Dates & Rooms', description: 'Select dates and choose rooms' },
  { id: 2, title: 'Guests & Details', description: 'Number of guests and contact info' },
  { id: 3, title: 'Review', description: 'Review & confirm' },
];

export function BookingWizard({ property, onClose }: BookingWizardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  
  // Use persistence hook
  const { data: bookingData, updateData, clearData } = useBookingWizardPersistence(property.id);
  
  // Initialize guest info with user data if available
  useEffect(() => {
    if (user && (!bookingData.guestInfo.name || !bookingData.guestInfo.email)) {
      updateData({
        guestInfo: {
          ...bookingData.guestInfo,
          name: user.user_metadata?.full_name || bookingData.guestInfo.name,
          email: user.email || bookingData.guestInfo.email,
        }
      });
    }
  }, [user, bookingData.guestInfo, updateData]);

  // Load rooms for the property
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await fetch(`/api/properties/${property.id}/rooms`);
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    };
    loadRooms();
  }, [property.id]);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const nights = (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24);
    let total = 0;

    // Calculate room prices
    Object.entries(bookingData.roomSelections).forEach(([roomId, qty]) => {
      if (qty > 0) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          total += nights * room.price_per_night * qty;
        }
      }
    });

    // Calculate extra adult charges
    const totalRoomUnits = Object.values(bookingData.roomSelections).reduce((sum, qty) => sum + qty, 0);
    const maxBaseGuests = totalRoomUnits * 2;
    if (bookingData.adults > maxBaseGuests) {
      const extraAdults = bookingData.adults - maxBaseGuests;
      total += nights * 1500 * extraAdults; // ₹1500 per extra adult
    }

    // Children breakfast charge
    if (bookingData.children > 0) {
      total += nights * 250 * bookingData.children; // ₹250 per child per night
    }

    return total;
  }, [bookingData, rooms]);

  // Validate current step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return bookingData.checkIn && bookingData.checkOut && Object.values(bookingData.roomSelections).some(qty => qty > 0);
      case 2:
        return bookingData.adults > 0 && bookingData.guestInfo.name && bookingData.guestInfo.email && bookingData.guestInfo.phone;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle booking submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to complete your booking');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          adults: bookingData.adults,
          children: bookingData.children,
          roomSelections: bookingData.roomSelections,
          guestInfo: bookingData.guestInfo,
          totalPrice: calculateTotalPrice(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Booking submitted successfully!');
        clearData(); // Clear stored booking data
        onClose();
        router.push(`/guest/dashboard`);
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Date Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Stay Dates</h3>
              <DateSelector
                checkIn={bookingData.checkIn}
                checkOut={bookingData.checkOut}
                onDatesChange={(checkIn, checkOut) => 
                  updateData({ checkIn, checkOut })
                }
              />
            </div>
            
            {/* Right side - Room Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Rooms</h3>
              <RoomSelector
                rooms={rooms}
                selections={bookingData.roomSelections}
                checkIn={bookingData.checkIn}
                checkOut={bookingData.checkOut}
                onSelectionsChange={(selections) => 
                  updateData({ roomSelections: selections })
                }
              />
            </div>
          </div>
        );
        
      case 2:
        const totalRoomUnits = Object.values(bookingData.roomSelections).reduce((sum, qty) => sum + qty, 0);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Guest Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Number of Guests</h3>
              <p className="text-gray-600 mb-6">
                Choose the number of adults and children for your stay.
              </p>
              <GuestSelector
                value={{ adults: bookingData.adults, children: bookingData.children }}
                onChange={(value) => 
                  updateData({ adults: value.adults, children: value.children })
                }
                showRoomsSelector={false}
                maxAdults={totalRoomUnits > 0 ? totalRoomUnits * 3 : 3}
                maxChildren={totalRoomUnits > 0 ? totalRoomUnits * 2 : 2}
              />
            </div>
            
            {/* Right side - Guest Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
              <p className="text-gray-600 mb-6">
                Please provide your contact information for the booking.
              </p>
              <GuestInfoForm
                guestInfo={bookingData.guestInfo}
                onGuestInfoChange={(guestInfo: BookingData['guestInfo']) => 
                  updateData({ guestInfo })
                }
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <PaymentSummary
            property={property}
            bookingData={bookingData}
            rooms={rooms}
            totalPrice={calculateTotalPrice()}
            nights={bookingData.checkIn && bookingData.checkOut ? 
              (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24) : 0
            }
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Book Your Stay</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {currentStep < STEPS.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateCurrentStep()}
                  className="flex items-center"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !validateCurrentStep()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Guest Information Form Component
type GuestInfo = BookingData['guestInfo'];
function GuestInfoForm({ guestInfo, onGuestInfoChange }: { guestInfo: GuestInfo; onGuestInfoChange: (info: GuestInfo) => void }) {
  return (
    <div className="space-y-4">
      <Input
        label="Full Name"
        value={guestInfo.name}
        onChange={(e) => onGuestInfoChange({ ...guestInfo, name: e.target.value })}
        required
      />
      
      <Input
        label="Email"
        type="email"
        value={guestInfo.email}
        onChange={(e) => onGuestInfoChange({ ...guestInfo, email: e.target.value })}
        required
      />
      
      <Input
        label="Phone Number"
        value={guestInfo.phone}
        onChange={(e) => onGuestInfoChange({ ...guestInfo, phone: e.target.value })}
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests
        </label>
        <textarea
          value={guestInfo.specialRequests}
          onChange={(e) => onGuestInfoChange({ ...guestInfo, specialRequests: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Any special requests or preferences..."
        />
      </div>
    </div>
  );
} 