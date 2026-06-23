# Quick Start - ALSUWEIDI Website Setup

## ✅ What's Been Done

Your website now has:
- ✅ **Supabase CMS** - Manage news, projects, team, and settings
- ✅ **Contact Form** - Email submissions via Resend
- ✅ **Admin Panel** - Secure content management at `/Admin.dc.html`
- ✅ **Frontend Integration** - All pages read from Supabase
- ✅ **Cloudflare Pages** - Ready for auto-deployment
- ✅ **Documentation** - Complete setup and deployment guides

## 🚀 Setup in 3 Steps

### Step 1: Create Supabase Project (10 min)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create a new project (free tier)
3. Go to **SQL Editor** and copy-paste all SQL from [SETUP.md](SETUP.md) "Create Database Tables" section
4. Execute the queries
5. Go to **Settings > API** and copy:
   - **Project URL** → save as `VITE_SUPABASE_URL`
   - **Anon Key** → save as `VITE_SUPABASE_ANON_KEY`

### Step 2: Get Email API Key (5 min)

1. Go to [resend.com](https://resend.com) → Sign up
2. Create API key
3. Save as `VITE_RESEND_API_KEY`

### Step 3: Deploy to Cloudflare (5 min)

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create project** → **Connect to Git**
3. Select `sanalogy-code/alsuweidi-website`
4. Build settings:
   - Framework: **None**
   - Build command: (leave blank)
   - Build output: **/**
5. Go to **Settings > Environment variables** and add:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   VITE_RESEND_API_KEY=your-key
   ADMIN_PASSWORD_HASH=see-below
   ```

### Generate Admin Password Hash

Open any page in your browser and run in console:

```javascript
(async () => {
  const password = 'your-secure-password'; // Change this!
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('Paste this as ADMIN_PASSWORD_HASH:', hashHex);
})();
```

## 📝 After Setup

### Test Admin Panel
- Go to `https://your-domain/Admin.dc.html`
- Login with your password
- Try adding news/project - should appear on homepage

### Test Contact Form
- Go to `https://your-domain/Contact.dc.html`
- Fill out and submit
- Check `info@alsuweidi.ae` for email

### Test Public Pages
- Homepage - loads featured news & projects
- Portfolio - loads all projects
- About - loads team members
- News - loads all news

## 📚 Documentation

- **[README.md](README.md)** - Full architecture & how it works
- **[SETUP.md](SETUP.md)** - Detailed Supabase setup
- **[DEPLOY.md](DEPLOY.md)** - Cloudflare deployment guide

## 🔑 Environment Variables

Create a `.env.local` file for local development:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESEND_API_KEY=re_your-key
ADMIN_PASSWORD_HASH=your-sha256-hash
```

For Cloudflare Pages, add these in the dashboard under **Settings > Environment variables**.

## ⚡ How It Works

```
User visits site
    ↓
Page loads from GitHub (Cloudflare Pages)
    ↓
JavaScript imports db-helper.js
    ↓
Checks browser cache (localStorage)
    ↓
If no cache → fetches from Supabase
    ↓
Renders content in HTML
    ↓
Caches for 5 minutes
```

## 🛠️ File Structure

```
Key files you'll use:

/Admin.dc.html      → Content management
/Homepage.dc.html   → Homepage
/Portfolio.dc.html  → Projects page
/Contact.dc.html    → Contact form
/config.js          → Supabase & Resend config
/db-helper.js       → Database helper functions

Documentation:
/README.md          → Full architecture
/SETUP.md           → Setup steps
/DEPLOY.md          → Deployment guide
/.env.example       → Environment template
```

## 🔐 Security

- Admin password is **hashed** (SHA-256) - not stored as plain text
- Contact form is **validated** - no spam injection
- Supabase credentials are **public read-only** - no sensitive data exposed
- Resend API key is **stored securely** in Cloudflare env vars

## 🚢 Deployment

Every time you:
1. Create/edit content in Admin panel → Supabase updated
2. Push code to GitHub → Cloudflare auto-deploys
3. No manual steps needed after initial setup

## 🆘 Troubleshooting

**Content not showing?**
→ Check Supabase credentials in env vars
→ Clear browser cache: Press F12 → Console → `localStorage.clear()`

**Admin login fails?**
→ Verify ADMIN_PASSWORD_HASH is set correctly
→ Try console: `localStorage.clear()` and reload

**Email not sending?**
→ Check Resend API key is active
→ Verify `info@alsuweidi.ae` can receive emails
→ Check browser console for errors

**Site not deploying?**
→ Check GitHub commit pushed successfully
→ Check Cloudflare Pages shows latest deployment
→ Hard refresh browser (Ctrl+Shift+R)

## 📞 Support

- **Supabase docs**: https://supabase.com/docs
- **Cloudflare Pages docs**: https://developers.cloudflare.com/pages
- **Resend docs**: https://resend.com/docs

## ✨ Next Steps

1. ✅ Clone repo (done)
2. ⏭️ Create Supabase project → Follow Step 1
3. ⏭️ Create Resend API key → Follow Step 2
4. ⏭️ Deploy to Cloudflare → Follow Step 3
5. ⏭️ Add custom domain (optional) → See DEPLOY.md
6. ⏭️ Start adding content via Admin panel

---

**Questions?** Check [README.md](README.md) or the specific documentation files above.

**You're all set!** 🎉
