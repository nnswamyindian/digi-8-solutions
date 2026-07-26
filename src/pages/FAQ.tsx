import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BRAND } from '../lib/config';

const faqs: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: 'General',
    items: [
      { q: 'What services does Digi 8 Solutions offer?', a: 'We offer a full suite of digital services including web development, logo and branding, digital marketing, cyber security, startup guidance, mobile app development, digital printing, and corporate gifting.' },
      { q: 'Where is Digi 8 Solutions based?', a: 'We are headquartered in Mumbai, India, but serve clients globally across 25+ countries including UAE, UK, USA, Singapore and Australia.' },
      { q: 'How do I get started with Digi 8?', a: 'Simply fill out our contact form, use the quote calculator, or WhatsApp us. We\'ll schedule a free consultation call to understand your needs and provide a custom proposal.' },
      { q: 'Do you offer free consultations?', a: 'Yes! We offer a free 30-minute strategy consultation for all new inquiries. No strings attached — just honest advice.' },
    ],
  },
  {
    category: 'Web Development',
    items: [
      { q: 'How long does it take to build a website?', a: 'A simple 5-page website takes 2-3 weeks. An e-commerce site typically takes 6-10 weeks. A custom web application can take 3-6 months depending on complexity.' },
      { q: 'Do I own the website after it\'s built?', a: 'Yes, 100%. You own all code, designs, content and the domain. We don\'t charge licensing fees or lock you in.' },
      { q: 'Can you redesign my existing website?', a: 'Absolutely. We can redesign and rebuild your existing website while preserving your SEO rankings, domain authority and content.' },
      { q: 'Do you provide website hosting?', a: 'Yes, we offer managed hosting on premium cloud servers. We can also deploy to your existing hosting provider or recommend the best solution for your needs.' },
    ],
  },
  {
    category: 'Digital Marketing',
    items: [
      { q: 'How long before I see results from digital marketing?', a: 'Paid ads (Google, Meta) typically show results within 7-14 days. SEO results are visible within 3-6 months. Social media growth varies but compounds over time.' },
      { q: 'What is your minimum monthly budget for ad management?', a: 'We recommend a minimum ad spend for Google Ads or Meta Ads to see meaningful results. Our management fee is separate. Contact us for details.' },
      { q: 'Do you mark up the ad spend?', a: 'No. Your ad budget goes directly to Google or Meta on your billing account. We charge a separate, transparent management fee only.' },
    ],
  },
  {
    category: 'Pricing & Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept bank transfers, UPI, credit/debit cards, Razorpay, PayPal and Stripe for international payments.' },
      { q: 'What is your payment structure for projects?', a: 'Typically 50% advance to start, 25% at design approval, and 25% on final delivery. Custom payment plans available for larger projects.' },
      { q: 'Do you offer EMI or deferred payment options?', a: 'For larger projects, we can arrange EMI plans with approved clients. Contact us to discuss.' },
      { q: 'Is GST applicable on your services?', a: 'Yes, 18% GST is applicable on all services as per Indian tax regulations. Our quotes clearly show GST separately.' },
    ],
  },
];

function FAQSection({ category, items }: { category: string; items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-12">
      <h3 className="font-outfit font-bold text-brand-cyan text-sm mb-6 uppercase tracking-widest">{category}</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="glass-card-premium rounded-xl overflow-hidden transition-all duration-300">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className="font-inter font-bold text-white text-base pr-4">{item.q}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === i ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/5 text-slate-400'}`}>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="px-6 pb-6 text-slate-400 font-inter text-sm leading-relaxed">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen">
      
      {/* Background Elements */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="tag mx-auto mb-6 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            FAQ
          </div>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
          <p className="text-slate-300 font-inter text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about working with Digi 8 Solutions. Can't find your answer? Just contact us.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 sm:px-6 relative z-10 bg-brand-surface">
        <div className="max-w-3xl mx-auto">
          {faqs.map(section => (
            <FAQSection key={section.category} {...section} />
          ))}

          <div className="glass-card-premium rounded-2xl p-10 text-center mt-12 border-brand-cyan/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h3 className="font-outfit font-black text-white text-2xl mb-3">Still have questions?</h3>
              <p className="text-slate-400 font-inter mb-8">Our team is here to help. Reach out and we'll get back to you within hours.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={`https://wa.me/${BRAND.phone.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="btn-glow px-8 py-4 rounded-xl font-bold text-white text-sm shadow-neon-blue">
                  WhatsApp Us
                </a>
                <a href={`mailto:${BRAND.email.hello}`}
                  className="btn-outline-glass px-8 py-4 rounded-xl font-bold text-white text-sm">
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
