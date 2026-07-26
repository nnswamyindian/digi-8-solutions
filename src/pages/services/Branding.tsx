import { useState } from 'react';
import { Palette } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function BrandingForm() {
  const { status, submit } = useQuoteSubmit('Branding & Creative Studio');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    branding_scope: 'Complete Brand Identity', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white">
      <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto mb-3">
        <Palette size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Branding Inquiry Received!</h3>
      <p className="text-slate-400 text-sm">Our Creative Director will review your brief and contact you within 24 hours.</p>
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

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Branding Scope Required</label>
        <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.branding_scope as string} onChange={e => setForm(p => ({ ...p, branding_scope: e.target.value }))}>
          {['Logo & Brand Guidelines', 'Complete Brand Identity Kit', 'UI/UX Design System', 'Packaging & Print Design', 'Rebranding Strategy'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Creative Brief / Vision</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Describe your brand values, target audience, preferred colors, or vision..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-purple-600 border-purple-600">
        {status === 'loading' ? 'Submitting...' : 'Request Creative Studio Proposal'}
      </button>
    </form>
  );
}

export default function Branding() {
  return (
    <ServicePage
      color="#7C3AED"
      icon={<Palette size={24} />}
      title="Branding & Creative Studio"
      tagline="Strategic Brand Identity, Design Systems & UI/UX Architecture"
      description="Corporate Brand Guidelines, Logo Suites, Product Packaging & Digital Asset Kits"
      heroImage="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80"
      overview="Our Creative Studio crafts distinctive corporate brand identities, design systems, typography guidelines, and UI/UX interfaces that build instant trust and brand recall."
      problemsSolved={[
        'Generic, uninspired brand identity lost among competitors',
        'Inconsistent visual presentation across digital and print collateral',
        'Lack of formal brand guidelines causing fragmented team usage',
        'Outdated UI/UX causing user drop-off on digital platforms'
      ]}
      solutionsProvided={[
        'Unique vector logo suites with trademark-ready brand iconography',
        'Comprehensive 40+ page corporate brand style guide (PDF & Figma)',
        'Scalable UI/UX design systems optimized for accessibility and conversion',
        'High-resolution print, packaging, and digital asset templates'
      ]}
      categories={[
        {
          title: 'Identity & Strategy',
          items: ['Logo Suite Design', 'Brand Architecture', 'Brand Positioning', 'Typography & Color Systems', 'Corporate Guidelines PDF'],
        },
        {
          title: 'UI/UX Design',
          items: ['Web & App UI Design', 'Design Systems (Figma)', 'Interactive Prototyping', 'User Research & Wireframing'],
        },
      ]}
      benefits={[
        'Unforgettable corporate presence that commands premium positioning',
        'Consistent brand execution across all physical and digital touchpoints',
        '100% full copyright vector asset delivery (.AI, .SVG, .EPS, .PDF)',
        'Tailored guidelines for marketing, HR, print, and web teams'
      ]}
      whyChooseUs={['Award-Winning Designers', 'Full Vector IP', 'Comprehensive Guidelines', 'Rapid Iterations']}
      technologies={[
        { name: 'Figma' }, { name: 'Adobe Illustrator' }, { name: 'Adobe Photoshop' },
        { name: 'Framer' }, { name: 'InDesign' }
      ]}
      process={[
        { title: 'Brand Discovery', desc: 'Analyzing brand values, competitor positioning, and audience psychology.' },
        { title: 'Concept Creation', desc: 'Crafting multiple distinct logo concepts and color storyboards.' },
        { title: 'Guideline Design', desc: 'Documenting typography, spacing rules, mockups, and usage guidelines.' },
        { title: 'Asset Handover', desc: 'Delivering full print-ready and vector digital asset suites.' }
      ]}
      pricing={[
        { name: 'Identity Essentials', features: ['Logo Suite (Primary & Secondary)', 'Color Palette & Typography', 'Business Card Design', 'Vector File Package'] },
        { name: 'Corporate Brand Kit', features: ['Complete Logo Suite', '40-Page Brand Guidelines', 'Stationery Kit', 'Social Media Templates', 'UI Design System'], popular: true },
        { name: 'Enterprise Rebrand', features: ['Full Brand Strategy', '3D Logo Motion Assets', 'Packaging & Merch Design', 'Web UI Kit', 'Trademark Support'] }
      ]}
      faqs={[
        { q: 'Will I get full ownership of the logo and design files?', a: 'Yes. Upon final approval, 100% of vector file copyrights (.AI, .SVG, .EPS, .PDF) are legally assigned to your organization.' },
        { q: 'What is included in the Brand Guidelines document?', a: 'Our guidelines detail logo usage rules, minimum clear space, color codes (HEX, RGB, CMYK, Pantone), typography hierarchy, icon sets, imagery guidelines, and print standards.' }
      ]}
      pricingSlug="branding"
      quoteForm={<BrandingForm />}
      relatedServices={[
        { title: 'Website Development', href: '/services/web-development' },
        { title: 'Digital Marketing & Growth', href: '/services/digital-marketing' },
      ]}
    />
  );
}
