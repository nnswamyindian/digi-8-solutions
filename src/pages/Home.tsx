import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SolarSystemHero from '../components/home/SolarSystemHero';
import BusinessProblems from '../components/home/BusinessProblems';
import WhyDigi8 from '../components/home/WhyDigi8';
import OurServices from '../components/home/OurServices';
import TrustAndProcess from '../components/home/TrustAndProcess';
import WhyChooseUs from '../components/home/WhyChooseUs';
import TestimonialsSlider from '../components/home/TestimonialsSlider';
import '../components/home/HomeStyles.css';

export default function Home() {
  return (
    <div className="bg-brand-dark text-white font-inter">
      {/* 1. Solar System Hero Section */}
      <SolarSystemHero />

      {/* 2. Business Problems */}
      <BusinessProblems />

      {/* 3. Why Digi8Solutions (Old vs New Way) */}
      <WhyDigi8 />

      {/* 4. Our 8 Services */}
      <OurServices />

      {/* 5. Trust (Counters) & Process (Timeline) */}
      <TrustAndProcess />

      {/* 6. Why Choose Us */}
      <WhyChooseUs />

      {/* 7. Client Testimonials */}
      <TestimonialsSlider />

      {/* 8. Final CTA */}
      <section className="py-32 relative overflow-hidden bg-brand-surface">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-blue/10 blur-[150px] pointer-events-none rounded-full" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h2 className="font-outfit font-black text-5xl md:text-7xl text-white leading-tight mb-6">
            Ready To Grow <span className="text-gradient">Faster?</span>
          </h2>
          <p className="text-xl text-slate-300 font-inter mb-10">
            Let's Build Your Digital Future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact" className="btn-glow py-4 px-10 text-base font-bold shadow-neon-blue group">
              Book Consultation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/quote-calculator" className="btn-outline-glass py-4 px-10 text-base font-bold group">
              Get Free Proposal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
