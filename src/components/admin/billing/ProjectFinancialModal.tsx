import { useState, useEffect } from 'react';
import { 
  X, DollarSign, TrendingUp, Receipt, CreditCard, 
  Plus, Calendar, AlertCircle, CheckCircle2, Eye, 
  ArrowUpRight, ArrowDownRight, Tag, User, Layers, RefreshCw
} from 'lucide-react';
import { 
  getProjectFinancials, 
  addProjectExpense, 
  ProjectFinancialDetail, 
  Invoice, 
  PaymentRecord, 
  ProjectExpense 
} from '../../../lib/billingApi';

interface ProjectFinancialModalProps {
  projectId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onCreateInvoice?: (projectId: number) => void;
}

export default function ProjectFinancialModal({
  projectId,
  isOpen,
  onClose,
  onViewInvoice,
  onCreateInvoice
}: ProjectFinancialModalProps) {
  const [data, setData] = useState<ProjectFinancialDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'expenses'>('overview');

  // New Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Software / Subscriptions');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState('');
  const [expenseErrMsg, setExpenseErrMsg] = useState('');

  useEffect(() => {
    if (isOpen && projectId) {
      loadData();
    }
  }, [isOpen, projectId]);

  const loadData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getProjectFinancials(projectId);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load project financials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    if (!expenseTitle.trim() || !expenseAmount || Number(expenseAmount) <= 0) {
      setExpenseErrMsg('Please enter a valid title and positive amount.');
      return;
    }

    setIsSubmittingExpense(true);
    setExpenseErrMsg('');
    setExpenseSuccessMsg('');

    try {
      const res = await addProjectExpense(projectId, {
        title: expenseTitle.trim(),
        category: expenseCategory,
        amount: Number(expenseAmount),
        expense_date: expenseDate,
        vendor: expenseVendor.trim() || undefined,
        notes: expenseNotes.trim() || undefined
      });

      if (res.success) {
        setExpenseSuccessMsg('Project expense recorded successfully!');
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseVendor('');
        setExpenseNotes('');
        setShowExpenseForm(false);
        await loadData();
        setTimeout(() => setExpenseSuccessMsg(''), 3000);
      } else {
        setExpenseErrMsg(res.error || 'Failed to record expense.');
      }
    } catch (err: any) {
      setExpenseErrMsg(err.message || 'Server error.');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  if (!isOpen) return null;

  const project = data?.project;
  const summary = data?.summary;
  const invoices = data?.invoices || [];
  const payments = data?.payments || [];
  const expenses = data?.expenses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b101d] border border-white/15 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <DollarSign size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-outfit font-bold text-white">
                  {project?.title || 'Project Financial Intelligence'}
                </h3>
                {project?.project_code && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono font-bold">
                    {project.project_code}
                  </span>
                )}
                {project?.status && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold uppercase">
                    {project.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Client: <span className="text-white font-medium">{project?.client || 'Internal / N/A'}</span> • Category: <span className="text-white font-medium">{project?.category || 'General'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/40 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={14} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Receipt size={14} /> Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard size={14} /> Payments ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'expenses'
                  ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={14} /> Project Expenses ({expenses.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onCreateInvoice && projectId && (
              <button
                onClick={() => {
                  onClose();
                  onCreateInvoice(projectId);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-cyan hover:text-black text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> Create Invoice
              </button>
            )}
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Expense
            </button>
          </div>
        </div>

        {/* Expense Alert Messages */}
        {expenseSuccessMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} /> <span>{expenseSuccessMsg}</span>
          </div>
        )}
        {expenseErrMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} /> <span>{expenseErrMsg}</span>
          </div>
        )}

        {/* Inline Add Expense Form Drawer */}
        {showExpenseForm && (
          <form onSubmit={handleAddExpense} className="mx-5 mt-4 p-4 rounded-xl bg-white/[0.03] border border-rose-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Layers size={15} className="text-rose-400" /> Record Project Cost / Direct Expense
              </h4>
              <button type="button" onClick={() => setShowExpenseForm(false)} className="text-slate-400 hover:text-white">
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-300 block mb-1">Expense Description / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Cloud Infrastructure, Freelancer UI Design"
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Software / Subscriptions">Software / Subscriptions</option>
                  <option value="Hosting / Server / Cloud">Hosting / Server / Cloud</option>
                  <option value="External Subcontractor">External Subcontractor</option>
                  <option value="Domain / SSL / Third Party">Domain / SSL / Third Party</option>
                  <option value="Hardware / Device">Hardware / Device</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="25000"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="AWS, GoDaddy, Freelancer..."
                  value={expenseVendor}
                  onChange={e => setExpenseVendor(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-300 block mb-1">Notes / Bill Reference</label>
                <input
                  type="text"
                  placeholder="Invoice ref or additional context"
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all disabled:opacity-50"
              >
                {isSubmittingExpense ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Financial KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Value</div>
                  <div className="text-lg font-extrabold text-white font-mono mt-1">
                    ₹{Number(summary?.project_value || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Contract / Scope</div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20">
                  <div className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider">Invoiced Revenue</div>
                  <div className="text-lg font-extrabold text-brand-cyan font-mono mt-1">
                    ₹{Number(summary?.invoiced_amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-brand-cyan/70 mt-1">Issued bills</div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Collected / Paid</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono mt-1">
                    ₹{Number(summary?.paid_amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-400/70 mt-1">Cash received</div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Pending Dues</div>
                  <div className="text-lg font-extrabold text-rose-400 font-mono mt-1">
                    ₹{Number(summary?.pending_amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-rose-400/70 mt-1">Unpaid balance</div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Expenses / Costs</div>
                  <div className="text-lg font-extrabold text-amber-400 font-mono mt-1">
                    {summary?.has_expenses ? `₹${Number(summary.expenses_amount).toLocaleString('en-IN')}` : '₹0'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {summary?.has_expenses ? `${expenses.length} bills recorded` : 'Expenses Not Recorded'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Gross Profit</div>
                  <div className="text-lg font-extrabold text-purple-300 font-mono mt-1">
                    {summary?.has_expenses 
                      ? `₹${Number(summary.gross_profit).toLocaleString('en-IN')}`
                      : `₹${Number(summary?.invoiced_amount || 0).toLocaleString('en-IN')}*`}
                  </div>
                  <div className="text-[10px] text-purple-300/70 mt-1">
                    {summary?.has_expenses ? 'Invoiced - Expenses' : '*Expenses 0'}
                  </div>
                </div>
              </div>

              {/* Progress & Financial Health Visualizer */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Billing & Collection Realization</span>
                  <span className="font-mono text-slate-400">
                    {summary?.invoiced_amount ? Math.round((summary.paid_amount / summary.invoiced_amount) * 100) : 0}% Realized
                  </span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${summary?.invoiced_amount ? Math.min(100, (summary.paid_amount / summary.invoiced_amount) * 100) : 0}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Collected: ₹${summary?.paid_amount || 0}`}
                  />
                  <div 
                    style={{ width: `${summary?.invoiced_amount ? Math.min(100, (summary.pending_amount / summary.invoiced_amount) * 100) : 0}%` }}
                    className="bg-rose-500 h-full transition-all"
                    title={`Pending: ₹${summary?.pending_amount || 0}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Collected Cash: <strong className="text-emerald-400 font-mono">₹{Number(summary?.paid_amount || 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Pending Receivables: <strong className="text-rose-400 font-mono">₹{Number(summary?.pending_amount || 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Realized Profit (Cash - Cost): <strong className="text-purple-300 font-mono">₹{Number(summary?.collected_profit || 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
              </div>

              {/* Quick Table: Recent Invoices & Recent Expenses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Recent Invoices Preview */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt size={14} className="text-brand-cyan" /> Recent Invoices
                    </h4>
                    <button onClick={() => setActiveTab('invoices')} className="text-[11px] text-brand-cyan hover:underline">
                      View all ({invoices.length})
                    </button>
                  </div>
                  {invoices.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No invoices issued for this project yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.slice(0, 3).map(inv => (
                        <div key={inv.id} className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold font-mono text-white">{inv.invoice_number}</div>
                            <div className="text-[10px] text-slate-400">{inv.invoice_date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-white">₹{Number(inv.grand_total).toLocaleString('en-IN')}</div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              inv.invoice_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                              inv.invoice_status === 'partially_paid' ? 'bg-amber-500/20 text-amber-400' :
                              inv.invoice_status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {inv.invoice_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Expenses Preview */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-rose-400" /> Recent Expenses & Costs
                    </h4>
                    <button onClick={() => setActiveTab('expenses')} className="text-[11px] text-rose-400 hover:underline">
                      View all ({expenses.length})
                    </button>
                  </div>
                  {expenses.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No expenses recorded yet. Click "Add Expense" to track costs.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {expenses.slice(0, 3).map(exp => (
                        <div key={exp.id} className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{exp.title}</div>
                            <div className="text-[10px] text-slate-400">{exp.category} • {exp.expense_date}</div>
                          </div>
                          <div className="text-right font-mono font-bold text-rose-400">
                            -₹{Number(exp.amount).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INVOICES LIST */}
          {activeTab === 'invoices' && (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                      <th className="p-3">Invoice Number</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Grand Total</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Balance Due</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No invoices have been linked to this project yet.
                        </td>
                      </tr>
                    ) : (
                      invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-mono font-bold text-white">{inv.invoice_number}</td>
                          <td className="p-3 text-slate-300">{inv.invoice_date}</td>
                          <td className="p-3 text-right font-mono font-bold text-white">₹{Number(inv.grand_total).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-400">₹{Number(inv.amount_paid).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-400">₹{Number(inv.balance_amount).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              inv.invoice_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              inv.invoice_status === 'partially_paid' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              inv.invoice_status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {inv.invoice_status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {onViewInvoice && (
                              <button
                                onClick={() => onViewInvoice(inv)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-cyan/20 text-slate-300 hover:text-brand-cyan transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS HISTORY */}
          {activeTab === 'payments' && (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                      <th className="p-3">Payment Date</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Reference / UTR</th>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">Received By</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No payment transactions recorded for this project yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 text-slate-300">{pay.payment_date?.split('T')[0]}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">₹{Number(pay.amount).toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-semibold uppercase">
                              {pay.payment_method}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">{pay.transaction_reference || 'N/A'}</td>
                          <td className="p-3 font-mono text-brand-cyan">#{pay.invoice_id}</td>
                          <td className="p-3 text-slate-300">{pay.received_by_name || 'Admin Staff'}</td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              pay.payment_status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {pay.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSES & COSTS */}
          {activeTab === 'expenses' && (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                      <th className="p-3">Date</th>
                      <th className="p-3">Expense Title / Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Vendor / Payee</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                      <th className="p-3">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No direct costs or expenses recorded for this project yet. Use "Add Expense" above to record hosting, API, freelancer, or hardware costs.
                        </td>
                      </tr>
                    ) : (
                      expenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 text-slate-300">{exp.expense_date}</td>
                          <td className="p-3 font-medium text-white">{exp.title}</td>
                          <td className="p-3 text-slate-400">{exp.category}</td>
                          <td className="p-3 text-slate-400">{exp.vendor || '—'}</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-400">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-400">{exp.created_by || 'Staff'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-900/60 shrink-0 text-xs">
          <div className="text-slate-400">
            Accounting Treatment: <span className="text-white font-medium">Accrual Billed vs Realized Cash</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
