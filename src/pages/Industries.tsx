import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, HeartPulse, Home, ShoppingCart, UtensilsCrossed, Factory, Shield, HeartHandshake, HardHat, LandPlot, Truck, Briefcase } from 'lucide-react';

const industriesList = [
  { icon: GraduationCap, name: 'Education & EdTech', desc: 'Custom LMS platforms, student admission portals, virtual classrooms, and mobile learning apps.', color: '#3B82F6' },
  { icon: HeartPulse, name: 'Healthcare & Pharma', desc: 'HIPAA-compliant patient portals, telemedicine apps, electronic health records (EHR), and hospital ERPs.', color: '#10B981' },
  { icon: Home, name: 'Real Estate & PropTech', desc: 'Property listing marketplaces, virtual 3D tour integrations, CRM lead automation, and broker apps.', color: '#F59E0B' },
  { icon: ShoppingCart, name: 'Retail & E-Commerce', desc: 'High-speed online marketplaces, multi-currency payment gateways, inventory sync, and loyalty apps.', color: '#EC4899' },
  { icon: UtensilsCrossed, name: 'Hospitality & Travel', desc: 'Direct hotel booking engines, restaurant POS integration, itinerary builders, and guest portals.', color: '#F43F5E' },
  { icon: Factory, name: 'Manufacturing & Industrial', desc: 'Supply chain visibility dashboards, factory IoT monitoring, inventory ERPs, and B2B portals.', color: '#6C63FF' },
  { icon: Shield, name: 'Government & Public Sector', desc: 'High-security citizen service portals, compliance auditing, document management, and public dashboards.', color: '#06B6D4' },
  { icon: HeartHandshake, name: 'NGOs & Social Enterprises', desc: 'Global donation gateways, volunteer management, impact reporting, and multi-lingual campaign sites.', color: '#8B5CF6' },
  { icon: HardHat, name: 'Construction & Infrastructure', desc: 'Project cost estimation software, site workforce tracking, safety compliance, and vendor portals.', color: '#D97706' },
  { icon: LandPlot, name: 'Banking & Financial Services', desc: 'Fintech wallet integrations, audit logging, loan application portals, and bank-grade security.', color: '#059669' },
  { icon: Truck, name: 'Logistics & Supply Chain', desc: 'GPS fleet tracking apps, dispatch optimization, warehouse management, and delivery tracking.', color: '#2563EB' },
  { icon: Briefcase, name: 'Corporate Enterprises', desc: 'Intranet portals, HRMS payroll automation, executive dashboards, and internal tooling.', color: '#7C3AED' }
];

export default function Industries() {
  return (
    <div className="bg-brand-dark text-white font-inter relative overflow-hidden">

      {/* Global Background Elements */}
      <div className="fixed top-1/4 left-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="tag mb-4 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Industry Verticals
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
            Tailored Frameworks Across <br />
            <span className="text-gradient">12 Key Sectors</span>
          </h1>
          <p className="text-slate-300 text-lg mt-6 leading-relaxed max-w-3xl mx-auto">
            We bring deep domain compliance, pre-built industry modules, and regulatory expertise to every project, ensuring rapid and secure deployment.
          </p>
        </div>
      </section>

      {/* INDUSTRIES GRID */}
      <section className="py-24 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industriesList.map(ind => {
              const IconComponent = ind.icon;
              return (
                <div key={ind.name} className="glass-card-premium p-8 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  
                  {/* Subtle dynamic glow on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full pointer-events-none" style={{ backgroundColor: ind.color }} />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border transition-colors duration-300" style={{ backgroundColor: `${ind.color}15`, color: ind.color, borderColor: `${ind.color}30` }}>
                      <IconComponent size={28} />
                    </div>
                    <h3 className="font-outfit font-bold text-xl text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, #fff, ${ind.color})` }}>{ind.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{ind.desc}</p>
                  </div>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-bold pt-4 border-t border-white/10 transition-colors" style={{ color: ind.color }}>
                    Request Industry Framework <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-outfit font-black text-4xl text-white mb-6">Don't See Your Industry?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Our engineers build custom domain solutions tailored to your unique compliance and workflow needs.
          </p>
          <Link to="/contact" className="btn-glow py-4 px-10 text-sm font-bold shadow-neon-blue inline-flex">
            Discuss Custom Requirements <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

    </div>
  );
}
