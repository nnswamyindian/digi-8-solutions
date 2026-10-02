import { useState, useEffect, useRef } from 'react';
import { X, Settings, Save, CheckCircle2, AlertCircle, Building2, CreditCard, Upload, Stamp, PenTool, Image as ImageIcon } from 'lucide-react';
import { BillingSettings, getBillingSettings, updateBillingSettings, uploadBillingAsset } from '../../../lib/billingApi';

interface BillingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export default function BillingSettingsModal({
  isOpen,
  onClose,
  onSettingsSaved
}: BillingSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Settings State
  const [companyName, setCompanyName] = useState('Digi8 Solutions Private Limited');
  const [companyAddress, setCompanyAddress] = useState('Level 5, Infinity Tower, Mindspace Tech Park, Malad West');
  const [companyCity, setCompanyCity] = useState('Mumbai');
  const [companyState, setCompanyState] = useState('Maharashtra');
  const [companyPincode, setCompanyPincode] = useState('400064');
  const [companyPhone, setCompanyPhone] = useState('+91 98200 88888');
  const [companyEmail, setCompanyEmail] = useState('billing@digi8solutions.com');
  const [companyWebsite, setCompanyWebsite] = useState('https://digi8solutions.com');
  const [companyGstin, setCompanyGstin] = useState('27AABCD1234F1Z5');
  const [companyPan, setCompanyPan] = useState('AABCD1234F');

  // Invoice Numbering
  const [invoicePrefix, setInvoicePrefix] = useState('D8/INV');
  const [financialYear, setFinancialYear] = useState('2026-27');
  const [startingNumber, setStartingNumber] = useState<number>(1);
  const [nextNumber, setNextNumber] = useState<number>(1);
  const [numberPadding, setNumberPadding] = useState<number>(6);

  // Bank & UPI Details
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [bankAccountHolder, setBankAccountHolder] = useState('Digi8 Solutions Private Limited');
  const [bankAccount, setBankAccount] = useState('50200098765432');
  const [bankIfsc, setBankIfsc] = useState('HDFC0000123');
  const [bankBranch, setBankBranch] = useState('Mindspace Branch, Mumbai');
  const [upiId, setUpiId] = useState('digi8solutions@hdfcbank');
  const [upiDisplayName, setUpiDisplayName] = useState('Digi8 Solutions');
  const [showUpiQr, setShowUpiQr] = useState<boolean>(true);
  const [showBankDetails, setShowBankDetails] = useState<boolean>(true);
  const [paymentInstructions, setPaymentInstructions] = useState('Scan the UPI QR code using any UPI App (GPay/PhonePe/Paytm) or transfer directly to our current bank account using NEFT/RTGS/IMPS.');

  // Official Seal Stamp & Authorized Signature
  const [sealUrl, setSealUrl] = useState('/images/seal.png');
  const [signatureUrl, setSignatureUrl] = useState('/images/signature.png');
  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState('Authorized Signatory');
  const [authorizedSignatoryTitle, setAuthorizedSignatoryTitle] = useState('Corporate Finance & Accounts Division');
  const [uploadingSeal, setUploadingSeal] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  const sealFileInputRef = useRef<HTMLInputElement>(null);
  const sigFileInputRef = useRef<HTMLInputElement>(null);

  // Terms
  const [terms, setTerms] = useState(
    '1. Payment is strictly due within 15 days of invoice generation.\n2. Goods once sold are covered under respective manufacturer warranty.\n3. Custom software deliveries are governed by the Master Service Agreement (MSA).\n4. All disputes are subject to Mumbai jurisdiction only.'
  );

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getBillingSettings();
      if (res.success && res.data) {
        const d = res.data;
        if (d.company_name) setCompanyName(d.company_name);
        if (d.company_address) setCompanyAddress(d.company_address);
        if (d.company_city) setCompanyCity(d.company_city);
        if (d.company_state) setCompanyState(d.company_state);
        if (d.company_pincode) setCompanyPincode(d.company_pincode);
        if (d.company_phone) setCompanyPhone(d.company_phone);
        if (d.company_email) setCompanyEmail(d.company_email);
        if (d.company_website) setCompanyWebsite(d.company_website);
        if (d.company_gstin) setCompanyGstin(d.company_gstin);
        if (d.company_pan) setCompanyPan(d.company_pan);

        if (d.invoice_prefix) setInvoicePrefix(d.invoice_prefix);
        if (d.financial_year) setFinancialYear(d.financial_year);
        if (d.starting_number) setStartingNumber(d.starting_number);
        if (d.next_number) setNextNumber(d.next_number);
        if (d.number_padding) setNumberPadding(d.number_padding);

        if (d.bank_name) setBankName(d.bank_name);
        if (d.bank_account_holder) setBankAccountHolder(d.bank_account_holder);
        if (d.bank_account_number) setBankAccount(d.bank_account_number);
        if (d.bank_ifsc) setBankIfsc(d.bank_ifsc);
        if (d.bank_branch) setBankBranch(d.bank_branch);
        if (d.upi_id) setUpiId(d.upi_id);
        if (d.upi_display_name) setUpiDisplayName(d.upi_display_name);
        if (d.show_upi_qr !== undefined) setShowUpiQr(!!d.show_upi_qr);
        if (d.show_bank_details !== undefined) setShowBankDetails(!!d.show_bank_details);
        if (d.payment_instructions) setPaymentInstructions(d.payment_instructions);

        if (d.seal_url) setSealUrl(d.seal_url);
        if (d.signature_url) setSignatureUrl(d.signature_url);
        if (d.authorized_signatory_name) setAuthorizedSignatoryName(d.authorized_signatory_name);
        if (d.authorized_signatory_title) setAuthorizedSignatoryTitle(d.authorized_signatory_title);

        if (d.terms_conditions) setTerms(d.terms_conditions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSealFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSeal(true);
    setErrorMessage('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setSealUrl(base64Data);
        const uploadRes = await uploadBillingAsset('seal', base64Data);
        if (uploadRes.success && uploadRes.url) {
          setSealUrl(uploadRes.url);
          setSuccessMessage('Official Company Seal stamp uploaded successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else if (!uploadRes.success) {
          setErrorMessage(uploadRes.error || 'Failed to upload seal image.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing seal image.');
    } finally {
      setUploadingSeal(false);
    }
  };

  const handleSignatureFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSig(true);
    setErrorMessage('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setSignatureUrl(base64Data);
        const uploadRes = await uploadBillingAsset('signature', base64Data);
        if (uploadRes.success && uploadRes.url) {
          setSignatureUrl(uploadRes.url);
          setSuccessMessage('Authorized Signature image uploaded successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else if (!uploadRes.success) {
          setErrorMessage(uploadRes.error || 'Failed to upload signature image.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing signature image.');
    } finally {
      setUploadingSig(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const payload: Partial<BillingSettings> = {
        company_name: companyName,
        company_address: companyAddress,
        company_city: companyCity,
        company_state: companyState,
        company_pincode: companyPincode,
        company_phone: companyPhone,
        company_email: companyEmail,
        company_website: companyWebsite,
        company_gstin: companyGstin,
        company_pan: companyPan,
        invoice_prefix: invoicePrefix,
        financial_year: financialYear,
        starting_number: Number(startingNumber),
        next_number: Number(nextNumber),
        number_padding: Number(numberPadding),
        terms_conditions: terms,
        bank_name: bankName,
        bank_account_holder: bankAccountHolder,
        bank_account_number: bankAccount,
        bank_ifsc: bankIfsc,
        bank_branch: bankBranch,
        upi_id: upiId,
        upi_display_name: upiDisplayName,
        show_upi_qr: showUpiQr,
        show_bank_details: showBankDetails,
        payment_instructions: paymentInstructions,
        seal_url: sealUrl,
        signature_url: signatureUrl,
        authorized_signatory_name: authorizedSignatoryName,
        authorized_signatory_title: authorizedSignatoryTitle
      };

      const res = await updateBillingSettings(payload);
      if (res.success) {
        setSuccessMessage('Billing, Seal Stamp & Authorized Signature settings updated successfully.');
        if (onSettingsSaved) onSettingsSaved();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to update settings.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="text-sm font-outfit font-bold text-white">Invoice Numbering & Statutory Settings</h3>
              <p className="text-[11px] text-slate-400">Configure sequential numbering format, GSTIN, bank details, and default terms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
          
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Concurrency-Safe Sequential Invoice Numbering */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="font-bold text-sm text-brand-cyan uppercase tracking-wider flex items-center gap-2">
              Sequential Invoice Numbering Engine
            </h4>
            <p className="text-[11px] text-slate-400">
              Numbers are assigned atomically inside a database transaction to guarantee zero duplicate invoice numbers under concurrent creation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Prefix *</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={e => setInvoicePrefix(e.target.value.toUpperCase())}
                  placeholder="D8/INV"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Financial Year *</label>
                <input
                  type="text"
                  value={financialYear}
                  onChange={e => setFinancialYear(e.target.value)}
                  placeholder="2026-27"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:border-brand-cyan focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Next Sequence Number *</label>
                <input
                  type="number"
                  min="1"
                  value={nextNumber}
                  onChange={e => setNextNumber(Number(e.target.value))}
                  className="w-full bg-[#070b13] border border-brand-cyan/40 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Padding Digits *</label>
                <select
                  value={numberPadding}
                  onChange={e => setNumberPadding(Number(e.target.value))}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                >
                  <option value="4">4 Digits (0001)</option>
                  <option value="5">5 Digits (00001)</option>
                  <option value="6">6 Digits (000001)</option>
                  <option value="8">8 Digits (00000001)</option>
                </select>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-3 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Live Generated Format Preview:</span>
              <span className="font-mono font-bold text-brand-cyan text-sm">
                {invoicePrefix}/{financialYear}/{String(nextNumber).padStart(numberPadding, '0')}
              </span>
            </div>
          </div>

          {/* Section 2: Company Details & Tax Info */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-brand-cyan" /> Company Information & Tax Compliance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Company GSTIN</label>
                <input
                  type="text"
                  value={companyGstin}
                  onChange={e => setCompanyGstin(e.target.value.toUpperCase())}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Company PAN</label>
                <input
                  type="text"
                  value={companyPan}
                  onChange={e => setCompanyPan(e.target.value.toUpperCase())}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-300 block mb-1">Registered Address</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  placeholder="T-Hub, Inorbit Mall Rd, Madhapur"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">City</label>
                <input
                  type="text"
                  value={companyCity}
                  onChange={e => setCompanyCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">State (Origin for Intra/Inter Tax)</label>
                <input
                  type="text"
                  value={companyState}
                  onChange={e => setCompanyState(e.target.value)}
                  placeholder="Telangana"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={companyPincode}
                  onChange={e => setCompanyPincode(e.target.value)}
                  placeholder="500032"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={e => setCompanyPhone(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Billing Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={e => setCompanyEmail(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Website URL</label>
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={e => setCompanyWebsite(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank & UPI Payment Details */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16} className="text-brand-cyan" /> Bank Account & Instant UPI Details
              </h4>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={showUpiQr}
                    onChange={e => setShowUpiQr(e.target.checked)}
                    className="accent-brand-cyan w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Show UPI QR on Invoice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={showBankDetails}
                    onChange={e => setShowBankDetails(e.target.checked)}
                    className="accent-brand-cyan w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Show Bank Details on Invoice</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={e => setBankAccountHolder(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Branch Name</label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={e => setBankBranch(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">UPI Payee Display Name</label>
                <input
                  type="text"
                  value={upiDisplayName}
                  onChange={e => setUpiDisplayName(e.target.value)}
                  placeholder="Digi8 Solutions"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-300 block mb-1">UPI VPA / ID (e.g. digi8solutions@hdfcbank)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="digi8solutions@hdfcbank"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-300 block mb-1">Payment Instructions (Displayed on Invoice)</label>
                <textarea
                  rows={2}
                  value={paymentInstructions}
                  onChange={e => setPaymentInstructions(e.target.value)}
                  placeholder="Scan UPI QR or wire funds to bank account..."
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg p-2.5 text-white text-xs leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Official Company Seal Stamp & Authorized Signature */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-brand-cyan uppercase tracking-wider flex items-center gap-2">
                <Stamp size={16} /> Official Company Seal & Authorized Signature
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload your official corporate seal stamp and calligraphic signature PNGs. These will be rendered dynamically on commercial tax invoices, browser prints, and downloaded/emailed PDF documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Company Seal Card */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Stamp size={14} className="text-blue-400" /> Company Seal Stamp (PNG)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">200x200 / 400x400</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <img
                      src={sealUrl || '/images/seal.png'}
                      alt="Company Seal"
                      className="w-full h-full object-contain filter drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={sealFileInputRef}
                      onChange={handleSealFileChange}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => sealFileInputRef.current?.click()}
                      disabled={uploadingSeal}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Upload size={13} />
                      {uploadingSeal ? 'Uploading Seal...' : 'Upload Seal PNG'}
                    </button>
                    <input
                      type="text"
                      value={sealUrl}
                      onChange={e => setSealUrl(e.target.value)}
                      placeholder="/images/seal.png"
                      className="w-full bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Supports high-res circular transparent PNG or crisp JPEG stamps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Authorized Signature Card */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <PenTool size={14} className="text-cyan-400" /> Authorized Signature (PNG)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">300x120 / transparent</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                    <img
                      src={signatureUrl || '/images/signature.png'}
                      alt="Authorized Signature"
                      className="w-full h-full object-contain filter contrast-125"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={sigFileInputRef}
                      onChange={handleSignatureFileChange}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => sigFileInputRef.current?.click()}
                      disabled={uploadingSig}
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-brand-cyan/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Upload size={13} />
                      {uploadingSig ? 'Uploading Signature...' : 'Upload Signature PNG'}
                    </button>
                    <input
                      type="text"
                      value={signatureUrl}
                      onChange={e => setSignatureUrl(e.target.value)}
                      placeholder="/images/signature.png"
                      className="w-full bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Supports transparent calligraphy pen signature PNGs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signatory Name & Designation */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 block font-medium">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={authorizedSignatoryName}
                  onChange={e => setAuthorizedSignatoryName(e.target.value)}
                  placeholder="Julian Thorne / Authorized Signatory"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 block font-medium">Signatory Title / Department</label>
                <input
                  type="text"
                  value={authorizedSignatoryTitle}
                  onChange={e => setAuthorizedSignatoryTitle(e.target.value)}
                  placeholder="Corporate Finance & Accounts Division"
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Default Terms and Conditions */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Default Terms & Conditions</h4>
            <textarea
              rows={4}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full bg-[#070b13] border border-white/10 rounded-lg p-3 text-white text-xs leading-relaxed focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
