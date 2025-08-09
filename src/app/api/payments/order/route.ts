import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

// Create a Razorpay order on the server to avoid exposing the secret
export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay server keys are not configured' },
        { status: 500 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount (in paise) is required' },
        { status: 400 }
      );
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const orderPayload: any = {
      amount, // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };
    if (notes && typeof notes === 'object') orderPayload.notes = notes;

    const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!rpRes.ok) {
      const errText = await rpRes.text();
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', details: errText },
        { status: 500 }
      );
    }

    const order = await rpRes.json();
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


