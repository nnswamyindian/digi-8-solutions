import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight, Phone, Mail, Building2, Code, Smartphone, Palette, TrendingUp, Lock, Rocket, Gift, Printer, Cpu } from 'lucide-react';
import { BRAND } from '../lib/config';
import { checkAuth } from '../lib/api';

import { divisions } from '../data/servicesData';

const divisionLinks = divisions.map(div => ({
  slug: div.slug,
  name: div.title,
  desc: div.desc,
  icon: div.icon
}));

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Industries', path: '/industries' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Insights', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location]);

  useEffect(() => {
    checkAuth().then((isAuthed) => {
      setIsAdmin(isAuthed);
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Utility Bar */}
      <div className="bg-black/80 text-brand-gray text-xs py-2 px-4 border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-white/80">
              <Building2 size={13} className="text-brand-cyan" />
              {BRAND.legalName}
            </span>
            <span className="text-white/20">|</span>
            <a href={`tel:${BRAND.phone.primary}`} className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors">
              <Phone size={13} className="text-brand-cyan" />
              {BRAND.phone.primary}
            </a>
            <span className="text-white/20">|</span>
            <a href={`mailto:${BRAND.email.hello}`} className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors">
              <Mail size={13} className="text-brand-cyan" />
              {BRAND.email.hello}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 font-medium flex items-center gap-1.5">
              <Cpu size={12} className="text-brand-purple" /> One Partner. Eight Digital Solutions.
            </span>
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-brand-cyan hover:text-brand-blue transition-colors font-bold">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <nav className={`transition-all duration-300 ${scrolled ? 'glass-nav py-2 shadow-glass' : 'bg-transparent py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center group relative z-50">
            <img src="/logo.png" alt="Digi8 Solutions Logo" className="h-14 md:h-20 w-auto object-contain scale-150 md:scale-[1.8] origin-left" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 shadow-glass">
            {navLinks.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-full ${location.pathname === item.path ? 'bg-white/10 text-white' : 'text-brand-gray hover:text-white hover:bg-white/5'}`}
              >
                {item.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all rounded-full ${location.pathname.startsWith('/services') ? 'bg-white/10 text-white' : 'text-brand-gray hover:text-white hover:bg-white/5'}`}>
                Services
                <ChevronDown size={14} className={`transition-transform duration-200 ${servicesOpen ? 'rotate-180 text-brand-cyan' : 'text-brand-gray'}`} />
              </button>

              {servicesOpen && (
                <div className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[720px] animate-fade-in z-50">
                  <div className="bg-[#050505] p-6 grid grid-cols-2 gap-4 border border-brand-cyan/20 rounded-2xl shadow-2xl relative isolate">
                    <div className="col-span-2 pb-4 border-b border-white/10 flex justify-between items-center">
                      <div>
                        <h4 className="font-outfit font-bold text-white text-sm flex items-center gap-2">
                          <Cpu size={16} className="text-brand-cyan" /> Eight Corporate Divisions
                        </h4>
                        <p className="text-xs text-brand-gray mt-1">End-to-end digital transformation capabilities</p>
                      </div>
                      <Link to="/services" className="text-xs font-bold text-brand-cyan hover:text-white transition-colors flex items-center gap-1">
                        View Divisions Hub <ArrowRight size={12} />
                      </Link>
                    </div>

                    {divisionLinks.map((div) => {
                      const IconComponent = div.icon;
                      return (
                        <Link
                          key={div.slug}
                          to={div.slug}
                          className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-brand-gray group-hover:text-brand-cyan group-hover:border-brand-cyan/30 group-hover:bg-brand-cyan/10 transition-colors shadow-glass">
                            <IconComponent size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-outfit font-bold text-white group-hover:text-brand-cyan transition-colors">
                              {div.name}
                            </div>
                            <p className="text-xs text-brand-gray line-clamp-1 font-normal mt-0.5">{div.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {navLinks.slice(2).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-full ${location.pathname === item.path ? 'bg-white/10 text-white' : 'text-brand-gray hover:text-white hover:bg-white/5'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/quote-calculator" className="btn-glow text-xs py-2.5 px-5">
              Request Proposal
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#050505] rounded-2xl shadow-2xl m-4 mt-2 p-4 space-y-4 max-h-[80vh] overflow-y-auto border border-brand-cyan/20 isolate">
             <div className="space-y-1">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className="block px-3 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-lg">{link.name}</Link>
              ))}
              <div className="pt-4 pb-2 border-t border-white/10 mt-2">
                <span className="px-3 text-xs font-bold text-brand-gray uppercase tracking-wider">Divisions</span>
                <div className="mt-2 space-y-1">
                  {divisionLinks.map(div => (
                    <Link key={div.slug} to={div.slug} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-gray hover:text-white hover:bg-white/10 rounded-lg">
                      {div.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 gap-2">
              <Link to="/quote-calculator" className="btn-glow w-full text-center text-sm py-3 justify-center">
                Request Proposal <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
