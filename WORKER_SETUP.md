# Cloudflare Worker Setup - Contact Form Security

## What Changed?

The contact form now uses a **Cloudflare Worker** to handle email submissions securely.

### Before (Insecure)
```
Browser → Resend API (API key exposed) → Email
         ❌ Anyone could see/steal the API key
```

### After (Secure)
```
Browser → Cloudflare Worker (no secrets) → Resend API (key hidden) → Email
         ✅ API key never exposed to users
```

## How It Works

1. User fills out contact form on your site
2. Form submits to `/contact` endpoint (the Worker)
3. Worker validates data server-side
4. Worker calls Resend API with your secret key (kept safe)
5. Worker returns success/error to browser
6. User sees confirmation message

## File Structure

```
functions/
└── contact.js     ← Cloudflare Worker that handles email
```

## Deployment Steps

### 1. Push Code to GitHub

```bash
git add .
git commit -m "feat: Add Cloudflare Worker for secure email handling"
git push origin main
```

### 2. Add Environment Variable to Cloudflare

In your Cloudflare Pages dashboard:

1. Go to your `alsuweidi-website` project
2. Click **Settings** → **Environment variables**
3. Add this variable:
   ```
   RESEND_API_KEY = re_xxxx... (your actual Resend key)
   ```
4. Save

That's it! Cloudflare Pages automatically detects the `functions/` directory and deploys the Worker.

## Testing

### Local Testing (with Worker emulation)
```bash
npx wrangler dev
# Visit http://localhost:8788
# Contact form will submit to your local Worker
```

### Production Testing
1. Visit your site: `https://alsuweidi-website.pages.dev`
2. Fill out contact form
3. Click "Send Message"
4. Should see success message
5. Check `info@alsuweidi.ae` inbox

## What Gets Exposed vs Hidden

### Exposed to Browser (Safe)
- Supabase URL (read-only, public)
- Supabase Anon Key (read-only, public)
- HTML, CSS, JavaScript

### Hidden from Browser (Secure)
- Resend API Key (only the Worker sees this)
- Admin password hash (only the admin panel sees this)

## Security Benefits

✅ **API Key Protected**: Resend key never leaves Cloudflare servers
✅ **Input Validation**: Worker validates all data before sending
✅ **CORS Safe**: Worker handles CORS properly
✅ **Error Handling**: Errors don't expose sensitive info
✅ **Rate Limiting**: Can add rate limiting if needed

## Troubleshooting

**Contact form not submitting?**
- Check browser console (F12) for errors
- Check Cloudflare Pages deployment status
- Verify RESEND_API_KEY is set in environment variables

**Emails not arriving?**
- Verify RESEND_API_KEY is correct
- Check Resend account has active status
- Check `info@alsuweidi.ae` receives test emails from Resend

**Worker not deploying?**
- Check functions/contact.js exists in repo
- Push code to GitHub again
- Check Cloudflare Pages shows latest deployment

## Future Enhancements

- Add rate limiting (prevent spam)
- Add database logging (track submissions)
- Add email validation (check if email is real)
- Add attachments support (file uploads)

---

**This is production-ready.** The Worker is deployed automatically when you push to GitHub.
