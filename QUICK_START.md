# Paystack Integration - Quick Reference

## ✅ What Was Done

### Files Created:
1. **`pages/api/paystack-webhook.js`** - Receives payment notifications from Paystack
2. **`pages/api/verify-payment.js`** - Verifies payment status with Paystack API
3. **`PAYSTACK_SETUP.md`** - Complete setup instructions

### Files Updated:
1. **`pages/checkout.js`** - Added Paystack payment popup integration
2. **`pages/order-confirmation.js`** - Enhanced to show payment details
3. **`.env.local`** - Added Paystack configuration (template)

---

## 🎯 Your Next Steps (IN ORDER)

### 1. Add Secret Key to Vercel (REQUIRED)
```
Go to: https://vercel.com/dashboard
→ Select "scentlumus" project
→ Settings → Environment Variables
→ Add New:
   Name: PAYSTACK_SECRET_KEY
   Value: [Your secret key from Paystack dashboard]
   Environment: All (Production, Preview, Development)
→ Save
```

### 2. Configure Webhook in Paystack Dashboard (REQUIRED)
```
Go to: https://dashboard.paystack.com/
→ Settings → API Keys & Webhooks
→ Webhooks section
→ Add webhook URL: https://scentlumus.com/api/paystack-webhook
→ Save
```

### 3. Redeploy Your Site (REQUIRED)
The site has already been pushed to GitHub and Vercel is deploying.
Once deployment completes (~2 minutes), the secret key will be active.

---

## 🧪 Testing Your Payment

### Option A: Test Mode First (Recommended)
1. Switch to Test Mode in Paystack Dashboard (toggle in top right)
2. Get Test Secret Key and add to Vercel
3. Update checkout.js to use test public key
4. Test with card: `4084084084084081` (expires: 12/25, cvv: 123)

### Option B: Go Live Immediately
Your live keys are already configured, just:
1. Add live secret key to Vercel (Step 1 above)
2. Make a small real purchase to test

---

## 📊 How It Works

```
Customer → Checkout Form → "Pay Now" Button
                              ↓
                    Paystack Popup Opens
                              ↓
                  Customer Enters Card Details
                              ↓
                  Paystack Processes Payment
                              ↓
         ┌─────────────────┴──────────────────┐
         ↓                                     ↓
  Webhook Notification              Customer Redirected
  (Backend creates order)           to Confirmation Page
         ↓
  Order Saved in Database
  with Payment Reference
```

---

## 🔑 Environment Variables Summary

### Already Set:
- ✅ `PAYSTACK_PUBLIC_KEY` - In checkout.js (hardcoded for now)
- ✅ `NEXT_PUBLIC_SITE_URL` - In .env.local

### You Need to Add:
- ❌ `PAYSTACK_SECRET_KEY` - **Add to Vercel now!**

---

## 🌐 Important URLs

### Webhook URL (for Paystack):
```
https://scentlumus.com/api/paystack-webhook
```

### Payment Verification API:
```
https://scentlumus.com/api/verify-payment?reference=ORDER_XXX
```

### Order Confirmation Page:
```
https://scentlumus.com/order-confirmation?reference=ORDER_XXX
```

---

## 🎨 What Customers See

1. **Cart Page** → Review items, see total
2. **Checkout Page** → Fill contact & shipping info
3. **Payment Method** → "Pay with Card" selected by default
4. **Click "Pay Now"** → Paystack popup appears
5. **Enter Card Details** → Secure Paystack form
6. **Payment Success** → Redirected to confirmation page
7. **Confirmation Page** → Shows order reference, amount paid, status

---

## 👨‍💼 What You See (Admin)

Orders will appear in your admin panel with:
- Customer name, email, phone
- Full shipping address
- Items ordered with quantities
- Total amount paid
- Payment reference number (ORDER_XXXXX)
- Payment status (Paid)

---

## 🆘 Common Issues & Fixes

### "Payment system is loading" error?
**Fix**: Wait for Paystack script to load (~2 seconds on first visit)

### Webhook not working?
**Fix**: 
1. Check webhook URL in Paystack dashboard
2. Verify secret key in Vercel environment variables
3. Check Vercel function logs for errors

### Order not created after payment?
**Fix**: Check Paystack Dashboard → Webhooks → Logs to see if notification was sent

---

## 📞 Support Contacts

**Paystack Support**:
- Email: support@paystack.com
- Phone: +234 1 888 3888
- Docs: https://paystack.com/docs/

**Your Site**:
- Live URL: https://scentlumus.com
- Webhook: https://scentlumus.com/api/paystack-webhook

---

## ✨ Features Included

✅ **Secure Payment Processing** - All payments via Paystack's PCI-compliant servers
✅ **Webhook Verification** - HMAC SHA512 signature verification
✅ **Automatic Order Creation** - Orders created only after successful payment
✅ **Payment Verification** - Double-check payment status before confirmation
✅ **Beautiful UI** - Clean, professional checkout flow
✅ **Mobile Responsive** - Works perfectly on all devices
✅ **Error Handling** - Graceful failure messages
✅ **Order Tracking** - Customers get order reference number

---

## 🚀 Ready to Go Live?

**Checklist:**
- [ ] Secret key added to Vercel environment variables
- [ ] Webhook URL configured in Paystack
- [ ] Site redeployed (automatic after git push)
- [ ] Test payment completed successfully
- [ ] Webhook logs show success in Paystack dashboard

**Once all checked, you're live! 🎉**

