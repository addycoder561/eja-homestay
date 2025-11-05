// Email notifications using Resend API

interface SendPaymentReceiptEmailParams {
  to: string;
  guestName: string;
  bookingType: string;
  title: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  paymentRef: string;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

function generatePaymentReceiptHTML(params: SendPaymentReceiptEmailParams): string {
  const { guestName, bookingType, title, checkIn, checkOut, guests, totalPrice, paymentRef } = params;
  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);
  const bookingTypeLabel = bookingType === 'property' ? 'Homestay' : bookingType === 'experience' ? 'Experience' : 'Retreat';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - EJA</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">EJA</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">ejastays.com</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #F59E0B; margin-top: 0; font-size: 24px;">Payment Receipt Confirmed</h2>
    
    <p style="font-size: 16px;">Dear ${guestName},</p>
    
    <p style="font-size: 16px;">Thank you for your booking with EJA! Your payment has been successfully processed.</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #1f2937; margin-top: 0; font-size: 18px; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">Booking Details</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold; width: 40%;">Booking Type:</td>
          <td style="padding: 8px 0; color: #1f2937;">${bookingTypeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Title:</td>
          <td style="padding: 8px 0; color: #1f2937;">${title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Check-in Date:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formattedCheckIn}</td>
        </tr>
        ${checkIn !== checkOut ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Check-out Date:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formattedCheckOut}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Number of Guests:</td>
          <td style="padding: 8px 0; color: #1f2937;">${guests}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total Amount:</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold; color: #F59E0B;">₹${totalPrice.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Payment Reference:</td>
          <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${paymentRef}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">We look forward to hosting you! If you have any questions or need assistance, please don't hesitate to contact us.</p>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Best regards,</p>
      <p style="font-size: 14px; color: #6b7280; margin: 5px 0; font-weight: bold;">The EJA Team</p>
      <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">ejastays.com</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 5px 0;">This is an automated email. Please do not reply to this email.</p>
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} EJA. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function generatePaymentReceiptText(params: SendPaymentReceiptEmailParams): string {
  const { guestName, bookingType, title, checkIn, checkOut, guests, totalPrice, paymentRef } = params;
  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);
  const bookingTypeLabel = bookingType === 'property' ? 'Homestay' : bookingType === 'experience' ? 'Experience' : 'Retreat';
  
  return `
EJA - Payment Receipt Confirmed
ejastays.com

Dear ${guestName},

Thank you for your booking with EJA! Your payment has been successfully processed.

Booking Details:
- Booking Type: ${bookingTypeLabel}
- Title: ${title}
- Check-in Date: ${formattedCheckIn}
${checkIn !== checkOut ? `- Check-out Date: ${formattedCheckOut}\n` : ''}
- Number of Guests: ${guests}
- Total Amount: ₹${totalPrice.toLocaleString('en-IN')}
- Payment Reference: ${paymentRef}

We look forward to hosting you! If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
The EJA Team
ejastays.com

---
This is an automated email. Please do not reply to this email.
© ${new Date().getFullYear()} EJA. All rights reserved.
  `.trim();
}

export async function sendBookingConfirmationEmail({ to, guestName, propertyTitle, checkIn, checkOut }: { to: string; guestName: string; propertyTitle: string; checkIn: string; checkOut: string }) {
  try {
    // Get the base URL for API calls
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: `Booking Confirmed - ${propertyTitle}`,
        html: generatePaymentReceiptHTML({
          to,
          guestName,
          bookingType: 'property',
          title: propertyTitle,
          checkIn,
          checkOut,
          guests: 1,
          totalPrice: 0,
          paymentRef: 'N/A'
        }),
        text: `Booking Confirmed for ${guestName} at ${propertyTitle} (${checkIn} - ${checkOut})`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email send error:', error);
    } else {
      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
    }
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
}

export async function sendBookingConfirmationSMS({ to, guestName, propertyTitle, checkIn, checkOut }: { to: string; guestName: string; propertyTitle: string; checkIn: string; checkOut: string }) {
  // Replace with SMS service (e.g., Twilio)
  console.log(`[SMS] To: ${to} | Booking Confirmed for ${guestName} at ${propertyTitle} (${checkIn} - ${checkOut})`);
}

export async function sendPaymentReceiptEmail(params: SendPaymentReceiptEmailParams) {
  try {
    const { to } = params;
    
    // Get the base URL for API calls
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: `Payment Receipt - ${params.title} Booking Confirmed`,
        html: generatePaymentReceiptHTML(params),
        text: generatePaymentReceiptText(params)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Error sending payment receipt email:', error);
    // Don't throw - email failure shouldn't break the booking flow
  }
}
