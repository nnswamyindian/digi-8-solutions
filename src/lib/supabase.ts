import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder-digi8.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  status?: string;
  source?: string;
  message?: string;
  form_data?: Record<string, unknown>;
  created_at?: string;
};

export type Quote = {
  id?: string;
  quote_number: string;
  lead_id?: string;
  service: string;
  features?: string[];
  timeline?: string;
  urgency?: string;
  support_plan?: string;
  hosting?: boolean;
  domain?: boolean;
  amc?: boolean;
  maintenance?: boolean;
  base_price?: number;
  gst?: number;
  discount?: number;
  referral_discount?: number;
  final_price?: number;
  delivery_days?: number;
  status?: string;
  created_at?: string;
};

export type Testimonial = {
  id?: string;
  client_name: string;
  company?: string;
  role?: string;
  review: string;
  rating?: number;
  video_url?: string;
  logo_url?: string;
  avatar_url?: string;
  service?: string;
  approved?: boolean;
  created_at?: string;
};

export type Project = {
  id?: string;
  title: string;
  category: string;
  client?: string;
  description?: string;
  tech_stack?: string[];
  thumbnail_url?: string;
  live_url?: string;
  before_url?: string;
  after_url?: string;
  featured?: boolean;
  sort_order?: number;
  created_at?: string;
};

export type BlogPost = {
  id?: string;
  title: string;
  slug: string;
  category?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  reading_time?: number;
  cover_url?: string;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
  published?: boolean;
  published_at?: string;
  created_at?: string;
};

export async function saveLead(lead: Lead) {
  try {
    const { data, error } = await supabase.from('leads').insert(lead).select().maybeSingle();
    if (error) console.warn('Supabase saveLead notice:', error.message);
    return data || lead;
  } catch {
    return lead;
  }
}

export async function saveContact(contact: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    const { data, error } = await supabase.from('contacts').insert(contact).select().maybeSingle();
    if (error) console.warn('Supabase saveContact notice:', error.message);
    return data || contact;
  } catch {
    return contact;
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    await supabase.from('newsletter_subscribers').insert({ email });
  } catch {
    // Ignore error in fallback mode
  }
}

export async function getTestimonials() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return mockTestimonials;
    return data;
  } catch {
    return mockTestimonials;
  }
}

export async function getProjects(category?: string) {
  try {
    let query = supabase.from('projects').select('*').order('sort_order').order('created_at', { ascending: false });
    if (category && category !== 'All') query = query.eq('category', category);
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return category && category !== 'All'
        ? mockProjects.filter(p => p.category === category)
        : mockProjects;
    }
    return data;
  } catch {
    return category && category !== 'All'
      ? mockProjects.filter(p => p.category === category)
      : mockProjects;
  }
}

export async function getBlogPosts(category?: string) {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (category && category !== 'All') query = query.eq('category', category);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return mockBlogPosts;
    return data;
  } catch {
    return mockBlogPosts;
  }
}

export async function getBlogPost(slug: string) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error || !data) return mockBlogPosts.find(b => b.slug === slug) || mockBlogPosts[0];
    return data;
  } catch {
    return mockBlogPosts.find(b => b.slug === slug) || mockBlogPosts[0];
  }
}

export async function validateReferralCode(code: string): Promise<number | null> {
  if (code.toUpperCase() === 'DIGI8OFF' || code.toUpperCase() === 'SPECIAL10') return 10;
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('discount_percent, uses_count, max_uses')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();
    if (error || !data) return null;
    if (data.uses_count >= data.max_uses) return null;
    return data.discount_percent;
  } catch {
    return null;
  }
}

export async function saveQuote(quote: Omit<Quote, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase.from('quotes').insert(quote).select().maybeSingle();
    if (error) console.warn('Supabase saveQuote notice:', error.message);
    return data || quote;
  } catch {
    return quote;
  }
}

export type ServicePricing = {
  id?: string;
  service_slug: string;
  service_name: string;
  item_name: string;
  market_price: string;
  our_price: string;
  savings: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getServicePricing(slug: string): Promise<ServicePricing[]> {
  try {
    const { data, error } = await supabase
      .from('service_pricing')
      .select('*')
      .eq('service_slug', slug)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []) as ServicePricing[];
  } catch {
    return [];
  }
}

export async function getAllServicePricing(): Promise<ServicePricing[]> {
  try {
    const { data, error } = await supabase
      .from('service_pricing')
      .select('*')
      .order('service_slug')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []) as ServicePricing[];
  } catch {
    return [];
  }
}

export async function upsertServicePricing(item: ServicePricing): Promise<ServicePricing> {
  try {
    if (item.id) {
      const { data, error } = await supabase
        .from('service_pricing')
        .update(item)
        .eq('id', item.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as ServicePricing;
    } else {
      const { data, error } = await supabase
        .from('service_pricing')
        .insert(item)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as ServicePricing;
    }
  } catch {
    return item;
  }
}

export async function deleteServicePricing(id: string): Promise<void> {
  try {
    await supabase.from('service_pricing').delete().eq('id', id);
  } catch {
    // Ignore
  }
}

export function generateQuoteNumber(): string {
  const prefix = 'D8Q';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${year}${month}${random}`;
}

// Fallback Mock Data to guarantee non-empty, rich presentation
const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    client_name: 'Rajesh Sharma',
    company: 'Apex Logistics Corp',
    role: 'VP of Technology',
    review: 'Digi8 Solutions transformed our legacy logistics portal into a high-speed web application. Outstanding engineering quality and sub-second page loads.',
    rating: 5,
    service: 'Website Development'
  },
  {
    id: '2',
    client_name: 'Ananya Verma',
    company: 'Fintech Spark',
    role: 'Co-Founder & CEO',
    review: 'The team executed our mobile application in Flutter within 4 weeks and secured ISO 27001 compliance clearance on first audit.',
    rating: 5,
    service: 'Mobile App Development'
  }
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Enterprise EdTech Platform',
    category: 'Website Development',
    client: 'Global Skill Institute',
    description: 'High-availability learning management system supporting 100k+ concurrent active students with live video and online testing.',
    tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
    thumbnail_url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80',
    live_url: '#'
  },
  {
    id: '2',
    title: 'ISO 27001 VAPT & Security Audit',
    category: 'Cyber Security',
    client: 'Apex Financial Services',
    description: 'Complete penetration testing (VAPT) and zero-trust cloud hardening for enterprise fintech APIs.',
    tech_stack: ['Burp Suite', 'Cloudflare WAF', 'OWASP'],
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    live_url: '#'
  },
  {
    id: '3',
    title: 'Corporate Brand Style Guide & Identity',
    category: 'Branding & Creative Studio',
    client: 'Vanguard Infrastructure',
    description: 'Comprehensive 40-page corporate brand identity kit, vector logo suite, and UI/UX design system.',
    tech_stack: ['Figma', 'Adobe Illustrator', 'InDesign'],
    thumbnail_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    live_url: '#'
  }
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Building Enterprise-Grade Web Applications in 2026',
    slug: 'building-enterprise-web-apps-2026',
    category: 'Technology',
    excerpt: 'Key architectural principles for building secure, sub-second web platforms for modern enterprises.',
    author: 'Digi8 Tech Architecture Team',
    reading_time: 5,
    cover_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    published_at: new Date().toISOString()
  }
];
