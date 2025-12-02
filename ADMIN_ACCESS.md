# Secure Admin Portal Setup

## Access Information

### Admin Portal URL
**🔒 Secret URL:** `https://scentlumus.com/scentlumus_access_portal_8893`

**⚠️ IMPORTANT:** Never share this URL publicly. Bookmark it privately.

### Default Security ID
**Default Security ID:** `ScentLumus2025!SecureAccess#8893`

**🔴 CRITICAL:** Change this immediately in production!

---

## How to Change Security ID

### Option 1: Use Environment Variable (Recommended)

1. Go to Vercel Dashboard: https://vercel.com/unstoppable25/perfume-store-site/settings/environment-variables
2. Add new variable:
   - **Name:** `ADMIN_SECURITY_ID`
   - **Value:** Your custom secure ID (use 16+ characters with mix of letters, numbers, symbols)
   - **Environment:** All (Production, Preview, Development)
3. Redeploy the site

### Option 2: Edit Code Directly

Edit `pages/api/verify-gate.js` and change line 8:
```javascript
const VALID_SECURITY_ID = 'YOUR_NEW_SECURE_ID_HERE'
```

---

## Security Features

✅ **Hidden URL** - Admin not linked anywhere on public site
✅ **Security Gate** - Requires Security ID before accessing admin
✅ **Brute Force Protection** - Max 10 attempts, then 30-minute lockout
✅ **No Google Indexing** - robots.txt blocks crawlers
✅ **Session-based** - Authentication persists only for current session
✅ **Failed Attempt Logging** - All failures logged with timestamps

---

## How to Access Admin

1. Navigate to: `https://scentlumus.com/scentlumus_access_portal_8893`
2. Enter Security ID: `ScentLumus2025!SecureAccess#8893` (or your custom one)
3. Click "Verify Access"
4. You'll be redirected to the admin dashboard
5. Session expires when you close browser or click Logout

---

## Lockout Recovery

If locked out after 10 failed attempts:
- Wait 30 minutes for automatic unlock
- OR clear browser localStorage for immediate reset:
  1. Press F12 (open DevTools)
  2. Go to Application tab
  3. Expand Local Storage
  4. Find and delete `admin_lockout` key

---

## Security Best Practices

1. **Change the default Security ID immediately**
2. **Use a password manager** to generate a strong 20+ character ID
3. **Never commit** the Security ID to Git
4. **Use HTTPS only** (already enabled via Vercel)
5. **Don't share** the secret URL via email or messaging apps
6. **Rotate Security ID** every 90 days
7. **Monitor access logs** in Vercel dashboard

---

## Generating Strong Security ID

Example strong IDs:
- `k9#Xm$2pL@8vN!qR3wT5yU7iO`
- `SecretAdmin!2025$Store#9876xYz`
- `MyBusiness@Secure!Portal#2025`

Use at least:
- 16 characters
- Mix of uppercase and lowercase
- Numbers
- Special characters (!@#$%^&*)

---

## Troubleshooting

### "Invalid Security ID" error
- Check for typos
- Ensure correct capitalization
- Verify you're using the current Security ID

### Can't access admin after entering Security ID
- Clear browser cache
- Try incognito/private window
- Check browser console (F12) for errors

### Forgot Security ID
- Check environment variables in Vercel
- If using default, it's in this document
- If custom and lost, update via Vercel env vars or code

---

## Current Configuration

- **Secret URL:** `/scentlumus_access_portal_8893`
- **Max Attempts:** 10
- **Lockout Duration:** 30 minutes
- **Session Storage:** Browser session only
- **Attempt Tracking:** Browser localStorage

---

**🔐 Keep this document secure and private!**
