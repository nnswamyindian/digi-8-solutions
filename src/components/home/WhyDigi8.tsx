import { motion } from 'framer-motion';
import { ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';

export default function WhyDigi8() {
  return (
    <section className="py-24 bg-brand-dark relative border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="tag bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 mb-4">
            The Digi8 Advantage
          </span>
          <h2 className="font-outfit font-black text-4xl sm:text-5xl text-white">
            Why Digi8Solutions?
          </h2>
          <p className="text-slate-400 mt-4 text-lg">
            Stop managing multiple vendors. Start growing with one unified team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Old Way */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-[#F43F5E]/5 border border-[#F43F5E]/20 relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F43F5E] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              The Old Way
            </div>
            
            <h3 className="text-2xl font-bold font-outfit text-white mb-8 text-center flex items-center justify-center gap-2">
              <XCircle className="text-[#F43F5E]" /> Many Vendors
            </h3>

            <div className="space-y-6 text-center">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-slate-300">Website Company + Marketing Agency + Printing Vendor</div>
              <div className="flex justify-center text-slate-500"><ArrowRight className="rotate-90 md:rotate-0" /></div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-slate-300">Miscommunication & Blame Games</div>
              <div className="flex justify-center text-slate-500"><ArrowRight className="rotate-90 md:rotate-0" /></div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-slate-300">Higher Costs & Wasted Time</div>
              <div className="flex justify-center text-slate-500"><ArrowRight className="rotate-90 md:rotate-0" /></div>
              <div className="p-4 bg-[#F43F5E]/10 rounded-xl border border-[#F43F5E]/20 font-bold text-[#F43F5E]">Slow Growth</div>
            </div>
          </motion.div>

          {/* New Way */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/30 relative shadow-[0_0_50px_rgba(6,182,212,0.1)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-neon-blue">
              The Digi8 Way
            </div>
            
            <h3 className="text-2xl font-bold font-outfit text-white mb-8 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="text-brand-cyan" /> Digi8Solutions
            </h3>

            <div className="space-y-6 text-center">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white font-medium">Single Team for 8 Services</div>
              <div className="flex justify-center text-brand-cyan"><ArrowRight className="rotate-90 md:rotate-0" /></div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white font-medium">Unified Strategy & Execution</div>
              <div className="flex justify-center text-brand-cyan"><ArrowRight className="rotate-90 md:rotate-0" /></div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white font-medium">Cost Efficient & Seamless</div>
              <div className="flex justify-center text-brand-cyan"><ArrowRight className="rotate-90 md:rotate-0" /></div>
              <div className="p-4 bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 rounded-xl border border-brand-cyan/30 font-bold text-brand-cyan text-xl">
                Faster Growth
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
