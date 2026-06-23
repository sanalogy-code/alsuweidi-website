// Configuration for Supabase and external services
const CONFIG = {
  supabase: {
    url: import.meta.env?.VITE_SUPABASE_URL || localStorage.getItem('sb_url') || '',
    anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sb_key') || '',
  },
  resend: {
    apiKey: import.meta.env?.VITE_RESEND_API_KEY || localStorage.getItem('resend_key') || '',
  },
};

// Supabase client initialization
let supabaseClient = null;

async function initSupabase() {
  if (supabaseClient) return supabaseClient;

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');

  if (!CONFIG.supabase.url || !CONFIG.supabase.anonKey) {
    console.error('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    return null;
  }

  supabaseClient = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  return supabaseClient;
}

// Supabase operations
const DB = {
  async getNews(featuredOnly = false) {
    const client = await initSupabase();
    if (!client) return [];

    let query = client.from('news').select('*').order('date', { ascending: false });
    if (featuredOnly) query = query.eq('featured', true);
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }
    return data || [];
  },

  async getProjects(featuredOnly = false) {
    const client = await initSupabase();
    if (!client) return [];

    let query = client.from('projects').select('*').order('year', { ascending: false });
    if (featuredOnly) query = query.eq('featured', true).limit(6);
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data || [];
  },

  async getTeam() {
    const client = await initSupabase();
    if (!client) return [];

    const { data, error } = await client.from('team').select('*').order('order', { ascending: true });

    if (error) {
      console.error('Error fetching team:', error);
      return [];
    }
    return data || [];
  },

  async getSettings() {
    const client = await initSupabase();
    if (!client) return {};

    const { data, error } = await client.from('settings').select('*').single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
    }
    return data || {};
  },

  async addNews(item) {
    const client = await initSupabase();
    if (!client) return null;

    const { data, error } = await client.from('news').insert([item]).select();
    if (error) console.error('Error adding news:', error);
    return data?.[0] || null;
  },

  async updateNews(id, item) {
    const client = await initSupabase();
    if (!client) return null;

    const { data, error } = await client.from('news').update(item).eq('id', id).select();
    if (error) console.error('Error updating news:', error);
    return data?.[0] || null;
  },

  async deleteNews(id) {
    const client = await initSupabase();
    if (!client) return false;

    const { error } = await client.from('news').delete().eq('id', id);
    if (error) {
      console.error('Error deleting news:', error);
      return false;
    }
    return true;
  },

  async addProject(item) {
    const client = await initSupabase();
    if (!client) return null;

    const { data, error } = await client.from('projects').insert([item]).select();
    if (error) console.error('Error adding project:', error);
    return data?.[0] || null;
  },

  async updateProject(id, item) {
    const client = await initSupabase();
    if (!client) return null;

    const { data, error } = await client.from('projects').update(item).eq('id', id).select();
    if (error) console.error('Error updating project:', error);
    return data?.[0] || null;
  },

  async deleteProject(id) {
    const client = await initSupabase();
    if (!client) return false;

    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    return true;
  },

  async addTeamMember(item) {
    const client = await initSupabase();
    if (!client) return null;

    const { data, error } = await client.from('team').insert([item]).select();
    if (error) console.error('Error adding team member:', error);
    return data?.[0] || null;
  },

  async updateTeamMember(id, item) {
    const client = await initSupabase();
    if (!client) return null;

    const { data, error } = await client.from('team').update(item).eq('id', id).select();
    if (error) console.error('Error updating team member:', error);
    return data?.[0] || null;
  },

  async deleteTeamMember(id) {
    const client = await initSupabase();
    if (!client) return false;

    const { error } = await client.from('team').delete().eq('id', id);
    if (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
    return true;
  },

  async updateSettings(item) {
    const client = await initSupabase();
    if (!client) return null;

    const existing = await this.getSettings();

    let result;
    if (existing?.id) {
      const { data, error } = await client.from('settings').update(item).eq('id', existing.id).select();
      result = { data, error };
    } else {
      const { data, error } = await client.from('settings').insert([item]).select();
      result = { data, error };
    }

    if (result.error) console.error('Error updating settings:', result.error);
    return result.data?.[0] || null;
  },
};

// Password hashing (use bcrypt or simple hash for demo)
const AUTH = {
  // In production, use proper password hashing with bcrypt
  // For now, using a simple approach - replace with real bcrypt in production
  async hashPassword(pwd) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async verifyPassword(pwd, hash) {
    const computed = await this.hashPassword(pwd);
    return computed === hash;
  },
};

// Resend email service
const EMAIL = {
  async sendContactForm(name, email, message) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.resend.apiKey}`,
        },
        body: JSON.stringify({
          from: 'noreply@alsuweidi.ae',
          to: 'info@alsuweidi.ae',
          replyTo: email,
          subject: `New contact form submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
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
  },
};

export { DB, AUTH, EMAIL, CONFIG, initSupabase };
