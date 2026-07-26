import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function MarketingForm() {
  const { status, submit } = useQuoteSubmit('Digital Marketing & Growth');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    marketing_goals: 'B2B Lead Generation', budget_range: '₹50k - ₹1.5L / mo', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white">
      <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3">
        <TrendingUp size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Growth Audit Request Received!</h3>
      <p className="text-slate-400 text-sm">Our Performance Marketing Strategists will contact you within 24 hours.</p>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); submit(form); }} className="space-y-4 text-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.business_name as string} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Company Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.contact_person as string} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Full Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
          <input type="email" className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.email as string} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.phone as string} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 ..." />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Growth Goal</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.marketing_goals as string} onChange={e => setForm(p => ({ ...p, marketing_goals: e.target.value }))}>
            {['B2B Lead Generation', 'Search Engine Ranking (SEO)', 'E-Commerce Sales Growth', 'Brand Awareness & Paid Ads', 'Social Media Management'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Ad / Marketing Budget</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.budget_range as string} onChange={e => setForm(p => ({ ...p, budget_range: e.target.value }))}>
            {['₹30k - ₹50k / mo', '₹50k - ₹1.5L / mo', '₹1.5L - ₹5L / mo', '₹5L+ Enterprise'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Current Marketing Challenges</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Tell us about your target audience, competitors, or current cost per lead..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-green-600 border-green-600">
        {status === 'loading' ? 'Submitting...' : 'Request Growth Audit & Campaign Strategy'}
      </button>
    </form>
  );
}

export default function DigitalMarketing() {
  return (
    <ServicePage
      color="#16A34A"
      icon={<TrendingUp size={24} />}
      title="Digital Marketing & Growth"
      tagline="Data-Driven Performance Marketing, SEO & Multi-Channel Growth"
      description="Google Ads, SEO Search Dominance, Meta Paid Social & Automated Lead Funnels"
      heroImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
      overview="Our Digital Marketing Division executes data-backed lead generation, organic search engine dominance, high-ROAS paid media campaigns, and CRM funnel automation."
      problemsSolved={[
        'High ad spend with poor lead quality and low conversion rates',
        'Invisibility on Google organic search results for profitable keywords',
        'Inability to accurately measure Customer Acquisition Cost (CAC) and ROI',
        'Unqualified leads draining sales team time and budget'
      ]}
      solutionsProvided={[
        'High-converting PPC campaigns on Google Search, Display & LinkedIn B2B',
        'Technical & Content SEO driving organic Page #1 rankings within 90-180 days',
        'Transparent weekly reporting dashboards tracking actual CAC, ROAS & CPL',
        'Automated WhatsApp and Email lead nurturing funnels'
      ]}
      categories={[
        {
          title: 'Search Engine Optimization (SEO)',
          items: ['Technical SEO Audits', 'Local SEO & Google Business Profile', 'Enterprise Keyword Strategy', 'Authority Link Building'],
        },
        {
          title: 'Paid Media & Performance Ads',
          items: ['Google Search & Shopping Ads', 'Meta (Facebook & Insta) Ads', 'LinkedIn B2B Lead Gen', 'Retargeting Campaigns'],
        },
      ]}
      benefits={[
        'Measurable ROI with real-time conversion and cost-per-lead tracking',
        'Organic search dominance driving consistent inbound leads',
        'Dedicated performance manager and weekly progress calls',
        'Full ownership of ad accounts and analytics assets'
      ]}
      whyChooseUs={['Proven ROAS', 'Google Certified Partners', 'Data Transparency', 'Full Funnel Optimization']}
      technologies={[
        { name: 'Google Ads' }, { name: 'Meta Ads Manager' }, { name: 'GA4' },
        { name: 'SEMrush' }, { name: 'HubSpot' }, { name: 'Search Console' }
      ]}
      process={[
        { title: 'Growth Audit', desc: 'Analyzing current traffic, keywords, ad accounts, and conversion leakage.' },
        { title: 'Funnel Setup', desc: 'Building landing pages, tracking pixels, and CRM event triggers.' },
        { title: 'Campaign Launch', desc: 'Executing A/B tested ad copy, audiences, and keyword bidding.' },
        { title: 'Scale & Optimize', desc: 'Weekly bid adjustment, audience pruning, and scaling winning channels.' }
      ]}
      pricing={[
        { name: 'SEO & Organic Growth', features: ['Technical SEO Audit', 'Keyword Optimization', '10 Blog Articles / Mo', 'Monthly Ranking Report'] },
        { name: 'Performance Lead Gen', features: ['Google & Meta Ads Management', 'Landing Page Optimization', 'Conversion Tracking', 'Weekly Performance Calls'], popular: true },
        { name: 'Full Omnichannel Growth', features: ['SEO + PPC + Social Media', 'HubSpot / CRM Automation', 'Creative Video & Ad Production', 'Dedicated Growth Director'] }
      ]}
      faqs={[
        { q: 'How long does SEO take to show page 1 rankings?', a: 'SEO is a compounding strategy. Initial technical gains appear in 30–60 days, while competitive keyword Page 1 dominance typically occurs between 90–180 days.' },
        { q: 'Will I own the Google Ads and Meta accounts?', a: 'Yes. All campaigns are run directly inside your company ad accounts so you maintain 100% data transparency and history.' }
      ]}
      pricingSlug="digital-marketing"
      quoteForm={<MarketingForm />}
      relatedServices={[
        { title: 'Website Development', href: '/services/web-development' },
        { title: 'Branding & Creative Studio', href: '/services/branding' },
      ]}
    />
  );
}
