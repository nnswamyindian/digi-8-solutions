import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, Check, X } from 'lucide-react';
import { saveLead } from '../lib/api';

type PricingPlan = { name: string; features: string[]; popular?: boolean };
type FAQ = { q: string; a: string };
type Technology = { name: string; logo?: string };
type Step = { title: string; desc: string };
type ServiceCategory = { title: string; items: string[] };

type Props = {
  color: string;
  icon: ReactNode;
  title: string;
  tagline: string;
  description?: string;
  heroImage: string;
  overview: string;
  problemsSolved?: string[];
  solutionsProvided?: string[];
  categories?: ServiceCategory[];
  benefits?: string[];
  whyChooseUs?: string[];
  technologies?: Technology[];
  process?: Step[];
  pricing?: PricingPlan[];
  pricingSlug?: string;
  faqs?: FAQ[];
  quoteForm?: ReactNode; // Kept for backward compatibility but unused
  relatedServices?: { title: string; href: string }[];
  externalLinkCTA?: { text: string; url: string };
};

function FAQItem({ q, a, color }: FAQ & { color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card-premium p-5 cursor-pointer transition-all duration-300 hover:border-white/20" onClick={() => setOpen(!open)}>
      <div className="flex justify-between items-center gap-4">
        <h4 className="font-outfit font-bold text-white text-sm">{q}</h4>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={open ? { color } : {}} />
      </div>
      {open && (
        <p className="text-slate-300 text-xs mt-3 pt-3 border-t border-white/10 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function ServicePage({
  color, icon, title, tagline, description, heroImage, overview,
  problemsSolved = [], solutionsProvided = [], categories = [],
  benefits = [], process = [], pricing = [],
  faqs = [], externalLinkCTA
}: Props) {
  return (
    <div className="bg-brand-dark text-white font-inter relative">
      
      {/* Global Dynamic Background Glow specific to this service */}
      <div className="fixed top-0 left-0 w-full h-[800px] blur-[150px] pointer-events-none z-0 opacity-10" style={{ backgroundColor: color }} />

      {/* DIVISION HERO */}
      <section className="relative pt-12 pb-24 overflow-hidden border-b border-white/10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-glass" style={{ backgroundColor: `${color}30`, border: `1px solid ${color}60` }}>
                <span style={{ color }}>{icon}</span>
                <span>{title} Platform</span>
              </div>

              <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-[1.1] tracking-tight">
                {tagline}
              </h1>

              {description && (
                <p className="text-slate-300 font-medium text-lg leading-relaxed">{description}</p>
              )}

              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{overview}</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="#quote" className="btn-glow text-sm py-4 px-8 justify-center font-bold" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}>
                  Request Division Proposal <ArrowRight size={16} />
                </a>
                <Link to="/contact" className="btn-outline-glass text-white text-sm py-4 px-8 justify-center font-bold">
                  Book Technical Discovery
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 blur-3xl opacity-20 rounded-full pointer-events-none" style={{ backgroundColor: color }} />
              <div className="glass-card-premium overflow-hidden p-2 relative z-10" style={{ borderColor: `${color}40` }}>
                <img src={heroImage} alt={title} className="w-full h-72 object-cover rounded-xl mb-4 opacity-90" />
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                    <span>Division SLA:</span> <strong className="text-white">Enterprise Standard</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                    <span>Quality Assurance:</span> <strong className="text-white">ISO 27001 Compliant</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IP Ownership:</span> <strong className="text-white">100% Client Retained</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEMS WE SOLVE & SOLUTIONS */}
      {(problemsSolved.length > 0 || solutionsProvided.length > 0) && (
        <section className="py-24 relative z-10 border-b border-white/5 bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10">
              
              {/* Problems */}
              <div className="glass-card-premium p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />
                <h3 className="font-outfit font-bold text-white text-2xl mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><X className="text-red-400" size={20} /></div> 
                  Common Challenges
                </h3>
                <ul className="space-y-4 text-sm text-slate-300">
                  {problemsSolved.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solutions */}
              <div className="glass-card-premium p-8 relative overflow-hidden group" style={{ borderColor: `${color}30` }}>
                <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: color }} />
                <h3 className="font-outfit font-bold text-white text-2xl mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}><Check style={{ color }} size={20} /></div> 
                  Corporate Solutions
                </h3>
                <ul className="space-y-4 text-sm text-slate-300">
                  {solutionsProvided.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} style={{ color }} className="mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* SERVICE CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-24 relative z-10 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="tag mb-4 text-white shadow-glass" style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}>Capabilities</span>
              <h2 className="font-outfit font-black text-4xl sm:text-5xl text-white">
                Full-Spectrum Services
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.title} className="glass-card-premium p-8 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <span style={{ color }}>{icon}</span>
                    </div>
                    <h3 className="font-outfit font-bold text-white text-lg">{cat.title}</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                    {cat.items.map(item => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KEY BENEFITS */}
      {benefits.length > 0 && (
        <section className="py-24 relative z-10 border-b border-white/5 bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="tag mb-4 bg-white/5 text-slate-300 border-white/10">Business Value</span>
              <h2 className="font-outfit font-black text-4xl text-white">
                Strategic Benefits
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="glass-card-premium p-6 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                    <CheckCircle2 size={16} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-300 leading-relaxed pt-1">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {process.length > 0 && (
        <section className="py-24 relative z-10 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="tag mb-4 text-white" style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}>Delivery Framework</span>
              <h2 className="font-outfit font-black text-4xl text-white">
                Division Process
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
              {process.map((p, i) => (
                <div key={p.title} className="glass-card-premium p-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-outfit font-black text-xl mb-6" style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                    0{i + 1}
                  </div>
                  <h4 className="font-outfit font-bold text-white text-lg mb-2">{p.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING PACKAGES */}
      {pricing.length > 0 && (
        <section className="py-24 relative z-10 border-b border-white/5 bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="tag mb-4 bg-white/5 text-slate-300 border-white/10">Packages & Scope</span>
              <h2 className="font-outfit font-black text-4xl text-white">
                Corporate Service Packages
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {pricing.map(plan => (
                <div key={plan.name} className="glass-card-premium p-8 flex flex-col justify-between relative overflow-hidden group" style={plan.popular ? { borderColor: `${color}60`, boxShadow: `0 0 40px ${color}15` } : {}}>
                  {plan.popular && <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }} />}
                  
                  <div>
                    {plan.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block shadow-glass" style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                        Recommended Scope
                      </span>
                    )}
                    <h3 className="font-outfit font-black text-2xl text-white mb-2">{plan.name}</h3>
                    <div className="text-sm text-slate-400 mb-6">Tailored Deliverables</div>

                    <ul className="space-y-4 text-sm text-slate-300 border-t border-white/10 pt-6 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-3">
                          <CheckCircle2 size={16} style={{ color }} className="flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a href="#quote" className="py-4 px-6 text-sm font-bold text-center rounded-xl transition-all duration-300" 
                    style={plan.popular ? { backgroundColor: color, color: '#fff', boxShadow: `0 0 20px ${color}40` } : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Select Package
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQS */}
      {faqs.length > 0 && (
        <section className="py-24 relative z-10 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="tag mb-4 bg-white/5 text-slate-300 border-white/10">FAQ</span>
              <h2 className="font-outfit font-black text-4xl text-white">
                Division FAQs
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => <FAQItem key={i} {...faq} color={color} />)}
            </div>
          </div>
        </section>
      )}

      {/* LEAD FORM CTA (Replaced with Button) */}
      <section id="quote" className="py-32 relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[150px] pointer-events-none opacity-10" style={{ backgroundColor: color }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-black text-4xl md:text-5xl text-white mb-4">
              Ready to start your project with {title}?
            </h2>
            <p className="text-slate-400 mb-10">Click below to get a customized proposal or customize your options directly.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/quote-calculator" className="btn-glow py-4 px-10 text-lg font-bold" style={{ backgroundColor: color, boxShadow: `0 0 30px ${color}50` }}>
                Get Proposal <ArrowRight className="inline ml-2" size={20} />
              </Link>
              
              {externalLinkCTA && (
                <a href={externalLinkCTA.url} target="_blank" rel="noopener noreferrer" className="btn-outline-glass py-4 px-10 text-lg font-bold">
                  {externalLinkCTA.text} <ArrowRight className="inline ml-2" size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}

export function useQuoteSubmit(service: string) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async (formData: Record<string, unknown>) => {
    setStatus('loading');
    try {
      await saveLead({
        name: formData.contact_person as string || formData.name as string || formData.business_name as string || 'Unknown',
        email: formData.email as string,
        phone: formData.phone as string,
        service,
        message: formData.comments as string,
        form_data: formData,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return { status, submit };
}
