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
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Prepare room booking data
    const roomBookings = Object.entries(roomSelections as Record<string, number>)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([roomId, qty]) => ({
        room_id: roomId,
        quantity: qty as number,
        check_in: checkIn,
        check_out: checkOut,
      }));

    // Create the booking using new schema
    const booking = await createMultiRoomBooking(
      {
        user_id: user.id, // Changed from guest_id
        booking_type: 'property' as const, // New field - enum
        item_id: propertyId, // Changed from property_id
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: adults + children,
        total_price: totalPrice,
        status: 'pending' as const, // Enum value
        special_requests: guestInfo.specialRequests || null,
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