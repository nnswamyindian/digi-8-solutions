import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, ExternalLink, ArrowRight, CheckCircle2, ChevronDown, 
  Sparkles, ShieldCheck, Laptop, PhoneCall, FileText, X,
  Calendar, Clock, Building2, User, Mail, Phone, Play, Monitor,
  Server, Smartphone, Check, Star, HelpCircle, ArrowLeft, Eye
} from 'lucide-react';
import { productsApi, Product, DemoRequestInput, QuoteRequestInput } from '../lib/productsApi';

export default function ProductLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Screenshot lightbox
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Open FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modals
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Demo form
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

  // Quote form
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
    if (slug) {
      loadProductData(slug);
    }
  }, [slug]);

  const loadProductData = async (productSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsApi.getBySlug(productSlug);
      setProduct(data);

      // Load related products from catalog
      try {
        const catalog = await productsApi.getCatalog();
        const related = catalog.filter(p => p.id !== data.id && (p.category === data.category || p.is_featured));
        setRelatedProducts(related.slice(0, 3));
      } catch (e) {
        console.error('Failed to load related products', e);
      }
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(err.message || 'Product not found or currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      setDemoSubmitting(true);
      const res = await productsApi.requestDemo(product.slug, demoForm);
      if (res.success) {
        setDemoSuccessRef(res.reference || 'DEMO-SUCCESS');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit demo request');
    } finally {
      setDemoSubmitting(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      setQuoteSubmitting(true);
      const res = await productsApi.requestQuotation(product.slug, quoteForm);
      if (res.success) {
        setQuoteSuccessRef(res.reference || 'QUOTE-SUCCESS');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quotation request');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-brand-cyan border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Loading product specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <div className="text-center max-w-lg bg-[#0b101d] border border-white/10 rounded-2xl p-8">
          <Package size={48} className="mx-auto text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold font-outfit text-white mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">
            The software product or landing page you are looking for is either in draft mode, archived, or does not exist.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/products" className="btn-glow text-xs py-2.5 px-5">
              Browse All Products
            </Link>
            <Link to="/" className="btn-outline-glass text-xs py-2.5 px-5">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = product.banner_url || product.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="font-inter text-white pb-24 overflow-hidden">
      {/* Top Breadcrumb & Status */}
      <div className="bg-[#0b101d]/60 border-b border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-brand-cyan">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-brand-cyan">Products</Link>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </div>

          {!product.is_published && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Admin Preview Mode (Draft)
            </span>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-80 bg-brand-cyan/15 blur-[160px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
                  {product.category}
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
                  {product.product_type}
                </span>
                {product.is_featured && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950">
                    FEATURED
                  </span>
                )}
              </div>

              <h1 className="font-outfit font-black text-3xl sm:text-5xl lg:text-5xl tracking-tight leading-tight text-white">
                {product.name}
              </h1>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-normal">
                {product.short_description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="btn-glow text-xs sm:text-sm py-3 px-6 justify-center flex items-center gap-2 font-bold"
                >
                  <Calendar size={16} /> Request Live Demo
                </button>

                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="btn-outline-glass text-xs sm:text-sm py-3 px-6 justify-center flex items-center gap-2 font-bold"
                >
                  <FileText size={16} /> Request Quotation
                </button>

                {product.official_website_url && (
                  <a
                    href={product.official_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink size={14} className="text-brand-cyan" />
                  </a>
                )}

                {product.application_url && (
                  <a
                    href={product.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
                  >
                    <span>Launch Web App</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-400 flex-shrink-0" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Laptop size={16} className="text-brand-cyan flex-shrink-0" />
                  <span>Cloud &amp; On-Premise</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} className="text-teal-400 flex-shrink-0" />
                  <span>24/7 Dedicated Support</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Banner Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl border border-brand-cyan/30 overflow-hidden shadow-2xl shadow-brand-cyan/15 group bg-slate-950">
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-80 sm:h-96 object-cover object-top group-hover:scale-102 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b101d] via-transparent to-transparent opacity-80" />
                
                {/* Logo & Quick Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
                  <div className="flex items-center gap-3">
                    {product.logo_url && (
                      <img src={product.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1 border border-white/10" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">{product.name}</div>
                      <div className="text-[11px] text-gray-400">{product.pricing_model}</div>
                    </div>
                  </div>
                  {product.starting_price && (
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Starts at</div>
                      <div className="text-xs font-extrabold text-brand-cyan">
                        {product.currency === 'INR' ? '₹' : product.currency} {Number(product.starting_price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Overview & Problem Solved */}
      {product.description && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan block mb-2">
                Executive Overview
              </span>
              <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-white">
                Engineered for High-Scale Operations
              </h2>
            </div>
            <div className="lg:col-span-8 bg-[#0b101d] rounded-2xl p-6 sm:p-8 border border-white/10">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line font-normal">
                {product.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Key Features Grid */}
      {product.features && product.features.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan block mb-2">
              Capabilities &amp; Functionality
            </span>
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl text-white">
              Powerful Features Built for Productivity
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Every tool and automation module you need to run operations seamlessly without technical friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-[#0b101d] border border-white/10 hover:border-brand-cyan/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-brand-cyan/5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="font-outfit font-bold text-base text-white mb-2 group-hover:text-brand-cyan transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Product Screenshots Gallery */}
      {product.screenshots && product.screenshots.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-2">
              User Interface &amp; Visual Tour
            </span>
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl text-white">
              Intuitive Interface &amp; Fast Workflows
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Click any screenshot to inspect high-resolution interfaces, reports, and dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.screenshots.map((screen, idx) => (
              <div
                key={idx}
                onClick={() => setActiveScreenshot(screen.image_url)}
                className="cursor-pointer group relative bg-slate-950 rounded-2xl border border-white/10 overflow-hidden hover:border-brand-cyan/50 transition-all duration-300 shadow-lg"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={screen.image_url}
                    alt={screen.caption || 'Screenshot'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-lg bg-brand-cyan text-brand-dark font-bold text-xs flex items-center gap-1.5 shadow-lg">
                    <Eye size={14} /> View Screenshot
                  </span>
                </div>
                {screen.caption && (
                  <div className="p-3 bg-[#0b101d] border-t border-white/10 text-xs text-gray-300 font-medium">
                    {screen.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Screenshot Lightbox Modal */}
      {activeScreenshot && (
        <div 
          onClick={() => setActiveScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <button
              onClick={() => setActiveScreenshot(null)}
              className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full hover:bg-black"
            >
              <X size={20} />
            </button>
            <img src={activeScreenshot} alt="Preview" className="w-full h-auto max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* Pricing & Commercial Plans */}
      {product.plans && product.plans.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan block mb-2">
              Flexible Licensing
            </span>
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl text-white">
              Transparent Pricing Packages
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Select the license tier that fits your store size, users, and deployment requirements.
            </p>
          </div>

          <div className={`grid grid-cols-1 ${product.plans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'} gap-8 mx-auto`}>
            {product.plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.is_featured
                    ? 'bg-gradient-to-b from-[#0e172a] to-[#0b101d] border-2 border-brand-cyan shadow-2xl shadow-brand-cyan/15 scale-102 z-10'
                    : 'bg-[#0b101d] border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.is_featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-teal-400 to-brand-cyan text-brand-dark text-[11px] font-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-outfit font-bold text-xl text-white mb-2">{plan.plan_name}</h3>
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {plan.currency === 'INR' ? '₹' : plan.currency} {Number(plan.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">/ {plan.billing_interval}</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-white/10 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <Check size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setQuoteForm(prev => ({
                        ...prev,
                        requirement_type: 'standard_license',
                        detailed_requirements: `Inquiry regarding the ${plan.plan_name} plan (${plan.currency} ${plan.price}/${plan.billing_interval})`
                      }));
                      setQuoteModalOpen(true);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                      plan.is_featured
                        ? 'bg-brand-cyan hover:bg-cyan-400 text-brand-dark shadow-lg shadow-brand-cyan/20'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-2">
                Architecture &amp; Ecosystem
              </span>
              <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-white">
                Technical Specifications &amp; Compatibility
              </h2>
            </div>

            <div className="bg-[#0b101d] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/10">
              {product.specifications.deployment && (
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Server size={15} className="text-brand-cyan" /> Deployment Models
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {product.specifications.deployment}
                  </span>
                </div>
              )}

              {product.specifications.platforms && (
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Monitor size={15} className="text-brand-cyan" /> Supported Operating Systems
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {product.specifications.platforms}
                  </span>
                </div>
              )}

              {product.specifications.devices && (
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone size={15} className="text-brand-cyan" /> Hardware &amp; Devices
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {product.specifications.devices}
                  </span>
                </div>
              )}

              {product.specifications.integrations && (
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={15} className="text-brand-cyan" /> Peripherals &amp; Integrations
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {product.specifications.integrations}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {product.faqs && product.faqs.length > 0 && (
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan block mb-2">
              Common Inquiries
            </span>
            <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {product.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#0b101d] border border-white/10 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-brand-cyan transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                More Solutions
              </span>
              <h2 className="font-outfit font-bold text-2xl text-white">
                Related Enterprise Software
              </h2>
            </div>
            <Link to="/products" className="text-xs text-brand-cyan hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(rel => (
              <div key={rel.id} className="bg-[#0b101d] rounded-2xl border border-white/10 p-5 flex flex-col justify-between hover:border-brand-cyan/40 transition">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-cyan mb-2 block">
                    {rel.category}
                  </span>
                  <h3 className="font-outfit font-bold text-lg text-white mb-2">
                    <Link to={`/products/${rel.slug}`} className="hover:text-brand-cyan transition">
                      {rel.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                    {rel.short_description}
                  </p>
                </div>
                <Link
                  to={`/products/${rel.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-cyan font-bold hover:gap-2 transition-all"
                >
                  Explore Solution <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Conversion Banner */}
      <section className="pt-20 pb-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-brand-cyan/30 text-center relative overflow-hidden bg-gradient-to-r from-brand-cyan/10 via-[#0b101d] to-brand-blue/10">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-outfit font-black text-2xl sm:text-4xl text-white">
              Ready to Accelerate With {product.name}?
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-normal">
              Schedule a personalized walkthrough or request a customized proposal with your operational scope.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="btn-glow text-xs sm:text-sm py-3 px-8 font-bold"
              >
                Schedule Live Demo
              </button>
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="btn-outline-glass text-xs sm:text-sm py-3 px-8 font-bold"
              >
                Request Proposal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Request Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b101d] border border-brand-cyan/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => { setDemoModalOpen(false); setDemoSuccessRef(null); }}
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
                    onClick={() => { setDemoModalOpen(false); setDemoSuccessRef(null); }}
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
                    Request Demo for {product.name}
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

      {/* Interactive Quotation Request Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b101d] border border-brand-cyan/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => { setQuoteModalOpen(false); setQuoteSuccessRef(null); }}
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
                    onClick={() => { setQuoteModalOpen(false); setQuoteSuccessRef(null); }}
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
                    Request Quotation for {product.name}
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
