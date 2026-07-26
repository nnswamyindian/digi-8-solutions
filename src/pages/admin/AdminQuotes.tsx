import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { RefreshCw } from 'lucide-react';

type Quote = {
  id: string;
  quote_number: string;
  service: string;
  final_price: number;
  status: string;
  delivery_days: number;
  created_at: string;
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-500/10 text-slate-400',
  sent: 'bg-blue-500/10 text-blue-400',
  accepted: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-red-500/10 text-red-400',
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    supabase.from('quotes').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setQuotes((data || []) as Quote[]); setLoading(false); });
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('quotes').update({ status }).eq('id', id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sora font-black text-white text-2xl">Quotes</h1>
            <p className="text-slate-400 text-sm font-inter">{quotes.length} total quotes</p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter">
              <thead>
                <tr className="border-b border-white/5">
                  {['Quote #', 'Service', 'Total (incl. GST)', 'Delivery', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded w-20" /></td>)}</tr>
                  ))
                ) : quotes.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No quotes yet.</td></tr>
                ) : (
                  quotes.map(q => (
                    <tr key={q.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-accent font-mono text-xs">{q.quote_number}</td>
                      <td className="px-4 py-3 text-white">{q.service}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">₹{q.final_price?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{q.delivery_days}+ days</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[q.status] || 'bg-white/5 text-slate-400'}`}>{q.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{q.created_at ? new Date(q.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={q.status}
                          onChange={e => updateStatus(q.id, e.target.value)}
                          className="bg-secondary border border-white/10 text-slate-300 text-xs px-2 py-1 rounded-lg font-inter"
                        >
                          {Object.keys(statusColors).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
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
