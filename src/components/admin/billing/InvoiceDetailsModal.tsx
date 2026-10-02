import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, Printer, Download, Share2, DollarSign, Ban, 
  History, CheckCircle, Clock, AlertTriangle, Building2, 
  Phone, Mail, Globe, MapPin, QrCode, FileText, ArrowLeft,
  Copy, ExternalLink, Edit3, ShieldAlert, Check, RefreshCw
} from 'lucide-react';
import { Invoice, PaymentRecord, InvoiceAuditLog, PaymentDetailsSnapshot, reversePayment, downloadInvoicePdf } from '../../../lib/billingApi';
import SendInvoiceEmailModal from './SendInvoiceEmailModal';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onCancelInvoice: (invoice: Invoice) => void;
  onViewAudit: (invoice: Invoice) => void;
  onEditDraft?: (invoice: Invoice) => void;
  onIssueDraft?: (invoice: Invoice) => void;
  onPaymentReversed?: () => void;
}

export default function InvoiceDetailsModal({
  invoice,
  isOpen,
  onClose,
  onRecordPayment,
  onCancelInvoice,
  onViewAudit,
  onEditDraft,
  onIssueDraft,
  onPaymentReversed
}: InvoiceDetailsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [reversalLoading, setReversalLoading] = useState(false);
  const [reversingPaymentId, setReversingPaymentId] = useState<number | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [selectedPaymentForReversal, setSelectedPaymentForReversal] = useState<PaymentRecord | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Parse payment details snapshot if available
  const snapshot: PaymentDetailsSnapshot = (() => {
    if (!invoice?.payment_details_snapshot) {
      return {
        bank_name: 'HDFC Bank Ltd',
        bank_account_holder: 'Digi8 Solutions Private Limited',
        bank_account_number: '50200098765432',
        bank_ifsc: 'HDFC0000123',
        bank_branch: 'Mindspace Branch, Mumbai',
        upi_id: 'digi8solutions@hdfcbank',
        upi_display_name: 'Digi8 Solutions Pvt Ltd',
        show_upi_qr: true,
        show_bank_details: true,
        payment_instructions: 'Scan the UPI QR code using any UPI App (GPay, PhonePe, Paytm, BHIM) to pay instantly. For direct NEFT/RTGS/IMPS, transfer to our HDFC corporate account above and mention the Invoice number in the transaction description.'
      };
    }
    if (typeof invoice.payment_details_snapshot === 'string') {
      try {
        return JSON.parse(invoice.payment_details_snapshot);
      } catch {
        return {};
      }
    }
    return invoice.payment_details_snapshot;
  })();

  const balanceToPay = Math.max(0, Number(invoice?.balance_amount) || 0);
  const isPaid = Number(invoice?.balance_amount) <= 0 || invoice?.payment_status === 'paid';

  // Generate real UPI QR Code (Both SVG for perfect print vector and DataURL fallback)
  useEffect(() => {
    if (!invoice || !isOpen) return;

    const upiId = snapshot.upi_id || 'digi8solutions@hdfcbank';
    const payeeName = snapshot.upi_display_name || snapshot.bank_account_holder || 'Digi8 Solutions Pvt Ltd';
    const amountToRequest = balanceToPay > 0 ? balanceToPay.toFixed(2) : Number(invoice.grand_total || 0).toFixed(2);
    const invoiceRef = invoice.invoice_number || 'INV';
    const note = `Invoice ${invoiceRef}`;

    // UPI Intent URL RFC specification
    const upiPayIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountToRequest}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Vector SVG generation (Highest quality for printer output)
    QRCode.toString(upiPayIntent, {
      type: 'svg',
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(svg => setQrSvg(svg))
      .catch(err => console.warn('QR Code SVG generation failed:', err));

    QRCode.toDataURL(upiPayIntent, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.warn('QR Code generation failed:', err));
  }, [invoice, isOpen, balanceToPay]);

  if (!isOpen || !invoice) return null;

  const handlePrint = async () => {
    if (!qrSvg && !qrDataUrl) {
      // Ensure QR generation completes before printing
      await new Promise(r => setTimeout(r, 250));
    }
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await downloadInvoicePdf(invoice.id, invoice.invoice_number);
      if (!res.success) {
        alert(res.error || 'Failed to download PDF. You can also use the Print button to Save as PDF.');
      }
    } catch (err: any) {
      alert(err.message || 'Error downloading invoice PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShare = () => {
    const summary = `Invoice ${invoice.invoice_number} for ${invoice.customer_name} — Total: ₹${Number(invoice.grand_total).toLocaleString('en-IN')}, Balance: ₹${balanceToPay.toLocaleString('en-IN')}. Digi8 Solutions`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard && snapshot.upi_id) {
      navigator.clipboard.writeText(snapshot.upi_id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleCopyAcc = () => {
    if (navigator.clipboard && snapshot.bank_account_number) {
      navigator.clipboard.writeText(snapshot.bank_account_number);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2500);
    }
  };

  const handleConfirmReversal = async () => {
    if (!selectedPaymentForReversal?.id) return;
    setReversalLoading(true);
    try {
      const res = await reversePayment(
        invoice.id,
        selectedPaymentForReversal.id,
        reversalReason || 'Manual payment reversal by authorized manager'
      );
      if (res.success) {
        setShowReversalModal(false);
        setSelectedPaymentForReversal(null);
        setReversalReason('');
        if (onPaymentReversed) onPaymentReversed();
      } else {
        alert(res.error || 'Failed to reverse payment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error reversing payment.');
    } finally {
      setReversalLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (invoice.invoice_status === 'cancelled') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
          <Ban size={13} /> Cancelled
        </span>
      );
    }
    if (invoice.invoice_status === 'draft') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Clock size={13} /> Draft (v{invoice.revision_number || 1})
        </span>
      );
    }
    if (invoice.payment_status === 'paid') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle size={13} /> Paid in Full
        </span>
      );
    }
    if (invoice.payment_status === 'partially_paid') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Clock size={13} /> Partially Paid
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
        <AlertTriangle size={13} /> Unpaid
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="bg-[#0b101b] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black">
        
        {/* Exact Print Styles for QR Code, Vector Ink & Badges */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .print-exact-qr, .print-exact-qr svg, .print-exact-qr img {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
          }
        ` }} />

        {/* Modal Controls Bar (Hidden during print) */}
        <div className="px-6 py-3.5 border-b border-white/10 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">Invoice:</span>
            <span className="font-mono font-bold text-sm text-white">{invoice.invoice_number}</span>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* If Draft: Show Edit Draft & Issue Invoice buttons */}
            {invoice.invoice_status === 'draft' && onEditDraft && (
              <button
                onClick={() => {
                  onClose();
                  onEditDraft(invoice);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-brand-cyan/40 text-brand-cyan hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)]"
              >
                <Edit3 size={14} /> Edit Draft
              </button>
            )}

            {invoice.invoice_status === 'draft' && onIssueDraft && (
              <button
                onClick={() => {
                  if (confirm(`Promote draft ${invoice.invoice_number} to an official issued invoice? This assigns the next sequential invoice number and snapshot payment details.`)) {
                    onIssueDraft(invoice);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle size={14} /> Issue Final Invoice
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-brand-cyan/30 text-brand-cyan hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)] disabled:opacity-50"
              title="Download official PDF"
            >
              <Download size={14} className={isDownloadingPdf ? 'animate-bounce' : ''} />
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={() => setShowSendEmailModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Email invoice to customer with PDF attachment"
            >
              <Mail size={14} /> Send Email
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer size={14} /> Print
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Share2 size={14} /> {copiedLink ? 'Copied!' : 'Share'}
            </button>

            {invoice.invoice_status !== 'cancelled' && invoice.invoice_status !== 'draft' && balanceToPay > 0 && (
              <button
                onClick={() => onRecordPayment(invoice)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              >
                <DollarSign size={14} /> Record Payment
              </button>
            )}

            {invoice.invoice_status !== 'cancelled' && (
              <button
                onClick={() => onCancelInvoice(invoice)}
                className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all"
                title="Cancel Invoice"
              >
                <Ban size={14} />
              </button>
            )}

            <button
              onClick={() => onViewAudit(invoice)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Audit Logs"
            >
              <History size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Printable Invoice Body */}
        <div ref={printAreaRef} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar text-xs print:p-0 print:overflow-visible">
          
          {/* Header Section: Digi8 Branding & Statutory Details */}
          <div className="flex flex-wrap justify-between items-start gap-6 border-b border-white/10 pb-6 print:border-gray-300">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] print:border print:border-black">
                  D8
                </div>
                <div>
                  <h1 className="font-outfit font-extrabold text-xl text-white tracking-wide print:text-black">
                    DIGI8 SOLUTIONS
                  </h1>
                  <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-mono font-semibold print:text-gray-600">
                    TAX COMMERCIAL INVOICE
                  </span>
                </div>
              </div>

              <div className="mt-3 text-slate-400 space-y-0.5 text-[11px] print:text-gray-700">
                <p>Level 5, Infinity Tower, Mindspace Tech Park</p>
                <p>Malad West, Mumbai, Maharashtra — 400064</p>
                <p>Email: billing@digi8solutions.com • Phone: +91 98200 88888</p>
                <p className="font-mono text-slate-300 print:text-black">
                  <strong>GSTIN:</strong> 27AABCD1234F1Z5 • <strong>PAN:</strong> AABCD1234F
                </p>
              </div>
            </div>

            {/* Invoice Meta Cards */}
            <div className="text-right space-y-1.5">
              <div className="inline-block bg-white/5 px-3 py-1 rounded-lg border border-white/10 print:border-gray-400 print:bg-gray-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block print:text-gray-600">Invoice Number</span>
                <span className="font-mono font-bold text-sm text-white print:text-black">{invoice.invoice_number}</span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5 print:text-gray-700">
                <div><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                {invoice.due_date && (
                  <div><strong>Payment Due:</strong> {new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                )}
                <div><strong>Financial Year:</strong> {invoice.financial_year || '2026-27'}</div>
                {invoice.project_name && (
                  <div className="text-brand-cyan print:text-black font-semibold">
                    <strong>Project:</strong> {invoice.project_name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Billing Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/[0.02] p-4 rounded-xl border border-white/5 print:border-gray-300 print:bg-white">
            <div>
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block mb-1 print:text-gray-600">
                Billed To (Customer Details)
              </span>
              <h3 className="font-bold text-sm text-white print:text-black">{invoice.customer_name}</h3>
              {invoice.customer_company && (
                <div className="font-semibold text-slate-300 print:text-gray-800">{invoice.customer_company}</div>
              )}
              <div className="text-[11px] text-slate-400 mt-1 space-y-0.5 print:text-gray-700">
                <p>{invoice.customer_address || 'Address on file'}</p>
                <p>{invoice.customer_city}, {invoice.customer_state} — {invoice.customer_pincode}</p>
                <p>Mobile: {invoice.customer_mobile} {invoice.customer_email ? `• ${invoice.customer_email}` : ''}</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 text-[11px] text-slate-400 print:text-gray-700">
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block mb-1 print:text-gray-600">
                Statutory & Tax Assessment
              </span>
              <div>
                <strong>Customer GSTIN:</strong> <span className="font-mono text-slate-200 print:text-black">{invoice.customer_gstin || 'URP (Unregistered)'}</span>
              </div>
              <div>
                <strong>State of Supply:</strong> {invoice.customer_state || 'Maharashtra'}
              </div>
              <div>
                <strong>Tax Treatment:</strong> {invoice.tax_type === 'intra_state' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
              </div>
              <div>
                <strong>Sales Executive:</strong> {invoice.sales_person_name || 'Digi8 Solutions'}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden print:border-gray-400">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 border-b border-white/10 print:bg-gray-100 print:text-black print:border-gray-400">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Product / Service Specification</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right w-24">MRP (₹)</th>
                  <th className="p-3 text-right w-24">Quoted (₹)</th>
                  <th className="p-3 text-right w-24">Discount (₹)</th>
                  <th className="p-3 text-center w-20">GST %</th>
                  <th className="p-3 text-right w-28">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-300">
                {(invoice.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px] print:text-gray-600">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white print:text-black">{item.item_name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 print:text-gray-600 mt-0.5">{item.description}</div>
                      )}
                      {item.sku && (
                        <div className="text-[9px] font-mono text-slate-500 print:text-gray-500 mt-0.5">HSN/SKU: {item.sku}</div>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-medium text-slate-300 print:text-black">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-slate-400 print:text-gray-600">
                      ₹{Number(item.market_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-white print:text-black font-semibold">
                      ₹{Number(item.selling_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-400/90 print:text-amber-800">
                      -₹{Number(item.discount_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300 print:text-black">
                      {Number(item.tax_percentage)}%
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white print:text-black">
                      ₹{Number(item.line_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Breakdown & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Bank Details & UPI QR Code */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 print:border-gray-300">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 print:border-gray-200">
                  <h4 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode size={14} className="text-brand-cyan" /> Bank & Instant UPI Payment Details
                  </h4>
                  {isPaid ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PAID IN FULL
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-brand-cyan border border-brand-cyan/30">
                      DUE: ₹{balanceToPay.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  {/* Dynamic Scannable UPI QR Code */}
                  {snapshot.show_upi_qr !== false && (
                    <div className="shrink-0 text-center bg-white p-2.5 rounded-xl shadow-lg border border-white/20 print:border-gray-400 print:bg-white print:block print:p-2 print-exact-qr">
                      {qrSvg ? (
                        <div 
                          className="w-32 h-32 flex items-center justify-center mx-auto print:block print:w-32 print:h-32 [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                        />
                      ) : qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="UPI Payment QR Code" 
                          className="w-32 h-32 object-contain mx-auto print:block" 
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center text-slate-500 text-[10px] font-mono">
                          Generating QR...
                        </div>
                      )}
                      <div className="text-[9px] text-slate-900 font-bold mt-1.5 tracking-tight print:text-black">
                        Scan to Pay ₹{balanceToPay > 0 ? balanceToPay.toLocaleString('en-IN') : Number(invoice.grand_total).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[8px] text-slate-600 font-medium print:text-gray-600">
                        BHIM / GPay / PhonePe / Paytm
                      </div>
                    </div>
                  )}

                  {/* Bank & UPI text details */}
                  {snapshot.show_bank_details !== false && (
                    <div className="space-y-1.5 text-[11px] text-slate-400 print:text-gray-700 flex-1">
                      <div>
                        <strong>Account Name:</strong> {snapshot.bank_account_holder || 'Digi8 Solutions Private Limited'}
                      </div>
                      <div>
                        <strong>Bank:</strong> {snapshot.bank_name || 'HDFC Bank Ltd'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <strong>A/C No:</strong>
                        <span className="font-mono text-white print:text-black font-semibold">
                          {snapshot.bank_account_number || '50200098765432'}
                        </span>
                        <button 
                          type="button"
                          onClick={handleCopyAcc}
                          className="p-1 hover:text-white text-slate-500 transition-colors print:hidden"
                          title="Copy Account Number"
                        >
                          {copiedAcc ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div>
                        <strong>IFSC Code:</strong> <span className="font-mono text-slate-300 print:text-black">{snapshot.bank_ifsc || 'HDFC0000123'}</span>
                      </div>
                      <div>
                        <strong>Branch:</strong> {snapshot.bank_branch || 'Mindspace Branch, Mumbai'}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5 print:border-gray-200">
                        <strong>UPI ID:</strong>
                        <span className="text-brand-cyan print:text-black font-mono font-bold">
                          {snapshot.upi_id || 'digi8solutions@hdfcbank'}
                        </span>
                        <button 
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 hover:text-white text-brand-cyan/80 transition-colors print:hidden"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {snapshot.payment_instructions && (
                  <div className="text-[10px] text-slate-400 print:text-gray-600 bg-black/30 p-2 rounded-lg border border-white/5 print:bg-gray-50">
                    <strong>Instructions:</strong> {snapshot.payment_instructions}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-[10px] text-slate-400 print:text-gray-600 space-y-1">
                <div className="font-bold text-slate-300 print:text-black uppercase tracking-wider">Terms & Conditions:</div>
                <div className="whitespace-pre-line leading-relaxed">
                  {invoice.terms_conditions || '1. Payments are due within 15 days of invoice date.\n2. Goods once sold are covered under respective warranty terms.\n3. All disputes subject to Mumbai jurisdiction only.'}
                </div>
              </div>
            </div>

            {/* Right Column: Financial Summary Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden print:border-gray-400">
              <div className="divide-y divide-white/5 print:divide-gray-300 text-xs">
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Total Market Value:</span>
                  <span className="font-mono text-slate-300 print:text-gray-800">
                    ₹{Number(invoice.market_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2.5 flex justify-between bg-amber-500/[0.03]">
                  <span className="text-amber-400/90 print:text-amber-800 font-medium">Total Discount Savings:</span>
                  <span className="font-mono text-amber-400 print:text-amber-800 font-bold">
                    -₹{Number(invoice.discount_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-300 print:text-black font-medium">Taxable / Subtotal Value:</span>
                  <span className="font-mono text-white print:text-black font-semibold">
                    ₹{Number(invoice.taxable_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                {invoice.tax_type === 'intra_state' ? (
                  <>
                    <div className="p-2.5 flex justify-between">
                      <span className="text-slate-400 print:text-gray-600">Central GST (CGST):</span>
                      <span className="font-mono text-slate-300 print:text-gray-800">
                        ₹{Number(invoice.cgst_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-2.5 flex justify-between">
                      <span className="text-slate-400 print:text-gray-600">State GST (SGST):</span>
                      <span className="font-mono text-slate-300 print:text-gray-800">
                        ₹{Number(invoice.sgst_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-400 print:text-gray-600">Integrated GST (IGST):</span>
                    <span className="font-mono text-slate-300 print:text-gray-800">
                      ₹{Number(invoice.igst_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {invoice.round_off !== 0 && (
                  <div className="p-2.5 flex justify-between text-slate-400 print:text-gray-600">
                    <span>Round Off:</span>
                    <span className="font-mono">
                      {invoice.round_off > 0 ? `+₹${invoice.round_off}` : `-₹${Math.abs(invoice.round_off)}`}
                    </span>
                  </div>
                )}

                <div className="p-3 flex justify-between bg-brand-cyan/10 print:bg-gray-200">
                  <span className="font-bold text-sm text-white print:text-black">Grand Total:</span>
                  <span className="font-mono font-extrabold text-base text-brand-cyan print:text-black">
                    ₹{Number(invoice.grand_total).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 flex justify-between bg-emerald-500/[0.04]">
                  <span className="text-emerald-400 print:text-emerald-800 font-semibold">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-400 print:text-emerald-800">
                    ₹{Number(invoice.amount_paid).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 flex justify-between bg-white/[0.02] border-t border-white/10 print:border-gray-400">
                  <span className="font-bold text-slate-200 print:text-black">Balance Due:</span>
                  <span className="font-mono font-black text-sm text-white print:text-black">
                    ₹{balanceToPay.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Receipts History Table */}
          {(invoice.payments || []).length > 0 && (
            <div className="border-t border-white/10 pt-6 space-y-3 print:border-gray-400">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" /> Recorded Payment History
                </h4>
                <span className="text-[10px] text-slate-400">
                  {invoice.payments?.length} payment transaction(s) recorded
                </span>
              </div>
              
              <div className="border border-white/5 rounded-xl overflow-hidden print:border-gray-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="p-2.5">Receipt #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Reference / UTR</th>
                      <th className="p-2.5">Received By</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                      <th className="p-2.5 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-gray-200">
                    {invoice.payments?.map(pay => (
                      <tr key={pay.id} className={pay.status === 'reversed' ? 'opacity-50 line-through' : ''}>
                        <td className="p-2.5 font-mono text-brand-cyan print:text-black">{pay.payment_number}</td>
                        <td className="p-2.5 text-slate-300 print:text-gray-700">{new Date(pay.payment_date).toLocaleDateString('en-IN')}</td>
                        <td className="p-2.5 text-slate-300 print:text-gray-700">{pay.payment_method}</td>
                        <td className="p-2.5 font-mono text-slate-400 print:text-gray-600">{pay.transaction_reference || '—'}</td>
                        <td className="p-2.5 text-slate-300 print:text-gray-700">{pay.created_by || 'Staff'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400 print:text-emerald-800">
                          ₹{Number(pay.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 text-center print:hidden">
                          {pay.status !== 'reversed' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPaymentForReversal(pay);
                                setShowReversalModal(true);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Reverse Payment"
                            >
                              Reverse
                            </button>
                          ) : (
                            <span className="text-[10px] text-red-400/80 font-semibold">Reversed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Authorized Signature & Official Seal Stamp */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pt-10 border-t border-white/10 print:border-gray-300 print:pt-6 gap-6">
            <div className="text-[10px] text-slate-500 print:text-gray-600 space-y-1 text-center sm:text-left">
              <div className="font-semibold text-slate-400 print:text-gray-700">Tax Invoice & Statutory Declaration:</div>
              <div>This is a computer-generated official commercial tax invoice.</div>
              <div>Certified and authorized by Digi8 Solutions Private Limited.</div>
              <div className="text-[9px] text-slate-600 print:text-gray-500 pt-0.5">
                Issued in accordance with GST Rules & Information Technology Act.
              </div>
            </div>

            {/* Official Company Seal (Stamp) */}
            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-blue-500/70 print:border-blue-900 flex items-center justify-center text-center p-1.5 shadow-[0_0_15px_rgba(59,130,246,0.15)] print:shadow-none -rotate-6 transition-transform hover:rotate-0">
                <div className="w-full h-full rounded-full border border-blue-400 print:border-blue-900 flex flex-col items-center justify-center text-blue-400 print:text-blue-900 bg-blue-500/[0.04] print:bg-transparent">
                  <span className="text-[6.5px] font-black uppercase tracking-wider">DIGI8 SOLUTIONS</span>
                  <span className="text-[5.5px] font-bold text-cyan-400 print:text-blue-800">★ PVT. LTD. ★</span>
                  <div className="my-0.5 px-2 py-0.5 bg-blue-500/20 print:bg-blue-100 rounded text-[7px] font-black tracking-widest text-white print:text-blue-900">
                    SEAL
                  </div>
                  <span className="text-[5.5px] font-bold text-slate-300 print:text-gray-700">VERIFIED</span>
                  <span className="text-[5px] font-semibold text-slate-400 print:text-gray-600">BANGALORE • MUMBAI</span>
                </div>
              </div>
            </div>

            {/* Authorized Signatory & Signature */}
            <div className="text-center sm:text-right space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 print:text-gray-700">
                For <span className="font-bold text-white print:text-black">Digi8 Solutions Private Limited</span>
              </div>
              
              {/* Calligraphic Signature SVG */}
              <div className="h-12 flex items-center justify-center sm:justify-end py-1">
                <svg className="w-36 h-10 text-cyan-400 print:text-blue-900" viewBox="0 0 160 50" fill="none" stroke="currentColor">
                  <path
                    d="M 10 35 C 25 15, 30 45, 45 20 C 55 10, 60 30, 75 22 C 85 16, 95 35, 110 18 C 120 12, 130 28, 145 20"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 25 40 C 65 42, 115 39, 150 35"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="w-44 border-b border-white/20 print:border-black mx-auto sm:ml-auto sm:mr-0 mb-1"></div>
              <div className="text-xs font-bold text-slate-200 print:text-black">Authorized Signatory</div>
              <div className="text-[10px] text-slate-400 print:text-gray-600">Corporate Finance & Accounts Division</div>
            </div>
          </div>

        </div>

      </div>

      {/* Payment Reversal Modal */}
      {showReversalModal && selectedPaymentForReversal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1424] border border-red-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reverse Payment Receipt</h3>
                <p className="text-xs text-slate-400">Payment #{selectedPaymentForReversal.payment_number}</p>
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="font-mono font-bold text-white">₹{Number(selectedPaymentForReversal.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="text-slate-200">{selectedPaymentForReversal.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date:</span>
                <span className="text-slate-200">{selectedPaymentForReversal.payment_date}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Reason for Reversal *</label>
              <textarea
                rows={2}
                value={reversalReason}
                onChange={e => setReversalReason(e.target.value)}
                placeholder="e.g. Cheque bounced / duplicate entry / wrong transaction"
                className="w-full bg-[#070b13] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReversalModal(false);
                  setSelectedPaymentForReversal(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reversalLoading || !reversalReason.trim()}
                onClick={handleConfirmReversal}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {reversalLoading ? 'Reversing...' : 'Confirm Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Email Modal */}
      {showSendEmailModal && (
        <SendInvoiceEmailModal
          invoice={invoice}
          isOpen={showSendEmailModal}
          onClose={() => setShowSendEmailModal(false)}
          onSuccess={() => {
            if (onPaymentReversed) onPaymentReversed();
          }}
        />
      )}

    </div>
  );
}
