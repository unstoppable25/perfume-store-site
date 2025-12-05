# Paystack Payment Integration Setup Guide

This guide will walk you through setting up Paystack payments for your ScentLumus e-commerce site.

## 🔑 Step 1: Get Your Paystack Secret Key

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Login with your credentials
3. Navigate to **Settings** → **API Keys & Webhooks**
4. You'll see two keys:
   - **Public Key** (starts with `pk_live_...`) - Already configured ✅
   - **Secret Key** (starts with `sk_live_...`) - Click "Show" to reveal it
5. **Copy your Secret Key** (you'll need it in the next step)

⚠️ **IMPORTANT**: Never share your secret key publicly or commit it to Git!

---

## 🌍 Step 2: Add Secret Key to Vercel Environment Variables

Since your site is hosted on Vercel, you need to add the secret key there:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **scentlumus** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New** button
6. Add these values:
   - **Name**: `PAYSTACK_SECRET_KEY`
   - **Value**: [Paste your secret key from Step 1]
   - **Environment**: Select all environments (Production, Preview, Development)
7. Click **Save**

### Local Development (.env.local)

For testing locally, open your `.env.local` file and replace:
```
PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```
with:
```
PAYSTACK_SECRET_KEY=sk_live_[your actual secret key]
```

---

## 🔗 Step 3: Configure Webhook URL in Paystack Dashboard

Paystack needs to know where to send payment notifications:

1. Go back to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Scroll down to the **Webhooks** section
4. Click **Add Webhook URL** or edit existing webhook
5. Enter your webhook URL:
   ```
   https://scentlumus.com/api/paystack-webhook
   ```
6. Click **Save**

### What does the webhook do?
- When a customer pays, Paystack sends a notification to this URL
- The webhook verifies the payment and creates an order in your database
- This ensures orders are only created after successful payment

---

## 🔄 Step 4: Redeploy Your Application

After adding environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Click **Deployments** tab
3. Click the **⋯** menu on the latest deployment
4. Click **Redeploy**
5. Wait for deployment to complete (~1-2 minutes)

**OR** push a new commit to trigger automatic deployment:
```bash
git add .
git commit -m "Configure Paystack payment integration"
git push
```

---

## ✅ Step 5: Test the Payment Flow

### Testing with Test Mode (Recommended First)

Before going live, test with Paystack's test keys:

1. In Paystack Dashboard, toggle to **Test Mode** (top right)
2. Get your **Test Secret Key** (starts with `sk_test_...`)
3. Temporarily update your Vercel environment variable:
   - `PAYSTACK_SECRET_KEY` = your test secret key
4. In `checkout.js`, temporarily use test public key:
   - `pk_test_...` instead of `pk_live_...`
5. Redeploy
6. Test with these **Paystack Test Cards**:

#### Successful Payment:
- **Card Number**: `4084084084084081`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

#### Failed Payment:
- **Card Number**: `4084080000000408`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Testing in Production (Live Mode)

Once test mode works:

1. Toggle back to **Live Mode** in Paystack Dashboard
2. Update environment variable to **Live Secret Key**
3. Update `checkout.js` to use **Live Public Key** (already set)
4. Redeploy
5. Make a small real transaction to verify

---

## 📋 Payment Flow Overview

Here's what happens when a customer checks out:

1. **Customer fills checkout form** → Name, email, phone, address
2. **Clicks "Pay Now"** → Paystack popup opens
3. **Enters card details** → Secure payment form
4. **Paystack processes payment** → Real-time verification
5. **Webhook receives notification** → `/api/paystack-webhook`
6. **Order created in database** → Includes all customer and cart details
7. **Customer redirected** → Order confirmation page with reference number
8. **Admin sees order** → In admin panel with payment details

---

## 🛠️ Files Modified for Paystack Integration

1. **`.env.local`** - Environment variables (secret key)
2. **`pages/api/paystack-webhook.js`** - Webhook handler (NEW)
3. **`pages/api/verify-payment.js`** - Payment verification API (NEW)
4. **`pages/checkout.js`** - Paystack popup integration
5. **`pages/order-confirmation.js`** - Shows payment success with reference

---

## 🎯 Admin Panel - Viewing Orders

Orders created through Paystack payment will appear in your admin panel with:
- Customer details (name, email, phone)
- Shipping address
- Order items with quantities
- Total amount paid
- Payment reference number
- Payment status (Paid via Paystack)

---

## 🔐 Security Notes

✅ **What's Secure:**
- Webhook signature verification (HMAC SHA512)
- Secret key stored in environment variables
- Payment processed through Paystack's secure servers
- Card details never touch your server

⚠️ **Important Security Practices:**
- Never commit `.env.local` to Git (already in `.gitignore`)
- Never share your secret key
- Always verify webhook signatures
- Use HTTPS (already configured on Vercel)

---

## 📞 Troubleshooting

### Payment popup not opening?
- Check browser console for errors
- Verify Paystack script loaded: `window.PaystackPop` exists
- Ensure email field is filled (required by Paystack)

### Webhook not receiving notifications?
- Verify webhook URL in Paystack dashboard
- Check Vercel function logs for errors
- Ensure `PAYSTACK_SECRET_KEY` is set in Vercel

### Payment successful but order not created?
- Check webhook signature verification
- Look at Paystack dashboard → Webhooks → Logs
- Verify database connection in webhook handler

### "Payment verification failed" error?
- Ensure secret key is correct
- Check Vercel environment variables
- Verify you're using the same mode (test/live) for all keys

---

## 🎉 Success Checklist

- [ ] Secret key added to Vercel environment variables
- [ ] Webhook URL configured in Paystack dashboard
- [ ] Application redeployed
- [ ] Test payment completed successfully
- [ ] Order appears in database
- [ ] Customer receives order confirmation
- [ ] Webhook logs show successful notifications

---

## 💰 Paystack Fees

Paystack charges:
- **Local Cards**: 1.5% + ₦100 (capped at ₦2,000)
- **International Cards**: 3.9% + ₦100

Fees are automatically deducted from each transaction.

---

## 📚 Additional Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Webhook Best Practices](https://paystack.com/docs/payments/webhooks/)
- [Testing Guide](https://paystack.com/docs/payments/test-payments/)

---

## 🚀 Next Steps

After setup is complete:
1. ✅ Test with small real transaction
2. ✅ Verify email notifications work (configure in Paystack)
3. ✅ Set up customer notification emails
4. ✅ Configure automatic payout schedule in Paystack
5. ✅ Monitor transactions in Paystack dashboard

---

**Need Help?** 
- Paystack Support: [support@paystack.com](mailto:support@paystack.com)
- Paystack Phone: +234 1 888 3888

