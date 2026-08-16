import { motion } from 'framer-motion';
import { Clock, EyeOff, Search, Brain, Cog, Banknote, ShieldAlert, Building2, Puzzle } from 'lucide-react';

const problems = [
  {
    id: 1,
    title: "Established but Outpaced",
    desc: "Your business has existed for 10 years... Yet competitors who started just 2 years ago are getting more customers.",
    icon: Clock,
    color: '#3B82F6'
  },
  {
    id: 2,
    title: "Invisible Online",
    desc: "People search for your company online... But cannot find a professional website.",
    icon: EyeOff,
    color: '#EC4899'
  },
  {
    id: 3,
    title: "Lost in Search",
    desc: "Your competitors dominate Google... While your business remains invisible.",
    icon: Search,
    color: '#06B6D4'
  },
  {
    id: 4,
    title: "Weak Brand Recall",
    desc: "Customers forget your brand because it lacks a strong, memorable identity.",
    icon: Brain,
    color: '#8B5CF6'
  },
  {
    id: 5,
    title: "Manual Inefficiency",
    desc: "Your operations are still manual... Reducing productivity and scaling potential.",
    icon: Cog,
    color: '#F59E0B'
  },
  {
    id: 6,
    title: "Wasted Ad Spend",
    desc: "You're spending money on marketing... But not getting quality leads or ROI.",
    icon: Banknote,
    color: '#10B981'
  },
  {
    id: 7,
    title: "Vulnerable to Attacks",
    desc: "Your business data and customer information isn't protected from cyber attacks.",
    icon: ShieldAlert,
    color: '#F43F5E'
  },
  {
    id: 8,
    title: "Outdated Image",
    desc: "Your company still uses outdated branding that doesn't reflect your actual value.",
    icon: Building2,
    color: '#6366F1'
  },
  {
    id: 9,
    title: "Vendor Chaos",
    desc: "Website from one company, marketing from another... Everything becomes expensive and difficult.",
    icon: Puzzle,
    color: '#EC4899'
  }
];

export default function BusinessProblems() {
  return (
    <section className="py-10 md:py-20 bg-brand-surface relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-outfit font-black text-3xl sm:text-5xl text-white mb-4 md:mb-6"
          >
            Are These Challenges <span className="text-[#F43F5E]">Slowing Down</span> Your Business?
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, i) => {
            const IconComponent = problem.icon;
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card-premium p-6 md:p-8 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 border"
                  style={{ backgroundColor: `${problem.color}15`, borderColor: `${problem.color}30` }}
                >
                  <IconComponent size={24} style={{ color: problem.color }} />
                </div>
                <h3 className="text-xl font-bold font-outfit text-white mb-3 group-hover:text-brand-purple transition-colors">
                  {problem.title}
                </h3>
                <p className="text-slate-400 font-inter text-sm leading-relaxed">
                  {problem.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-20 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 border border-white/10 text-center max-w-4xl mx-auto"
        >
          <p className="text-xl md:text-3xl font-outfit font-bold text-white">
            If you answered YES to even one... <br className="hidden md:block" />
            <span className="text-gradient">Digi8Solutions is built for businesses exactly like yours.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
