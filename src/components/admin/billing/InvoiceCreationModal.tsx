import { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, ShoppingCart, UserCheck, Search, 
  Building2, Phone, Mail, MapPin, Receipt, CheckCircle, 
  Layers, Package, Shield, Sparkles, AlertCircle, FileText,
  Briefcase, Edit3
} from 'lucide-react';
import { 
  InvoiceItem, 
  Invoice,
  Product, 
  Customer, 
  getProducts, 
  getCustomers, 
  createInvoice, 
  updateInvoice,
  getInvoiceById,
  calculateLocalFinancials, 
  BillingSettings, 
  getBillingSettings,
  getProjectsFinancialOverview,
  ProjectFinancialSummary
} from '../../../lib/billingApi';

interface InvoiceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInvoice: any) => void;
  initialLead?: any;
  editingInvoice?: Invoice | null;
  initialProjectId?: number | string;
}

const GST_RATES = [
  { value: 0, label: '0% (Exempt / Nil)' },
  { value: 5, label: '5% (Concessional)' },
  { value: 10, label: '10%' },
  { value: 12, label: '12% (Standard)' },
  { value: 15, label: '15%' },
  { value: 18, label: '18% (Standard GST)' },
  { value: 20, label: '20%' },
  { value: 28, label: '28% (Luxury / Higher Rate)' }
];

export default function InvoiceCreationModal({
  isOpen,
  onClose,
  onSuccess,
  initialLead,
  editingInvoice,
  initialProjectId
}: InvoiceCreationModalProps) {
  // Source Mode: 'lead' | 'manual' | 'existing_customer'
  const [sourceMode, setSourceMode] = useState<'lead' | 'manual' | 'existing_customer'>(
    editingInvoice ? 'existing_customer' : (initialLead ? 'lead' : 'manual')
  );

  // Leads list for selection
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id ? String(initialLead.id) : '');

  // Existing Customers list
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Projects list
  const [projectsList, setProjectsList] = useState<ProjectFinancialSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');

  // Customer Form Fields
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [customerType, setCustomerType] = useState('B2B');
  const [saveAsNewCustomer, setSaveAsNewCustomer] = useState(true);

  // Invoice Details
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Tax Mode & Type
  const [taxCalculationMode, setTaxCalculationMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [taxType, setTaxType] = useState<'intra_state' | 'inter_state'>('intra_state');
  const [autoTaxType, setAutoTaxType] = useState(true);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [extraDiscountType, setExtraDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [extraDiscountValue, setExtraDiscountValue] = useState<number>(0);

  // Initial Payment Option (only for new invoices)
  const [recordInitialPayment, setRecordInitialPayment] = useState(false);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number>(0);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Razorpay' | 'Cheque' | 'Other'>('UPI');
  const [initialPaymentRef, setInitialPaymentRef] = useState('');

  // Catalogue modal
  const [showCataloguePicker, setShowCataloguePicker] = useState(false);
  const [catalogueProducts, setCatalogueProducts] = useState<Product[]>([]);
  const [catalogueCategory, setCatalogueCategory] = useState<string>('all');
  const [catalogueSearch, setCatalogueSearch] = useState<string>('');

  // Settings
  const [settings, setSettings] = useState<BillingSettings | null>(null);

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // When initialLead changes, populate fields
  useEffect(() => {
    if (initialLead) {
      populateFromLead(initialLead);
    }
  }, [initialLead]);

  // When editingInvoice changes, populate fields for Draft editing
  useEffect(() => {
    if (editingInvoice) {
      populateFromEditingInvoice(editingInvoice);
    } else if (initialProjectId) {
      setSelectedProjectId(String(initialProjectId));
    }
  }, [editingInvoice, initialProjectId]);

  const loadInitialData = async () => {
    try {
      const [prodsRes, custsRes, settingsRes, projRes] = await Promise.all([
        getProducts('all'),
        getCustomers(),
        getBillingSettings(),
        getProjectsFinancialOverview()
      ]);

      if (prodsRes.success && prodsRes.data) {
        setCatalogueProducts(prodsRes.data);
      }
      if (custsRes.success && custsRes.data) {
        setCustomersList(custsRes.data);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      if (projRes.success && projRes.data) {
        setProjectsList(projRes.data);
        if (initialProjectId) {
          const match = projRes.data.find((p: any) => String(p.id) === String(initialProjectId));
          if (match) {
            setSelectedProjectId(String(match.id));
            setSelectedProjectName(match.title);
          }
        }
      }

      // Fetch leads for lead selector
      fetch('/api/leads')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) setLeadsList(d.data);
        })
        .catch(() => {});

      // Add one default item if empty and not editing
      if (!editingInvoice && items.length === 0) {
        addCustomItem();
      }
    } catch (err) {
      console.warn('Error loading initial billing data:', err);
    }
  };

  const populateFromEditingInvoice = async (inv: Invoice) => {
    setCustomerName(inv.customer_name || '');
    setCompanyName(inv.customer_company || '');
    setMobile(inv.customer_mobile || '');
    setEmail(inv.customer_email || '');
    setBillingAddress(inv.customer_address || '');
    setShippingAddress(inv.customer_address || '');
    setCity(inv.customer_city || 'Mumbai');
    setState(inv.customer_state || 'Maharashtra');
    setPincode(inv.customer_pincode || '');
    setGstin(inv.customer_gstin || '');
    setSelectedCustomerId(inv.customer_id ? String(inv.customer_id) : '');

    setInvoiceDate(inv.invoice_date || new Date().toISOString().split('T')[0]);
    if (inv.due_date) setDueDate(inv.due_date.split('T')[0]);
    setNotes(inv.notes || '');

    setSelectedProjectId(inv.project_id ? String(inv.project_id) : '');
    setSelectedProjectName(inv.project_name || '');

    setTaxCalculationMode(inv.tax_calculation_mode || 'exclusive');
    if (inv.tax_type) {
      setTaxType(inv.tax_type);
      setAutoTaxType(false);
    }

    setExtraDiscountType(inv.extra_discount_type || 'fixed');
    setExtraDiscountValue(Number(inv.extra_discount_value) || 0);

    // If items already attached
    if (inv.items && inv.items.length > 0) {
      setItems(inv.items.map(it => ({
        ...it,
        quantity: Number(it.quantity) || 1,
        market_price: Number(it.market_price) || 0,
        selling_price: Number(it.selling_price) || 0,
        tax_percentage: Number(it.tax_percentage) !== undefined ? Number(it.tax_percentage) : 18
      })));
    } else {
      // Fetch full details
      try {
        const full = await getInvoiceById(inv.id);
        if (full.success && full.data?.items && full.data.items.length > 0) {
          setItems(full.data.items.map(it => ({
            ...it,
            quantity: Number(it.quantity) || 1,
            market_price: Number(it.market_price) || 0,
            selling_price: Number(it.selling_price) || 0,
            tax_percentage: Number(it.tax_percentage) !== undefined ? Number(it.tax_percentage) : 18
          })));
        } else {
          addCustomItem();
        }
      } catch {
        addCustomItem();
      }
    }
  };

  const populateFromLead = (lead: any) => {
    setSourceMode('lead');
    setSelectedLeadId(String(lead.id || ''));
    setCustomerName(lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Valued Client');
    setCompanyName(lead.company || lead.company_name || '');
    setMobile(lead.phone || lead.mobile || '');
    setEmail(lead.email || '');
    setBillingAddress(lead.address || '');
    setShippingAddress(lead.address || '');
    setCity(lead.city || 'Mumbai');
    setState(lead.state || 'Maharashtra');
    setPincode(lead.pincode || '');
    setGstin(lead.gstin || '');
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedLeadId(val);
    const found = leadsList.find(l => String(l.id) === val);
    if (found) {
      populateFromLead(found);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    const found = customersList.find(c => String(c.id) === val);
    if (found) {
      setCustomerName(found.name || '');
      setCompanyName(found.company_name || '');
      setMobile(found.mobile || '');
      setEmail(found.email || '');
      setBillingAddress(found.billing_address || '');
      setShippingAddress(found.shipping_address || found.billing_address || '');
      setCity(found.city || 'Mumbai');
      setState(found.state || 'Maharashtra');
      setPincode(found.pincode || '');
      setGstin(found.gstin || '');
      setPan(found.pan || '');
      setCustomerType(found.customer_type || 'B2B');
    }
  };

  // Add Item Helpers
  const addCustomItem = () => {
    const newItem: InvoiceItem = {
      item_type: 'custom',
      item_name: 'Custom Service / Deliverable',
      description: 'Specifications and milestone deliverable details',
      quantity: 1,
      unit: 'pcs',
      market_price: 25000,
      selling_price: 20000,
      discount_type: 'fixed',
      discount_value: 5000,
      tax_percentage: 18
    };
    setItems(prev => [...prev, newItem]);
  };

  const addProductFromCatalogue = (prod: Product) => {
    const mPrice = Number(prod.market_price) || 0;
    const sPrice = Number(prod.default_selling_price) || mPrice;
    const newItem: InvoiceItem = {
      product_id: prod.id,
      item_type: (prod.category?.toLowerCase() as any) || 'software',
      item_name: prod.name,
      description: prod.description || '',
      sku: prod.code,
      quantity: 1,
      unit: prod.unit || 'pcs',
      market_price: mPrice,
      selling_price: sPrice,
      discount_type: 'fixed',
      discount_value: Math.max(0, mPrice - sPrice),
      tax_percentage: Number(prod.tax_percentage) !== undefined ? Number(prod.tax_percentage) : 18
    };
    setItems(prev => [...prev, newItem]);
    setShowCataloguePicker(false);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMessage('An invoice must have at least one line item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'market_price' || field === 'selling_price') {
        const numVal = Math.max(0, Number(value) || 0);
        (item as any)[field] = numVal;
        const m = field === 'market_price' ? numVal : (Number(item.market_price) || 0);
        const s = field === 'selling_price' ? numVal : (Number(item.selling_price) || 0);
        item.discount_value = Math.max(0, m - s);
        item.discount_type = 'fixed';
      } else if (field === 'discount_value' || field === 'discount_type') {
        const m = Number(item.market_price) || 0;
        const dVal = field === 'discount_value' ? Math.max(0, Number(value) || 0) : (Number(item.discount_value) || 0);
        const dType = field === 'discount_type' ? value : item.discount_type;
        item.discount_value = dVal;
        item.discount_type = dType;
        if (dType === 'percentage') {
          const discountAmt = m * (dVal / 100);
          item.selling_price = Math.max(0, m - discountAmt);
        } else {
          item.selling_price = Math.max(0, m - dVal);
        }
      } else if (field === 'quantity') {
        item.quantity = Math.max(1, Number(value) || 1);
      } else if (field === 'tax_percentage') {
        item.tax_percentage = Number(value);
      } else {
        (item as any)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Real-time calculation
  const calculations = calculateLocalFinancials(
    items,
    extraDiscountType,
    extraDiscountValue,
    state,
    settings?.company_state || 'Maharashtra',
    taxCalculationMode,
    autoTaxType ? undefined : taxType
  );

  const handleSubmit = async (targetStatus: 'draft' | 'generated' | 'issued') => {
    setErrorMessage('');

    if (!customerName.trim() || !mobile.trim()) {
      setErrorMessage('Please enter Customer Name and Mobile Number.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Please add at least one line item.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      lead_id: sourceMode === 'lead' && selectedLeadId ? selectedLeadId : null,
      customer_id: sourceMode === 'existing_customer' && selectedCustomerId ? Number(selectedCustomerId) : (editingInvoice?.customer_id || null),
      customer: {
        name: customerName.trim(),
        company_name: companyName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        billing_address: billingAddress.trim(),
        shipping_address: (shippingAddress || billingAddress).trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        gstin: gstin.trim(),
        pan: pan.trim(),
        customer_type: customerType
      },
      customer_name: customerName.trim(),
      customer_company: companyName.trim(),
      customer_mobile: mobile.trim(),
      customer_email: email.trim(),
      customer_address: billingAddress.trim(),
      customer_city: city.trim(),
      customer_state: state.trim(),
      customer_pincode: pincode.trim(),
      customer_gstin: gstin.trim(),
      project_id: selectedProjectId ? Number(selectedProjectId) : null,
      project_name: selectedProjectName || null,
      tax_calculation_mode: taxCalculationMode,
      tax_type: autoTaxType ? undefined : taxType,
      invoice_date: invoiceDate,
      due_date: dueDate,
      notes: notes.trim(),
      items: items.map(it => ({
        product_id: it.product_id || null,
        item_type: it.item_type || 'software',
        item_name: it.item_name,
        description: it.description || '',
        sku: it.sku || '',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'pcs',
        market_price: Number(it.market_price) || 0,
        selling_price: Number(it.selling_price) || 0,
        discount_type: it.discount_type || 'fixed',
        discount_value: Number(it.discount_value) || 0,
        tax_percentage: Number(it.tax_percentage)
      })),
      extra_discount_type: extraDiscountType,
      extra_discount_value: Number(extraDiscountValue) || 0,
      invoice_status: targetStatus === 'generated' ? 'issued' : targetStatus,
      initial_payment: (!editingInvoice && recordInitialPayment && initialPaymentAmount > 0) ? {
        amount: initialPaymentAmount,
        payment_method: initialPaymentMethod,
        transaction_reference: initialPaymentRef,
        notes: 'Initial receipt recorded during invoice creation'
      } : null
    };

    try {
      let res: any;
      if (editingInvoice) {
        res = await updateInvoice(editingInvoice.id, payload);
      } else {
        res = await createInvoice(payload);
      }

      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to save invoice.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-[#0b101b] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              {editingInvoice ? <Edit3 size={20} /> : <Receipt size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-outfit font-bold text-white flex items-center gap-2">
                {editingInvoice ? `Edit Draft Invoice: ${editingInvoice.invoice_number}` : 'Create Commercial Invoice'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  {editingInvoice 
                    ? `Draft v${editingInvoice.revision_number || 1}` 
                    : (sourceMode === 'lead' ? 'Source: Lead' : sourceMode === 'existing_customer' ? 'Existing Customer' : 'Manual Entry')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {editingInvoice 
                  ? 'Modify line items, quantities, selling prices, discounts, and GST rates. Changes update the draft in-place.'
                  : 'Generate professional GST invoices for software, hardware peripherals, and digital services.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-sm">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2.5 text-xs">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Customer Source Option (Only for new invoices) */}
          {!editingInvoice && (
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                1. Customer Source Option
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceMode('lead')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    sourceMode === 'lead'
                      ? 'bg-cyan-500/10 border-brand-cyan text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <UserCheck size={18} className={sourceMode === 'lead' ? 'text-brand-cyan' : 'text-slate-500'} />
                  <div>
                    <div className="font-semibold text-xs text-white">Select Existing Lead</div>
                    <div className="text-[11px] text-slate-400">Auto-fill from CRM leads</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('manual')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    sourceMode === 'manual'
                      ? 'bg-cyan-500/10 border-brand-cyan text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Plus size={18} className={sourceMode === 'manual' ? 'text-brand-cyan' : 'text-slate-500'} />
                  <div>
                    <div className="font-semibold text-xs text-white">Manual Customer Entry</div>
                    <div className="text-[11px] text-slate-400">Direct on-spot entry</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('existing_customer')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    sourceMode === 'existing_customer'
                      ? 'bg-cyan-500/10 border-brand-cyan text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Building2 size={18} className={sourceMode === 'existing_customer' ? 'text-brand-cyan' : 'text-slate-500'} />
                  <div>
                    <div className="font-semibold text-xs text-white">Existing Customer</div>
                    <div className="text-[11px] text-slate-400">Search customer directory</div>
                  </div>
                </button>
              </div>

              {/* Quick Picker dropdowns */}
              {sourceMode === 'lead' && (
                <div className="mt-3.5 pt-3 border-t border-white/5">
                  <label className="text-xs text-slate-400 block mb-1">Select Lead to Convert into Invoice:</label>
                  <select
                    value={selectedLeadId}
                    onChange={handleLeadChange}
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="">— Select Qualified Lead ({leadsList.length} available) —</option>
                    {leadsList.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        #{lead.id} • {lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`} • {lead.company || lead.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceMode === 'existing_customer' && (
                <div className="mt-3.5 pt-3 border-t border-white/5">
                  <label className="text-xs text-slate-400 block mb-1">Select Customer from Directory:</label>
                  <select
                    value={selectedCustomerId}
                    onChange={handleCustomerChange}
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="">— Select Customer ({customersList.length} registered) —</option>
                    {customersList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company_name ? `(${c.company_name})` : ''} • {c.mobile} • {c.city || 'Mumbai'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Details, Project Linkage & Dates */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={15} className="text-brand-cyan" />
                2. Customer & Project Linkage
              </label>
              {!editingInvoice && sourceMode === 'manual' && (
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsNewCustomer}
                    onChange={e => setSaveAsNewCustomer(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-brand-cyan focus:ring-0"
                  />
                  <span>Save customer to directory</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Customer / Contact Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Company / Store Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Supermarket Pvt Ltd"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rajesh@apexkirana.com"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Billing Address</label>
                <input
                  type="text"
                  value={billingAddress}
                  onChange={e => setBillingAddress(e.target.value)}
                  placeholder="Shop 12-14, Green Valley Heights, Andheri West"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">State (Tax Determination) *</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                >
                  <option value="Maharashtra">Maharashtra (Intra-State: CGST + SGST)</option>
                  <option value="Gujarat">Gujarat (Inter-State: IGST)</option>
                  <option value="Karnataka">Karnataka (Inter-State: IGST)</option>
                  <option value="Delhi">Delhi (Inter-State: IGST)</option>
                  <option value="Tamil Nadu">Tamil Nadu (Inter-State: IGST)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (Inter-State: IGST)</option>
                  <option value="Telangana">Telangana (Inter-State: IGST)</option>
                  <option value="Rajasthan">Rajasthan (Inter-State: IGST)</option>
                  <option value="Other">Other State (IGST)</option>
                </select>
              </div>

              {/* Linked Project Dropdown */}
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-brand-cyan" />
                  Link to Project (Financial Tracking)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={e => {
                    const pid = e.target.value;
                    setSelectedProjectId(pid);
                    const found = projectsList.find(p => String(p.id) === pid);
                    setSelectedProjectName(found ? found.title : '');
                  }}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none font-medium"
                >
                  <option value="">— Direct Commercial Invoice (No Project) —</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.project_code}] {p.title} {p.client ? `— ${p.client}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  placeholder="27AABCA1234A1Z1"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Customer Type</label>
                <select
                  value={customerType}
                  onChange={e => setCustomerType(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                >
                  <option value="B2B">B2B Commercial</option>
                  <option value="Retail">Retail Store / Kirana</option>
                  <option value="Enterprise">Corporate Enterprise</option>
                  <option value="Individual">Individual Consumer</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Line Items, Tax Engine & Pricing Model */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Package size={15} className="text-brand-cyan" />
                  3. Line Items, Pricing & GST Engine
                </label>
                <span className="text-[11px] text-slate-400">
                  Every item preserves Market Price (MRP), Selling Price, auto-calculated Discount, and selectable GST %.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCataloguePicker(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-brand-cyan/30 text-brand-cyan hover:bg-cyan-500/20 text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                >
                  <Plus size={14} /> Add from Catalogue
                </button>
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} /> Add Custom Item
                </button>
              </div>
            </div>

            {/* GST Calculation Mode & Jurisdiction Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070b13] p-3 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">Tax Basis:</span>
                <button
                  type="button"
                  onClick={() => setTaxCalculationMode('exclusive')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    taxCalculationMode === 'exclusive'
                      ? 'bg-brand-cyan text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  GST Exclusive (Tax Added on Top)
                </button>
                <button
                  type="button"
                  onClick={() => setTaxCalculationMode('inclusive')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    taxCalculationMode === 'inclusive'
                      ? 'bg-brand-cyan text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  GST Inclusive (Price Includes Tax)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">Tax Treatment:</span>
                <select
                  value={autoTaxType ? 'auto' : taxType}
                  onChange={e => {
                    if (e.target.value === 'auto') {
                      setAutoTaxType(true);
                    } else {
                      setAutoTaxType(false);
                      setTaxType(e.target.value as any);
                    }
                  }}
                  className="bg-[#0b101b] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white font-medium"
                >
                  <option value="auto">
                    Auto-Detect: {calculations.tax_type === 'intra_state' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
                  </option>
                  <option value="intra_state">Force Intra-State (CGST + SGST)</option>
                  <option value="inter_state">Force Inter-State (IGST)</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#070b13]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                    <th className="p-3 w-10">#</th>
                    <th className="p-3 min-w-[200px]">Item / Deliverable</th>
                    <th className="p-3 w-28">Type</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 w-28 text-right">Market MRP (₹)</th>
                    <th className="p-3 w-28 text-right">Quoted / Selling (₹)</th>
                    <th className="p-3 w-28 text-right">Discount (₹)</th>
                    <th className="p-3 w-36 text-center">GST Rate</th>
                    <th className="p-3 w-28 text-right">Line Total (₹)</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item, idx) => {
                    const calcItem = calculations.items[idx];
                    const discountAmt = calcItem ? calcItem.discount_amount : Math.max(0, (Number(item.market_price) - Number(item.selling_price)) * (Number(item.quantity) || 1));
                    const lineTotal = calcItem ? calcItem.line_total : (Number(item.selling_price) * (Number(item.quantity) || 1));

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.item_name}
                            onChange={e => updateItem(idx, 'item_name', e.target.value)}
                            placeholder="Item name"
                            className="w-full bg-transparent border-b border-white/10 hover:border-white/30 focus:border-brand-cyan text-white text-xs py-1 focus:outline-none font-medium"
                          />
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={e => updateItem(idx, 'description', e.target.value)}
                            placeholder="Deliverable specifications, SKU, or notes"
                            className="w-full bg-transparent text-[11px] text-slate-400 py-0.5 focus:outline-none"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={item.item_type}
                            onChange={e => updateItem(idx, 'item_type', e.target.value)}
                            className="bg-[#0b101b] border border-white/10 rounded px-2 py-1 text-white text-[11px] focus:outline-none"
                          >
                            <option value="software">Software</option>
                            <option value="hardware">Hardware</option>
                            <option value="services">Service</option>
                            <option value="custom">Custom</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', e.target.value)}
                            className="w-full text-center bg-[#0b101b] border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.market_price}
                            onChange={e => updateItem(idx, 'market_price', e.target.value)}
                            className="w-full text-right bg-[#0b101b] border border-white/10 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none font-mono"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.selling_price}
                            onChange={e => updateItem(idx, 'selling_price', e.target.value)}
                            className="w-full text-right bg-[#0b101b] border border-brand-cyan/30 rounded px-2 py-1 text-white text-xs font-semibold focus:outline-none font-mono"
                          />
                        </td>
                        <td className="p-3 text-right font-mono text-amber-400/90 text-xs">
                          ₹{discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          <select
                            value={Number(item.tax_percentage)}
                            onChange={e => updateItem(idx, 'tax_percentage', e.target.value)}
                            className="w-full text-center bg-[#0b101b] border border-white/10 rounded px-1.5 py-1 text-white text-[11px] focus:outline-none font-mono"
                          >
                            {GST_RATES.map(rate => (
                              <option key={rate.value} value={rate.value}>
                                {rate.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-brand-cyan text-xs">
                          ₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                            title="Remove Line Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notes & Extra Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Invoice Terms & Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special instructions, warranty remarks, or payment milestones..."
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg p-2.5 text-white text-xs focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400 w-36">Extra Invoice Discount:</label>
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={extraDiscountType}
                      onChange={e => setExtraDiscountType(e.target.value as any)}
                      className="bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="fixed">Fixed (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={extraDiscountValue}
                      onChange={e => setExtraDiscountValue(Number(e.target.value))}
                      className="bg-[#070b13] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono flex-1 focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                </div>

                {/* Initial Payment Toggle (Only on initial creation) */}
                {!editingInvoice && (
                  <div className="border border-white/5 rounded-xl p-3 bg-white/[0.02]">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={recordInitialPayment}
                        onChange={e => {
                          setRecordInitialPayment(e.target.checked);
                          if (e.target.checked && initialPaymentAmount === 0) {
                            setInitialPaymentAmount(calculations.grand_total);
                          }
                        }}
                        className="rounded bg-white/10 border-white/20 text-brand-cyan focus:ring-0"
                      />
                      <span className="text-xs font-semibold text-white">Record Upfront / Advance Payment</span>
                    </label>

                    {recordInitialPayment && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Amount (₹)</label>
                          <input
                            type="number"
                            max={calculations.grand_total}
                            value={initialPaymentAmount}
                            onChange={e => setInitialPaymentAmount(Number(e.target.value))}
                            className="w-full bg-[#070b13] border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Payment Method</label>
                          <select
                            value={initialPaymentMethod}
                            onChange={e => setInitialPaymentMethod(e.target.value as any)}
                            className="w-full bg-[#070b13] border border-white/10 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="UPI">UPI / QR Code</option>
                            <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Razorpay">Razorpay</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">UTR / Reference No.</label>
                          <input
                            type="text"
                            value={initialPaymentRef}
                            onChange={e => setInitialPaymentRef(e.target.value)}
                            placeholder="e.g. UPI/12398129"
                            className="w-full bg-[#070b13] border border-white/10 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Real-Time Live Calculation Summary */}
          <div className="bg-gradient-to-br from-slate-900 via-[#0a0f1d] to-cyan-950/20 border border-brand-cyan/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Authoritative Live Financial Calculation
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                Basis: {taxCalculationMode === 'inclusive' ? 'GST Inclusive' : 'GST Exclusive'} • {calculations.tax_type === 'intra_state' ? 'Intra-State (CGST 50% + SGST 50%)' : 'Inter-State (IGST 100%)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-center divide-x divide-white/5">
              <div className="px-2">
                <div className="text-[10px] uppercase text-slate-400 tracking-wider">Market Value</div>
                <div className="text-sm font-semibold text-slate-300 font-mono mt-0.5">
                  ₹{calculations.market_total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="px-2">
                <div className="text-[10px] uppercase text-amber-400/90 tracking-wider">Total Discount</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                  -₹{calculations.discount_total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="px-2">
                <div className="text-[10px] uppercase text-slate-400 tracking-wider">Taxable Amount</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">
                  ₹{calculations.taxable_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              {calculations.tax_type === 'intra_state' ? (
                <>
                  <div className="px-2">
                    <div className="text-[10px] uppercase text-slate-400 tracking-wider">CGST</div>
                    <div className="text-sm font-semibold text-white font-mono mt-0.5">
                      ₹{calculations.cgst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="text-[10px] uppercase text-slate-400 tracking-wider">SGST</div>
                    <div className="text-sm font-semibold text-white font-mono mt-0.5">
                      ₹{calculations.sgst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-2 col-span-2">
                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">IGST</div>
                  <div className="text-sm font-semibold text-white font-mono mt-0.5">
                    ₹{calculations.igst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              <div className="px-2">
                <div className="text-[10px] uppercase text-slate-400 tracking-wider">Round Off</div>
                <div className="text-sm font-semibold text-slate-400 font-mono mt-0.5">
                  {calculations.round_off >= 0 ? `+₹${calculations.round_off}` : `-₹${Math.abs(calculations.round_off)}`}
                </div>
              </div>

              <div className="px-2 bg-brand-cyan/10 rounded-xl py-1">
                <div className="text-[10px] uppercase text-brand-cyan font-bold tracking-wider">Grand Total</div>
                <div className="text-base font-extrabold text-brand-cyan font-mono mt-0.5">
                  ₹{calculations.grand_total.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="px-2">
                <div className="text-[10px] uppercase text-emerald-400 tracking-wider">Balance Due</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                  ₹{Math.max(
                    0, 
                    calculations.grand_total - (editingInvoice ? Number(editingInvoice.amount_paid || 0) : (recordInitialPayment ? initialPaymentAmount : 0))
                  ).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {editingInvoice ? 'Save Draft Updates' : 'Save as Draft'}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('generated')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              {isSubmitting 
                ? 'Processing Invoice...' 
                : (editingInvoice ? 'Issue as Official Invoice' : 'Generate & Finalize Invoice')}
            </button>
          </div>
        </div>

      </div>

      {/* Catalogue Picker Modal */}
      {showCataloguePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-outfit font-bold text-sm text-white flex items-center gap-2">
                <ShoppingCart size={16} className="text-brand-cyan" />
                Select Product / Service From Catalogue
              </h3>
              <button onClick={() => setShowCataloguePicker(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Filter bar */}
            <div className="p-3 border-b border-white/5 flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalogue by name or code..."
                  value={catalogueSearch}
                  onChange={e => setCatalogueSearch(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <select
                value={catalogueCategory}
                onChange={e => setCatalogueCategory(e.target.value)}
                className="bg-[#070b13] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="services">Services</option>
              </select>
            </div>

            {/* Product list */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
              {catalogueProducts
                .filter(p => catalogueCategory === 'all' || p.category?.toLowerCase() === catalogueCategory.toLowerCase())
                .filter(p => !catalogueSearch || p.name.toLowerCase().includes(catalogueSearch.toLowerCase()) || p.code.toLowerCase().includes(catalogueSearch.toLowerCase()))
                .map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => addProductFromCatalogue(prod)}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-cyan/40 hover:bg-cyan-500/[0.04] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white group-hover:text-brand-cyan transition-colors">
                          {prod.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                          {prod.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan">
                          {prod.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{prod.description}</div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <div className="text-xs font-bold text-white font-mono">
                        ₹{Number(prod.default_selling_price || prod.market_price).toLocaleString('en-IN')}
                      </div>
                      {Number(prod.market_price) > Number(prod.default_selling_price) && (
                        <div className="text-[10px] text-slate-500 line-through font-mono">
                          ₹{Number(prod.market_price).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
