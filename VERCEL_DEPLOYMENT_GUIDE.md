# ScentLumus Deployment Guide — Vercel + Custom Domain

This guide walks you through deploying your ScentLumus perfume store to Vercel and connecting your custom domain (`scentlumus.com`).

---

## **Phase 1: Prepare Your GitHub Repository**

Vercel deploys from GitHub. If you don't have a GitHub account, create one at https://github.com

### Step 1.1: Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository:
   - **Repository name:** `perfume-store-site` (or any name you like)
   - **Description:** ScentLumus perfume store
   - **Visibility:** Public (free) or Private (requires paid Vercel plan)
   - Click **Create Repository**

### Step 1.2: Push Your Code to GitHub

Open PowerShell and run (replace `YOUR_USERNAME` with your GitHub username):

```powershell
cd C:\perfume-store-site

# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial ScentLumus setup"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/perfume-store-site.git

# Push to GitHub (you'll be prompted for login)
git branch -M main
git push -u origin main
```

GitHub will prompt you to log in — use your GitHub credentials.

---

## **Phase 2: Deploy to Vercel**

### Step 2.1: Connect Vercel to GitHub
1. Go to https://vercel.com/signup
2. Sign up with GitHub (click "Continue with GitHub")
3. Authorize Vercel to access your GitHub account
4. After login, you'll be in the Vercel dashboard

### Step 2.2: Import Your Repository
1. Click **"New Project"** or **"Add New..."**
2. Select **"Import Git Repository"**
3. Find your repository: `perfume-store-site` (or search for it)
4. Click **"Import"**

### Step 2.3: Configure Environment Variables
On the import screen, you'll see an "Environment Variables" section. Add these if you're using them:

```
MAILCHIMP_API_KEY=your_mailchimp_key_here
MAILCHIMP_AUDIENCE_ID=your_audience_id_here
STRIPE_SECRET_KEY=sk_test_... (your Stripe test key)
NEXT_PUBLIC_BASE_URL=https://scentlumus.com (or your domain)
```

If you don't have these yet, leave them blank — you can add them later.

### Step 2.4: Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your site (takes ~2–5 minutes)
3. You'll see a message: **"Congratulations! Your project has been successfully deployed."**
4. Click the link shown (e.g., `perfume-store-site.vercel.app`) to view your live site

✅ **Your site is now live at a Vercel URL!**

---

## **Phase 3: Connect Your Custom Domain (`scentlumus.com`)**

### Step 3.1: Buy Your Domain
1. Go to one of these domain registrars:
   - Namecheap: https://www.namecheap.com
   - Google Domains: https://domains.google
   - Cloudflare: https://www.cloudflare.com/products/registrar
2. Search for `scentlumus.com`
3. Add to cart and complete purchase
4. Note the **nameservers** provided by your registrar (you'll need these)

### Step 3.2: Add Domain to Vercel
1. In your Vercel dashboard, go to your project
2. Click the **"Settings"** tab
3. Click **"Domains"** in the left sidebar
4. Click **"Add Domain"**
5. Enter `scentlumus.com` and click **"Add"**
6. Vercel will show you two options:
   - **Nameserver configuration** (recommended — easiest)
   - **CNAME configuration** (if your registrar doesn't support nameservers)

### Step 3.3: Update Your Domain Registrar's Nameservers

Choose **one** based on where you bought your domain:

#### **If you use Namecheap:**
1. Log into your Namecheap account
2. Go to **"Domain List"**
3. Click **"Manage"** next to `scentlumus.com`
4. Click the **"Nameservers"** tab
5. Change from "Namecheap BasicDNS" to "Custom DNS"
6. Enter Vercel's nameservers (shown in Vercel dashboard):
   - `ns1.vercel.com`
   - `ns2.vercel.com`
   - `ns3.vercel.com`
   - `ns4.vercel.com`
7. Click **"Save"**

#### **If you use Google Domains:**
1. Log into your Google Domains account
2. Select `scentlumus.com`
3. Click **"DNS"** in the left sidebar
4. Scroll to **"Custom name servers"**
5. Click **"Use custom name servers"**
6. Enter Vercel's nameservers (same as above)
7. Click **"Save"**

#### **If you use Cloudflare:**
1. Log into your Cloudflare account
2. Select your domain
3. Go to **"DNS"** → **"Records"**
4. Replace nameservers or use Vercel's or add CNAME records as instructed

### Step 3.4: Wait for DNS Propagation
DNS changes take **24–48 hours** to propagate worldwide. During this time:
- Your domain may not work immediately
- Check status in Vercel: **Settings** → **Domains** — look for a green checkmark

### Step 3.5: Test Your Domain
Once DNS propagates (usually within a few hours):
1. Open your browser
2. Go to `https://scentlumus.com` (note: HTTPS, not HTTP)
3. You should see your ScentLumus store!

✅ **Your custom domain is now live!**

---

## **Phase 4: Optional — Set Up Stripe Live Mode**

If you want to accept real payments:

1. Go to https://stripe.com
2. Create a Stripe account
3. Get your **live** secret key (not the test key)
4. In Vercel dashboard:
   - **Settings** → **Environment Variables**
   - Update `STRIPE_SECRET_KEY` with your live key
   - Redeploy (Vercel will auto-redeploy on env var change)
5. Update your Buy button price handling for NGN if needed

---

## **Phase 5: Optional — Set Up Mailchimp Newsletters**

If you want newsletter subscriptions to save to Mailchimp:

1. Go to https://mailchimp.com
2. Create an account
3. Create an audience (e.g., "ScentLumus Subscribers")
4. Get your **API Key** and **Audience ID**
5. In Vercel dashboard:
   - **Settings** → **Environment Variables**
   - Add `MAILCHIMP_API_KEY=your_key_here`
   - Add `MAILCHIMP_AUDIENCE_ID=your_audience_id`
   - Redeploy
6. Newsletter signups on your homepage will now save to Mailchimp

---

## **Troubleshooting**

### "Deployment failed"
- Check the **"Deployments"** tab in Vercel for error logs
- Common issues:
  - Missing dependencies (run `npm install` locally and commit `package-lock.json`)
  - Environment variable issues (check spelling in Vercel)
  - Code errors (fix in your code, commit, and push — Vercel auto-redeploys)

### "Domain not connecting"
- DNS can take 24–48 hours
- Check Vercel: **Settings** → **Domains** for status
- Try flushing your local DNS:
  ```powershell
  ipconfig /flushdns
  ```
- Try accessing from a different network/device to rule out caching

### "SSL certificate error"
- Vercel auto-provisions SSL via Let's Encrypt
- Wait 24 hours after adding the domain
- If still missing, contact Vercel support

---

## **Redeploy When You Make Changes**

After you update your code locally:

```powershell
cd C:\perfume-store-site

# Make your changes in the code, then:
git add .
git commit -m "Your change description"
git push origin main
```

Vercel will **automatically detect the push** and redeploy your site. No manual action needed!

---

## **Quick Reference: Key Links**

| Service | Link |
|---------|------|
| GitHub | https://github.com |
| Vercel | https://vercel.com |
| Namecheap (Domain) | https://www.namecheap.com |
| Stripe (Payments) | https://stripe.com |
| Mailchimp (Email) | https://mailchimp.com |

---

## **Next Steps After Deployment**

1. ✅ Domain is live at `scentlumus.com`
2. 🔒 (Optional) Set up Stripe live payments
3. 📧 (Optional) Set up Mailchimp newsletter
4. 🎨 (Next) Customize colors, fonts, and layout
5. 🛒 (Future) Add shopping cart / checkout flow

---

**Questions?** If you hit any errors during deployment, paste the error message here and I'll help you fix it!
