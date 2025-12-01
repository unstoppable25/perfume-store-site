# ScentLumus — Handcrafted Perfume Store

Your custom-built website with admin dashboard. Branding, products, and newsletter—all ready to customize.

## Quick Start (Windows PowerShell)

```powershell
cd perfume-store-site
npm install
npm run dev
```

Open `http://localhost:3000` to view your store homepage.

## Key Features

- **Homepage** — Marketing site with product showcase and newsletter signup
- **Admin Dashboard** (`/admin`) — Upload logo, add/edit/delete products
- **Mailchimp Integration** — Newsletter signup form (requires API key setup)
- **Responsive Design** — Works on desktop, tablet, and mobile

## Admin Dashboard

1. Go to `http://localhost:3000/admin`
2. Upload your logo (any image file)
3. Add products with name, price, description, and image URL
4. Products saved locally (in your browser) and displayed on homepage

**Note (updated):** Products are now stored server-side in `data/products.json` when running locally. The Admin dashboard uses `/api/products` to create, update, and delete products. For production deployments you'll want a proper database (SQLite, PostgreSQL, Firebase, etc.) — this local JSON store is a simple developer convenience.

## Newsletter Setup (Mailchimp)

1. Sign up at https://mailchimp.com (free)
2. Copy your API key and Audience ID from settings
3. Create `.env.local` file in project root:
   ```
   MAILCHIMP_API_KEY=your_key_here
   MAILCHIMP_AUDIENCE_ID=your_audience_id_here
   ```
4. Newsletter signup on homepage will now save subscribers to Mailchimp

See `SETUP.md` for detailed Mailchimp instructions.

## Domain & Deployment

1. **Buy domain:** `scentlumus.com` from Namecheap, Google Domains, or Cloudflare
2. **Deploy to Vercel:** 
   - Push code to GitHub
   - Connect repo to Vercel (https://vercel.com)
   - Vercel auto-deploys on push
3. **Connect domain:** Add domain in Vercel dashboard and update DNS settings
4. **Local developer conveniences added**

- Server-side product persistence: products are stored in `data/store.db` (SQLite) during local development. This is a simple local DB and convenient for testing.
- Image uploads: Admin can upload images which are saved to `public/uploads` via `/api/upload`.
- Stripe checkout: A demo checkout endpoint is available (`/api/checkout`). To use Stripe, create a `.env.local` with `STRIPE_SECRET_KEY` (test key) and `NEXT_PUBLIC_BASE_URL` if your dev URL differs from `http://localhost:3000`.

Example `.env.local`:
```
MAILCHIMP_API_KEY=your_mailchimp_api_key-usX
MAILCHIMP_AUDIENCE_ID=your_audience_id
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

See `SETUP.md` for full deployment walkthrough.

## Next Steps I Can Help With

- Set up Stripe for payments (when ready to sell)
- Integrate Shopify checkout later
- Add more pages (About, Contact, FAQ)
- Set up Google Analytics
- Create legal pages (Privacy, Terms, Shipping)

Tell me what you need next!
