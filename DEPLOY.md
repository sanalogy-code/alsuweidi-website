# Deployment Guide - ALSUWEIDI Website on Cloudflare Pages

## Prerequisites

- GitHub account with the repository connected
- Supabase project set up with tables and data
- Resend API key (for contact form emails)
- Admin password hashed (from AUTH.hashPassword())
- Cloudflare account (free tier works fine)

## Step 1: Push to GitHub

First, commit and push all changes:

```bash
git add .
git commit -m "feat: Integrate Supabase CMS and Resend email service"
git push origin main
```

## Step 2: Set Up Cloudflare Pages

### 2.1 Connect Repository

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create a project** → **Connect to Git**
3. Log in with GitHub and authorize Cloudflare
4. Select the `alsuweidi-website` repository
5. Choose **Deploy with Cloudflare Pages**

### 2.2 Configure Build Settings

In the deployment configuration:

- **Framework preset**: `None` (static site, no build required)
- **Build command**: (leave blank)
- **Build output directory**: `/`

### 2.3 Add Environment Variables

Click **Settings** → **Environment variables** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESEND_API_KEY=re_your-api-key
ADMIN_PASSWORD_HASH=your-sha256-hash
```

**To generate the admin password hash:**

1. Open browser console on any page
2. Paste:
   ```javascript
   (async () => {
     const pwd = 'your-secure-password'; // Change this
     const encoder = new TextEncoder();
     const data = encoder.encode(pwd);
     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
     const hashArray = Array.from(new Uint8Array(hashBuffer));
     const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
     console.log('Hash:', hashHex);
   })();
   ```
3. Copy the hash and paste it as `ADMIN_PASSWORD_HASH`

### 2.4 Trigger Deployment

After adding environment variables, Cloudflare will automatically deploy your site. Check the **Deployments** tab to see the status.

Your site will be live at: `https://your-project.pages.dev`

## Step 3: Custom Domain

### 3.1 Point Domain to Cloudflare

1. Update your domain's nameservers to Cloudflare's:
   - `luke.ns.cloudflare.com`
   - `noor.ns.cloudflare.com`
   
   (Or use CNAME if your registrar doesn't support nameserver changes)

2. In Cloudflare Dashboard:
   - Go to Websites → Your domain
   - Add DNS records for your site

### 3.2 Add Domain to Pages

1. In Cloudflare Pages project
2. **Settings** → **Domain & SSL**
3. Click **Add domain**
4. Enter your domain (e.g., `alsuweidi.ae`)
5. Cloudflare will verify and activate SSL (automatic)

## Step 4: Test Everything

### 4.1 Test Public Pages

- Homepage: `/Homepage.dc.html`
- Portfolio: `/Portfolio.dc.html`
- About: `/About.dc.html`
- News: `/News.dc.html`
- Contact: `/Contact.dc.html`

All should load content from Supabase.

### 4.2 Test Admin Panel

- Admin: `/Admin.dc.html`
- Login with your hashed password
- Create/edit/delete content
- Changes should appear on public pages (with ~5 min cache)

### 4.3 Test Contact Form

- Go to `/Contact.dc.html`
- Fill out and submit the form
- Check `info@alsuweidi.ae` for the email

## Step 5: Monitor & Maintain

### Analytics

- Cloudflare Pages includes built-in analytics
- Dashboard shows requests, bandwidth, errors

### Logs

- Check **Deployments** for build/deploy logs
- Browser console (F12) shows any JS errors
- Check Supabase dashboard for database errors

### Troubleshooting

**Environment variables not working?**
- Redeploy after adding vars
- Hard refresh (Ctrl+Shift+R) to clear browser cache
- Check that vars are in the right environment (Production)

**Content not updating?**
- Clear browser cache (localStorage)
- Check Supabase RLS policies allow public read
- Verify Supabase credentials in environment vars

**Contact form not sending?**
- Check Resend API key is valid
- Verify `info@alsuweidi.ae` is in Resend verified recipients
- Check browser console for errors
- Resend free tier has rate limits

**Admin login failing?**
- Verify password hash is correct
- Check `settings` table has the hash
- Try clearing sessionStorage and reloading

## Automatic Deployments

Every time you push to `main` branch:

1. GitHub notifies Cloudflare
2. Cloudflare pulls latest code
3. Site redeploys (no build step needed)
4. Changes live in ~30 seconds

## Rollback

If something breaks:

1. Go to **Deployments**
2. Find the previous working deployment
3. Click **Rollback**

## Database Backups

Supabase automatically backs up your database. To manually backup:

```bash
# Export data via Supabase dashboard
# Settings > Backups > Download backup
```

## Next Steps

### Optimize Content Cache

Current cache is 5 minutes. To increase:

Edit `db-helper.js`, change:
```javascript
const CACHE_TTL = 5 * 60 * 1000; // Change this value
```

### Add More Pages

Copy the pattern from existing pages:
1. Import `db-helper.js`
2. Call `getFeaturedNews()`, `getAllProjects()`, etc.
3. Render in your HTML

### Custom Email Domain

To send emails from a custom domain (`noreply@alsuweidi.ae`):

1. In Resend dashboard: **Domains** → **Add domain**
2. Add DNS records Resend provides
3. Update `FROM` email in Contact form handler

## Support

- **Supabase**: https://supabase.com/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Resend**: https://resend.com/docs
