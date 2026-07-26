import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function Counter({ end, suffix = '', duration = 2 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeProgress * end));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(step);
        }
      };

      animationFrame = window.requestAnimationFrame(step);
      return () => window.cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const steps = [
  { id: '01', title: 'Discovery', desc: 'Deep dive into your business goals, target audience, and current digital bottlenecks.', color: '#3B82F6' },
  { id: '02', title: 'Strategy', desc: 'Crafting a unified blueprint encompassing tech, design, and marketing customized for you.', color: '#8B5CF6' },
  { id: '03', title: 'Design', desc: 'Creating premium, user-centric interfaces and brand identities that command authority.', color: '#EC4899' },
  { id: '04', title: 'Development', desc: 'Engineering robust, scalable solutions using cutting-edge enterprise frameworks.', color: '#10B981' },
  { id: '05', title: 'Launch', desc: 'Rigorous QA, security audits, and deployment to high-performance cloud infrastructure.', color: '#F59E0B' },
  { id: '06', title: 'Growth', desc: 'Ongoing SLA support, SEO, and performance marketing to scale your success.', color: '#06B6D4' },
];

export default function TrustAndProcess() {
  return (
    <section className="py-24 bg-[#0a0a0c] relative border-t border-white/5">
      
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-32 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { value: 500, suffix: '+', label: 'Clients Worldwide' },
            { value: 1000, suffix: '+', label: 'Projects Delivered' },
            { value: 98, suffix: '%', label: 'Client Retention' },
            { value: 24, suffix: '/7', label: 'Dedicated Support' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 lg:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="font-outfit font-black text-4xl lg:text-5xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Process Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="tag bg-white/5 text-white border-white/10 mb-4">
            How We Work
          </span>
          <h2 className="font-outfit font-black text-4xl sm:text-5xl text-white">
            Our Simple <span className="text-gradient">Growth Process</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-white/5 -translate-y-1/2">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-cyan"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-4 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center relative"
              >
                {/* Connecting Line (Mobile) */}
                {i !== steps.length - 1 && (
                  <div className="md:hidden w-1 h-16 bg-gradient-to-b from-brand-cyan to-transparent my-2"></div>
                )}
                
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-outfit font-black text-lg md:text-xl text-white mb-4 relative z-10 shadow-lg"
                  style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}60` }}
                >
                  {step.id}
                </div>
                
                <h3 className="text-lg font-bold font-outfit text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 font-inter px-2">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
