import { useState } from 'react';
import { X, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { Invoice, recordInvoicePayment } from '../../../lib/billingApi';

interface RecordPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedData: any) => void;
}

export default function RecordPaymentModal({
  invoice,
  isOpen,
  onClose,
  onSuccess
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<number>(Number(invoice.balance_amount) || 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Razorpay' | 'Cheque' | 'Other'>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount <= 0) {
      setErrorMessage('Please enter an amount greater than zero.');
      return;
    }

    if (amount > Number(invoice.balance_amount) + 0.01) {
      setErrorMessage(`Payment cannot exceed the outstanding balance of ₹${Number(invoice.balance_amount).toLocaleString('en-IN')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordInvoicePayment(invoice.id, {
        amount,
        payment_method: paymentMethod,
        transaction_reference: transactionRef,
        payment_date: paymentDate,
        notes
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to record payment.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign size={16} />
            </div>
            <div>
              <h3 className="text-sm font-outfit font-bold text-white">Record Invoice Payment</h3>
              <p className="text-[11px] text-slate-400 font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Balance card */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">Outstanding Balance</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                ₹{Number(invoice.balance_amount).toLocaleString('en-IN')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAmount(Number(invoice.balance_amount))}
              className="text-[11px] text-brand-cyan hover:underline font-semibold"
            >
              Pay Full Balance
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Amount to Record (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={invoice.balance_amount}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-[#070b13] border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-white font-bold font-mono focus:border-emerald-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as any)}
              className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="UPI">UPI / QR Code</option>
              <option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
              <option value="Cash">Cash</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Razorpay">Razorpay Payment Link</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Transaction Ref / UTR / Cheque No.</label>
            <input
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              placeholder="e.g. UTR-9821820192"
              className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-cyan focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Payment Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes or confirmation memo"
              className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
