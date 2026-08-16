// API Client to replace Supabase

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Lead {
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
  services?: string[];
  service?: string;
  source?: string;
  message?: string;
  form_data?: Record<string, unknown>;
  [key: string]: any;
}

export interface Quote {
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  project_type?: string;
  service?: string;
  project_details?: string;
  total_estimate?: number;
  selected_features?: any[];
  features?: string[];
  timeline?: string;
  delivery_days?: number;
  status?: string;
  quote_number?: string;
  lead_id?: string;
  [key: string]: any;
}

export interface Contact {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Generate a random 6-character alphanumeric string for quotes
export function generateQuoteNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'QT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function saveLead(lead: Lead) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }
}

export async function saveContact(contact: Contact) {
  try {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving contact:', error);
    return { success: false, error };
  }
}

export async function saveQuote(quote: Quote) {
  try {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving quote:', error);
    return { success: false, error };
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error };
  }
}

export async function verifyEmail(token: string, type: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type })
    });
    return await res.json();
  } catch (error) {
    console.error('Error verifying email:', error);
    return { success: false, error };
  }
}

// Mock Types for UI compilation until fully migrated
export interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  image_url: string;
  results: Record<string, string>;
  tags: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  read_time: string;
  author: string;
  created_at: string;
  slug: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image_url: string;
  rating: number;
}

export interface SupportTicket {
  id: number | string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  service_category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
}

export async function submitSupportTicket(ticketData: Partial<SupportTicket>) {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchTickets(): Promise<SupportTicket[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
}

export async function updateTicketStatus(id: number | string, updates: Partial<SupportTicket>) {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTicket(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    const posts = data.data || [];
    return posts.find((p: any) => p.slug === slug) || null;
  } catch (error) {
    return null;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/testimonials`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}


export async function checkAuth() {
  return !!localStorage.getItem('admin_token');
}

export async function loginAdmin(email: any, password: any) {
  try {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      return { error: null };
    } else {
      return { error: { message: res.error || 'Invalid credentials' } };
    }
  } catch (err: any) {
    return { error: { message: err.message || 'Server error' } };
  }
}

export async function logoutAdmin() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export const api = {
  get: async (path: string) => fetch(API_BASE_URL.replace('/api', '') + path).then(r => r.json()),
  post: async (path: string, body: any) => fetch(API_BASE_URL.replace('/api', '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  put: async (path: string, body: any) => fetch(API_BASE_URL.replace('/api', '') + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: async (path: string) => fetch(API_BASE_URL.replace('/api', '') + path, { method: 'DELETE' }).then(r => r.json()),
};

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ error: null })
  },
  from: (table: string) => ({
    select: () => {
      const fetcher = async () => { const res = await fetch(`${API_BASE_URL}/${table}`); const data = await res.json(); return { data: data.data || [], error: null }; };
      return {
        order: () => ({ order: () => ({ limit: fetcher, then: async (cb: any) => cb(await fetcher()) }), limit: fetcher, then: async (cb: any) => cb(await fetcher()) }),
        then: async (cb: any) => cb(await fetcher()),
        limit: fetcher,
        single: async () => { const res = await fetcher(); return { data: res.data[0] || null, error: null }; },
        maybeSingle: async () => { const res = await fetcher(); return { data: res.data[0] || null, error: null }; }
      }
    },
    insert: (payload: any) => {
      const fetcher = async () => { const res = await fetch(`${API_BASE_URL}/${table}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await res.json(); return { data: data.data, error: data.success ? null : new Error(data.error) }; };
      return { select: () => ({ maybeSingle: fetcher }), then: async (cb: any) => cb(await fetcher()) }
    },
    update: (payload: any) => ({
      eq: async (_col: string, val: string) => { const res = await fetch(`${API_BASE_URL}/${table}/${val}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await res.json(); return { data: data.data, error: data.success ? null : new Error(data.error) }; }
    }),
    delete: () => ({
      eq: async (_col: string, val: string) => { const res = await fetch(`${API_BASE_URL}/${table}/${val}`, { method: 'DELETE' }); const data = await res.json(); return { data: data.data, error: data.success ? null : new Error(data.error) }; }
    })
  })
};


export async function getAllServicePricing() {
  const res = await api.get('/api/service_pricing');
  return res.data || [];
}
export async function upsertServicePricing(pricing: ServicePricing) {
  if (pricing.id) {
    const res = await api.put(`/api/service_pricing/${pricing.id}`, pricing);
    return res;
  } else {
    const res = await api.post('/api/service_pricing', pricing);
    return res;
  }
}
export async function deleteServicePricing(id: string) {
  const res = await api.delete(`/api/service_pricing/${id}`);
  return res;
}

export interface ServicePricing { id?: string; name: string; price: string; features: string[]; }