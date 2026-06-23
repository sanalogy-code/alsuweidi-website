# ALSUWEIDI Website - CMS & Deployment Setup

## 1. Supabase Setup

### Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (free tier)
3. Wait for the project to initialize
4. Go to **Settings > API** and copy:
   - Project URL
   - Anon Key (public)

### Create Database Tables

Run these SQL queries in **Supabase SQL Editor**:

```sql
-- News table
CREATE TABLE news (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  category TEXT,
  date TEXT,
  body TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  sector TEXT,
  location TEXT,
  year INT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team table
CREATE TABLE team (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phone TEXT,
  email TEXT,
  address TEXT,
  headline TEXT,
  subtext TEXT,
  admin_password_hash TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read
CREATE POLICY "Allow public read" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON team FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON settings FOR SELECT USING (true);
```

### Add Initial Data

```sql
-- Insert sample news
INSERT INTO news (title, category, date, body, featured) VALUES
  ('ALSUWEIDI Unveils New Identity — Engineering Integrity, Freshly Expressed', 'Brand Relaunch', 'June 2026', 'After 38 years, we mark a new era with a refreshed visual identity.', TRUE),
  ('Ranked #215 — ENR Top International Design Firms 2024', 'Recognition', 'April 2024', 'ALSUWEIDI earns a top-250 ranking for the second consecutive year.', TRUE),
  ('UAE''s Best Multidisciplinary Engineering Firm, 2025', 'Award', 'Feb 2025', 'Recognised for excellence in integrated engineering delivery.', TRUE);

-- Insert sample projects
INSERT INTO projects (name, sector, location, year, featured) VALUES
  ('Al Maryah Island Office Tower', 'Commercial', 'Abu Dhabi', 2024, TRUE),
  ('Al Reem Island Community Phase III', 'Residential', 'Abu Dhabi', 2023, TRUE),
  ('MODON Industrial Hub Phase II', 'Industrial', 'Abu Dhabi', 2024, TRUE),
  ('Grand Hyatt Al Khaznah', 'Hospitality', 'Al Ain', 2023, TRUE),
  ('Sorbonne University Abu Dhabi', 'Education', 'Abu Dhabi', 2021, TRUE),
  ('Masdar City Infrastructure', 'Infrastructure', 'Abu Dhabi', 2022, TRUE);

-- Insert sample team
INSERT INTO team (name, role, bio, order) VALUES
  ('Mohammed Al Suweidi', 'Founder & Chairman', 'Co-founded ALSUWEIDI in 1988.', 1),
  ('Ahmad Al Suweidi', 'Co-Founder & CEO', 'Leads strategy and operations.', 2),
  ('Sara Al Mansoori', 'Technical Director', 'Leads the technical delivery team.', 3),
  ('Khalid Al Rashidi', 'Operations Director', 'Oversees project delivery.', 4);

-- Insert settings
INSERT INTO settings (phone, email, address, headline, subtext, admin_password_hash) VALUES
  ('+971 2 444 0000', 'info@alsuweidi.ae', 'Khalidiyah, Abu Dhabi, UAE', 'Old and new. Locally rooted, globally capable.', 'Since 1988, ALSUWEIDI has engineered the UAE''s skyline, infrastructure, and communities.', 'your-hashed-password-here');
```

## 2. Admin Password Setup

Generate a secure password hash:

1. Open browser console (F12)
2. Run:
   ```javascript
   import { AUTH } from './config.js';
   const hash = await AUTH.hashPassword('your-secure-password');
   console.log(hash);
   ```
3. Copy the hash and update the `settings` table with this hash
4. Or set it in environment: `ADMIN_PASSWORD_HASH=your-hash`

## 3. Resend Email Service Setup

1. Go to [resend.com](https://resend.com) and sign up
2. Create a free account
3. Go to **API Keys** and create a new API key
4. Add to `.env`:
   ```
   VITE_RESEND_API_KEY=re_your_key_here
   ```

## 4. Configure Environment Variables

Create a `.env.local` file (or use Cloudflare Pages secrets):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESEND_API_KEY=re_your-key
ADMIN_PASSWORD_HASH=your-hash
```

## 5. Cloudflare Pages Deployment

### Connect GitHub Repository

1. Push code to GitHub: `git push origin main`
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Click **Create a project** > **Connect to Git**
4. Select the `alsuweidi-website` repository
5. Build settings:
   - **Framework preset**: None
   - **Build command**: (leave blank - no build step)
   - **Build output directory**: `/` (root directory)
6. Add environment variables in **Settings > Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RESEND_API_KEY`
   - `ADMIN_PASSWORD_HASH`

### Custom Domain
1. In Cloudflare Pages > Domain > Custom domains
2. Add your domain (e.g., `alsuweidi.ae`)
3. Point your DNS to Cloudflare nameservers

## 6. Local Development

```bash
# Install dependencies (optional - only needed if using build tools)
npm install

# For local testing with environment variables
# Create .env.local file with your credentials

# Access the site
# Admin: http://localhost:5173/Admin.dc.html
# Homepage: http://localhost:5173/Homepage.dc.html
```

## 7. File Structure

```
alsuweidi-website/
├── config.js           # Supabase & email integration
├── .env.example        # Environment template
├── Admin.dc.html       # Content management panel
├── Homepage.dc.html    # Homepage (reads from Supabase)
├── Portfolio.dc.html   # Projects page (reads from Supabase)
├── About.dc.html       # About/Team page (reads from Supabase)
├── News.dc.html        # News page (reads from Supabase)
├── Contact.dc.html     # Contact form (uses Resend)
├── support.js          # DC framework support
├── colors_and_type.css # Global styles
└── assets/             # Images & fonts
```

## Troubleshooting

**Environment variables not loading?**
- For Cloudflare Pages, use Settings > Environment variables
- For local dev, create `.env.local` file
- Restart your dev server after changing env vars

**Can't connect to Supabase?**
- Check URL and Anon Key are correct
- Verify RLS policies allow public read
- Check browser console for errors

**Email not sending?**
- Verify Resend API key is correct
- Check `info@alsuweidi.ae` is receiving emails
- Resend free tier has limits; check quota

**Admin login not working?**
- Make sure you've set the password hash in the `settings` table
- Generate hash using the `AUTH.hashPassword()` function
- Check browser console for errors
