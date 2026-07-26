import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { divisions } from '../data/servicesData';

export default function Services() {
  return (
    <div className="bg-brand-dark text-white font-inter relative overflow-hidden">

      {/* Global Background Elements */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="tag mb-4 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Eight Business Divisions
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
            Integrated Enterprise <br />
            <span className="text-gradient">Digital Transformation</span>
          </h1>
          <p className="text-slate-300 text-lg mt-6 leading-relaxed max-w-3xl mx-auto">
            Explore our eight specialized business platforms. Each division operates with dedicated domain architects, specialized toolchains, and guaranteed SLA execution.
          </p>
        </div>
      </section>

      {/* DIVISIONS LIST */}
      <section className="py-24 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {divisions.map((div, i) => {
            const IconComp = div.icon;
            return (
              <div key={div.slug} className="glass-card-premium p-8 grid lg:grid-cols-12 gap-10 items-center relative overflow-hidden group transition-all duration-500 hover:shadow-2xl" style={{ borderColor: `${div.color}30` }}>
                
                {/* Dynamic Glow for each division */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: div.color }} />

                <div className="lg:col-span-7 space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-glass" style={{ backgroundColor: `${div.color}20`, color: div.color, border: `1px solid ${div.color}40` }}>
                      <IconComp size={28} />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: div.color }}>Division 0{i + 1}</span>
                  </div>

                  <h2 className="font-outfit font-black text-3xl text-white">{div.title}</h2>
                  <p className="text-slate-300 text-base leading-relaxed">{div.desc}</p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2 pb-6">
                    {div.features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                        <CheckCircle2 size={18} style={{ color: div.color }} className="flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to={div.slug} className="btn-glow text-sm py-4 px-8 inline-flex" style={{ backgroundColor: div.color, boxShadow: `0 0 20px ${div.color}40` }}>
                    Explore Division Platform <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>

                <div className="lg:col-span-5 relative z-10">
                  <div className="p-2 glass-card-premium" style={{ borderColor: `${div.color}40` }}>
                    <img src={div.img} alt={div.title} className="w-full h-72 object-cover rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* PROPOSAL CTA */}
      <section className="py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-outfit font-black text-4xl text-white mb-6">Need Multi-Division Execution?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Combine web, branding, marketing, security, and gifting into a single corporate contract.
          </p>
          <Link to="/quote-calculator" className="btn-glow py-4 px-10 text-sm font-bold shadow-neon-blue inline-flex">
            Build Multi-Division Proposal <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

    </div>
  );
}
