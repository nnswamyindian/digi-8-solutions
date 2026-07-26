import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    title: "Established but Outpaced",
    desc: "Your business has existed for 10 years... Yet competitors who started just 2 years ago are getting more customers.",
    icon: "⌛"
  },
  {
    id: 2,
    title: "Invisible Online",
    desc: "People search for your company online... But cannot find a professional website.",
    icon: "👻"
  },
  {
    id: 3,
    title: "Lost in Search",
    desc: "Your competitors dominate Google... While your business remains invisible.",
    icon: "🔍"
  },
  {
    id: 4,
    title: "Weak Brand Recall",
    desc: "Customers forget your brand because it lacks a strong, memorable identity.",
    icon: "🧠"
  },
  {
    id: 5,
    title: "Manual Inefficiency",
    desc: "Your operations are still manual... Reducing productivity and scaling potential.",
    icon: "⚙️"
  },
  {
    id: 6,
    title: "Wasted Ad Spend",
    desc: "You're spending money on marketing... But not getting quality leads or ROI.",
    icon: "💸"
  },
  {
    id: 7,
    title: "Vulnerable to Attacks",
    desc: "Your business data and customer information isn't protected from cyber attacks.",
    icon: "🔓"
  },
  {
    id: 8,
    title: "Outdated Image",
    desc: "Your company still uses outdated branding that doesn't reflect your actual value.",
    icon: "🏢"
  },
  {
    id: 9,
    title: "Vendor Chaos",
    desc: "Website from one company, marketing from another... Everything becomes expensive and difficult.",
    icon: "🧩"
  }
];

export default function BusinessProblems() {
  return (
    <section className="py-24 bg-brand-surface relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-outfit font-black text-4xl sm:text-5xl text-white mb-6"
          >
            Are These Challenges <span className="text-[#F43F5E]">Slowing Down</span> Your Business?
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card-premium p-8 group"
            >
              <div className="text-4xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-300">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold font-outfit text-white mb-3 group-hover:text-brand-purple transition-colors">
                {problem.title}
              </h3>
              <p className="text-slate-400 font-inter text-sm leading-relaxed">
                {problem.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 border border-white/10 text-center max-w-4xl mx-auto"
        >
          <p className="text-2xl md:text-3xl font-outfit font-bold text-white">
            If you answered YES to even one... <br className="hidden md:block" />
            <span className="text-gradient">Digi8Solutions is built for businesses exactly like yours.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
