import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    desc: 'Perfect for small businesses and startups launching online.',
    features: ['5-page website', 'Mobile responsive', 'Basic SEO setup', 'Contact form', 'Google Analytics', '1 month support', 'Free domain consultation'],
    cta: 'Get Started',
    color: '#06B6D4', // cyan
    popular: false,
  },
  {
    name: 'Growth',
    desc: 'Ideal for growing businesses ready to scale their digital presence.',
    features: ['Up to 20 pages', 'CMS / Admin panel', 'Advanced SEO', 'Payment gateway', 'Social media integration', 'Email marketing setup', '3 months support', 'Monthly analytics report'],
    cta: 'Most Popular',
    color: '#3B82F6', // blue
    popular: true,
  },
  {
    name: 'Enterprise',
    desc: 'Full-service digital partnership for established enterprises.',
    features: ['Unlimited pages', 'Custom web app', 'API integrations', 'Dedicated DevOps', 'Priority support 24/7', '12 months AMC', 'Custom SLA', 'Dedicated project manager'],
    cta: 'Contact Sales',
    color: '#8B5CF6', // purple
    popular: false,
  },
];

const addons = [
  { name: 'SEO Monthly Retainer', desc: 'Ongoing SEO, keyword tracking and content optimisation' },
  { name: 'Social Media Management', desc: '3 platforms, 12 posts/month with design and copywriting' },
  { name: 'Monthly Maintenance AMC', desc: 'Updates, backups, security scans and minor changes' },
  { name: 'Logo & Brand Identity', desc: 'Custom logo design with brand kit' },
  { name: 'Google Ads Management', desc: 'Campaign setup, ad creatives and optimisation' },
  { name: 'Meta Ads Management', desc: 'Facebook & Instagram campaigns with creatives' },
];

export default function Pricing() {
  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="tag mx-auto mb-6 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Pricing
          </div>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Tailored <span className="text-gradient">Pricing</span> for Every Business
          </h1>
          <p className="text-slate-300 font-inter text-lg max-w-2xl mx-auto leading-relaxed">
            Every business is unique, so we offer custom pricing based on your specific needs and goals. Get a personalized quote in minutes.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 px-4 sm:px-6 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={plan.name} className={`glass-card-premium p-8 sm:p-10 flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
              plan.popular ? 'border-brand-blue/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-white/[0.03]' : ''
            }`}>
              
              {plan.popular && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[40px] rounded-full pointer-events-none" />
              )}
              
              {plan.popular && (
                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-inter px-3 py-1.5 rounded-full uppercase tracking-wider" style={{ background: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}40` }}>
                    <Zap size={12} /> Popular
                  </div>
                </div>
              )}

              <div className="mb-8 relative z-10">
                <h3 className="font-outfit font-black text-white text-2xl mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm font-inter leading-relaxed h-10">{plan.desc}</p>
                <div className="mt-8 font-outfit font-black text-3xl group-hover:scale-105 transition-transform origin-left" style={{ color: plan.color }}>
                  Custom Quote
                </div>
                <div className="text-xs font-semibold text-slate-500 font-inter mt-2 uppercase tracking-widest">Based on requirements</div>
              </div>

              <ul className="space-y-4 flex-1 mb-10 relative z-10">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm font-inter text-slate-300">
                    <CheckCircle size={18} style={{ color: plan.color }} className="flex-shrink-0 mt-0.5 opacity-80" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className={`relative z-10 block w-full py-4 rounded-xl text-center text-sm font-bold transition-all ${plan.popular ? 'btn-glow shadow-neon-blue' : 'btn-outline-glass'}`}
                style={plan.popular ? { backgroundColor: plan.color } : { color: plan.color }}
              >
                {plan.cta} <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag mx-auto mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex shadow-glass">Add-Ons</div>
            <h2 className="font-outfit font-black text-3xl sm:text-5xl text-white">
              Supercharge with <span className="text-gradient">Add-Ons</span>
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon, i) => (
              <div key={addon.name} className="glass-card-premium p-6 border-white/5 hover:border-brand-cyan/30 flex items-start gap-4 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan/20 transition-colors">
                  <Sparkles size={20} className="text-brand-cyan" />
                </div>
                <div>
                  <div className="font-outfit font-bold text-white text-base mb-1">{addon.name}</div>
                  <div className="text-slate-400 text-sm font-inter leading-relaxed">{addon.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 relative z-10 bg-brand-surface border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-outfit font-black text-4xl sm:text-5xl text-white mb-6">
            Ready to <span className="text-gradient">Transform</span> Your Business?
          </h2>
          <p className="text-slate-400 font-inter text-lg max-w-2xl mx-auto mb-10">
            Get a personalized quote tailored to your specific needs. Fill in your details and our team will reach out within 24 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote-calculator" className="btn-glow px-10 py-4 rounded-xl font-bold text-white inline-flex items-center justify-center gap-2 shadow-neon-blue">
              Try Quote Calculator <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-outline-glass px-10 py-4 rounded-xl font-bold text-white inline-flex items-center justify-center gap-2">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
