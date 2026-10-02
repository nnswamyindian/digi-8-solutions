import { useState } from 'react';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { Invoice, cancelInvoice } from '../../../lib/billingApi';

interface CancelInvoiceModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelInvoiceModal({
  invoice,
  isOpen,
  onClose,
  onSuccess
}: CancelInvoiceModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reason.trim()) {
      setErrorMessage('Please state the business reason for invoice cancellation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await cancelInvoice(invoice.id, reason.trim());
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to cancel invoice.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Ban size={16} />
            </div>
            <div>
              <h3 className="text-sm font-outfit font-bold text-white">Cancel Commercial Invoice</h3>
              <p className="text-[11px] text-slate-400 font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCancel} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-slate-300 text-xs space-y-1">
            <div className="font-semibold text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={13} /> Strict Statutory & Audit Compliance
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Finalized invoices cannot be physically deleted from the database. This action marks the invoice as <strong>Cancelled</strong>, preserves the audit trail, and zeroes out the revenue metrics.
            </p>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Cancellation Reason *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Order cancelled by client prior to hardware dispatch / Revision required"
              className="w-full bg-[#070b13] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-400 focus:outline-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              <Ban size={14} />
              {isSubmitting ? 'Cancelling...' : 'Confirm Invoice Cancellation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
