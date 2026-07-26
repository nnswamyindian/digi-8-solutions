import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function MobileAppForm() {
  const { status, submit } = useQuoteSubmit('Mobile App Development');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    platform: 'Cross-Platform (Flutter)', app_type: 'Enterprise App', timeline: '5-8 weeks', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">
        <Smartphone size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Mobile Proposal Request Received!</h3>
      <p className="text-slate-400 text-sm">Our Mobile Engineering team will get in touch within 24 hours.</p>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); submit(form); }} className="space-y-4 text-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization *</label>
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Preference</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.platform as string} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
            {['Cross-Platform (Flutter / React Native)', 'Native iOS (Swift)', 'Native Android (Kotlin)', 'Hybrid PWA'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Timeline</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.timeline as string} onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))}>
            {['3-4 weeks (MVP)', '5-8 weeks (Standard)', '8-12 weeks (Enterprise)'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile App Specifications</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Describe your mobile app features, target users, or integration needs..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-blue-600 border-blue-600">
        {status === 'loading' ? 'Submitting...' : 'Request Mobile Division Proposal'}
      </button>
    </form>
  );
}

export default function MobileApp() {
  return (
    <ServicePage
      color="#2563EB"
      icon={<Smartphone size={24} />}
      title="Mobile App Development"
      tagline="iOS, Android & Cross-Platform Enterprise App Engineering"
      description="Native Swift/Kotlin, Flutter, React Native, and Secure Backend Integrations"
      heroImage="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80"
      overview="Our Mobile Engineering Division delivers intuitive, high-performance mobile applications built for scale, biometric security, offline functionality, and seamless cloud syncing."
      problemsSolved={[
        'Poor performing mobile apps with high crash rates and low rating scores',
        'Inconsistent experience between iOS and Android versions',
        'Complex store approval rejections on Apple App Store & Google Play Store',
        'Lack of real-time push notifications and secure offline caching'
      ]}
      solutionsProvided={[
        'Unified cross-platform Flutter & React Native architectures saving 40% dev cost',
        'High-performance native Swift and Kotlin engineering for hardware-intensive apps',
        '100% Guaranteed App Store & Google Play Store approval support',
        'Enterprise biometric authentication, push notifications, and offline data sync'
      ]}
      categories={[
        {
          title: 'Native & Cross-Platform',
          items: ['iOS Apps (Swift)', 'Android Apps (Kotlin)', 'Flutter Cross-Platform', 'React Native Apps', 'Progressive Web Apps (PWA)'],
        },
        {
          title: 'Industry Solutions',
          items: ['EdTech Learning Apps', 'Healthcare & Telemedicine', 'Fintech & Wallet Apps', 'Logistics & Fleet Tracking', 'E-Commerce Shopping Apps'],
        },
      ]}
      benefits={[
        'Intuitive UI/UX designed specifically for mobile ergonomics',
        'Offline capability with local SQLite/Realm encrypted databases',
        'Real-time push notifications via Firebase Cloud Messaging',
        'Guaranteed publication on Apple App Store & Google Play'
      ]}
      whyChooseUs={['App Store Guarantee', 'Biometric Security', 'Flutter Experts', 'Agile Delivery']}
      technologies={[
        { name: 'Flutter' }, { name: 'React Native' }, { name: 'Swift' },
        { name: 'Kotlin' }, { name: 'Firebase' }, { name: 'REST / GraphQL' }
      ]}
      process={[
        { title: 'Mobile UX Blueprint', desc: 'Wireframing mobile user journeys and gesture workflows.' },
        { title: 'Frontend & API Build', desc: 'Coding responsive screens and integrating secure backend APIs.' },
        { title: 'Device Testing', desc: 'Testing across 50+ real iOS and Android hardware models.' },
        { title: 'Store Deployment', desc: 'Handling App Store guidelines, metadata, and live release.' }
      ]}
      pricing={[
        { name: 'Mobile MVP', features: ['Single Platform (iOS or Android)', 'Core Feature Set', 'Push Notifications', 'Store Submission'] },
        { name: 'Enterprise Cross-Platform', features: ['Dual Platform (iOS + Android)', 'Flutter / React Native', 'Custom Backend API', 'Biometric Auth', 'Priority Support'], popular: true },
        { name: 'Custom Mobile Ecosystem', features: ['Native iOS + Native Android', 'BLE / Hardware Integration', 'Payment Gateways', 'Dedicated SLA Maintenance'] }
      ]}
      faqs={[
        { q: 'Should I choose Flutter or Native development?', a: 'Flutter allows us to build for both iOS and Android simultaneously using a single codebase, reducing time and cost by 40% with native performance. For heavy 3D or hardware apps, native Swift/Kotlin is recommended.' },
        { q: 'Do you handle the App Store and Play Store submission?', a: 'Yes, we manage the complete submission process including store graphics, privacy policies, and compliance verification.' }
      ]}
      pricingSlug="mobile-app"
      quoteForm={<MobileAppForm />}
      relatedServices={[
        { title: 'Website Development', href: '/services/web-development' },
        { title: 'Cyber Security & Audit', href: '/services/cyber-security' },
      ]}
    />
  );
}
