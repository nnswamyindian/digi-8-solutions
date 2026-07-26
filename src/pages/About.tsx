import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Target, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND } from '../lib/config';

const values = [
  { title: 'Technical Excellence', desc: 'We adhere to strict engineering standards, high-performance code, and zero-compromise quality assurance.' },
  { title: 'Corporate Integrity', desc: 'Transparent pricing, fixed milestone deliverables, and complete intellectual property transfer to our clients.' },
  { title: 'Security First', desc: 'Every application and workflow is engineered under ISO 27001 guidelines and zero-trust security architecture.' },
  { title: 'Client-Centric SLA', desc: '24/7 dedicated support, guaranteed response windows, and long-term annual maintenance support.' }
];

export default function About() {
  return (
    <div className="bg-brand-dark text-white font-inter relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none" />

      {/* CORPORATE HERO */}
      <section className="relative pt-24 pb-32 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative text-center">
          <span className="tag mb-6 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Corporate Overview
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
            About <span className="text-gradient">DIGI8 SOLUTIONS</span> INDIA PRIVATE LIMITED
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mt-8 leading-relaxed max-w-3xl mx-auto">
            Digi8 Solutions is a premier digital transformation platform offering end-to-end technology, branding, marketing, security, printing, and corporate services to organizations worldwide.
          </p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="py-24 border-b border-white/5 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10">
            
            <div className="glass-card-premium p-10 group hover:border-brand-cyan/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center mb-8 border border-brand-cyan/20 group-hover:scale-110 transition-transform">
                <Eye size={32} />
              </div>
              <h3 className="font-outfit font-bold text-3xl text-white mb-4">Our Corporate Vision</h3>
              <p className="text-slate-300 text-base leading-relaxed">
                To be the most trusted single-partner digital transformation corporation for enterprises, startups, educational institutions, and government bodies globally, setting the benchmark for integrated excellence across eight specialized business divisions.
              </p>
            </div>

            <div className="glass-card-premium p-10 group hover:border-brand-purple/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-8 border border-brand-purple/20 group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <h3 className="font-outfit font-bold text-3xl text-white mb-4">Our Mission</h3>
              <p className="text-slate-300 text-base leading-relaxed">
                To empower businesses with scalable software engineering, strategic brand identities, ROI-driven marketing campaigns, bank-grade cyber security, high-definition print media, and bespoke corporate merchandising under one unified accountability model.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-24 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="tag mb-4 bg-white/5 text-slate-300 border-white/10">Governance</span>
            <h2 className="font-outfit font-black text-4xl text-white">Our Core Principles</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="glass-card-premium p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
                <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center mb-6 border border-brand-cyan/30">
                  <CheckCircle2 size={20} className="text-brand-cyan" />
                </div>
                <h4 className="font-outfit font-bold text-white text-lg mb-3">{v.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORPORATE DETAILS & COMPLIANCE */}
      <section className="py-24 border-b border-white/5 bg-brand-surface relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <div>
                <span className="tag mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/20">Legal Entity</span>
                <h2 className="font-outfit font-black text-4xl text-white mb-6">
                  Registered Corporate Headquarters
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  Operating out of Hyderabad's Financial District tech corridor, DIGI8 SOLUTIONS INDIA PRIVATE LIMITED complies with international corporate governance, Indian IT Act standards, and ISO 27001 security protocols.
                </p>
              </div>

              <div className="space-y-4">
                <div className="glass-card-premium p-5 border-white/10">
                  <strong className="text-white block mb-1 text-xs uppercase tracking-wider text-slate-500">Legal Company Name</strong> 
                  <span className="font-medium text-slate-300">{BRAND.legalName}</span>
                </div>
                <div className="glass-card-premium p-5 border-white/10">
                  <strong className="text-white block mb-1 text-xs uppercase tracking-wider text-slate-500">Registered Address</strong>
                  <span className="font-medium text-slate-300">{BRAND.address.line1}, {BRAND.address.city}, {BRAND.address.state} - {BRAND.address.pin}, {BRAND.address.country}</span>
                </div>
                <div className="glass-card-premium p-5 border-white/10">
                  <strong className="text-white block mb-1 text-xs uppercase tracking-wider text-slate-500">Division Support Hours</strong>
                  <span className="font-medium text-brand-cyan">24/7 Enterprise SLA Support</span>
                </div>
              </div>
            </div>

            <div className="glass-card-premium p-10 border-brand-cyan/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="font-outfit font-black text-2xl text-white mb-8">Security & Quality Standards</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                    <ShieldCheck size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">ISO 27001 Security Standard</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">Automated vulnerability management, zero-trust architecture, and encrypted cloud data backups.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0 border border-brand-purple/20">
                    <Award size={24} className="text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Full Intellectual Property Transfer</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">Complete client ownership of all source code, design vectors, and proprietary data schemas.</p>
                  </div>
                </div>
              </div>
              <Link to="/contact" className="btn-glow w-full text-center text-sm font-bold py-4 mt-10 justify-center block">
                Contact Corporate Office
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-outfit font-black text-4xl text-white mb-6">Partner with Digi8 Solutions Today</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Get in touch with our technical director and solutions architects for a customized proposal tailored to your enterprise.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/quote-calculator" className="btn-glow py-4 px-8 text-sm font-bold">
              Request Proposal <ArrowRight size={16} className="inline ml-2" />
            </Link>
            <Link to="/contact" className="btn-outline-glass text-white py-4 px-8 text-sm font-bold">
              Book Strategy Call
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
