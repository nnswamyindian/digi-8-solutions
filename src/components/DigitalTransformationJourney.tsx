import { useEffect, useRef, useState } from 'react';
import {
  Lightbulb, Palette, Globe, Search, TrendingUp, Users, Zap, TrendingUp as Growth, Rocket
} from 'lucide-react';

const journeySteps = [
  { icon: Lightbulb, label: 'Business Idea', desc: 'Every great brand starts with a spark. We help you refine your vision into a viable business concept.', color: '#F59E0B' },
  { icon: Palette, label: 'Logo', desc: 'A memorable identity begins here. Your logo is the face of your brand, designed to last.', color: '#EC4899' },
  { icon: Palette, label: 'Brand', desc: 'Beyond the logo — colors, typography, and voice that make your business instantly recognizable.', color: '#8B5CF6' },
  { icon: Globe, label: 'Website', desc: 'Your digital storefront. A stunning, fast, and responsive website that converts visitors into customers.', color: '#00E5FF' },
  { icon: Search, label: 'SEO', desc: 'Be found on Google. We optimize your site to rank higher and attract organic traffic.', color: '#10B981' },
  { icon: TrendingUp, label: 'Marketing', desc: 'Reach your audience with precision. Data-driven campaigns across Google, Meta, and beyond.', color: '#6C63FF' },
  { icon: Users, label: 'Lead Generation', desc: 'Turn traffic into qualified leads. Automated funnels that capture, nurture, and convert.', color: '#00FFC6' },
  { icon: Zap, label: 'Automation', desc: 'Scale without the chaos. Automate workflows, CRM, and customer journeys for efficiency.', color: '#F59E0B' },
  { icon: Growth, label: 'Growth', desc: 'Data-driven scaling. We analyze, optimize, and expand what works for maximum ROI.', color: '#00E5FF' },
  { icon: Rocket, label: 'Scale', desc: 'From local to global. Your business is ready to dominate markets and achieve exponential growth.', color: '#8B5CF6' },
];

export default function DigitalTransformationJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const sectionTop = sectionRef.current.offsetTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const viewportCenter = scrollY + window.innerHeight / 2;

      // Calculate which step is active based on scroll position
      const relativeScroll = viewportCenter - sectionTop;
      const stepHeight = sectionHeight / journeySteps.length;
      const active = Math.max(0, Math.min(journeySteps.length - 1, Math.floor(relativeScroll / stepHeight)));
      setActiveStep(active);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative z-10 py-24 px-4 sm:px-6 overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-secondary to-primary" />
      <div className="absolute inset-0 grid-bg opacity-5" />

      {/* Header */}
      <div className="relative z-10 text-center mb-16">
        <div className="tag mx-auto mb-4">Digital Transformation</div>
        <h2 className="font-sora font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
          Your Digital{' '}
          <span className="gradient-text">Transformation Journey</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto font-inter text-base">
          From idea to scale — every step of your digital transformation, beautifully orchestrated.
        </p>
      </div>

      {/* Journey Timeline */}
      <div className="relative z-10 max-w-4xl mx-auto" style={{ minHeight: `${journeySteps.length * 200}px` }}>
        {/* Center line */}
        <div className="journey-line" />

        {/* Steps */}
        {journeySteps.map((step, i) => {
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          const isLeft = i % 2 === 0;

          return (
            <div
              key={step.label}
              ref={el => { stepRefs.current[i] = el; }}
              className="relative flex items-center mb-12"
              style={{ minHeight: '180px' }}
            >
              {/* Node dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div
                  className={`journey-node-dot transition-all duration-500 ${isCurrent ? 'scale-150' : ''}`}
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${step.color}, #6C63FF)` : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 20px ${step.color}80` : 'none',
                  }}
                />
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full border-2 pulse-ring" style={{ borderColor: step.color }} />
                )}
              </div>

              {/* Content card */}
              <div className={`w-5/12 ${isLeft ? 'mr-auto pr-12 text-right' : 'ml-auto pl-12'}`}>
                <div
                  className={`glass-strong rounded-2xl p-5 border transition-all duration-500 ${
                    isActive ? 'border-white/10 opacity-100' : 'border-white/5 opacity-40'
                  } ${isCurrent ? 'scale-105 shadow-glow-accent' : ''}`}
                  style={isCurrent ? { borderColor: `${step.color}40` } : {}}
                >
                  <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'justify-end' : ''}`}>
                    {!isLeft && (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                      >
                        <step.icon size={18} style={{ color: step.color }} />
                      </div>
                    )}
                    <div className={isLeft ? 'text-right' : ''}>
                      <div className="text-[10px] text-slate-500 font-inter">STEP {i + 1}</div>
                      <h3 className="font-sora font-bold text-white text-lg">{step.label}</h3>
                    </div>
                    {isLeft && (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                      >
                        <step.icon size={18} style={{ color: step.color }} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-inter leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Final growth indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full border border-accent-green/20">
            <Rocket size={18} className="text-accent-green" />
            <span className="text-sm font-inter text-accent-green">Ready to Scale Your Business?</span>
          </div>
        </div>
      </div>
    </div>
  );
}
