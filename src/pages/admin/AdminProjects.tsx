import { useState, useEffect, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { 
  RefreshCw, Star, ExternalLink, DollarSign, TrendingUp, 
  Receipt, CreditCard, Layers, Plus, Search, Filter, 
  ArrowUpRight, Clock, CheckCircle2, ChevronRight, Eye 
} from 'lucide-react';
import type { Project } from '../../lib/api';
import { 
  getProjectsFinancialOverview, 
  ProjectFinancialSummary, 
  Invoice 
} from '../../lib/billingApi';

// Modals
import ProjectFinancialModal from '../../components/admin/billing/ProjectFinancialModal';
import InvoiceCreationModal from '../../components/admin/billing/InvoiceCreationModal';
import InvoiceDetailsModal from '../../components/admin/billing/InvoiceDetailsModal';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [financials, setFinancials] = useState<ProjectFinancialSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedProjectIdForFinancials, setSelectedProjectIdForFinancials] = useState<number | null>(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [selectedProjectIdForInvoice, setSelectedProjectIdForInvoice] = useState<number | null>(null);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<Invoice | null>(null);

  useEffect(() => {
    loadAllProjects();
  }, []);

  const loadAllProjects = async () => {
    setLoading(true);
    try {
      const [sbRes, finRes] = await Promise.all([
        supabase.from('projects').select('*').order('sort_order').order('created_at', { ascending: false }),
        getProjectsFinancialOverview()
      ]);

      if (sbRes?.data) {
        setProjects(sbRes.data as Project[]);
      }
      if (finRes.success && finRes.data) {
        setFinancials(finRes.data);
      }
    } catch (err) {
      console.error('Error loading projects data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string | number | undefined, featured: boolean | undefined) => {
    if (!id) return;
    const nextState = !featured;
    await supabase.from('projects').update({ featured: nextState }).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, featured: nextState } : p));
  };

  // Map financial data onto projects
  const financialMap = useMemo(() => {
    const map = new Map<number | string, ProjectFinancialSummary>();
    financials.forEach(f => {
      map.set(f.id, f);
      if (f.title) map.set(f.title.toLowerCase().trim(), f);
    });
    return map;
  }, [financials]);

  // Combined project data
  const combinedProjects = useMemo(() => {
    return projects.map(p => {
      const fin = financialMap.get(Number(p.id)) || financialMap.get(p.title?.toLowerCase().trim());
      return {
        ...p,
        financial: fin || {
          id: Number(p.id),
          project_code: `PRJ-${String(p.id).padStart(3, '0')}`,
          title: p.title,
          client: p.client,
          category: p.category,
          status: 'in_progress',
          project_value: 0,
          invoiced_amount: 0,
          paid_amount: 0,
          pending_amount: 0,
          expenses_amount: 0,
          gross_profit: 0,
          collected_profit: 0,
          financial_status: 'unbilled',
          invoice_count: 0,
          payment_count: 0,
          expense_count: 0
        }
      };
    });
  }, [projects, financialMap]);

  // Consolidated Portfolio Metrics
  const portfolioMetrics = useMemo(() => {
    const totalProjects = combinedProjects.length;
    const totalValue = combinedProjects.reduce((acc, p) => acc + Number(p.financial.project_value || 0), 0);
    const totalInvoiced = combinedProjects.reduce((acc, p) => acc + Number(p.financial.invoiced_amount || 0), 0);
    const totalPaid = combinedProjects.reduce((acc, p) => acc + Number(p.financial.paid_amount || 0), 0);
    const totalPending = combinedProjects.reduce((acc, p) => acc + Number(p.financial.pending_amount || 0), 0);
    const totalExpenses = combinedProjects.reduce((acc, p) => acc + Number(p.financial.expenses_amount || 0), 0);
    const grossProfit = totalInvoiced - totalExpenses;
    const cashProfit = totalPaid - totalExpenses;

    return {
      totalProjects,
      totalValue,
      totalInvoiced,
      totalPaid,
      totalPending,
      totalExpenses,
      grossProfit,
      cashProfit
    };
  }, [combinedProjects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return combinedProjects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q) || 
        (p.client && p.client.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.financial.project_code.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'billed') return p.financial.invoiced_amount > 0;
      if (statusFilter === 'paid') return p.financial.paid_amount > 0 && p.financial.pending_amount === 0;
      if (statusFilter === 'pending') return p.financial.pending_amount > 0;
      if (statusFilter === 'unbilled') return p.financial.invoiced_amount === 0;
      return true;
    });
  }, [combinedProjects, searchQuery, statusFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sora font-extrabold text-white text-2xl tracking-tight">Project Financial Intelligence</h1>
              <span className="px-2 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold">
                {combinedProjects.length} Active Projects
              </span>
            </div>
            <p className="text-slate-400 text-xs font-inter mt-1">
              End-to-end project financial management: Contract Value → Invoicing → Collections → Costs & Profitability
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllProjects}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setSelectedProjectIdForInvoice(null);
                setShowCreateInvoiceModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
            >
              <Plus size={15} /> Create Project Invoice
            </button>
          </div>
        </div>

        {/* ── FINANCIAL INTELLIGENCE SUMMARY KPI CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Portfolio Value</div>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              ₹{(portfolioMetrics.totalValue / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Estimated contract total</div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 hover:border-brand-cyan/35 transition-all">
            <div className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider">Invoiced Revenue</div>
            <div className="text-xl font-extrabold text-brand-cyan font-mono mt-1">
              ₹{(portfolioMetrics.totalInvoiced / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-brand-cyan/70 mt-1">Active bills generated</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/35 transition-all">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Cash Collected</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
              ₹{(portfolioMetrics.totalPaid / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-emerald-400/70 mt-1">Realized payments</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/35 transition-all">
            <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Pending Dues</div>
            <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">
              ₹{(portfolioMetrics.totalPending / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-rose-400/70 mt-1">Outstanding receivables</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/35 transition-all">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Direct Expenses</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">
              ₹{(portfolioMetrics.totalExpenses / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-amber-400/70 mt-1">Costs & subcontractor</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/25 hover:border-purple-500/40 transition-all">
            <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Gross Profit</div>
            <div className="text-xl font-extrabold text-purple-300 font-mono mt-1">
              ₹{(portfolioMetrics.grossProfit / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-purple-300/70 mt-1">Invoiced - Expenses</div>
          </div>

        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by title, client, category, or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#070b13] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'billed', label: 'Invoiced' },
              { id: 'paid', label: 'Fully Paid' },
              { id: 'pending', label: 'Pending Balance' },
              { id: 'unbilled', label: 'Unbilled' }
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

        </div>

        {/* ── PROJECTS GRID ── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 shimmer border border-white/5" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass rounded-2xl p-16 border border-white/10 text-center text-slate-400 font-inter">
            No projects found matching the filter criteria.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map(project => {
              const fin = project.financial;
              const hasInvoices = fin.invoiced_amount > 0;
              const realizationPct = hasInvoices ? Math.min(100, Math.round((fin.paid_amount / fin.invoiced_amount) * 100)) : 0;

              return (
                <div 
                  key={project.id} 
                  className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-brand-cyan/40 transition-all flex flex-col justify-between group bg-[#090e1a]/80 shadow-lg"
                >
                  <div>
                    {/* Top thumbnail or default gradient */}
                    {project.thumbnail_url ? (
                      <div className="relative h-36 overflow-hidden">
                        <img 
                          src={project.thumbnail_url} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/30 to-transparent" />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFeatured(project.id, project.featured);
                            }}
                            className={`p-1.5 rounded-lg bg-black/60 backdrop-blur-sm transition-colors ${project.featured ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
                            title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <Star size={13} fill={project.featured ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-black/70 border border-white/20 text-brand-cyan font-mono font-bold">
                            {fin.project_code}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-b border-white/5 p-3 flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-mono font-bold">
                          {fin.project_code}
                        </span>
                        <button
                          onClick={() => toggleFeatured(project.id, project.featured)}
                          className={`transition-colors ${project.featured ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                          title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <Star size={14} fill={project.featured ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-sora font-bold text-white text-sm line-clamp-1 group-hover:text-brand-cyan transition-colors">
                            {project.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 font-medium">
                            {project.category || 'General'}
                          </span>
                          {project.client && (
                            <span className="text-[10px] text-slate-400 truncate">
                              Client: <strong className="text-white">{project.client}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Metrics Strip */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Value</div>
                            <div className="text-xs font-bold text-white font-mono mt-0.5">
                              {fin.project_value ? `₹${(fin.project_value / 1000).toFixed(0)}k` : '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-brand-cyan">Invoiced</div>
                            <div className="text-xs font-bold text-brand-cyan font-mono mt-0.5">
                              {hasInvoices ? `₹${(fin.invoiced_amount / 1000).toFixed(0)}k` : '₹0'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-emerald-400">Paid</div>
                            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                              {fin.paid_amount ? `₹${(fin.paid_amount / 1000).toFixed(0)}k` : '₹0'}
                            </div>
                          </div>
                        </div>

                        {/* Realization Progress */}
                        {hasInvoices && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Realized</span>
                              <span className="font-mono text-emerald-400">{realizationPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                              <div style={{ width: `${realizationPct}%` }} className="bg-emerald-500 h-full" />
                              <div style={{ width: `${100 - realizationPct}%` }} className="bg-rose-500 h-full" />
                            </div>
                          </div>
                        )}

                        {/* Outstanding & Profit Row */}
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                          <span className="text-slate-400">
                            Pending: <strong className={fin.pending_amount > 0 ? "text-rose-400 font-mono" : "text-slate-400 font-mono"}>
                              ₹{Number(fin.pending_amount).toLocaleString('en-IN')}
                            </strong>
                          </span>
                          <span className="text-slate-400">
                            Profit: <strong className="text-purple-300 font-mono">
                              ₹{Number(fin.gross_profit).toLocaleString('en-IN')}
                            </strong>
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-white/[0.01] border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                    {project.live_url && project.live_url !== '#' ? (
                      <a 
                        href={project.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Live Site"
                      >
                        <ExternalLink size={13} />
                      </a>
                    ) : <div />}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedProjectIdForInvoice(Number(project.id));
                          setShowCreateInvoiceModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                        title="New Invoice"
                      >
                        <Plus size={12} /> Invoice
                      </button>

                      <button
                        onClick={() => setSelectedProjectIdForFinancials(Number(project.id))}
                        className="px-3 py-1.5 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan hover:text-black text-brand-cyan text-[11px] font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                      >
                        <span>Financials</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── MODALS ── */}

      {/* Project Financial Detail Modal */}
      {selectedProjectIdForFinancials && (
        <ProjectFinancialModal
          projectId={selectedProjectIdForFinancials}
          isOpen={!!selectedProjectIdForFinancials}
          onClose={() => setSelectedProjectIdForFinancials(null)}
          onViewInvoice={(inv) => setSelectedInvoiceForDetails(inv)}
          onCreateInvoice={(pId) => {
            setSelectedProjectIdForInvoice(pId);
            setShowCreateInvoiceModal(true);
          }}
        />
      )}

      {/* Invoice Creation Modal */}
      {showCreateInvoiceModal && (
        <InvoiceCreationModal
          isOpen={showCreateInvoiceModal}
          initialProjectId={selectedProjectIdForInvoice || undefined}
          onClose={() => {
            setShowCreateInvoiceModal(false);
            setSelectedProjectIdForInvoice(null);
          }}
          onSuccess={() => {
            loadAllProjects();
            setShowCreateInvoiceModal(false);
            setSelectedProjectIdForInvoice(null);
          }}
        />
      )}

      {/* Invoice Details & Print Modal */}
      {selectedInvoiceForDetails && (
        <InvoiceDetailsModal
          invoice={selectedInvoiceForDetails}
          isOpen={!!selectedInvoiceForDetails}
          onClose={() => setSelectedInvoiceForDetails(null)}
        />
      )}

    </AdminLayout>
  );
}
