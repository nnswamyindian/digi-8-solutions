import { motion } from 'framer-motion';
import { Users, DollarSign, Clock, ShieldCheck, Zap, Server } from 'lucide-react';

const reasons = [
  { icon: Users, title: 'One Unified Team', desc: 'No more managing multiple agencies. We handle everything from code to branding under one roof.', colSpan: 'md:col-span-2' },
  { icon: DollarSign, title: 'Transparent Pricing', desc: 'No hidden fees. You get clear project scopes and fixed SLA pricing.', colSpan: 'md:col-span-1' },
  { icon: ShieldCheck, title: 'Enterprise Security', desc: 'ISO 27001 standard practices, regular pen testing, and secure infrastructure.', colSpan: 'md:col-span-1' },
  { icon: Clock, title: 'Fast Delivery', desc: 'Agile sprints and rapid prototyping ensure you go to market faster than competitors.', colSpan: 'md:col-span-2' },
  { icon: Server, title: 'Scalable Solutions', desc: 'Built on modern cloud architectures designed to handle millions of users seamlessly.', colSpan: 'md:col-span-2' },
  { icon: Zap, title: 'Latest Technology', desc: 'We utilize cutting-edge stacks like React, Next.js, and Flutter for maximum performance.', colSpan: 'md:col-span-1' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 relative overflow-hidden bg-brand-surface border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="tag bg-brand-purple/10 text-brand-purple border-brand-purple/20 mb-4">
            The Enterprise Standard
          </span>
          <h2 className="font-outfit font-black text-4xl sm:text-5xl text-white">
            Why Top Brands Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`glass-card-premium p-8 flex flex-col justify-center ${reason.colSpan} cursor-default`}
            >
              <reason.icon className="text-brand-purple mb-4" size={32} />
              <h3 className="text-xl font-bold font-outfit text-white mb-2">{reason.title}</h3>
              <p className="text-slate-400 font-inter text-sm leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
