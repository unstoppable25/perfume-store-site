# Vercel KV Database Setup

## Why Vercel KV?
Vercel's serverless environment has a **read-only filesystem**, so we cannot save products to JSON files. Vercel KV is a free Redis-compatible key-value database that works perfectly with serverless.

## Setup Steps

### 1. Create KV Database in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: **perfume-store-site**
3. Click **Storage** tab in the left sidebar
4. Click **Create Database**
5. Select **KV (Key-Value Store)**
6. Name it: `scentlumus-products`
7. Select region: Choose closest to your users (e.g., US East for Nigeria traffic)
8. Click **Create**

### 2. Environment Variables (Auto-added)

Vercel automatically adds these environment variables to your project:
- `KV_REST_API_URL` - The API endpoint
- `KV_REST_API_TOKEN` - Authentication token

These are added to **all environments** (Production, Preview, Development) automatically.

### 3. Verify Setup

After creating the database:

1. Go to **Settings** → **Environment Variables**
2. Confirm you see:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional)

### 4. Deploy Updated Code

Your code is already updated to use Vercel KV:

```bash
# Commit changes
git add .
git commit -m "Integrate Vercel KV for product storage"
git push origin main
```

Vercel will automatically redeploy with KV support.

### 5. Test

1. Visit https://scentlumus.com/admin
2. Add a new product with image
3. Click "Add Product"
4. Check homepage - product should appear
5. Refresh page - product should persist

## How It Works

### Code Changes Made

**lib/db.js** - Now uses Vercel KV:
```javascript
import { kv } from '@vercel/kv'

export async function getAllProducts() {
  const products = await kv.get('products')
  return products || []
}

export async function createProduct(p) {
  const products = await getAllProducts()
  products.push(p)
  await kv.set('products', products)
  return p
}
```

**pages/api/products.js** - Made async:
```javascript
export default async function handler(req, res) {
  const products = await getAllProducts()
  // ...
}
```

### Fallback for Local Development

When running locally (`npm run dev`), the code automatically falls back to JSON files since Vercel KV is only available in Vercel's environment.

## Pricing

**Free Tier Limits:**
- 256 MB storage
- 3,000 commands/day
- 30 requests/second

This is more than enough for a small store. For 1000 products with images on Cloudinary, you'll use ~1-2 MB.

## Troubleshooting

### Products still not saving?

1. **Check environment variables:**
   ```bash
   # In Vercel dashboard → Settings → Environment Variables
   # Verify KV_REST_API_URL and KV_REST_API_TOKEN exist
   ```

2. **Check deployment logs:**
   - Go to Deployments → Latest → View Function Logs
   - Look for "Vercel KV initialized successfully"

3. **Clear cache:**
   - Vercel dashboard → Project → Settings
   - Click "Clear Cache" and redeploy

### "Cannot find module @vercel/kv"

Make sure package.json has:
```json
{
  "dependencies": {
    "@vercel/kv": "^1.0.1"
  }
}
```

Then redeploy.

## Next Steps

After KV is working:
- ✅ Products persist across deployments
- ⬜ Add Stripe keys for payments
- ⬜ Add Mailchimp keys for newsletter
- ⬜ Implement shopping cart
