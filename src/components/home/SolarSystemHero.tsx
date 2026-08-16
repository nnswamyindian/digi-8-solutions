import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Palette, Cpu, FileText, TrendingUp,
  BookOpen, ShieldCheck, Users, Gift
} from 'lucide-react';

const planets = [
  { name: 'Branding & Identity', icon: Palette, color: '#EC4899', link: '/services/branding-identity', angle: 0 },
  { name: 'Tech Infrastructure', icon: Cpu, color: '#3B82F6', link: '/services/technology-infrastructure', angle: 45 },
  { name: 'Business Registration', icon: FileText, color: '#F59E0B', link: '/services/business-registration', angle: 90 },
  { name: 'Digital Marketing', icon: TrendingUp, color: '#10B981', link: '/services/digital-marketing-growth', angle: 135 },
  { name: 'AI & Training', icon: BookOpen, color: '#8B5CF6', link: '/services/ai-training', angle: 180 },
  { name: 'Cyber Security', icon: ShieldCheck, color: '#F43F5E', link: '/services/cyber-security-cloud', angle: 225 },
  { name: 'Workforce Support', icon: Users, color: '#06B6D4', link: '/services/workforce-support', angle: 270 },
  { name: 'Customized Gifting', icon: Gift, color: '#6366F1', link: '/services/customized-gifting', angle: 315 },
];

export default function SolarSystemHero() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden flex items-center bg-brand-dark pt-2 md:pt-6 pb-8 md:pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-stars opacity-40"></div>
      <div className="absolute inset-0 bg-aurora opacity-30"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col lg:flex-row items-center">

        {/* Left Content */}
        <div className="lg:w-1/2 space-y-6 md:space-y-8 z-20 text-center lg:text-left mt-2 md:mt-6 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold text-brand-cyan uppercase tracking-widest shadow-glass mb-4 md:mb-6">
              DIGI8 SOLUTIONS INDIA PRIVATE LIMITED
            </div>

            <h1 className="font-outfit font-black text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight">
              Transform Your Business Into A <span className="text-gradient">Digital Powerhouse</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-xl mx-auto lg:mx-0 mt-4 md:mt-6 font-inter leading-relaxed">
              One partner. Eight powerful services. Unlimited business growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-8 justify-center lg:justify-start">
              <a
                href="#services"
                onClick={(e) => {
                  const target = document.getElementById('services');
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn-glow py-3.5 md:py-4 px-8 text-sm font-bold text-center"
              >
                Explore Services
              </a>
              <Link to="/contact" className="btn-outline-glass py-3.5 md:py-4 px-8 text-sm font-bold text-center">
                Book Free Consultation
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Solar System */}
        <div className="lg:w-1/2 w-full h-[500px] lg:h-[700px] relative mt-16 lg:mt-0 perspective-1000">
          <div className="solar-system-container h-full">

            {/* Center Sun (Logo/Brand) */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-brand-dark shadow-[0_0_50px_rgba(6,182,212,0.4)] flex items-center justify-center z-30 overflow-hidden"
              animate={{ boxShadow: ['0 0 40px rgba(6,182,212,0.4)', '0 0 80px rgba(6,182,212,0.8)', '0 0 40px rgba(6,182,212,0.4)'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="/solar-logo.png" alt="Digi8 Solutions Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10" />
            </motion.div>

            {/* Orbit Rings */}
            <div className="orbit-ring w-[280px] h-[280px] md:w-[400px] md:h-[400px]"></div>
            <div className="orbit-ring w-[380px] h-[380px] md:w-[560px] md:h-[560px]"></div>

            {/* Planets Wrapper (Rotates) */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              {planets.map((planet, index) => {
                // Alternating distances for 2 rings
                const mdRadius = index % 2 === 0 ? 200 : 280;

                return (
                  <div
                    key={planet.name}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${planet.angle}deg)`,
                    }}
                  >
                    <div
                      className="absolute"
                      style={{ transform: `translateX(${mdRadius}px)` }} // using mdRadius, might need responsive tweak via css if strictly required, but absolute pixel math is tricky responsively in inline styles. We'll stick to a fixed responsive approach or rely on scaling.
                    >
                      {/* Counter-rotate the planet itself so it stays upright */}
                      <motion.div
                        className="group relative cursor-pointer"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        whileHover={{ scale: 1.2 }}
                      >
                        <Link to={planet.link} className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border transition-all duration-300"
                            style={{
                              backgroundColor: `${planet.color}20`,
                              borderColor: `${planet.color}50`,
                              boxShadow: `0 0 20px ${planet.color}40`
                            }}
                          >
                            <planet.icon size={20} style={{ color: planet.color }} />
                          </div>

                          {/* Hover Tooltip / Label */}
                          <div className="absolute top-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap bg-brand-dark/90 px-3 py-1.5 border border-white/10 rounded-lg backdrop-blur-md z-50 pointer-events-none">
                            <span className="text-xs font-bold text-white">{planet.name}</span>
                          </div>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
