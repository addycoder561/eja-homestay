import { NextRequest, NextResponse } from 'next/server';

// API route for sending emails (server-side only - environment variables safe)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, from } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // If Resend API key is not set, return success (development mode)
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Email logged (Resend API key not configured)' 
      });
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from || process.env.RESEND_FROM_EMAIL || 'EJA <noreply@ejastays.com>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    
    return NextResponse.json({ 
      success: true, 
      id: data.id 
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

