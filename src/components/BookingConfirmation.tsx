"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface BookingConfirmationProps {
  booking: {
    id: string;
    property: {
      title: string;
      location: string;
      city: string;
      state: string;
      cover_image: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    bookingDate: string;
    status: 'confirmed' | 'pending' | 'cancelled';
  };
  onClose: () => void;
}

export default function BookingConfirmation({ booking, onClose }: BookingConfirmationProps) {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircleSolid className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your homestay reservation has been successfully created</p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{booking.property.title}</h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span>{booking.property.location}, {booking.property.city}, {booking.property.state}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </span>
                  <span className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</div>
                <div className="text-sm text-gray-500">Total amount</div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status === 'confirmed' ? '✓ Confirmed' : 
                   booking.status === 'pending' ? '⏳ Pending' : '✗ Cancelled'}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Booking ID: #{booking.id.slice(-8).toUpperCase()}
              </div>
            </div>

            {/* Toggle Details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-900">Booking Details</span>
              <ArrowRightIcon className={`w-5 h-5 text-gray-500 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded Details */}
            {showDetails && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Check-in:</span>
                    <div className="font-medium">{formatDate(booking.checkIn)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out:</span>
                    <div className="font-medium">{formatDate(booking.checkOut)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <div className="font-medium">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Booking Date:</span>
                    <div className="font-medium">{formatDate(booking.bookingDate)}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => {
              onClose();
              router.push('/guest/dashboard');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            View My Bookings
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                onClose();
                router.push('/search');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Browse More
            </Button>
            
            <Button
              onClick={onClose}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at support@ejahomestay.com
          </p>
        </div>
      </div>
    </div>
  );
}
