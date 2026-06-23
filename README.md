# ALSUWEIDI Website - Headless CMS Architecture

A modern, static website with a headless CMS built on **Supabase**, email powered by **Resend**, and deployed on **Cloudflare Pages**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                          │
│              (Static HTML hosting + CDN)                     │
├─────────────────────────────────────────────────────────────┤
│  Homepage.dc.html  |  Portfolio.dc.html  |  Contact.dc.html │
│   News.dc.html     |   About.dc.html     |   Admin.dc.html   │
├─────────────────────────────────────────────────────────────┤
│              JavaScript (db-helper.js, config.js)            │
├──────────────────┬──────────────────┬───────────────────────┤
│                  │                  │                       │
▼                  ▼                  ▼                       │
Supabase    →   Resend Email   →   Browser Cache       ┌─────┘
Database          Service           (localStorage)     │
- news                                                 │
- projects                                            │
- team                                           Local Development
- settings                                       (via .env.local)
```

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hosting** | Cloudflare Pages | Static site CDN + Auto-deployment |
| **Database** | Supabase PostgreSQL | Content management (news, projects, team) |
| **Auth** | SHA-256 hashing | Admin password verification |
| **Email** | Resend | Contact form submissions |
| **Caching** | Browser localStorage | 5-minute client-side cache |
| **Framework** | DC (custom HTML framework) | Component-based static pages |

## File Structure

```
alsuweidi-website/
├── Admin.dc.html          # Admin panel - create/edit/delete content
├── Homepage.dc.html       # Homepage - featured news & projects
├── Portfolio.dc.html      # Projects page - all projects
├── About.dc.html          # Team page
├── News.dc.html           # News archive
├── Contact.dc.html        # Contact form with email
├── Services.dc.html       # Services page
├── config.js              # Supabase & Resend API configuration
├── db-helper.js           # Frontend database functions (cached)
├── support.js             # DC framework runtime
├── SETUP.md               # Initial setup guide
├── DEPLOY.md              # Cloudflare Pages deployment
├── .env.example           # Environment variables template
└── assets/                # Logos, fonts, images
```

## Getting Started

### For Development

1. **Set up Supabase** (follow [SETUP.md](SETUP.md))
2. **Get Resend API key**
3. **Create `.env.local`** with credentials
4. **Open any `.dc.html` file** in a browser

The site is fully static — no build step required.

### For Production

Follow [DEPLOY.md](DEPLOY.md) to deploy on Cloudflare Pages with automatic CI/CD.

## How It Works

### Public Pages (Homepage, Portfolio, News, About)

1. Page loads → imports `db-helper.js`
2. `db-helper` checks localStorage cache
3. If no cache (or expired), fetches from Supabase
4. Data rendered in HTML
5. Cache set for 5 minutes

```javascript
import { getFeaturedNews } from './db-helper.js';

const news = await getFeaturedNews();
// Render news items...
```

### Admin Panel

1. Login page with password verification
2. Admin enters password → hashed with SHA-256
3. Hash compared against Supabase `settings.admin_password_hash`
4. If match → session starts (stored in sessionStorage)
5. Admin can create/edit/delete content via Supabase

```javascript
const { DB, AUTH } = await import('./config.js');

const hash = await AUTH.hashPassword(userPassword);
if (hash === settings.admin_password_hash) {
  // Allow access
}
```

### Contact Form

1. User fills form and submits
2. Form handler validates input
3. Email sent via Resend API
4. Success/error message shown

```javascript
const result = await sendContactEmail(name, email, message);
// Email sent to info@alsuweidi.ae
```

## Database Schema

### `news` table
```sql
id          BIGINT PRIMARY KEY
title       TEXT NOT NULL
category    TEXT
date        TEXT
body        TEXT
featured    BOOLEAN (max 3 on homepage)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### `projects` table
```sql
id          BIGINT PRIMARY KEY
name        TEXT NOT NULL
sector      TEXT
location    TEXT
year        INT
featured    BOOLEAN (max 6 on homepage)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### `team` table
```sql
id          BIGINT PRIMARY KEY
name        TEXT NOT NULL
role        TEXT
bio         TEXT
order       INT (for sorting)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### `settings` table
```sql
id                      BIGINT PRIMARY KEY
phone                   TEXT
email                   TEXT
address                 TEXT
headline                TEXT (homepage hero)
subtext                 TEXT (homepage hero)
admin_password_hash     TEXT (SHA-256)
updated_at              TIMESTAMP
```

## API Endpoints (Supabase)

All requests go through Supabase JavaScript SDK:

```javascript
const { data } = await supabase
  .from('news')
  .select('*')
  .eq('featured', true)
  .order('date', { ascending: false });
```

Public read access enabled via RLS policies. No authentication required for read.

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Resend
VITE_RESEND_API_KEY=re_...

# Admin
ADMIN_PASSWORD_HASH=abc123... (SHA-256)
```

For local dev, create `.env.local`. For Cloudflare Pages, add via dashboard.

## Security Notes

### What's Public
- News, projects, team data (read-only)
- Site settings (read-only)
- Contact form endpoint (POST validated)

### What's Protected
- Admin password (hashed with SHA-256)
- Resend API key (server-side, never exposed)
- Supabase connection (anon key only)

### RLS Policies
- Public tables allow SELECT (read)
- Write operations restricted (admin only, via dashboard)

## Performance

- **Cache**: 5-minute localStorage cache reduces API calls
- **CDN**: Cloudflare Pages serves all HTML from edge locations
- **Database**: Supabase PostgreSQL with indexed queries
- **Bandwidth**: HTML files (no large bundles to download)

## Scaling

Current setup handles:
- **10,000+ visitors/month** easily
- Supabase free tier: 500K API calls/month
- Resend free tier: 100 emails/day

To scale:
1. Upgrade Supabase plan (PostgreSQL scaling)
2. Upgrade Resend plan (email volume)
3. Cloudflare Pages is unlimited traffic at tier cost

## Development

### Add New Content Type

1. Create table in Supabase
2. Add CRUD functions to `config.js`
3. Add read functions to `db-helper.js`
4. Import and use in pages

### Customize Admin Panel

The admin panel at `Admin.dc.html` can be extended:
- Add new sections in sidebar
- Add form fields for new table columns
- Modify validation rules

### Extend Pages

Copy the pattern from `Homepage.dc.html`:
```javascript
import { getData } from './db-helper.js';
const data = await getData();
// Render in HTML
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Content not showing | Check Supabase credentials, verify table data exists |
| Admin login fails | Verify password hash in settings table |
| Email not sending | Check Resend API key, verify recipient email |
| Slow page load | Clear cache: `localStorage.clear()` |
| 404 errors | Verify file paths, check _redirects config |

## Deployment

### Automatic (Recommended)
Push to GitHub → Cloudflare auto-deploys

### Manual
```bash
git push origin main
# Cloudflare redeploys in ~30 seconds
```

### Rollback
Use Cloudflare Pages dashboard → Deployments → Rollback

## Monitoring

- **Analytics**: Cloudflare Pages dashboard
- **Errors**: Browser console + Supabase logs
- **Email**: Resend dashboard
- **Uptime**: Cloudflare status page

## License & Support

Built with:
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Cloudflare Pages](https://pages.cloudflare.com) - Free hosting
- [Resend](https://resend.com) - Email for developers

## Next Steps

1. Follow [SETUP.md](SETUP.md) to initialize Supabase
2. Configure environment variables
3. Follow [DEPLOY.md](DEPLOY.md) to deploy to Cloudflare Pages
4. Set up custom domain and SSL (automatic via Cloudflare)
5. Start adding content through the Admin panel

---

**Built for ALSUWEIDI** | Engineering integrity and humanity since 1988
