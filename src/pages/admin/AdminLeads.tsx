import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { RefreshCw } from 'lucide-react';

type Lead = { id: string; name: string; email: string; phone?: string; service?: string; status: string; source?: string; created_at: string };

const statusColors: Record<string, string> = {
  new: 'bg-accent/10 text-accent',
  contacted: 'bg-amber-500/10 text-amber-400',
  qualified: 'bg-blue-500/10 text-blue-400',
  closed: 'bg-emerald-500/10 text-emerald-400',
  lost: 'bg-red-500/10 text-red-400',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    supabase.from('leads').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setLeads(data || []); setLoading(false); });
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const filtered = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sora font-black text-white text-2xl">Leads</h1>
            <p className="text-slate-400 text-sm font-inter">{leads.length} total leads</p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <input
              className="form-input px-4 py-2 rounded-xl text-sm font-inter w-full max-w-xs"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter">
              <thead>
                <tr className="border-b border-white/5">
                  {['Name', 'Email', 'Phone', 'Service', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded w-20" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No leads found.</td></tr>
                ) : (
                  filtered.map(lead => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{lead.name}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{lead.email}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{lead.phone || '-'}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{lead.service || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[lead.status] || 'bg-white/5 text-slate-400'}`}>{lead.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          className="bg-secondary border border-white/10 text-slate-300 text-xs px-2 py-1 rounded-lg font-inter"
                        >
                          {Object.keys(statusColors).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <button onClick={() => deleteLead(lead.id)} className="text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs transition-colors">
                          Delete
                        </button>
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
