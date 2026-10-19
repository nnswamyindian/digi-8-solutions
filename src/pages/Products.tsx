import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Search, ExternalLink, ArrowRight, CheckCircle2, 
  Sparkles, ShieldCheck, Laptop, PhoneCall, FileText, X,
  Calendar, Clock, Building2, User, Mail, Phone, Filter, ChevronRight
} from 'lucide-react';
import { productsApi, Product, DemoRequestInput, QuoteRequestInput } from '../lib/productsApi';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals state
  const [demoModalProduct, setDemoModalProduct] = useState<Product | null>(null);
  const [quoteModalProduct, setQuoteModalProduct] = useState<Product | null>(null);

  // Form states
  const [demoForm, setDemoForm] = useState<DemoRequestInput>({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    demo_type: 'live_meeting',
    estimated_users: '',
    requirements: '',
    preferred_contact_method: 'whatsapp'
  });
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccessRef, setDemoSuccessRef] = useState<string | null>(null);

  const [quoteForm, setQuoteForm] = useState<QuoteRequestInput>({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    requirement_type: 'standard_license',
    estimated_users: '',
    budget_range: '',
    timeline: '',
    detailed_requirements: '',
    requested_customizations: ''
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccessRef, setQuoteSuccessRef] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productsApi.getCatalog(),
        productsApi.getCategories()
      ]);
      setProducts(prods);
      setCategories(['All', ...cats]);
    } catch (err) {
      console.error('Failed to load products catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCat;
      const matchesSearch = 
        p.name.toLowerCase().includes(query) ||
        p.short_description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.features?.some(f => f.title.toLowerCase().includes(query) || f.description.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoModalProduct) return;
    try {
      setDemoSubmitting(true);
      const res = await productsApi.requestDemo(demoModalProduct.slug, demoForm);
      if (res.success) {
        setDemoSuccessRef(res.reference || 'DEMO-SUBMITTED');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit demo request');
    } finally {
      setDemoSubmitting(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalProduct) return;
    try {
      setQuoteSubmitting(true);
      const res = await productsApi.requestQuotation(quoteModalProduct.slug, quoteForm);
      if (res.success) {
        setQuoteSuccessRef(res.reference || 'QUOTE-SUBMITTED');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quotation request');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (
    <div className="font-inter pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-brand-cyan/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold tracking-wide uppercase mb-6">
            <Sparkles size={14} className="animate-pulse" /> Digi8 Proprietary SaaS & Digital Products
          </div>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Next-Gen Software &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-teal-300 to-brand-blue">SaaS Platforms</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-brand-gray max-w-2xl mx-auto font-normal leading-relaxed">
            Ready-to-deploy, high-performance software products engineered to automate retail operations, enterprise ERP, and business workflows.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-10 max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name, feature, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b101d]/90 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan transition shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-cyan text-brand-dark font-bold shadow-lg shadow-brand-cyan/20 scale-105'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">
              {selectedCategory === 'All' ? 'All Products & Platforms' : selectedCategory}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'solution' : 'solutions'}
            </p>
          </div>
          <Link
            to="/quote-calculator"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brand-cyan hover:underline font-semibold"
          >
            Need a custom solution built? <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-[#0b101d] rounded-2xl border border-white/10 p-6 animate-pulse space-y-4">
                <div className="w-full h-48 bg-white/5 rounded-xl" />
                <div className="h-6 bg-white/10 rounded w-2/3" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-4/5" />
                <div className="h-10 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#0b101d]/60 rounded-3xl border border-dashed border-white/15 p-8 max-w-2xl mx-auto">
            <Package size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No matching software products found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              We couldn't find any products matching your search criteria. You can clear your filters or discuss custom software development.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="btn-outline-glass text-xs py-2.5 px-5"
              >
                Reset Filters
              </button>
              <Link to="/contact" className="btn-glow text-xs py-2.5 px-5">
                Contact Sales
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const formattedPrice = product.starting_price 
                ? `${product.currency === 'INR' ? '₹' : product.currency} ${Number(product.starting_price).toLocaleString('en-IN')}`
                : null;

              return (
                <div
                  key={product.id}
                  className="group relative bg-[#0b101d] rounded-2xl border border-white/10 hover:border-brand-cyan/40 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-brand-cyan/10"
                >
                  {/* Image & Header */}
                  <div className="relative h-52 bg-slate-950 overflow-hidden border-b border-white/10">
                    <img
                      src={product.banner_url || product.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b101d] via-[#0b101d]/30 to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0b101d]/90 text-brand-cyan border border-brand-cyan/30 backdrop-blur-md">
                        {product.category}
                      </span>
                      {product.is_featured && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                          FEATURED
                        </span>
                      )}
                    </div>

                    {/* Logo Overlay */}
                    {product.logo_url && (
                      <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-slate-900/90 border border-white/20 p-1.5 shadow-xl flex items-center justify-center backdrop-blur-md">
                        <img src={product.logo_url} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-outfit font-bold text-xl text-white group-hover:text-brand-cyan transition-colors line-clamp-1">
                        <Link to={`/products/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h3>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-4">
                      {product.short_description}
                    </p>

                    {/* Quick Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-1.5 mb-5 flex-1">
                        {product.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 size={13} className="text-teal-400 flex-shrink-0" />
                            <span className="truncate">{feat.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pricing Badge */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between mb-5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          Pricing Model
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {product.pricing_model || 'Contact Sales'}
                        </span>
                      </div>
                      <div className="text-right">
                        {product.display_price && formattedPrice ? (
                          <>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                              Starting At
                            </span>
                            <span className="text-sm font-extrabold text-brand-cyan">
                              {formattedPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400">
                            Custom Quote
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Link
                        to={`/products/${product.slug}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-brand-dark font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-brand-cyan/10"
                      >
                        View Details <ArrowRight size={13} />
                      </Link>

                      {product.official_website_url ? (
                        <a
                          href={product.official_website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs text-center transition flex items-center justify-center gap-1.5"
                        >
                          Visit Website <ExternalLink size={13} className="text-gray-400" />
                        </a>
                      ) : (
                        <button
                          onClick={() => setDemoModalProduct(product)}
                          className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs text-center transition flex items-center justify-center gap-1.5"
                        >
                          Request Demo
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        onClick={() => setDemoModalProduct(product)}
                        className="text-gray-400 hover:text-brand-cyan transition font-medium"
                      >
                        Schedule Live Demo
                      </button>
                      <span className="text-gray-600">•</span>
                      <button
                        onClick={() => setQuoteModalProduct(product)}
                        className="text-gray-400 hover:text-brand-cyan transition font-medium"
                      >
                        Request Quotation
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Demo Request Modal */}
      {demoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b101d] border border-brand-cyan/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => { setDemoModalProduct(null); setDemoSuccessRef(null); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {demoSuccessRef ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-outfit font-bold text-2xl text-white mb-2">Demo Request Received!</h3>
                <p className="text-xs text-gray-300 max-w-sm mx-auto mb-4">
                  Our product specialist will reach out within 2 hours to confirm your live interactive walkthrough.
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 font-mono text-xs text-brand-cyan font-bold inline-block mb-6">
                  Reference: {demoSuccessRef}
                </div>
                <div>
                  <button
                    onClick={() => { setDemoModalProduct(null); setDemoSuccessRef(null); }}
                    className="btn-glow text-xs py-2.5 px-6"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                    Interactive Walkthrough
                  </span>
                  <h3 className="font-outfit font-bold text-2xl text-white mt-1">
                    Request Demo for {demoModalProduct.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Experience real-time features, workflows, and integrations tailored to your business needs.
                  </p>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={demoForm.customer_name}
                        onChange={e => setDemoForm({...demoForm, customer_name: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Company / Store Name</label>
                      <input
                        type="text"
                        value={demoForm.company_name}
                        onChange={e => setDemoForm({...demoForm, company_name: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="Acme Retail"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={demoForm.email}
                        onChange={e => setDemoForm({...demoForm, email: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Mobile / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={demoForm.phone}
                        onChange={e => setDemoForm({...demoForm, phone: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={demoForm.preferred_date}
                        onChange={e => setDemoForm({...demoForm, preferred_date: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Preferred Time</label>
                      <input
                        type="text"
                        value={demoForm.preferred_time}
                        onChange={e => setDemoForm({...demoForm, preferred_time: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="e.g. 3:00 PM IST"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-300 block mb-1">Key Requirements or Questions</label>
                    <textarea
                      rows={2}
                      value={demoForm.requirements}
                      onChange={e => setDemoForm({...demoForm, requirements: e.target.value})}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                      placeholder="e.g. We have 3 branches and need barcode scanners + thermal printer setup..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={demoSubmitting}
                    className="w-full py-3 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-brand-dark font-bold text-xs tracking-wide uppercase transition shadow-lg shadow-brand-cyan/20 disabled:opacity-50"
                  >
                    {demoSubmitting ? 'Scheduling Demo...' : 'Confirm Demo Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quotation Request Modal */}
      {quoteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b101d] border border-brand-cyan/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => { setQuoteModalProduct(null); setQuoteSuccessRef(null); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {quoteSuccessRef ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-outfit font-bold text-2xl text-white mb-2">Quotation Request Received!</h3>
                <p className="text-xs text-gray-300 max-w-sm mx-auto mb-4">
                  Our commercial solutions architect will review your scope and provide a formal proposal with pricing breakups.
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 font-mono text-xs text-brand-cyan font-bold inline-block mb-6">
                  Reference: {quoteSuccessRef}
                </div>
                <div>
                  <button
                    onClick={() => { setQuoteModalProduct(null); setQuoteSuccessRef(null); }}
                    className="btn-glow text-xs py-2.5 px-6"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Commercial Proposal
                  </span>
                  <h3 className="font-outfit font-bold text-2xl text-white mt-1">
                    Request Quotation for {quoteModalProduct.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Get an itemized commercial proposal for standard licenses, custom modules, or multi-branch rollout.
                  </p>
                </div>

                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={quoteForm.customer_name}
                        onChange={e => setQuoteForm({...quoteForm, customer_name: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Company / Organization *</label>
                      <input
                        type="text"
                        required
                        value={quoteForm.company_name}
                        onChange={e => setQuoteForm({...quoteForm, company_name: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="Business Enterprises Ltd"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={quoteForm.email}
                        onChange={e => setQuoteForm({...quoteForm, email: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="john@business.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={quoteForm.phone}
                        onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Requirement Type</label>
                      <select
                        value={quoteForm.requirement_type}
                        onChange={e => setQuoteForm({...quoteForm, requirement_type: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                      >
                        <option value="standard_license">Standard SaaS License</option>
                        <option value="customization_request">Customization &amp; New Features</option>
                        <option value="enterprise_deployment">Enterprise On-Premise / Private Cloud</option>
                        <option value="multi_store">Multi-Store / Multi-Branch Rollout</option>
                        <option value="hardware_bundle">Hardware + Software Bundle</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-300 block mb-1">Expected Users / Stores</label>
                      <input
                        type="text"
                        value={quoteForm.estimated_users}
                        onChange={e => setQuoteForm({...quoteForm, estimated_users: e.target.value})}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        placeholder="e.g. 10 users, 2 stores"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-300 block mb-1">Detailed Requirements &amp; Scope</label>
                    <textarea
                      rows={3}
                      value={quoteForm.detailed_requirements}
                      onChange={e => setQuoteForm({...quoteForm, detailed_requirements: e.target.value})}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                      placeholder="Specify required modules, existing software integrations, hardware requirements, etc."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={quoteSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-brand-cyan hover:from-teal-300 hover:to-cyan-300 text-brand-dark font-bold text-xs tracking-wide uppercase transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {quoteSubmitting ? 'Submitting Request...' : 'Submit Quotation Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
