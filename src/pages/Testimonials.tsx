import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { getTestimonials } from '../lib/api';
import type { Testimonial } from '../lib/api';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="tag mx-auto mb-6 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex shadow-glass">
            Client Love
          </div>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Stories of <span className="text-gradient">Real Success</span>
          </h1>
          <p className="text-slate-300 font-inter text-lg max-w-2xl mx-auto leading-relaxed">
            Don't take our word for it. Here's what our clients say about working with Digi 8 Solutions.
          </p>
          <div className="inline-flex items-center gap-4 glass-card-premium px-8 py-4 rounded-2xl mt-10">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />)}
            </div>
            <span className="text-white font-outfit font-black text-lg">4.9/5</span>
            <span className="text-slate-400 font-inter text-sm">from 500+ reviews</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card-premium rounded-2xl h-64 animate-pulse border-white/5" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-24 glass-card-premium rounded-2xl max-w-2xl mx-auto">
              <Star size={40} className="text-amber-400/20 mx-auto mb-6" />
              <p className="text-slate-400 font-inter text-lg">No approved testimonials yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={t.id ?? i} className="glass-card-premium p-8 h-full flex flex-col group hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:border-brand-purple/30 relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-[40px] rounded-full pointer-events-none" />

                  <Quote size={32} className="text-brand-purple/40 mb-6 drop-shadow-sm" />
                  <p className="text-slate-300 font-inter text-base leading-relaxed flex-1 mb-8 relative z-10">"{t.review}"</p>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center font-outfit font-bold text-white text-lg flex-shrink-0 shadow-glass border border-white/20">
                      {t.client_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-outfit font-bold text-white text-base truncate">{t.client_name}</div>
                      <div className="text-xs text-slate-400 font-inter truncate mt-0.5">{t.role}{t.company ? ` · ${t.company}` : ''}</div>
                    </div>
                  </div>
                  
                  {t.service && (
                    <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-purple px-2 py-1 bg-brand-purple/10 rounded border border-brand-purple/20 inline-block">{t.service}</span>
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
