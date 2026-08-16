import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

import { divisions } from '../../data/servicesData';

const services = divisions.map(div => ({
  slug: div.slug,
  name: div.title,
  desc: div.desc,
  benefits: 'Enhance your corporate operations and maximize business outcomes.',
  features: div.features || div.subServices.slice(0, 4).map(s => s.name),
  industries: ['Corporate', 'Enterprise', 'Startups', 'Government'],
  color: div.color,
  icon: div.icon
}));

export default function OurServices() {
  return (
    <section className="py-10 md:py-20 relative overflow-hidden" id="services">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-brand-dark z-0" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span className="tag bg-white/5 text-white border-white/10 mb-4">
            Unified Digital Ecosystem
          </span>
          <h2 className="font-outfit font-black text-4xl sm:text-6xl text-white">
            Our 8 <span className="text-gradient">Premium Services</span>
          </h2>
          <p className="text-slate-400 mt-6 text-lg">
            Each division operates as a specialized powerhouse, integrated under one trusted agency to fuel your complete digital transformation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="service-card-3d relative group"
            >
              {/* Animated Gradient Border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>

              <div className="relative h-full glass-card-premium p-8 rounded-2xl bg-[#0F0F13] flex flex-col justify-between overflow-hidden">
                {/* Glowing Background Blob */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: service.color }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundColor: `${service.color}15`, border: `1px solid ${service.color}40` }}
                    >
                      <service.icon size={32} style={{ color: service.color }} />
                    </div>
                    <h3 className="text-2xl font-black font-outfit text-white group-hover:text-transparent bg-clip-text transition-colors duration-300" style={{ backgroundImage: `linear-gradient(to right, #fff, ${service.color})` }}>
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-slate-300 font-inter text-sm leading-relaxed mb-6">
                    {service.desc}
                  </p>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6 text-sm text-slate-300">
                    <strong className="text-white block mb-1">Business Impact:</strong>
                    {service.benefits}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                            <Check size={14} style={{ color: service.color }} /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Industries</h4>
                      <ul className="space-y-2">
                        {service.industries.slice(0, 4).map(ind => (
                          <li key={ind} className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: service.color }} /> {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-2 sm:gap-4">
                  <Link
                    to={service.slug}
                    className="flex-1 btn-outline-glass py-3 px-2 justify-center text-xs whitespace-nowrap"
                    style={{ '--hover-color': service.color } as React.CSSProperties}
                  >
                    Learn More
                  </Link>
                  <Link
                    to="/contact"
                    className="flex-1 py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg text-white whitespace-nowrap"
                    style={{ backgroundColor: service.color }}
                  >
                    Book Consultation <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
