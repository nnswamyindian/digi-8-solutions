import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { getAllServicePricing, upsertServicePricing, deleteServicePricing } from '../../lib/api';
import type { ServicePricing } from '../../lib/api';
import { RefreshCw, Plus, Trash2, Save, X, Eye, EyeOff, DollarSign } from 'lucide-react';

const SERVICE_SLUGS = [
  { slug: 'web-development', name: 'Web Development' },
  { slug: 'branding', name: 'Logo & Branding' },
  { slug: 'digital-marketing', name: 'Digital Marketing' },
  { slug: 'cyber-security', name: 'Cyber Security' },
  { slug: 'startup-guidance', name: 'Startup Guidance' },
  { slug: 'mobile-app', name: 'Mobile App Development' },
  { slug: 'digital-printing', name: 'Digital Print Service' },
  { slug: 'corporate-gifting', name: 'Corporate Gifting' },
];

const emptyRow = (slug: string, name: string, sortOrder: number): ServicePricing => ({
  service_slug: slug,
  service_name: name,
  item_name: '',
  market_price: '',
  our_price: '',
  savings: '',
  sort_order: sortOrder,
  is_active: true,
});

export default function AdminPricing() {
  const [rows, setRows] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState(SERVICE_SLUGS[0].slug);
  const [editing, setEditing] = useState<ServicePricing | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAllServicePricing()
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => { setError('Failed to load pricing data'); setLoading(false); });
  }, []);

  useEffect(load, [load]);

  const filteredRows = rows.filter(r => r.service_slug === activeService);
  const activeServiceName = SERVICE_SLUGS.find(s => s.slug === activeService)?.name || '';

  const startEdit = (row: ServicePricing) => setEditing({ ...row });
  const startAdd = () => setEditing(emptyRow(activeService, activeServiceName, filteredRows.length + 1));

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.item_name.trim() || !editing.our_price.trim()) {
      setError('Item name and our price are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await upsertServicePricing(editing);
      if (editing.id) {
        setRows(prev => prev.map(r => r.id === editing.id ? saved : r));
      } else {
        setRows(prev => [...prev, saved]);
      }
      setEditing(null);
    } catch {
      setError('Failed to save. Check your permissions.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: ServicePricing) => {
    if (!row.id) return;
    const updated = { ...row, is_active: !row.is_active };
    try {
      await upsertServicePricing(updated);
      setRows(prev => prev.map(r => r.id === row.id ? updated : r));
    } catch {
      setError('Failed to toggle visibility');
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteServicePricing(id);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch {
      setError('Failed to delete row');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sora font-black text-white text-2xl flex items-center gap-2">
              <DollarSign size={22} className="text-accent" /> Pricing Dashboard
            </h1>
            <p className="text-slate-400 text-sm font-inter">
              {rows.length} pricing rows · Changes appear instantly on service pages
            </p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div className="glass rounded-xl p-3 mb-4 border border-red-500/30 text-red-400 text-sm font-inter">
            {error}
          </div>
        )}

        {/* Service tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SERVICE_SLUGS.map(s => (
            <button
              key={s.slug}
              onClick={() => setActiveService(s.slug)}
              className={`px-4 py-2 rounded-full text-xs font-inter font-medium transition-all border ${
                activeService === s.slug
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-white/10 text-slate-400 hover:border-accent/30'
              }`}
            >
              {s.name}
              <span className="ml-2 opacity-60">
                ({rows.filter(r => r.service_slug === s.slug).length})
              </span>
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={startAdd}
          className="btn-glow px-5 py-2.5 rounded-xl text-sm font-poppins font-semibold text-white inline-flex items-center gap-2 mb-4"
        >
          <Plus size={14} /> Add New Price Row
        </button>

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
            <div className="glass-strong rounded-2xl p-6 w-full max-w-lg border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sora font-bold text-white text-lg">
                  {editing.id ? 'Edit Price Row' : 'Add Price Row'}
                </h3>
                <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-inter">Service Item Name *</label>
                  <input
                    className="form-input w-full px-4 py-2.5 rounded-xl text-sm font-inter"
                    value={editing.item_name}
                    onChange={e => setEditing({ ...editing, item_name: e.target.value })}
                    placeholder="e.g. Corporate Website"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-inter">Market Price</label>
                    <input
                      className="form-input w-full px-4 py-2.5 rounded-xl text-sm font-inter"
                      value={editing.market_price}
                      onChange={e => setEditing({ ...editing, market_price: e.target.value })}
                      placeholder="₹75,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-inter">Our Price *</label>
                    <input
                      className="form-input w-full px-4 py-2.5 rounded-xl text-sm font-inter"
                      value={editing.our_price}
                      onChange={e => setEditing({ ...editing, our_price: e.target.value })}
                      placeholder="₹44,999"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-inter">Savings Label</label>
                    <input
                      className="form-input w-full px-4 py-2.5 rounded-xl text-sm font-inter"
                      value={editing.savings}
                      onChange={e => setEditing({ ...editing, savings: e.target.value })}
                      placeholder="₹30,001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-inter">Sort Order</label>
                    <input
                      type="number"
                      className="form-input w-full px-4 py-2.5 rounded-xl text-sm font-inter"
                      value={editing.sort_order ?? 0}
                      onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="btn-glow px-6 py-2.5 rounded-xl text-sm font-poppins font-semibold text-white inline-flex items-center gap-2"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2.5 rounded-xl text-sm font-inter text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing table */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw size={20} className="animate-spin text-accent mx-auto" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-inter text-sm">
              No pricing rows for {activeServiceName} yet. Click "Add New Price Row" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-inter">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Item</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-400 font-medium">Market Price</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-400 font-medium">Our Price</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-400 font-medium">Savings</th>
                    <th className="text-center px-4 py-3 text-xs text-slate-400 font-medium">Order</th>
                    <th className="text-center px-4 py-3 text-xs text-slate-400 font-medium">Visible</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(row => (
                    <tr key={row.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!row.is_active ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3 text-white font-medium">{row.item_name}</td>
                      <td className="px-4 py-3 text-right text-slate-500 line-through">{row.market_price}</td>
                      <td className="px-4 py-3 text-right text-accent font-bold">{row.our_price}</td>
                      <td className="px-4 py-3 text-right text-emerald-400">{row.savings}</td>
                      <td className="px-4 py-3 text-center text-slate-400 text-xs">{row.sort_order}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(row)}
                          className={`transition-colors ${row.is_active ? 'text-emerald-400' : 'text-slate-600'}`}
                          title={row.is_active ? 'Visible on site' : 'Hidden from site'}
                        >
                          {row.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(row)}
                            className="px-2 py-1 rounded-lg text-[10px] font-inter text-accent hover:bg-accent/10 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => row.id && remove(row.id, row.item_name)}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
