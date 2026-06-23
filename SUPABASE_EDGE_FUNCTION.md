# Supabase Edge Function - Contact Form Email Handler

This guide shows how to deploy the contact form handler to Supabase Edge Functions.

## What It Does

When someone submits the contact form on your site:
1. Form data is sent to your Supabase Edge Function
2. Function validates the data server-side
3. Function calls Resend API with your secret key (kept safe)
4. Email is sent to `info@alsuweidi.ae`
5. Response sent back to browser

## Deploy to Supabase

### Step 1: Open Supabase Dashboard

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your **ALSUWEIDI Website** project
3. Go to **Edge Functions** (left sidebar under Build)

### Step 2: Create New Function

1. Click **Create a new function**
2. Name it: `contact`
3. Choose runtime: **TypeScript**
4. Click **Create function**

### Step 3: Paste Function Code

1. Delete the placeholder code in the editor
2. Copy the entire contents of `supabase-edge-function-contact.ts` file from your repo
3. Paste it into the Supabase editor
4. Click **Deploy**

### Step 4: Add Environment Variable

The function needs your Resend API key.

1. In the Supabase Edge Function page, click **Settings** (or look for environment variables)
2. Add a new environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_xxxx...` (your actual Resend API key)
3. Click **Save**

### Step 5: Copy Your Function URL

After deployment, you'll see a function URL. It looks like:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/contact
```

This is automatically used by your contact form (it reads your Supabase URL).

## Test It

1. Visit your site at `https://alsuweidi-website.pages.dev`
2. Go to `/Contact.dc.html`
3. Fill out the contact form
4. Click "Send Message"
5. Should see green success message
6. Check `info@alsuweidi.ae` for the email

## Troubleshooting

**Email not sending?**
- Check that RESEND_API_KEY is set correctly in Supabase
- Verify the function deployed without errors (check the deployment logs)
- Check Resend account is active

**Function errors?**
- Check Supabase Edge Function logs (Dashboard → Edge Functions → Function logs)
- Look for syntax errors or missing imports

**Form not calling function?**
- Open browser console (F12) → Network tab
- Try submitting form
- Should see a request to `your-project.supabase.co/functions/v1/contact`
- If it fails, check the response for errors

**"Supabase URL not configured" error?**
- Your site needs to know your Supabase URL
- Either:
  - Set `VITE_SUPABASE_URL` environment variable in Cloudflare Pages, OR
  - Open browser console and run: `localStorage.setItem('sb_url', 'https://YOUR_PROJECT.supabase.co')`

## Security

✅ **API Key Protected**: Resend key only on Supabase servers
✅ **Validated**: Server-side email validation
✅ **CORS Enabled**: Allows requests from your domain
✅ **Error Safe**: Errors don't expose sensitive info

## Next Steps

Once deployed and tested:
1. All contact form submissions go to your inbox
2. Fully automated email system
3. No more API key exposure

That's it! You now have a secure contact form. 🎉
