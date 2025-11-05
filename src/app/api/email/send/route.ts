import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'EJA <bookings@ejastays.com>',
      to: [to],
      subject: subject,
      html: html,
      text: text || subject,
      replyTo: 'bookings@ejastays.com',
      // Add headers to improve deliverability
      headers: {
        'X-Entity-Ref-ID': `booking-${Date.now()}`,
        'List-Unsubscribe': '<https://ejastays.com/unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      // Add tags for better tracking and categorization
      tags: [
        {
          name: 'category',
          value: 'transactional',
        },
        {
          name: 'type',
          value: 'booking-confirmation',
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Email sent successfully via Resend:', data?.id);
    return NextResponse.json({ 
      success: true, 
      id: data?.id,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

