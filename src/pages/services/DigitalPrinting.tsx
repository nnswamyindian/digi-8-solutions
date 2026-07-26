import { useState } from 'react';
import { Printer } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function PrintingForm() {
  const { status, submit } = useQuoteSubmit('Digital & Offset Printing');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    print_type: 'Brochures & Catalogs', quantity: '500 - 1000 Copies', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white">
      <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3">
        <Printer size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Print Estimate Sent!</h3>
      <p className="text-slate-400 text-sm">Our Print Production Manager will contact you with paper stock samples and pricing within 24 hours.</p>
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">Print Collateral Type</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.print_type as string} onChange={e => setForm(p => ({ ...p, print_type: e.target.value }))}>
            {['Brochures & Catalogs', 'Corporate Visiting Cards', 'Large Format Flex Banners & Standees', 'Lanyard ID Cards & Badges', 'Product Packaging Boxes'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Print Quantity</label>
          <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.quantity as string} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}>
            {['100 - 500 Copies', '500 - 1000 Copies', '1000 - 5000 Offset Run', '5000+ Heavy Run'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Paper GSM / Finish Specifications</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Specify GSM (e.g. 300 GSM Velvet Matte, Spot UV, Foil Stamping, Roll-up Standee size)..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-indigo-600 border-indigo-600">
        {status === 'loading' ? 'Submitting...' : 'Request Print Quote & Paper Swatch Sample'}
      </button>
    </form>
  );
}

export default function DigitalPrinting() {
  return (
    <ServicePage
      color="#4F46E5"
      icon={<Printer size={24} />}
      title="Digital & Offset Printing"
      tagline="High-Definition Ultra HD Printing & Large Format Collateral"
      description="Corporate Brochures, 350 GSM Visiting Cards, Flex Banners & Custom Packaging"
      heroImage="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=1200&q=80"
      overview="Our Digital & Offset Printing Division produces high-definition corporate brochures, 350 GSM premium business cards, large format flex banners, roll-up standees, and custom packaging."
      problemsSolved={[
        'Mismatched CMYK colors causing dull, blurry brand collateral print runs',
        'Flimsy paper stock deteriorating easily during trade shows and client meetings',
        'Delays in heavy offset printing missing critical corporate event deadlines',
        'Lack of special finish options (Spot UV, Embossing, Gold Foil Stamping)'
      ]}
      solutionsProvided={[
        'Ultra HD 1200 DPI digital & heavy offset presses guaranteeing crisp color match',
        'Premium 300–350 GSM art card stock with Velvet Matte & Gloss lamination',
        'Express 24-hour print dispatch for urgent event standees and brochures',
        'Specialty Spot UV, Gold/Silver foil stamping, and custom die-cutting'
      ]}
      categories={[
        {
          title: 'Corporate Print Media',
          items: ['Brochures (Bi-Fold & Tri-Fold)', 'Corporate Folders', '350 GSM Velvet Business Cards', 'Lanyard Employee ID Cards'],
        },
        {
          title: 'Large Format & Event Display',
          items: ['Flex Banners & Star Banners', 'Roll-up Standees', 'Canopy Tents & Backdrops', 'Acrylic & LED Signage'],
        },
      ]}
      benefits={[
        'True-to-life CMYK color accuracy matched with digital color proofing',
        'Extensive paper stock catalog (Matt, Gloss, Textured, Metallic, Kraft)',
        'Express 24-hour turnaround on digital short runs',
        'Pan-India doorstep dispatch for exhibition stalls and branch offices'
      ]}
      whyChooseUs={['Ultra HD 1200 DPI', '24h Express Print', 'Spot UV & Foil', 'Bulk Offset Pricing']}
      technologies={[
        { name: '1200 DPI Heavy Digital' }, { name: 'Heidelberg Offset Press' },
        { name: 'Laser Die Cutter' }, { name: 'Spot UV Coater' }
      ]}
      process={[
        { title: 'Pre-Press Check', desc: 'Verifying bleed margins, CMYK color profiles, and resolution.' },
        { title: 'Digital Proof', desc: 'Generating digital soft proof and physical sample print for client sign-off.' },
        { title: 'Press Run', desc: 'Running high-speed digital or heavy offset press with lamination & UV coating.' },
        { title: 'Cutting & Dispatch', desc: 'Precision die-cutting, folding, kitting, and courier dispatch.' }
      ]}
      pricing={[
        { name: 'Corporate Essentials', features: ['500 Premium Visiting Cards (350 GSM)', '100 Letterheads & Envelopes', 'Velvet Matte Lamination'] },
        { name: 'Exhibition & Event Kit', features: ['1000 Tri-Fold Brochures (220 GSM)', '2 Roll-Up Standees (6x3 ft)', '50 Lanyard ID Badges', 'Express Dispatch'], popular: true },
        { name: 'Bulk Commercial Offset', features: ['5000+ Heavy Catalog Run', 'Spot UV + Gold Foil Stamping', 'Custom Packaging Boxes', 'Pan-India Distribution'] }
      ]}
      faqs={[
        { q: 'What is the difference between digital and offset printing?', a: 'Digital printing is ideal for short runs (100–500 copies) with fast 24-hour turnaround. Offset printing is best for large volume runs (1,000+ copies) delivering lower cost per unit and unmatched color depth.' },
        { q: 'Do you check our artwork files before printing?', a: 'Yes, our pre-press team inspects all files for CMYK color profile, 300 DPI resolution, and bleed margins before printing.' }
      ]}
      pricingSlug="digital-printing"
      quoteForm={<PrintingForm />}
      relatedServices={[
        { title: 'Corporate Gifting & Merch', href: '/services/corporate-gifting' },
        { title: 'Branding & Creative Studio', href: '/services/branding' },
      ]}
    />
  );
}
