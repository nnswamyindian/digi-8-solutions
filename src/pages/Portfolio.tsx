import { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Filter, Search, ArrowRight, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProjects } from '../lib/api';
import type { Project } from '../lib/api';
import { divisions } from '../data/servicesData';
import { portfolioProjects } from '../data/portfolioData';
import SEOHead from '../components/SEOHead';

const categories = ['All', ...divisions.map(div => div.title)];

export default function Portfolio() {
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>(portfolioProjects as Project[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProjects(active)
      .then(d => {
        setProjects(d && d.length > 0 ? d : (portfolioProjects as Project[]));
        setLoading(false);
      })
      .catch(() => {
        setProjects(portfolioProjects as Project[]);
        setLoading(false);
      });
  }, [active]);

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (active !== 'All') {
      list = list.filter(p => p.category?.toLowerCase() === active.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.client?.toLowerCase().includes(q) ||
        p.tech_stack?.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, active, search]);

  // Color lookup helper
  const getDivisionColor = (catName?: string) => {
    const found = divisions.find(d => d.title.toLowerCase() === catName?.toLowerCase());
    return found?.color || '#06B6D4';
  };

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen">
      <SEOHead
        title="Enterprise Portfolio & Case Studies — Digi-8 Solutions"
        description="Explore live enterprise solutions delivered by Digi-8 Solutions across Technology, Cyber Security, Branding, Digital Marketing, MCA Compliance, and Corporate Training."
        canonicalUrl="https://digi8solutions.com/portfolio"
      />

      {/* Global Ambient Glow Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="tag mb-2 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex items-center gap-1.5 shadow-glass mx-auto">
            <Sparkles size={14} /> Proven Enterprise Deliverables
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight max-w-4xl mx-auto">
            Featured <span className="text-gradient">Portfolio & Systems</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Real-world digital infrastructure, mobile apps, cyber audits, brand systems, and performance engines built for forward-thinking enterprises.
          </p>

          {/* Quick Metrics Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="font-outfit font-black text-2xl text-cyan-400">100%</div>
              <div className="text-[11px] text-slate-400">Production Uptime</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="font-outfit font-black text-2xl text-emerald-400">4.8x</div>
              <div className="text-[11px] text-slate-400">Average Ad ROAS</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="font-outfit font-black text-2xl text-purple-400">ISO 27001</div>
              <div className="text-[11px] text-slate-400">Security Standard</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="font-outfit font-black text-2xl text-amber-400">8 Divisions</div>
              <div className="text-[11px] text-slate-400">Full-Stack Capability</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS BAR */}
      <section className="py-6 border-b border-white/5 relative z-10 bg-brand-surface sticky top-16 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          
          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects by tech, title, or client..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 text-xs font-inter focus:outline-none focus:border-brand-cyan transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400 self-end sm:self-center font-mono">
              Showing <span className="text-brand-cyan font-bold">{filteredProjects.length}</span> verified enterprise deployments
            </div>
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Filter size={16} className="text-brand-cyan shrink-0 mr-1" />
            {categories.map(cat => {
              const count = cat === 'All'
                ? projects.length
                : projects.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    active === cat
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 font-bold shadow-neon-blue'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active === cat ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 px-4 text-slate-400 glass-card-premium max-w-xl mx-auto rounded-3xl space-y-3">
              <Search size={36} className="mx-auto text-slate-600 mb-2" />
              <h3 className="text-lg font-outfit font-bold text-white">No projects match your filter</h3>
              <p className="text-xs text-slate-400">Try changing your search query or switching to 'All' divisions.</p>
              <button
                onClick={() => { setActive('All'); setSearch(''); }}
                className="btn-glow text-xs py-2 px-4 rounded-xl mt-2 inline-flex items-center gap-1.5"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((p) => {
                const divColor = getDivisionColor(p.category);
                const hasResults = p.results && Object.keys(p.results).length > 0;

                return (
                  <div
                    key={p.id}
                    className="glass-card-premium overflow-hidden flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] rounded-3xl border border-white/10 hover:border-brand-cyan/40 relative"
                  >
                    {/* Hover Glow Behind Card */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                      style={{ backgroundColor: divColor }}
                    />

                    <div>
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative overflow-hidden aspect-[16/10] bg-slate-950">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070b19] via-transparent to-transparent opacity-90 z-10" />
                        <img
                          src={p.thumbnail_url || p.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'}
                          alt={p.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                          loading="lazy"
                        />
                        {/* Division Badge */}
                        <div className="absolute top-3.5 left-3.5 z-20">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border shadow-md"
                            style={{
                              backgroundColor: `${divColor}20`,
                              color: divColor,
                              borderColor: `${divColor}40`
                            }}
                          >
                            {p.category}
                          </span>
                        </div>
                        {p.year && (
                          <div className="absolute top-3.5 right-3.5 z-20">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                              {p.year}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-6 space-y-3.5 relative z-20">
                        {p.client && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Trophy size={13} className="text-amber-400" />
                            <span>Client: <strong className="text-slate-200">{p.client}</strong></span>
                          </div>
                        )}

                        <h3 className="font-outfit font-bold text-white text-xl group-hover:text-brand-cyan transition-colors leading-tight">
                          {p.title}
                        </h3>

                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3 font-inter">
                          {p.description}
                        </p>

                        {/* Impact Metrics */}
                        {hasResults && (
                          <div className="pt-2 grid grid-cols-3 gap-2 border-t border-white/5">
                            {Object.entries(p.results!).map(([key, val]) => (
                              <div key={key} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                <div className="text-xs font-bold text-emerald-400 font-outfit">{val}</div>
                                <div className="text-[9px] text-slate-400 truncate uppercase mt-0.5">{key}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tech Stack Pills */}
                        {p.tech_stack && p.tech_stack.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {p.tech_stack.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono"
                              >
                                {tech}
                              </span>
                            ))}
                            {p.tech_stack.length > 4 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono">
                                +{p.tech_stack.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="p-6 pt-0 relative z-20">
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-400" /> Enterprise SLA
                        </span>
                        <a
                          href={p.live_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-cyan hover:text-white transition-colors group/link"
                        >
                          <span>Live Demo</span>
                          <ExternalLink size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM ENTERPRISE PROPOSAL CTA */}
      <section className="py-20 relative overflow-hidden bg-brand-surface border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-blue/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <span className="tag mx-auto bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Start Your Transformation
          </span>
          <h2 className="font-outfit font-black text-3xl sm:text-5xl text-white leading-tight">
            Have a Bold Project in Mind? <br />
            <span className="text-gradient">Let's Engineer It Together.</span>
          </h2>
          <p className="text-base text-slate-300 font-inter max-w-2xl mx-auto">
            Get an interactive cost estimate tailored to your tech stack, division, and timeline with our proposal calculator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/quote-calculator" className="btn-glow py-3.5 px-8 text-sm font-bold shadow-neon-blue flex items-center justify-center gap-2">
              <span>Calculate Project Proposal</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-outline-glass py-3.5 px-8 text-sm font-bold flex items-center justify-center gap-2">
              Book Executive Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
