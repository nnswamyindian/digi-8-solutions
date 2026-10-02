import { buildApiUrl } from './api';

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  product_id?: number | null;
  item_type: 'software' | 'hardware' | 'services' | 'custom';
  item_name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit?: string;
  market_price: number;
  selling_price: number;
  discount_type?: 'fixed' | 'percentage';
  discount_value?: number;
  discount_amount?: number;
  tax_percentage?: number;
  tax_amount?: number;
  line_total?: number;
}

export interface PaymentRecord {
  id?: number;
  invoice_id: number;
  project_id?: number | null;
  payment_number?: string;
  amount: number;
  payment_method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Razorpay' | 'Cheque' | 'Other';
  transaction_reference?: string;
  payment_date: string;
  status?: 'completed' | 'reversed';
  reversed_at?: string | null;
  reversed_by?: string | null;
  reversal_reason?: string | null;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface InvoiceAuditLog {
  id: number;
  invoice_id: number;
  invoice_number?: string;
  action: string;
  old_value?: string;
  new_value?: string;
  performed_by: string;
  ip_address?: string;
  created_at: string;
}

export interface PaymentDetailsSnapshot {
  bank_name?: string;
  bank_account_holder?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  upi_id?: string;
  upi_display_name?: string;
  show_upi_qr?: boolean;
  show_bank_details?: boolean;
  payment_instructions?: string;
  seal_url?: string;
  signature_url?: string;
  authorized_signatory_name?: string;
  authorized_signatory_title?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  financial_year: string;
  lead_id?: string | number | null;
  customer_id: number;
  customer_name: string;
  customer_company?: string;
  customer_mobile: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_pincode?: string;
  customer_gstin?: string;
  project_id?: number | null;
  project_name?: string | null;
  sales_user_id?: number | null;
  sales_person_name: string;
  market_total: number;
  discount_total: number;
  extra_discount_type?: 'fixed' | 'percentage';
  extra_discount_value?: number;
  extra_discount_amount?: number;
  taxable_amount: number;
  tax_calculation_mode?: 'exclusive' | 'inclusive';
  tax_type: 'intra_state' | 'inter_state';
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tax_total: number;
  round_off: number;
  grand_total: number;
  amount_paid: number;
  balance_amount: number;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
  invoice_status: 'draft' | 'issued' | 'generated' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'void';
  payment_details_snapshot?: PaymentDetailsSnapshot | string;
  revision_number?: number;
  issued_at?: string | null;
  cancelled_reason?: string | null;
  cancelled_at?: string | null;
  notes?: string;
  terms_conditions?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  items?: InvoiceItem[];
  payments?: PaymentRecord[];
  audit_logs?: InvoiceAuditLog[];
  item_count?: number;
  payment_count?: number;
}

export interface Customer {
  id: number;
  name: string;
  company_name?: string;
  mobile: string;
  email?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  customer_type?: string;
  created_at?: string;
  total_invoices?: number;
  total_spent?: number;
  total_paid?: number;
  total_outstanding?: number;
  total_discount?: number;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  market_price: number;
  default_selling_price: number;
  tax_percentage: number;
  hsn_sac?: string;
  unit: string;
  is_active: boolean;
  created_at?: string;
}

export interface BillingSettings {
  id?: number;
  company_name: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_state_code?: string;
  company_pincode: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_gstin: string;
  company_pan?: string;
  invoice_prefix: string;
  financial_year: string;
  starting_number: number;
  next_number: number;
  number_padding: number;
  terms_conditions: string;
  bank_name?: string;
  bank_account_holder?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  upi_id?: string;
  upi_display_name?: string;
  show_upi_qr?: boolean;
  show_bank_details?: boolean;
  payment_instructions?: string;
  seal_url?: string;
  signature_url?: string;
  authorized_signatory_name?: string;
  authorized_signatory_title?: string;
}

export interface ProjectFinancialSummary {
  id: number;
  project_code: string;
  title: string;
  client?: string;
  category?: string;
  status: string;
  project_value: number;
  invoiced_amount: number;
  paid_amount: number;
  pending_amount: number;
  expenses_amount: number;
  gross_profit: number;
  collected_profit: number;
  financial_status: string;
  invoice_count: number;
  payment_count: number;
  expense_count: number;
}

export interface ProjectExpense {
  id: number;
  project_id: number;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  vendor?: string;
  receipt_ref?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface ProjectFinancialDetail {
  project: any;
  summary: {
    project_value: number;
    invoiced_amount: number;
    paid_amount: number;
    pending_amount: number;
    expenses_amount: number;
    gross_profit: number;
    collected_profit: number;
    has_expenses: boolean;
  };
  invoices: Invoice[];
  payments: PaymentRecord[];
  expenses: ProjectExpense[];
}

export interface FinancialDashboardData {
  filter: {
    period: string;
    start_date: string;
    end_date: string;
  };
  metrics: {
    today_revenue: number;
    today_collections: number;
    today_invoices_count: number;
    today_payments_count: number;
    period_revenue: number;
    period_collections: number;
    period_expenses: number;
    period_gross_profit: number;
    pending_receivables: number;
    overdue_invoices_count: number;
    overdue_amount: number;
    active_projects_count: number;
    total_projects_count: number;
  };
  day_wise: Array<{ date: string; invoiced: number; collected: number; pending: number }>;
  month_wise: Array<{ month: string; invoiced: number; collected: number; pending: number; yearMonth: string }>;
  project_wise: Array<{
    project_id: number;
    project_code: string;
    project_name: string;
    client: string;
    project_value: number;
    invoiced_amount: number;
    paid_amount: number;
    pending_amount: number;
    expenses: number;
    gross_profit: number;
  }>;
  payment_methods: Array<{ method: string; count: number; total_amount: number }>;
  invoice_statuses: Array<{ status: string; count: number; total_amount: number }>;
}

export interface SalesReportSummary {
  totalInvoices: number;
  totalMarketValue: number;
  totalSellingValue: number;
  totalDiscounts: number;
  totalTax: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  cancelledCount: number;
}

export interface SalespersonReport {
  salesperson: string;
  invoicesCount: number;
  revenue: number;
  discounts: number;
  paid: number;
  outstanding: number;
}

export interface DiscountReportItem {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_company: string;
  sales_person_name: string;
  market_value: number;
  selling_value: number;
  discount_amount: number;
  discount_percentage: number;
}

export interface OutstandingReportItem {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_company: string;
  customer_mobile: string;
  sales_person_name: string;
  grand_total: number;
  amount_paid: number;
  balance_amount: number;
  age_days: number;
  due_status: string;
}

export interface ProductReportItem {
  name: string;
  item_type: string;
  quantity_sold: number;
  total_market_value: number;
  total_selling_value: number;
  total_discount: number;
  total_revenue: number;
}

// ──────────────────────────────────────────────
// CLIENT-SIDE REAL-TIME CALCULATION ENGINE
// ──────────────────────────────────────────────
export function calculateLocalFinancials(
  items: InvoiceItem[],
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
      itemTaxable = taxPct > 0 ? itemSellingTotal / (1 + taxPct / 100) : itemSellingTotal;
      itemTax = itemSellingTotal - itemTaxable;
      lineTotal = itemSellingTotal;
    } else {
      itemTaxable = itemSellingTotal;
      itemTax = itemTaxable * (taxPct / 100);
      lineTotal = itemTaxable + itemTax;
    }

    market_total += marketPrice * qty;
    items_discount_total += discountAmount;
    subtotal_selling += itemSellingTotal;
    total_item_tax += itemTax;

    return {
      ...item,
      quantity: qty,
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

  let extra_discount_amount = 0;
  if (extraDiscountVal > 0) {
    if (extraDiscountType === 'percentage') {
      extra_discount_amount = subtotal_selling * (extraDiscountVal / 100);
    } else {
      extra_discount_amount = Math.min(subtotal_selling, extraDiscountVal);
    }
  }

  const netSellingValue = Math.max(0, subtotal_selling - extra_discount_amount);
  const discount_total = items_discount_total + extra_discount_amount;

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
// AUTH HEADERS HELPER
// ──────────────────────────────────────────────
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ──────────────────────────────────────────────
// API CLIENT CALLS
// ──────────────────────────────────────────────

// Invoices
export async function getInvoices(filters?: {
  search?: string;
  status?: string;
  payment_status?: string;
  sales_user_id?: string | number;
  customer_id?: string | number;
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; data: Invoice[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.sales_user_id) params.append('sales_user_id', String(filters.sales_user_id));
    if (filters?.customer_id) params.append('customer_id', String(filters.customer_id));
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(buildApiUrl(`/api/invoices${qs}`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function getInvoiceById(id: string | number): Promise<{ success: boolean; data?: Invoice; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${id}`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createInvoice(payload: any): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/invoices'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateInvoice(id: string | number, payload: any): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelInvoice(id: string | number, reason: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${id}/cancel`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Payments
export async function recordInvoicePayment(
  invoiceId: string | number,
  payload: {
    amount: number;
    payment_method: string;
    transaction_reference?: string;
    payment_date?: string;
    notes?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${invoiceId}/payments`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getInvoicePayments(invoiceId: string | number): Promise<{ success: boolean; data: PaymentRecord[]; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${invoiceId}/payments`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// Customers
export async function getCustomers(search?: string): Promise<{ success: boolean; data: Customer[]; error?: string }> {
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(buildApiUrl(`/api/customers${qs}`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function getCustomerById(id: string | number): Promise<{ success: boolean; data?: { customer: Customer; stats: any; invoices: Invoice[] }; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/customers/${id}`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createCustomer(payload: Partial<Customer>): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/customers'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCustomer(id: string | number, payload: Partial<Customer>): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/customers/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Products
export async function getProducts(category?: string, search?: string): Promise<{ success: boolean; data: Product[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(buildApiUrl(`/api/products${qs}`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function createProduct(payload: Partial<Product>): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/products'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProduct(id: string | number, payload: Partial<Product>): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/products/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProduct(id: string | number): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/products/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Settings
export async function getBillingSettings(): Promise<{ success: boolean; data?: BillingSettings; error?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/settings'), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateBillingSettings(payload: Partial<BillingSettings>): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/settings'), {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function uploadBillingAsset(
  type: 'seal' | 'signature',
  dataUrlOrBase64: string
): Promise<{ success: boolean; url?: string; error?: string; message?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/upload-asset'), {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data: dataUrlOrBase64 })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Reports
export async function getSalesReport(): Promise<{
  success: boolean;
  data?: { summary: SalesReportSummary; bySalesperson: SalespersonReport[] };
  error?: string;
}> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/reports/sales'), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDiscountReport(): Promise<{ success: boolean; data?: DiscountReportItem[]; error?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/reports/discounts'), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getOutstandingReport(): Promise<{ success: boolean; data?: OutstandingReportItem[]; error?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/reports/outstanding'), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProductSalesReport(): Promise<{ success: boolean; data?: ProductReportItem[]; error?: string }> {
  try {
    const res = await fetch(buildApiUrl('/api/billing/reports/products'), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 1-Click Issue Draft Invoice
export async function issueDraftInvoice(id: string | number): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${id}/issue`), {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Reverse Payment
export async function reversePayment(
  invoiceId: string | number,
  paymentId: string | number,
  reason: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${invoiceId}/payments/${paymentId}/reverse`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Verify Online Payment
export async function verifyOnlinePayment(
  invoiceId: string | number,
  payload: { razorpay_payment_id?: string; amount?: number; payment_method?: string }
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${invoiceId}/payment-verify`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// PDF Download
export async function downloadInvoicePdf(invoiceId: string | number, invoiceNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${invoiceId}/pdf`), {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`Failed to generate PDF (${res.status})`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${String(invoiceNumber).replace(/[\/\\]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (err: any) {
    console.error('Error downloading invoice PDF:', err);
    return { success: false, error: err.message };
  }
}

// Email Invoice with PDF Attachment
export async function sendInvoiceEmail(
  invoiceId: string | number,
  payload: { recipient_email: string; subject?: string; message?: string }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/invoices/${invoiceId}/send-email`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Project Financial Intelligence
export async function getProjectsFinancialOverview(): Promise<{
  success: boolean;
  data?: ProjectFinancialSummary[];
  error?: string;
}> {
  try {
    const res = await fetch(buildApiUrl('/api/projects/financial-overview'), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProjectFinancials(id: string | number): Promise<{
  success: boolean;
  data?: ProjectFinancialDetail;
  error?: string;
}> {
  try {
    const res = await fetch(buildApiUrl(`/api/projects/${id}/financials`), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addProjectExpense(
  projectId: string | number,
  payload: { title: string; category?: string; amount: number; expense_date?: string; vendor?: string; receipt_ref?: string; notes?: string }
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch(buildApiUrl(`/api/projects/${projectId}/expenses`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Consolidated Financial Dashboard & Analytics
export async function getFinancialDashboard(
  period: string = 'this_month',
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data?: FinancialDashboardData; error?: string }> {
  try {
    let url = `/api/billing/reports/financial-dashboard?period=${encodeURIComponent(period)}`;
    if (startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const res = await fetch(buildApiUrl(url), {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
