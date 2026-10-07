import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { loadPersistentStore, savePersistentStore } from './db.js';
import { broadcastAdminNotification } from './index.js';
import { generateInvoicePdfBuffer, InvoicePdfData } from './pdfGenerator.js';
import { sendMailWithFallbacks, getSmtpUser } from './emailService.js';
import {
  getRazorpayConfig,
  getPublicRazorpayConfig,
  createRazorpayOrder,
  createRazorpayPaymentLink,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  recordVerifiedRazorpayPayment
} from './razorpayService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-digi8';

// ──────────────────────────────────────────────
// AUTH HELPER
// ──────────────────────────────────────────────
export const getAuthUser = (req: express.Request): { id?: any; email?: string; name?: string; role?: string; allowed_modules?: string[] } | null => {
  if (req.headers['x-user-role']) {
    return {
      id: req.headers['x-user-id'] || 'user_1',
      name: (req.headers['x-user-name'] as string) || 'User',
      email: (req.headers['x-user-email'] as string) || 'user@digi8solutions.com',
      role: req.headers['x-user-role'] as string
    };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];

  if (token.startsWith('staff_')) {
    const roleMatch = token.replace('staff_', '').replace('_token', '').replace(/_/g, ' ');
    const pStore = loadPersistentStore();
    const user = pStore.admin_users?.find(u => u.role.toLowerCase() === roleMatch.toLowerCase()) || {
      id: 99,
      email: 'staff@digi8solutions.com',
      name: 'Digi-8 Staff',
      role: roleMatch
    };
    return user;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
};

// ──────────────────────────────────────────────
// FINANCIAL CALCULATION ENGINE
// ──────────────────────────────────────────────
export interface LineItemInput {
  product_id?: number | null;
  item_type?: 'software' | 'hardware' | 'services' | 'custom';
  item_name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit?: string;
  market_price: number;
  selling_price: number;
  discount_type?: 'fixed' | 'percentage';
  discount_value?: number;
  tax_percentage?: number;
}

export function calculateInvoiceFinancials(
  items: LineItemInput[],
  extraDiscountType: 'fixed' | 'percentage' = 'fixed',
  extraDiscountVal: number = 0,
  customerState: string = '',
  companyState: string = 'Maharashtra',
  taxCalculationMode: 'exclusive' | 'inclusive' = 'exclusive',
  overrideTaxType?: 'intra_state' | 'inter_state'
) {
  let market_total = 0;
  let items_discount_total = 0;
  let subtotal_selling = 0;
  let total_item_tax = 0;

  const processedItems = items.map((item, index) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const marketPrice = Math.max(0, Number(item.market_price) || 0);
    let sellingPrice = Number(item.selling_price);

    let discType = item.discount_type || 'fixed';
    let discVal = Number(item.discount_value) || 0;

    // Calculate unit discount and selling price if specified by discount value
    let unitDiscount = 0;
    if (discVal > 0) {
      if (discType === 'percentage') {
        unitDiscount = marketPrice * (discVal / 100);
        sellingPrice = marketPrice - unitDiscount;
      } else {
        unitDiscount = discVal;
        sellingPrice = marketPrice - unitDiscount;
      }
    } else {
      unitDiscount = Math.max(0, marketPrice - sellingPrice);
      if (marketPrice > 0 && unitDiscount > 0) {
        discVal = unitDiscount;
        discType = 'fixed';
      }
    }

    if (sellingPrice < 0) sellingPrice = 0;
    const discountAmount = unitDiscount * qty;
    const itemSellingTotal = sellingPrice * qty;
    const taxPct = (item.tax_percentage !== undefined && item.tax_percentage !== null && !isNaN(Number(item.tax_percentage)))
      ? Number(item.tax_percentage)
      : 18.00;

    let itemTaxable = 0;
    let itemTax = 0;
    let lineTotal = 0;

    if (taxCalculationMode === 'inclusive') {
      // Selling price includes GST: taxable = selling / (1 + rate/100)
      itemTaxable = taxPct > 0 ? itemSellingTotal / (1 + taxPct / 100) : itemSellingTotal;
      itemTax = itemSellingTotal - itemTaxable;
      lineTotal = itemSellingTotal;
    } else {
      // Selling price is exclusive of GST: tax added on top
      itemTaxable = itemSellingTotal;
      itemTax = itemTaxable * (taxPct / 100);
      lineTotal = itemTaxable + itemTax;
    }

    market_total += marketPrice * qty;
    items_discount_total += discountAmount;
    subtotal_selling += itemSellingTotal;
    total_item_tax += itemTax;

    return {
      product_id: item.product_id || null,
      item_type: item.item_type || 'software',
      item_name: item.item_name || `Item #${index + 1}`,
      description: item.description || '',
      sku: item.sku || '',
      quantity: qty,
      unit: item.unit || 'pcs',
      market_price: Number(marketPrice.toFixed(2)),
      selling_price: Number(sellingPrice.toFixed(2)),
      discount_type: discType,
      discount_value: Number(discVal.toFixed(2)),
      discount_amount: Number(discountAmount.toFixed(2)),
      tax_percentage: Number(taxPct.toFixed(2)),
      tax_amount: Number(itemTax.toFixed(2)),
      line_total: Number(lineTotal.toFixed(2))
    };
  });

  // Calculate invoice-level extra discount
  let extra_discount_amount = 0;
  if (extraDiscountVal > 0) {
    if (extraDiscountType === 'percentage') {
      extra_discount_amount = subtotal_selling * (extraDiscountVal / 100);
    } else {
      extra_discount_amount = Math.min(subtotal_selling, extraDiscountVal);
    }
  }

  const discount_total = items_discount_total + extra_discount_amount;
  const netSellingValue = Math.max(0, subtotal_selling - extra_discount_amount);

  let taxable_amount = 0;
  let tax_total = 0;
  let grand_total = 0;
  let round_off = 0;

  if (taxCalculationMode === 'inclusive') {
    const rawGrandTotal = netSellingValue;
    grand_total = Math.round(rawGrandTotal);
    round_off = Number((grand_total - rawGrandTotal).toFixed(2));
    const taxRatio = subtotal_selling > 0 ? netSellingValue / subtotal_selling : 0;
    tax_total = Number((total_item_tax * taxRatio).toFixed(2));
    taxable_amount = Number((rawGrandTotal - tax_total).toFixed(2));
  } else {
    taxable_amount = Number(netSellingValue.toFixed(2));
    const taxRatio = subtotal_selling > 0 ? taxable_amount / subtotal_selling : 0;
    tax_total = Number((total_item_tax * taxRatio).toFixed(2));
    const rawGrandTotal = taxable_amount + tax_total;
    grand_total = Math.round(rawGrandTotal);
    round_off = Number((grand_total - rawGrandTotal).toFixed(2));
  }

  // Determine tax breakdown: intra-state (CGST+SGST) vs inter-state (IGST)
  const normCustomerState = (customerState || '').trim().toLowerCase();
  const normCompanyState = (companyState || 'Maharashtra').trim().toLowerCase();
  const isIntraState = overrideTaxType
    ? overrideTaxType === 'intra_state'
    : (!normCustomerState || normCustomerState === normCompanyState);

  let cgst_amount = 0;
  let sgst_amount = 0;
  let igst_amount = 0;

  if (isIntraState) {
    cgst_amount = Number((tax_total / 2).toFixed(2));
    sgst_amount = Number((tax_total / 2).toFixed(2));
    igst_amount = 0;
  } else {
    cgst_amount = 0;
    sgst_amount = 0;
    igst_amount = Number(tax_total.toFixed(2));
  }

  return {
    items: processedItems,
    market_total: Number(market_total.toFixed(2)),
    discount_total: Number(discount_total.toFixed(2)),
    extra_discount_type: extraDiscountType,
    extra_discount_value: Number(extraDiscountVal.toFixed(2)),
    extra_discount_amount: Number(extra_discount_amount.toFixed(2)),
    taxable_amount,
    tax_calculation_mode: taxCalculationMode,
    tax_type: isIntraState ? 'intra_state' : 'inter_state',
    cgst_amount,
    sgst_amount,
    igst_amount,
    tax_total,
    round_off,
    grand_total
  };
}

// ──────────────────────────────────────────────
// CONCURRENCY-SAFE INVOICE NUMBER GENERATION
// ──────────────────────────────────────────────
export async function getNextInvoiceNumber(): Promise<string> {
  // 1. Try MySQL Database with lock
  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Retrieve current invoice settings
      const [settingsRows]: any = await conn.query('SELECT * FROM invoice_settings LIMIT 1 FOR UPDATE');
      let prefix = 'D8/INV';
      let fy = '2026-27';
      let padding = 6;
      let nextNum = 1;

      if (settingsRows && settingsRows.length > 0) {
        const s = settingsRows[0];
        prefix = s.invoice_prefix || prefix;
        fy = s.financial_year || fy;
        padding = s.number_padding || padding;
        nextNum = s.next_number || nextNum;
      }

      // Check max invoice number in table to prevent duplicates
      const [maxRows]: any = await conn.query(
        'SELECT invoice_number FROM invoices WHERE financial_year = ? ORDER BY id DESC LIMIT 1',
        [fy]
      );
      if (maxRows && maxRows.length > 0) {
        const lastInv = maxRows[0].invoice_number;
        const parts = lastInv.split('/');
        const lastSequence = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSequence) && lastSequence >= nextNum) {
          nextNum = lastSequence + 1;
        }
      }

      const generatedNum = `${prefix}/${fy}/${String(nextNum).padStart(padding, '0')}`;

      // Increment next_number
      await conn.query('UPDATE invoice_settings SET next_number = ? WHERE id = ?', [nextNum + 1, settingsRows[0]?.id || 1]);
      await conn.commit();
      return generatedNum;
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }
  } catch (err: any) {
    // 2. Fallback to Persistent JSON disk store
    const store = loadPersistentStore();
    const settings = store.invoice_settings?.[0] || {
      invoice_prefix: 'D8/INV',
      financial_year: '2026-27',
      next_number: 1,
      number_padding: 6
    };

    let prefix = settings.invoice_prefix || 'D8/INV';
    let fy = settings.financial_year || '2026-27';
    let padding = settings.number_padding || 6;
    let nextNum = settings.next_number || 1;

    // Scan existing invoices in store
    const existingInvs = (store.invoices || []).filter((i: any) => i.financial_year === fy);
    for (const inv of existingInvs) {
      const parts = (inv.invoice_number || '').split('/');
      const lastSequence = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSequence) && lastSequence >= nextNum) {
        nextNum = lastSequence + 1;
      }
    }

    const generatedNum = `${prefix}/${fy}/${String(nextNum).padStart(padding, '0')}`;
    settings.next_number = nextNum + 1;
    store.invoice_settings = [settings];
    savePersistentStore(store);
    return generatedNum;
  }
}

export async function getNextDraftNumber(): Promise<string> {
  const fy = '2026-27';
  try {
    const conn = await pool.getConnection();
    try {
      const [rows]: any = await conn.query('SELECT invoice_number FROM invoices WHERE invoice_number LIKE "DFT-%" ORDER BY id DESC LIMIT 1');
      let nextSeq = 1;
      if (rows && rows.length > 0) {
        const parts = rows[0].invoice_number.split('-');
        const last = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(last)) nextSeq = last + 1;
      }
      return `DFT-${fy.replace('-', '')}-${String(nextSeq).padStart(4, '0')}`;
    } finally {
      conn.release();
    }
  } catch {
    const store = loadPersistentStore();
    const drafts = (store.invoices || []).filter((i: any) => (i.invoice_number || '').startsWith('DFT-'));
    const nextSeq = drafts.length + 1;
    return `DFT-${fy.replace('-', '')}-${String(nextSeq).padStart(4, '0')}`;
  }
}

export function getPaymentDetailsSnapshot(): any {
  const store = loadPersistentStore();
  const settings = store.invoice_settings?.[0] || {};
  return {
    bank_name: settings.bank_name || 'HDFC Bank Ltd',
    bank_account_holder: settings.bank_account_holder || settings.company_name || 'Digi8 Solutions Private Limited',
    bank_account_number: settings.bank_account_number || '50200098765432',
    bank_ifsc: settings.bank_ifsc || 'HDFC0000123',
    bank_branch: settings.bank_branch || 'Mindspace Branch, Mumbai',
    upi_id: settings.upi_id || 'digi8solutions@hdfcbank',
    upi_display_name: settings.upi_display_name || 'Digi8 Solutions Pvt Ltd',
    show_upi_qr: settings.show_upi_qr !== false,
    show_bank_details: settings.show_bank_details !== false,
    payment_instructions: settings.payment_instructions || 'Scan the UPI QR code using any UPI App (GPay, PhonePe, Paytm, BHIM) to pay instantly. For direct NEFT/RTGS/IMPS, transfer to our HDFC corporate account above and mention the Invoice number in the transaction description.',
    seal_url: settings.seal_url || '/images/seal.png',
    signature_url: settings.signature_url || '/images/signature.png',
    authorized_signatory_name: settings.authorized_signatory_name || 'Authorized Signatory',
    authorized_signatory_title: settings.authorized_signatory_title || 'Corporate Finance & Accounts Division',
    razorpay_enabled: settings.razorpay_enabled !== undefined ? Boolean(settings.razorpay_enabled) : true,
    razorpay_primary_payment: settings.razorpay_primary_payment !== undefined ? Boolean(settings.razorpay_primary_payment) : true,
    razorpay_key_id: settings.razorpay_key_id || 'rzp_test_digi8solutions'
  };
}

// ──────────────────────────────────────────────
// INVOICE AUDIT LOG HELPER
// ──────────────────────────────────────────────
async function logInvoiceAudit(invoiceId: number, invoiceNumber: string, action: string, oldValue: string, newValue: string, performedBy: string, ipAddress: string = '127.0.0.1') {
  try {
    await pool.query(
      `INSERT INTO invoice_audit_logs (invoice_id, invoice_number, action, old_value, new_value, performed_by, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, invoiceNumber, action, oldValue, newValue, performedBy, ipAddress]
    );
  } catch {
    const store = loadPersistentStore();
    if (!Array.isArray(store.invoice_audit_logs)) store.invoice_audit_logs = [];
    store.invoice_audit_logs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      action,
      old_value: oldValue,
      new_value: newValue,
      performed_by: performedBy,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    });
    savePersistentStore(store);
  }
}

// ──────────────────────────────────────────────
// 1. INVOICES CRUD & WORKFLOW
// ──────────────────────────────────────────────

// GET /api/invoices - List invoices with filtering & role awareness
router.get('/invoices', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const {
      search,
      status,
      payment_status,
      sales_user_id,
      customer_id,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    let invoicesList: any[] = [];

    // Try MySQL
    try {
      let query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count,
               (SELECT COUNT(*) FROM payments WHERE invoice_id = i.id) as payment_count
        FROM invoices i
        WHERE 1=1
      `;
      const params: any[] = [];

      // Role filter: Sales Executive can only view their own
      if (authUser?.role === 'Sales Executive') {
        query += ` AND (i.sales_user_id = ? OR i.sales_person_name = ? OR i.created_by = ?)`;
        params.push(authUser.id, authUser.name, authUser.email);
      } else if (sales_user_id) {
        query += ` AND i.sales_user_id = ?`;
        params.push(sales_user_id);
      }

      if (status && status !== 'all') {
        query += ` AND i.invoice_status = ?`;
        params.push(status);
      }

      if (payment_status && payment_status !== 'all') {
        query += ` AND i.payment_status = ?`;
        params.push(payment_status);
      }

      if (customer_id) {
        query += ` AND i.customer_id = ?`;
        params.push(customer_id);
      }

      if (startDate) {
        query += ` AND i.invoice_date >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND i.invoice_date <= ?`;
        params.push(endDate);
      }

      if (search) {
        const s = `%${search}%`;
        query += ` AND (i.invoice_number LIKE ? OR i.customer_name LIKE ? OR i.customer_company LIKE ? OR i.customer_mobile LIKE ? OR i.sales_person_name LIKE ?)`;
        params.push(s, s, s, s, s);
      }

      query += ` ORDER BY i.id DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit), (Number(page) - 1) * Number(limit));

      const [rows]: any = await pool.query(query, params);
      invoicesList = rows || [];
    } catch {
      // Fallback: persistent JSON store
      const store = loadPersistentStore();
      let filtered = [...(store.invoices || [])];

      if (authUser?.role === 'Sales Executive') {
        filtered = filtered.filter(
          i => i.sales_user_id === authUser.id || i.sales_person_name === authUser.name || i.created_by === authUser.email
        );
      } else if (sales_user_id) {
        filtered = filtered.filter(i => String(i.sales_user_id) === String(sales_user_id));
      }

      if (status && status !== 'all') {
        filtered = filtered.filter(i => i.invoice_status === status);
      }

      if (payment_status && payment_status !== 'all') {
        filtered = filtered.filter(i => i.payment_status === payment_status);
      }

      if (customer_id) {
        filtered = filtered.filter(i => String(i.customer_id) === String(customer_id));
      }

      if (startDate) {
        filtered = filtered.filter(i => new Date(i.invoice_date) >= new Date(String(startDate)));
      }

      if (endDate) {
        filtered = filtered.filter(i => new Date(i.invoice_date) <= new Date(String(endDate)));
      }

      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(i =>
          (i.invoice_number || '').toLowerCase().includes(q) ||
          (i.customer_name || '').toLowerCase().includes(q) ||
          (i.customer_company || '').toLowerCase().includes(q) ||
          (i.customer_mobile || '').toLowerCase().includes(q) ||
          (i.sales_person_name || '').toLowerCase().includes(q)
        );
      }

      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
      invoicesList = filtered.map(inv => ({
        ...inv,
        item_count: (store.invoice_items || []).filter(item => item.invoice_id === inv.id).length,
        payment_count: (store.payments || []).filter(p => p.invoice_id === inv.id).length
      }));
    }

    res.json({ success: true, data: invoicesList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/invoices/:id - Detailed invoice view with items, payments, and audit logs
router.get('/invoices/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);

    let invoice: any = null;
    let items: any[] = [];
    let payments: any[] = [];
    let auditLogs: any[] = [];
    let customer: any = null;

    try {
      const [invRows]: any = await pool.query('SELECT * FROM invoices WHERE id = ? OR invoice_number = ?', [id, id]);
      if (invRows && invRows.length > 0) {
        invoice = invRows[0];
        const [itemRows]: any = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC', [invoice.id]);
        items = itemRows || [];

        const [payRows]: any = await pool.query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY id DESC', [invoice.id]);
        payments = payRows || [];

        const [auditRows]: any = await pool.query('SELECT * FROM invoice_audit_logs WHERE invoice_id = ? ORDER BY id DESC', [invoice.id]);
        auditLogs = auditRows || [];

        const [custRows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [invoice.customer_id]);
        if (custRows && custRows.length > 0) {
          customer = custRows[0];
        }
      }
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id) || i.invoice_number === id);
      if (invoice) {
        items = (store.invoice_items || []).filter(item => item.invoice_id === invoice.id);
        payments = (store.payments || []).filter(p => p.invoice_id === invoice.id);
        auditLogs = (store.invoice_audit_logs || []).filter(a => a.invoice_id === invoice.id);
        customer = (store.customers || []).find(c => c.id === invoice.customer_id);
      }
    }

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Role check: Sales Executive cannot view other salesperson's invoice
    if (authUser?.role === 'Sales Executive') {
      const isOwner = invoice.sales_user_id === authUser.id || 
                      invoice.sales_person_name === authUser.name || 
                      invoice.created_by === authUser.email;
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Access denied. You can only view your own assigned invoices.' });
      }
    }

    res.json({
      success: true,
      data: {
        ...invoice,
        items,
        payments,
        audit_logs: auditLogs,
        customer
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to fetch consolidated invoice data for PDF & Email
async function fetchCompleteInvoiceData(id: string | number) {
  let invoice: any = null;
  let items: any[] = [];
  let customer: any = null;
  let settings: any = null;

  try {
    const [invRows]: any = await pool.query('SELECT * FROM invoices WHERE id = ? OR invoice_number = ?', [id, id]);
    if (invRows && invRows.length > 0) {
      invoice = invRows[0];
      const [itemRows]: any = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC', [invoice.id]);
      items = itemRows || [];
      const [custRows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [invoice.customer_id]);
      if (custRows && custRows.length > 0) customer = custRows[0];
      const [setRows]: any = await pool.query('SELECT * FROM invoice_settings LIMIT 1');
      if (setRows && setRows.length > 0) settings = setRows[0];
    }
  } catch {
    const store = loadPersistentStore();
    invoice = (store.invoices || []).find(i => String(i.id) === String(id) || i.invoice_number === id);
    if (invoice) {
      items = (store.invoice_items || []).filter(item => item.invoice_id === invoice.id);
      customer = (store.customers || []).find(c => c.id === invoice.customer_id);
      settings = store.invoice_settings?.[0] || store.billing_settings;
    }
  }

  // Ensure settings are available even if MySQL didn't have row
  if (!settings) {
    try {
      const store = loadPersistentStore();
      settings = store.invoice_settings?.[0] || store.billing_settings;
    } catch {}
  }

  return { invoice, items, customer, settings };
}

// Helper to resolve public application base URL (supporting VPS domains, reverse proxies, and local development)
export function resolvePublicBaseUrl(req: express.Request, settings?: any): string {
  // 1. Explicit app_url in settings if configured
  if (settings?.app_url && typeof settings.app_url === 'string' && settings.app_url.trim()) {
    const custom = settings.app_url.trim().replace(/\/$/, '');
    if (!custom.includes('localhost') && !custom.includes('127.0.0.1')) {
      return custom;
    }
  }

  // 2. Detect incoming request headers from remote VPS client
  const fwdProto = (req.get('x-forwarded-proto') || '').split(',')[0].trim();
  const reqProto = fwdProto || req.protocol || 'https';
  const fwdHost = (req.get('x-forwarded-host') || '').split(',')[0].trim();
  const host = (fwdHost || req.get('host') || '').split(',')[0].trim();

  const origin = req.get('origin');
  if (origin) {
    try {
      const oUrl = new URL(origin);
      if (!oUrl.hostname.includes('localhost') && !oUrl.hostname.includes('127.0.0.1')) {
        return origin.replace(/\/$/, '');
      }
    } catch {}
  }

  const referer = req.get('referer');
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (!refUrl.hostname.includes('localhost') && !refUrl.hostname.includes('127.0.0.1')) {
        return refUrl.origin.replace(/\/$/, '');
      }
    } catch {}
  }

  // If host header is a public domain or VPS IP
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const cleanHost = host.replace(/:3001$/, '');
    return `${reqProto}://${cleanHost}`.replace(/\/$/, '');
  }

  // 3. Environment variable APP_URL (if not localhost)
  if (process.env.APP_URL && !process.env.APP_URL.includes('localhost') && !process.env.APP_URL.includes('127.0.0.1')) {
    return process.env.APP_URL.trim().replace(/\/$/, '');
  }

  // 4. company_website in settings (e.g. https://digi8solutions.com)
  if (settings?.company_website && typeof settings.company_website === 'string' && settings.company_website.startsWith('http')) {
    const web = settings.company_website.trim().replace(/\/$/, '');
    if (!web.includes('localhost') && !web.includes('127.0.0.1')) {
      return web;
    }
  }

  // 5. Local environment fallback
  return (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
}

// GET /api/invoices/:id/pdf - Stream or download official generated PDF
router.get('/invoices/:id/pdf', async (req, res) => {
  try {
    const id = req.params.id;
    const { invoice, items, customer, settings } = await fetchCompleteInvoiceData(id);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    const snapshot = typeof invoice.payment_details_snapshot === 'string'
      ? JSON.parse(invoice.payment_details_snapshot)
      : (invoice.payment_details_snapshot || settings || {});

    const sealUrl = snapshot?.seal_url || settings?.seal_url || '/images/seal.png';
    const sigUrl = snapshot?.signature_url || settings?.signature_url || '/images/signature.png';

    const rzpConfig = await getRazorpayConfig();
    const appBase = resolvePublicBaseUrl(req, settings);
    const cleanInvoiceNum = encodeURIComponent(invoice.invoice_number);
    const paymentUrl = invoice.razorpay_payment_link_url || `${appBase}/pay?inv=${cleanInvoiceNum}`;

    const pdfData: InvoicePdfData = {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      invoice_status: invoice.invoice_status,
      payment_status: invoice.payment_status,
      company_name: settings?.company_name || 'Digi8 Solutions Private Limited',
      company_address: settings?.company_address || 'T-Hub, Inorbit Mall Rd, Vittal Rao Nagar, Madhapur',
      company_city: settings?.company_city || 'Hyderabad',
      company_state: settings?.company_state || 'Telangana',
      company_pincode: settings?.company_pincode || '500032',
      company_phone: settings?.company_phone || '+91 90002 07739',
      company_email: settings?.company_email || 'hello@digi8solutions.com',
      company_gstin: settings?.company_gstin || '',
      company_pan: settings?.company_pan || '',
      customer_name: customer?.name || invoice.customer_name || 'Valued Client',
      customer_company: customer?.company_name || invoice.customer_company,
      customer_mobile: customer?.mobile || invoice.customer_mobile,
      customer_email: customer?.email || invoice.customer_email,
      customer_address: customer?.billing_address || invoice.customer_address,
      customer_city: customer?.city || invoice.customer_city,
      customer_state: customer?.state || invoice.customer_state,
      customer_gstin: customer?.gstin || invoice.customer_gstin,
      project_name: invoice.project_name,
      project_code: invoice.project_code,
      subtotal: Number(invoice.market_total ?? invoice.subtotal) || Number(invoice.taxable_amount) || 0,
      discount_total: Number(invoice.discount_total) || 0,
      taxable_amount: Number(invoice.taxable_amount) || 0,
      cgst_amount: Number(invoice.cgst_amount) || 0,
      sgst_amount: Number(invoice.sgst_amount) || 0,
      igst_amount: Number(invoice.igst_amount) || 0,
      tax_total: Number(invoice.tax_total) || 0,
      tax_type: invoice.tax_type,
      round_off: Number(invoice.round_off) || 0,
      grand_total: Number(invoice.grand_total) || 0,
      amount_paid: Number(invoice.amount_paid) || 0,
      balance_amount: Number(invoice.balance_amount) || 0,
      items: items.map(it => {
        const qty = Number(it.quantity) || 1;
        const selling = Number(it.unit_selling_price ?? it.selling_price) || 0;
        const market = Number(it.unit_market_price ?? it.market_price) || selling;
        const lineTotal = Number(it.line_total ?? it.total_amount) || (selling * qty);
        return {
          item_name: it.item_name || it.name || 'Deliverable',
          description: it.description,
          quantity: qty,
          unit_market_price: market,
          unit_selling_price: selling,
          discount_amount: Number(it.discount_amount) || 0,
          tax_percentage: it.tax_percentage !== undefined ? Number(it.tax_percentage) : 18,
          total_amount: lineTotal
        };
      }),
      razorpay_enabled: rzpConfig.enabled,
      razorpay_primary_payment: rzpConfig.primaryPayment,
      razorpay_key_id: rzpConfig.keyId,
      payment_url: paymentUrl,
      razorpay_payment_link_url: invoice.razorpay_payment_link_url || paymentUrl,
      show_bank_details: snapshot?.show_bank_details !== undefined ? snapshot.show_bank_details : (settings?.show_bank_details !== false),
      show_upi_qr: snapshot?.show_upi_qr !== undefined ? snapshot.show_upi_qr : (settings?.show_upi_qr !== false),
      payment_details: {
        bank_name: snapshot?.bank_name || settings?.bank_name || 'State Bank of India',
        bank_account_holder: snapshot?.bank_account_holder || settings?.bank_account_holder || 'N Narayana Swamy',
        bank_account_number: snapshot?.bank_account_number || settings?.bank_account_number || '43307998455',
        bank_ifsc: snapshot?.bank_ifsc || settings?.bank_ifsc || 'SBIN0004189',
        bank_branch: snapshot?.bank_branch || settings?.bank_branch || 'TADIPATRI BAZAR',
        upi_id: snapshot?.upi_id || settings?.upi_id || '9666252024@sbi',
        upi_display_name: snapshot?.upi_display_name || settings?.upi_display_name || '9666252024@sbi',
        payment_instructions: snapshot?.payment_instructions || settings?.payment_instructions,
        seal_url: sealUrl,
        signature_url: sigUrl,
        authorized_signatory_name: snapshot?.authorized_signatory_name || settings?.authorized_signatory_name || 'Authorized Signatory',
        authorized_signatory_title: snapshot?.authorized_signatory_title || settings?.authorized_signatory_title || 'Corporate Finance & Accounts Division',
        razorpay_enabled: rzpConfig.enabled,
        razorpay_primary_payment: rzpConfig.primaryPayment,
        razorpay_key_id: rzpConfig.keyId,
        payment_url: paymentUrl,
        show_bank_details: snapshot?.show_bank_details !== undefined ? snapshot.show_bank_details : (settings?.show_bank_details !== false),
        show_upi_qr: snapshot?.show_upi_qr !== undefined ? snapshot.show_upi_qr : (settings?.show_upi_qr !== false)
      },
      seal_url: sealUrl,
      signature_url: sigUrl,
      authorized_signatory_name: snapshot?.authorized_signatory_name || settings?.authorized_signatory_name || 'Authorized Signatory',
      authorized_signatory_title: snapshot?.authorized_signatory_title || settings?.authorized_signatory_title || 'Corporate Finance & Accounts Division',
      terms_conditions: invoice.terms_conditions || settings?.terms_conditions
    };

    const pdfBuffer = generateInvoicePdfBuffer(pdfData);
    const safeFilename = `Invoice-${String(invoice.invoice_number).replace(/[\/\\]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/send-email - Email invoice to lead/customer with PDF attachment
router.post('/invoices/:id/send-email', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    const { invoice, items, customer, settings } = await fetchCompleteInvoiceData(id);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    const recipientEmail = (req.body.recipient_email || customer?.email || invoice.customer_email || '').trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'A valid recipient email address is required. Please provide a recipient email or update customer details.'
      });
    }

    const snapshot = typeof invoice.payment_details_snapshot === 'string'
      ? JSON.parse(invoice.payment_details_snapshot)
      : (invoice.payment_details_snapshot || settings || {});

    const sealUrl = snapshot?.seal_url || settings?.seal_url || '/images/seal.png';
    const sigUrl = snapshot?.signature_url || settings?.signature_url || '/images/signature.png';
    
    const rzpConfig = await getRazorpayConfig();
    const appBase = resolvePublicBaseUrl(req, settings);
    const cleanInvoiceNum = encodeURIComponent(invoice.invoice_number);
    const paymentUrl = invoice.razorpay_payment_link_url || `${appBase}/pay?inv=${cleanInvoiceNum}`;

const pdfData: InvoicePdfData = {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      invoice_status: invoice.invoice_status,
      payment_status: invoice.payment_status,
      company_name: settings?.company_name || 'Digi8 Solutions Private Limited',
      company_address: settings?.company_address || 'T-Hub, Inorbit Mall Rd, Vittal Rao Nagar, Madhapur',
      company_city: settings?.company_city || 'Hyderabad',
      company_state: settings?.company_state || 'Telangana',
      company_pincode: settings?.company_pincode || '500032',
      company_phone: settings?.company_phone || '+91 90002 07739',
      company_email: settings?.company_email || 'hello@digi8solutions.com',
      company_gstin: settings?.company_gstin || '',
      company_pan: settings?.company_pan || '',
      customer_name: customer?.name || invoice.customer_name || 'Valued Client',
      customer_company: customer?.company_name || invoice.customer_company,
      customer_mobile: customer?.mobile || invoice.customer_mobile,
      customer_email: customer?.email || invoice.customer_email,
      customer_address: customer?.billing_address || invoice.customer_address,
      customer_city: customer?.city || invoice.customer_city,
      customer_state: customer?.state || invoice.customer_state,
      customer_gstin: customer?.gstin || invoice.customer_gstin,
      project_name: invoice.project_name,
      project_code: invoice.project_code,
      subtotal: Number(invoice.market_total ?? invoice.subtotal) || Number(invoice.taxable_amount) || 0,
      discount_total: Number(invoice.discount_total) || 0,
      taxable_amount: Number(invoice.taxable_amount) || 0,
      cgst_amount: Number(invoice.cgst_amount) || 0,
      sgst_amount: Number(invoice.sgst_amount) || 0,
      igst_amount: Number(invoice.igst_amount) || 0,
      tax_total: Number(invoice.tax_total) || 0,
      tax_type: invoice.tax_type,
      round_off: Number(invoice.round_off) || 0,
      grand_total: Number(invoice.grand_total) || 0,
      amount_paid: Number(invoice.amount_paid) || 0,
      balance_amount: Number(invoice.balance_amount) || 0,
      items: items.map(it => {
        const qty = Number(it.quantity) || 1;
        const selling = Number(it.unit_selling_price ?? it.selling_price) || 0;
        const market = Number(it.unit_market_price ?? it.market_price) || selling;
        const lineTotal = Number(it.line_total ?? it.total_amount) || (selling * qty);
        return {
          item_name: it.item_name || it.name || 'Deliverable',
          description: it.description,
          quantity: qty,
          unit_market_price: market,
          unit_selling_price: selling,
          discount_amount: Number(it.discount_amount) || 0,
          tax_percentage: it.tax_percentage !== undefined ? Number(it.tax_percentage) : 18,
          total_amount: lineTotal
        };
      }),
      razorpay_enabled: rzpConfig.enabled,
      razorpay_primary_payment: rzpConfig.primaryPayment,
      razorpay_key_id: rzpConfig.keyId,
      payment_url: paymentUrl,
      razorpay_payment_link_url: invoice.razorpay_payment_link_url || paymentUrl,
      show_bank_details: snapshot?.show_bank_details !== undefined ? snapshot.show_bank_details : (settings?.show_bank_details !== false),
      show_upi_qr: snapshot?.show_upi_qr !== undefined ? snapshot.show_upi_qr : (settings?.show_upi_qr !== false),
      payment_details: {
        bank_name: snapshot?.bank_name || settings?.bank_name || 'State Bank of India',
        bank_account_holder: snapshot?.bank_account_holder || settings?.bank_account_holder || 'N Narayana Swamy',
        bank_account_number: snapshot?.bank_account_number || settings?.bank_account_number || '43307998455',
        bank_ifsc: snapshot?.bank_ifsc || settings?.bank_ifsc || 'SBIN0004189',
        bank_branch: snapshot?.bank_branch || settings?.bank_branch || 'TADIPATRI BAZAR',
        upi_id: snapshot?.upi_id || settings?.upi_id || '9666252024@sbi',
        upi_display_name: snapshot?.upi_display_name || settings?.upi_display_name || '9666252024@sbi',
        payment_instructions: snapshot?.payment_instructions || settings?.payment_instructions,
        seal_url: sealUrl,
        signature_url: sigUrl,
        authorized_signatory_name: snapshot?.authorized_signatory_name || settings?.authorized_signatory_name || 'Authorized Signatory',
        authorized_signatory_title: snapshot?.authorized_signatory_title || settings?.authorized_signatory_title || 'Corporate Finance & Accounts Division',
        razorpay_enabled: rzpConfig.enabled,
        razorpay_primary_payment: rzpConfig.primaryPayment,
        razorpay_key_id: rzpConfig.keyId,
        payment_url: paymentUrl,
        show_bank_details: snapshot?.show_bank_details !== undefined ? snapshot.show_bank_details : (settings?.show_bank_details !== false),
        show_upi_qr: snapshot?.show_upi_qr !== undefined ? snapshot.show_upi_qr : (settings?.show_upi_qr !== false)
      },
      seal_url: sealUrl,
      signature_url: sigUrl,
      authorized_signatory_name: snapshot?.authorized_signatory_name || settings?.authorized_signatory_name || 'Authorized Signatory',
      authorized_signatory_title: snapshot?.authorized_signatory_title || settings?.authorized_signatory_title || 'Corporate Finance & Accounts Division',
      terms_conditions: invoice.terms_conditions || settings?.terms_conditions
    };

    const pdfBuffer = generateInvoicePdfBuffer(pdfData);
    const safeFilename = `Invoice-${String(invoice.invoice_number).replace(/[\/\\]/g, '_')}.pdf`;

    const emailSubject = req.body.subject?.trim() || `Invoice ${invoice.invoice_number} from Digi8 Solutions (Total: Rs. ${Number(invoice.grand_total).toLocaleString('en-IN')})`;
    const customMessage = req.body.message ? `<div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #00e5ff; color: #f8fafc; font-size: 14px;"><strong>Message:</strong><br/>${req.body.message.replace(/\n/g, '<br/>')}</div>` : '';

    const htmlBody = `
      <div style="font-family: Arial, -apple-system, sans-serif; max-width: 640px; margin: 0 auto; background-color: #0b101d; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden;">
        <div style="background-color: #070c17; border-bottom: 2px solid #00e5ff; padding: 24px; text-align: left;">
          <h1 style="color: #00e5ff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">DIGI8 SOLUTIONS</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Enterprise Digital Infrastructure & Technology Solutions</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">Tax Invoice #${invoice.invoice_number}</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Dear <strong>${customer?.name || invoice.customer_name || 'Client'}</strong>,<br/><br/>
            Thank you for choosing Digi8 Solutions. Please find attached the official copy of your tax invoice <strong>#${invoice.invoice_number}</strong>.
          </p>

          ${customMessage}

          <!-- Financial Summary Card -->
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Invoice Date:</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff; font-weight: bold;">${invoice.invoice_date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Due Date:</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff;">${invoice.due_date || 'Due on Receipt'}</td>
              </tr>
              ${invoice.project_name ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Project:</td>
                <td style="padding: 6px 0; text-align: right; color: #00e5ff; font-weight: bold;">${invoice.project_name}</td>
              </tr>` : ''}
              <tr style="border-top: 1px solid #1f2937; border-bottom: 1px solid #1f2937;">
                <td style="padding: 10px 0; font-size: 15px; font-weight: bold; color: #ffffff;">Grand Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: bold; color: #00e5ff;">Rs. ${Number(invoice.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #10b981;">Amount Paid:</td>
                <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: bold;">Rs. ${Number(invoice.amount_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #f43f5e; font-weight: bold;">Balance Due:</td>
                <td style="padding: 6px 0; text-align: right; color: #f43f5e; font-weight: bold; font-size: 14px;">Rs. ${Number(invoice.balance_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </table>
          </div>

          ${rzpConfig.enabled && Number(invoice.balance_amount) > 0 ? `
          <!-- Razorpay Online Payment Box -->
          <div style="background-color: #070c17; border: 1px solid #00e5ff; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
            <h4 style="color: #00e5ff; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Pay Securely Online via Razorpay</h4>
            <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 14px 0;">Instant receipt and automatic invoice reconciliation. Pay using UPI (GPay/PhonePe/Paytm), Cards, or Net Banking.</p>
            <a href="${paymentUrl}" style="display: inline-block; background-color: #00e5ff; color: #040914; font-weight: bold; font-size: 13px; padding: 12px 28px; border-radius: 6px; text-decoration: none;">
              Pay Rs. ${Number(invoice.balance_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Online Now &rarr;
            </a>
          </div>
          ` : ''}

          <!-- Direct Coordinates -->
          <div style="background-color: #070c17; border: 1px dashed #00e5ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #00e5ff; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase;">Direct Bank & UPI Payment Coordinates:</h4>
            <p style="color: #cbd5e1; font-size: 12px; margin: 4px 0; line-height: 1.5;">
              <strong>Bank:</strong> ${snapshot?.bank_name || 'HDFC Bank Ltd'}<br/>
              <strong>Account Name:</strong> ${snapshot?.bank_account_holder || 'Digi8 Solutions Private Limited'}<br/>
              <strong>Account Number:</strong> <span style="font-family: monospace; color: #ffffff;">${snapshot?.bank_account_number || '50200098765432'}</span><br/>
              <strong>IFSC Code:</strong> <span style="font-family: monospace; color: #ffffff;">${snapshot?.bank_ifsc || 'HDFC0000123'}</span><br/>
              <strong>UPI ID:</strong> <span style="font-family: monospace; color: #00e5ff;">${snapshot?.upi_id || 'digi8solutions@hdfcbank'}</span>
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-top: 20px;">
            📎 <strong>Attachment:</strong> A PDF copy (<strong>${safeFilename}</strong>) has been generated and attached to this email. You can download and keep it for your GST and accounting records.
          </p>
        </div>

        <div style="background-color: #070c17; border-top: 1px solid #1e293b; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
          &copy; ${new Date().getFullYear()} Digi8 Solutions Private Limited. All rights reserved.<br/>
          Mindspace Tech Park, Malad West, Mumbai, Maharashtra 400064 | GSTIN: 27AABCD1234F1Z5
        </div>
      </div>
    `;

    const mailRes = await sendMailWithFallbacks({
      from: `"Digi8 Solutions Billing" <${getSmtpUser()}>`,
      to: recipientEmail,
      subject: emailSubject,
      html: htmlBody,
      attachments: [
        {
          filename: safeFilename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    if (!mailRes.success) {
      return res.status(500).json({ success: false, error: mailRes.error || 'Failed to dispatch email.' });
    }

    // Update status to 'sent' if currently 'issued'
    try {
      if (invoice.invoice_status === 'issued') {
        await pool.query('UPDATE invoices SET invoice_status = ? WHERE id = ?', ['sent', invoice.id]);
      }
      await pool.query(
        'INSERT INTO invoice_audit_logs (invoice_id, action, changed_by, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [invoice.id, 'Invoice Sent by Email', authUser?.name || 'Staff', invoice.invoice_status, 'sent', `Dispatched to ${recipientEmail} with PDF attachment`]
      );
    } catch {
      const store = loadPersistentStore();
      const inv = (store.invoices || []).find(i => i.id === invoice.id);
      if (inv && inv.invoice_status === 'issued') {
        inv.invoice_status = 'sent';
      }
      if (!store.invoice_audit_logs) store.invoice_audit_logs = [];
      store.invoice_audit_logs.push({
        id: Date.now(),
        invoice_id: invoice.id,
        action: 'Invoice Sent by Email',
        changed_by: authUser?.name || 'Staff',
        old_value: invoice.invoice_status,
        new_value: 'sent',
        notes: `Dispatched to ${recipientEmail} with PDF attachment`,
        created_at: new Date().toISOString()
      });
      savePersistentStore(store);
    }

    broadcastAdminNotification(
      'INVOICE_SENT',
      'Invoice Sent via Email',
      `Invoice #${invoice.invoice_number} sent to ${recipientEmail} with PDF attached.`,
      {
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: `Invoice #${invoice.invoice_number} successfully sent to ${recipientEmail} with PDF attached.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices - Create new invoice (draft or issued)
router.post('/invoices', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const {
      lead_id,
      customer_id,
      customer,
      project_id,
      project_name,
      tax_calculation_mode = 'exclusive',
      invoice_date,
      due_date,
      items = [],
      extra_discount_type = 'fixed',
      extra_discount_value = 0,
      notes = '',
      terms_conditions,
      invoice_status = 'generated',
      initial_payment
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one invoice item is required.' });
    }

    // 1. Resolve Customer
    const custInput = customer || {
      name: req.body.customer_name || req.body.name,
      company_name: req.body.company_name,
      mobile: req.body.mobile || req.body.phone,
      email: req.body.email,
      billing_address: req.body.billing_address,
      shipping_address: req.body.shipping_address || req.body.billing_address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      gstin: req.body.gstin,
      pan: req.body.pan,
      customer_type: req.body.customer_type
    };

    let resolvedCustomerId = customer_id || null;
    let custName = custInput?.name || '';
    let custCompany = custInput?.company_name || '';
    let custMobile = custInput?.mobile || '';
    let custEmail = custInput?.email || '';
    let custAddress = custInput?.billing_address || '';
    let custCity = custInput?.city || 'Bengaluru';
    let custState = custInput?.state || 'Karnataka';
    let custPincode = custInput?.pincode || '';
    let custGstin = custInput?.gstin || '';
    let custPan = custInput?.pan || '';
    let custType = custInput?.customer_type || 'B2B';

    // If existing customer ID provided, load their details
    if (resolvedCustomerId) {
      try {
        const [cRows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [resolvedCustomerId]);
        if (cRows && cRows.length > 0) {
          const c = cRows[0];
          custName = c.name;
          custCompany = c.company_name;
          custMobile = c.mobile;
          custEmail = c.email;
          custAddress = c.billing_address;
          custCity = c.city;
          custState = c.state;
          custPincode = c.pincode;
          custGstin = c.gstin;
          custPan = c.pan;
          custType = c.customer_type;
        }
      } catch {
        const store = loadPersistentStore();
        const c = (store.customers || []).find(item => item.id === Number(resolvedCustomerId));
        if (c) {
          custName = c.name;
          custCompany = c.company_name;
          custMobile = c.mobile;
          custEmail = c.email;
          custAddress = c.billing_address;
          custCity = c.city;
          custState = c.state;
          custPincode = c.pincode;
          custGstin = c.gstin;
          custPan = c.pan;
          custType = c.customer_type;
        }
      }
    } else if (custName) {
      // Create new customer record
      try {
        const [resCust]: any = await pool.query(
          `INSERT INTO customers (name, company_name, mobile, email, billing_address, shipping_address, city, state, pincode, gstin, pan, customer_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            custName, custCompany, custMobile, custEmail,
            custAddress, custAddress, custCity, custState, custPincode,
            custGstin, custPan, custType
          ]
        );
        resolvedCustomerId = resCust.insertId;
      } catch {
        const store = loadPersistentStore();
        resolvedCustomerId = (store.customers?.length || 0) + 1;
        const newCust = {
          id: resolvedCustomerId,
          name: custName,
          company_name: custCompany,
          mobile: custMobile,
          email: custEmail,
          billing_address: custAddress,
          shipping_address: custAddress,
          city: custCity,
          state: custState,
          pincode: custPincode,
          gstin: custGstin,
          pan: custPan,
          customer_type: custType,
          created_at: new Date().toISOString()
        };
        store.customers.push(newCust);
        savePersistentStore(store);
      }
    }

    if (!resolvedCustomerId && !custName) {
      return res.status(400).json({ success: false, error: 'Customer information is required to generate an invoice.' });
    }

    // 2. Fetch Company State for Tax Jurisdiction
    let companyState = 'Maharashtra';
    let defaultTerms = '';
    try {
      const [setRows]: any = await pool.query('SELECT company_state, terms_conditions FROM invoice_settings LIMIT 1');
      if (setRows && setRows.length > 0) {
        companyState = setRows[0].company_state || companyState;
        defaultTerms = setRows[0].terms_conditions || '';
      }
    } catch {
      const store = loadPersistentStore();
      const s = store.invoice_settings?.[0];
      if (s) {
        companyState = s.company_state || companyState;
        defaultTerms = s.terms_conditions || '';
      }
    }

    // 3. Recalculate Financials on Backend
    const calc = calculateInvoiceFinancials(
      items,
      extra_discount_type,
      Number(extra_discount_value),
      custState,
      companyState,
      tax_calculation_mode as any
    );

    // Initial Payment calculation
    let initialPaid = 0;
    if (initial_payment && Number(initial_payment.amount) > 0) {
      initialPaid = Math.min(calc.grand_total, Number(initial_payment.amount));
    }

    const balanceAmount = Math.max(0, calc.grand_total - initialPaid);
    let paymentStatus = 'unpaid';
    if (initialPaid >= calc.grand_total) {
      paymentStatus = 'paid';
    } else if (initialPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    // 4. Generate Invoice Number if Finalized or Draft Number
    let invoiceNumber = '';
    const isDraft = invoice_status === 'draft';
    if (isDraft) {
      invoiceNumber = await getNextDraftNumber();
    } else {
      invoiceNumber = await getNextInvoiceNumber();
    }

    const salesUserId = req.body.sales_user_id || authUser?.id || null;
    const salesPersonName = req.body.sales_user_name || authUser?.name || 'Digi-8 Sales Executive';
    const createdBy = authUser?.name || req.body.sales_user_name || authUser?.email || 'System';
    const invDate = invoice_date || new Date().toISOString().split('T')[0];
    const fy = '2026-27';
    const paymentSnapshot = getPaymentDetailsSnapshot();
    const issuedAt = isDraft ? null : new Date().toISOString();

    let createdInvoiceId = 0;

    // 5. Save Invoice & Items in DB
    try {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const [invRes]: any = await conn.query(
          `INSERT INTO invoices (
            invoice_number, invoice_date, due_date, financial_year, lead_id, customer_id,
            customer_name, customer_company, customer_mobile, customer_email, customer_address,
            customer_city, customer_state, customer_pincode, customer_gstin,
            project_id, project_name,
            sales_user_id, sales_person_name,
            market_total, discount_total, extra_discount_type, extra_discount_value, extra_discount_amount,
            taxable_amount, tax_calculation_mode, tax_type, cgst_amount, sgst_amount, igst_amount, tax_total, round_off,
            grand_total, amount_paid, balance_amount, payment_status, invoice_status, notes, terms_conditions,
            payment_details_snapshot, revision_number, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceNumber, invDate, due_date || null, fy, lead_id || null, resolvedCustomerId,
            custName, custCompany, custMobile, custEmail, custAddress,
            custCity, custState, custPincode, custGstin,
            project_id || null, project_name || null,
            salesUserId, salesPersonName,
            calc.market_total, calc.discount_total, calc.extra_discount_type, calc.extra_discount_value, calc.extra_discount_amount,
            calc.taxable_amount, tax_calculation_mode, calc.tax_type, calc.cgst_amount, calc.sgst_amount, calc.igst_amount, calc.tax_total, calc.round_off,
            calc.grand_total, initialPaid, balanceAmount, paymentStatus, isDraft ? 'draft' : 'issued', notes, terms_conditions || defaultTerms,
            JSON.stringify(paymentSnapshot), 1, createdBy
          ]
        );

        createdInvoiceId = invRes.insertId;

        // Insert Line Items
        for (const item of calc.items) {
          await conn.query(
            `INSERT INTO invoice_items (
              invoice_id, product_id, item_type, item_name, description, sku, quantity, unit,
              market_price, selling_price, discount_type, discount_value, discount_amount,
              tax_percentage, tax_amount, line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              createdInvoiceId, item.product_id, item.item_type, item.item_name, item.description, item.sku, item.quantity, item.unit,
              item.market_price, item.selling_price, item.discount_type, item.discount_value, item.discount_amount,
              item.tax_percentage, item.tax_amount, item.line_total
            ]
          );
        }

        // Insert Initial Payment if recorded
        if (initialPaid > 0) {
          const payNumber = `PAY-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
          await conn.query(
            `INSERT INTO payments (invoice_id, project_id, payment_number, amount, payment_method, transaction_reference, payment_date, notes, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              createdInvoiceId, project_id || null, payNumber, initialPaid,
              initial_payment.payment_method || 'UPI',
              initial_payment.transaction_reference || '',
              invDate,
              initial_payment.notes || 'Initial payment on creation',
              createdBy
            ]
          );
        }

        await conn.commit();
      } catch (dbErr) {
        await conn.rollback();
        throw dbErr;
      } finally {
        conn.release();
      }
    } catch {
      // Fallback: persistent JSON store
      const store = loadPersistentStore();
      createdInvoiceId = (store.invoices?.length || 0) + 1;

      const newInvoiceObj = {
        id: createdInvoiceId,
        invoice_number: invoiceNumber,
        invoice_date: invDate,
        due_date: due_date || null,
        financial_year: fy,
        lead_id: lead_id || null,
        customer_id: resolvedCustomerId,
        customer_name: custName,
        customer_company: custCompany,
        customer_mobile: custMobile,
        customer_email: custEmail,
        customer_address: custAddress,
        customer_city: custCity,
        customer_state: custState,
        customer_pincode: custPincode,
        customer_gstin: custGstin,
        project_id: project_id || null,
        project_name: project_name || null,
        sales_user_id: salesUserId,
        sales_person_name: salesPersonName,
        market_total: calc.market_total,
        discount_total: calc.discount_total,
        extra_discount_type: calc.extra_discount_type,
        extra_discount_value: calc.extra_discount_value,
        extra_discount_amount: calc.extra_discount_amount,
        taxable_amount: calc.taxable_amount,
        tax_calculation_mode,
        tax_type: calc.tax_type,
        cgst_amount: calc.cgst_amount,
        sgst_amount: calc.sgst_amount,
        igst_amount: calc.igst_amount,
        tax_total: calc.tax_total,
        round_off: calc.round_off,
        grand_total: calc.grand_total,
        amount_paid: initialPaid,
        balance_amount: balanceAmount,
        payment_status: paymentStatus,
        invoice_status: isDraft ? 'draft' : 'issued',
        notes,
        terms_conditions: terms_conditions || defaultTerms,
        payment_details_snapshot: paymentSnapshot,
        revision_number: 1,
        issued_at: issuedAt,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      store.invoices.unshift(newInvoiceObj);

      calc.items.forEach((item, idx) => {
        store.invoice_items.push({
          id: (store.invoice_items?.length || 0) + idx + 1,
          invoice_id: createdInvoiceId,
          ...item,
          created_at: new Date().toISOString()
        });
      });

      if (initialPaid > 0) {
        const payNumber = `PAY-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        store.payments.push({
          id: (store.payments?.length || 0) + 1,
          invoice_id: createdInvoiceId,
          project_id: project_id || null,
          payment_number: payNumber,
          amount: initialPaid,
          payment_method: initial_payment.payment_method || 'UPI',
          transaction_reference: initial_payment.transaction_reference || '',
          payment_date: invDate,
          notes: initial_payment.notes || 'Initial payment on creation',
          created_by: createdBy,
          created_at: new Date().toISOString()
        });
      }

      savePersistentStore(store);
    }

    // 6. Audit Trail & Broadcast
    await logInvoiceAudit(
      createdInvoiceId,
      invoiceNumber,
      isDraft ? 'DRAFT_CREATED' : 'GENERATED',
      'None',
      `Invoice ${invoiceNumber} created (Grand Total: ₹${calc.grand_total.toLocaleString('en-IN')})`,
      createdBy
    );

    if (!isDraft) {
      broadcastAdminNotification(
        'INVOICE_GENERATED',
        '🧾 New Invoice Generated',
        `Invoice ${invoiceNumber} generated for ${custName} (₹${calc.grand_total.toLocaleString('en-IN')})`,
        { invoice_id: createdInvoiceId, invoice_number: invoiceNumber }
      );
    }

    res.json({
      success: true,
      message: isDraft ? 'Invoice draft saved successfully' : 'Invoice generated successfully',
      data: {
        id: createdInvoiceId,
        invoice_number: invoiceNumber,
        financial_year: fy,
        invoice_date: invDate,
        due_date,
        lead_id: lead_id || null,
        customer_id: resolvedCustomerId,
        customer_name: custName,
        customer_company: custCompany,
        customer_mobile: custMobile,
        customer_email: custEmail,
        customer_address: custAddress,
        customer_city: custCity,
        customer_state: custState,
        customer_pincode: custPincode,
        customer_gstin: custGstin,
        project_id: project_id || null,
        project_name: project_name || null,
        sales_user_id: salesUserId,
        sales_person_name: salesPersonName,
        market_total: calc.market_total,
        discount_total: calc.discount_total,
        extra_discount_type,
        extra_discount_value: Number(extra_discount_value),
        extra_discount_amount: calc.extra_discount_amount,
        taxable_amount: calc.taxable_amount,
        tax_calculation_mode,
        tax_type: calc.tax_type,
        cgst_amount: calc.cgst_amount,
        sgst_amount: calc.sgst_amount,
        igst_amount: calc.igst_amount,
        tax_total: calc.tax_total,
        round_off: calc.round_off,
        grand_total: calc.grand_total,
        amount_paid: initialPaid,
        balance_amount: balanceAmount,
        payment_status: paymentStatus,
        invoice_status: isDraft ? 'draft' : 'issued',
        payment_details_snapshot: paymentSnapshot,
        revision_number: 1,
        notes,
        terms_conditions: terms_conditions || defaultTerms,
        items: calc.items,
        created_at: new Date().toISOString()
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/invoices/:id - Update draft invoice in-place or finalize
router.put('/invoices/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    const {
      customer_id,
      customer_name,
      customer_company,
      customer_mobile,
      customer_email,
      customer_address,
      customer_city,
      customer_state,
      customer_pincode,
      customer_gstin,
      project_id,
      project_name,
      tax_calculation_mode,
      tax_type,
      invoice_date,
      due_date,
      items,
      extra_discount_type,
      extra_discount_value,
      notes,
      terms_conditions,
      invoice_status: nextStatus,
      customer
    } = req.body;

    let existingInvoice: any = null;

    try {
      const [invRows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (invRows && invRows.length > 0) existingInvoice = invRows[0];
    } catch {
      const store = loadPersistentStore();
      existingInvoice = (store.invoices || []).find(i => String(i.id) === String(id));
    }

    if (!existingInvoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Protection rule: Only Draft invoices can have items / financials edited
    if (existingInvoice.invoice_status !== 'draft' && nextStatus !== 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Finalized invoices cannot be modified directly. Create a credit note or cancel and reissue according to accounting rules.'
      });
    }

    // Role check: Sales Executive can only edit their own
    if (authUser?.role === 'Sales Executive') {
      const isOwner = existingInvoice.sales_user_id === authUser.id || 
                      existingInvoice.sales_person_name === authUser.name || 
                      existingInvoice.created_by === authUser.email;
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Access denied. You cannot edit this invoice.' });
      }
    }

    // Resolve target fields (support both flat fields and nested customer object)
    const custInput = customer || {};
    const targetCustName = customer_name !== undefined ? customer_name : (custInput.name !== undefined ? custInput.name : existingInvoice.customer_name);
    const targetCustCompany = customer_company !== undefined ? customer_company : (custInput.company_name !== undefined ? custInput.company_name : existingInvoice.customer_company);
    const targetCustMobile = customer_mobile !== undefined ? customer_mobile : (custInput.mobile !== undefined ? custInput.mobile : existingInvoice.customer_mobile);
    const targetCustEmail = customer_email !== undefined ? customer_email : (custInput.email !== undefined ? custInput.email : existingInvoice.customer_email);
    const targetCustAddress = customer_address !== undefined ? customer_address : (custInput.billing_address !== undefined ? custInput.billing_address : existingInvoice.customer_address);
    const targetCustCity = customer_city !== undefined ? customer_city : (custInput.city !== undefined ? custInput.city : existingInvoice.customer_city);
    const targetCustState = customer_state !== undefined ? customer_state : (custInput.state !== undefined ? custInput.state : existingInvoice.customer_state);
    const targetCustPincode = customer_pincode !== undefined ? customer_pincode : (custInput.pincode !== undefined ? custInput.pincode : existingInvoice.customer_pincode);
    const targetCustGstin = customer_gstin !== undefined ? customer_gstin : (custInput.gstin !== undefined ? custInput.gstin : existingInvoice.customer_gstin);
    const targetProjectId = project_id !== undefined ? project_id : existingInvoice.project_id;
    const targetProjectName = project_name !== undefined ? project_name : existingInvoice.project_name;
    const targetTaxMode = tax_calculation_mode || existingInvoice.tax_calculation_mode || 'exclusive';

    // Fetch Company State
    let companyState = 'Maharashtra';
    try {
      const [setRows]: any = await pool.query('SELECT company_state FROM invoice_settings LIMIT 1');
      if (setRows && setRows.length > 0) companyState = setRows[0].company_state || companyState;
    } catch {
      const store = loadPersistentStore();
      const s = store.invoice_settings?.[0];
      if (s) companyState = s.company_state || companyState;
    }

    let finalInvoiceNum = existingInvoice.invoice_number;
    const isPromotingToIssued = (existingInvoice.invoice_status === 'draft') && (nextStatus === 'issued' || nextStatus === 'generated');
    let newSnapshot = existingInvoice.payment_details_snapshot;
    let newIssuedAt = existingInvoice.issued_at;

    if (isPromotingToIssued) {
      if (finalInvoiceNum.startsWith('DFT-') || finalInvoiceNum.startsWith('DRAFT-')) {
        finalInvoiceNum = await getNextInvoiceNumber();
      }
      newSnapshot = getPaymentDetailsSnapshot();
      newIssuedAt = new Date().toISOString();
    }

    const nextRevision = (Number(existingInvoice.revision_number) || 1) + 1;

    const calc = items && items.length > 0
      ? calculateInvoiceFinancials(
          items,
          extra_discount_type || existingInvoice.extra_discount_type,
          extra_discount_value !== undefined ? Number(extra_discount_value) : existingInvoice.extra_discount_value,
          targetCustState,
          companyState,
          targetTaxMode,
          tax_type || existingInvoice.tax_type
        )
      : null;

    const updatedGrandTotal = calc ? calc.grand_total : existingInvoice.grand_total;
    const currentPaid = Number(existingInvoice.amount_paid) || 0;
    const updatedBalance = Math.max(0, updatedGrandTotal - currentPaid);
    const updatedPaymentStatus = updatedBalance <= 0 
      ? (currentPaid > 0 ? 'paid' : 'unpaid')
      : (currentPaid > 0 ? 'partially_paid' : 'unpaid');

    const updatedStatus = isPromotingToIssued ? 'issued' : (nextStatus || existingInvoice.invoice_status);
    const performedBy = authUser?.name || authUser?.email || 'User';

    try {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(
          `UPDATE invoices SET
            invoice_number = ?,
            invoice_date = COALESCE(?, invoice_date),
            due_date = COALESCE(?, due_date),
            customer_id = COALESCE(?, customer_id),
            customer_name = COALESCE(?, customer_name),
            customer_company = COALESCE(?, customer_company),
            customer_mobile = COALESCE(?, customer_mobile),
            customer_email = COALESCE(?, customer_email),
            customer_address = COALESCE(?, customer_address),
            customer_city = COALESCE(?, customer_city),
            customer_state = COALESCE(?, customer_state),
            customer_pincode = COALESCE(?, customer_pincode),
            customer_gstin = COALESCE(?, customer_gstin),
            project_id = ?,
            project_name = ?,
            market_total = COALESCE(?, market_total),
            discount_total = COALESCE(?, discount_total),
            extra_discount_type = COALESCE(?, extra_discount_type),
            extra_discount_value = COALESCE(?, extra_discount_value),
            extra_discount_amount = COALESCE(?, extra_discount_amount),
            taxable_amount = COALESCE(?, taxable_amount),
            tax_calculation_mode = ?,
            tax_type = ?,
            cgst_amount = COALESCE(?, cgst_amount),
            sgst_amount = COALESCE(?, sgst_amount),
            igst_amount = COALESCE(?, igst_amount),
            tax_total = COALESCE(?, tax_total),
            round_off = COALESCE(?, round_off),
            grand_total = COALESCE(?, grand_total),
            balance_amount = ?,
            payment_status = ?,
            invoice_status = ?,
            payment_details_snapshot = COALESCE(?, payment_details_snapshot),
            revision_number = ?,
            notes = COALESCE(?, notes),
            terms_conditions = COALESCE(?, terms_conditions)
           WHERE id = ?`,
          [
            finalInvoiceNum,
            invoice_date || null,
            due_date || null,
            customer_id || null,
            targetCustName,
            targetCustCompany,
            targetCustMobile,
            targetCustEmail,
            targetCustAddress,
            targetCustCity,
            targetCustState,
            targetCustPincode,
            targetCustGstin,
            targetProjectId || null,
            targetProjectName || null,
            calc ? calc.market_total : null,
            calc ? calc.discount_total : null,
            calc ? calc.extra_discount_type : null,
            calc ? calc.extra_discount_value : null,
            calc ? calc.extra_discount_amount : null,
            calc ? calc.taxable_amount : null,
            targetTaxMode,
            calc ? calc.tax_type : (tax_type || existingInvoice.tax_type || 'intra_state'),
            calc ? calc.cgst_amount : null,
            calc ? calc.sgst_amount : null,
            calc ? calc.igst_amount : null,
            calc ? calc.tax_total : null,
            calc ? calc.round_off : null,
            calc ? calc.grand_total : null,
            updatedBalance,
            updatedPaymentStatus,
            updatedStatus,
            newSnapshot ? (typeof newSnapshot === 'string' ? newSnapshot : JSON.stringify(newSnapshot)) : null,
            nextRevision,
            notes !== undefined ? notes : null,
            terms_conditions !== undefined ? terms_conditions : null,
            id
          ]
        );

        if (calc && calc.items.length > 0) {
          await conn.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
          for (const item of calc.items) {
            await conn.query(
              `INSERT INTO invoice_items (
                invoice_id, product_id, item_type, item_name, description, sku, quantity, unit,
                market_price, selling_price, discount_type, discount_value, discount_amount,
                tax_percentage, tax_amount, line_total
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id, item.product_id, item.item_type, item.item_name, item.description, item.sku, item.quantity, item.unit,
                item.market_price, item.selling_price, item.discount_type, item.discount_value, item.discount_amount,
                item.tax_percentage, item.tax_amount, item.line_total
              ]
            );
          }
        }

        await conn.commit();
      } catch (dbErr) {
        await conn.rollback();
        throw dbErr;
      } finally {
        conn.release();
      }
    } catch {
      const store = loadPersistentStore();
      const invIndex = (store.invoices || []).findIndex(i => String(i.id) === String(id));
      if (invIndex !== -1) {
        const inv = store.invoices[invIndex];
        inv.invoice_number = finalInvoiceNum;
        if (invoice_date) inv.invoice_date = invoice_date;
        if (due_date) inv.due_date = due_date;
        if (customer_id) inv.customer_id = customer_id;
        inv.customer_name = targetCustName;
        inv.customer_company = targetCustCompany;
        inv.customer_mobile = targetCustMobile;
        inv.customer_email = targetCustEmail;
        inv.customer_address = targetCustAddress;
        inv.customer_city = targetCustCity;
        inv.customer_state = targetCustState;
        inv.customer_pincode = targetCustPincode;
        inv.customer_gstin = targetCustGstin;
        inv.project_id = targetProjectId;
        inv.project_name = targetProjectName;
        inv.tax_calculation_mode = targetTaxMode;
        inv.tax_type = calc ? calc.tax_type : (tax_type || inv.tax_type || 'intra_state');
        if (notes !== undefined) inv.notes = notes;
        if (terms_conditions !== undefined) inv.terms_conditions = terms_conditions;
        inv.payment_status = updatedPaymentStatus;
        inv.invoice_status = updatedStatus;
        inv.revision_number = nextRevision;
        if (newSnapshot) inv.payment_details_snapshot = newSnapshot;
        if (newIssuedAt) inv.issued_at = newIssuedAt;
        inv.updated_at = new Date().toISOString();

        if (calc) {
          inv.market_total = calc.market_total;
          inv.discount_total = calc.discount_total;
          inv.extra_discount_type = calc.extra_discount_type;
          inv.extra_discount_value = calc.extra_discount_value;
          inv.extra_discount_amount = calc.extra_discount_amount;
          inv.taxable_amount = calc.taxable_amount;
          inv.cgst_amount = calc.cgst_amount;
          inv.sgst_amount = calc.sgst_amount;
          inv.igst_amount = calc.igst_amount;
          inv.tax_total = calc.tax_total;
          inv.round_off = calc.round_off;
          inv.grand_total = calc.grand_total;
          inv.balance_amount = updatedBalance;

          store.invoice_items = (store.invoice_items || []).filter(item => item.invoice_id !== Number(id));
          calc.items.forEach((item, idx) => {
            store.invoice_items.push({
              id: Date.now() + idx,
              invoice_id: Number(id),
              ...item,
              created_at: new Date().toISOString()
            });
          });
        }
        store.invoices[invIndex] = inv;
        savePersistentStore(store);
      }
    }

    await logInvoiceAudit(
      Number(id),
      finalInvoiceNum,
      isPromotingToIssued ? 'GENERATED' : 'DRAFT_UPDATED',
      existingInvoice.invoice_status,
      `Revision v${nextRevision}, Status: ${updatedStatus}, Grand Total: ₹${updatedGrandTotal}`,
      performedBy
    );

    if (isPromotingToIssued) {
      broadcastAdminNotification(
        'INVOICE_GENERATED',
        '🧾 Draft Issued as Official Invoice',
        `Invoice ${finalInvoiceNum} has been officially issued (₹${updatedGrandTotal.toLocaleString('en-IN')})`,
        { invoice_id: id, invoice_number: finalInvoiceNum }
      );
    }

    res.json({
      success: true,
      message: isPromotingToIssued ? 'Invoice finalized and issued successfully' : 'Draft invoice updated successfully',
      data: {
        id,
        invoice_number: finalInvoiceNum,
        status: updatedStatus,
        revision_number: nextRevision,
        grand_total: updatedGrandTotal
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/issue - Finalize & Issue Draft Invoice (1-Click)
router.post('/invoices/:id/issue', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);

    let invoice: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id));
    }

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    if (invoice.invoice_status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: `Invoice is already in '${invoice.invoice_status}' state.`
      });
    }

    const officialNumber = await getNextInvoiceNumber();
    const paymentSnapshot = getPaymentDetailsSnapshot();
    const nowIso = new Date().toISOString();
    const performedBy = authUser?.name || authUser?.email || 'User';

    try {
      await pool.query(
        `UPDATE invoices SET
          invoice_number = ?,
          invoice_status = 'issued',
          issued_at = ?,
          payment_details_snapshot = ?
         WHERE id = ?`,
        [officialNumber, nowIso, JSON.stringify(paymentSnapshot), id]
      );
    } catch {
      const store = loadPersistentStore();
      const inv = (store.invoices || []).find(i => String(i.id) === String(id));
      if (inv) {
        inv.invoice_number = officialNumber;
        inv.invoice_status = 'issued';
        inv.issued_at = nowIso;
        inv.payment_details_snapshot = paymentSnapshot;
        savePersistentStore(store);
      }
    }

    await logInvoiceAudit(
      Number(id),
      officialNumber,
      'INVOICE_ISSUED',
      invoice.invoice_status,
      `Promoted from draft ${invoice.invoice_number} to official invoice ${officialNumber}`,
      performedBy
    );

    broadcastAdminNotification(
      'INVOICE_GENERATED',
      '🧾 Invoice Issued',
      `Invoice ${officialNumber} has been officially issued for ${invoice.customer_name}`,
      { invoice_id: id, invoice_number: officialNumber }
    );

    res.json({
      success: true,
      message: 'Draft finalized and officially issued',
      data: {
        id: Number(id),
        invoice_number: officialNumber,
        invoice_status: 'issued',
        issued_at: nowIso
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/cancel - Cancel invoice with audit trail
router.post('/invoices/:id/cancel', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    const { reason = 'Cancelled by administrator' } = req.body;

    // Authorization: Sales Executive cannot cancel unless manager or admin
    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({ success: false, error: 'Sales Executives do not have permission to cancel finalized invoices. Please contact a Sales Manager or Admin.' });
    }

    let invoice: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id));
    }

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    if (invoice.invoice_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Invoice is already cancelled.' });
    }

    const performedBy = authUser?.name || authUser?.email || 'Administrator';
    const nowIso = new Date().toISOString();

    try {
      await pool.query(
        'UPDATE invoices SET invoice_status = ?, cancelled_reason = ?, cancelled_at = NOW() WHERE id = ?',
        ['cancelled', reason, id]
      );
    } catch {
      const store = loadPersistentStore();
      const inv = (store.invoices || []).find(i => String(i.id) === String(id));
      if (inv) {
        inv.invoice_status = 'cancelled';
        inv.cancelled_reason = reason;
        inv.cancelled_at = nowIso;
        savePersistentStore(store);
      }
    }

    await logInvoiceAudit(
      Number(id),
      invoice.invoice_number,
      'CANCELLED',
      invoice.invoice_status,
      `Reason: ${reason}`,
      performedBy
    );

    broadcastAdminNotification(
      'INVOICE_CANCELLED',
      '⚠️ Invoice Cancelled',
      `Invoice ${invoice.invoice_number} was cancelled by ${performedBy}`,
      { invoice_id: id, invoice_number: invoice.invoice_number }
    );

    res.json({
      success: true,
      message: 'Invoice marked as cancelled successfully',
      data: { id: Number(id), invoice_number: invoice.invoice_number, invoice_status: 'cancelled' }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 2. PAYMENT MANAGEMENT
// ──────────────────────────────────────────────

// GET /api/invoices/:id/payments - List payments for an invoice
router.get('/invoices/:id/payments', async (req, res) => {
  try {
    const id = req.params.id;
    let payments: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY id DESC', [id]);
      payments = rows || [];
    } catch {
      const store = loadPersistentStore();
      payments = (store.payments || []).filter(p => String(p.invoice_id) === String(id));
    }
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/payments - Record a payment
router.post('/invoices/:id/payments', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    const {
      amount,
      payment_method = 'UPI',
      transaction_reference = '',
      payment_date,
      notes = ''
    } = req.body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ success: false, error: 'A valid payment amount greater than zero is required.' });
    }

    let invoice: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id));
    }

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    if (invoice.invoice_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot record payment for a cancelled invoice.' });
    }

    const currentBalance = Number(invoice.balance_amount);
    if (paymentAmount > currentBalance + 0.01) {
      return res.status(400).json({
        success: false,
        error: `Payment amount (₹${paymentAmount}) exceeds the outstanding balance (₹${currentBalance}).`
      });
    }

    const newAmountPaid = Number(invoice.amount_paid) + paymentAmount;
    const newBalance = Math.max(0, Number(invoice.grand_total) - newAmountPaid);
    const newPaymentStatus = newBalance <= 0 ? 'paid' : 'partially_paid';
    const newInvoiceStatus = newBalance <= 0 
      ? 'paid' 
      : (invoice.invoice_status === 'issued' ? 'partially_paid' : invoice.invoice_status);

    const payNumber = `PAY-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const payDate = payment_date || new Date().toISOString().split('T')[0];
    const createdBy = authUser?.name || authUser?.email || 'Staff';

    try {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(
          `INSERT INTO payments (invoice_id, project_id, payment_number, amount, payment_method, transaction_reference, payment_date, notes, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, invoice.project_id || null, payNumber, paymentAmount, payment_method, transaction_reference, payDate, notes, createdBy]
        );

        await conn.query(
          'UPDATE invoices SET amount_paid = ?, balance_amount = ?, payment_status = ?, invoice_status = ? WHERE id = ?',
          [newAmountPaid, newBalance, newPaymentStatus, newInvoiceStatus, id]
        );

        await conn.commit();
      } catch (dbErr) {
        await conn.rollback();
        throw dbErr;
      } finally {
        conn.release();
      }
    } catch {
      const store = loadPersistentStore();
      const newPay = {
        id: (store.payments?.length || 0) + 1,
        invoice_id: Number(id),
        project_id: invoice.project_id || null,
        payment_number: payNumber,
        amount: paymentAmount,
        payment_method,
        transaction_reference,
        payment_date: payDate,
        notes,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
      if (!Array.isArray(store.payments)) store.payments = [];
      store.payments.push(newPay);

      const invIndex = (store.invoices || []).findIndex(i => String(i.id) === String(id));
      if (invIndex !== -1) {
        store.invoices[invIndex].amount_paid = newAmountPaid;
        store.invoices[invIndex].balance_amount = newBalance;
        store.invoices[invIndex].payment_status = newPaymentStatus;
        store.invoices[invIndex].invoice_status = newInvoiceStatus;
      }
      savePersistentStore(store);
    }

    await logInvoiceAudit(
      Number(id),
      invoice.invoice_number,
      'PAYMENT_ADDED',
      `Balance ₹${currentBalance}`,
      `Paid ₹${paymentAmount} via ${payment_method}. Remaining Balance: ₹${newBalance}`,
      createdBy
    );

    broadcastAdminNotification(
      'PAYMENT_RECORDED',
      '💰 Payment Recorded',
      `Payment of ₹${paymentAmount.toLocaleString('en-IN')} received for invoice ${invoice.invoice_number}`,
      { invoice_id: id, invoice_number: invoice.invoice_number, amount: paymentAmount }
    );

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment_number: payNumber,
        amount_paid: newAmountPaid,
        balance_amount: newBalance,
        payment_status: newPaymentStatus
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/payments/:paymentId/reverse - Reverse payment with audit trail
router.post('/invoices/:id/payments/:paymentId/reverse', async (req, res) => {
  try {
    const { id, paymentId } = req.params;
    const authUser = getAuthUser(req);
    const { reason = 'Payment reversed / bounced' } = req.body;

    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({
        success: false,
        error: 'Only Billing Admins and Financial Managers are authorized to reverse recorded payments.'
      });
    }

    let invoice: any = null;
    let payment: any = null;

    try {
      const [invRows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (invRows && invRows.length > 0) invoice = invRows[0];
      const [payRows]: any = await pool.query('SELECT * FROM payments WHERE id = ? AND invoice_id = ?', [paymentId, id]);
      if (payRows && payRows.length > 0) payment = payRows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id));
      payment = (store.payments || []).find(p => String(p.id) === String(paymentId) && String(p.invoice_id) === String(id));
    }

    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found.' });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment record not found.' });
    if (payment.status === 'reversed') {
      return res.status(400).json({ success: false, error: 'This payment has already been reversed.' });
    }

    const reversedAmount = Number(payment.amount) || 0;
    const newAmountPaid = Math.max(0, Number(invoice.amount_paid) - reversedAmount);
    const newBalance = Math.max(0, Number(invoice.grand_total) - newAmountPaid);
    const newPaymentStatus = newAmountPaid <= 0 ? 'unpaid' : (newBalance <= 0 ? 'paid' : 'partially_paid');
    const newInvoiceStatus = newBalance <= 0 
      ? 'paid' 
      : (newAmountPaid > 0 ? 'partially_paid' : (invoice.invoice_status === 'draft' ? 'draft' : 'issued'));

    const performedBy = authUser?.name || authUser?.email || 'Admin';
    const nowIso = new Date().toISOString();

    try {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(
          `UPDATE payments SET status = 'reversed', reversed_at = NOW(), reversed_by = ?, reversal_reason = ? WHERE id = ?`,
          [performedBy, reason, paymentId]
        );

        await conn.query(
          `UPDATE invoices SET amount_paid = ?, balance_amount = ?, payment_status = ?, invoice_status = ? WHERE id = ?`,
          [newAmountPaid, newBalance, newPaymentStatus, newInvoiceStatus, id]
        );

        await conn.commit();
      } catch (dbErr) {
        await conn.rollback();
        throw dbErr;
      } finally {
        conn.release();
      }
    } catch {
      const store = loadPersistentStore();
      const p = (store.payments || []).find(item => String(item.id) === String(paymentId));
      if (p) {
        p.status = 'reversed';
        p.reversed_at = nowIso;
        p.reversed_by = performedBy;
        p.reversal_reason = reason;
      }
      const inv = (store.invoices || []).find(item => String(item.id) === String(id));
      if (inv) {
        inv.amount_paid = newAmountPaid;
        inv.balance_amount = newBalance;
        inv.payment_status = newPaymentStatus;
        inv.invoice_status = newInvoiceStatus;
      }
      savePersistentStore(store);
    }

    await logInvoiceAudit(
      Number(id),
      invoice.invoice_number,
      'PAYMENT_REVERSED',
      `Payment #${payment.payment_number} (₹${reversedAmount})`,
      `Reversed by ${performedBy}. Reason: ${reason}. Outstanding Balance: ₹${newBalance}`,
      performedBy
    );

    broadcastAdminNotification(
      'PAYMENT_REVERSED',
      '⚠️ Payment Reversed',
      `Payment #${payment.payment_number} of ₹${reversedAmount.toLocaleString('en-IN')} for invoice ${invoice.invoice_number} was reversed.`,
      { invoice_id: id, payment_id: paymentId, amount: reversedAmount }
    );

    res.json({
      success: true,
      message: 'Payment reversed successfully',
      data: {
        payment_id: paymentId,
        reversed_amount: reversedAmount,
        amount_paid: newAmountPaid,
        balance_amount: newBalance,
        payment_status: newPaymentStatus
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payments/razorpay/config - Public Razorpay client configuration
router.get('/payments/razorpay/config', async (_req, res) => {
  try {
    const config = await getPublicRazorpayConfig();
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/invoices/public/:id - Public customer-facing invoice view (No auth required)
router.get('/invoices/public/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { invoice, items, customer, settings } = await fetchCompleteInvoiceData(id);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    // Load payments for this invoice
    let payments: any[] = [];
    try {
      const [pRows]: any = await pool.query(
        'SELECT * FROM payments WHERE invoice_id = ? ORDER BY id DESC',
        [invoice.id]
      );
      payments = pRows || [];
    } catch {
      const store = loadPersistentStore();
      payments = (store.payments || []).filter(p => Number(p.invoice_id) === Number(invoice.id));
    }

    // Dynamic Outstanding calculation from individual payments
    const successfulPayments = payments.filter(p => p.status === 'success' || p.status === 'completed' || !p.status);
    const sumPaid = successfulPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const grandTotal = Number(invoice.grand_total) || 0;
    const balanceAmount = Math.max(0, grandTotal - sumPaid);

    let paymentStatus = invoice.payment_status;
    if (balanceAmount <= 0.01) {
      paymentStatus = 'paid';
    } else if (sumPaid > 0) {
      paymentStatus = 'partially_paid';
    } else {
      paymentStatus = 'unpaid';
    }

    const rzpConfig = await getPublicRazorpayConfig();

    res.json({
      success: true,
      data: {
        invoice: {
          ...invoice,
          amount_paid: sumPaid,
          balance_amount: balanceAmount,
          payment_status: paymentStatus
        },
        items,
        customer,
        payments,
        settings: {
          company_name: settings?.company_name || 'Digi8 Solutions Private Limited',
          company_address: settings?.company_address,
          company_city: settings?.company_city,
          company_state: settings?.company_state,
          company_pincode: settings?.company_pincode,
          company_phone: settings?.company_phone,
          company_email: settings?.company_email,
          company_website: settings?.company_website,
          company_gstin: settings?.company_gstin,
          company_pan: settings?.company_pan,
          terms_conditions: invoice.terms_conditions || settings?.terms_conditions,
          upi_id: settings?.upi_id || 'digi8solutions@hdfcbank',
          upi_display_name: settings?.upi_display_name || 'Digi8 Solutions',
          bank_name: settings?.bank_name,
          bank_account_holder: settings?.bank_account_holder,
          bank_account_number: settings?.bank_account_number,
          bank_ifsc: settings?.bank_ifsc,
          bank_branch: settings?.bank_branch,
          show_upi_qr: settings?.show_upi_qr !== false,
          show_bank_details: settings?.show_bank_details !== false,
          razorpay_enabled: rzpConfig.enabled,
          razorpay_primary_payment: rzpConfig.primaryPayment
        },
        razorpay: rzpConfig
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/razorpay-order - Create Razorpay order for current outstanding amount
router.post('/invoices/:id/razorpay-order', async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch invoice
    let invoice: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ? OR invoice_number = ?', [id, id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id) || i.invoice_number === id);
    }

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    if (invoice.invoice_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot create payment order for cancelled invoice.' });
    }

    // Calculate actual outstanding amount from database payments
    let sumPaid = 0;
    try {
      const [sumRows]: any = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ? AND (status = 'success' OR status IS NULL OR status = 'completed')",
        [invoice.id]
      );
      sumPaid = Number(sumRows[0]?.total_paid || 0);
    } catch {
      const store = loadPersistentStore();
      sumPaid = (store.payments || [])
        .filter(p => Number(p.invoice_id) === Number(invoice.id) && p.status !== 'reversed' && p.status !== 'failed')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }

    const grandTotal = Number(invoice.grand_total) || 0;
    const outstanding = Math.max(0, grandTotal - sumPaid);

    if (outstanding <= 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Invoice is already fully paid. No outstanding balance remains.',
        balance_amount: 0,
        payment_status: 'paid'
      });
    }

    // Optional partial amount override if customer wishes to pay less than outstanding
    // (Never trust amount > outstanding!)
    let requestedAmount = outstanding;
    if (req.body.amount && Number(req.body.amount) > 0) {
      const parsedReq = Number(req.body.amount);
      if (parsedReq > outstanding + 0.01) {
        return res.status(400).json({
          success: false,
          error: `Payment amount (₹${parsedReq}) cannot exceed the outstanding balance of ₹${outstanding}.`
        });
      }
      requestedAmount = parsedReq;
    }

    const orderRes = await createRazorpayOrder({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerId: invoice.customer_id,
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
      customerMobile: invoice.customer_mobile,
      amount: requestedAmount,
      currency: 'INR'
    });

    if (!orderRes.success || !orderRes.orderId) {
      return res.status(500).json({ success: false, error: orderRes.error || 'Failed to initialize payment order.' });
    }

    // Store order ID on invoice
    try {
      await pool.query('UPDATE invoices SET razorpay_order_id = ? WHERE id = ?', [orderRes.orderId, invoice.id]);
    } catch {
      const store = loadPersistentStore();
      const inv = (store.invoices || []).find(i => Number(i.id) === Number(invoice.id));
      if (inv) inv.razorpay_order_id = orderRes.orderId;
      savePersistentStore(store);
    }

    const publicCfg = await getPublicRazorpayConfig();

    res.json({
      success: true,
      data: {
        order_id: orderRes.orderId,
        amount: orderRes.amount, // in paise
        amount_in_rupees: requestedAmount,
        currency: orderRes.currency || 'INR',
        key_id: publicCfg.keyId,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        outstanding_balance: outstanding,
        customer: {
          name: invoice.customer_name,
          email: invoice.customer_email,
          mobile: invoice.customer_mobile
        },
        is_simulated: orderRes.isSimulated
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/razorpay-link - Create or retrieve dynamic Razorpay Payment Link
router.post('/invoices/:id/razorpay-link', async (req, res) => {
  try {
    const id = req.params.id;

    let invoice: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ? OR invoice_number = ?', [id, id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id) || i.invoice_number === id);
    }

    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found.' });
    if (invoice.invoice_status === 'cancelled') return res.status(400).json({ success: false, error: 'Invoice is cancelled.' });

    // Calculate actual outstanding amount
    let sumPaid = 0;
    try {
      const [sumRows]: any = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ? AND (status = 'success' OR status IS NULL OR status = 'completed')",
        [invoice.id]
      );
      sumPaid = Number(sumRows[0]?.total_paid || 0);
    } catch {
      const store = loadPersistentStore();
      sumPaid = (store.payments || [])
        .filter(p => Number(p.invoice_id) === Number(invoice.id) && p.status !== 'reversed' && p.status !== 'failed')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }

    const outstanding = Math.max(0, Number(invoice.grand_total) - sumPaid);
    if (outstanding <= 0.01) {
      return res.status(400).json({ success: false, error: 'Invoice is already fully paid.' });
    }

    const linkRes = await createRazorpayPaymentLink({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
      customerMobile: invoice.customer_mobile,
      amount: outstanding
    });

    if (!linkRes.success) {
      return res.status(500).json({ success: false, error: linkRes.error || 'Failed to create payment link.' });
    }

    // Save payment link reference in DB
    try {
      await pool.query(
        'UPDATE invoices SET razorpay_payment_link_id = ?, razorpay_payment_link_url = ? WHERE id = ?',
        [linkRes.paymentLinkId, linkRes.shortUrl, invoice.id]
      );
    } catch {
      const store = loadPersistentStore();
      const inv = (store.invoices || []).find(i => Number(i.id) === Number(invoice.id));
      if (inv) {
        inv.razorpay_payment_link_id = linkRes.paymentLinkId;
        inv.razorpay_payment_link_url = linkRes.shortUrl;
      }
      savePersistentStore(store);
    }

    res.json({
      success: true,
      data: {
        payment_link_id: linkRes.paymentLinkId,
        payment_link_url: linkRes.shortUrl,
        amount: outstanding,
        is_simulated: linkRes.isSimulated
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/:id/payment-verify - Server-side Razorpay payment signature verification & reconciliation
router.post('/invoices/:id/payment-verify', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      payment_method = 'Razorpay'
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Razorpay Payment ID is required.' });
    }

    // 1. Fetch invoice
    let invoice: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ? OR invoice_number = ?', [id, id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } catch {
      const store = loadPersistentStore();
      invoice = (store.invoices || []).find(i => String(i.id) === String(id) || i.invoice_number === id);
    }

    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found.' });

    // 2. Signature verification
    const cfg = await getRazorpayConfig();
    if (razorpay_order_id && razorpay_signature) {
      const isValidSig = verifyRazorpayPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        cfg.keySecret
      );

      if (!isValidSig) {
        console.warn(`[RAZORPAY VERIFY FAILED] Invalid payment signature for order ${razorpay_order_id}, payment ${razorpay_payment_id}`);
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature. Payment verification failed.'
        });
      }
    }

    // 3. Compute pay amount
    // If not sent explicitly, use the outstanding balance
    const payAmount = Number(amount) > 0 ? Number(amount) : Number(invoice.balance_amount);

    // 4. Record payment with transaction safety & idempotency
    const payResult = await recordVerifiedRazorpayPayment({
      invoiceId: invoice.id,
      amount: payAmount,
      paymentMethod: 'Razorpay',
      transactionReference: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      notes: `Verified online payment (${razorpay_payment_id})`,
      createdBy: 'Razorpay Gateway'
    });

    if (!payResult.success) {
      return res.status(400).json({ success: false, error: payResult.error });
    }

    res.json({
      success: true,
      message: payResult.isDuplicate 
        ? 'Payment already processed and recorded' 
        : 'Payment verified and invoice updated successfully',
      data: payResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Webhook Handler Function (Used by both /payments/razorpay/webhook and /billing/webhook/razorpay)
async function handleRazorpayWebhookEvent(req: express.Request, res: express.Response) {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const cfg = await getRazorpayConfig();

    // Verify signature if secret is configured
    if (cfg.webhookSecret && signature) {
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const isSigValid = verifyRazorpayWebhookSignature(rawBody, signature, cfg.webhookSecret);
      if (!isSigValid) {
        console.warn('[RAZORPAY WEBHOOK] Invalid webhook signature detected. Rejecting request.');
        return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
      }
    }

    const event = req.body;
    const eventType = event?.event;
    console.log(`[RAZORPAY WEBHOOK] Processing event: ${eventType} (Event ID: ${event?.event_id || event?.id || 'none'})`);

    // Handle payment.captured and order.paid
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentPayload = event.payload?.payment?.entity;
      const orderPayload = event.payload?.order?.entity;

      const invoiceIdRaw = paymentPayload?.notes?.invoice_id || orderPayload?.notes?.invoice_id;
      const invoiceNumberRaw = paymentPayload?.notes?.invoice_number || orderPayload?.notes?.invoice_number;
      const paymentId = paymentPayload?.id;
      const orderId = paymentPayload?.order_id || orderPayload?.id;
      const amount = paymentPayload?.amount ? Number(paymentPayload.amount) / 100 : (orderPayload?.amount_paid ? Number(orderPayload.amount_paid) / 100 : 0);
      const method = paymentPayload?.method || 'Razorpay';

      let invoiceId = invoiceIdRaw ? Number(invoiceIdRaw) : null;

      // If invoiceId not directly in notes, lookup by invoice number
      if (!invoiceId && invoiceNumberRaw) {
        try {
          const [invRows]: any = await pool.query('SELECT id FROM invoices WHERE invoice_number = ?', [invoiceNumberRaw]);
          if (invRows && invRows.length > 0) invoiceId = invRows[0].id;
        } catch {
          const store = loadPersistentStore();
          const inv = (store.invoices || []).find(i => i.invoice_number === invoiceNumberRaw);
          if (inv) invoiceId = inv.id;
        }
      }

      if (invoiceId && paymentId && amount > 0) {
        await recordVerifiedRazorpayPayment({
          invoiceId,
          amount,
          paymentMethod: method.toUpperCase(),
          transactionReference: paymentId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          webhookEventId: event?.id || event?.event_id,
          rawReference: paymentPayload,
          notes: `Recorded automatically via Razorpay Webhook (${eventType})`,
          createdBy: 'Razorpay Webhook'
        });
      }
    } else if (eventType === 'payment.failed') {
      // Requirement 19: Payment Failure Handling
      // Failed payment does NOT increase amount_paid. Paid amount remains unchanged.
      const paymentPayload = event.payload?.payment?.entity;
      const invoiceIdRaw = paymentPayload?.notes?.invoice_id;
      const paymentId = paymentPayload?.id;
      const errorDesc = paymentPayload?.error_description || 'Payment transaction failed';

      console.warn(`[RAZORPAY WEBHOOK] Payment failed for invoice ${invoiceIdRaw} (${paymentId}): ${errorDesc}`);

      if (invoiceIdRaw) {
        const store = loadPersistentStore();
        if (!Array.isArray(store.invoice_audit_logs)) store.invoice_audit_logs = [];
        store.invoice_audit_logs.push({
          id: Date.now(),
          invoice_id: Number(invoiceIdRaw),
          action: 'PAYMENT_FAILED',
          old_value: 'Processing',
          new_value: `Payment Failed (${paymentId}): ${errorDesc}`,
          performed_by: 'Razorpay Webhook',
          created_at: new Date().toISOString()
        });
        savePersistentStore(store);

        broadcastAdminNotification(
          'PAYMENT_FAILED',
          '❌ Online Payment Failed',
          `Payment attempt of ₹${((paymentPayload?.amount || 0) / 100).toLocaleString('en-IN')} failed: ${errorDesc}`,
          { invoice_id: invoiceIdRaw, payment_id: paymentId, error: errorDesc }
        );
      }
    } else if (eventType === 'refund.processed') {
      // Requirement 20: Refund Handling
      const refundPayload = event.payload?.refund?.entity;
      const paymentPayload = event.payload?.payment?.entity;
      const paymentId = refundPayload?.payment_id || paymentPayload?.id;
      const refundAmount = (refundPayload?.amount || 0) / 100;

      console.log(`[RAZORPAY WEBHOOK] Refund processed: ₹${refundAmount} for payment ${paymentId}`);

      if (paymentId) {
        const store = loadPersistentStore();
        const paymentRecord = (store.payments || []).find(p => p.transaction_reference === paymentId || p.razorpay_payment_id === paymentId);
        if (paymentRecord) {
          paymentRecord.status = 'refunded';
          paymentRecord.reversal_reason = `Refunded via Razorpay (${refundPayload?.id || 'Ref'})`;

          // Recalculate invoice
          const inv = (store.invoices || []).find(i => Number(i.id) === Number(paymentRecord.invoice_id));
          if (inv) {
            const activePayments = (store.payments || []).filter(p => Number(p.invoice_id) === Number(inv.id) && p.status !== 'refunded' && p.status !== 'reversed');
            const totalPaid = activePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const balance = Math.max(0, Number(inv.grand_total) - totalPaid);
            inv.amount_paid = totalPaid;
            inv.balance_amount = balance;
            inv.payment_status = balance <= 0 ? 'paid' : (totalPaid > 0 ? 'partially_paid' : 'unpaid');
          }
          savePersistentStore(store);
        }
      }
    }

    res.json({ status: 'ok', event: eventType });
  } catch (err: any) {
    console.error('[RAZORPAY WEBHOOK ERROR]', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
}

// POST /api/payments/razorpay/webhook - Primary Razorpay webhook endpoint
router.post('/payments/razorpay/webhook', handleRazorpayWebhookEvent);

// POST /api/billing/webhook/razorpay - Backward-compatible webhook alias
router.post('/billing/webhook/razorpay', handleRazorpayWebhookEvent);

// GET /api/payments/transactions - Comprehensive payments log for Admin & Sales dashboards
router.get('/payments/transactions', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    let payments: any[] = [];
    let invoices: any[] = [];

    try {
      const [payRows]: any = await pool.query('SELECT * FROM payments ORDER BY id DESC');
      payments = payRows || [];
      const [invRows]: any = await pool.query('SELECT id, invoice_number, customer_id, customer_name, customer_company, grand_total, amount_paid, balance_amount, payment_status, sales_user_id, sales_person_name FROM invoices');
      invoices = invRows || [];
    } catch {
      const store = loadPersistentStore();
      payments = [...(store.payments || [])].sort((a, b) => (b.id || 0) - (a.id || 0));
      invoices = store.invoices || [];
    }

    // Map invoice and customer info to each payment record
    const invoiceMap = new Map(invoices.map(i => [Number(i.id), i]));

    let transactions = payments.map(p => {
      const inv = invoiceMap.get(Number(p.invoice_id));
      return {
        id: p.id,
        invoice_id: p.invoice_id,
        invoice_number: inv?.invoice_number || `INV-${p.invoice_id}`,
        customer_name: inv?.customer_name || 'Customer',
        customer_company: inv?.customer_company,
        payment_number: p.payment_number,
        amount: Number(p.amount),
        currency: p.currency || 'INR',
        payment_method: p.payment_method,
        transaction_reference: p.transaction_reference,
        razorpay_order_id: p.razorpay_order_id,
        razorpay_payment_id: p.razorpay_payment_id || p.transaction_reference,
        razorpay_payment_link_id: p.razorpay_payment_link_id,
        status: p.status || 'success',
        payment_date: p.payment_date,
        created_by: p.created_by,
        created_at: p.created_at,
        sales_person_name: inv?.sales_person_name,
        invoice_grand_total: inv?.grand_total,
        invoice_balance: inv?.balance_amount,
        invoice_payment_status: inv?.payment_status
      };
    });

    // Sales Executive filter
    if (authUser?.role === 'Sales Executive') {
      transactions = transactions.filter(t => 
        t.sales_person_name === authUser.name || t.created_by === authUser.email
      );
    }

    res.json({ success: true, data: transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET /api/invoices/:id/audit-logs - Audit history
router.get('/invoices/:id/audit-logs', async (req, res) => {
  try {
    const id = req.params.id;
    let logs: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoice_audit_logs WHERE invoice_id = ? ORDER BY id DESC', [id]);
      logs = rows || [];
    } catch {
      const store = loadPersistentStore();
      logs = (store.invoice_audit_logs || []).filter(a => String(a.invoice_id) === String(id));
    }
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 3. CUSTOMERS DIRECTORY & BILLING HISTORY
// ──────────────────────────────────────────────

// GET /api/customers - List customers with statistics
router.get('/customers', async (req, res) => {
  try {
    const { search } = req.query;
    let customersList: any[] = [];

    try {
      let query = `
        SELECT c.*,
               COALESCE((SELECT COUNT(*) FROM invoices WHERE customer_id = c.id), 0) as total_invoices,
               COALESCE((SELECT SUM(grand_total) FROM invoices WHERE customer_id = c.id AND invoice_status != 'cancelled'), 0) as total_spent,
               COALESCE((SELECT SUM(amount_paid) FROM invoices WHERE customer_id = c.id AND invoice_status != 'cancelled'), 0) as total_paid,
               COALESCE((SELECT SUM(balance_amount) FROM invoices WHERE customer_id = c.id AND invoice_status != 'cancelled'), 0) as total_outstanding,
               COALESCE((SELECT SUM(discount_total) FROM invoices WHERE customer_id = c.id AND invoice_status != 'cancelled'), 0) as total_discount
        FROM customers c
        WHERE 1=1
      `;
      const params: any[] = [];
      if (search) {
        const s = `%${search}%`;
        query += ` AND (c.name LIKE ? OR c.company_name LIKE ? OR c.mobile LIKE ? OR c.email LIKE ? OR c.gstin LIKE ?)`;
        params.push(s, s, s, s, s);
      }
      query += ` ORDER BY c.id DESC`;
      const [rows]: any = await pool.query(query, params);
      customersList = rows || [];
    } catch {
      const store = loadPersistentStore();
      let list = [...(store.customers || [])];
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(c =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.company_name || '').toLowerCase().includes(q) ||
          (c.mobile || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q)
        );
      }

      customersList = list.map(c => {
        const invs = (store.invoices || []).filter(i => i.customer_id === c.id && i.invoice_status !== 'cancelled');
        const totalSpent = invs.reduce((sum, i) => sum + (Number(i.grand_total) || 0), 0);
        const totalPaid = invs.reduce((sum, i) => sum + (Number(i.amount_paid) || 0), 0);
        const totalOutstanding = invs.reduce((sum, i) => sum + (Number(i.balance_amount) || 0), 0);
        const totalDiscount = invs.reduce((sum, i) => sum + (Number(i.discount_total) || 0), 0);
        return {
          ...c,
          total_invoices: invs.length,
          total_spent: totalSpent,
          total_paid: totalPaid,
          total_outstanding: totalOutstanding,
          total_discount: totalDiscount
        };
      });
    }

    res.json({ success: true, data: customersList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/customers/:id - Customer profile and full invoice history
router.get('/customers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let customer: any = null;
    let invoices: any[] = [];

    try {
      const [cRows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
      if (cRows && cRows.length > 0) {
        customer = cRows[0];
        const [invRows]: any = await pool.query('SELECT * FROM invoices WHERE customer_id = ? ORDER BY id DESC', [id]);
        invoices = invRows || [];
      }
    } catch {
      const store = loadPersistentStore();
      customer = (store.customers || []).find(c => String(c.id) === String(id));
      if (customer) {
        invoices = (store.invoices || []).filter(i => String(i.customer_id) === String(id));
      }
    }

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const activeInvs = invoices.filter(i => i.invoice_status !== 'cancelled');
    const stats = {
      total_invoices: invoices.length,
      total_purchased: activeInvs.reduce((acc, i) => acc + Number(i.grand_total || 0), 0),
      total_paid: activeInvs.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0),
      total_outstanding: activeInvs.reduce((acc, i) => acc + Number(i.balance_amount || 0), 0),
      total_discount: activeInvs.reduce((acc, i) => acc + Number(i.discount_total || 0), 0)
    };

    res.json({
      success: true,
      data: {
        customer,
        stats,
        invoices
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/customers - Create new customer
router.post('/customers', async (req, res) => {
  try {
    const {
      name,
      company_name = '',
      mobile,
      email = '',
      billing_address = '',
      shipping_address = '',
      city = '',
      state = 'Maharashtra',
      pincode = '',
      gstin = '',
      pan = '',
      customer_type = 'B2B'
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: 'Customer name and mobile number are required.' });
    }

    let insertId = 0;
    try {
      const [resCust]: any = await pool.query(
        `INSERT INTO customers (name, company_name, mobile, email, billing_address, shipping_address, city, state, pincode, gstin, pan, customer_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, company_name, mobile, email, billing_address, shipping_address || billing_address, city, state, pincode, gstin, pan, customer_type]
      );
      insertId = resCust.insertId;
    } catch {
      const store = loadPersistentStore();
      insertId = (store.customers?.length || 0) + 1;
      store.customers.push({
        id: insertId,
        name,
        company_name,
        mobile,
        email,
        billing_address,
        shipping_address: shipping_address || billing_address,
        city,
        state,
        pincode,
        gstin,
        pan,
        customer_type,
        created_at: new Date().toISOString()
      });
      savePersistentStore(store);
    }

    res.json({ success: true, message: 'Customer created successfully', data: { id: insertId, name, mobile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/customers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      company_name,
      mobile,
      email,
      billing_address,
      shipping_address,
      city,
      state,
      pincode,
      gstin,
      pan,
      customer_type
    } = req.body;

    try {
      await pool.query(
        `UPDATE customers SET
          name = COALESCE(?, name),
          company_name = COALESCE(?, company_name),
          mobile = COALESCE(?, mobile),
          email = COALESCE(?, email),
          billing_address = COALESCE(?, billing_address),
          shipping_address = COALESCE(?, shipping_address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          gstin = COALESCE(?, gstin),
          pan = COALESCE(?, pan),
          customer_type = COALESCE(?, customer_type)
         WHERE id = ?`,
        [name, company_name, mobile, email, billing_address, shipping_address, city, state, pincode, gstin, pan, customer_type, id]
      );
    } catch {
      const store = loadPersistentStore();
      const c = (store.customers || []).find(item => String(item.id) === String(id));
      if (c) {
        if (name) c.name = name;
        if (company_name !== undefined) c.company_name = company_name;
        if (mobile) c.mobile = mobile;
        if (email !== undefined) c.email = email;
        if (billing_address !== undefined) c.billing_address = billing_address;
        if (shipping_address !== undefined) c.shipping_address = shipping_address;
        if (city !== undefined) c.city = city;
        if (state !== undefined) c.state = state;
        if (pincode !== undefined) c.pincode = pincode;
        if (gstin !== undefined) c.gstin = gstin;
        if (pan !== undefined) c.pan = pan;
        if (customer_type !== undefined) c.customer_type = customer_type;
        savePersistentStore(store);
      }
    }

    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 4. PRODUCTS & SERVICES CATALOGUE
// ──────────────────────────────────────────────

// GET /api/products - Catalogue listing
router.get('/products', async (req, res) => {
  try {
    const { category, search, active_only } = req.query;
    let products: any[] = [];

    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (active_only === 'true') {
        query += ' AND is_active = TRUE';
      }

      if (search) {
        const s = `%${search}%`;
        query += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
        params.push(s, s, s);
      }

      query += ' ORDER BY category ASC, name ASC';
      const [rows]: any = await pool.query(query, params);
      products = rows || [];
    } catch {
      const store = loadPersistentStore();
      let list = [...(store.products || [])];
      if (category && category !== 'all') {
        list = list.filter(p => p.category?.toLowerCase() === String(category).toLowerCase());
      }
      if (active_only === 'true') {
        list = list.filter(p => p.is_active !== false);
      }
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.code || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        );
      }
      products = list;
    }

    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products - Create new product
router.post('/products', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({ success: false, error: 'Only administrators can manage the global product catalogue.' });
    }

    const {
      name,
      code,
      category,
      description = '',
      market_price,
      default_selling_price,
      tax_percentage = 18,
      hsn_sac = '',
      unit = 'pcs',
      is_active = true
    } = req.body;

    if (!name || !code || !category) {
      return res.status(400).json({ success: false, error: 'Product name, code/SKU, and category are required.' });
    }

    let insertId = 0;
    try {
      const [resProd]: any = await pool.query(
        `INSERT INTO products (name, code, category, description, market_price, default_selling_price, tax_percentage, hsn_sac, unit, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, code, category, description, Number(market_price) || 0, Number(default_selling_price) || 0, Number(tax_percentage) || 18, hsn_sac, unit, is_active ? 1 : 0]
      );
      insertId = resProd.insertId;
    } catch {
      const store = loadPersistentStore();
      insertId = (store.products?.length || 0) + 1;
      store.products.push({
        id: insertId,
        name,
        code,
        category,
        description,
        market_price: Number(market_price) || 0,
        default_selling_price: Number(default_selling_price) || 0,
        tax_percentage: Number(tax_percentage) || 18,
        hsn_sac,
        unit,
        is_active: is_active ?? true,
        created_at: new Date().toISOString()
      });
      savePersistentStore(store);
    }

    res.json({ success: true, message: 'Product added to catalogue successfully', data: { id: insertId, name, code } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({ success: false, error: 'Permission denied.' });
    }

    const {
      name,
      code,
      category,
      description,
      market_price,
      default_selling_price,
      tax_percentage,
      hsn_sac,
      unit,
      is_active
    } = req.body;

    try {
      await pool.query(
        `UPDATE products SET
          name = COALESCE(?, name),
          code = COALESCE(?, code),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          market_price = COALESCE(?, market_price),
          default_selling_price = COALESCE(?, default_selling_price),
          tax_percentage = COALESCE(?, tax_percentage),
          hsn_sac = COALESCE(?, hsn_sac),
          unit = COALESCE(?, unit),
          is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [
          name, code, category, description,
          market_price !== undefined ? Number(market_price) : null,
          default_selling_price !== undefined ? Number(default_selling_price) : null,
          tax_percentage !== undefined ? Number(tax_percentage) : null,
          hsn_sac, unit,
          is_active !== undefined ? (is_active ? 1 : 0) : null,
          id
        ]
      );
    } catch {
      const store = loadPersistentStore();
      const p = (store.products || []).find(item => String(item.id) === String(id));
      if (p) {
        if (name) p.name = name;
        if (code) p.code = code;
        if (category) p.category = category;
        if (description !== undefined) p.description = description;
        if (market_price !== undefined) p.market_price = Number(market_price);
        if (default_selling_price !== undefined) p.default_selling_price = Number(default_selling_price);
        if (tax_percentage !== undefined) p.tax_percentage = Number(tax_percentage);
        if (hsn_sac !== undefined) p.hsn_sac = hsn_sac;
        if (unit !== undefined) p.unit = unit;
        if (is_active !== undefined) p.is_active = Boolean(is_active);
        savePersistentStore(store);
      }
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id - Toggle active/inactive
router.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({ success: false, error: 'Permission denied.' });
    }

    try {
      await pool.query('UPDATE products SET is_active = NOT is_active WHERE id = ?', [id]);
    } catch {
      const store = loadPersistentStore();
      const p = (store.products || []).find(item => String(item.id) === String(id));
      if (p) {
        p.is_active = !p.is_active;
        savePersistentStore(store);
      }
    }

    res.json({ success: true, message: 'Product status toggled successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 5. BILLING SETTINGS & INVOICE NUMBERING CONFIG
// ──────────────────────────────────────────────

// GET /api/billing/settings
router.get('/billing/settings', async (_req, res) => {
  try {
    let settings: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoice_settings LIMIT 1');
      if (rows && rows.length > 0) settings = rows[0];
    } catch {
      const store = loadPersistentStore();
      settings = store.invoice_settings?.[0] || null;
    }

    if (!settings) {
      const store = loadPersistentStore();
      settings = store.invoice_settings?.[0] || null;
    }

    const rzpConfig = await getRazorpayConfig();

    // Mask secret keys so they are never leaked in clear text
    const maskedSecret = rzpConfig.keySecret ? `${rzpConfig.keySecret.slice(0, 4)}••••••••${rzpConfig.keySecret.slice(-4)}` : '';
    const maskedWebhook = rzpConfig.webhookSecret ? `${rzpConfig.webhookSecret.slice(0, 4)}••••••••${rzpConfig.webhookSecret.slice(-4)}` : '';

    const sanitized = {
      ...settings,
      razorpay_enabled: rzpConfig.enabled,
      razorpay_key_id: rzpConfig.keyId,
      razorpay_key_secret_masked: maskedSecret,
      razorpay_webhook_secret_masked: maskedWebhook,
      has_razorpay_key_secret: Boolean(rzpConfig.keySecret),
      has_razorpay_webhook_secret: Boolean(rzpConfig.webhookSecret),
      razorpay_primary_payment: rzpConfig.primaryPayment
    };

    res.json({ success: true, data: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/billing/settings - Update settings (Admin only)
router.put('/billing/settings', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({ success: false, error: 'Sales users are not permitted to modify invoice settings.' });
    }

    const {
      company_name,
      company_address,
      company_city,
      company_state,
      company_state_code,
      company_pincode,
      company_phone,
      company_email,
      company_website,
      company_gstin,
      company_pan,
      invoice_prefix,
      financial_year,
      starting_number,
      next_number,
      number_padding,
      terms_conditions,
      bank_name,
      bank_account_holder,
      bank_account_number,
      bank_ifsc,
      bank_branch,
      upi_id,
      upi_display_name,
      show_upi_qr,
      show_bank_details,
      payment_instructions,
      seal_url,
      signature_url,
      authorized_signatory_name,
      authorized_signatory_title,
      razorpay_enabled,
      razorpay_key_id,
      razorpay_key_secret,
      razorpay_webhook_secret,
      razorpay_primary_payment
    } = req.body;

    try {
      await pool.query(
        `UPDATE invoice_settings SET
          company_name = COALESCE(?, company_name),
          company_address = COALESCE(?, company_address),
          company_city = COALESCE(?, company_city),
          company_state = COALESCE(?, company_state),
          company_state_code = COALESCE(?, company_state_code),
          company_pincode = COALESCE(?, company_pincode),
          company_phone = COALESCE(?, company_phone),
          company_email = COALESCE(?, company_email),
          company_website = COALESCE(?, company_website),
          company_gstin = COALESCE(?, company_gstin),
          company_pan = COALESCE(?, company_pan),
          invoice_prefix = COALESCE(?, invoice_prefix),
          financial_year = COALESCE(?, financial_year),
          starting_number = COALESCE(?, starting_number),
          next_number = COALESCE(?, next_number),
          number_padding = COALESCE(?, number_padding),
          terms_conditions = COALESCE(?, terms_conditions),
          bank_name = COALESCE(?, bank_name),
          bank_account_holder = COALESCE(?, bank_account_holder),
          bank_account_number = COALESCE(?, bank_account_number),
          bank_ifsc = COALESCE(?, bank_ifsc),
          bank_branch = COALESCE(?, bank_branch),
          upi_id = COALESCE(?, upi_id),
          upi_display_name = COALESCE(?, upi_display_name),
          show_upi_qr = COALESCE(?, show_upi_qr),
          show_bank_details = COALESCE(?, show_bank_details),
          payment_instructions = COALESCE(?, payment_instructions),
          seal_url = COALESCE(?, seal_url),
          signature_url = COALESCE(?, signature_url),
          authorized_signatory_name = COALESCE(?, authorized_signatory_name),
          authorized_signatory_title = COALESCE(?, authorized_signatory_title),
          razorpay_enabled = COALESCE(?, razorpay_enabled),
          razorpay_key_id = COALESCE(?, razorpay_key_id),
          razorpay_key_secret = COALESCE(?, razorpay_key_secret),
          razorpay_webhook_secret = COALESCE(?, razorpay_webhook_secret),
          razorpay_primary_payment = COALESCE(?, razorpay_primary_payment)
         WHERE id = 1`,
        [
          company_name, company_address, company_city, company_state, company_state_code, company_pincode,
          company_phone, company_email, company_website, company_gstin, company_pan,
          invoice_prefix, financial_year, starting_number, next_number, number_padding,
          terms_conditions, bank_name, bank_account_holder, bank_account_number, bank_ifsc, bank_branch,
          upi_id, upi_display_name, show_upi_qr, show_bank_details, payment_instructions,
          seal_url, signature_url, authorized_signatory_name, authorized_signatory_title,
          razorpay_enabled !== undefined ? Boolean(razorpay_enabled) : null,
          razorpay_key_id || null,
          razorpay_key_secret && !razorpay_key_secret.includes('••••') ? razorpay_key_secret : null,
          razorpay_webhook_secret && !razorpay_webhook_secret.includes('••••') ? razorpay_webhook_secret : null,
          razorpay_primary_payment !== undefined ? Boolean(razorpay_primary_payment) : null
        ]
      );
    } catch {
      const store = loadPersistentStore();
      const current = store.invoice_settings?.[0] || {};
      store.invoice_settings = [{
        ...current,
        ...(company_name !== undefined && { company_name }),
        ...(company_address !== undefined && { company_address }),
        ...(company_city !== undefined && { company_city }),
        ...(company_state !== undefined && { company_state }),
        ...(company_state_code !== undefined && { company_state_code }),
        ...(company_pincode !== undefined && { company_pincode }),
        ...(company_phone !== undefined && { company_phone }),
        ...(company_email !== undefined && { company_email }),
        ...(company_website !== undefined && { company_website }),
        ...(company_gstin !== undefined && { company_gstin }),
        ...(company_pan !== undefined && { company_pan }),
        ...(invoice_prefix !== undefined && { invoice_prefix }),
        ...(financial_year !== undefined && { financial_year }),
        ...(starting_number !== undefined && { starting_number }),
        ...(next_number !== undefined && { next_number }),
        ...(number_padding !== undefined && { number_padding }),
        ...(terms_conditions !== undefined && { terms_conditions }),
        ...(bank_name !== undefined && { bank_name }),
        ...(bank_account_holder !== undefined && { bank_account_holder }),
        ...(bank_account_number !== undefined && { bank_account_number }),
        ...(bank_ifsc !== undefined && { bank_ifsc }),
        ...(bank_branch !== undefined && { bank_branch }),
        ...(upi_id !== undefined && { upi_id }),
        ...(upi_display_name !== undefined && { upi_display_name }),
        ...(show_upi_qr !== undefined && { show_upi_qr }),
        ...(show_bank_details !== undefined && { show_bank_details }),
        ...(payment_instructions !== undefined && { payment_instructions }),
        ...(seal_url !== undefined && { seal_url }),
        ...(signature_url !== undefined && { signature_url }),
        ...(authorized_signatory_name !== undefined && { authorized_signatory_name }),
        ...(authorized_signatory_title !== undefined && { authorized_signatory_title }),
        ...(razorpay_enabled !== undefined && { razorpay_enabled: Boolean(razorpay_enabled) }),
        ...(razorpay_key_id !== undefined && { razorpay_key_id }),
        ...(razorpay_key_secret && !razorpay_key_secret.includes('••••') && { razorpay_key_secret }),
        ...(razorpay_webhook_secret && !razorpay_webhook_secret.includes('••••') && { razorpay_webhook_secret }),
        ...(razorpay_primary_payment !== undefined && { razorpay_primary_payment: Boolean(razorpay_primary_payment) })
      }];
      savePersistentStore(store);
    }

    res.json({ success: true, message: 'Invoice settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/billing/upload-asset - Upload company seal or authorized signature image
router.post('/billing/upload-asset', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (authUser?.role === 'Sales Executive') {
      return res.status(403).json({ success: false, error: 'Sales users cannot modify corporate branding assets.' });
    }

    const { type, data } = req.body;
    if (!type || !['seal', 'signature'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Asset type must be "seal" or "signature".' });
    }
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ success: false, error: 'Image data is required.' });
    }

    // Extract base64 payload
    let base64Payload = data;
    const commaIndex = data.indexOf(',');
    if (commaIndex !== -1) {
      base64Payload = data.substring(commaIndex + 1);
    }
    const buffer = Buffer.from(base64Payload, 'base64');

    // Save to public/images/<type>.png and server/uploads/<type>.png across client & server roots
    const fileName = `${type}.png`;
    const targetDirs = [
      path.resolve(process.cwd(), 'public/images'),
      path.resolve(process.cwd(), '../public/images'),
      path.resolve(process.cwd(), 'server/uploads'),
      path.resolve(process.cwd(), 'uploads'),
      path.resolve(__dirname, '../../public/images'),
      path.resolve(__dirname, '../uploads')
    ];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, fileName), buffer);
      } catch {}
    }

    const assetUrl = `/images/${fileName}`;

    // Also update current invoice_settings
    try {
      const colName = type === 'seal' ? 'seal_url' : 'signature_url';
      await pool.query(`UPDATE invoice_settings SET ${colName} = ? WHERE id = 1`, [assetUrl]);
    } catch {}

    const store = loadPersistentStore();
    const current = store.invoice_settings?.[0] || {};
    if (type === 'seal') current.seal_url = assetUrl;
    if (type === 'signature') current.signature_url = assetUrl;
    store.invoice_settings = [current];
    savePersistentStore(store);

    res.json({
      success: true,
      url: assetUrl,
      message: `${type === 'seal' ? 'Company Seal' : 'Authorized Signature'} asset uploaded and configured successfully.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 6. FINANCIAL REPORTS (SALES, DISCOUNTS, OUTSTANDING, PRODUCTS)
// ──────────────────────────────────────────────

// GET /api/billing/reports/sales
router.get('/billing/reports/sales', async (_req, res) => {
  try {
    let invoices: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices ORDER BY invoice_date DESC');
      invoices = rows || [];
    } catch {
      const store = loadPersistentStore();
      invoices = store.invoices || [];
    }

    const activeInvs = invoices.filter(i => i.invoice_status !== 'cancelled');

    const totalInvoices = activeInvs.length;
    const totalMarketValue = activeInvs.reduce((acc, i) => acc + Number(i.market_total || 0), 0);
    const totalSellingValue = activeInvs.reduce((acc, i) => acc + Number(i.taxable_amount || 0), 0);
    const totalDiscounts = activeInvs.reduce((acc, i) => acc + Number(i.discount_total || 0), 0);
    const totalTax = activeInvs.reduce((acc, i) => acc + Number(i.tax_total || 0), 0);
    const totalRevenue = activeInvs.reduce((acc, i) => acc + Number(i.grand_total || 0), 0);
    const totalPaid = activeInvs.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0);
    const totalOutstanding = activeInvs.reduce((acc, i) => acc + Number(i.balance_amount || 0), 0);
    const cancelledCount = invoices.filter(i => i.invoice_status === 'cancelled').length;

    // Grouping by salesperson
    const bySalesperson: Record<string, any> = {};
    activeInvs.forEach(i => {
      const sp = i.sales_person_name || 'Unassigned';
      if (!bySalesperson[sp]) {
        bySalesperson[sp] = { salesperson: sp, invoicesCount: 0, revenue: 0, discounts: 0, paid: 0, outstanding: 0 };
      }
      bySalesperson[sp].invoicesCount += 1;
      bySalesperson[sp].revenue += Number(i.grand_total || 0);
      bySalesperson[sp].discounts += Number(i.discount_total || 0);
      bySalesperson[sp].paid += Number(i.amount_paid || 0);
      bySalesperson[sp].outstanding += Number(i.balance_amount || 0);
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalInvoices,
          totalMarketValue,
          totalSellingValue,
          totalDiscounts,
          totalTax,
          totalRevenue,
          totalPaid,
          totalOutstanding,
          cancelledCount
        },
        bySalesperson: Object.values(bySalesperson)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/billing/reports/discounts
router.get('/billing/reports/discounts', async (_req, res) => {
  try {
    let invoices: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE discount_total > 0 AND invoice_status != "cancelled" ORDER BY discount_total DESC');
      invoices = rows || [];
    } catch {
      const store = loadPersistentStore();
      invoices = (store.invoices || []).filter(i => Number(i.discount_total) > 0 && i.invoice_status !== 'cancelled');
    }

    const discountReport = invoices.map(i => {
      const marketVal = Number(i.market_total) || 0;
      const discount = Number(i.discount_total) || 0;
      const sellingVal = Math.max(0, marketVal - discount);
      const discountPct = marketVal > 0 ? ((discount / marketVal) * 100).toFixed(1) : '0.0';

      return {
        id: i.id,
        invoice_number: i.invoice_number,
        invoice_date: i.invoice_date,
        customer_name: i.customer_name,
        customer_company: i.customer_company,
        sales_person_name: i.sales_person_name,
        market_value: marketVal,
        selling_value: sellingVal,
        discount_amount: discount,
        discount_percentage: Number(discountPct)
      };
    });

    res.json({ success: true, data: discountReport });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/billing/reports/outstanding
router.get('/billing/reports/outstanding', async (_req, res) => {
  try {
    let invoices: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM invoices WHERE balance_amount > 0 AND invoice_status != "cancelled" ORDER BY balance_amount DESC');
      invoices = rows || [];
    } catch {
      const store = loadPersistentStore();
      invoices = (store.invoices || []).filter(i => Number(i.balance_amount) > 0 && i.invoice_status !== 'cancelled');
    }

    const today = new Date();
    const outstandingReport = invoices.map(i => {
      const invDate = new Date(i.invoice_date);
      const diffTime = Math.abs(today.getTime() - invDate.getTime());
      const ageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let dueStatus = 'Current';
      if (ageDays > 60) dueStatus = 'Over 60 Days';
      else if (ageDays > 30) dueStatus = 'Over 30 Days';
      else if (ageDays > 15) dueStatus = 'Over 15 Days';

      return {
        id: i.id,
        invoice_number: i.invoice_number,
        invoice_date: i.invoice_date,
        due_date: i.due_date,
        customer_name: i.customer_name,
        customer_company: i.customer_company,
        customer_mobile: i.customer_mobile,
        sales_person_name: i.sales_person_name,
        grand_total: Number(i.grand_total),
        amount_paid: Number(i.amount_paid),
        balance_amount: Number(i.balance_amount),
        age_days: ageDays,
        due_status: dueStatus
      };
    });

    res.json({ success: true, data: outstandingReport });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/billing/reports/products
router.get('/billing/reports/products', async (_req, res) => {
  try {
    let items: any[] = [];
    try {
      const [rows]: any = await pool.query(`
        SELECT ii.*, i.invoice_status
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.invoice_status != 'cancelled'
      `);
      items = rows || [];
    } catch {
      const store = loadPersistentStore();
      const validInvoiceIds = new Set(
        (store.invoices || []).filter(i => i.invoice_status !== 'cancelled').map(i => i.id)
      );
      items = (store.invoice_items || []).filter(item => validInvoiceIds.has(item.invoice_id));
    }

    const prodMap: Record<string, any> = {};
    items.forEach(it => {
      const key = it.item_name || 'Custom Item';
      if (!prodMap[key]) {
        prodMap[key] = {
          name: key,
          item_type: it.item_type || 'custom',
          quantity_sold: 0,
          total_market_value: 0,
          total_selling_value: 0,
          total_discount: 0,
          total_revenue: 0
        };
      }
      const qty = Number(it.quantity) || 1;
      prodMap[key].quantity_sold += qty;
      prodMap[key].total_market_value += Number(it.market_price || 0) * qty;
      prodMap[key].total_selling_value += Number(it.selling_price || 0) * qty;
      prodMap[key].total_discount += Number(it.discount_amount || 0);
      prodMap[key].total_revenue += Number(it.line_total || 0);
    });

    const report = Object.values(prodMap).sort((a, b) => b.total_revenue - a.total_revenue);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 7. PROJECT FINANCIAL MANAGEMENT & TRACKING
// ──────────────────────────────────────────────

// GET /api/projects/financial-overview - List all projects with consolidated financial intelligence
router.get('/projects/financial-overview', async (_req, res) => {
  try {
    const store = loadPersistentStore();
    let projects: any[] = [];

    try {
      const [pRows]: any = await pool.query('SELECT * FROM projects ORDER BY id ASC');
      if (pRows && pRows.length > 0) projects = pRows;
      else projects = store.projects || [];
    } catch {
      projects = store.projects || [];
    }

    let allInvoices: any[] = [];
    let allPayments: any[] = [];
    let allExpenses: any[] = [];

    try {
      const [invRows]: any = await pool.query("SELECT * FROM invoices WHERE invoice_status != 'cancelled'");
      allInvoices = invRows || [];
      const [payRows]: any = await pool.query("SELECT * FROM payments WHERE status != 'reversed' OR status IS NULL");
      allPayments = payRows || [];
      const [expRows]: any = await pool.query('SELECT * FROM project_expenses ORDER BY expense_date DESC');
      allExpenses = expRows || [];
    } catch {
      allInvoices = (store.invoices || []).filter(i => i.invoice_status !== 'cancelled');
      allPayments = (store.payments || []).filter(p => p.status !== 'reversed');
      allExpenses = store.project_expenses || [];
    }

    const overview = projects.map(proj => {
      const pInvoices = allInvoices.filter(i => String(i.project_id) === String(proj.id) || i.project_name === proj.title);
      const invoiceIds = new Set(pInvoices.map(i => i.id));

      const pPayments = allPayments.filter(p => String(p.project_id) === String(proj.id) || invoiceIds.has(p.invoice_id));
      const pExpenses = allExpenses.filter(e => String(e.project_id) === String(proj.id));

      const projectValue = Number(proj.project_value) || 0;
      const invoiced = pInvoices.reduce((sum, i) => sum + (Number(i.grand_total) || 0), 0);
      const paid = pPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const pending = Math.max(0, invoiced - paid);
      const expenses = pExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const grossProfit = invoiced - expenses;
      const collectedProfit = paid - expenses;

      let financialStatus = 'Not Invoiced';
      if (invoiced > 0) {
        if (pending === 0) financialStatus = 'Fully Collected';
        else if (paid > 0) financialStatus = 'Partially Collected';
        else financialStatus = 'Payment Pending';
      }

      return {
        id: proj.id,
        project_code: proj.project_code || `PROJ-${proj.id}`,
        title: proj.title,
        client: proj.client,
        category: proj.category,
        status: proj.status || 'active',
        project_value: projectValue,
        invoiced_amount: invoiced,
        paid_amount: paid,
        pending_amount: pending,
        expenses_amount: expenses,
        gross_profit: grossProfit,
        collected_profit: collectedProfit,
        financial_status: financialStatus,
        invoice_count: pInvoices.length,
        payment_count: pPayments.length,
        expense_count: pExpenses.length
      };
    });

    res.json({ success: true, data: overview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/projects/:id/financials - Deep dive into a single project's financials
router.get('/projects/:id/financials', async (req, res) => {
  try {
    const id = req.params.id;
    const store = loadPersistentStore();

    let project: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM projects WHERE id = ? OR project_code = ?', [id, id]);
      if (rows && rows.length > 0) project = rows[0];
      else project = (store.projects || []).find(p => String(p.id) === String(id) || p.project_code === id);
    } catch {
      project = (store.projects || []).find(p => String(p.id) === String(id) || p.project_code === id);
    }

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    let invoices: any[] = [];
    let payments: any[] = [];
    let expenses: any[] = [];

    try {
      const [invRows]: any = await pool.query(
        "SELECT * FROM invoices WHERE (project_id = ? OR project_name = ?) AND invoice_status != 'cancelled' ORDER BY id DESC",
        [project.id, project.title]
      );
      invoices = invRows || [];

      const invoiceIds = invoices.map(i => i.id);
      if (invoiceIds.length > 0) {
        const [payRows]: any = await pool.query(
          "SELECT * FROM payments WHERE (project_id = ? OR invoice_id IN (?)) AND (status != 'reversed' OR status IS NULL) ORDER BY payment_date DESC",
          [project.id, invoiceIds]
        );
        payments = payRows || [];
      } else {
        const [payRows]: any = await pool.query(
          "SELECT * FROM payments WHERE project_id = ? AND (status != 'reversed' OR status IS NULL) ORDER BY payment_date DESC",
          [project.id]
        );
        payments = payRows || [];
      }

      const [expRows]: any = await pool.query(
        "SELECT * FROM project_expenses WHERE project_id = ? ORDER BY expense_date DESC",
        [project.id]
      );
      expenses = expRows || [];
    } catch {
      invoices = (store.invoices || []).filter(
        i => (String(i.project_id) === String(project.id) || i.project_name === project.title) && i.invoice_status !== 'cancelled'
      );
      const invIds = new Set(invoices.map(i => i.id));
      payments = (store.payments || []).filter(
        p => (String(p.project_id) === String(project.id) || invIds.has(p.invoice_id)) && p.status !== 'reversed'
      );
      expenses = (store.project_expenses || []).filter(e => String(e.project_id) === String(project.id));
    }

    const projectValue = Number(project.project_value) || 0;
    const invoiced = invoices.reduce((sum, i) => sum + (Number(i.grand_total) || 0), 0);
    const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pending = Math.max(0, invoiced - paid);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const grossProfit = invoiced - totalExpenses;
    const collectedProfit = paid - totalExpenses;

    res.json({
      success: true,
      data: {
        project,
        summary: {
          project_value: projectValue,
          invoiced_amount: invoiced,
          paid_amount: paid,
          pending_amount: pending,
          expenses_amount: totalExpenses,
          gross_profit: grossProfit,
          collected_profit: collectedProfit,
          has_expenses: expenses.length > 0
        },
        invoices,
        payments,
        expenses
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/projects/:id/expenses - Record project expense
router.post('/projects/:id/expenses', async (req, res) => {
  try {
    const id = req.params.id;
    const authUser = getAuthUser(req);
    const {
      title,
      category = 'Direct Cost',
      amount,
      expense_date,
      vendor = '',
      receipt_ref = '',
      notes = ''
    } = req.body;

    const numAmount = Number(amount);
    if (!title || !numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Expense title and a valid positive amount are required.' });
    }

    const expDate = expense_date || new Date().toISOString().split('T')[0];
    const createdBy = authUser?.name || authUser?.email || 'Staff';
    const nowIso = new Date().toISOString();

    let createdId = 0;
    try {
      const [resExp]: any = await pool.query(
        `INSERT INTO project_expenses (project_id, title, category, amount, expense_date, vendor, receipt_ref, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, title, category, numAmount, expDate, vendor, receipt_ref, notes, createdBy]
      );
      createdId = resExp.insertId;
    } catch {
      const store = loadPersistentStore();
      if (!Array.isArray(store.project_expenses)) store.project_expenses = [];
      createdId = (store.project_expenses.length || 0) + 1;
      store.project_expenses.unshift({
        id: createdId,
        project_id: Number(id),
        title,
        category,
        amount: numAmount,
        expense_date: expDate,
        vendor,
        receipt_ref,
        notes,
        created_by: createdBy,
        created_at: nowIso
      });
      savePersistentStore(store);
    }

    res.json({
      success: true,
      message: 'Project expense recorded successfully',
      data: {
        id: createdId,
        project_id: Number(id),
        title,
        amount: numAmount,
        expense_date: expDate
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 8. CONSOLIDATED FINANCIAL DASHBOARD & REPORTS
// ──────────────────────────────────────────────

// GET /api/billing/reports/financial-dashboard - Comprehensive date-filtered analytics
router.get('/billing/reports/financial-dashboard', async (req, res) => {
  try {
    const { period = 'this_month', startDate: customStart, endDate: customEnd } = req.query;

    const store = loadPersistentStore();
    let invoices: any[] = [];
    let payments: any[] = [];
    let expenses: any[] = [];
    let projects: any[] = [];

    try {
      const [iRows]: any = await pool.query('SELECT * FROM invoices ORDER BY invoice_date DESC');
      invoices = iRows || [];
      const [pRows]: any = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
      payments = pRows || [];
      const [eRows]: any = await pool.query('SELECT * FROM project_expenses ORDER BY expense_date DESC');
      expenses = eRows || [];
      const [prRows]: any = await pool.query('SELECT * FROM projects ORDER BY id ASC');
      projects = prRows || [];
    } catch {
      invoices = store.invoices || [];
      payments = store.payments || [];
      expenses = store.project_expenses || [];
      projects = store.projects || [];
    }

    // Determine Date Filter Range
    const now = new Date();
    let startBoundary = new Date(now.getFullYear(), now.getMonth(), 1); // default this month
    let endBoundary = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (period === 'today') {
      startBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (period === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      startBoundary = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
      endBoundary = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
    } else if (period === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startBoundary = new Date(now.setDate(diff));
      startBoundary.setHours(0, 0, 0, 0);
      endBoundary = new Date();
      endBoundary.setHours(23, 59, 59, 999);
    } else if (period === 'last_week') {
      const day = now.getDay();
      const diff = now.getDate() - day - 6;
      startBoundary = new Date(now.setDate(diff));
      startBoundary.setHours(0, 0, 0, 0);
      endBoundary = new Date(startBoundary);
      endBoundary.setDate(endBoundary.getDate() + 6);
      endBoundary.setHours(23, 59, 59, 999);
    } else if (period === 'last_month') {
      startBoundary = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endBoundary = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startBoundary = new Date(now.getFullYear(), qMonth, 1);
      endBoundary = new Date();
      endBoundary.setHours(23, 59, 59, 999);
    } else if (period === 'this_year') {
      startBoundary = new Date(now.getFullYear(), 0, 1);
      endBoundary = new Date();
      endBoundary.setHours(23, 59, 59, 999);
    } else if (period === 'custom' && customStart && customEnd) {
      startBoundary = new Date(String(customStart));
      startBoundary.setHours(0, 0, 0, 0);
      endBoundary = new Date(String(customEnd));
      endBoundary.setHours(23, 59, 59, 999);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter Active datasets
    const nonCancelledInvoices = invoices.filter(i => i.invoice_status !== 'cancelled');
    const validPayments = payments.filter(p => p.status !== 'reversed');

    // 1. Today's figures
    const todayInvoices = nonCancelledInvoices.filter(i => i.invoice_date === todayStr);
    const todayPayments = validPayments.filter(p => (p.payment_date || '').startsWith(todayStr));

    const todayRevenue = todayInvoices.reduce((acc, i) => acc + (Number(i.grand_total) || 0), 0);
    const todayCollections = todayPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    // 2. Filtered Period Figures
    const periodInvoices = nonCancelledInvoices.filter(i => {
      const d = new Date(i.invoice_date);
      return d >= startBoundary && d <= endBoundary;
    });

    const periodPayments = validPayments.filter(p => {
      const d = new Date(p.payment_date);
      return d >= startBoundary && d <= endBoundary;
    });

    const periodExpenses = expenses.filter(e => {
      const d = new Date(e.expense_date);
      return d >= startBoundary && d <= endBoundary;
    });

    const periodRevenue = periodInvoices.reduce((acc, i) => acc + (Number(i.grand_total) || 0), 0);
    const periodCollections = periodPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const periodExpensesTotal = periodExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const periodGrossProfit = periodRevenue - periodExpensesTotal;

    // 3. Global Outstanding & Overdue
    const pendingReceivables = nonCancelledInvoices.reduce((acc, i) => acc + (Number(i.balance_amount) || 0), 0);
    const overdueInvoices = nonCancelledInvoices.filter(i => {
      if (!i.due_date || Number(i.balance_amount) <= 0) return false;
      return new Date(i.due_date) < new Date(todayStr);
    });
    const overdueAmount = overdueInvoices.reduce((acc, i) => acc + (Number(i.balance_amount) || 0), 0);

    // 4. Day-Wise Revenue & Collections Table
    const dayWiseMap: Record<string, { date: string; invoiced: number; collected: number; pending: number }> = {};
    // Seed the period days or recent 14 days
    const daysCount = Math.min(31, Math.max(7, Math.ceil((endBoundary.getTime() - startBoundary.getTime()) / (1000 * 3600 * 24))));
    for (let d = 0; d < daysCount; d++) {
      const dateObj = new Date(startBoundary);
      dateObj.setDate(startBoundary.getDate() + d);
      if (dateObj > new Date()) break;
      const dKey = dateObj.toISOString().split('T')[0];
      dayWiseMap[dKey] = { date: dKey, invoiced: 0, collected: 0, pending: 0 };
    }

    periodInvoices.forEach(i => {
      const dKey = (i.invoice_date || '').split('T')[0];
      if (dayWiseMap[dKey]) {
        dayWiseMap[dKey].invoiced += Number(i.grand_total) || 0;
      }
    });

    periodPayments.forEach(p => {
      const dKey = (p.payment_date || '').split('T')[0];
      if (dayWiseMap[dKey]) {
        dayWiseMap[dKey].collected += Number(p.amount) || 0;
      }
    });

    Object.values(dayWiseMap).forEach(row => {
      row.pending = Math.max(0, row.invoiced - row.collected);
    });

    const dayWiseSeries = Object.values(dayWiseMap).sort((a, b) => b.date.localeCompare(a.date));

    // 5. Month-Wise Breakdown (Last 12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthWiseMap: Record<string, { month: string; invoiced: number; collected: number; pending: number; yearMonth: string }> = {};

    for (let m = 11; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthWiseMap[ym] = { month: label, invoiced: 0, collected: 0, pending: 0, yearMonth: ym };
    }

    nonCancelledInvoices.forEach(i => {
      const ym = (i.invoice_date || '').slice(0, 7);
      if (monthWiseMap[ym]) {
        monthWiseMap[ym].invoiced += Number(i.grand_total) || 0;
      }
    });

    validPayments.forEach(p => {
      const ym = (p.payment_date || '').slice(0, 7);
      if (monthWiseMap[ym]) {
        monthWiseMap[ym].collected += Number(p.amount) || 0;
      }
    });

    Object.values(monthWiseMap).forEach(m => {
      m.pending = Math.max(0, m.invoiced - m.collected);
    });

    const monthWiseSeries = Object.values(monthWiseMap);

    // 6. Project-wise financial summary table
    const projectFinancials = projects.map(proj => {
      const pInvs = nonCancelledInvoices.filter(i => String(i.project_id) === String(proj.id) || i.project_name === proj.title);
      const invIds = new Set(pInvs.map(i => i.id));
      const pPays = validPayments.filter(p => String(p.project_id) === String(proj.id) || invIds.has(p.invoice_id));
      const pExps = expenses.filter(e => String(e.project_id) === String(proj.id));

      const invVal = pInvs.reduce((acc, i) => acc + (Number(i.grand_total) || 0), 0);
      const paidVal = pPays.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const pendVal = Math.max(0, invVal - paidVal);
      const expVal = pExps.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      return {
        project_id: proj.id,
        project_code: proj.project_code || `PROJ-${proj.id}`,
        project_name: proj.title,
        client: proj.client,
        project_value: Number(proj.project_value) || 0,
        invoiced_amount: invVal,
        paid_amount: paidVal,
        pending_amount: pendVal,
        expenses: expVal,
        gross_profit: invVal - expVal
      };
    });

    // 7. Payment Methods Breakdown
    const methodMap: Record<string, { method: string; count: number; total_amount: number }> = {};
    validPayments.forEach(p => {
      const m = p.payment_method || 'Other';
      if (!methodMap[m]) methodMap[m] = { method: m, count: 0, total_amount: 0 };
      methodMap[m].count += 1;
      methodMap[m].total_amount += Number(p.amount) || 0;
    });

    // 8. Invoice Status Breakdown
    const statusMap: Record<string, { status: string; count: number; total_amount: number }> = {};
    invoices.forEach(i => {
      const st = i.invoice_status || 'draft';
      if (!statusMap[st]) statusMap[st] = { status: st, count: 0, total_amount: 0 };
      statusMap[st].count += 1;
      statusMap[st].total_amount += Number(i.grand_total) || 0;
    });

    res.json({
      success: true,
      data: {
        filter: {
          period,
          start_date: startBoundary.toISOString().split('T')[0],
          end_date: endBoundary.toISOString().split('T')[0]
        },
        metrics: {
          today_revenue: todayRevenue,
          today_collections: todayCollections,
          today_invoices_count: todayInvoices.length,
          today_payments_count: todayPayments.length,
          period_revenue: periodRevenue,
          period_collections: periodCollections,
          period_expenses: periodExpensesTotal,
          period_gross_profit: periodGrossProfit,
          pending_receivables: pendingReceivables,
          overdue_invoices_count: overdueInvoices.length,
          overdue_amount: overdueAmount,
          active_projects_count: projects.filter(p => p.status !== 'completed').length,
          total_projects_count: projects.length
        },
        day_wise: dayWiseSeries,
        month_wise: monthWiseSeries,
        project_wise: projectFinancials,
        payment_methods: Object.values(methodMap),
        invoice_statuses: Object.values(statusMap)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
