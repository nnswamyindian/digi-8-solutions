import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, RefreshCw, Filter, Briefcase, UserCheck, Calendar,
  Mail, BarChart2, Ticket, ArrowRight, Sparkles, ChevronRight, Plus, Eye, Database,
  Receipt, DollarSign, TrendingUp, Layers, CheckCircle2, Clock, AlertTriangle, CreditCard
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchCareersStats,
  fetchCareerApplications,
  fetchDatabaseStatus,
  type CareerStats,
  type JobApplication
} from '../../lib/api';
import {
  getFinancialDashboard,
  FinancialDashboardData
} from '../../lib/billingApi';

type Stats = { leads: number; quotes: number; contacts: number; testimonials: number };

// Dummy data to show UI since backend might be empty initially
const dummyLeads = [
  { id: '1', name: 'John Doe', email: 'john@example.com', service: 'Technology & Digital Infrastructure', status: 'new', created_at: new Date().toISOString() },
  { id: '2', name: 'Alice Smith', email: 'alice@example.com', service: 'Branding & Business Identity Solutions', status: 'contacted', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', service: 'Digital Marketing & Business Growth', status: 'converted', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', name: 'Eve Davis', email: 'eve@example.com', service: 'Technology & Digital Infrastructure', status: 'new', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', service: 'Cyber Security & Cloud Infrastructure', status: 'contacted', created_at: new Date(Date.now() - 345600000).toISOString() },
];

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState<string>('Super Admin');
  const [stats] = useState<Stats>({ leads: 5, quotes: 12, contacts: 8, testimonials: 4 });
  const [careerStats, setCareerStats] = useState<CareerStats>({
    activeJobs: 0,
    draftJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });
  const [leads, setLeads] = useState<any[]>(dummyLeads);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStage, setFilterStage] = useState<string>('All');

  // ── Financial Intelligence & Telemetry State ──
  const [finPeriod, setFinPeriod] = useState<string>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [financialData, setFinancialData] = useState<FinancialDashboardData | null>(null);
  const [finLoading, setFinLoading] = useState(false);
  const [finReportTab, setFinReportTab] = useState<'day_wise' | 'month_wise' | 'projects' | 'methods'>('day_wise');

  const [dbStatus, setDbStatus] = useState<{
    status?: string;
    isLive?: boolean;
    host?: string;
    database?: string;
    latencyMs?: number | null;
    tables?: any[];
    error?: string;
    tip?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.role) setUserRole(u.role);
      }
    } catch {
      setUserRole('Super Admin');
    }
  }, []);

  const isHR = userRole === 'HR Admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [cStats, apps, dbHealth] = await Promise.all([
        fetchCareersStats().catch(() => ({ activeJobs: 0, draftJobs: 0, closedJobs: 0, totalApplications: 0, newApplications: 0 })),
        fetchCareerApplications().catch(() => []),
        fetchDatabaseStatus().catch(() => null)
      ]);
      setCareerStats(cStats);
      setApplications(apps);
      setDbStatus(dbHealth);
      setLeads([...dummyLeads]);
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialData = async (period: string = finPeriod, start?: string, end?: string) => {
    setFinLoading(true);
    try {
      const res = await getFinancialDashboard(period, start, end);
      if (res.success && res.data) {
        setFinancialData(res.data);
      }
    } catch (err) {
      console.error('Error fetching financial dashboard:', err);
    } finally {
      setFinLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadFinancialData();
  }, []);

  const handlePeriodChange = (newPeriod: string) => {
    setFinPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      loadFinancialData(newPeriod);
    }
  };

  const handleApplyCustomDate = () => {
    if (customStartDate && customEndDate) {
      loadFinancialData('custom', customStartDate, customEndDate);
    }
  };

  const statCards = isHR ? [
    { icon: Briefcase, label: 'Active Openings', value: careerStats.activeJobs, color: '#3B82F6' },
    { icon: UserCheck, label: 'Total Candidates', value: careerStats.totalApplications, color: '#06B6D4' },
    { icon: Sparkles, label: 'New Applicants', value: careerStats.newApplications, color: '#10B981' },
    { icon: Calendar, label: 'Draft Roles', value: careerStats.draftJobs, color: '#A855F7' },
  ] : [
    { icon: Users, label: 'Total Leads', value: stats.leads, color: '#06B6D4' },
    { icon: Briefcase, label: 'Active Jobs', value: careerStats.activeJobs, color: '#3B82F6' },
    { icon: UserCheck, label: 'Candidates Applied', value: careerStats.totalApplications, color: '#A855F7' },
    { icon: Ticket, label: 'Support Desk', value: stats.quotes, color: '#EC4899' },
  ];

  const hubItems = [
    {
      title: 'Pipeline Kanban',
      desc: 'Stage-by-stage candidate progression & drag-and-drop',
      href: '/admin/careers/pipeline',
      icon: Users,
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/40'
    },
    {
      title: 'Candidate CRM',
      desc: 'Unified profiles, multi-application history & tags',
      href: '/admin/careers/candidates',
      icon: UserCheck,
      color: 'text-purple-400',
      border: 'hover:border-purple-500/40'
    },
    {
      title: 'Interviews & Scorecards',
      desc: 'Rounds scheduling, meeting links & evaluation criteria',
      href: '/admin/careers/interviews',
      icon: Calendar,
      color: 'text-blue-400',
      border: 'hover:border-blue-500/40'
    },
    {
      title: 'Email Automations',
      desc: 'Workflow event triggers, email templates & delivery logs',
      href: '/admin/careers/automations',
      icon: Mail,
      color: 'text-emerald-400',
      border: 'hover:border-emerald-500/40'
    },
    {
      title: 'Funnel Telemetry',
      desc: 'Drop-off analytics, conversion rates & velocity metrics',
      href: '/admin/careers/analytics',
      icon: BarChart2,
      color: 'text-amber-400',
      border: 'hover:border-amber-500/40'
    },
    {
      title: 'Job Postings Manager',
      desc: 'Publish, edit, and monitor open positions across departments',
      href: '/admin/careers',
      icon: Briefcase,
      color: 'text-rose-400',
      border: 'hover:border-rose-500/40'
    }
  ];

  const categories = useMemo(() => {
    return ['All', ...new Set(leads.map(l => l.service).filter(Boolean))];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => filterCategory === 'All' || l.service === filterCategory);
  }, [leads, filterCategory]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filterStage === 'All') return true;
      return (app.stage_slug || app.status || '').toLowerCase() === filterStage.toLowerCase();
    });
  }, [applications, filterStage]);

  const metrics = financialData?.metrics;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Top Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sora font-extrabold text-white text-2xl tracking-tight">Executive Operations Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold">
                {userRole}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-inter mt-1">
              Consolidated enterprise financial telemetry, project profitability, and operational telemetry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/invoices"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
            >
              <Receipt size={14} className="text-brand-cyan" />
              <span>Invoices</span>
            </Link>
            <Link
              to="/admin/projects"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
            >
              <Briefcase size={14} className="text-purple-400" />
              <span>Projects</span>
            </Link>
            <button
              onClick={() => {
                loadData();
                loadFinancialData();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
              title="Refresh All Data"
            >
              <RefreshCw size={15} className={loading || finLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: CONSOLIDATED FINANCIAL REPORTING & TELEMETRY */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {!isHR && (
          <div className="bg-[#0b101e]/90 border border-brand-cyan/20 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            
            {/* Header with Date Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="font-outfit font-bold text-lg text-white flex items-center gap-2">
                    <span>Financial Intelligence & Revenue Telemetry</span>
                    {finLoading && <RefreshCw size={13} className="animate-spin text-brand-cyan" />}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Active Filter: <span className="text-brand-cyan font-bold uppercase">{finPeriod.replace('_', ' ')}</span> 
                    {financialData?.filter && ` (${financialData.filter.start_date} → ${financialData.filter.end_date})`}
                  </p>
                </div>
              </div>

              {/* Date Filters Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'last_week', label: 'Last Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'last_month', label: 'Last Month' },
                  { id: 'this_quarter', label: 'This Quarter' },
                  { id: 'this_year', label: 'This Year' },
                  { id: 'custom', label: 'Custom' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePeriodChange(p.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      finPeriod === p.id
                        ? 'bg-brand-cyan text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Bar (if 'custom' selected) */}
            {finPeriod === 'custom' && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-brand-cyan/30 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-300 font-semibold">Custom Range:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="bg-[#070b13] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
                <button
                  onClick={handleApplyCustomDate}
                  className="px-3 py-1.5 rounded-lg bg-brand-cyan text-black font-bold hover:bg-cyan-400 transition-all"
                >
                  Apply Filter
                </button>
              </div>
            )}

            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* Today's Revenue */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Today's Revenue</div>
                <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">
                  ₹{Number(metrics?.today_revenue || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {metrics?.today_invoices_count || 0} invoice{metrics?.today_invoices_count === 1 ? '' : 's'} issued
                </div>
              </div>

              {/* Today's Collections */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Today's Collections</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                  ₹{Number(metrics?.today_collections || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {metrics?.today_payments_count || 0} payment{metrics?.today_payments_count === 1 ? '' : 's'} verified
                </div>
              </div>

              {/* Period Revenue */}
              <div className="p-3.5 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 hover:border-brand-cyan/35 transition-all">
                <div className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider">Period Invoiced</div>
                <div className="text-xl font-extrabold text-brand-cyan font-mono mt-1">
                  ₹{Number(metrics?.period_revenue || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-brand-cyan/70 mt-1">Gross accrued sales</div>
              </div>

              {/* Period Collections */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/35 transition-all">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Cash Collected</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                  ₹{Number(metrics?.period_collections || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-400/70 mt-1">Realized bank cash</div>
              </div>

              {/* Pending Receivables */}
              <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/35 transition-all">
                <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Pending Dues</div>
                <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">
                  ₹{Number(metrics?.pending_receivables || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-rose-400/70 mt-1">Outstanding balance</div>
              </div>

              {/* Period Gross Profit */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/25 hover:border-purple-500/40 transition-all">
                <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Gross Profit</div>
                <div className="text-xl font-extrabold text-purple-300 font-mono mt-1">
                  ₹{Number(metrics?.period_gross_profit || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-purple-300/70 mt-1">Invoiced - Expenses</div>
              </div>

            </div>

            {/* Sub-report Tabs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-1 text-xs">
                <button
                  onClick={() => setFinReportTab('day_wise')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    finReportTab === 'day_wise'
                      ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar size={14} /> Day-Wise Revenue & Collections
                </button>
                <button
                  onClick={() => setFinReportTab('month_wise')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    finReportTab === 'month_wise'
                      ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TrendingUp size={14} /> Month-Wise Breakdown (12M)
                </button>
                <button
                  onClick={() => setFinReportTab('projects')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    finReportTab === 'projects'
                      ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Briefcase size={14} /> Project-Wise Financials ({financialData?.project_wise?.length || 0})
                </button>
                <button
                  onClick={() => setFinReportTab('methods')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    finReportTab === 'methods'
                      ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CreditCard size={14} /> Payment Methods & Statuses
                </button>
              </div>

              {/* 1. Day-Wise Revenue & Collections Table */}
              {finReportTab === 'day_wise' && (
                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Invoiced (₹)</th>
                          <th className="p-3 text-right">Collected (₹)</th>
                          <th className="p-3 text-right">Pending Balance (₹)</th>
                          <th className="p-3 text-center">Collection Realization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {!financialData?.day_wise || financialData.day_wise.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500">
                              No financial activity recorded in this date range.
                            </td>
                          </tr>
                        ) : (
                          financialData.day_wise.map(d => {
                            const ratio = d.invoiced > 0 ? Math.min(100, Math.round((d.collected / d.invoiced) * 100)) : (d.collected > 0 ? 100 : 0);
                            return (
                              <tr key={d.date} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-3 font-mono font-medium text-white">{d.date}</td>
                                <td className="p-3 text-right font-mono font-bold text-brand-cyan">
                                  ₹{d.invoiced.toLocaleString('en-IN')}
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-emerald-400">
                                  ₹{d.collected.toLocaleString('en-IN')}
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-rose-400">
                                  ₹{d.pending.toLocaleString('en-IN')}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div style={{ width: `${ratio}%` }} className="bg-emerald-500 h-full" />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{ratio}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. Month-Wise Breakdown */}
              {finReportTab === 'month_wise' && (
                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                          <th className="p-3">Month</th>
                          <th className="p-3 text-right">Invoiced Revenue (₹)</th>
                          <th className="p-3 text-right">Collected Cash (₹)</th>
                          <th className="p-3 text-right">Pending Receivables (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {financialData?.month_wise?.map(m => (
                          <tr key={m.month} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 font-bold text-white">{m.month}</td>
                            <td className="p-3 text-right font-mono font-bold text-brand-cyan">
                              ₹{m.invoiced.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              ₹{m.collected.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-rose-400">
                              ₹{m.pending.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Project-Wise Financials Table */}
              {finReportTab === 'projects' && (
                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                          <th className="p-3">Project Code</th>
                          <th className="p-3">Project Name & Client</th>
                          <th className="p-3 text-right">Contract Value</th>
                          <th className="p-3 text-right">Invoiced</th>
                          <th className="p-3 text-right">Paid</th>
                          <th className="p-3 text-right">Pending</th>
                          <th className="p-3 text-right">Gross Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {!financialData?.project_wise || financialData.project_wise.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-500">
                              No project data found.
                            </td>
                          </tr>
                        ) : (
                          financialData.project_wise.map(p => (
                            <tr key={p.project_id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3 font-mono font-bold text-brand-cyan">{p.project_code}</td>
                              <td className="p-3">
                                <div className="font-bold text-white">{p.project_name}</div>
                                {p.client && <div className="text-[10px] text-slate-400">{p.client}</div>}
                              </td>
                              <td className="p-3 text-right font-mono font-medium text-white">
                                {p.project_value ? `₹${Number(p.project_value).toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-brand-cyan">
                                ₹{Number(p.invoiced_amount).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-400">
                                ₹{Number(p.paid_amount).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-rose-400">
                                ₹{Number(p.pending_amount).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3 text-right font-mono font-extrabold text-purple-300">
                                ₹{Number(p.gross_profit).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Payment Methods & Status Distribution */}
              {finReportTab === 'methods' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Methods */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard size={14} className="text-brand-cyan" /> Payment Method Realization
                    </h4>
                    {!financialData?.payment_methods || financialData.payment_methods.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">No payment transaction records yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {financialData.payment_methods.map(m => (
                          <div key={m.method} className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-white uppercase">{m.method}</div>
                              <div className="text-[10px] text-slate-400">{m.count} transaction{m.count === 1 ? '' : 's'}</div>
                            </div>
                            <div className="font-mono font-bold text-emerald-400">
                              ₹{Number(m.total_amount).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Statuses */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt size={14} className="text-purple-400" /> Invoice Status Distribution
                    </h4>
                    {!financialData?.invoice_statuses || financialData.invoice_statuses.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">No invoices recorded.</div>
                    ) : (
                      <div className="space-y-2">
                        {financialData.invoice_statuses.map(st => (
                          <div key={st.status} className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-white uppercase">{st.status}</div>
                              <div className="text-[10px] text-slate-400">{st.count} invoice{st.count === 1 ? '' : 's'}</div>
                            </div>
                            <div className="font-mono font-bold text-brand-cyan">
                              ₹{Number(st.total_amount).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: OPERATIONAL METRIC CARDS & ATS RECRUITMENT HUB */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] shadow-lg bg-[#070b14]/70 border-white/10"
              >
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}15`, color: card.color, border: `1px solid ${card.color}30` }}
                  >
                    <Icon size={20} />
                  </div>
                </div>
                <div className="font-outfit font-black text-3xl text-white mb-1 relative z-10">
                  {loading ? <div className="h-8 w-16 bg-white/10 animate-pulse rounded" /> : card.value}
                </div>
                <div className="text-xs text-slate-400 font-inter relative z-10">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* ATS & Careers Command Center */}
        <div className="bg-slate-950/70 border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-outfit font-bold text-xl text-white">
                  {isHR ? 'Talent Operations Hub' : 'Recruitment & ATS Hub'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isHR
                    ? 'Direct shortcuts to pipeline progression, candidate database, interviews, and automated workflows'
                    : 'Direct shortcuts to interactive ATS pipelines, candidates, interviews, and automations'}
                </p>
              </div>
            </div>
            <Link
              to="/admin/careers"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View All Careers</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {hubItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${item.border} hover:bg-slate-800/80 transition-all flex items-start justify-between group shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800 ${item.color} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-slate-600 group-hover:text-white transition-colors shrink-0 mt-1" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Data Table: Recent Candidate Applications (HR Admin) or All Leads (Super Admin) */}
        {isHR ? (
          <div className="glass-panel border border-white/10 overflow-hidden flex flex-col h-[520px]">
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
              <div>
                <h2 className="font-outfit font-bold text-xl text-white">Recent Candidate Applications</h2>
                <span className="text-xs text-slate-400 font-inter">Review and fast-track incoming applicants across all active openings</span>
              </div>

              <div className="flex items-center gap-2 bg-[#050505] border border-white/10 rounded-xl px-3 py-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  className="bg-transparent text-sm text-white outline-none border-none cursor-pointer pr-4"
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                >
                  {['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'].map(st => (
                    <option key={st} value={st} className="bg-[#0f0f13] text-white">
                      {st === 'All' ? 'All Stages' : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm font-inter">
                <thead className="sticky top-0 bg-[#0f0f13] z-10 shadow-md">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Candidate</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Applied Role</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Stage</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Priority</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 w-full bg-white/5 animate-pulse rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No candidate applications found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map(app => (
                      <tr key={app.id || app.application_id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {app.candidate_name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <div className="text-white font-medium">{app.candidate_name}</div>
                              <div className="text-slate-400 text-xs">{app.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          <span className="text-white font-medium">{app.job_title || 'General Opening'}</span>
                          {app.location && <span className="block text-[11px] text-slate-500">{app.location}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {app.stage_slug || app.status || 'applied'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            app.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            app.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {app.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/admin/careers/pipeline"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Eye size={12} />
                            <span>View in ATS</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel border border-white/10 overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
              <div>
                <h2 className="font-outfit font-bold text-xl text-white">All Leads</h2>
                <span className="text-xs text-slate-400 font-inter">View and filter all incoming leads directly from the dashboard</span>
              </div>

              <div className="flex items-center gap-2 bg-[#050505] border border-white/10 rounded-xl px-3 py-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  className="bg-transparent text-sm text-white outline-none border-none cursor-pointer pr-4"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat as string} value={cat as string} className="bg-[#0f0f13] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm font-inter">
                <thead className="sticky top-0 bg-[#0f0f13] z-10 shadow-md">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Service</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 w-full bg-white/5 animate-pulse rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No leads found for this category.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map(lead => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{lead.name}</td>
                        <td className="px-6 py-4 text-slate-400">{lead.email}</td>
                        <td className="px-6 py-4 text-slate-300">
                          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs">
                            {lead.service || 'General Inquiry'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.status === 'new' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
