import { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, RefreshCw, Filter } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';

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
  const [stats, setStats] = useState<Stats>({ leads: 5, quotes: 12, contacts: 8, testimonials: 4 });
  const [leads, setLeads] = useState<any[]>(dummyLeads);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real scenario, we'd fetch from our new API:
      // const res = await fetch('/api/leads');
      // const data = await res.json();
      // setLeads(data.data);
      
      // For now we just reset dummy leads to show it's "refreshing"
      setTimeout(() => {
        setLeads([...dummyLeads]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const statCards = [
    { icon: Users, label: 'Total Leads', value: stats.leads, color: '#06B6D4' },
    { icon: FileText, label: 'Quotes Generated', value: stats.quotes, color: '#3B82F6' },
    { icon: MessageSquare, label: 'Messages', value: stats.contacts, color: '#A855F7' },
    { icon: TrendingUp, label: 'Testimonials', value: stats.testimonials, color: '#EC4899' },
  ];

  const filteredLeads = filterCategory === 'All' 
    ? leads 
    : leads.filter(lead => lead.service === filterCategory);

  const categories = ['All', ...Array.from(new Set(leads.map(l => l.service).filter(Boolean)))];

  return (
    <AdminLayout>
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-outfit font-black text-white text-3xl mb-1">Dashboard</h1>
            <p className="text-slate-400 text-sm font-inter">Welcome back! Here's what's happening today.</p>
          </div>
          <button onClick={loadData} className="btn-outline-glass px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Leads Table with Filter */}
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
      </div>
    </AdminLayout>
  );
}
