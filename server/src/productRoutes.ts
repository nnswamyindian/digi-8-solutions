import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pool, { loadPersistentStore, savePersistentStore } from './db.js';
import { sendMailWithFallbacks, getSmtpUser, getAdminEmail } from './emailService.js';

const router = express.Router();

// ──────────────────────────────────────────────
// MULTER STORAGE FOR PRODUCT IMAGES
// ──────────────────────────────────────────────
const PRODUCT_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(PRODUCT_UPLOADS_DIR)) {
  fs.mkdirSync(PRODUCT_UPLOADS_DIR, { recursive: true });
}

const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PRODUCT_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const safeName = `prod-${safeBase}-${Date.now()}-${uuidv4().slice(0, 6)}${ext}`;
    cb(null, safeName);
  }
});

const uploadProductImg = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, WEBP, SVG, and GIF image files are allowed.'));
    }
  }
});

// Helper for slug generation
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

// ──────────────────────────────────────────────
// PUBLIC CATALOG APIS
// ──────────────────────────────────────────────

// GET /api/products/catalog - List all active published products
router.get('/products/catalog', async (req, res) => {
  try {
    const { category, search, featured_only } = req.query;
    const store = loadPersistentStore();
    let list = [...(store.catalog_products || [])];

    // Filter to published only for public viewing
    list = list.filter(p => p.status === 'published' || p.is_published === true);

    if (category && category !== 'all') {
      list = list.filter(p => (p.category || '').toLowerCase() === String(category).toLowerCase());
    }

    if (featured_only === 'true') {
      list = list.filter(p => p.is_featured === true);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.short_description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.product_type || '').toLowerCase().includes(q)
      );
    }

    // Sort by display_order ASC, then created_at DESC
    list.sort((a, b) => {
      const ordA = Number(a.display_order ?? 999);
      const ordB = Number(b.display_order ?? 999);
      if (ordA !== ordB) return ordA - ordB;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    console.error('[CATALOG ERROR]', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch products' });
  }
});

// GET /api/products/categories - Distinct categories
router.get('/products/categories', async (_req, res) => {
  try {
    const store = loadPersistentStore();
    const prods = (store.catalog_products || []).filter(p => p.status === 'published' || p.is_published === true);
    const catSet = new Set<string>();
    prods.forEach(p => {
      if (p.category && p.category.trim()) catSet.add(p.category.trim());
    });
    res.json({ success: true, data: Array.from(catSet) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/slug/:slug - Public single product details
router.get('/products/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();
    const isPreview = req.query.preview === 'true';
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => p.slug?.toLowerCase() === slug);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // If not in preview mode, product must be published
    if (!isPreview && product.status !== 'published' && !product.is_published) {
      return res.status(404).json({ success: false, error: 'This product is currently in draft or archived.' });
    }

    // Also fetch 3 related products
    const related = (store.catalog_products || [])
      .filter(p => p.id !== product.id && (p.status === 'published' || p.is_published))
      .slice(0, 3);

    res.json({ success: true, data: { product, related } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/:slug/demo-requests - Customer request demo
router.post('/products/:slug/demo-requests', async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => p.slug?.toLowerCase() === slug);

    const {
      customer_name,
      company_name,
      email,
      phone,
      preferred_date,
      preferred_time,
      number_of_users,
      requirements,
      preferred_contact_method
    } = req.body;

    if (!customer_name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const ref = `DEMO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const demoRequest = {
      id: Date.now(),
      request_reference: ref,
      product_id: product?.id || null,
      product_name: product?.name || req.body.product_name || 'Digi8 Product',
      product_slug: slug,
      customer_name: customer_name.trim(),
      company_name: (company_name || '').trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      preferred_date: preferred_date || '',
      preferred_time: preferred_time || '',
      number_of_users: number_of_users || '1-5',
      requirements: (requirements || '').trim(),
      preferred_contact_method: preferred_contact_method || 'Email',
      assigned_to: 'Unassigned',
      status: 'new',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(store.product_demo_requests)) store.product_demo_requests = [];
    store.product_demo_requests.unshift(demoRequest);
    savePersistentStore(store);

    // Also sync to general leads table
    try {
      if (!Array.isArray(store.leads)) store.leads = [];
      store.leads.unshift({
        id: Date.now(),
        name: customer_name.trim(),
        email: email.trim(),
        phone: phone || '',
        company: company_name || '',
        service: `Demo Request: ${demoRequest.product_name}`,
        source: 'Product Demo Form',
        status: 'new',
        notes: `Demo Ref: ${ref}. Date: ${preferred_date || 'Any'}. Reqs: ${requirements || 'None'}`,
        created_at: new Date().toISOString()
      });
      savePersistentStore(store);
    } catch {}

    // Dispatch notification email to admin/sales
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b101d; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #00e5ff; margin-top: 0;">🚀 New Product Demo Request</h2>
          <p style="font-size: 14px; color: #cbd5e1;">A customer has submitted a live demo request for <strong>${demoRequest.product_name}</strong>.</p>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p><strong>Reference:</strong> <span style="font-family: monospace; color: #00e5ff;">${ref}</span></p>
            <p><strong>Customer Name:</strong> ${demoRequest.customer_name}</p>
            <p><strong>Company:</strong> ${demoRequest.company_name || 'N/A'}</p>
            <p><strong>Email:</strong> ${demoRequest.email}</p>
            <p><strong>Phone:</strong> ${demoRequest.phone || 'N/A'}</p>
            <p><strong>Preferred Slot:</strong> ${demoRequest.preferred_date || 'Flexible'} (${demoRequest.preferred_time || 'Anytime'})</p>
            <p><strong>Team Size:</strong> ${demoRequest.number_of_users} users</p>
            <p><strong>Requirements:</strong><br/>${demoRequest.requirements || 'No specific notes entered.'}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Manage and assign this demo in the Digi8 Admin Dashboard &rarr; Products &rarr; Demo Requests.</p>
        </div>
      `;

      sendMailWithFallbacks({
        from: `"Digi8 Products" <${getSmtpUser()}>`,
        to: getAdminEmail(),
        subject: `[Demo Request ${ref}] ${demoRequest.product_name} — ${demoRequest.customer_name}`,
        html: emailHtml
      }).catch(err => console.warn('[MAIL NOTICE] Demo notice failed:', err.message));
    } catch {}

    res.json({
      success: true,
      message: `Demo request submitted successfully! Your reference code is ${ref}. Our product team will contact you shortly.`,
      reference: ref
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/:slug/quotation-requests - Customer request quote/customization
router.post('/products/:slug/quotation-requests', async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => p.slug?.toLowerCase() === slug);

    const {
      customer_name,
      company_name,
      email,
      phone,
      requirement_type,
      requirements,
      requested_features,
      expected_users,
      integration_requirements,
      budget_range,
      expected_timeline,
      notes
    } = req.body;

    if (!customer_name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const ref = `QT-PRD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const quoteReq = {
      id: Date.now(),
      request_reference: ref,
      product_id: product?.id || null,
      product_name: product?.name || req.body.product_name || 'Digi8 Product',
      product_slug: slug,
      customer_name: customer_name.trim(),
      company_name: (company_name || '').trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      requirement_type: requirement_type || 'Standard Implementation',
      requirements: (requirements || '').trim(),
      requested_features: Array.isArray(requested_features) ? requested_features : [],
      expected_users: expected_users || '1-10',
      integration_requirements: (integration_requirements || '').trim(),
      budget_range: budget_range || 'Flexible',
      expected_timeline: expected_timeline || 'Within 1 Month',
      notes: (notes || '').trim(),
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(store.product_quotation_requests)) store.product_quotation_requests = [];
    store.product_quotation_requests.unshift(quoteReq);
    savePersistentStore(store);

    // Sync to quotes collection
    try {
      if (!Array.isArray(store.quotes)) store.quotes = [];
      store.quotes.unshift({
        id: Date.now().toString(),
        quote_number: ref,
        service: `Product Quotation: ${quoteReq.product_name}`,
        customer_name: customer_name.trim(),
        email: email.trim(),
        phone: phone || '',
        company: company_name || '',
        final_price: product?.starting_price || 0,
        status: 'draft',
        delivery_days: 14,
        notes: `Requirement: ${requirement_type}. Budget: ${budget_range}. Details: ${requirements}`,
        created_at: new Date().toISOString()
      });
      savePersistentStore(store);
    } catch {}

    res.json({
      success: true,
      message: `Quotation request registered! Reference code: ${ref}. Our technical sales team will review your requirements and formulate a detailed proposal.`,
      reference: ref
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// ADMIN PRODUCT MANAGEMENT APIS
// ──────────────────────────────────────────────

// GET /api/admin/products/stats - Product metrics
router.get('/admin/products/stats', async (_req, res) => {
  try {
    const store = loadPersistentStore();
    const prods = store.catalog_products || [];
    const demos = store.product_demo_requests || [];
    const quotes = store.product_quotation_requests || [];

    const stats = {
      total: prods.length,
      published: prods.filter(p => p.status === 'published' || p.is_published === true).length,
      draft: prods.filter(p => p.status === 'draft' || (!p.is_published && p.status !== 'archived')).length,
      featured: prods.filter(p => p.is_featured === true).length,
      archived: prods.filter(p => p.status === 'archived').length,
      total_demos: demos.length,
      pending_demos: demos.filter(d => d.status === 'new' || d.status === 'contacted').length,
      total_quotations: quotes.length,
      pending_quotations: quotes.filter(q => q.status === 'new').length
    };

    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/products - List all products for management table
router.get('/admin/products', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const store = loadPersistentStore();
    let list = [...(store.catalog_products || [])];

    if (status && status !== 'all') {
      if (status === 'featured') {
        list = list.filter(p => p.is_featured === true);
      } else {
        list = list.filter(p => (p.status || '').toLowerCase() === String(status).toLowerCase());
      }
    }

    if (category && category !== 'all') {
      list = list.filter(p => (p.category || '').toLowerCase() === String(category).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q) ||
        (p.short_description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const ordA = Number(a.display_order ?? 999);
      const ordB = Number(b.display_order ?? 999);
      if (ordA !== ordB) return ordA - ordB;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/products/:id - Single product by ID
router.get('/admin/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => Number(p.id) === id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/products - Create a new product
router.post('/admin/products', async (req, res) => {
  try {
    const {
      name,
      slug,
      short_description,
      description,
      category,
      product_type,
      logo_url,
      thumbnail_url,
      banner_url,
      official_website_url,
      application_url,
      login_url,
      demo_url,
      video_demo_url,
      documentation_url,
      support_url,
      pricing_model,
      currency,
      starting_price,
      monthly_price,
      annual_price,
      trial_available,
      trial_days,
      setup_fee,
      pricing_notes,
      display_price,
      is_featured,
      is_published,
      status,
      display_order,
      brand_color,
      card_color,
      seo_title,
      seo_description,
      features,
      benefits,
      screenshots,
      plans,
      specifications,
      faqs,
      demo_options,
      quotation_options
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }

    const store = loadPersistentStore();
    if (!Array.isArray(store.catalog_products)) store.catalog_products = [];

    // Auto generate or clean slug
    let finalSlug = slug ? generateSlug(slug) : generateSlug(name);
    // Ensure slug uniqueness
    let counter = 1;
    let candidateSlug = finalSlug;
    while (store.catalog_products.some(p => p.slug === candidateSlug)) {
      candidateSlug = `${finalSlug}-${counter++}`;
    }
    finalSlug = candidateSlug;

    const newId = store.catalog_products.length > 0 
      ? Math.max(...store.catalog_products.map(p => Number(p.id) || 0)) + 1 
      : 1;

    const isPub = is_published === true || status === 'published';
    const computedStatus = status || (isPub ? 'published' : 'draft');

    const newProduct = {
      id: newId,
      name: name.trim(),
      slug: finalSlug,
      short_description: short_description || '',
      description: description || '',
      category: category || 'SaaS & Digital Solutions',
      product_type: product_type || 'SaaS / Business Software',
      logo_url: logo_url || '',
      thumbnail_url: thumbnail_url || '',
      banner_url: banner_url || '',
      official_website_url: official_website_url || '',
      application_url: application_url || '',
      login_url: login_url || '',
      demo_url: demo_url || '',
      video_demo_url: video_demo_url || '',
      documentation_url: documentation_url || '',
      support_url: support_url || '',
      pricing_model: pricing_model || 'Configurable',
      currency: currency || 'INR',
      starting_price: Number(starting_price) || 0,
      monthly_price: Number(monthly_price) || 0,
      annual_price: Number(annual_price) || 0,
      trial_available: Boolean(trial_available),
      trial_days: Number(trial_days) || 0,
      setup_fee: Number(setup_fee) || 0,
      pricing_notes: pricing_notes || '',
      display_price: display_price !== false,
      is_featured: Boolean(is_featured),
      is_published: isPub,
      status: computedStatus,
      display_order: Number(display_order) || 0,
      brand_color: brand_color || '',
      card_color: card_color || '',
      seo_title: seo_title || `${name.trim()} | Digi8 Solutions`,
      seo_description: seo_description || short_description || '',
      features: Array.isArray(features) ? features : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      plans: Array.isArray(plans) ? plans : [],
      specifications: typeof specifications === 'object' ? specifications : {},
      faqs: Array.isArray(faqs) ? faqs : [],
      demo_options: typeof demo_options === 'object' ? demo_options : { live_demo_available: true, schedule_demo_available: true },
      quotation_options: typeof quotation_options === 'object' ? quotation_options : { customization_available: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.catalog_products.push(newProduct);
    savePersistentStore(store);

    res.json({
      success: true,
      message: `Product "${newProduct.name}" created successfully as ${newProduct.status}!`,
      data: newProduct
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/admin/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const index = (store.catalog_products || []).findIndex(p => Number(p.id) === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const current = store.catalog_products[index];
    const body = req.body;

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== current.slug) {
      const cleanSlug = generateSlug(body.slug);
      const exists = store.catalog_products.some(p => Number(p.id) !== id && p.slug === cleanSlug);
      if (exists) {
        return res.status(400).json({ success: false, error: 'A product with this URL slug already exists.' });
      }
      current.slug = cleanSlug;
    }

    const isPub = body.is_published !== undefined ? Boolean(body.is_published) : (body.status ? body.status === 'published' : current.is_published);
    const updatedStatus = body.status || (isPub ? 'published' : (current.status || 'draft'));

    store.catalog_products[index] = {
      ...current,
      ...body,
      id,
      slug: current.slug,
      is_published: isPub,
      status: updatedStatus,
      updated_at: new Date().toISOString()
    };

    savePersistentStore(store);

    res.json({
      success: true,
      message: `Product "${store.catalog_products[index].name}" updated successfully!`,
      data: store.catalog_products[index]
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/products/:id/publish - Publish product
router.patch('/admin/products/:id/publish', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => Number(p.id) === id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.is_published = true;
    product.status = 'published';
    product.updated_at = new Date().toISOString();
    savePersistentStore(store);

    res.json({
      success: true,
      message: `"${product.name}" is now published and live on the public Products page!`,
      data: product
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/products/:id/unpublish - Revert product to draft
router.patch('/admin/products/:id/unpublish', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => Number(p.id) === id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.is_published = false;
    product.status = 'draft';
    product.updated_at = new Date().toISOString();
    savePersistentStore(store);

    res.json({
      success: true,
      message: `"${product.name}" unpublished and moved to Draft.`,
      data: product
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/products/:id/archive - Archive product
router.patch('/admin/products/:id/archive', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const product = (store.catalog_products || []).find(p => Number(p.id) === id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.is_published = false;
    product.status = 'archived';
    product.archived_at = new Date().toISOString();
    product.updated_at = new Date().toISOString();
    savePersistentStore(store);

    res.json({
      success: true,
      message: `"${product.name}" archived. It is hidden from the public catalog while preserving historical records.`,
      data: product
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/products/:id - Safe deletion (soft archive or remove if draft)
router.delete('/admin/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const index = (store.catalog_products || []).findIndex(p => Number(p.id) === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = store.catalog_products[index];

    // Check if product has demo requests or quotes
    const hasDemos = (store.product_demo_requests || []).some(d => Number(d.product_id) === id);
    const hasQuotes = (store.product_quotation_requests || []).some(q => Number(q.product_id) === id);

    if (hasDemos || hasQuotes) {
      // Soft-archive to protect historical customer records
      product.status = 'archived';
      product.is_published = false;
      product.archived_at = new Date().toISOString();
      savePersistentStore(store);
      return res.json({
        success: true,
        message: `Product "${product.name}" has existing demo/quotation records, so it was safely archived instead of deleted.`,
        action: 'archived'
      });
    }

    // Safe to delete draft without history
    store.catalog_products.splice(index, 1);
    savePersistentStore(store);

    res.json({
      success: true,
      message: `Product "${product.name}" deleted successfully.`,
      action: 'deleted'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/products/:id/duplicate - Duplicate product
router.post('/admin/products/:id/duplicate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const orig = (store.catalog_products || []).find(p => Number(p.id) === id);

    if (!orig) {
      return res.status(404).json({ success: false, error: 'Original product not found' });
    }

    const newId = Math.max(...store.catalog_products.map(p => Number(p.id) || 0)) + 1;
    let copySlug = `${orig.slug}-copy`;
    let count = 1;
    while (store.catalog_products.some(p => p.slug === copySlug)) {
      copySlug = `${orig.slug}-copy-${count++}`;
    }

    const duplicate = {
      ...JSON.parse(JSON.stringify(orig)),
      id: newId,
      name: `${orig.name} (Copy)`,
      slug: copySlug,
      is_published: false,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.catalog_products.push(duplicate);
    savePersistentStore(store);

    res.json({
      success: true,
      message: `Product duplicated as "${duplicate.name}" (Draft).`,
      data: duplicate
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/products/upload-image - Upload product screenshots & banners
router.post('/admin/products/upload-image', uploadProductImg.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    // Relative web URL
    const relativeUrl = `/uploads/products/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      url: relativeUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// ADMIN DEMO REQUESTS & QUOTATION MANAGEMENT
// ──────────────────────────────────────────────

// GET /api/admin/demo-requests - List all demo requests
router.get('/admin/demo-requests', async (req, res) => {
  try {
    const { status, search } = req.query;
    const store = loadPersistentStore();
    let list = [...(store.product_demo_requests || [])];

    if (status && status !== 'all') {
      list = list.filter(d => (d.status || '').toLowerCase() === String(status).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(d =>
        (d.customer_name || '').toLowerCase().includes(q) ||
        (d.company_name || '').toLowerCase().includes(q) ||
        (d.product_name || '').toLowerCase().includes(q) ||
        (d.email || '').toLowerCase().includes(q) ||
        (d.request_reference || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/demo-requests/:id - Update demo request status / notes
router.patch('/admin/demo-requests/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const demo = (store.product_demo_requests || []).find(d => Number(d.id) === id);

    if (!demo) {
      return res.status(404).json({ success: false, error: 'Demo request not found' });
    }

    const { status, notes, assigned_to } = req.body;
    if (status) demo.status = status;
    if (notes !== undefined) demo.notes = notes;
    if (assigned_to !== undefined) demo.assigned_to = assigned_to;
    demo.updated_at = new Date().toISOString();

    savePersistentStore(store);

    res.json({
      success: true,
      message: 'Demo request updated successfully!',
      data: demo
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/product-quotations - List all product quotations
router.get('/admin/product-quotations', async (req, res) => {
  try {
    const { status, search } = req.query;
    const store = loadPersistentStore();
    let list = [...(store.product_quotation_requests || [])];

    if (status && status !== 'all') {
      list = list.filter(q => (q.status || '').toLowerCase() === String(status).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(q =>
        (q.customer_name || '').toLowerCase().includes(q) ||
        (q.company_name || '').toLowerCase().includes(q) ||
        (q.product_name || '').toLowerCase().includes(q) ||
        (q.email || '').toLowerCase().includes(q) ||
        (q.request_reference || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/product-quotations/:id - Update quotation request status
router.patch('/admin/product-quotations/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = loadPersistentStore();
    const quoteReq = (store.product_quotation_requests || []).find(q => Number(q.id) === id);

    if (!quoteReq) {
      return res.status(404).json({ success: false, error: 'Quotation request not found' });
    }

    const { status, notes } = req.body;
    if (status) quoteReq.status = status;
    if (notes !== undefined) quoteReq.notes = notes;
    quoteReq.updated_at = new Date().toISOString();

    savePersistentStore(store);

    res.json({
      success: true,
      message: 'Quotation request updated successfully!',
      data: quoteReq
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
