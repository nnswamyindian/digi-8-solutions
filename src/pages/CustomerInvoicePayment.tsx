import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Printer,
  Copy,
  Check,
  Building2,
  FileText,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  Invoice,
  PaymentRecord,
  getPublicInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  downloadInvoicePdf
} from '../lib/billingApi';

// Helper to dynamically load Razorpay Checkout JS SDK
function loadRazorpaySdk(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CustomerInvoicePayment() {
  const { invoiceNumber, id, '*': wildcard } = useParams<any>();
  const [searchParams] = useSearchParams();
  const queryInv = searchParams.get('inv') || searchParams.get('id') || searchParams.get('number') || searchParams.get('invoice');
  const lookupKey = (queryInv || invoiceNumber || wildcard || id || '').trim();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [razorpayConfig, setRazorpayConfig] = useState<{
    enabled: boolean;
    key_id: string;
    primary_payment: boolean;
  }>({
    enabled: true,
    key_id: '',
    primary_payment: true
  });
  const [error, setError] = useState<string>('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string>('');

  // Payment controls
  const [payMode, setPayMode] = useState<'full' | 'partial'>('full');
  const [customPayAmount, setCustomPayAmount] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Dynamic QR Code state
  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const pollIntervalRef = useRef<any>(null);

  const fetchInvoiceData = async (isBackground = false) => {
    if (!lookupKey) return;
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getPublicInvoice(lookupKey);
      if (res.success && res.data) {
        setInvoice(res.data);
        if (res.razorpay_config) {
          setRazorpayConfig(res.razorpay_config);
        }
        setError('');
      } else {
        if (!invoice) {
          setError(res.error || 'Invoice not found or invalid reference number.');
        }
      }
    } catch (err: any) {
      if (!invoice) setError(err.message || 'Error connecting to billing server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();

    // Auto-poll every 10 seconds to detect incoming webhook reconciliations in real-time
    pollIntervalRef.current = setInterval(() => {
      fetchInvoiceData(true);
    }, 10000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [lookupKey]);

  // Outstanding calculations
  const grandTotal = Number(invoice?.grand_total || 0);
  const totalPaid = Number(invoice?.amount_paid || 0);
  const balanceOutstanding = Math.max(0, Number(invoice?.balance_amount ?? grandTotal - totalPaid));
  const isPaid = balanceOutstanding <= 0 || invoice?.payment_status === 'paid';

  // Amount that will be paid in this session
  const activePayAmount = (() => {
    if (payMode === 'full') return balanceOutstanding;
    const parsed = parseFloat(customPayAmount);
    if (isNaN(parsed) || parsed <= 0) return balanceOutstanding;
    return Math.min(balanceOutstanding, parsed);
  })();

  // Generate UPI QR Code dynamically based on outstanding amount
  useEffect(() => {
    if (!invoice) return;
    const upiId = 'digi8solutions@hdfcbank';
    const payeeName = 'Digi8 Solutions Private Limited';
    const amountToRequest = (activePayAmount > 0 ? activePayAmount : balanceOutstanding).toFixed(2);
    const invoiceRef = invoice.invoice_number || 'INV';
    const note = `Invoice ${invoiceRef}`;

    const upiPayIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amountToRequest}&cu=INR&tn=${encodeURIComponent(note)}`;

    QRCode.toString(upiPayIntent, {
      type: 'svg',
      width: 180,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.warn('QR SVG generation error:', err));

    QRCode.toDataURL(upiPayIntent, {
      width: 240,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR URL generation error:', err));
  }, [invoice, activePayAmount, balanceOutstanding]);

  // Initiate Razorpay Checkout Flow
  const handlePayOnline = async () => {
    if (!invoice || isPaid || activePayAmount <= 0) return;

    setIsProcessingPayment(true);
    setError('');
    setPaymentSuccessMsg('');

    try {
      const sdkReady = await loadRazorpaySdk();
      if (!sdkReady) {
        throw new Error('Could not load Razorpay payment engine. Please check your internet connection.');
      }

      // Step 1: Request server to create Razorpay Order for current outstanding amount
      const orderRes = await createRazorpayOrder(invoice.id, activePayAmount);
      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.error || 'Failed to initialize payment order on server.');
      }

      const { order, keyId } = orderRes;
      const effectiveKey = keyId || razorpayConfig.key_id;

      // Step 2: Open Razorpay Standard Checkout Modal
      const options = {
        key: effectiveKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Digi8 Solutions Private Limited',
        description: `Invoice ${invoice.invoice_number} Payment`,
        image: '/images/logo.png',
        order_id: order.id,
        prefill: {
          name: invoice.customer_name || '',
          email: invoice.customer_email || '',
          contact: invoice.customer_mobile || ''
        },
        notes: {
          invoice_id: String(invoice.id),
          invoice_number: invoice.invoice_number,
          payment_type: 'invoice_settlement'
        },
        theme: {
          color: '#00c2cb' // Brand cyan
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          setIsProcessingPayment(true);
          try {
            // Step 3: Verify payment signature and reconcile invoice on server
            const verifyRes = await verifyRazorpayPayment(invoice.id, {
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: activePayAmount
            });

            if (verifyRes.success) {
              setPaymentSuccessMsg(
                `Payment of ₹${activePayAmount.toLocaleString('en-IN')} confirmed successfully! Payment ID: ${response.razorpay_payment_id}`
              );
              // Refresh invoice immediately
              await fetchInvoiceData(true);
            } else {
              setError(
                verifyRes.error ||
                  'Payment was processed by Razorpay, but invoice verification is pending. Our system will reconcile it shortly.'
              );
              await fetchInvoiceData(true);
            }
          } catch (verErr: any) {
            setError(verErr.message || 'Error verifying payment with server.');
          } finally {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (failRes: any) => {
        setIsProcessingPayment(false);
        const desc = failRes?.error?.description || 'Transaction was cancelled or declined by your bank.';
        setError(`Payment Failed: ${desc}`);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'An error occurred while launching Razorpay payment.');
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setIsDownloadingPdf(true);
    try {
      const res = await downloadInvoicePdf(invoice.id, invoice.invoice_number);
      if (!res.success) {
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-cyan/20 border-t-brand-cyan animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white font-outfit">Loading Digi8 Invoice...</h3>
        <p className="text-sm text-slate-400 mt-1">Retrieving official invoice & payment status</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white font-outfit">Invoice Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">{error}</p>
        <Link
          to="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-brand-cyan text-brand-dark font-bold text-sm hover:brightness-110 transition-all inline-flex items-center gap-2"
        >
          Return to Digi8 Home
        </Link>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
              D8
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white font-outfit">DIGI8 SOLUTIONS</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-brand-cyan border border-cyan-500/20">
                  Verified Invoice
                </span>
              </div>
              <p className="text-xs text-slate-400">Enterprise Digital & Technology Infrastructure</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => fetchInvoiceData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1.5 transition-all"
              title="Refresh Payment Status"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-brand-cyan' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1.5 transition-all"
              title="Copy Direct Payment Link"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1.5 transition-all"
              title="Download PDF"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{isDownloadingPdf ? 'Downloading...' : 'PDF'}</span>
            </button>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {paymentSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 animate-fade-in shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <div className="font-bold text-sm text-emerald-200">Payment Processed Successfully!</div>
              <div className="text-xs text-emerald-300/90 mt-0.5">{paymentSuccessMsg}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 flex items-start gap-3 animate-fade-in">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-400" />
            <div>
              <div className="font-bold text-sm text-red-200">Transaction Notice</div>
              <div className="text-xs text-red-300/90 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Payment Summary & Dynamic Action Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#10172c] via-[#0b101f] to-[#070b13] border border-white/15 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="text-xs font-mono text-brand-cyan uppercase tracking-wider font-semibold">
                Invoice Reference
              </div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {invoice.invoice_number}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Issued to: <strong className="text-slate-200">{invoice.customer_name}</strong>
                {invoice.customer_company && <span> ({invoice.customer_company})</span>}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-start sm:items-end gap-1">
              {isPaid ? (
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>PAID</span>
                </div>
              ) : totalPaid > 0 ? (
                <div className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-sm flex items-center gap-2">
                  <Clock size={16} />
                  <span>PARTIALLY PAID</span>
                </div>
              ) : (
                <div className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-brand-cyan border border-brand-cyan/40 font-bold text-sm flex items-center gap-2">
                  <Clock size={16} />
                  <span>UNPAID</span>
                </div>
              )}
              <div className="text-[11px] text-slate-400">
                Date: {new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Three-Metric Display: Total, Paid, Pending */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Invoice Grand Total</div>
              <div className="text-2xl font-bold font-mono text-white">
                ₹{grandTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500">Gross invoice obligation</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-1">
              <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Total Paid</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                ₹{totalPaid.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-500/80">
                {invoice.payments?.length || 0} transaction(s) recorded
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/[0.05] border border-brand-cyan/30 space-y-1">
              <div className="text-xs text-brand-cyan uppercase tracking-wider font-semibold">
                Amount Payable / Pending
              </div>
              <div className="text-2xl font-extrabold font-mono text-brand-cyan">
                ₹{balanceOutstanding.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400">Outstanding balance remaining</div>
            </div>
          </div>

          {/* Payment Action Box */}
          <div className="pt-2">
            {isPaid ? (
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit">This invoice is fully settled</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Thank you! No further payments are required. You can print or download the official receipt.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download size={14} /> Download Receipt PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <Printer size={14} /> Print Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Partial Payment Toggle */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-300 font-medium">Select Payment Amount:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300">
                      <input
                        type="radio"
                        name="payMode"
                        checked={payMode === 'full'}
                        onChange={() => setPayMode('full')}
                        className="accent-brand-cyan"
                      />
                      <span>Pay Full Outstanding (₹{balanceOutstanding.toLocaleString('en-IN')})</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300">
                      <input
                        type="radio"
                        name="payMode"
                        checked={payMode === 'partial'}
                        onChange={() => setPayMode('partial')}
                        className="accent-brand-cyan"
                      />
                      <span>Pay Partial Amount</span>
                    </label>
                  </div>
                </div>

                {payMode === 'partial' && (
                  <div className="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in">
                    <div className="flex-1">
                      <label className="text-xs text-brand-cyan font-bold block mb-1">
                        Enter Partial Amount to Pay (₹):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={balanceOutstanding}
                        value={customPayAmount}
                        onChange={(e) => setCustomPayAmount(e.target.value)}
                        placeholder={`Max ₹${balanceOutstanding}`}
                        className="w-full bg-[#070b13] border border-brand-cyan/40 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 sm:max-w-xs">
                      The remaining balance of ₹
                      {Math.max(0, balanceOutstanding - (parseFloat(customPayAmount) || 0)).toLocaleString(
                        'en-IN'
                      )}{' '}
                      will stay on the invoice for future payments.
                    </div>
                  </div>
                )}

                {/* Primary Payment Actions: Pay Online via Razorpay & Scan & Pay */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Razorpay Online Payment */}
                  <button
                    onClick={handlePayOnline}
                    disabled={isProcessingPayment || activePayAmount <= 0}
                    className="p-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-brand-dark font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isProcessingPayment ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <CreditCard size={18} className="text-brand-dark" />
                    )}
                    <span>
                      {isProcessingPayment
                        ? 'Connecting Gateway...'
                        : `Pay ₹${activePayAmount.toLocaleString('en-IN')} Online`}
                    </span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Option 2: Scan & Pay with UPI */}
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/15 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <QrCode size={18} className="text-brand-cyan" />
                    <span>Scan & Pay with UPI QR</span>
                  </button>
                </div>

                {/* Trust and Supported Gateways */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>256-bit Encrypted Checkout powered by Razorpay</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span>UPI</span>
                    <span>•</span>
                    <span>Cards (Visa / Master / RuPay)</span>
                    <span>•</span>
                    <span>Net Banking</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Line Items Summary */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-brand-cyan" /> Invoice Item Details
          </h3>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-center">Tax</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {invoice.items?.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{item.item_name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      ₹{Number(item.selling_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-400">
                      {Number(item.tax_percentage)}%
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ₹{Number(item.line_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History Table (Requirement 13 & 3) */}
        {(invoice.payments || []).length > 0 && (
          <div className="p-6 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" /> Recorded Payment History
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {invoice.payments?.length} payment receipt(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="p-3">Receipt / Ref</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoice.payments?.map((pay) => (
                    <tr key={pay.id}>
                      <td className="p-3 font-mono text-brand-cyan">
                        {pay.razorpay_payment_id || pay.payment_number || '—'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {new Date(pay.payment_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{pay.payment_method}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {pay.status || 'SUCCESS'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        ₹{Number(pay.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Dynamic UPI QR Code Scan & Pay */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0e1424] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode size={16} className="text-brand-cyan" /> Scan & Pay via UPI
                </div>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="bg-white p-3 rounded-2xl shadow-xl inline-block mx-auto border border-white/20">
                {qrSvg ? (
                  <div
                    className="w-44 h-44 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : qrDataUrl ? (
                  <img src={qrDataUrl} alt="UPI QR Code" className="w-44 h-44 object-contain" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-500 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-slate-400">Pay Outstanding Amount:</div>
                <div className="text-2xl font-black font-mono text-brand-cyan mt-0.5">
                  ₹{activePayAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Open GPay, PhonePe, Paytm, or any UPI App and scan to settle instantly.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
