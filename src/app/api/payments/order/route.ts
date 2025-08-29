import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

// Create a Razorpay order on the server to avoid exposing the secret
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Payment order API called');
    const { amount, currency = 'INR', receipt, notes } = await req.json();
    console.log('🔍 Request data:', { amount, currency, receipt, notes });

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log('🔍 Environment check:', { 
      hasKeyId: !!keyId, 
      hasKeySecret: !!keySecret,
      keyIdLength: keyId?.length,
      keySecretLength: keySecret?.length
    });

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing:', { keyId: !!keyId, keySecret: !!keySecret });
      return NextResponse.json(
        { error: 'Razorpay server keys are not configured' },
        { status: 500 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid amount:', amount);
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

    console.log('🔍 Creating Razorpay order with payload:', orderPayload);

    const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    console.log('🔍 Razorpay API response status:', rpRes.status);

    if (!rpRes.ok) {
      const errText = await rpRes.text();
      console.error('Razorpay API error:', errText);
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', details: errText },
        { status: 500 }
      );
    }

    const order = await rpRes.json();
    console.log('🔍 Razorpay order created successfully:', order.id);
    return NextResponse.json({ order });
  } catch (error) {
    console.error('🔍 Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


