import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface BookingData {
  formData: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
    specialRequests: string;
  };
  roomSelections: { [roomId: string]: number };
  propertyId: string;
  timestamp: number;
}

export function useBookingPersistence() {
  const { user, onAuthSuccess } = useAuth();
  const router = useRouter();

  // Store booking data when user is not authenticated
  const storeBookingData = useCallback((bookingData: BookingData) => {
    console.log('Storing booking data:', bookingData);
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
  }, []);

  // Retrieve and clear booking data
  const retrieveBookingData = useCallback((): BookingData | null => {
    const stored = sessionStorage.getItem('pendingBooking');
    if (!stored) {
      console.log('No stored booking data found');
      return null;
    }

    try {
      const data: BookingData = JSON.parse(stored);
      console.log('Retrieved booking data:', data);
      
      // Check if data is not too old (within 1 hour)
      if (Date.now() - data.timestamp > 60 * 60 * 1000) {
        console.log('Booking data is too old, clearing');
        sessionStorage.removeItem('pendingBooking');
        return null;
      }

      // Clear the stored data
      sessionStorage.removeItem('pendingBooking');
      return data;
    } catch (error) {
      console.error('Error parsing stored booking data:', error);
      sessionStorage.removeItem('pendingBooking');
      return null;
    }
  }, []);

  // Clear booking data
  const clearBookingData = useCallback(() => {
    sessionStorage.removeItem('pendingBooking');
  }, []);

  // Redirect to sign in with booking data stored
  const redirectToSignIn = useCallback((propertyId: string) => {
    const redirectUrl = `/auth/signin?redirect=/property/${propertyId}`;
    router.push(redirectUrl);
  }, [router]);

  // Set up auth success callback to restore booking data
  useEffect(() => {
    if (!user) {
      const bookingData = retrieveBookingData();
      if (bookingData) {
        // If we have stored booking data and user is not authenticated,
        // set up a callback to restore it after authentication
        onAuthSuccess(() => {
          // After successful authentication, redirect back to the property page
          // The BookingForm component will handle restoring the data
          router.push(`/property/${bookingData.propertyId}`);
        });
      }
    }
  }, [user, onAuthSuccess, router, retrieveBookingData]);

  return {
    storeBookingData,
    retrieveBookingData,
    clearBookingData,
    redirectToSignIn,
  };
} 