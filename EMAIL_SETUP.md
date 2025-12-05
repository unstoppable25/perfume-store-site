# Email System Setup Guide - Resend

## 📧 Overview

Your ScentLumus store now has a complete email system that automatically sends:
- ✅ Order confirmation emails (when customer pays)
- ✅ Order status update emails (when you change order status in admin)
- ✅ Verification codes (for email verification)
- ✅ Password reset codes (for forgot password)

All emails are beautifully designed with your branding and send automatically.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Free Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address
4. You get **3,000 free emails per month** (perfect for starting out!)

### Step 2: Add Your Domain

1. In Resend dashboard, click **Domains** → **Add Domain**
2. Enter: `scentlumus.com`
3. You'll get DNS records to add
4. Go to your domain provider (where you bought scentlumus.com)
5. Add these DNS records:
   - **MX record**: Priority 10, Value: `feedback-smtp.us-east-1.amazonses.com`
   - **TXT record** (SPF): `v=spf1 include:amazonses.com ~all`
   - **CNAME records**: Copy all CNAME records from Resend dashboard
6. Wait 24-48 hours for verification (usually faster)

**💡 Can't wait?** Use Resend's sandbox domain (`onboarding.resend.dev`) to test immediately! You can only send to your own email, but it's perfect for testing.

### Step 3: Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: "ScentLumus Production"
4. Select permission: **Sending access**
5. Click **Create**
6. **Copy the key** (starts with `re_...`)

### Step 4: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your **scentlumus** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `RESEND_API_KEY`
   - **Value**: [Paste your API key from Step 3]
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 5: Redeploy

Push any change to trigger deployment, or manually redeploy in Vercel dashboard.

---

## ✅ What's Already Done

### Order Confirmation Emails
- ✅ Automatically sent when payment succeeds
- ✅ Includes all order items with prices
- ✅ Shows shipping address
- ✅ Displays order total
- ✅ Link to view order details
- ✅ Sent via Paystack webhook

### Order Status Update Emails
- ✅ Automatically sent when admin changes order status
- ✅ Different designs for each status:
  - 📦 **Processing** - Blue theme
  - 🚚 **Shipped** - Purple theme
  - ✅ **Delivered** - Green theme
  - ❌ **Cancelled** - Red theme
- ✅ Includes order tracking link

### Order Details Page
- ✅ `/order/[id]` page created
- ✅ Shows full order info, items, shipping address
- ✅ Progress tracker (Ordered → Processing → Shipped → Delivered)
- ✅ Order summary with payment details
- ✅ Links to contact support

### Profile Updates
- ✅ Orders in profile now clickable
- ✅ Click any order to see full details
- ✅ Beautiful hover effects

---

## 📧 Email Templates Included

### 1. Order Confirmation Email
**Sent:** Immediately after payment  
**To:** Customer email  
**Subject:** Order Confirmation #12345678 - ScentLumus

Contains:
- ✓ Order number and date
- ✓ Status badge
- ✓ List of items with quantities and prices
- ✓ Subtotal, shipping, and total
- ✓ Full shipping address
- ✓ What's next section
- ✓ View order button
- ✓ Contact support button

### 2. Order Status Update Email
**Sent:** When admin changes order status  
**To:** Customer email  
**Subject:** Order Update: [Status] #12345678

Contains:
- ✓ Status-specific icon and color
- ✓ Friendly message about the update
- ✓ Order ID and total
- ✓ Track order button
- ✓ Contact support button

### 3. Email Verification (Ready for future use)
**Subject:** Verify Your Email - ScentLumus

Contains:
- ✓ 6-digit verification code
- ✓ Code expires in 10 minutes
- ✓ Security warning

### 4. Password Reset (Ready for future use)
**Subject:** Reset Your Password - ScentLumus

Contains:
- ✓ 6-digit reset code
- ✓ Code expires in 15 minutes
- ✓ Security alert
- ✓ Reset password link

---

## 🎨 Email Design Features

All emails include:
- ✅ Your brand colors (amber gradient header)
- ✅ ScentLumus logo and tagline
- ✅ Mobile-responsive design
- ✅ Professional typography
- ✅ Clear call-to-action buttons
- ✅ Footer with copyright and contact info

---

## 🧪 Testing Your Emails

### Test Order Confirmation Email

1. Make a test purchase on your site
2. Complete Paystack payment
3. Check customer email inbox
4. Should receive order confirmation within seconds

### Test Status Update Email

1. Go to your admin panel
2. Find an order
3. Change status (e.g., Pending → Processing)
4. Check customer email inbox
5. Should receive status update email immediately

### Test with Your Own Email First

Use your own email as customer email to test all flows before going live.

---

## 📊 Resend Dashboard Features

After setup, you can:
- View all sent emails
- See delivery rates
- Check bounce rates
- View email analytics
- Download logs
- Monitor API usage

Access at: https://resend.com/emails

---

## 🔧 Troubleshooting

### Emails not sending?

**Check 1: API Key in Vercel**
- Go to Vercel → Settings → Environment Variables
- Verify `RESEND_API_KEY` is set
- Check for typos in the key

**Check 2: Domain Verification**
- Go to Resend → Domains
- Ensure domain is verified (green checkmark)
- If pending, wait for DNS propagation (up to 48 hours)

**Check 3: Vercel Logs**
- Go to Vercel → Deployments → Latest
- Click on deployment → View Function Logs
- Look for email sending logs

**Check 4: Test Mode**
If domain not verified yet, temporarily update `lib/email.js`:
```javascript
from: 'ScentLumus <onboarding@resend.dev>',  // Sandbox domain
```

### Emails going to spam?

✅ **Solutions:**
1. Complete domain verification in Resend
2. Add all DNS records (especially DKIM)
3. Warm up your sending (start with low volumes)
4. Ask recipients to mark as "Not Spam"

### Different email address for different types?

Update in `lib/email.js`:
```javascript
// Order emails
from: 'ScentLumus <orders@scentlumus.com>'

// Account emails  
from: 'ScentLumus <noreply@scentlumus.com>'

// Support emails
from: 'ScentLumus <support@scentlumus.com>'
```

---

## 💰 Pricing

### Resend Free Tier
- ✅ 3,000 emails/month
- ✅ 1 custom domain
- ✅ 100 recipients per email
- ✅ Full API access
- ✅ Email analytics

**Perfect for starting out!** Most small stores send 100-500 emails/month.

### Resend Pro ($20/month)
- 50,000 emails/month
- 10 custom domains
- 1,000 recipients per email
- Priority support

Upgrade when you need more volume.

---

## 🔐 Security Best Practices

✅ **Never commit API keys to Git** - They're in `.gitignore`  
✅ **Use environment variables** - Already configured  
✅ **Rotate keys periodically** - Every 6-12 months  
✅ **Monitor usage** - Check Resend dashboard weekly  
✅ **Verify webhook signatures** - Already implemented  

---

## 📚 Alternative Email Services

If you prefer a different service:

### SendGrid (Free: 100 emails/day)
- Website: https://sendgrid.com
- Install: `npm install @sendgrid/mail`
- Similar setup process

### Mailgun (Free: 5,000 emails/month first 3 months)
- Website: https://mailgun.com
- Good for higher volumes
- Slightly more complex setup

### Amazon SES (Very cheap: $0.10 per 1,000 emails)
- Best for high volume
- Requires AWS account
- More technical setup

---

## ✨ Email Customization

Want to customize email templates? Edit `lib/email.js`:

```javascript
// Change colors
style="background: #your-color"

// Change fonts
style="font-family: your-font"

// Add your logo
<img src="your-logo-url" />

// Change button text
<a href="...">Your Text</a>
```

---

## 📞 Support

**Resend Support:**
- Email: support@resend.com
- Docs: https://resend.com/docs
- Status: https://status.resend.com

**Your Email System Files:**
- Email functions: `lib/email.js`
- Order webhook: `pages/api/paystack-webhook.js`
- Order status API: `pages/api/orders.js`
- Order details page: `pages/order/[id].js`

---

## 🎉 Setup Checklist

Before going live, verify:
- [ ] Resend account created
- [ ] Domain added and verified in Resend
- [ ] API key added to Vercel
- [ ] Site redeployed with new env variable
- [ ] Test order placed and confirmation email received
- [ ] Order status changed and update email received
- [ ] Emails not going to spam
- [ ] All links in emails work correctly
- [ ] Unsubscribe link added (if needed for marketing)

---

**Once all checked, your email system is live! 🚀**

Customers will now receive professional emails for all their orders automatically.

