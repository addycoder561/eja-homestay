# Razorpay Payment Gateway Setup Guide

This guide explains how to configure Razorpay payment gateway with production API keys.

## Environment Variables Required

You need to set the following environment variables in your `.env.local` file (or your hosting platform's environment variables):

### Frontend (Public Key)
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```
- This is your **Razorpay Key ID** (starts with `rzp_live_` for production)
- This key is safe to expose in the frontend
- Used in client-side components to initialize Razorpay checkout

### Backend (Secret Key)
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- **RAZORPAY_KEY_ID**: Your Razorpay Key ID (same as above)
- **RAZORPAY_KEY_SECRET**: Your Razorpay Key Secret (starts with `rzp_live_` for production)
- These keys are **NEVER** exposed to the frontend
- Used in server-side API routes (`/api/payments/order`) to create orders

## Getting Production Keys from Razorpay

1. **Log in to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com/
   - Sign in with your account

2. **Navigate to Settings**
   - Click on **Settings** → **API Keys** in the sidebar

3. **Activate Live Mode**
   - Switch from **Test Mode** to **Live Mode**
   - You may need to complete KYC verification first

4. **Generate/Copy Keys**
   - Your **Key ID** will be displayed (starts with `rzp_live_`)
   - Click **Generate Secret** or **Reveal** to get your **Key Secret**
   - **Important**: Save the Key Secret immediately, as it won't be shown again

5. **Update Environment Variables**
   - Add the production keys to your `.env.local` file
   - For production deployment (Vercel, etc.), add them in your platform's environment variables settings

## Test vs Production Keys

### Test Keys (Development)
- Key ID starts with: `rzp_test_`
- Key Secret starts with: `rzp_test_`
- Used for testing without real payments
- Transactions don't actually process money

### Production Keys (Live)
- Key ID starts with: `rzp_live_`
- Key Secret starts with: `rzp_live_`
- Used for real transactions
- **WARNING**: Transactions process real money!

## Security Best Practices

1. **Never commit keys to Git**
   - Ensure `.env.local` is in your `.gitignore`
   - Never push API keys to version control

2. **Use different keys for different environments**
   - Test keys for development/staging
   - Production keys for live/production

3. **Rotate keys periodically**
   - Generate new keys in Razorpay Dashboard
   - Update environment variables
   - Old keys will stop working after rotation

4. **Key Secret is sensitive**
   - Never expose `RAZORPAY_KEY_SECRET` in frontend code
   - Only use it in server-side API routes

## Verifying Configuration

After setting up production keys:

1. **Check environment variables are loaded**
   - Server-side: Check logs in `/api/payments/order` route
   - Client-side: Check browser console (should not show test key fallback)

2. **Test with small amount**
   - Use Razorpay's test cards for initial verification
   - Test card: `4111 1111 1111 1111` (any future expiry, any CVV)

3. **Monitor Razorpay Dashboard**
   - Check payments are being created in Live Mode
   - Verify transaction status

## Troubleshooting

### "Razorpay server keys are not configured"
- Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Ensure they're in the correct environment (local vs production)
- Restart your development server after adding keys

### "Payment gateway not loaded"
- Check that `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify Razorpay checkout script is loading (check Network tab)
- Ensure script tag is present: `<Script src="https://checkout.razorpay.com/v1/checkout.js" />`

### Payment fails with authentication error
- Verify Key ID and Key Secret match
- Ensure you're using Live Mode keys in production
- Check keys are not expired or revoked in Razorpay Dashboard

## Support

For Razorpay-specific issues:
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/

