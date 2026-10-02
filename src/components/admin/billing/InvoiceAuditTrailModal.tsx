import { X, History, User, Clock, ShieldCheck } from 'lucide-react';
import { Invoice, InvoiceAuditLog } from '../../../lib/billingApi';

interface InvoiceAuditTrailModalProps {
  invoice: Invoice;
  logs: InvoiceAuditLog[];
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceAuditTrailModal({
  invoice,
  logs,
  isOpen,
  onClose
}: InvoiceAuditTrailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <History size={16} />
            </div>
            <div>
              <h3 className="text-sm font-outfit font-bold text-white">Invoice Audit & Security Trail</h3>
              <p className="text-[11px] text-slate-400 font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pb-2 border-b border-white/5">
            <ShieldCheck size={14} className="text-brand-cyan" />
            <span>Immutable timestamped ledger of all state changes for this invoice.</span>
          </div>

          {logs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No audit records registered yet for this invoice.
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {logs.map((log, index) => (
                <div key={log.id || index} className="relative group">
                  {/* Indicator bullet */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#0e1424] border-2 border-brand-cyan flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.4)]" />
                  
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-brand-cyan font-mono">{log.action}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-white text-xs">{log.new_value}</div>

                    {log.old_value && log.old_value !== 'None' && (
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Previous:</span> {log.old_value}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User size={11} /> {log.performed_by || 'System'}
                      </span>
                      {log.ip_address && (
                        <span>• IP: {log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/10 bg-slate-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
