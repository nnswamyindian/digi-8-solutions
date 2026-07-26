import { useState } from 'react';
import { Code2 } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';
import { BRAND } from '../../lib/config';

function WebDevForm() {
  const { status, submit } = useQuoteSubmit('Website Development');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '', country: 'India',
    state: '', website_type: 'Corporate Website', required_features: [], timeline: '3-4 weeks',
    budget: '', reference_website: '', referral_code: '', comments: '',
  });

  const features = ['Payment Gateway', 'Admin Panel', 'Login/Register', 'Live Chat', 'Booking System', 'Membership', 'API Integration', 'Multilingual Support'];
  const siteTypes = ['Corporate Website', 'E-Commerce Platform', 'Educational Portal', 'Healthcare Portal', 'Real Estate Site', 'NGO Website', 'Custom ERP/CRM', 'Landing Page'];

  const toggleFeature = (f: string) => {
    const arr = form.required_features as string[];
    setForm(prev => ({ ...prev, required_features: arr.includes(f) ? arr.filter(x => x !== f) : [...arr, f] }));
  };

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
      <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-3">
        <Code2 size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Proposal Request Received!</h3>
      <p className="text-slate-400 text-sm">Our Web Engineering team will contact you within 24 hours with a scope & estimate.</p>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); submit(form); }} className="space-y-4 text-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.business_name as string} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Company / Organization" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.contact_person as string} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Full Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email *</label>
          <input type="email" className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.email as string} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.phone as string} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 ..." />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Website Type</label>
        <div className="flex flex-wrap gap-1.5">
          {siteTypes.map(t => (
            <button type="button" key={t} onClick={() => setForm(p => ({ ...p, website_type: t }))}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${form.website_type === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Required Modules & Features</label>
        <div className="flex flex-wrap gap-1.5">
          {features.map(f => {
            const arr = form.required_features as string[];
            return (
              <button type="button" key={f} onClick={() => toggleFeature(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${arr.includes(f) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'}`}>
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Timeline</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.timeline as string} onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))}>
            {['1-2 weeks', '3-4 weeks', '5-8 weeks', 'Enterprise Scope'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Reference Website URL</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.reference_website as string}
            onChange={e => setForm(p => ({ ...p, reference_website: e.target.value }))} placeholder="https://example.com" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Project Details / Requirements</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Describe your project, objectives, or existing site URL..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-brand-orange border-brand-orange">
        {status === 'loading' ? 'Submitting Request...' : 'Submit Web Division Proposal Request'}
      </button>
    </form>
  );
}

export default function WebDevelopment() {
  return (
    <ServicePage
      color="#FF6B1A"
      icon={<Code2 size={24} />}
      title="Website Development"
      tagline="Enterprise Web Engineering & Scalable Web Portals"
      description="Corporate Websites, E-Commerce Marketplaces, Custom ERP/CRM & Web Platforms"
      heroImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
      overview="DIGI8 SOLUTIONS INDIA PRIVATE LIMITED constructs enterprise-grade web applications engineered for speed, high conversion, bank-level security, and seamless database integration."
      problemsSolved={[
        'Slow loading websites driving away high-intent corporate leads',
        'Outdated non-responsive designs hurting mobile conversion rates',
        'Vulnerable unpatched CMS setups prone to malware and attacks',
        'Lack of seamless ERP, CRM, and payment gateway integrations'
      ]}
      solutionsProvided={[
        'Custom-engineered web architectures built on modern React & Next.js',
        'Sub-second page load times with 95+ Core Web Vitals optimization',
        'Bank-grade SSL security, automated backups, and DDoS protection',
        'Full IP ownership and seamless API integrations with enterprise backends'
      ]}
      categories={[
        {
          title: 'Corporate & Business Portals',
          items: ['Enterprise Websites', 'Multinational Portals', 'Educational LMS', 'Healthcare Platforms', 'NGO Portals', 'Real Estate Marketplaces'],
        },
        {
          title: 'E-Commerce Solutions',
          items: ['B2B & B2C E-Commerce', 'Multi-Vendor Marketplaces', 'Subscription Platforms', 'Payment Gateway Integration'],
        },
        {
          title: 'Custom Business Software',
          items: ['Enterprise ERP Systems', 'Custom CRM Software', 'HRMS & Payroll Tools', 'Billing & Invoicing Portals'],
        },
      ]}
      benefits={[
        'Sub-second page load performance and 95+ Google Lighthouse scores',
        'SEO-optimized clean code architecture built from day one',
        'Responsive across all desktop, tablet, and mobile breakpoints',
        'Enterprise security, role-based access control, and GDPR compliance',
        'Zero vendor lock-in with 100% full source code ownership',
        '24/7 post-launch maintenance, hosting, and annual support contracts'
      ]}
      whyChooseUs={['ISO 27001 Security', 'Agile Sprint Methodology', 'Dedicated Web Engineers', '100% IP Transfer']}
      technologies={[
        { name: 'React' }, { name: 'Next.js' }, { name: 'TypeScript' },
        { name: 'Node.js' }, { name: 'PostgreSQL' }, { name: 'Tailwind CSS' },
        { name: 'AWS' }, { name: 'Cloudflare' }, { name: 'Stripe' }, { name: 'Razorpay' }
      ]}
      process={[
        { title: 'Discovery & Audit', desc: 'Analyzing technical requirements, database architecture, and user workflows.' },
        { title: 'UI/UX Architecture', desc: 'Crafting responsive wireframes and accessible design systems.' },
        { title: 'Full-Stack Build', desc: 'Developing clean, type-safe code with CI/CD deployment pipelines.' },
        { title: 'Testing & Launch', desc: 'Security penetration testing, cross-browser validation, and live deployment.' }
      ]}
      pricing={[
        { name: 'Corporate Starter', features: ['Up to 10 Pages', 'Responsive Design', 'SEO Optimization', 'Contact & Lead Capture', '90-Day Warranty'] },
        { name: 'Business Enterprise', features: ['Up to 25 Pages', 'Custom CMS & Admin Panel', 'Payment & API Integrations', 'Multi-Language Support', 'Priority SLA'], popular: true },
        { name: 'Custom ERP/Platform', features: ['Unlimited Pages', 'Custom Web Application', 'Dedicated Cloud Architecture', '24/7 Security Monitoring', 'Full AMC Contract'] }
      ]}
      faqs={[
        { q: 'What is the turnaround time for a corporate website project?', a: 'Standard corporate websites take 3–4 weeks. Complex custom web applications and ERP portals take 6–10 weeks depending on scope.' },
        { q: 'Will I own the complete source code and assets?', a: 'Yes, 100%. Upon completion, all source code, design assets, and database schemas are transferred to your company.' },
        { q: 'Do you provide maintenance and annual support (AMC)?', a: 'Yes, we offer ongoing maintenance, security patching, cloud server management, and technical support.' }
      ]}
      pricingSlug="web-development"
      quoteForm={<WebDevForm />}
      relatedServices={[
        { title: 'Mobile App Development', href: '/services/mobile-app' },
        { title: 'Branding & Creative Studio', href: '/services/branding' },
        { title: 'Cyber Security & Audit', href: '/services/cyber-security' },
      ]}
    />
  );
}
