import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import {
  Package, Plus, Search, Filter, RefreshCw, Eye, Edit3, Copy, Archive,
  Trash2, Globe, CheckCircle2, Clock, Star, ExternalLink, Calendar,
  MessageSquare, Users, FileText, ChevronRight, AlertCircle, Sparkles,
  ArrowUpRight, Tag, ShieldCheck, Check, X
} from 'lucide-react';
import {
  Product,
  DemoRequest,
  ProductQuoteRequest,
  ProductStats,
  fetchAdminProducts,
  fetchAdminProductStats,
  publishAdminProduct,
  unpublishAdminProduct,
  archiveAdminProduct,
  deleteAdminProduct,
  duplicateAdminProduct,
  fetchDemoRequests,
  updateDemoRequest,
  fetchProductQuotations,
  updateProductQuotation
} from '../../../lib/productsApi';

export default function AdminProductsDashboard() {
  const navigate = useNavigate();

  // Active section tab: 'all' | 'published' | 'draft' | 'featured' | 'archived' | 'demos' | 'quotations'
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'featured' | 'archived' | 'demos' | 'quotations'>('all');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Demos & Quotations state
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<ProductQuoteRequest[]>([]);
  const [demosLoading, setDemosLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Status message
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodsRes] = await Promise.all([
        fetchAdminProductStats(),
        fetchAdminProducts({
          status: activeTab === 'all' || activeTab === 'demos' || activeTab === 'quotations' ? undefined : activeTab,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined
        })
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (prodsRes.success && prodsRes.data) {
        setProducts(prodsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load products data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDemos = async () => {
    setDemosLoading(true);
    try {
      const res = await fetchDemoRequests({ search: searchQuery.trim() || undefined });
      if (res.success && res.data) {
        setDemoRequests(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load demo requests:', err);
    } finally {
      setDemosLoading(false);
    }
  };

  const loadQuotes = async () => {
    setQuotesLoading(true);
    try {
      const res = await fetchProductQuotations({ search: searchQuery.trim() || undefined });
      if (res.success && res.data) {
        setQuoteRequests(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load quote requests:', err);
    } finally {
      setQuotesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'demos') {
      loadDemos();
    } else if (activeTab === 'quotations') {
      loadQuotes();
    } else {
      loadData();
    }
  }, [activeTab, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'demos') {
      loadDemos();
    } else if (activeTab === 'quotations') {
      loadQuotes();
    } else {
      loadData();
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3500);
  };

  // Actions
  const handleTogglePublish = async (prod: Product) => {
    try {
      if (prod.status === 'published' || prod.is_published) {
        const res = await unpublishAdminProduct(prod.id);
        if (res.success) {
          showNotification(`"${prod.name}" moved to Draft.`);
          loadData();
        } else {
          showNotification(res.error || 'Failed to unpublish', 'error');
        }
      } else {
        const res = await publishAdminProduct(prod.id);
        if (res.success) {
          showNotification(`"${prod.name}" is now Live!`);
          loadData();
        } else {
          showNotification(res.error || 'Failed to publish', 'error');
        }
      }
    } catch (err: any) {
      showNotification(err.message || 'Action failed', 'error');
    }
  };

  const handleDuplicate = async (prod: Product) => {
    try {
      const res = await duplicateAdminProduct(prod.id);
      if (res.success) {
        showNotification(`Duplicated as "${res.data?.name}" (Draft).`);
        loadData();
      } else {
        showNotification(res.error || 'Failed to duplicate', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleArchive = async (prod: Product) => {
    if (!confirm(`Are you sure you want to archive "${prod.name}"? It will be hidden from the public catalog while preserving existing records.`)) return;
    try {
      const res = await archiveAdminProduct(prod.id);
      if (res.success) {
        showNotification(`"${prod.name}" archived.`);
        loadData();
      } else {
        showNotification(res.error || 'Failed to archive', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDelete = async (prod: Product) => {
    if (!confirm(`Delete "${prod.name}"? If it has historical enquiries, it will be safely archived instead.`)) return;
    try {
      const res = await deleteAdminProduct(prod.id);
      if (res.success) {
        showNotification(res.message || 'Product deleted.');
        loadData();
      } else {
        showNotification(res.error || 'Failed to delete', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateDemoStatus = async (id: number, status: string) => {
    try {
      const res = await updateDemoRequest(id, { status });
      if (res.success) {
        setDemoRequests(prev => prev.map(d => d.id === id ? { ...d, status: status as any } : d));
        showNotification('Demo request status updated.');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateQuoteStatus = async (id: number, status: string) => {
    try {
      const res = await updateProductQuotation(id, { status });
      if (res.success) {
        setQuoteRequests(prev => prev.map(q => q.id === id ? { ...q, status: status as any } : q));
        showNotification('Quotation status updated.');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Distinct categories from loaded products
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-outfit font-black text-white flex items-center gap-2">
                  Products &amp; SaaS Solutions
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-brand-cyan/30 text-brand-cyan font-bold">
                    Dynamic CMS
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Manage digital products, SaaS platforms, live demos, automated pricing, and quotation workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === 'demos') loadDemos();
                else if (activeTab === 'quotations') loadQuotes();
                else loadData();
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={14} className={loading || demosLoading || quotesLoading ? 'animate-spin text-brand-cyan' : ''} />
              <span>Refresh</span>
            </button>

            <Link
              to="/products"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-brand-cyan hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Globe size={14} />
              <span>View Live Catalog</span>
              <ExternalLink size={12} />
            </Link>

            <Link
              to="/admin/products/new"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Action Notification Alert */}
        {actionMsg && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-fade-in ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div
            onClick={() => setActiveTab('all')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500/10 border-brand-cyan/50 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                : 'bg-[#0b101d] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Products</span>
              <Package size={14} className="text-brand-cyan" />
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {stats ? stats.total : products.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Catalog software &amp; SaaS</div>
          </div>

          <div
            onClick={() => setActiveTab('published')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'published'
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-[#0b101d] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Published</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {stats ? stats.published : products.filter(p => p.status === 'published' || p.is_published).length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Live on public portal</div>
          </div>

          <div
            onClick={() => setActiveTab('draft')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-[#0b101d] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Drafts</span>
              <Clock size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {stats ? stats.draft : products.filter(p => p.status === 'draft' || !p.is_published).length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Under development</div>
          </div>

          <div
            onClick={() => setActiveTab('featured')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'featured'
                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'bg-[#0b101d] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Featured</span>
              <Star size={14} className="text-purple-400 fill-purple-400/20" />
            </div>
            <div className="text-2xl font-mono font-bold text-purple-400">
              {stats ? stats.featured : products.filter(p => p.is_featured).length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Highlighted on homepage</div>
          </div>

          <div
            onClick={() => setActiveTab('demos')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'demos'
                ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-[#0b101d] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Demo Requests</span>
              <Calendar size={14} className="text-blue-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-blue-400">
              {stats ? stats.total_demos : demoRequests.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Customer walkthroughs</div>
          </div>

          <div
            onClick={() => setActiveTab('quotations')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'quotations'
                ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'bg-[#0b101d] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Quotations</span>
              <FileText size={14} className="text-rose-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-rose-400">
              {stats ? stats.total_quotations : quoteRequests.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Customization enquiries</div>
          </div>
        </div>

        {/* Section Navigation Tabs & Search Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0b101d] border border-white/10">
          
          {/* Subsections navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-cyan text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'published'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'draft'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'featured'
                  ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'archived'
                  ? 'bg-slate-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Archived
            </button>
            <div className="w-[1px] h-5 bg-white/10 mx-1 hidden sm:block" />
            <button
              onClick={() => setActiveTab('demos')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'demos'
                  ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={13} />
              <span>Demo Requests</span>
              {stats?.pending_demos ? (
                <span className="w-4 h-4 rounded-full bg-blue-400 text-black font-mono text-[10px] flex items-center justify-center font-bold">
                  {stats.pending_demos}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'bg-rose-600 text-white font-bold shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={13} />
              <span>Quotations</span>
              {stats?.pending_quotations ? (
                <span className="w-4 h-4 rounded-full bg-rose-400 text-black font-mono text-[10px] flex items-center justify-center font-bold">
                  {stats.pending_quotations}
                </span>
              ) : null}
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2.5">
            {activeTab !== 'demos' && activeTab !== 'quotations' && (
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#070b13] border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-cyan"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'demos' ? "Search demo requests..." : activeTab === 'quotations' ? "Search quotations..." : "Search products, slugs..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 bg-[#070b13] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
              />
            </form>
          </div>

        </div>

        {/* TAB CONTENT A: PRODUCTS LIST TABLE */}
        {activeTab !== 'demos' && activeTab !== 'quotations' && (
          <div className="bg-[#0b101d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-inter">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 font-bold">Product</th>
                    <th className="py-3.5 px-4 font-bold">Category &amp; Type</th>
                    <th className="py-3.5 px-4 font-bold">Official Link / App</th>
                    <th className="py-3.5 px-4 font-bold">Pricing Model</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="py-6 px-4">
                          <div className="h-6 bg-white/5 rounded-lg animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center">
                        <Package size={36} className="mx-auto text-slate-600 mb-2" />
                        <h4 className="text-white font-bold text-sm">No products found</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                          No products match the selected criteria. Add a new SaaS solution or clear filters.
                        </p>
                        <Link
                          to="/admin/products/new"
                          className="inline-flex items-center gap-1.5 mt-4 px-4 py-1.5 rounded-xl bg-brand-cyan text-black font-bold text-xs"
                        >
                          <Plus size={14} /> Add First Product
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isPub = p.status === 'published' || p.is_published;
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                          
                          {/* Product Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                {p.thumbnail_url || p.logo_url ? (
                                  <img
                                    src={p.thumbnail_url || p.logo_url}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                ) : (
                                  <Package size={20} className="text-brand-cyan" />
                                )}
                                {p.is_featured && (
                                  <div className="absolute top-0 right-0 p-0.5 bg-purple-500 rounded-bl text-[8px] text-white">
                                    ★
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-outfit font-bold text-white text-sm flex items-center gap-2">
                                  <span>{p.name}</span>
                                  {p.is_featured && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-brand-cyan font-mono flex items-center gap-1">
                                  <span>/products/{p.slug}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                                  {p.short_description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category & Type */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-semibold">{p.category}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.product_type}</div>
                          </td>

                          {/* Official URL / App */}
                          <td className="py-3.5 px-4">
                            {p.official_website_url ? (
                              <a
                                href={p.official_website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-brand-cyan hover:underline font-mono text-[11px]"
                              >
                                <Globe size={12} />
                                <span className="line-clamp-1 max-w-[150px]">
                                  {p.official_website_url.replace(/^https?:\/\//, '')}
                                </span>
                                <ArrowUpRight size={11} />
                              </a>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Not configured</span>
                            )}
                            {p.application_url && (
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                App: {p.application_url.replace(/^https?:\/\//, '').slice(0, 20)}...
                              </div>
                            )}
                          </td>

                          {/* Pricing */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white">
                              {p.display_price === false ? (
                                <span className="text-slate-400 text-xs">Custom Quote</span>
                              ) : p.starting_price > 0 ? (
                                <span className="text-emerald-400">
                                  ₹{Number(p.starting_price).toLocaleString('en-IN')}
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {p.pricing_model?.toLowerCase().includes('month') ? '/mo' : p.pricing_model?.toLowerCase().includes('user') ? '/user' : ''}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400">Contact Sales</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">{p.pricing_model}</div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {p.status === 'published' || p.is_published ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Published
                              </span>
                            ) : p.status === 'archived' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-500/10 border border-slate-500/30 text-slate-400">
                                <Archive size={11} />
                                Archived
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                <Clock size={11} />
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Preview Landing Page */}
                              <Link
                                to={`/products/${p.slug}?preview=true`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Preview Landing Page"
                              >
                                <Eye size={14} />
                              </Link>

                              {/* Edit Product Form */}
                              <Link
                                to={`/admin/products/${p.id}/edit`}
                                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-brand-cyan transition-colors"
                                title="Edit Product Details"
                              >
                                <Edit3 size={14} />
                              </Link>

                              {/* Duplicate Product */}
                              <button
                                onClick={() => handleDuplicate(p)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Duplicate Product"
                              >
                                <Copy size={14} />
                              </button>

                              {/* Quick Publish / Unpublish */}
                              <button
                                onClick={() => handleTogglePublish(p)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  isPub
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                                title={isPub ? 'Revert to Draft' : 'Publish Product to Live Site'}
                              >
                                {isPub ? 'Unpublish' : 'Publish'}
                              </button>

                              {/* Archive or Delete */}
                              {p.status !== 'archived' ? (
                                <button
                                  onClick={() => handleArchive(p)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Archive Product"
                                >
                                  <Archive size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDelete(p)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                  title="Permanently Delete Draft"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}

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

        {/* TAB CONTENT B: DEMO REQUESTS TABLE */}
        {activeTab === 'demos' && (
          <div className="bg-[#0b101d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <h3 className="font-outfit font-bold text-white text-sm">Product Demo Inquiries &amp; Schedules</h3>
              </div>
              <span className="text-xs text-slate-400">{demoRequests.length} total demo requests</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-inter">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Reference / Date</th>
                    <th className="py-3 px-4 font-bold">Customer &amp; Company</th>
                    <th className="py-3 px-4 font-bold">Requested Product</th>
                    <th className="py-3 px-4 font-bold">Preferred Slot</th>
                    <th className="py-3 px-4 font-bold">Team / Requirements</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {demosLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="p-4"><div className="h-6 bg-white/5 animate-pulse rounded" /></td></tr>
                    ))
                  ) : demoRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Calendar size={32} className="mx-auto text-slate-600 mb-2" />
                        No demo requests recorded yet.
                      </td>
                    </tr>
                  ) : (
                    demoRequests.map((d) => (
                      <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-brand-cyan font-bold">{d.request_reference}</div>
                          <div className="text-[10px] text-slate-500">{new Date(d.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-white font-semibold">{d.customer_name}</div>
                          {d.company_name && <div className="text-[10px] text-slate-400">{d.company_name}</div>}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{d.email} | {d.phone || 'No phone'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-outfit font-bold text-white">{d.product_name}</span>
                          {d.product_slug && (
                            <Link to={`/products/${d.product_slug}`} target="_blank" className="block text-[10px] text-brand-cyan hover:underline">
                              View Page &rarr;
                            </Link>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{d.preferred_date || 'Flexible'}</div>
                          <div className="text-[10px] text-slate-400">{d.preferred_time || 'Anytime'} ({d.preferred_contact_method || 'Email'})</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-slate-300 line-clamp-2">{d.requirements || 'Standard walkthrough'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Users: {d.number_of_users || '1-5'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={d.status}
                            onChange={e => handleUpdateDemoStatus(d.id, e.target.value)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border focus:outline-none ${
                              d.status === 'scheduled' || d.status === 'demo_completed'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : d.status === 'contacted'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            }`}
                          >
                            <option value="new" className="bg-slate-900 text-white">New</option>
                            <option value="contacted" className="bg-slate-900 text-white">Contacted</option>
                            <option value="scheduled" className="bg-slate-900 text-white">Scheduled</option>
                            <option value="demo_completed" className="bg-slate-900 text-white">Demo Completed</option>
                            <option value="follow_up_required" className="bg-slate-900 text-white">Follow-up Required</option>
                            <option value="converted" className="bg-slate-900 text-white">Converted</option>
                            <option value="closed" className="bg-slate-900 text-white">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT C: QUOTATION REQUESTS TABLE */}
        {activeTab === 'quotations' && (
          <div className="bg-[#0b101d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-rose-400" />
                <h3 className="font-outfit font-bold text-white text-sm">Product Quotations &amp; Customization Requests</h3>
              </div>
              <span className="text-xs text-slate-400">{quoteRequests.length} total quote requests</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-inter">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Reference / Date</th>
                    <th className="py-3 px-4 font-bold">Customer &amp; Company</th>
                    <th className="py-3 px-4 font-bold">Product &amp; Type</th>
                    <th className="py-3 px-4 font-bold">Scope &amp; Requested Modules</th>
                    <th className="py-3 px-4 font-bold">Budget &amp; Timeline</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Invoice / Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quotesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="p-4"><div className="h-6 bg-white/5 animate-pulse rounded" /></td></tr>
                    ))
                  ) : quoteRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FileText size={32} className="mx-auto text-slate-600 mb-2" />
                        No product quotation requests registered yet.
                      </td>
                    </tr>
                  ) : (
                    quoteRequests.map((q) => (
                      <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-brand-cyan font-bold">{q.request_reference}</div>
                          <div className="text-[10px] text-slate-500">{new Date(q.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-white font-semibold">{q.customer_name}</div>
                          {q.company_name && <div className="text-[10px] text-slate-400">{q.company_name}</div>}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{q.email} | {q.phone || 'No phone'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-outfit font-bold text-white">{q.product_name}</span>
                          <span className="block text-[10px] text-rose-300 capitalize">{q.requirement_type}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-300 line-clamp-2">{q.requirements || 'Custom scope'}</p>
                          {q.requested_features && q.requested_features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {q.requested_features.slice(0, 3).map((f, fi) => (
                                <span key={fi} className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-emerald-400 font-semibold">{q.budget_range || 'Flexible'}</div>
                          <div className="text-[10px] text-slate-400">{q.expected_timeline || 'Standard'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={q.status}
                            onChange={e => handleUpdateQuoteStatus(q.id, e.target.value)}
                            className="bg-[#070b13] border border-white/10 text-xs px-2.5 py-1 rounded-lg text-slate-200 focus:outline-none font-semibold"
                          >
                            <option value="new" className="bg-slate-900 text-white">New</option>
                            <option value="reviewed" className="bg-slate-900 text-white">Reviewed</option>
                            <option value="quoted" className="bg-slate-900 text-white">Proposal Sent</option>
                            <option value="closed" className="bg-slate-900 text-white">Closed</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/admin/invoices"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-brand-cyan text-[11px] font-semibold border border-brand-cyan/30 transition-colors"
                          >
                            <span>Create Invoice</span>
                            <ArrowUpRight size={11} />
                          </Link>
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
