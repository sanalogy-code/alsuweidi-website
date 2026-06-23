// Frontend database helper - simplified for static HTML pages
let supabaseClient = null;
let cacheExpiry = {};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function initSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = import.meta?.env?.VITE_SUPABASE_URL || localStorage.getItem('sb_url');
  const key = import.meta?.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sb_key');

  if (!url || !key) {
    console.error('Supabase credentials missing');
    return null;
  }

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

async function getFromCache(key) {
  const cached = localStorage.getItem(`cache_${key}`);
  const expiry = cacheExpiry[key];

  if (cached && expiry && Date.now() < expiry) {
    return JSON.parse(cached);
  }
  return null;
}

async function saveToCache(key, data) {
  localStorage.setItem(`cache_${key}`, JSON.stringify(data));
  cacheExpiry[key] = Date.now() + CACHE_TTL;
}

// Fetch functions
async function getFeaturedNews(limit = 3) {
  const cached = await getFromCache('featured_news');
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('news')
    .select('*')
    .eq('featured', true)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured news:', error);
    return [];
  }

  await saveToCache('featured_news', data || []);
  return data || [];
}

async function getAllNews() {
  const cached = await getFromCache('all_news');
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('news')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  await saveToCache('all_news', data || []);
  return data || [];
}

async function getFeaturedProjects(limit = 6) {
  const cached = await getFromCache('featured_projects');
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('year', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }

  await saveToCache('featured_projects', data || []);
  return data || [];
}

async function getAllProjects() {
  const cached = await getFromCache('all_projects');
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  await saveToCache('all_projects', data || []);
  return data || [];
}

async function getTeam() {
  const cached = await getFromCache('team');
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('team')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching team:', error);
    return [];
  }

  await saveToCache('team', data || []);
  return data || [];
}

async function getSettings() {
  const cached = await getFromCache('settings');
  if (cached) return cached;

  const client = await initSupabase();
  if (!client) return {};

  const { data, error } = await client
    .from('settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
  }

  const settings = data || {};
  await saveToCache('settings', settings);
  return settings;
}

async function sendContactEmail(name, email, message) {
  const apiKey = import.meta?.env?.VITE_RESEND_API_KEY || localStorage.getItem('resend_key');

  if (!apiKey) {
    console.error('Resend API key missing');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@alsuweidi.ae',
        to: 'info@alsuweidi.ae',
        replyTo: email,
        subject: `New contact form submission from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function clearCache() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
  cacheExpiry = {};
}

export {
  initSupabase,
  getFeaturedNews,
  getAllNews,
  getFeaturedProjects,
  getAllProjects,
  getTeam,
  getSettings,
  sendContactEmail,
  clearCache,
  escapeHtml,
};
