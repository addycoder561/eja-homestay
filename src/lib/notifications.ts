// Email notification service using Resend
// For production: Set up Resend API key in environment variables
// Uses API route to securely access environment variables

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Send email using API route (server-side only - environment variables safe)
async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email API error:', error);
      throw new Error(error.error || 'Failed to send email');
    }

    const data = await response.json();
    
    // Log in development if API key not configured
    if (data.message && data.message.includes('not configured')) {
      console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendBookingConfirmationEmail({ 
  to, 
  guestName, 
  propertyTitle, 
  checkIn, 
  checkOut 
}: { 
  to: string; 
  guestName: string; 
  propertyTitle: string; 
  checkIn: string; 
  checkOut: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">EJA Homestay</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #F59E0B; margin-top: 0;">Booking Confirmed! 🎉</h2>
        <p>Dear ${guestName},</p>
        <p>Your booking has been confirmed successfully!</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
          <p><strong>Property:</strong> ${propertyTitle}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
        </div>
        
        <p>We look forward to hosting you! If you have any questions, please don't hesitate to contact us.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The EJA Homestay Team</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Booking Confirmed - ${propertyTitle}`,
    html,
  });
}

export async function sendBookingConfirmationSMS({ 
  to, 
  guestName, 
  propertyTitle, 
  checkIn, 
  checkOut 
}: { 
  to: string; 
  guestName: string; 
  propertyTitle: string; 
  checkIn: string; 
  checkOut: string;
}) {
  // SMS functionality - implement with Twilio or similar service
  console.log(`[SMS] To: ${to} | Booking Confirmed for ${guestName} at ${propertyTitle} (${checkIn} - ${checkOut})`);
  return { success: true, message: 'SMS stub (not implemented)' };
}

export async function sendPaymentReceiptEmail({ 
  to, 
  guestName, 
  bookingType, 
  title, 
  checkIn, 
  checkOut, 
  guests, 
  totalPrice, 
  paymentRef 
}: { 
  to: string; 
  guestName: string; 
  bookingType: string; 
  title: string; 
  checkIn: string; 
  checkOut: string; 
  guests: number; 
  totalPrice: number; 
  paymentRef: string;
}) {
  const bookingTypeLabel = bookingType === 'property' ? 'Homestay' : 
                           bookingType === 'experience' ? 'Experience' : 
                           bookingType === 'retreat' ? 'Retreat' : 'Booking';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">EJA Homestay</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #F59E0B; margin-top: 0;">Payment Receipt ✅</h2>
        <p>Dear ${guestName},</p>
        <p>Thank you for your booking! Your payment has been received successfully.</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Type:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${bookingTypeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Title:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${checkIn}${checkIn !== checkOut ? ` - ${checkOut}` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Guests:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${guests}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 18px; font-weight: bold; color: #F59E0B;">₹${totalPrice.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Payment Reference:</strong></td>
              <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${paymentRef}</td>
            </tr>
          </table>
        </div>
        
        <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
          <strong>📧 Save this email</strong> as your receipt. You can also view your booking details in your dashboard.
        </p>
        
        <p style="margin-top: 30px;">We look forward to hosting you! If you have any questions, please don't hesitate to contact us.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The EJA Homestay Team</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
        <p>This is an automated email. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Payment Receipt - ${title} | ₹${totalPrice.toLocaleString('en-IN')}`,
    html,
  });
}
