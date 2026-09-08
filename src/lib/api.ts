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
  id?: string | number;
  title: string;
  client?: string;
  category?: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  live_url?: string;
  before_url?: string;
  after_url?: string;
  tech_stack?: string[];
  results?: Record<string, string>;
  tags?: string[];
  featured?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface BlogPost {
  id?: string | number;
  title: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  cover_url?: string;
  category?: string;
  read_time?: string;
  reading_time?: number | string;
  author?: string;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
  published?: boolean;
  published_at?: string;
  created_at?: string;
  slug?: string;
}

export interface Testimonial {
  id?: string | number;
  name?: string;
  client_name?: string;
  role?: string;
  company?: string;
  content?: string;
  review?: string;
  image_url?: string;
  logo_url?: string;
  avatar_url?: string;
  video_url?: string;
  rating?: number;
  service?: string;
  approved?: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export interface ServicePricing {
  id?: string | number;
  service_slug?: string;
  service_name?: string;
  item_name?: string;
  market_price?: string;
  our_price?: string;
  savings?: string;
  sort_order?: number;
  is_active?: boolean;
  name?: string;
  price?: string;
  features?: string[];
  created_at?: string;
  updated_at?: string;
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
  } catch (_err) {
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

export async function getProjects(category?: string): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    const data = await res.json();
    const projects: Project[] = data.data || [];
    if (category && category !== 'All') {
      return projects.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    return projects;
  } catch (_error) {
    return [];
  }
}

export async function getBlogPosts(category?: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    const posts: BlogPost[] = data.data || [];
    if (category && category !== 'All') {
      return posts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    return posts;
  } catch (_error) {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    const posts = data.data || [];
    return posts.find((p: any) => p.slug === slug) || null;
  } catch (_error) {
    return null;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/testimonials`);
    const data = await res.json();
    return data.data || [];
  } catch (_error) {
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
  from: (table: string) => {
    const makeQueryBuilder = () => {
      const fetcher = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/${table}`);
          const data = await res.json();
          return { data: data.data || [], error: null };
        } catch (err: any) {
          return { data: [], error: err };
        }
      };

      const chain: any = {
        order: (_column?: string, _options?: { ascending?: boolean }) => chain,
        limit: (_count?: number) => chain,
        eq: (_col: string, _val: any) => chain,
        single: async () => {
          const res = await fetcher();
          return { data: res.data[0] || null, error: null };
        },
        maybeSingle: async () => {
          const res = await fetcher();
          return { data: res.data[0] || null, error: null };
        },
        then: (cb: any) => fetcher().then(cb)
      };

      return chain;
    };

    return {
      select: (_columns?: string) => makeQueryBuilder(),
      insert: (payload: any) => {
        const fetcher = async () => {
          const res = await fetch(`${API_BASE_URL}/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          return { data: data.data, error: data.success ? null : new Error(data.error) };
        };
        return {
          select: () => ({ maybeSingle: fetcher, then: (cb: any) => fetcher().then(cb) }),
          then: (cb: any) => fetcher().then(cb)
        };
      },
      update: (payload: any) => ({
        eq: async (_col: string, val: string | number) => {
          const res = await fetch(`${API_BASE_URL}/${table}/${val}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          return { data: data.data, error: data.success ? null : new Error(data.error) };
        }
      }),
      delete: () => ({
        eq: async (_col: string, val: string | number) => {
          const res = await fetch(`${API_BASE_URL}/${table}/${val}`, { method: 'DELETE' });
          const data = await res.json();
          return { data: data.data, error: data.success ? null : new Error(data.error) };
        }
      })
    };
  }
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

export async function deleteServicePricing(id: string | number) {
  const res = await api.delete(`/api/service_pricing/${id}`);
  return res;
}

// --- CAREERS PLATFORM TYPES & APIS (PHASE 1) ---

export interface ApplicationQuestion {
  id: string;
  question: string;
  type: 'short text' | 'long text' | 'number' | 'dropdown' | 'radio' | 'checkbox' | 'url' | 'file';
  required: boolean;
  options?: string[];
}

export interface JobPosting {
  id?: number | string;
  job_id: string;
  title: string;
  slug: string;
  category: string;
  job_type: string;
  work_mode: 'Remote' | 'Hybrid' | 'On-site' | string;
  location: string;
  experience: string;
  openings?: number;
  compensation?: string;
  short_description?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills?: string[];
  documents_required?: string[];
  custom_questions?: ApplicationQuestion[];
  application_deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  applications_count?: number;
}

export interface JobApplication {
  id?: number | string;
  application_id: string;
  job_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  location?: string;
  current_role?: string;
  experience?: string;
  skills?: string[];
  linkedin?: string;
  portfolio?: string;
  github?: string;
  availability?: string;
  expected_compensation?: string;
  cover_message?: string;
  resume_file?: string;
  resume_original_name?: string;
  custom_answers?: { question_id: string; question: string; answer: any }[];
  documents?: { type: string; name: string; file: string }[];
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'applied' | 'screening' | 'interview' | 'assessment' | 'selected' | 'hired';
  stage_slug?: string;
  recruiter_id?: string;
  recruiter_name?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  source?: string;
  created_at?: string;
  updated_at?: string;
  job_title?: string;
  job_category?: string;
  job_custom_questions?: ApplicationQuestion[];
}

export interface CareerStats {
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  newApplications: number;
}

// --- PHASE 2: ATS, PIPELINE, CRM & AUTOMATION TYPES ---

export interface RecruitmentStage {
  id: number;
  name: string;
  slug: string;
  stage_order: number;
  color_code: string;
  is_system: number | boolean;
  candidate_visible: number | boolean;
  candidate_label: string;
}

export interface StageHistory {
  id: number;
  application_id: string;
  from_stage?: string;
  to_stage: string;
  changed_by: string;
  reason?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface CandidateNote {
  id: number;
  application_id?: string;
  candidate_email?: string;
  author_name: string;
  author_role: string;
  note_text: string;
  is_private: number | boolean;
  created_at: string;
}

export interface CandidateTag {
  id: number;
  application_id?: string;
  candidate_email?: string;
  tag_name: string;
  color_code: string;
}

export interface RecruiterTask {
  id: number;
  application_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
}

export interface InterviewItem {
  id: number;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  interviewer_name: string;
  interviewer_email?: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback_count?: number;
  created_at?: string;
}

export interface InterviewFeedback {
  id: number;
  interview_id: number;
  application_id?: string;
  interviewer_name: string;
  technical_rating: number;
  communication_rating: number;
  problem_solving_rating: number;
  culture_fit_rating: number;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire';
  feedback_notes: string;
  submitted_at: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  category: 'acknowledgement' | 'shortlist' | 'interview' | 'offer' | 'rejection' | 'general';
  variables: string[] | string;
  is_default: number | boolean;
}

export interface EmailLog {
  id: number;
  application_id?: string;
  candidate_email: string;
  template_id?: number;
  template_name?: string;
  subject: string;
  body: string;
  status: 'sent' | 'delivered' | 'failed';
  sent_by: string;
  sent_at: string;
}

export interface AutomationRule {
  id: number;
  name: string;
  event_trigger: 'stage_change' | 'interview_scheduled';
  trigger_stage?: string;
  action_type: 'send_email';
  email_template_id: number;
  is_active: number | boolean;
  template_name?: string;
  template_subject?: string;
}

export interface CandidateCrmSummary {
  email: string;
  candidate_name: string;
  phone: string;
  location?: string;
  current_role?: string;
  experience?: string;
  recruiter_name?: string;
  total_applications: number;
  latest_application_date: string;
  latest_application_id: string;
  latest_stage: string;
  latest_job_title: string;
  tags?: CandidateTag[];
}

export interface CandidateFullProfile {
  profile: {
    candidate_name: string;
    email: string;
    phone: string;
    location?: string;
    current_role?: string;
    experience?: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
    skills?: string[];
    created_at: string;
  };
  applications: JobApplication[];
  notes: CandidateNote[];
  tags: CandidateTag[];
  interviews: InterviewItem[];
  emailLogs: EmailLog[];
}

export interface PublicApplicationStatus {
  application_id: string;
  candidate_name: string;
  job_title: string;
  job_location: string;
  job_type: string;
  work_mode: string;
  applied_date: string;
  current_stage_slug: string;
  current_stage_label: string;
  is_concluded: boolean;
  roadmap: {
    slug: string;
    label: string;
    order: number;
    status: 'completed' | 'current' | 'upcoming';
  }[];
}

export async function fetchCareersStats(): Promise<CareerStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/stats`);
    const data = await res.json();
    return data.data || { activeJobs: 0, draftJobs: 0, closedJobs: 0, totalApplications: 0, newApplications: 0 };
  } catch (_err) {
    return { activeJobs: 0, draftJobs: 0, closedJobs: 0, totalApplications: 0, newApplications: 0 };
  }
}

export async function fetchCareersJobs(params?: {
  all?: boolean;
  category?: string;
  job_type?: string;
  work_mode?: string;
  search?: string;
  status?: string;
}): Promise<JobPosting[]> {
  try {
    const query = new URLSearchParams();
    if (params?.all) query.append('all', 'true');
    if (params?.category) query.append('category', params.category);
    if (params?.job_type) query.append('job_type', params.job_type);
    if (params?.work_mode) query.append('work_mode', params.work_mode);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/careers/jobs?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch (_err) {
    return [];
  }
}

export async function fetchJobBySlugOrId(idOrSlug: string): Promise<JobPosting | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/jobs/${idOrSlug}`);
    const data = await res.json();
    if (data.success && data.data) return data.data;
    return null;
  } catch (_err) {
    return null;
  }
}

export async function createCareerJob(jobData: Partial<JobPosting>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCareerJob(id: string | number, jobData: Partial<JobPosting>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCareerJob(id: string | number) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/jobs/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitCareerApplication(formData: FormData) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/apply`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Submission failed' };
  }
}

export async function fetchCareerApplications(params?: {
  job_id?: string;
  status?: string;
  experience?: string;
  search?: string;
}): Promise<JobApplication[]> {
  try {
    const query = new URLSearchParams();
    if (params?.job_id) query.append('job_id', params.job_id);
    if (params?.status) query.append('status', params.status);
    if (params?.experience) query.append('experience', params.experience);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/careers/applications?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch (_err) {
    return [];
  }
}

export async function fetchCareerApplicationById(id: string | number): Promise<JobApplication | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/applications/${id}`);
    const data = await res.json();
    return data.data || null;
  } catch (_err) {
    return null;
  }
}

export async function updateCareerApplication(id: string | number, updates: Partial<JobApplication>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCareerApplication(id: string | number) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/applications/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function getResumeDocumentUrl(filename?: string, download = false): string {
  if (!filename) return '#';
  return `${API_BASE_URL}/careers/documents/${filename}${download ? '?download=true' : ''}`;
}

// --- PHASE 2 API CLIENT FUNCTIONS ---

export async function fetchRecruitmentStages(): Promise<RecruitmentStage[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/stages`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createRecruitmentStage(stageData: Partial<RecruitmentStage>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateRecruitmentStage(id: number | string, stageData: Partial<RecruitmentStage>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/stages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderRecruitmentStages(stages: { id: number; stage_order: number }[]) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/stages/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stages })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteRecruitmentStage(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/stages/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateApplicationStage(
  id: string | number,
  payload: {
    stage_slug: string;
    reason?: string;
    changed_by?: string;
    recruiter_id?: string;
    recruiter_name?: string;
    priority?: string;
  }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/applications/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchApplicationTimeline(id: string | number) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/applications/${id}/timeline`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function fetchCandidatesCrm(): Promise<CandidateCrmSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/candidates`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function fetchCandidateProfile(email: string): Promise<CandidateFullProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/candidates/${encodeURIComponent(email)}`);
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function fetchCandidateNotes(params: { application_id?: string; candidate_email?: string }): Promise<CandidateNote[]> {
  try {
    const query = new URLSearchParams();
    if (params.application_id) query.append('application_id', params.application_id);
    if (params.candidate_email) query.append('candidate_email', params.candidate_email);
    const res = await fetch(`${API_BASE_URL}/careers/notes?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createCandidateNote(payload: Partial<CandidateNote>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCandidateNote(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/notes/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchCandidateTags(params: { application_id?: string; candidate_email?: string }): Promise<CandidateTag[]> {
  try {
    const query = new URLSearchParams();
    if (params.application_id) query.append('application_id', params.application_id);
    if (params.candidate_email) query.append('candidate_email', params.candidate_email);
    const res = await fetch(`${API_BASE_URL}/careers/tags?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createCandidateTag(payload: { application_id?: string; candidate_email?: string; tag_name: string; color_code?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCandidateTag(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/tags/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchRecruiterTasks(params?: { application_id?: string; status?: string; assigned_to?: string }): Promise<RecruiterTask[]> {
  try {
    const query = new URLSearchParams();
    if (params?.application_id) query.append('application_id', params.application_id);
    if (params?.status) query.append('status', params.status);
    if (params?.assigned_to) query.append('assigned_to', params.assigned_to);
    const res = await fetch(`${API_BASE_URL}/careers/tasks?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createRecruiterTask(payload: Partial<RecruiterTask>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateRecruiterTask(id: number | string, payload: Partial<RecruiterTask>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteRecruiterTask(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/tasks/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchInterviews(params?: { application_id?: string; status?: string }): Promise<InterviewItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.application_id) query.append('application_id', params.application_id);
    if (params?.status) query.append('status', params.status);
    const res = await fetch(`${API_BASE_URL}/careers/interviews?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function scheduleInterview(payload: Partial<InterviewItem>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateInterview(id: number | string, payload: Partial<InterviewItem>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/interviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteInterview(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/interviews/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchInterviewFeedback(interviewIdOrAppId: number | string): Promise<InterviewFeedback[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/interviews/${interviewIdOrAppId}/feedback`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function submitInterviewFeedback(interviewId: number | string, payload: Partial<InterviewFeedback>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/interviews/${interviewId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/email-templates`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createEmailTemplate(payload: Partial<EmailTemplate>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/email-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateEmailTemplate(id: number | string, payload: Partial<EmailTemplate>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/email-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEmailTemplate(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/email-templates/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendRecruiterEmailApi(payload: {
  application_id?: string;
  to: string;
  subject: string;
  body: string;
  template_id?: number;
  sent_by?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/emails/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchEmailLogs(params?: { application_id?: string; candidate_email?: string }): Promise<EmailLog[]> {
  try {
    const query = new URLSearchParams();
    if (params?.application_id) query.append('application_id', params.application_id);
    if (params?.candidate_email) query.append('candidate_email', params.candidate_email);
    const res = await fetch(`${API_BASE_URL}/careers/emails/logs?${query.toString()}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function fetchAutomationRules(): Promise<AutomationRule[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/automation-rules`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function createAutomationRule(payload: Partial<AutomationRule>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/automation-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAutomationRule(id: number | string, payload: Partial<AutomationRule>) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/automation-rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAutomationRule(id: number | string) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/automation-rules/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchFunnelAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/analytics/funnel`);
    const data = await res.json();
    return data.data || { totalApplications: 0, funnel: [] };
  } catch {
    return { totalApplications: 0, funnel: [] };
  }
}

export async function fetchTimeToHireAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/analytics/time-to-hire`);
    const data = await res.json();
    return data.data || { averageTimeToHireDays: 0, averageDaysPerStage: [] };
  } catch {
    return { averageTimeToHireDays: 0, averageDaysPerStage: [] };
  }
}

export async function fetchAuditLogs(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/audit-logs?limit=${limit}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function fetchPublicApplicationStatus(applicationId: string, email: string): Promise<{ success: boolean; data?: PublicApplicationStatus; error?: string }> {
  try {
    const query = new URLSearchParams({
      application_id: applicationId.trim(),
      email: email.trim().toLowerCase()
    });
    const res = await fetch(`${API_BASE_URL}/careers/public/status?${query.toString()}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to check status' };
  }
}

export async function checkSmtpStatus(): Promise<{ success: boolean; message: string; user?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL.replace('/api', '')}/api/system/smtp-status`);
    const data = await res.json();
    return data.data || { success: false, message: 'No response from server' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to server' };
  }
}

export async function testSmtpDispatch(targetEmail?: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/emails/test-smtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: targetEmail })
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, message: data.message || 'Test email dispatched successfully' };
    }
    return { success: false, message: data.error || 'Failed to send test email', error: data.error };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error', error: err.message };
  }
}