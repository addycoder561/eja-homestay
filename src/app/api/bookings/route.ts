import { NextRequest, NextResponse } from 'next/server';
import { createMultiRoomBooking } from '@/lib/database';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      roomSelections,
      guestInfo,
      totalPrice,
    } = body;

    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !adults || !guestInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current user via server-side client (reads auth cookies)
    const supabase = getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Prepare room booking data
    const roomBookings = Object.entries(roomSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([roomId, qty]) => ({
        room_id: roomId,
        quantity: qty as number,
        check_in: checkIn,
        check_out: checkOut,
      }));

    // Create the booking
    const booking = await createMultiRoomBooking(
      {
        property_id: propertyId,
        guest_id: user.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: adults + children,
        total_price: totalPrice,
        status: 'pending',
        special_requests: guestInfo.specialRequests || '',
      },
      roomBookings
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 