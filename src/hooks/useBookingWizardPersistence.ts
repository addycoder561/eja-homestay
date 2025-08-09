import { useState, useEffect } from 'react';

interface BookingWizardData {
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

const STORAGE_KEY = 'booking-wizard-data';

export function useBookingWizardPersistence(propertyId: string) {
  const [data, setData] = useState<BookingWizardData>({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    roomSelections: {},
    guestInfo: {
      name: '',
      email: '',
      phone: '',
      specialRequests: '',
    },
  });

  // Load data from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(`${STORAGE_KEY}-${propertyId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch (error) {
        console.error('Error parsing stored booking data:', error);
      }
    }
  }, [propertyId]);

  // Save data to session storage whenever it changes
  const updateData = (newData: Partial<BookingWizardData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    sessionStorage.setItem(`${STORAGE_KEY}-${propertyId}`, JSON.stringify(updated));
  };

  // Clear stored data
  const clearData = () => {
    sessionStorage.removeItem(`${STORAGE_KEY}-${propertyId}`);
    setData({
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      roomSelections: {},
      guestInfo: {
        name: '',
        email: '',
        phone: '',
        specialRequests: '',
      },
    });
  };

  return {
    data,
    updateData,
    clearData,
  };
} 