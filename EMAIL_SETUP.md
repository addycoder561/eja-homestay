# Email Notification Setup Guide

## ✅ Setup Complete Checklist

You've completed these steps:
- [x] Created Resend account
- [x] Generated API key
- [x] Verified domain in Resend
- [x] Added `RESEND_API_KEY` to `.env.local`
- [x] Added `RESEND_API_KEY` to Vercel Environment Variables

## 🔧 Final Step: Update From Email Address

Since you've verified your domain, you should update the "from" email address to use your verified domain instead of the default.

### Option 1: Add Environment Variable (Recommended)

Add this to your `.env.local`:
```
RESEND_FROM_EMAIL=EJA <bookings@ejastays.com>
```

And to Vercel Environment Variables:
- Key: `RESEND_FROM_EMAIL`
- Value: `EJA <bookings@ejastays.com>`

### Option 2: Code Already Updated

The code has been updated to use `ejastays.com` as the default. If you want to use a different email address (like `bookings@ejastays.com`), you can set the `RESEND_FROM_EMAIL` environment variable.

## 🧪 Testing

1. **Restart your dev server** (if running locally):
   ```bash
   npm run dev
   ```

2. **Make a test booking** - The email should be sent from your verified domain

3. **Check your inbox** - You should receive the payment receipt email

4. **Check Resend Dashboard**:
   - Go to Resend dashboard → Emails
   - You should see sent emails with status
   - Check for any bounces or errors

## 📧 Email Templates

The system sends:
- **Payment Receipt Email**: Automatically sent after successful booking payment
- Includes booking details, payment reference, and all booking information

## 🔍 Troubleshooting

### Emails not sending?
1. Check Vercel logs for errors
2. Verify API key is correct in Vercel environment variables
3. Check Resend dashboard for delivery status
4. Verify domain is fully verified in Resend (all DNS records passed)

### Testing locally?
- Make sure `.env.local` has `RESEND_API_KEY`
- Restart dev server after adding environment variable
- Check console logs for any errors

### Emails going to spam?
- Make sure your domain is verified in Resend
- Check SPF, DKIM, and DMARC records are set up correctly
- Use a "from" address from your verified domain

## 📝 Next Steps

1. ✅ Update `RESEND_FROM_EMAIL` environment variable with your verified domain
2. ✅ Test email sending with a booking
3. ✅ Verify emails are received
4. ✅ Check Resend dashboard for delivery metrics
