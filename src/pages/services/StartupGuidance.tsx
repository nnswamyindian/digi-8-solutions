import { useState } from 'react';
import { Rocket } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function StartupForm() {
  const { status, submit } = useQuoteSubmit('Startup Solutions');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    stage: 'Ideation / Concept Stage', support_needed: 'Turnkey MVP & Pitch Deck', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white">
      <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-3">
        <Rocket size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Startup Consultation Scheduled!</h3>
      <p className="text-slate-400 text-sm">Our Founder Incubator Team will reach out within 24 hours.</p>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); submit(form); }} className="space-y-4 text-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Startup / Founder Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.business_name as string} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Startup / Project Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Founder Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.contact_person as string} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Full Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
          <input type="email" className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.email as string} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="founder@startup.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.phone as string} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 ..." />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Current Startup Stage</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.stage as string} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
            {['Ideation / Concept Stage', 'Pre-Seed (Building MVP)', 'Seed Funded (Scaling Product)', 'Growth Stage'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Support Required</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.support_needed as string} onChange={e => setForm(p => ({ ...p, support_needed: e.target.value }))}>
            {['Turnkey MVP & Pitch Deck', 'Rapid 3-Week Prototype', 'Investor Pitch Presentation', 'Company Incorporation & Legal'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Startup Concept Overview</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Briefly describe the problem your startup solves and target market..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-teal-600 border-teal-600">
        {status === 'loading' ? 'Submitting...' : 'Schedule Startup Incubation Strategy Call'}
      </button>
    </form>
  );
}

export default function StartupGuidance() {
  return (
    <ServicePage
      color="#0D9488"
      icon={<Rocket size={24} />}
      title="Startup Solutions"
      tagline="Turnkey Startup Incubation: MVP Engineering & Investor Pitch Readiness"
      description="Rapid 3-Week Prototyping, Pitch Decks, Legal Compliance & Tech Strategy"
      heroImage="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80"
      overview="Our Startup Division partners with ambitious founders to convert concepts into market-ready MVPs, investor pitch decks, legal registrations, and scalable cloud architectures."
      problemsSolved={[
        'High agency quotes burning pre-seed runway before launching MVP',
        'Unclear technology roadmap leading to architectural tech debt',
        'Unprofessional pitch decks rejected by angel investors and VCs',
        'Delays in company incorporation, GST, and Startup India recognition'
      ]}
      solutionsProvided={[
        'Rapid 3 to 4 week MVP development sprints utilizing modern cloud stacks',
        'Investor-grade pitch decks designed by experienced startup strategists',
        'Complete incorporation guidance (Pvt Ltd, Startup India DIPP, GST)',
        'Fractional CTO guidance for seed fundraising tech diligence'
      ]}
      categories={[
        {
          title: 'MVP Engineering',
          items: ['Rapid Web/App Prototyping', 'No-Code / Low-Code Builds', 'Scalable Backend Setup', 'Payment Integration'],
        },
        {
          title: 'Investor Readiness',
          items: ['Investor Pitch Deck Design', 'Financial Modeling', 'Market Sizing (TAM/SAM/SOM)', 'Fractional CTO Consulting'],
        },
      ]}
      benefits={[
        'Launch market-ready MVP in 3-4 weeks to validate traction quickly',
        'Save up to 60% development budget with agile lean methodology',
        '100% full legal IP ownership transferred to your startup entity',
        'Direct intro guidance for Indian angel networks and seed funds'
      ]}
      whyChooseUs={['Founder Mentorship', '3-Week MVP Delivery', 'Investor Pitch Experts', 'Startup Pricing']}
      technologies={[
        { name: 'React / Next.js' }, { name: 'Supabase' }, { name: 'Flutter' },
        { name: 'Stripe' }, { name: 'AWS Startups' }
      ]}
      process={[
        { title: 'Idea Validation', desc: 'Refining value proposition, target persona, and core MVP feature set.' },
        { title: 'Rapid Prototyping', desc: 'Designing interactive wireframes and pitch deck slides.' },
        { title: 'Agile MVP Build', desc: 'Developing lean functional product with auth, database, and payments.' },
        { title: 'Launch & Demo', desc: 'Deploying product live and preparing founder for pitch meetings.' }
      ]}
      pricing={[
        { name: 'Pitch Deck & Brand Kit', features: ['15-Slide Pitch Deck', 'Financial Forecast Sheet', 'Logo & Identity Kit', '1-Page Investor Executive Summary'] },
        { name: 'Turnkey Launch MVP', features: ['Web or Mobile App MVP (3-4 Wks)', 'User Auth & Database', 'Payment Gateway Integration', 'Pitch Deck + Legal Guidance'], popular: true },
        { name: 'Full Incubation Retainer', features: ['Custom Web + Mobile MVP', 'Fractional CTO Retainer', 'Growth Marketing Funnel', 'Direct Angel Network Intro'] }
      ]}
      faqs={[
        { q: 'How fast can Digi8 build our MVP?', a: 'Our lean MVP sprint delivers a fully working web or mobile product with database and authentication within 3–4 weeks.' },
        { q: 'Do you take equity in our startup?', a: 'No. We operate strictly on a fixed-fee service basis so founders retain 100% of their company equity.' }
      ]}
      pricingSlug="startup-guidance"
      quoteForm={<StartupForm />}
      relatedServices={[
        { title: 'Website Development', href: '/services/web-development' },
        { title: 'Mobile App Development', href: '/services/mobile-app' },
      ]}
    />
  );
}
