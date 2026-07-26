import { useState, useEffect } from 'react';
import { ExternalLink, Filter } from 'lucide-react';
import { getProjects } from '../lib/api';
import type { Project } from '../lib/api';
import { divisions } from '../data/servicesData';

const categories = ['All', ...divisions.map(div => div.title)];

export default function Portfolio() {
  const [active, setActive] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects(active).then(d => { setProjects(d); setLoading(false); }).catch(() => setLoading(false));
  }, [active]);

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen">

      {/* Global Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="tag mb-4 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            Client Showcase
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
            Portfolio & <span className="text-gradient">Case Studies</span>
          </h1>
          <p className="text-slate-300 text-lg mt-6 leading-relaxed max-w-3xl mx-auto">
            Explore enterprise projects delivered by DIGI8 SOLUTIONS INDIA PRIVATE LIMITED across our eight specialized business divisions.
          </p>
        </div>
      </section>

      {/* FILTERS BAR */}
      <section className="py-8 border-b border-white/5 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <Filter size={18} className="text-brand-cyan flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${active === cat
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-neon-blue border border-brand-cyan/50'
                  : 'glass text-slate-300 hover:text-white hover:border-brand-cyan/50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24 text-slate-400 text-base glass-card-premium max-w-2xl mx-auto">
              No projects found under this division filter.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <div key={p.id} className="glass-card-premium overflow-hidden flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:border-brand-cyan/30 relative">
                  
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div>
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <img src={p.thumbnail_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'} alt={p.title} className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-6 relative z-20">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan mb-2 block">{p.category}</span>
                      <h3 className="font-outfit font-bold text-white text-xl mt-1 mb-2 leading-tight">{p.title}</h3>
                      {p.client && <p className="text-xs font-semibold text-slate-400 mb-4">Client: <span className="text-slate-300">{p.client}</span></p>}
                      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{p.description}</p>
                    </div>
                  </div>

                  {p.live_url && p.live_url !== '#' && (
                    <div className="p-6 pt-0 mt-2 relative z-20">
                      <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-brand-cyan transition-colors group/link">
                        View Live Project <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
