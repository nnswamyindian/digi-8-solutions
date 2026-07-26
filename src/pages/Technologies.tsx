import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Server, Database, Cloud, Lock, Smartphone } from 'lucide-react';

const techCategories = [
  {
    category: 'Frontend & User Experience',
    icon: Code2,
    color: '#3B82F6',
    techs: ['React 18', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'Figma Design Systems', 'HTML5 / SASS']
  },
  {
    category: 'Backend & Microservices',
    icon: Server,
    color: '#10B981',
    techs: ['Node.js (Express)', 'Python (FastAPI / Django)', 'Go (Golang)', 'RESTful APIs', 'GraphQL APIs', 'WebSocket Real-time']
  },
  {
    category: 'Database & Data Warehousing',
    icon: Database,
    color: '#F59E0B',
    techs: ['PostgreSQL', 'MySQL 8', 'Redis Caching', 'MongoDB', 'Supabase Real-time', 'BigQuery']
  },
  {
    category: 'Cloud Architecture & DevOps',
    icon: Cloud,
    color: '#8B5CF6',
    techs: ['Amazon Web Services (AWS)', 'Google Cloud Platform (GCP)', 'Docker Containers', 'Kubernetes Orchestration', 'CI/CD Pipelines', 'Cloudflare CDN']
  },
  {
    category: 'Mobile Engineering',
    icon: Smartphone,
    color: '#6C63FF',
    techs: ['Flutter SDK', 'React Native', 'Native Swift (iOS)', 'Native Kotlin (Android)', 'Firebase Suite', 'Realm Database']
  },
  {
    category: 'Cyber Security & Hardening',
    icon: Lock,
    color: '#F43F5E',
    techs: ['Cloudflare WAF', 'Burp Suite Pro', 'SSL / TLS Encryption', 'OWASP Top 10 Hardening', 'ISO 27001 Controls', 'OAuth2 / JWT']
  }
];

export default function Technologies() {
  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">

      {/* Global Background Elements */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="tag mb-4 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Technology Stack
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
            Enterprise Technology <br />
            <span className="text-gradient">Infrastructure</span>
          </h1>
          <p className="text-slate-300 text-lg mt-6 leading-relaxed max-w-3xl mx-auto">
            We leverage modern, battle-tested programming languages, cloud platforms, and security toolchains to engineer high-availability systems.
          </p>
        </div>
      </section>

      {/* TECH CATEGORIES GRID */}
      <section className="py-24 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techCategories.map(cat => {
              const IconComp = cat.icon;
              return (
                <div key={cat.category} className="glass-card-premium p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-300 rounded-full pointer-events-none" style={{ backgroundColor: cat.color }} />

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glass transition-colors duration-300" style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                      <IconComp size={24} />
                    </div>
                    <h3 className="font-outfit font-bold text-white text-xl">{cat.category}</h3>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10 relative z-10">
                    {cat.techs.map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-glass transition-colors" style={{ backgroundColor: `${cat.color}10`, color: '#cbd5e1', border: `1px solid ${cat.color}20` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-outfit font-black text-4xl text-white mb-6">Specific Tech Stack Requirement?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Our enterprise architects build custom integrations across your legacy databases and cloud environments.
          </p>
          <Link to="/contact" className="btn-glow py-4 px-10 text-sm font-bold shadow-neon-blue inline-flex">
            Consult a Tech Architect <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

    </div>
  );
}
