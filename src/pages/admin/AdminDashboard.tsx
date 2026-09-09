import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, RefreshCw, Filter, Briefcase, UserCheck, Calendar,
  Mail, BarChart2, Ticket, ArrowRight, Sparkles, ChevronRight, Plus, Eye
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchCareersStats,
  fetchCareerApplications,
  type CareerStats,
  type JobApplication
} from '../../lib/api';

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
      const [cStats, apps] = await Promise.all([
        fetchCareersStats().catch(() => ({ activeJobs: 0, draftJobs: 0, closedJobs: 0, totalApplications: 0, newApplications: 0 })),
        fetchCareerApplications().catch(() => [])
      ]);
      setCareerStats(cStats);
      setApplications(apps);
      setLeads([...dummyLeads]);
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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

  const hubItems = isHR ? [
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
  ] : [
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
      title: 'Support Tickets Desk',
      desc: 'Inquiries, customer support tickets & chatbot triage',
      href: '/admin/tickets',
      icon: Ticket,
      color: 'text-rose-400',
      border: 'hover:border-rose-500/40'
    }
  ];

  const filteredLeads = filterCategory === 'All'
    ? leads
    : leads.filter(lead => lead.service === filterCategory);

  const categories = ['All', ...Array.from(new Set(leads.map(l => l.service).filter(Boolean)))];

  const filteredApplications = useMemo(() => {
    if (filterStage === 'All') return applications;
    return applications.filter(a => {
      const stage = (a.stage_slug || a.status || '').toLowerCase();
      return stage.includes(filterStage.toLowerCase());
    });
  }, [applications, filterStage]);

  return (
    <AdminLayout>
      <div className="max-w-6xl w-full mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <h1 className="font-outfit font-black text-white text-3xl mb-1 tracking-tight">
              {isHR ? 'HR & Recruitment Dashboard' : 'Dashboard Overview'}
            </h1>
            <p className="text-slate-400 text-sm font-inter">
              {isHR
                ? 'Real-time talent acquisition pipeline, active job openings, candidate evaluations, and recruitment telemetry.'
                : 'Real-time control center for Digi 8 business leads, ATS recruitment, and customer operations.'}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/admin/careers/jobs/new"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus size={14} />
              <span>Post Job Opening</span>
            </Link>
            <button onClick={loadData} className="btn-outline-glass px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(card => (
            <div key={card.label} className="glass-panel p-6 border border-white/10 hover:border-white/20 transition-all relative overflow-hidden group">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: card.color }}
              />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `${card.color}15`, border: `1px solid ${card.color}40` }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
              </div>
              <div className="font-outfit font-black text-4xl text-white mb-1 relative z-10">
                {loading ? <div className="h-10 w-16 bg-white/10 animate-pulse rounded" /> : card.value}
              </div>
              <div className="text-sm text-slate-400 font-inter relative z-10">{card.label}</div>
            </div>
          ))}
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
