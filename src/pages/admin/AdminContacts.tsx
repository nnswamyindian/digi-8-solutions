import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { RefreshCw } from 'lucide-react';

type Contact = { id: string; name: string; email: string; phone?: string; subject?: string; message: string; type: string; created_at: string };

export default function AdminContacts() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  const load = () => {
    setLoading(true);
    supabase.from('contacts').select('*').order('created_at', { ascending: false })
      .then((res: any) => { setItems((res?.data || []) as Contact[]); setLoading(false); });
  };

  useEffect(load, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sora font-black text-white text-2xl">Contact Messages</h1>
            <p className="text-slate-400 text-sm font-inter">{items.length} messages</p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-y-auto max-h-[600px]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-4 border-b border-white/5 shimmer h-16" />)
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-inter text-sm">No messages yet.</div>
              ) : (
                items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${selected?.id === item.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-inter font-medium text-white text-sm">{item.name}</span>
                      <span className="text-[10px] text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{item.subject || item.message}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="glass rounded-2xl border border-white/10 p-6">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sora font-semibold text-white">{selected.name}</h3>
                  <span className="tag text-xs capitalize">{selected.type}</span>
                </div>
                {[
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Subject', value: selected.subject || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs text-slate-500 font-inter mb-0.5">{label}</div>
                    <div className="text-sm text-slate-300 font-inter">{value}</div>
                  </div>
                ))}
                <div>
                  <div className="text-xs text-slate-500 font-inter mb-1">Message</div>
                  <p className="text-sm text-slate-200 font-inter leading-relaxed glass rounded-xl p-3 border border-white/5">{selected.message}</p>
                </div>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your enquiry'}`}
                  className="btn-glow w-full py-2.5 rounded-xl text-sm font-poppins font-semibold text-white text-center block"
                >
                  Reply via Email
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-40 text-slate-500 font-inter text-sm">
                Select a message to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
