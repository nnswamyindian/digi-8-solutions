import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import {
  ArrowLeft, Save, Eye, CheckCircle2, AlertCircle, Upload, Plus, Trash2,
  Globe, ExternalLink, Image as ImageIcon, DollarSign, Layers, ShieldCheck,
  Zap, HelpCircle, Star, MoveUp, MoveDown, Check, Loader2, Sparkles, FileText, X
} from 'lucide-react';
import {
  Product,
  ProductFeature,
  ProductPlan,
  ProductScreenshot,
  ProductFaq,
  fetchAdminProduct,
  saveAdminProduct,
  uploadProductImage
} from '../../../lib/productsApi';
import { extractColorsFromImage } from '../../../lib/colorExtractor';
import { generateProductWithAI } from '../../../lib/productAiGenerator';

export default function AdminProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Active form section tab
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'links' | 'pricing' | 'features' | 'faqs' | 'settings'>('basic');

  // Loading & submit states
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiTotalInfo, setAiTotalInfo] = useState('');
  const [aiCategory, setAiCategory] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccessBanner, setAiSuccessBanner] = useState(false);

  // Auto Colors
  const [brandColor, setBrandColor] = useState('#00e5ff');
  const [cardColor, setCardColor] = useState('#0b101d');
  const [colorAutoExtracted, setColorAutoExtracted] = useState(false);

  // Image upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SaaS & Digital Solutions');
  const [productType, setProductType] = useState('SaaS Platform');
  const [logoUrl, setLogoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  // Links
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoDemoUrl, setVideoDemoUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [supportUrl, setSupportUrl] = useState('');

  // Pricing
  const [pricingModel, setPricingModel] = useState('Monthly Subscription');
  const [currency, setCurrency] = useState('INR');
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [annualPrice, setAnnualPrice] = useState<number>(0);
  const [trialAvailable, setTrialAvailable] = useState(true);
  const [trialDays, setTrialDays] = useState(14);
  const [setupFee, setSetupFee] = useState<number>(0);
  const [pricingNotes, setPricingNotes] = useState('');
  const [displayPrice, setDisplayPrice] = useState(true);

  // Nested structures
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [screenshots, setScreenshots] = useState<ProductScreenshot[]>([]);
  const [plans, setPlans] = useState<ProductPlan[]>([]);
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);

  // Specifications
  const [platforms, setPlatforms] = useState('');
  const [devices, setDevices] = useState('');
  const [hardware, setHardware] = useState('');
  const [deployment, setDeployment] = useState('');
  const [compliance, setCompliance] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Load existing product if editing
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      fetchAdminProduct(id).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setName(p.name || '');
          setSlug(p.slug || '');
          setShortDescription(p.short_description || '');
          setDescription(p.description || '');
          setCategory(p.category || 'SaaS & Digital Solutions');
          setProductType(p.product_type || 'SaaS Platform');
          setLogoUrl(p.logo_url || '');
          setThumbnailUrl(p.thumbnail_url || '');
          setBannerUrl(p.banner_url || '');
          setIsFeatured(Boolean(p.is_featured));
          setDisplayOrder(p.display_order ?? 0);
          setStatus(p.status || (p.is_published ? 'published' : 'draft'));
          if (p.brand_color) setBrandColor(p.brand_color);
          if (p.card_color) setCardColor(p.card_color);

          setOfficialWebsiteUrl(p.official_website_url || '');
          setApplicationUrl(p.application_url || '');
          setLoginUrl(p.login_url || '');
          setDemoUrl(p.demo_url || '');
          setVideoDemoUrl(p.video_demo_url || '');
          setDocumentationUrl(p.documentation_url || '');
          setSupportUrl(p.support_url || '');

          setPricingModel(p.pricing_model || 'Monthly Subscription');
          setCurrency(p.currency || 'INR');
          setStartingPrice(p.starting_price ?? 0);
          setMonthlyPrice(p.monthly_price ?? 0);
          setAnnualPrice(p.annual_price ?? 0);
          setTrialAvailable(Boolean(p.trial_available));
          setTrialDays(p.trial_days ?? 14);
          setSetupFee(p.setup_fee ?? 0);
          setPricingNotes(p.pricing_notes || '');
          setDisplayPrice(p.display_price !== false);

          setFeatures(Array.isArray(p.features) ? p.features : []);
          setBenefits(Array.isArray(p.benefits) ? p.benefits : []);
          setScreenshots(Array.isArray(p.screenshots) ? p.screenshots : []);
          setPlans(Array.isArray(p.plans) ? p.plans : []);
          setFaqs(Array.isArray(p.faqs) ? p.faqs : []);

          if (p.specifications) {
            setPlatforms(p.specifications.platforms || '');
            setDevices(p.specifications.devices || '');
            setHardware(p.specifications.hardware || '');
            setDeployment(p.specifications.deployment || '');
            setCompliance(p.specifications.compliance || '');
          }

          setSeoTitle(p.seo_title || '');
          setSeoDescription(p.seo_description || '');
        } else {
          setSaveError(res.error || 'Failed to load product');
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  // Auto-slug generator on new products
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Color extraction from logo
  const triggerColorExtraction = async (source: string | File) => {
    try {
      const palette = await extractColorsFromImage(source);
      if (palette.brandColor) {
        setBrandColor(palette.brandColor);
        setCardColor(palette.cardColor);
        setColorAutoExtracted(true);
      }
    } catch (err) {
      console.warn('Failed to extract color from logo', err);
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (file: File, target: 'logo' | 'thumb' | 'banner' | 'screenshot') => {
    try {
      if (target === 'logo') {
        setUploadingLogo(true);
        triggerColorExtraction(file);
      }
      if (target === 'thumb') setUploadingThumb(true);
      if (target === 'banner') setUploadingBanner(true);
      if (target === 'screenshot') setUploadingScreenshot(true);

      const res = await uploadProductImage(file);
      if (res.success && res.url) {
        if (target === 'logo') {
          setLogoUrl(res.url);
        }
        if (target === 'thumb') setThumbnailUrl(res.url);
        if (target === 'banner') setBannerUrl(res.url);
        if (target === 'screenshot') {
          setScreenshots(prev => [
            ...prev,
            { id: Date.now().toString(), url: res.url!, caption: file.name.replace(/\.[^/.]+$/, ''), display_order: prev.length + 1 }
          ]);
        }
      } else {
        setSaveError(res.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Image upload error.');
    } finally {
      setUploadingLogo(false);
      setUploadingThumb(false);
      setUploadingBanner(false);
      setUploadingScreenshot(false);
    }
  };

  // Feature Helpers
  const addFeature = () => {
    setFeatures(prev => [
      ...prev,
      { id: Date.now().toString(), title: '', description: '', icon: 'Zap', display_order: prev.length + 1 }
    ]);
  };

  const removeFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFeature = (idx: number, field: keyof ProductFeature, val: any) => {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };

  // Plan Helpers
  const addPlan = () => {
    setPlans(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        plan_name: `Plan ${prev.length + 1}`,
        price: startingPrice || 1999,
        currency: 'INR',
        billing_interval: 'month',
        features: ['Full feature access', 'Standard support'],
        is_featured: prev.length === 1,
        cta_label: 'Get Started',
        cta_destination: 'demo'
      }
    ]);
  };

  const removePlan = (idx: number) => {
    setPlans(prev => prev.filter((_, i) => i !== idx));
  };

  const updatePlan = (idx: number, field: keyof ProductPlan, val: any) => {
    setPlans(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  // FAQ Helpers
  const addFaq = () => {
    setFaqs(prev => [
      ...prev,
      { id: Date.now().toString(), question: '', answer: '', display_order: prev.length + 1 }
    ]);
  };

  const removeFaq = (idx: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, field: keyof ProductFaq, val: any) => {
    setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };

  // Benefits Helpers
  const addBenefitItem = () => {
    if (!newBenefit.trim()) return;
    setBenefits(prev => [...prev, newBenefit.trim()]);
    setNewBenefit('');
  };

  const removeBenefitItem = (idx: number) => {
    setBenefits(prev => prev.filter((_, i) => i !== idx));
  };

  // AI Auto-Fill Handler
  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTitle.trim() && !aiTotalInfo.trim()) return;

    setAiGenerating(true);
    try {
      const generated = await generateProductWithAI({
        title: aiTitle.trim() || name.trim() || 'New Digital Solution',
        totalInfo: aiTotalInfo.trim(),
        category: aiCategory.trim() || undefined
      });

      setName(generated.name);
      setSlug(generated.slug);
      setShortDescription(generated.short_description);
      setDescription(generated.description);
      setCategory(generated.category);
      setProductType(generated.product_type);
      setPricingModel(generated.pricing_model);
      setCurrency(generated.currency);
      setStartingPrice(generated.starting_price);
      setMonthlyPrice(generated.monthly_price);
      setAnnualPrice(generated.annual_price);
      setTrialAvailable(generated.trial_available);
      setTrialDays(generated.trial_days);
      setPricingNotes(generated.pricing_notes);
      setDisplayPrice(generated.display_price);
      setIsFeatured(generated.is_featured);

      if (generated.brand_color) setBrandColor(generated.brand_color);
      if (generated.card_color) setCardColor(generated.card_color);

      setFeatures(generated.features);
      setBenefits(generated.benefits);
      setPlans(generated.plans);
      setPlatforms(generated.specifications.platforms);
      setDevices(generated.specifications.devices);
      setDeployment(generated.specifications.deployment);
      setHardware(generated.specifications.integrations);
      setFaqs(generated.faqs);
      setSeoTitle(generated.seo_title);
      setSeoDescription(generated.seo_description);

      setAiModalOpen(false);
      setAiSuccessBanner(true);
      setTimeout(() => setAiSuccessBanner(false), 9000);
    } catch (err: any) {
      alert(err.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  // Form Submit
  const handleSave = async (publishIntent?: boolean) => {
    if (!name.trim()) {
      setSaveError('Please enter a product name.');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const targetStatus = publishIntent !== undefined 
      ? (publishIntent ? 'published' : 'draft') 
      : status;
    const isPub = targetStatus === 'published';

    const payload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim().toLowerCase() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: shortDescription.trim(),
      description: description.trim(),
      category: category.trim(),
      product_type: productType.trim(),
      logo_url: logoUrl.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      banner_url: bannerUrl.trim(),
      brand_color: brandColor,
      card_color: cardColor,
      is_featured: isFeatured,
      display_order: Number(displayOrder) || 0,
      status: targetStatus,
      is_published: isPub,

      official_website_url: officialWebsiteUrl.trim(),
      application_url: applicationUrl.trim(),
      login_url: loginUrl.trim(),
      demo_url: demoUrl.trim(),
      video_demo_url: videoDemoUrl.trim(),
      documentation_url: documentationUrl.trim(),
      support_url: supportUrl.trim(),

      pricing_model: pricingModel,
      currency,
      starting_price: Number(startingPrice) || 0,
      monthly_price: Number(monthlyPrice) || 0,
      annual_price: Number(annualPrice) || 0,
      trial_available: trialAvailable,
      trial_days: Number(trialDays) || 0,
      setup_fee: Number(setupFee) || 0,
      pricing_notes: pricingNotes.trim(),
      display_price: displayPrice,

      features,
      benefits,
      screenshots,
      plans,
      specifications: {
        platforms: platforms.trim(),
        devices: devices.trim(),
        hardware: hardware.trim(),
        deployment: deployment.trim(),
        compliance: compliance.trim()
      },
      faqs,
      seo_title: seoTitle.trim(),
      seo_description: seoDescription.trim()
    };

    try {
      const res = await saveAdminProduct(payload, isEdit ? id : undefined);
      if (res.success) {
        setSaveSuccess(res.message || 'Product saved successfully!');
        setStatus(targetStatus);
        setTimeout(() => {
          navigate('/admin/products');
        }, 1200);
      } else {
        setSaveError(res.error || 'Failed to save product.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error occurred while saving product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">

        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-outfit font-black text-white flex items-center gap-2">
                {isEdit ? `Edit: ${name || 'Product'}` : 'Create New Product / SaaS Solution'}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                  status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}>
                  {status}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Configure features, pricing, landing page showcase, official URLs, and demo settings.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* AI Auto-Fill Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setAiTitle(name);
                setAiModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-brand-cyan hover:from-emerald-300 hover:to-cyan-200 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.03]"
            >
              <Sparkles size={14} className="text-slate-950 animate-pulse" />
              <span>Auto-Fill with AI</span>
            </button>

            {slug && (
              <Link
                to={`/products/${slug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Eye size={14} className="text-brand-cyan" />
                <span>Preview Page</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isEdit && status === 'published' ? 'Save & Update Live' : 'Publish Product'}</span>
            </button>
          </div>
        </div>

        {/* AI Success Notification */}
        {aiSuccessBanner && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/15 to-brand-cyan/15 border border-brand-cyan/40 text-teal-300 flex items-start gap-3 text-xs animate-fade-in shadow-lg">
            <Sparkles size={18} className="text-brand-cyan flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white block mb-0.5">✨ AI Auto-Fill Generated Successfully!</span>
              <span>All 7 sections (Basic Info, Theme Colors, Pricing Tiers, Features, Specs, FAQs, SEO) have been automatically populated based on your provided product information. Review or tweak any details below.</span>
            </div>
            <button onClick={() => setAiSuccessBanner(false)} className="text-gray-400 hover:text-white">
              <Check size={16} />
            </button>
          </div>
        )}

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
            <AlertCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-2 rounded-xl bg-[#0b101d] border border-white/10 text-xs">
          {[
            { id: 'basic', label: 'Basic Info', icon: Layers },
            { id: 'images', label: 'Images & Media', icon: ImageIcon },
            { id: 'links', label: 'Product URLs & Demo', icon: Globe },
            { id: 'pricing', label: 'Pricing & Plans', icon: DollarSign },
            { id: 'features', label: 'Features & Specs', icon: Zap },
            { id: 'faqs', label: 'FAQs & Answers', icon: HelpCircle },
            { id: 'settings', label: 'SEO & Visibility', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-brand-cyan text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM CONTENT CONTAINER */}
        <div className="bg-[#0b101d] rounded-2xl border border-white/10 p-6 shadow-2xl">

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-outfit font-bold text-white">Section A — Basic Information</h3>
                <p className="text-[11px] text-slate-400">Core identity, category, and catalog description.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Mana Kiranakottu or Digi8 CRM Suite"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-cyan font-semibold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    URL Slug * <span className="text-slate-500 font-normal">(/products/:slug)</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                    placeholder="e.g. mana-kiranakottu"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-brand-cyan font-mono text-xs focus:outline-none focus:border-brand-cyan"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Retail & Kirana Billing Software, SaaS, ERP"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Type</label>
                  <input
                    type="text"
                    value={productType}
                    onChange={e => setProductType(e.target.value)}
                    placeholder="e.g. SaaS / Business Software, Cloud Platform, Mobile App"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Description (for Cards &amp; Meta)</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="One or two sentences summarizing the product's primary value proposition..."
                  className="w-full bg-[#070b13] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Description (for Landing Page Hero &amp; Overview)</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed explanation of what the product solves, architecture, and who it is built for..."
                  className="w-full bg-[#070b13] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-cyan leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Featured Product</div>
                    <div className="text-[10px] text-slate-400">Highlight on homepage &amp; catalog top</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={e => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Live)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES & MEDIA */}
          {activeTab === 'images' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-outfit font-bold text-white">Section B — Product Images &amp; Media</h3>
                <p className="text-[11px] text-slate-400">Upload logos, primary card thumbnails, hero banners, and showcase screenshots.</p>
              </div>

              {/* Logo & Thumbnail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logo & Automatic Theme Color Extraction */}
                <div className="p-4 rounded-xl bg-[#070b13] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Product Logo</span>
                    {uploadingLogo && <span className="text-[10px] text-brand-cyan animate-pulse">Analyzing &amp; Uploading...</span>}
                  </div>
                  {logoUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative group shrink-0">
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                        <button
                          type="button"
                          onClick={() => { setLogoUrl(''); setColorAutoExtracted(false); }}
                          className="absolute top-1 right-1 p-1 rounded bg-black/80 text-rose-400 hover:text-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 size={13} />
                          <span>Logo Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Brand and card colors are automatically sampled from this image.
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter logo image URL or upload..."
                      value={logoUrl}
                      onChange={e => {
                        setLogoUrl(e.target.value);
                        if (e.target.value.startsWith('http') || e.target.value.startsWith('/uploads')) {
                          triggerColorExtraction(e.target.value);
                        }
                      }}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center gap-1 font-semibold shrink-0">
                      <Upload size={12} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                      />
                    </label>
                  </div>

                  {/* Auto-Extracted Color Scheme Controls */}
                  <div className="mt-3 p-3 rounded-lg bg-black/50 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">🎨 Auto Theme Colors</span>
                        {colorAutoExtracted && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            Extracted from Logo
                          </span>
                        )}
                      </div>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => triggerColorExtraction(logoUrl)}
                          className="text-[10px] text-brand-cyan hover:underline font-semibold"
                        >
                          Re-extract Colors
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Product Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={brandColor}
                            onChange={e => setBrandColor(e.target.value)}
                            className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={brandColor}
                            onChange={e => setBrandColor(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 font-mono text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Card Background Theme</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={cardColor}
                            onChange={e => setCardColor(e.target.value)}
                            className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={cardColor}
                            onChange={e => setCardColor(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 font-mono text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Preview of the Extracted Colors */}
                    <div
                      className="p-2.5 rounded-lg border transition-all flex items-center justify-between text-[11px]"
                      style={{
                        backgroundColor: cardColor || '#0b101d',
                        borderColor: brandColor ? `${brandColor}50` : 'rgba(0, 229, 255, 0.3)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: brandColor }} />
                        <span className="text-white font-semibold">Live Card Theme Preview</span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: `${brandColor}25`, color: brandColor }}
                      >
                        Dynamic Palette
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Thumbnail */}
                <div className="p-4 rounded-xl bg-[#070b13] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Catalog Thumbnail Image (16:9 / 4:3)</span>
                    {uploadingThumb && <span className="text-[10px] text-brand-cyan animate-pulse">Uploading...</span>}
                  </div>
                  {thumbnailUrl ? (
                    <div className="w-40 h-24 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative group">
                      <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="absolute top-1 right-1 p-1 rounded bg-black/80 text-rose-400 hover:text-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter thumbnail URL or upload..."
                      value={thumbnailUrl}
                      onChange={e => setThumbnailUrl(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center gap-1 font-semibold shrink-0">
                      <Upload size={12} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumb')}
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* Main Banner */}
              <div className="p-4 rounded-xl bg-[#070b13] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Hero Main Banner (Full Width Desktop Preview)</span>
                  {uploadingBanner && <span className="text-[10px] text-brand-cyan animate-pulse">Uploading...</span>}
                </div>
                {bannerUrl ? (
                  <div className="w-full h-40 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative group">
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-rose-400 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter main banner image URL or upload..."
                    value={bannerUrl}
                    onChange={e => setBannerUrl(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center gap-1 font-semibold shrink-0">
                    <Upload size={12} /> Upload Banner
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
                    />
                  </label>
                </div>
              </div>

              {/* Product Screenshots Gallery */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-outfit font-bold text-white text-sm">Product Screenshots &amp; Dashboard Views</h4>
                    <p className="text-[11px] text-slate-400">Interactive lightbox screenshots displayed on the landing page.</p>
                  </div>
                  <label className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-brand-cyan border border-brand-cyan/30 cursor-pointer flex items-center gap-1 font-bold">
                    <Upload size={13} /> Upload Screenshot
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'screenshot')}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {screenshots.map((s, idx) => (
                    <div key={s.id || idx} className="p-3 rounded-xl bg-[#070b13] border border-white/10 space-y-2">
                      <div className="h-32 rounded-lg bg-black/60 border border-white/5 overflow-hidden relative group">
                        <img src={s.url} alt={s.caption} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-black/80 text-rose-400 hover:text-white"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Caption e.g. Fast Checkout Terminal"
                        value={s.caption || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setScreenshots(prev => prev.map((item, i) => i === idx ? { ...item, caption: val } : item));
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT URLS & DEMO SETTINGS */}
          {activeTab === 'links' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-outfit font-bold text-white">Section C — Product Website &amp; External Links</h3>
                <p className="text-[11px] text-slate-400">
                  Separately manage official product sites, live hosted applications, and self-service demo links.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Official Product Website URL <span className="text-brand-cyan">(External Site)</span>
                  </label>
                  <input
                    type="url"
                    value={officialWebsiteUrl}
                    onChange={e => setOfficialWebsiteUrl(e.target.value)}
                    placeholder="https://manakiranakottu.dzgsolutions.com"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Rendered as a direct "Visit Official Website" CTA button on the landing page.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Live Product Application URL
                  </label>
                  <input
                    type="url"
                    value={applicationUrl}
                    onChange={e => setApplicationUrl(e.target.value)}
                    placeholder="https://manakiranakottu.dzgsolutions.com/app"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    URL to the customer app portal or SaaS tenant login.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Live Interactive Demo URL (Self-service sandbox)
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    placeholder="https://manakiranakottu.dzgsolutions.com/demo"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Promotional Video / YouTube Walkthrough URL
                  </label>
                  <input
                    type="url"
                    value={videoDemoUrl}
                    onChange={e => setVideoDemoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Login URL (Optional)</label>
                  <input
                    type="url"
                    value={loginUrl}
                    onChange={e => setLoginUrl(e.target.value)}
                    placeholder="https://manakiranakottu.dzgsolutions.com/login"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Documentation URL</label>
                  <input
                    type="url"
                    value={documentationUrl}
                    onChange={e => setDocumentationUrl(e.target.value)}
                    placeholder="https://docs.digi8solutions.com"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Support URL</label>
                  <input
                    type="url"
                    value={supportUrl}
                    onChange={e => setSupportUrl(e.target.value)}
                    placeholder="https://digi8solutions.com/contact"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING & PLANS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-outfit font-bold text-white">Section D — Product Pricing &amp; Tiered Plans</h3>
                <p className="text-[11px] text-slate-400">Configure public pricing display, starting rates, and interactive plan tiers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pricing Model</label>
                  <select
                    value={pricingModel}
                    onChange={e => setPricingModel(e.target.value)}
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold"
                  >
                    <option value="Free">Free</option>
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Monthly Subscription">Monthly Subscription</option>
                    <option value="Quarterly Subscription">Quarterly Subscription</option>
                    <option value="Annual Subscription">Annual Subscription</option>
                    <option value="Per User">Per User</option>
                    <option value="Tiered Pricing">Tiered Pricing</option>
                    <option value="Custom Quotation">Custom Quotation</option>
                    <option value="Contact Sales">Contact Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starting Price (₹ INR)</label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={e => setStartingPrice(Number(e.target.value))}
                    placeholder="1999"
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Display Price Publicly</div>
                    <div className="text-[10px] text-slate-400">If unchecked, shows "Contact Sales"</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={displayPrice}
                    onChange={e => setDisplayPrice(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-brand-cyan"
                  />
                </div>
              </div>

              {/* Free Trial & Setup Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Free Trial Available</div>
                    <div className="text-[10px] text-slate-400">No credit card required</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={trialAvailable}
                    onChange={e => setTrialAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan accent-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trial Duration (Days)</label>
                  <input
                    type="number"
                    value={trialDays}
                    onChange={e => setTrialDays(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Setup / Onboarding Fee (₹)</label>
                  <input
                    type="number"
                    value={setupFee}
                    onChange={e => setSetupFee(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Plan Tiers Builder */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-outfit font-bold text-white text-sm">Tiered Subscription Plans (e.g. Starter, Pro, Enterprise)</h4>
                    <p className="text-[11px] text-slate-400">Add comparative plans shown in the pricing table.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addPlan}
                    className="px-3 py-1.5 rounded-xl bg-brand-cyan text-black font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Plan Tier
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan, idx) => (
                    <div
                      key={plan.id || idx}
                      className={`p-4 rounded-xl border relative flex flex-col justify-between ${
                        plan.is_featured
                          ? 'bg-cyan-950/20 border-brand-cyan/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                          : 'bg-[#070b13] border-white/10'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => removePlan(idx)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between pr-6">
                          <input
                            type="text"
                            value={plan.plan_name}
                            onChange={e => updatePlan(idx, 'plan_name', e.target.value)}
                            placeholder="Plan Name"
                            className="bg-transparent border-b border-white/20 font-outfit font-bold text-white text-sm focus:outline-none focus:border-brand-cyan"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">₹</span>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={e => updatePlan(idx, 'price', Number(e.target.value))}
                            className="w-24 bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono font-bold"
                          />
                          <span className="text-slate-400 text-[10px]">/{plan.billing_interval}</span>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Included Features (One per line):</label>
                          <textarea
                            rows={4}
                            value={Array.isArray(plan.features) ? plan.features.join('\n') : ''}
                            onChange={e => updatePlan(idx, 'features', e.target.value.split('\n'))}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-[11px] text-white font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Featured Highlight</span>
                          <input
                            type="checkbox"
                            checked={Boolean(plan.is_featured)}
                            onChange={e => updatePlan(idx, 'is_featured', e.target.checked)}
                            className="w-3.5 h-3.5 accent-brand-cyan"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between">
                        <input
                          type="text"
                          value={plan.cta_label || 'Get Started'}
                          onChange={e => updatePlan(idx, 'cta_label', e.target.value)}
                          placeholder="CTA Label"
                          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-brand-cyan w-28"
                        />
                        <select
                          value={plan.cta_destination || 'demo'}
                          onChange={e => updatePlan(idx, 'cta_destination', e.target.value as any)}
                          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-slate-300"
                        >
                          <option value="demo">Opens Demo</option>
                          <option value="quote">Opens Quote</option>
                          <option value="website">Opens Website</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FEATURES & SPECIFICATIONS */}
          {activeTab === 'features' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-outfit font-bold text-white">Section E — Product Features &amp; Technical Specs</h3>
                <p className="text-[11px] text-slate-400">Configure key feature pillars and platform compatibility.</p>
              </div>

              {/* Features Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-outfit font-bold text-white text-sm">Key Capabilities &amp; Features</span>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-1.5 rounded-xl bg-brand-cyan text-black font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>

                <div className="space-y-3">
                  {features.map((feat, idx) => (
                    <div key={feat.id || idx} className="p-3.5 rounded-xl bg-[#070b13] border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold shrink-0 mt-1">
                        {idx + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Feature Title *</label>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={e => updateFeature(idx, 'title', e.target.value)}
                            placeholder="e.g. Barcode & QR Scanning"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-1">Feature Description *</label>
                          <input
                            type="text"
                            value={feat.description}
                            onChange={e => updateFeature(idx, 'description', e.target.value)}
                            placeholder="Instant recognition with USB & Bluetooth 1D/2D desktop scanners..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 shrink-0 mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Benefits */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="font-outfit font-bold text-white text-sm">Target Outcomes &amp; Business Benefits</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={e => setNewBenefit(e.target.value)}
                    placeholder="e.g. Reduce customer checkout waiting times by over 60%"
                    className="flex-1 bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBenefitItem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addBenefitItem}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5">
                  {benefits.map((b, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>{b}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBenefitItem(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="font-outfit font-bold text-white text-sm">Product Specifications &amp; Compatibility</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Supported Platforms</label>
                    <input
                      type="text"
                      value={platforms}
                      onChange={e => setPlatforms(e.target.value)}
                      placeholder="Web (Chrome, Edge), Windows 10/11, Android 9.0+"
                      className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Supported Devices</label>
                    <input
                      type="text"
                      value={devices}
                      onChange={e => setDevices(e.target.value)}
                      placeholder="Desktop PCs, POS Terminals, Laptops, Android Tablets"
                      className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hardware Integrations</label>
                    <input
                      type="text"
                      value={hardware}
                      onChange={e => setHardware(e.target.value)}
                      placeholder="USB/Bluetooth Barcode Scanners, 58mm/80mm Thermal Printers"
                      className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Deployment Model</label>
                    <input
                      type="text"
                      value={deployment}
                      onChange={e => setDeployment(e.target.value)}
                      placeholder="Cloud SaaS with offline-cached local sync engine"
                      className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-outfit font-bold text-white">Section F — Frequently Asked Questions (FAQs)</h3>
                  <p className="text-[11px] text-slate-400">Address common customer questions on the landing page.</p>
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  className="px-3 py-1.5 rounded-xl bg-brand-cyan text-black font-bold text-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add FAQ
                </button>
              </div>

              <div className="space-y-3.5">
                {faqs.map((faq, idx) => (
                  <div key={faq.id || idx} className="p-4 rounded-xl bg-[#070b13] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-cyan">Question #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={e => updateFaq(idx, 'question', e.target.value)}
                      placeholder="e.g. Does the software work without internet?"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={e => updateFaq(idx, 'answer', e.target.value)}
                      placeholder="Provide the helpful answer..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SEO & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-outfit font-bold text-white">Section G — SEO Metadata &amp; Publishing Controls</h3>
                <p className="text-[11px] text-slate-400">Search engine optimization titles, descriptions, and audit settings.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="e.g. Mana Kiranakottu — Retail & Kirana Billing Software | Digi8 Solutions"
                  className="w-full bg-[#070b13] border border-white/10 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  placeholder="Compelling meta summary for Google search listings (140-160 characters recommended)..."
                  className="w-full bg-[#070b13] border border-white/10 rounded-xl p-3 text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-brand-cyan/20 space-y-2">
                <div className="font-outfit font-bold text-brand-cyan text-sm flex items-center gap-2">
                  <Globe size={16} /> Google Search Result Preview
                </div>
                <div className="text-blue-400 text-sm font-semibold hover:underline">
                  {seoTitle || `${name || 'Product Name'} | Digi8 Solutions`}
                </div>
                <div className="text-emerald-400 font-mono text-[11px]">
                  https://digi8solutions.com/products/{slug || 'product-slug'}
                </div>
                <div className="text-slate-400 text-xs line-clamp-2">
                  {seoDescription || shortDescription || 'High-performance software and SaaS platforms from Digi8 Solutions.'}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* AI AUTO-FILL MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0b101d] border border-brand-cyan/40 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setAiModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles size={12} className="animate-pulse" /> Intelligent Product Assistant
              </div>
              <h3 className="font-outfit font-black text-xl text-white">
                Auto-Fill Product Information with AI
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Provide your product name and any raw details, bullet points, or overview notes. The AI will formulate descriptions, features, pricing plans, specifications, FAQs, and SEO across all sections.
              </p>
            </div>

            <form onSubmit={handleAiGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={aiTitle}
                  onChange={e => setAiTitle(e.target.value)}
                  placeholder="e.g. Mana Kiranakottu, OmniCRM Suite, ClinicEase"
                  className="w-full bg-[#070b13] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Total Info &amp; Notes About This Product *
                </label>
                <textarea
                  required
                  rows={6}
                  value={aiTotalInfo}
                  onChange={e => setAiTotalInfo(e.target.value)}
                  placeholder="Enter total info, features, workflows, target customers, or notes...
e.g. Mana Kiranakottu is retail kirana and grocery billing software in India.
Features: fast barcode scanning, 5-second bills, thermal printer receipts, customer udhar khata credit ledger with WhatsApp reminders, stock alerts, multi-terminal cashier counters.
Works offline on Windows and tablets. Basic plan is 1999/mo, pro plan 4999/mo with unlimited cashiers..."
                  className="w-full bg-[#070b13] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-cyan leading-relaxed placeholder:text-gray-600 font-sans"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Tip: You can paste your product website text, feature notes, or bullet points here.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Category / Industry (Optional)
                </label>
                <input
                  type="text"
                  value={aiCategory}
                  onChange={e => setAiCategory(e.target.value)}
                  placeholder="e.g. Retail & Kirana, SaaS & CRM, ERP, Healthcare, Education"
                  className="w-full bg-[#070b13] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating || (!aiTitle.trim() && !aiTotalInfo.trim())}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-brand-cyan hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-brand-cyan/25 disabled:opacity-50 transition-all hover:scale-[1.02]"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating Specifications...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Generate &amp; Fill All Info</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
