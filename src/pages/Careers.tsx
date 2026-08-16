import { BRAND } from '../lib/config';
import { Globe, BookOpen, Heart, TrendingUp, Compass, Laptop } from 'lucide-react';

export default function Careers() {
  const positions = [
    { title: 'Senior React Developer', type: 'Full-time', location: 'Mumbai / Remote', dept: 'Engineering', color: '#3B82F6' },
    { title: 'UI/UX Designer', type: 'Full-time', location: 'Mumbai', dept: 'Design', color: '#EC4899' },
    { title: 'Digital Marketing Specialist', type: 'Full-time', location: 'Remote', dept: 'Marketing', color: '#10B981' },
    { title: 'Business Development Manager', type: 'Full-time', location: 'Mumbai', dept: 'Sales', color: '#F59E0B' },
    { title: 'Content Writer (Tech)', type: 'Part-time', location: 'Remote', dept: 'Content', color: '#8B5CF6' },
    { title: 'Flutter Developer', type: 'Full-time', location: 'Mumbai / Remote', dept: 'Engineering', color: '#06B6D4' },
  ];

  const perks = [
    { title: 'Remote-Friendly', desc: 'Work from anywhere in India with flexible hours.', icon: Globe, color: '#3B82F6' },
    { title: 'Learning Budget', desc: 'Annual budget for courses, books and conferences.', icon: BookOpen, color: '#8B5CF6' },
    { title: 'Health Insurance', desc: 'Comprehensive medical cover for you and family.', icon: Heart, color: '#F43F5E' },
    { title: 'Equity Options', desc: 'ESOPs for senior roles and long-term contributors.', icon: TrendingUp, color: '#10B981' },
    { title: 'Annual Retreat', desc: 'Company-wide retreat to celebrate wins together.', icon: Compass, color: '#F59E0B' },
    { title: 'MacBook Pro', desc: 'Latest Apple hardware from day one for all engineers.', icon: Laptop, color: '#06B6D4' },
  ];

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">

      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <section className="relative pt-12 md:pt-24 pb-12 md:pb-20 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="tag mx-auto mb-6 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Careers
          </div>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Build the Future <span className="text-gradient">With Us</span>
          </h1>
          <p className="text-slate-300 font-inter text-lg max-w-2xl mx-auto leading-relaxed">
            Join a team of passionate creators, builders and strategists on a mission to transform how businesses use technology.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 md:py-24 px-4 sm:px-6 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">Why Work at <span className="text-gradient">Digi 8</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {perks.map((perk) => {
              const PerkIcon = perk.icon;
              return (
                <div key={perk.title} className="glass-card-premium p-8 group hover:-translate-y-2 transition-transform duration-300">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-all"
                    style={{ backgroundColor: `${perk.color}15`, borderColor: `${perk.color}30` }}
                  >
                    <PerkIcon size={24} style={{ color: perk.color }} />
                  </div>
                  <h3 className="font-outfit font-bold text-white text-xl mb-3">{perk.title}</h3>
                  <p className="text-slate-400 text-sm font-inter leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="py-12 md:py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <div className="tag mx-auto mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex">Open Roles</div>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">Current <span className="text-gradient">Openings</span></h2>
          </div>

          <div className="space-y-6">
            {positions.map((pos) => (
              <div key={pos.title} className="glass-card-premium p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-brand-cyan/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">

                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-brand-cyan transition-colors" style={{ backgroundColor: pos.color }} />

                <div className="pl-4">
                  <div className="font-outfit font-bold text-white text-xl mb-2">{pos.title}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400 font-inter">
                    <span className="uppercase tracking-wider" style={{ color: pos.color }}>{pos.dept}</span>
                    <span className="text-slate-600">•</span>
                    <span>{pos.location}</span>
                    <span className="text-slate-600">•</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{pos.type}</span>
                  </div>
                </div>

                <a
                  href={`mailto:${BRAND.email.careers}?subject=Application for - ${encodeURIComponent(pos.title)}`}
                  className="w-full sm:w-auto btn-outline-glass px-8 py-3 rounded-xl text-sm font-bold text-center"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 glass-card-premium p-10 max-w-3xl mx-auto border-brand-cyan/20 bg-brand-cyan/5">
            <h3 className="font-outfit font-bold text-white text-2xl mb-4">Don't see a perfect fit?</h3>
            <p className="text-slate-300 font-inter text-base mb-8">We're always open to exceptional talent. Send us your resume and tell us how you can make a difference.</p>
            <a href={`mailto:${BRAND.email.careers}`} className="btn-glow px-8 py-4 rounded-xl font-bold text-white inline-flex items-center gap-2 shadow-neon-blue text-sm">
              Send Open Application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
