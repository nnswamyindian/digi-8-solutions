import { buildApiUrl } from './api';

export interface ProductFeature {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
}

export interface ProductScreenshot {
  id?: string;
  url: string;
  caption?: string;
  display_order?: number;
}

export interface ProductPlan {
  id?: string;
  plan_name: string;
  price: number;
  currency: string;
  billing_interval: string; // 'month' | 'year' | 'one-time' | 'user/month'
  features: string[];
  usage_limits?: string;
  is_featured?: boolean;
  cta_label?: string;
  cta_destination?: 'demo' | 'quote' | 'website' | 'app';
}

export interface ProductFaq {
  id?: string;
  question: string;
  answer: string;
  display_order?: number;
}

export interface ProductSpecifications {
  platforms?: string;
  devices?: string;
  hardware?: string;
  deployment?: string;
  compliance?: string;
  integrations?: string;
  roles?: string;
}

export interface ProductDemoOptions {
  live_demo_available?: boolean;
  video_demo_available?: boolean;
  schedule_demo_available?: boolean;
  request_account_available?: boolean;
}

export interface ProductQuotationOptions {
  customization_available?: boolean;
  hardware_bundle_available?: boolean;
  enterprise_licensing_available?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  product_type: string;
  logo_url: string;
  thumbnail_url: string;
  banner_url: string;
  official_website_url?: string;
  application_url?: string;
  login_url?: string;
  demo_url?: string;
  video_demo_url?: string;
  documentation_url?: string;
  support_url?: string;
  pricing_model: string;
  currency: string;
  starting_price: number;
  monthly_price?: number;
  annual_price?: number;
  trial_available?: boolean;
  trial_days?: number;
  setup_fee?: number;
  pricing_notes?: string;
  display_price?: boolean;
  is_featured: boolean;
  is_published: boolean;
  status: 'draft' | 'published' | 'archived';
  display_order: number;
  brand_color?: string;
  card_color?: string;
  seo_title?: string;
  seo_description?: string;
  features: ProductFeature[];
  benefits: string[];
  screenshots: ProductScreenshot[];
  plans: ProductPlan[];
  specifications: ProductSpecifications;
  faqs: ProductFaq[];
  demo_options: ProductDemoOptions;
  quotation_options: ProductQuotationOptions;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export interface DemoRequest {
  id: number;
  request_reference: string;
  product_id?: number;
  product_name: string;
  product_slug?: string;
  customer_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  preferred_date?: string;
  preferred_time?: string;
  number_of_users?: string;
  requirements?: string;
  preferred_contact_method?: string;
  assigned_to?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'demo_completed' | 'follow_up_required' | 'converted' | 'closed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductQuoteRequest {
  id: number;
  request_reference: string;
  product_id?: number;
  product_name: string;
  product_slug?: string;
  customer_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  requirement_type: string;
  requirements: string;
  requested_features: string[];
  expected_users?: string;
  integration_requirements?: string;
  budget_range?: string;
  expected_timeline?: string;
  notes?: string;
  status: 'new' | 'reviewed' | 'quoted' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  archived: number;
  total_demos: number;
  pending_demos: number;
  total_quotations: number;
  pending_quotations: number;
}

// ──────────────────────────────────────────────
// PUBLIC CLIENT APIS
// ──────────────────────────────────────────────

export async function fetchPublicProducts(params?: {
  category?: string;
  search?: string;
  featured_only?: boolean;
}): Promise<{ success: boolean; data: Product[]; count: number; error?: string }> {
  try {
    const qs = new URLSearchParams();
    if (params?.category) qs.append('category', params.category);
    if (params?.search) qs.append('search', params.search);
    if (params?.featured_only) qs.append('featured_only', 'true');
    const url = buildApiUrl(`/api/products/catalog?${qs.toString()}`);
    const res = await fetch(url);
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], count: 0, error: err.message };
  }
}

export async function fetchProductCategories(): Promise<string[]> {
  try {
    const res = await fetch(buildApiUrl('/api/products/categories'));
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string,
  isPreview = false
): Promise<{ success: boolean; data?: { product: Product; related: Product[] }; error?: string }> {
  try {
    const previewQuery = isPreview ? '?preview=true' : '';
    const res = await fetch(buildApiUrl(`/api/products/slug/${encodeURIComponent(slug)}${previewQuery}`));
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitDemoRequest(
  slug: string,
  payload: Partial<DemoRequest>
): Promise<{ success: boolean; message?: string; reference?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/products/${encodeURIComponent(slug)}/demo-requests`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitProductQuoteRequest(
  slug: string,
  payload: Partial<ProductQuoteRequest>
): Promise<{ success: boolean; message?: string; reference?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/products/${encodeURIComponent(slug)}/quotation-requests`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ──────────────────────────────────────────────
// ADMIN CLIENT APIS
// ──────────────────────────────────────────────

export async function fetchAdminProductStats(): Promise<{ success: boolean; data?: ProductStats; error?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/admin/products/stats'));
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminProducts(params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<{ success: boolean; data: Product[]; count: number; error?: string }> {
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.category) qs.append('category', params.category);
    if (params?.search) qs.append('search', params.search);
    const res = await fetch(buildApiUrl(`/api/admin/products?${qs.toString()}`));
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], count: 0, error: err.message };
  }
}

export async function fetchAdminProduct(id: number | string): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/products/${id}`));
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminProduct(
  payload: Partial<Product>,
  id?: number | string
): Promise<{ success: boolean; data?: Product; message?: string; error?: string }> {
  try {
    const isEdit = Boolean(id);
    const url = isEdit ? buildApiUrl(`/api/admin/products/${id}`) : buildApiUrl('/api/admin/products');
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function publishAdminProduct(id: number | string): Promise<{ success: boolean; message?: string; data?: Product; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/products/${id}/publish`), { method: 'PATCH' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function unpublishAdminProduct(id: number | string): Promise<{ success: boolean; message?: string; data?: Product; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/products/${id}/unpublish`), { method: 'PATCH' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function archiveAdminProduct(id: number | string): Promise<{ success: boolean; message?: string; data?: Product; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/products/${id}/archive`), { method: 'PATCH' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminProduct(id: number | string): Promise<{ success: boolean; message?: string; action?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/products/${id}`), { method: 'DELETE' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function duplicateAdminProduct(id: number | string): Promise<{ success: boolean; message?: string; data?: Product; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/products/${id}/duplicate`), { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function uploadProductImage(file: File): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(buildApiUrl('/api/admin/products/upload-image'), {
      method: 'POST',
      body: formData
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchDemoRequests(params?: {
  status?: string;
  search?: string;
}): Promise<{ success: boolean; data: DemoRequest[]; count: number; error?: string }> {
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.search) qs.append('search', params.search);
    const res = await fetch(buildApiUrl(`/api/admin/demo-requests?${qs.toString()}`));
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], count: 0, error: err.message };
  }
}

export async function updateDemoRequest(
  id: number | string,
  payload: { status?: string; notes?: string; assigned_to?: string }
): Promise<{ success: boolean; message?: string; data?: DemoRequest; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/demo-requests/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchProductQuotations(params?: {
  status?: string;
  search?: string;
}): Promise<{ success: boolean; data: ProductQuoteRequest[]; count: number; error?: string }> {
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.search) qs.append('search', params.search);
    const res = await fetch(buildApiUrl(`/api/admin/product-quotations?${qs.toString()}`));
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], count: 0, error: err.message };
  }
}

export async function updateProductQuotation(
  id: number | string,
  payload: { status?: string; notes?: string }
): Promise<{ success: boolean; message?: string; data?: ProductQuoteRequest; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/admin/product-quotations/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export type DemoRequestInput = Partial<DemoRequest>;
export type QuoteRequestInput = Partial<ProductQuoteRequest>;

export const productsApi = {
  getCatalog: async (params?: { category?: string; search?: string; featured_only?: boolean }): Promise<Product[]> => {
    const res = await fetchPublicProducts(params);
    return res.data || [];
  },
  getCategories: fetchProductCategories,
  getBySlug: async (slug: string, isPreview = false): Promise<Product> => {
    const res = await fetchProductBySlug(slug, isPreview);
    if (!res.success || !res.data?.product) {
      throw new Error(res.error || 'Product not found');
    }
    return res.data.product;
  },
  requestDemo: submitDemoRequest,
  requestQuotation: submitProductQuoteRequest,
  getStats: fetchAdminProductStats,
  getAdminProducts: fetchAdminProducts,
  getAdminProduct: fetchAdminProduct,
  saveProduct: saveAdminProduct,
  publish: publishAdminProduct,
  unpublish: unpublishAdminProduct,
  archive: archiveAdminProduct,
  delete: deleteAdminProduct,
  duplicate: duplicateAdminProduct,
  uploadImage: uploadProductImage,
  getDemoRequests: fetchDemoRequests,
  updateDemoRequest: updateDemoRequest,
  getQuotations: fetchProductQuotations,
  updateQuotation: updateProductQuotation
};

export default productsApi;

