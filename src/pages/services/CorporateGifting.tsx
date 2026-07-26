import { useState } from 'react';
import { Gift } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function GiftingForm() {
  const { status, submit } = useQuoteSubmit('Corporate Gifting');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    gift_category: 'Employee Onboarding Kits', quantity: '50 - 200 Kits', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white">
      <div className="w-14 h-14 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto mb-3">
        <Gift size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Corporate Gifting Catalog Sent!</h3>
      <p className="text-slate-400 text-sm">Our Merchandise Manager will contact you with bulk samples and pricing within 24 hours.</p>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); submit(form); }} className="space-y-4 text-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.business_name as string} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Company Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.contact_person as string} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="HR / Admin Manager" />
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">Gifting Category</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.gift_category as string} onChange={e => setForm(p => ({ ...p, gift_category: e.target.value }))}>
            {['Employee Onboarding Kits', 'Executive Client Hampers', 'Festival Gifting (Diwali/New Year)', 'Custom Branded Apparel & Swag', 'Event Merchandise'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Quantity</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.quantity as string} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}>
            {['25 - 50 Units', '50 - 200 Kits', '200 - 500 Kits', '500+ Bulk Units'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Special Customization / Packaging Requirements</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Specify items needed (e.g. Stainless steel bottles, hoodies, tech gadgets, custom rigid box)..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-amber-600 border-amber-600">
        {status === 'loading' ? 'Submitting...' : 'Request Custom Gifting Catalog & Samples'}
      </button>
    </form>
  );
}

export default function CorporateGifting() {
  return (
    <ServicePage
      color="#D97706"
      icon={<Gift size={24} />}
      title="Corporate Gifting"
      tagline="Bespoke Swag Kits, Employee Welcome Boxes & Executive Client Hampers"
      description="Laser-Engraved Merch, Custom Rigid Boxes, Tech Accessories & Pan-India Delivery"
      heroImage="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80"
      overview="Our Corporate Gifting Division designs, customizes, and delivers premium branded employee onboarding boxes, festival gift hampers, executive client awards, and corporate swag kits."
      problemsSolved={[
        'Poor quality promotional items damaging corporate brand perception',
        'Logistical delays in delivering employee onboarding kits across remote locations',
        'Lack of customized premium packaging and personalized branding options',
        'Complex vendor management for multi-item swag hampers'
      ]}
      solutionsProvided={[
        'High-grade premium merchandise (Boat, Portronics, Park Avenue, Custom Tech)',
        'Custom logo laser engraving, screen printing, and embossed rigid box packaging',
        'Pan-India & international individual address door-step logistics',
        'Single point of contact for complete end-to-end kitting and fulfillment'
      ]}
      categories={[
        {
          title: 'Employee & Client Swag',
          items: ['Welcome Onboarding Boxes', 'Tech Gadget Kits', 'Executive Leather Goods', 'Custom Branded Hoodies & Polo T-Shirts'],
        },
        {
          title: 'Festival & Occasion Gifts',
          items: ['Diwali Premium Hampers', 'New Year Corporate Kits', 'Client Appreciation Awards', 'Custom Printed Drinkware'],
        },
      ]}
      benefits={[
        'Elevate employer brand and employee retention with high-end kitting',
        'Pan-India door-step delivery tracking directly to remote employees',
        'Bulk corporate volume pricing with zero compromise on finish',
        'Sample box preview available before full production run'
      ]}
      whyChooseUs={['Pan-India Logistics', 'Laser Engraving', 'Sample Preview', 'Bulk Discounting']}
      technologies={[
        { name: 'Laser Engraving' }, { name: 'UV Printing' }, { name: 'Embroidery' },
        { name: 'Custom Rigid Boxes' }, { name: 'Fulfillment Logistics' }
      ]}
      process={[
        { title: 'Item Selection', desc: 'Curating custom swag items matching budget and brand guidelines.' },
        { title: 'Sample Mockup', desc: 'Printing logo sample box for client approval.' },
        { title: 'Bulk Production', desc: 'Laser engraving, kitting, and rigid box packaging assembly.' },
        { title: 'Doorstep Dispatch', desc: 'Distributing individual tracked shipments across pan-India addresses.' }
      ]}
      pricing={[
        { name: 'Welcome Swag Kit', features: ['Custom Notebook & Pen', 'Insulated Stainless Steel Bottle', 'Branded Keychain', 'Custom Presentation Box'] },
        { name: 'Executive Tech Kit', features: ['Wireless Power Bank', 'Bluetooth Speaker / Earbuds', 'Premium Polo T-Shirt', 'Custom Rigid Gift Box', 'Pan-India Delivery'], popular: true },
        { name: 'VIP Luxury Hamper', features: ['Leather Laptop Sleeve', 'Smart Watch / Premium Tech', 'Dry Fruit & Gourmet Box', 'Customized Acrylic Trophy'] }
      ]}
      faqs={[
        { q: 'Can you deliver swag boxes directly to individual employee homes?', a: 'Yes. We handle pan-India and international door-step logistics with individual tracking for remote employees.' },
        { q: 'What is the minimum order quantity (MOQ)?', a: 'Our standard MOQ is 25 units per custom customized order.' }
      ]}
      pricingSlug="corporate-gifting"
      quoteForm={<GiftingForm />}
      relatedServices={[
        { title: 'Digital & Offset Printing', href: '/services/digital-printing' },
        { title: 'Branding & Creative Studio', href: '/services/branding' },
      ]}
    />
  );
}
