import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

type Testimonial = {
  id: string;
  client_name: string;
  company?: string;
  role?: string;
  review: string;
  rating?: number;
  service?: string;
  approved: boolean;
  created_at: string;
};

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems((data || []) as Testimonial[]); setLoading(false); });
  };

  useEffect(load, []);

  const toggle = async (id: string, approved: boolean) => {
    await supabase.from('testimonials').update({ approved: !approved }).eq('id', id);
    setItems(prev => prev.map(t => t.id === id ? { ...t, approved: !approved } : t));
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sora font-black text-white text-2xl">Testimonials</h1>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass rounded-2xl h-24 shimmer border border-white/5" />)
          ) : items.map(t => (
            <div key={t.id} className="glass rounded-2xl p-5 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center text-white font-sora font-bold text-sm flex-shrink-0">
                {t.client_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sora font-semibold text-white text-sm">{t.client_name} {t.company && <span className="text-slate-400 font-normal">· {t.company}</span>}</div>
                <p className="text-slate-400 text-xs font-inter mt-1 line-clamp-2">"{t.review}"</p>
                {t.service && <span className="tag text-[10px] mt-2 inline-block">{t.service}</span>}
              </div>
              <button
                onClick={() => toggle(t.id, t.approved)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter transition-all flex-shrink-0 ${
                  t.approved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {t.approved ? <><CheckCircle size={12} /> Approved</> : <><XCircle size={12} /> Pending</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
