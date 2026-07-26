import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';

const caseStudies = [
  {
    title: 'EdTech Enterprise LMS & Student Portal',
    client: 'Global Skill Institute',
    division: 'Technology & Infrastructure',
    summary: 'Engineered a scalable multi-tenant Learning Management System handling 100,000+ active students with live video classes, online testing, and automated certificates.',
    metrics: ['+340% Mobile Engagement', '99.99% Uptime', '< 800ms Page Load'],
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    color: '#3B82F6' // Web Dev Color
  },
  {
    title: 'ISO 27001 VAPT & Cloud Zero-Trust Hardening',
    client: 'Apex Financial Services',
    division: 'Cyber Security & Cloud Solutions',
    summary: 'Executed full offensive security penetration testing (VAPT) across cloud APIs and mobile banking apps, securing compliance clearance for SOC 2 Type II audit.',
    metrics: ['100% Vulnerabilities Remediated', 'Zero Breach Incidents', 'SOC 2 Certified'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    color: '#F43F5E' // Cyber Security Color
  },
  {
    title: 'Omnichannel B2B Growth & Lead Automation',
    client: 'Industrial Logistics Corp',
    division: 'Digital Marketing & Growth',
    summary: 'Optimized Google Search Ads and technical SEO strategy, lowering Customer Acquisition Cost (CAC) by 45% while driving over 1,200 qualified monthly enterprise leads.',
    metrics: ['4.8x ROAS', '-45% CAC', '#1 Google Organic Ranking'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    color: '#10B981' // Digital Marketing Color
  }
];

export default function CaseStudies() {
  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">

      {/* Global Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="tag mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex shadow-glass">
            Impact Stories
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
            Enterprise <span className="text-gradient">Case Studies</span>
          </h1>
          <p className="text-slate-300 text-lg mt-6 leading-relaxed max-w-3xl mx-auto">
            Real-world digital transformation success stories delivered across our specialized business divisions.
          </p>
        </div>
      </section>

      {/* CASE STUDIES LIST */}
      <section className="py-24 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {caseStudies.map((cs) => (
            <div key={cs.title} className="glass-card-premium p-8 grid lg:grid-cols-12 gap-10 items-center group transition-all duration-500 hover:shadow-2xl relative overflow-hidden" style={{ borderColor: `${cs.color}30` }}>
              
              <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[100px] pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: cs.color }} />

              <div className="lg:col-span-7 space-y-6 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: cs.color }}>{cs.division}</span>
                <h2 className="font-outfit font-black text-3xl text-white">{cs.title}</h2>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <Trophy size={16} /> Client: <span className="text-slate-200">{cs.client}</span>
                </div>
                <p className="text-slate-300 text-base leading-relaxed">{cs.summary}</p>

                <div className="flex flex-wrap gap-4 pt-4 pb-6">
                  {cs.metrics.map(m => (
                    <div key={m} className="px-4 py-2 rounded-xl text-sm font-bold shadow-glass border transition-colors" style={{ backgroundColor: `${cs.color}10`, color: cs.color, borderColor: `${cs.color}30` }}>
                      {m}
                    </div>
                  ))}
                </div>

                <Link to="/contact" className="btn-glow text-xs py-4 px-8 inline-flex" style={{ backgroundColor: cs.color, boxShadow: `0 0 20px ${cs.color}40` }}>
                  Request Detailed PDF <ArrowRight size={14} className="ml-2" />
                </Link>
              </div>

              <div className="lg:col-span-5 relative z-10">
                <div className="p-2 glass-card-premium" style={{ borderColor: `${cs.color}40` }}>
                  <img src={cs.image} alt={cs.title} className="w-full h-72 object-cover rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
