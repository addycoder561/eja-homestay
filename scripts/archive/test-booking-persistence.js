// Test script to check booking persistence in session storage
// Run this in the browser console to debug booking data storage

console.log('=== Booking Persistence Debug Script ===');

// Check if there's any stored booking data
const storedData = sessionStorage.getItem('pendingBooking');
console.log('Stored booking data:', storedData);

if (storedData) {
  try {
    const parsedData = JSON.parse(storedData);
    console.log('Parsed booking data:', parsedData);
    console.log('Form data:', parsedData.formData);
    console.log('Room selections:', parsedData.roomSelections);
    console.log('Property ID:', parsedData.propertyId);
    console.log('Timestamp:', new Date(parsedData.timestamp));
    
    // Check if data is still valid (within 1 hour)
    const isExpired = Date.now() - parsedData.timestamp > 60 * 60 * 1000;
    console.log('Data expired:', isExpired);
    
    // Check if room selections have any values
    const hasRoomSelections = Object.values(parsedData.roomSelections).some(qty => qty > 0);
    console.log('Has room selections:', hasRoomSelections);
    console.log('Room selection details:', parsedData.roomSelections);
    
  } catch (error) {
    console.error('Error parsing stored data:', error);
  }
} else {
  console.log('No stored booking data found');
}

// Function to clear stored data
window.clearBookingData = () => {
  sessionStorage.removeItem('pendingBooking');
  console.log('Booking data cleared');
};

// Function to manually set test data
window.setTestBookingData = () => {
  const testData = {
    formData: {
      checkIn: '2024-12-25',
      checkOut: '2024-12-27',
      rooms: 1,
      adults: 2,
      children: 0,
      specialRequests: 'Test request'
    },
    roomSelections: {
      'test-room-id': 1
    },
    propertyId: 'test-property-id',
    timestamp: Date.now()
  };
  
  sessionStorage.setItem('pendingBooking', JSON.stringify(testData));
  console.log('Test booking data set:', testData);
};

console.log('Available functions:');
console.log('- clearBookingData(): Clear stored booking data');
console.log('- setTestBookingData(): Set test booking data'); 