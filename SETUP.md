# ScentLumus Setup Guide

## Environment Variables (.env.local)

Create a `.env.local` file in the project root with your Mailchimp API key:

```
MAILCHIMP_API_KEY=your_api_key_here
MAILCHIMP_AUDIENCE_ID=your_audience_id_here
```

## Getting Mailchimp API Key

1. Go to https://mailchimp.com/ and sign up (free)
2. In Dashboard, click **Settings** → **API keys**
3. Copy your API key
4. Go to **Audience** → **Manage Audience** → **Settings**
5. Copy your Audience ID (list ID)
6. Paste both into `.env.local`

The newsletter signup on your homepage will work once you add these keys.

## Admin Dashboard

Visit `/admin` to:
- Upload your logo
- Add/edit/delete products (all stored locally in your browser)
- Products will appear on the homepage once you refresh

**Note:** Products are stored in browser localStorage. To persist them permanently to a database, you'll need a backend database (Firebase, MongoDB, PostgreSQL, etc.). Let me know if you want to set that up later.

## Domain & Deployment

1. **Buy domain:** Go to namecheap.com, google.com/domains, or cloudflare.com and buy `scentlumus.com`
2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Connect your GitHub repo (push this code to GitHub first)
   - Vercel will auto-deploy
3. **Connect domain:** In Vercel dashboard, add your domain and configure DNS (Vercel provides instructions)

## Run Locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000
