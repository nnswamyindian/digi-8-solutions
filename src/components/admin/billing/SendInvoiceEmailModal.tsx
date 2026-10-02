import { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, FileText, Paperclip, Loader2 } from 'lucide-react';
import { Invoice, sendInvoiceEmail } from '../../../lib/billingApi';

interface SendInvoiceEmailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendInvoiceEmailModal({
  invoice,
  isOpen,
  onClose,
  onSuccess
}: SendInvoiceEmailModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (invoice && isOpen) {
      setRecipientEmail(invoice.customer_email || '');
      setSubject(`Invoice ${invoice.invoice_number} from Digi8 Solutions — Total: ₹${Number(invoice.grand_total || 0).toLocaleString('en-IN')}`);
      setMessage(`Dear ${invoice.customer_name || 'Client'},\n\nPlease find attached the official copy of your tax invoice #${invoice.invoice_number}. Let us know if you have any questions.\n\nThank you,\nDigi8 Solutions Finance Team`);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setErrorMsg('Please enter a valid recipient email address.');
      return;
    }

    setIsSending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await sendInvoiceEmail(invoice.id, {
        recipient_email: recipientEmail.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.success) {
        setSuccessMsg(res.message || `Invoice successfully sent to ${recipientEmail} with PDF attached!`);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending email.');
    } finally {
      setIsSending(false);
    }
  };

  const safeFilename = `Invoice-${String(invoice.invoice_number).replace(/[\/\\]/g, '_')}.pdf`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b101d] border border-brand-cyan/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <Mail size={16} />
            </div>
            <div>
              <h3 className="text-sm font-outfit font-bold text-white">Send Invoice by Email</h3>
              <p className="text-[11px] text-slate-400">Dispatch official tax invoice with generated PDF attachment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Invoice Summary Pill */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-mono font-bold text-white text-xs">{invoice.invoice_number}</div>
              <div className="text-[10px] text-slate-400">Billed to: <span className="text-slate-200">{invoice.customer_name}</span></div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-brand-cyan text-xs">₹{Number(invoice.grand_total).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400">Balance: <span className="text-rose-400 font-mono">₹{Number(invoice.balance_amount).toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          {/* Recipient Email Field */}
          <div>
            <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
              Recipient Email Address *
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="customer@company.com or lead@example.com"
              className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-cyan font-mono"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              You can confirm or modify the recipient email address above before dispatching.
            </span>
          </div>

          {/* Subject Field */}
          <div>
            <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
              Cover Note / Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-[#070b13] border border-white/10 rounded-lg p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-brand-cyan"
            />
          </div>

          {/* Attachment Indicator */}
          <div className="p-2.5 rounded-lg bg-cyan-500/5 border border-brand-cyan/20 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Paperclip size={14} className="text-brand-cyan" />
              <span className="font-mono text-[11px] text-brand-cyan">{safeFilename}</span>
            </div>
            <span className="text-[10px] text-slate-400">Auto-Attached PDF</span>
          </div>

          {/* Actions */}
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
              disabled={isSending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Dispatching Email & PDF...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Invoice Email</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
