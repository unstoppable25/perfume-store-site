# Cloudinary Setup Guide for ScentLumus

This guide walks you through setting up Cloudinary for persistent image uploads on your perfume store.

---

## **What Cloudinary Does**

- Stores product images in the cloud (not on Vercel's read-only filesystem)
- Images uploaded via the admin panel persist forever (survive redeploys)
- Automatic image optimization and CDN delivery
- **100% free tier** (25 GB storage, 25 GB bandwidth/month — plenty for a small store)

---

## **Step 1: Create a Free Cloudinary Account**

1. Go to https://cloudinary.com/users/register_free
2. Sign up with your email (no credit card required)
3. Verify your email
4. Log in to your Cloudinary dashboard

---

## **Step 2: Get Your Cloudinary Credentials**

1. In your Cloudinary dashboard, go to the **Dashboard** tab (home page)
2. Look for the **"Product Environment Credentials"** section
3. You'll see three values:
   - **Cloud Name**: `your_cloud_name`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz` (click "Show" to reveal)

4. Copy these three values

---

## **Step 3: Add Credentials to Vercel**

### **For Production (Vercel Deployment):**

1. Go to https://vercel.com
2. Click your `perfume-store-site` project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:
   - Name: `CLOUDINARY_CLOUD_NAME` → Value: `your_cloud_name`
   - Name: `CLOUDINARY_API_KEY` → Value: `123456789012345`
   - Name: `CLOUDINARY_API_SECRET` → Value: `your_api_secret`
5. Click **Save**
6. Vercel will automatically redeploy with the new variables

### **For Local Development (Optional):**

1. In your project folder `C:\perfume-store-site`, create a file called `.env.local`
2. Add these lines (replace with your actual values):
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Save the file
4. Restart your local dev server (`npm run dev`)

---

## **Step 4: Test It**

### **After Vercel Redeploys:**

1. Go to your deployed admin page: `https://scentlumus.com/admin`
2. Add a new product with an image
3. Save it
4. The image URL should now start with `https://res.cloudinary.com/...` (Cloudinary URL)
5. Refresh the page — the image should still be there
6. Even after future code deploys, the image will persist

### **If It Doesn't Work:**

- Check Vercel → Settings → Environment Variables — make sure all three Cloudinary variables are set
- Check the deployment logs in Vercel for errors
- Try redeploying manually: Vercel dashboard → Deployments → click "..." → Redeploy

---

## **How the Upload API Works Now**

The `/api/upload` endpoint now:
1. Checks if Cloudinary credentials are set
2. If YES → uploads to Cloudinary and returns a Cloudinary URL
3. If NO → falls back to local filesystem (for local dev without Cloudinary)

This means:
- Local dev works without Cloudinary (images go to `public/uploads/`)
- Production with Cloudinary works perfectly (images persist in the cloud)

---

## **Free Tier Limits**

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

For reference:
- 1,000 product images (~1 MB each) = ~1 GB storage
- 10,000 page views/month with 5 images each = ~5 GB bandwidth

You'll be well within limits for a long time.

---

## **Next Steps**

1. Sign up for Cloudinary (free)
2. Add credentials to Vercel
3. Wait for redeploy (~2 minutes)
4. Test by adding a product with an image via the admin panel
5. Verify the image URL starts with `https://res.cloudinary.com/...`

If you need help, paste any errors you see and I'll troubleshoot!
