import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { getTestimonials } from '../../lib/api';
import type { Testimonial } from '../../lib/api';

export default function TestimonialsSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getTestimonials().then(data => setTestimonials(data));
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-cyan/5 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="tag bg-white/5 text-white border-white/10 mb-4">
            Client Success
          </span>
          <h2 className="font-outfit font-black text-4xl sm:text-5xl text-white">
            Trusted By Global Enterprises
          </h2>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="relative h-[400px] md:h-[300px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 glass-card-premium p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.1)]"
              >
                <div className="text-brand-cyan/20 absolute top-8 left-8">
                  <Quote size={64} />
                </div>
                
                <div className="flex-1 relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(current.rating || 5)].map((_, i) => (
                      <Star key={i} size={18} className="fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  
                  <p className="text-lg md:text-xl text-white font-inter leading-relaxed italic mb-8">
                    "{current.review}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {current.avatar_url ? (
                      <img src={current.avatar_url} alt={current.client_name} className="w-12 h-12 rounded-full object-cover border border-brand-cyan/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center font-bold text-white text-lg">
                        {current.client_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white">{current.client_name}</h4>
                      <p className="text-xs text-slate-400">{current.role}, {current.company}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-brand-cyan hover:text-white hover:border-brand-cyan transition-all border border-white/10 text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-brand-cyan hover:text-white hover:border-brand-cyan transition-all border border-white/10 text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
