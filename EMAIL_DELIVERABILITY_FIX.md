# Email Deliverability Fix Guide

## Why Emails Go to Spam

Emails land in spam primarily due to missing email authentication (SPF, DKIM, DMARC) and domain reputation issues.

## Critical Steps to Fix Spam Issues

### 1. Verify DNS Records in Resend

**Check in Resend Dashboard:**
1. Go to your Resend dashboard → Domains
2. Click on `ejastays.com`
3. Verify all DNS records are properly configured:
   - ✅ **SPF Record** - Should be added to your DNS
   - ✅ **DKIM Record** - Should be added to your DNS
   - ✅ **DMARC Record** (Optional but recommended)

**If DNS records are missing:**
- Copy the DNS records from Resend
- Add them to your domain's DNS provider (GoDaddy, Cloudflare, etc.)
- Wait for DNS propagation (can take up to 48 hours)

### 2. Domain Verification Status

**In Resend Dashboard:**
- Check if `ejastays.com` shows as "Verified" ✅
- If not verified, complete the verification process
- Ensure the verification email is sent to the correct domain admin email

### 3. From Address Best Practices

**Current Setup:**
- ✅ From: `EJA <noreply@ejastays.com>` (matches verified domain)
- ✅ Reply-To: `noreply@ejastays.com`

**Recommendations:**
- Consider using a real address like `support@ejastays.com` instead of `noreply@`
- `noreply@` addresses are sometimes flagged as spam
- Better alternative: `hello@ejastays.com` or `bookings@ejastays.com`

### 4. Email Content Improvements (Already Applied)

✅ Removed spam trigger words like "Payment Receipt" → Changed to "Booking Confirmed"
✅ Added proper email headers (List-Unsubscribe)
✅ Added transactional tags
✅ Improved HTML structure
✅ Added support contact information

### 5. Warm Up Your Domain (If New)

**If `ejastays.com` is a new domain:**
- Start with low volume (10-20 emails/day)
- Gradually increase over 2-4 weeks
- This builds domain reputation

### 6. Check Resend Deliverability

**In Resend Dashboard:**
- Go to "Logs" → Check bounce/spam rates
- Look for any authentication failures
- Check if emails are being marked as spam

## Quick Fix Options

### Option 1: Use a Different From Address (Recommended)

Change from `noreply@ejastays.com` to:
- `hello@ejastays.com`
- `support@ejastays.com`
- `bookings@ejastays.com`
- `info@ejastays.com`

Update in: `src/app/api/email/send/route.ts`

### Option 2: Verify DNS Records

1. Go to Resend → Domains → ejastays.com
2. Copy all DNS records shown
3. Add them to your domain's DNS provider
4. Wait 24-48 hours for propagation

### Option 3: Check Resend Domain Status

Ensure the domain shows as "Verified" with green checkmarks for:
- SPF ✅
- DKIM ✅
- DMARC (optional but recommended)

## Testing Email Deliverability

1. **Send a test email** to your own Gmail account
2. **Check spam folder** - if it's there, check DNS records
3. **Use Mail Tester**: https://www.mail-tester.com/
   - Send an email to the address they provide
   - Get a deliverability score (aim for 8+/10)

## Common Issues

| Issue | Solution |
|-------|----------|
| DNS records not added | Add SPF, DKIM records to domain DNS |
| Domain not verified | Complete verification in Resend |
| New domain | Warm up domain with low volume |
| `noreply@` address | Use a real address like `hello@` |
| Missing authentication | Add SPF/DKIM/DMARC records |

## Next Steps

1. ✅ Check Resend dashboard for DNS record status
2. ✅ Add missing DNS records to your domain provider
3. ✅ Consider changing from `noreply@` to `hello@` or `support@`
4. ✅ Test email deliverability with Mail Tester
5. ✅ Monitor Resend logs for bounce/spam rates

## Code Changes Made

The code has been updated with:
- ✅ Email headers (List-Unsubscribe)
- ✅ Transactional tags
- ✅ Better content (less spam trigger words)
- ✅ Support contact information
- ✅ Proper HTML structure

The main fix will be ensuring DNS records are properly configured in your domain's DNS provider.

