import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, Building2, Linkedin, Twitter, Instagram, Youtube, Github, Cpu } from 'lucide-react';
import { BRAND } from '../lib/config';
import { divisions } from '../data/servicesData';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white font-inter pt-16 pb-8 border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-cyan/20 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Top Corporate Transformation Banner */}
        <div className="glass-panel p-8 mb-16 grid lg:grid-cols-3 gap-8 items-center border border-brand-cyan/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 pointer-events-none" />
          
          <div className="lg:col-span-2 relative z-10">
            <span className="tag mb-3 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
              <Cpu size={12} className="text-brand-cyan" /> Enterprise Transformation Partner
            </span>
            <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">
              Ready to Accelerate Your Enterprise Growth?
            </h3>
            <p className="text-brand-gray text-sm mt-2 max-w-xl font-normal">
              Partner with DIGI8 SOLUTIONS INDIA PRIVATE LIMITED for end-to-end technology, branding, performance marketing, cyber security, and corporate solutions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end relative z-10">
            <Link to="/quote-calculator" className="btn-glow text-sm font-bold py-3 px-6 justify-center">
              Request Proposal <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-outline-glass text-sm font-bold py-3 px-6 justify-center">
              Book Strategy Call
            </Link>
          </div>
        </div>

        {/* Core Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">

          {/* Column 1: Brand & Corporate Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <img src="/logo.png" alt="Digi8 Solutions Logo" className="h-28 md:h-36 w-auto object-contain origin-left" />
            </Link>

            <p className="text-sm text-brand-gray max-w-sm leading-relaxed font-normal">
              {BRAND.vision}
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2.5 text-brand-gray hover:text-white transition-colors">
                <Building2 size={16} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                <span><strong>Legal Entity:</strong> {BRAND.legalName}</span>
              </div>
              <div className="flex items-start gap-2.5 text-brand-gray hover:text-white transition-colors">
                <MapPin size={16} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                <span>{BRAND.address.line1}, {BRAND.address.city}, {BRAND.address.state} - {BRAND.address.pin}, {BRAND.address.country}</span>
              </div>
              <div className="flex items-center gap-2.5 text-brand-gray hover:text-white transition-colors">
                <Phone size={16} className="text-brand-cyan flex-shrink-0" />
                <span>{BRAND.phone.primary}</span>
              </div>
              <div className="flex items-center gap-2.5 text-brand-gray hover:text-white transition-colors">
                <Mail size={16} className="text-brand-cyan flex-shrink-0" />
                <span>{BRAND.email.hello}</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-4">
              {[
                { icon: Linkedin, url: BRAND.social.linkedin, label: 'LinkedIn' },
                { icon: Twitter, url: BRAND.social.twitter, label: 'Twitter' },
                { icon: Instagram, url: BRAND.social.instagram, label: 'Instagram' },
                { icon: Youtube, url: BRAND.social.youtube, label: 'YouTube' },
                { icon: Github, url: BRAND.social.github, label: 'GitHub' }
              ].map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-gray hover:text-white hover:border-brand-cyan hover:bg-brand-cyan/10 transition-all shadow-glass">
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          <div className="space-y-4">
            <h4 className="font-outfit font-bold text-white text-sm uppercase tracking-wider">
              Eight Divisions
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-brand-gray">
              {divisions.map(div => (
                <li key={div.id}>
                  <Link to={div.slug} className="hover:text-brand-cyan transition-colors">{div.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-outfit font-bold text-white text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-brand-gray">
              <li><Link to="/about" className="hover:text-brand-cyan transition-colors">About Us</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Industries Served</Link></li>
              <li><Link to="/portfolio" className="hover:text-brand-cyan transition-colors">Portfolio & Case Studies</Link></li>
              <li><Link to="/technologies" className="hover:text-brand-cyan transition-colors">Technology Stack</Link></li>
              <li><Link to="/careers" className="hover:text-brand-cyan transition-colors">Careers & Culture</Link></li>
              <li><Link to="/blog" className="hover:text-brand-cyan transition-colors">Tech Insights & Blog</Link></li>
              <li><Link to="/contact" className="hover:text-brand-cyan transition-colors">Contact Corporate Office</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-outfit font-bold text-white text-sm uppercase tracking-wider">
              Industries
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-brand-gray">
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Education & EdTech</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Healthcare & Pharma</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Real Estate & PropTech</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Manufacturing & Industrial</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Government & Public Sector</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">Retail & E-Commerce</Link></li>
              <li><Link to="/industries" className="hover:text-brand-cyan transition-colors">NGOs & Social Enterprises</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-brand-gray gap-4">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/admin" className="hover:text-brand-cyan transition-colors font-semibold">Employee Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
