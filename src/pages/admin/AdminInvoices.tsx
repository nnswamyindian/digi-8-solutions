import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout, { AdminRole } from './AdminLayout';
import { 
  Receipt, Plus, Search, Filter, RefreshCw, Calendar, 
  DollarSign, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, Ban, FileText, ArrowUpRight, ArrowDownRight, 
  Building2, User, Eye, Edit3, Printer, Download, Mail, CreditCard, 
  History, Settings, ShoppingCart, Percent, Layers, 
  ChevronRight, Users, Sparkles, ExternalLink
} from 'lucide-react';
import { 
  Invoice, 
  Customer, 
  getInvoices, 
  getCustomers, 
  getSalesReport, 
  getDiscountReport, 
  getOutstandingReport, 
  getProductSalesReport,
  updateInvoice,
  downloadInvoicePdf,
  SalesReportSummary,
  SalespersonReport,
  DiscountReportItem,
  OutstandingReportItem,
  ProductReportItem
} from '../../lib/billingApi';

// Modals
import InvoiceCreationModal from '../../components/admin/billing/InvoiceCreationModal';
import InvoiceDetailsModal from '../../components/admin/billing/InvoiceDetailsModal';
import RecordPaymentModal from '../../components/admin/billing/RecordPaymentModal';
import CancelInvoiceModal from '../../components/admin/billing/CancelInvoiceModal';
import InvoiceAuditTrailModal from '../../components/admin/billing/InvoiceAuditTrailModal';
import ProductsCatalogueModal from '../../components/admin/billing/ProductsCatalogueModal';
import BillingSettingsModal from '../../components/admin/billing/BillingSettingsModal';
import SendInvoiceEmailModal from '../../components/admin/billing/SendInvoiceEmailModal';

export default function AdminInvoices() {
  const location = useLocation();
  const navigate = useNavigate();

  // Current user info & role
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('Super Admin');

  // Active Main Tab: 'invoices' | 'customers' | 'reports'
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers' | 'reports'>('invoices');

  // Secondary Filter Tabs for Invoices
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Reports data states
  const [reportSubTab, setReportSubTab] = useState<'sales' | 'discounts' | 'outstanding' | 'products'>('sales');
  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);
  const [salespersonReports, setSalespersonReports] = useState<SalespersonReport[]>([]);
  const [discountReports, setDiscountReports] = useState<DiscountReportItem[]>([]);
  const [outstandingReports, setOutstandingReports] = useState<OutstandingReportItem[]>([]);
  const [productReports, setProductReports] = useState<ProductReportItem[]>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<Invoice | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState<Invoice | null>(null);
  const [selectedInvoiceForCancel, setSelectedInvoiceForCancel] = useState<Invoice | null>(null);
  const [selectedInvoiceForAudit, setSelectedInvoiceForAudit] = useState<Invoice | null>(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Selected lead passed via routing state (e.g. from AdminLeads)
  const passedLead = (location.state as any)?.leadToConvert;

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('admin_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        if (u.role) setUserRole(u.role);
      }
    } catch {}

    loadAllData();

    if (passedLead) {
      setShowCreateModal(true);
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [invRes, custRes, salesRes, discRes, outRes, prodRes] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getSalesReport(),
        getDiscountReport(),
        getOutstandingReport(),
        getProductSalesReport()
      ]);

      if (invRes.success && invRes.data) setInvoices(invRes.data);
      if (custRes.success && custRes.data) setCustomers(custRes.data);
      if (salesRes.success && salesRes.data) {
        setSalesSummary(salesRes.data.summary);
        setSalespersonReports(salesRes.data.bySalesperson);
      }
      if (discRes.success && discRes.data) setDiscountReports(discRes.data);
      if (outRes.success && outRes.data) setOutstandingReports(outRes.data);
      if (prodRes.success && prodRes.data) setProductReports(prodRes.data);
    } catch (err) {
      console.error('Error loading billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const activeInvs = invoices.filter(i => i.invoice_status !== 'cancelled');
    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthStr = todayStr.slice(0, 7);

    const todayInvs = activeInvs.filter(i => (i.invoice_date || '').startsWith(todayStr));
    const thisMonthInvs = activeInvs.filter(i => (i.invoice_date || '').startsWith(thisMonthStr));

    const totalRev = activeInvs.reduce((acc, i) => acc + Number(i.grand_total || 0), 0);
    const thisMonthSales = thisMonthInvs.reduce((acc, i) => acc + Number(i.grand_total || 0), 0);
    const totalDiscounts = activeInvs.reduce((acc, i) => acc + Number(i.discount_total || 0), 0);
    const totalPaid = activeInvs.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0);
    const totalPending = activeInvs.reduce((acc, i) => acc + Number(i.balance_amount || 0), 0);
    const cancelledCount = invoices.filter(i => i.invoice_status === 'cancelled').length;

    // Sales Executive Personal Metrics
    const isSalesExec = userRole === 'Sales Executive';
    const myInvoices = isSalesExec
      ? invoices.filter(i => i.sales_user_id === currentUser?.id || i.sales_person_name === currentUser?.name || i.created_by === currentUser?.email)
      : invoices;
    const myActive = myInvoices.filter(i => i.invoice_status !== 'cancelled');
    const myTotalSales = myActive.reduce((acc, i) => acc + Number(i.grand_total || 0), 0);
    const myPaid = myActive.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0);
    const myPending = myActive.reduce((acc, i) => acc + Number(i.balance_amount || 0), 0);
    const myDiscounts = myActive.reduce((acc, i) => acc + Number(i.discount_total || 0), 0);

    return {
      totalCount: invoices.length,
      todayCount: todayInvs.length,
      thisMonthSales,
      totalRev,
      totalDiscounts,
      totalPaid,
      totalPending,
      cancelledCount,
      // Personal for sales
      isSalesExec,
      myInvoicesCount: myInvoices.length,
      myTotalSales,
      myPaid,
      myPending,
      myDiscounts
    };
  }, [invoices, userRole, currentUser]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Role filter
      if (userRole === 'Sales Executive') {
        const isOwner = inv.sales_user_id === currentUser?.id || 
                        inv.sales_person_name === currentUser?.name || 
                        inv.created_by === currentUser?.email;
        if (!isOwner) return false;
      }

      // Status pill filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'draft') {
          if (inv.invoice_status !== 'draft') return false;
        } else if (statusFilter === 'cancelled') {
          if (inv.invoice_status !== 'cancelled') return false;
        } else if (statusFilter === 'paid') {
          if (inv.payment_status !== 'paid' || inv.invoice_status === 'cancelled') return false;
        } else if (statusFilter === 'partially_paid') {
          if (inv.payment_status !== 'partially_paid' || inv.invoice_status === 'cancelled') return false;
        } else if (statusFilter === 'unpaid') {
          if (inv.payment_status !== 'unpaid' || inv.invoice_status === 'cancelled') return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          (inv.invoice_number || '').toLowerCase().includes(q) ||
          (inv.customer_name || '').toLowerCase().includes(q) ||
          (inv.customer_company || '').toLowerCase().includes(q) ||
          (inv.customer_mobile || '').toLowerCase().includes(q) ||
          (inv.customer_email || '').toLowerCase().includes(q) ||
          (inv.sales_person_name || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Date range
      if (startDate && new Date(inv.invoice_date) < new Date(startDate)) return false;
      if (endDate && new Date(inv.invoice_date) > new Date(endDate)) return false;

      return true;
    });
  }, [invoices, statusFilter, searchQuery, startDate, endDate, userRole, currentUser]);

  const getStatusBadge = (inv: Invoice) => {
    if (inv.invoice_status === 'cancelled') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
          <Ban size={11} /> Cancelled
        </span>
      );
    }
    if (inv.invoice_status === 'draft') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20 inline-flex items-center gap-1">
          <Clock size={11} /> Draft
        </span>
      );
    }
    if (inv.payment_status === 'paid') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
          <CheckCircle2 size={11} /> Paid
        </span>
      );
    }
    if (inv.payment_status === 'partially_paid') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
          <Clock size={11} /> Partial
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
        <AlertTriangle size={11} /> Unpaid
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-brand-cyan border border-brand-cyan/20 font-mono">
                {userRole === 'Sales Executive' ? 'Sales Billing Center' : 'Finance & Billing Hub'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">GST Registered Engine</span>
            </div>
            <h1 className="text-2xl font-outfit font-black text-white mt-1 flex items-center gap-2.5">
              <Receipt size={24} className="text-brand-cyan" />
              Invoice & Billing Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Issue commercial invoices for software, hardware, services, custom items, track payments & generate PDF invoices.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => loadAllData()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setShowProductsModal(true)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ShoppingCart size={15} />
              <span>Products Catalogue</span>
            </button>

            {userRole !== 'Sales Executive' && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Settings size={15} />
                <span>Invoice Settings</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(0,229,255,0.35)]"
            >
              <Plus size={16} />
              <span>Create Commercial Invoice</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {metrics.isSalesExec ? 'My Invoices' : 'Total Invoices'}
            </div>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              {metrics.isSalesExec ? metrics.myInvoicesCount : metrics.totalCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Generated all time</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Today's Invoices</div>
            <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">
              {metrics.todayCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Issued today</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">This Month Sales</div>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              ₹{(metrics.thisMonthSales / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Current billing cycle</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 hover:border-brand-cyan/40 transition-all">
            <div className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider">
              {metrics.isSalesExec ? 'My Total Sales' : 'Total Revenue'}
            </div>
            <div className="text-xl font-extrabold text-brand-cyan font-mono mt-1">
              ₹{((metrics.isSalesExec ? metrics.myTotalSales : metrics.totalRev) / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-brand-cyan/70 mt-1">Gross billed amount</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Total Discounts</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">
              ₹{((metrics.isSalesExec ? metrics.myDiscounts : metrics.totalDiscounts) / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Price concessions</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/30 transition-all">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Paid Amount</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
              ₹{((metrics.isSalesExec ? metrics.myPaid : metrics.totalPaid) / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-emerald-500/70 mt-1">Realized revenue</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/30 transition-all">
            <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Pending Balance</div>
            <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">
              ₹{((metrics.isSalesExec ? metrics.myPending : metrics.totalPending) / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-rose-400/70 mt-1">Outstanding dues</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cancelled</div>
            <div className="text-xl font-extrabold text-slate-400 font-mono mt-1">
              {metrics.cancelledCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Voided invoices</div>
          </div>

        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Receipt size={15} />
            <span>{userRole === 'Sales Executive' ? 'My Invoices' : 'All Invoices'} ({filteredInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'customers'
                ? 'bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={15} />
            <span>Customers & Ledger ({customers.length})</span>
          </button>

          {userRole !== 'Sales Executive' && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={15} />
              <span>Financial Reports & Telemetry</span>
            </button>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 1: INVOICES MASTER LIST */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            
            {/* Search and Secondary Filter Controls */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by invoice number, customer, mobile, company, salesperson..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              {/* Status Pill Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Invoices' },
                  { id: 'paid', label: 'Paid in Full' },
                  { id: 'partially_paid', label: 'Partially Paid' },
                  { id: 'unpaid', label: 'Unpaid / Pending' },
                  { id: 'draft', label: 'Drafts' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === tab.id
                        ? 'bg-brand-cyan text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  title="From Date"
                />
                <span className="text-slate-500">—</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  title="To Date"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-[11px] text-slate-400 hover:text-white underline ml-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Invoices Table */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#070b13]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                      <th className="p-3.5 font-bold">Invoice No</th>
                      <th className="p-3.5 font-bold">Customer & Company</th>
                      <th className="p-3.5 font-bold">Salesperson</th>
                      <th className="p-3.5 font-bold">Date</th>
                      <th className="p-3.5 text-right font-bold">Grand Total</th>
                      <th className="p-3.5 text-right font-bold">Paid</th>
                      <th className="p-3.5 text-right font-bold">Balance</th>
                      <th className="p-3.5 text-center font-bold">Status</th>
                      <th className="p-3.5 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-10 text-center text-slate-500">
                          No invoices matching the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                          
                          {/* Invoice Number */}
                          <td className="p-3.5">
                            <button
                              onClick={() => setSelectedInvoiceForDetails(inv)}
                              className="font-mono font-bold text-xs text-white hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                            >
                              <span>{inv.invoice_number}</span>
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-brand-cyan transition-opacity" />
                            </button>
                            {inv.lead_id && (
                              <div className="text-[10px] text-brand-cyan/80 font-mono mt-0.5">
                                Lead #{inv.lead_id}
                              </div>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="p-3.5">
                            <div className="font-semibold text-white">{inv.customer_name}</div>
                            {inv.customer_company && (
                              <div className="text-[11px] text-slate-400 line-clamp-1">{inv.customer_company}</div>
                            )}
                            <div className="text-[10px] text-slate-500 font-mono">{inv.customer_mobile}</div>
                          </td>

                          {/* Salesperson */}
                          <td className="p-3.5">
                            <div className="text-slate-300 font-medium">{inv.sales_person_name || 'Staff'}</div>
                          </td>

                          {/* Date */}
                          <td className="p-3.5">
                            <div className="text-slate-300 font-mono">
                              {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            {inv.due_date && (
                              <div className="text-[10px] text-slate-500">
                                Due: {new Date(inv.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </div>
                            )}
                          </td>

                          {/* Grand Total */}
                          <td className="p-3.5 text-right font-mono font-bold text-white">
                            ₹{Number(inv.grand_total).toLocaleString('en-IN')}
                            {Number(inv.discount_total) > 0 && (
                              <div className="text-[10px] text-amber-400/80">
                                -₹{Number(inv.discount_total).toLocaleString('en-IN')} disc
                              </div>
                            )}
                          </td>

                          {/* Amount Paid */}
                          <td className="p-3.5 text-right font-mono font-semibold text-emerald-400">
                            ₹{Number(inv.amount_paid).toLocaleString('en-IN')}
                          </td>

                          {/* Balance */}
                          <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                            ₹{Number(inv.balance_amount).toLocaleString('en-IN')}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5 text-center">
                            {getStatusBadge(inv)}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedInvoiceForDetails(inv)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-cyan/20 text-slate-300 hover:text-brand-cyan transition-colors"
                                title="View & Print Invoice"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                onClick={() => downloadInvoicePdf(inv.id, inv.invoice_number)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-brand-cyan transition-colors"
                                title="Download Official PDF"
                              >
                                <Download size={14} />
                              </button>

                              <button
                                onClick={() => setSelectedInvoiceForEmail(inv)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 transition-colors"
                                title="Send Invoice Email with PDF"
                              >
                                <Mail size={14} />
                              </button>

                              {inv.invoice_status === 'draft' && (
                                <button
                                  onClick={() => {
                                    setSelectedInvoiceForEdit(inv);
                                    setShowCreateModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                                  title="Edit Draft Invoice"
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}

                              {inv.invoice_status !== 'cancelled' && Number(inv.balance_amount) > 0 && (
                                <button
                                  onClick={() => setSelectedInvoiceForPayment(inv)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                  title="Record Payment"
                                >
                                  <DollarSign size={14} />
                                </button>
                              )}

                              {inv.invoice_status !== 'cancelled' && (
                                <button
                                  onClick={() => setSelectedInvoiceForCancel(inv)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                  title="Cancel Invoice"
                                >
                                  <Ban size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedInvoiceForAudit(inv)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Audit Trail"
                              >
                                <History size={14} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CUSTOMERS & LEDGER */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#070b13]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                      <th className="p-3.5">Customer Name & Company</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">GSTIN / State</th>
                      <th className="p-3.5 text-center">Invoices</th>
                      <th className="p-3.5 text-right">Total Purchased</th>
                      <th className="p-3.5 text-right">Total Paid</th>
                      <th className="p-3.5 text-right">Outstanding Dues</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-xs">{c.name}</div>
                          {c.company_name && (
                            <div className="text-[11px] text-slate-400">{c.company_name}</div>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono mt-0.5 inline-block">
                            {c.customer_type || 'B2B'}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-300">
                          <div>{c.mobile}</div>
                          {c.email && <div className="text-[11px] text-slate-400">{c.email}</div>}
                        </td>

                        <td className="p-3.5 text-slate-300">
                          <div className="font-mono text-xs">{c.gstin || 'Unregistered'}</div>
                          <div className="text-[11px] text-slate-400">{c.city || 'Mumbai'}, {c.state || 'MH'}</div>
                        </td>

                        <td className="p-3.5 text-center font-mono font-bold text-white">
                          {c.total_invoices || 0}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-white">
                          ₹{Number(c.total_spent || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="p-3.5 text-right font-mono font-semibold text-emerald-400">
                          ₹{Number(c.total_paid || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="p-3.5 text-right font-mono font-extrabold text-rose-400">
                          ₹{Number(c.total_outstanding || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSearchQuery(c.name);
                              setActiveTab('invoices');
                            }}
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-brand-cyan/10 hover:text-brand-cyan text-slate-300 text-xs font-semibold transition-colors"
                          >
                            View Invoices
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 3: FINANCIAL REPORTS & AUDIT TELEMETRY */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Report Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-xs">
              <button
                onClick={() => setReportSubTab('sales')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportSubTab === 'sales'
                    ? 'bg-brand-cyan text-black'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Comprehensive Sales Report
              </button>
              <button
                onClick={() => setReportSubTab('discounts')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportSubTab === 'discounts'
                    ? 'bg-brand-cyan text-black'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Discount Audit & Margin Report
              </button>
              <button
                onClick={() => setReportSubTab('outstanding')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportSubTab === 'outstanding'
                    ? 'bg-brand-cyan text-black'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Outstanding Dues & Aging Analysis
              </button>
              <button
                onClick={() => setReportSubTab('products')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportSubTab === 'products'
                    ? 'bg-brand-cyan text-black'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Product Sales Breakdown
              </button>
            </div>

            {/* Sales Sub-tab */}
            {reportSubTab === 'sales' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Invoices Generated</span>
                    <div className="text-2xl font-black text-white font-mono">{salesSummary?.totalInvoices || 0}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-cyan">Total Gross Revenue</span>
                    <div className="text-2xl font-black text-brand-cyan font-mono">
                      ₹{Number(salesSummary?.totalRevenue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Total Amount Collected</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ₹{Number(salesSummary?.totalPaid || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Salesperson performance breakdown */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#070b13]">
                  <div className="p-4 border-b border-white/10 font-bold text-sm text-white">
                    Salesperson Performance Breakdown
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="p-3">Salesperson</th>
                        <th className="p-3 text-center">Invoices</th>
                        <th className="p-3 text-right">Gross Revenue</th>
                        <th className="p-3 text-right">Discounts Given</th>
                        <th className="p-3 text-right">Collected (Paid)</th>
                        <th className="p-3 text-right">Pending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {salespersonReports.map((sp, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-semibold text-white">{sp.salesperson}</td>
                          <td className="p-3 text-center font-mono">{sp.invoicesCount}</td>
                          <td className="p-3 text-right font-mono font-bold text-brand-cyan">
                            ₹{Number(sp.revenue).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right font-mono text-amber-400">
                            ₹{Number(sp.discounts).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-400">
                            ₹{Number(sp.paid).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-400">
                            ₹{Number(sp.outstanding).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discount Sub-tab */}
            {reportSubTab === 'discounts' && (
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#070b13]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Salesperson</th>
                      <th className="p-3 text-right">Market Value</th>
                      <th className="p-3 text-right">Selling Value</th>
                      <th className="p-3 text-right">Discount Given</th>
                      <th className="p-3 text-center">Discount %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {discountReports.map(d => (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-mono font-bold text-brand-cyan">{d.invoice_number}</td>
                        <td className="p-3 font-semibold text-white">{d.customer_name}</td>
                        <td className="p-3 text-slate-300">{d.sales_person_name}</td>
                        <td className="p-3 text-right font-mono text-slate-400">₹{d.market_value.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono text-white">₹{d.selling_value.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-400">₹{d.discount_amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            d.discount_percentage > 25 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {d.discount_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Outstanding Sub-tab */}
            {reportSubTab === 'outstanding' && (
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#070b13]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Customer & Phone</th>
                      <th className="p-3">Invoice Date</th>
                      <th className="p-3 text-right">Invoice Total</th>
                      <th className="p-3 text-right">Amount Paid</th>
                      <th className="p-3 text-right">Outstanding Balance</th>
                      <th className="p-3 text-center">Aging / Due Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {outstandingReports.map(o => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-mono font-bold text-brand-cyan">{o.invoice_number}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{o.customer_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{o.customer_mobile}</div>
                        </td>
                        <td className="p-3 text-slate-300 font-mono">{new Date(o.invoice_date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 text-right font-mono text-white">₹{o.grand_total.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">₹{o.amount_paid.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-rose-400">₹{o.balance_amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.age_days > 30 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {o.due_status} ({o.age_days}d)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Product Sales Sub-tab */}
            {reportSubTab === 'products' && (
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#070b13]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3">Product / Service</th>
                      <th className="p-3 text-center">Category</th>
                      <th className="p-3 text-center">Units Sold</th>
                      <th className="p-3 text-right">Total Market Value</th>
                      <th className="p-3 text-right">Total Discount Given</th>
                      <th className="p-3 text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {productReports.map((p, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-semibold text-white">{p.name}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px]">
                            {p.item_type}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">{p.quantity_sold}</td>
                        <td className="p-3 text-right font-mono text-slate-400">₹{p.total_market_value.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono text-amber-400">₹{p.total_discount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-brand-cyan">₹{p.total_revenue.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── MODALS ── */}

      {/* Invoice Creation Modal */}
      {showCreateModal && (
        <InvoiceCreationModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedInvoiceForEdit(null);
          }}
          initialLead={passedLead}
          editingInvoice={selectedInvoiceForEdit}
          onSuccess={() => {
            loadAllData();
            setSelectedInvoiceForEdit(null);
          }}
        />
      )}

      {/* Invoice Details & Print Modal */}
      {selectedInvoiceForDetails && (
        <InvoiceDetailsModal
          invoice={selectedInvoiceForDetails}
          isOpen={!!selectedInvoiceForDetails}
          onClose={() => setSelectedInvoiceForDetails(null)}
          onEditDraft={(inv) => {
            setSelectedInvoiceForDetails(null);
            setSelectedInvoiceForEdit(inv);
            setShowCreateModal(true);
          }}
          onIssueDraft={async (inv) => {
            try {
              const res = await updateInvoice(inv.id, { invoice_status: 'issued', is_draft: false });
              if (res.success) {
                await loadAllData();
                setSelectedInvoiceForDetails(null);
              } else {
                alert(res.error || 'Failed to issue invoice');
              }
            } catch (err: any) {
              alert(err.message || 'Error issuing invoice');
            }
          }}
          onRecordPayment={(inv) => {
            setSelectedInvoiceForDetails(null);
            setSelectedInvoiceForPayment(inv);
          }}
          onCancelInvoice={(inv) => {
            setSelectedInvoiceForDetails(null);
            setSelectedInvoiceForCancel(inv);
          }}
          onViewAudit={(inv) => {
            setSelectedInvoiceForDetails(null);
            setSelectedInvoiceForAudit(inv);
          }}
        />
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          invoice={selectedInvoiceForPayment}
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onSuccess={() => loadAllData()}
        />
      )}

      {/* Cancel Invoice Modal */}
      {selectedInvoiceForCancel && (
        <CancelInvoiceModal
          invoice={selectedInvoiceForCancel}
          isOpen={!!selectedInvoiceForCancel}
          onClose={() => setSelectedInvoiceForCancel(null)}
          onSuccess={() => loadAllData()}
        />
      )}

      {/* Audit Trail Modal */}
      {selectedInvoiceForAudit && (
        <InvoiceAuditTrailModal
          invoice={selectedInvoiceForAudit}
          logs={selectedInvoiceForAudit.audit_logs || []}
          isOpen={!!selectedInvoiceForAudit}
          onClose={() => setSelectedInvoiceForAudit(null)}
        />
      )}

      {/* Products Catalogue Modal */}
      {showProductsModal && (
        <ProductsCatalogueModal
          isOpen={showProductsModal}
          onClose={() => setShowProductsModal(false)}
          onProductChanged={() => loadAllData()}
        />
      )}

      {/* Billing Settings Modal */}
      {showSettingsModal && (
        <BillingSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSettingsSaved={() => loadAllData()}
        />
      )}

      {/* Send Invoice Email Modal */}
      {selectedInvoiceForEmail && (
        <SendInvoiceEmailModal
          invoice={selectedInvoiceForEmail}
          isOpen={!!selectedInvoiceForEmail}
          onClose={() => setSelectedInvoiceForEmail(null)}
          onSuccess={() => loadAllData()}
        />
      )}

    </AdminLayout>
  );
}
