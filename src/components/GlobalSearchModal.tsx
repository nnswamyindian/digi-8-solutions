import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, X, ArrowRight, Sparkles, Building2, Code, Shield, Megaphone,
  Cpu, Briefcase, HelpCircle, FileText, Gift, Award, Users, CheckCircle
} from 'lucide-react';
import { divisions } from '../data/servicesData';

interface SearchResult {
  id: string;
  title: string;
  category: 'Service' | 'Technology' | 'Company' | 'Portal';
  description: string;
  url: string;
  icon?: any;
  keywords?: string[];
}

const staticDatabase: SearchResult[] = [
  // 1. Core Corporate Pages
  {
    id: 'home',
    title: 'Digi8 Solutions Corporate Platform',
    category: 'Company',
    description: 'Enterprise digital transformation, technology architecture, branding, and business growth solutions.',
    url: '/',
    icon: Building2,
    keywords: ['home', 'company', 'agency', 'enterprise', 'digi8', 'services']
  },
  {
    id: 'about',
    title: 'About Digi8 Solutions India',
    category: 'Company',
    description: 'Our mission, ISO 27001 certified engineering processes, leadership, and multi-disciplinary team.',
    url: '/about',
    icon: Building2,
    keywords: ['about', 'story', 'leadership', 'team', 'mission', 'hyderabad']
  },
  {
    id: 'services-hub',
    title: 'All Digital Solutions & Divisions',
    category: 'Service',
    description: 'Explore our 8 specialized corporate business divisions from branding to cyber security.',
    url: '/services',
    icon: Sparkles,
    keywords: ['services', 'solutions', 'divisions', 'catalog', 'offerings']
  },
  {
    id: 'calculator',
    title: 'Interactive Project Quote & Cost Calculator',
    category: 'Portal',
    description: 'Estimate project investment for websites, mobile apps, branding, legal, and growth packages in real time.',
    url: '/quote-calculator',
    icon: Sparkles,
    keywords: ['quote', 'cost', 'calculator', 'pricing', 'estimate', 'budget', 'proposal']
  },
  {
    id: 'technologies',
    title: 'Technology Stack & Engineering Standards',
    category: 'Technology',
    description: 'React, Next.js, Node.js, Python, Flutter, Swift, Kotlin, AWS, Docker, and PostgreSQL.',
    url: '/technologies',
    icon: Code,
    keywords: ['tech', 'stack', 'languages', 'frameworks', 'cloud', 'architecture', 'devops']
  },
  {
    id: 'case-studies',
    title: 'Client Case Studies & Transformation Stories',
    category: 'Company',
    description: 'Real-world business deliverables, growth metrics, and technology architectures across 12+ industries.',
    url: '/case-studies',
    icon: Award,
    keywords: ['case studies', 'results', 'portfolio', 'success stories', 'projects', 'clients']
  },
  {
    id: 'portfolio',
    title: 'Selected Enterprise Project Portfolio',
    category: 'Company',
    description: 'Showcase of live corporate websites, mobile apps, SaaS dashboards, and branding systems.',
    url: '/portfolio',
    icon: Briefcase,
    keywords: ['portfolio', 'work', 'showcase', 'apps', 'websites', 'designs']
  },
  {
    id: 'industries',
    title: 'Industry Verticals & Sector Solutions',
    category: 'Service',
    description: 'FinTech, Healthcare, E-Commerce, Real Estate, Manufacturing, Legal, Logistics, and Education.',
    url: '/industries',
    icon: Building2,
    keywords: ['industries', 'sectors', 'fintech', 'healthcare', 'ecommerce', 'manufacturing']
  },
  {
    id: 'careers',
    title: 'Careers, Job Openings & Culture',
    category: 'Portal',
    description: 'Join our engineering, design, marketing, and legal teams. View open positions and apply.',
    url: '/career',
    icon: Users,
    keywords: ['careers', 'jobs', 'hiring', 'openings', 'recruitment', 'work']
  },
  {
    id: 'career-status',
    title: 'Self-Service Candidate Application Tracker',
    category: 'Portal',
    description: 'Track the real-time milestone status of your job application using your Application ID.',
    url: '/career/status',
    icon: CheckCircle,
    keywords: ['tracker', 'status', 'application', 'candidate', 'interview', 'roadmap']
  },
  {
    id: 'testimonials',
    title: 'Client Testimonials & Executive Reviews',
    category: 'Company',
    description: 'Verified reviews and feedback from enterprise founders, CTOs, and marketing directors.',
    url: '/testimonials',
    icon: Award,
    keywords: ['testimonials', 'reviews', 'ratings', 'feedback', 'clients']
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    category: 'Company',
    description: 'Detailed answers on timelines, IP ownership, SLAs, payment schedules, and support.',
    url: '/faq',
    icon: HelpCircle,
    keywords: ['faq', 'questions', 'answers', 'support', 'help', 'pricing', 'contracts']
  },
  {
    id: 'contact',
    title: 'Contact Us & Strategy Consultation',
    category: 'Company',
    description: 'Connect directly with our senior solution architects at our Hyderabad corporate headquarters.',
    url: '/contact',
    icon: HelpCircle,
    keywords: ['contact', 'office', 'phone', 'email', 'call', 'meeting', 'hyderabad']
  },
  {
    id: 'privacy',
    title: 'Privacy Policy & Data Security Standards',
    category: 'Company',
    description: 'Our GDPR and DPDP Act 2023 compliant data governance and privacy practices.',
    url: '/privacy',
    icon: Shield,
    keywords: ['privacy', 'policy', 'gdpr', 'security', 'terms']
  },
  {
    id: 'terms',
    title: 'Terms of Service & Engagement Terms',
    category: 'Company',
    description: 'Official Statement of Work (SOW), service warranties, and legal terms of engagement.',
    url: '/terms',
    icon: FileText,
    keywords: ['terms', 'legal', 'conditions', 'contract', 'sow']
  },

  // 2. High-Intent Sub-Services (Direct real routes)
  {
    id: 'sub-web-dev',
    title: 'Custom Website & Web Portal Engineering',
    category: 'Service',
    description: 'Next.js, React, Node.js corporate websites, client portals, and cloud web applications.',
    url: '/services/technology-infrastructure',
    icon: Code,
    keywords: ['website', 'web dev', 'nextjs', 'react', 'frontend', 'backend', 'portal']
  },
  {
    id: 'sub-mobile-apps',
    title: 'Mobile App Development (iOS, Android & Flutter)',
    category: 'Service',
    description: 'Cross-platform Flutter & native iOS/Android apps with biometric auth, push alerts & offline sync.',
    url: '/services/technology-infrastructure',
    icon: Code,
    keywords: ['mobile app', 'ios', 'android', 'flutter', 'react native', 'smartphone', 'pwa']
  },
  {
    id: 'sub-logo-design',
    title: 'Logo Suite & Corporate Identity Systems',
    category: 'Service',
    description: '3D brand logos, comprehensive typography standards, color palettes, and visual identity kits.',
    url: '/services/branding-identity',
    icon: Sparkles,
    keywords: ['logo', 'brand kit', 'identity', 'design', 'vector', 'typography', 'branding']
  },
  {
    id: 'sub-pvt-ltd',
    title: 'Company Registration (Pvt Ltd, LLP & OPC)',
    category: 'Service',
    description: 'Ministry of Corporate Affairs (MCA) business incorporation, DSC, DIN, MOA/AOA, and GST.',
    url: '/services/business-registration',
    icon: FileText,
    keywords: ['company registration', 'pvt ltd', 'incorporation', 'llp', 'startup registration', 'mca']
  },
  {
    id: 'sub-seo-marketing',
    title: 'Search Engine Optimization (SEO) & Google Ads PPC',
    category: 'Service',
    description: 'First-page keyword rankings, technical SEO audit, high-converting Google & Meta paid acquisition.',
    url: '/services/digital-marketing-growth',
    icon: Megaphone,
    keywords: ['seo', 'google ads', 'ppc', 'marketing', 'ranking', 'leads', 'meta ads']
  },
  {
    id: 'sub-vapt-cyber',
    title: 'VAPT Security Audits & ISO 27001 / SOC 2 Compliance',
    category: 'Service',
    description: 'Web/mobile penetration testing, cloud vulnerability assessment, and compliance readiness certification.',
    url: '/services/cyber-security-cloud',
    icon: Shield,
    keywords: ['vapt', 'cyber security', 'penetration testing', 'iso 27001', 'soc2', 'audit', 'firewall']
  },
  {
    id: 'sub-ai-training',
    title: 'Corporate AI Training & Generative AI Workshops',
    category: 'Service',
    description: 'Hands-on enterprise workshops on custom LLMs, ChatGPT prompt workflows, and AI automation tools.',
    url: '/services/ai-training',
    icon: Cpu,
    keywords: ['ai training', 'genai', 'chatgpt', 'workshops', 'llm', 'automation', 'machine learning']
  },
  {
    id: 'sub-staffing',
    title: 'Dedicated Developers & Staff Augmentation',
    category: 'Service',
    description: 'Senior pre-vetted engineers, UI/UX designers, and Fractional CTO advisors integrated into your team.',
    url: '/services/workforce-support',
    icon: Users,
    keywords: ['staffing', 'dedicated developers', 'contract engineers', 'remote team', 'fractional cto']
  },
  {
    id: 'sub-gifting',
    title: 'Customized Executive Gifting & Digital Printing',
    category: 'Service',
    description: 'Laser-engraved employee onboarding welcome kits, VIP client merchandise, and rigid gift boxes.',
    url: '/services/customized-gifting',
    icon: Gift,
    keywords: ['gifting', 'merch', 'swag', 'welcome kits', 'printing', 'offset printing', 'brochures']
  }
];

export default function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine 8 major divisions from servicesData with static catalog
  const completeDatabase = useMemo(() => {
    const divisionEntries: SearchResult[] = divisions.map(d => ({
      id: d.id,
      title: d.title,
      category: 'Service' as const,
      description: d.desc,
      url: d.slug,
      icon: d.icon,
      keywords: [
        d.title.toLowerCase(),
        d.id.toLowerCase(),
        ...d.features.map(f => f.toLowerCase()),
        ...(d.subServices?.map(s => s.name.toLowerCase()) || [])
      ]
    }));

    return [...divisionEntries, ...staticDatabase];
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredResults = completeDatabase.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const inTitle = item.title.toLowerCase().includes(normalizedQuery);
    const inDesc = item.description.toLowerCase().includes(normalizedQuery);
    const inKeywords = item.keywords?.some(k => k.includes(normalizedQuery)) || false;

    return inTitle || inDesc || inKeywords;
  });

  const categories = ['All', 'Service', 'Technology', 'Company', 'Portal'];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div
        className="w-full max-w-2xl bg-[#070b19] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden relative isolate flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <Search size={20} className="text-brand-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-slate-400 font-inter text-sm md:text-base outline-none border-none"
            placeholder="Search services, apps, tech stack, or portals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Clear input"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-black/30 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] text-slate-500 font-mono shrink-0">Filter:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand-cyan text-slate-950 shadow-sm shadow-cyan-500/30 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => {
              const IconComp = result.icon || Sparkles;
              return (
                <Link
                  key={result.id}
                  to={result.url}
                  onClick={onClose}
                  className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 transition-colors">
                    <IconComp size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-outfit font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {result.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 shrink-0">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-inter">{result.description}</p>
                    <span className="text-[10px] text-cyan-400/70 font-mono mt-1 block">{result.url}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                </Link>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-3 text-slate-600 animate-bounce" />
              <p className="text-sm font-inter">
                No active pages matching "<span className="text-white font-semibold">{query}</span>"
              </p>
              <p className="text-xs text-slate-500 mt-1">Try searching for "Web", "Mobile App", "Branding", "SEO", or "Quote"</p>
            </div>
          )}
        </div>

        {/* Footer with Shortcuts */}
        <div className="p-3 bg-black/50 border-t border-white/5 flex items-center justify-between text-[11px] font-inter text-slate-500 px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Verified Live Pages</span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">Ctrl + K</kbd>
            <span>shortcut enabled</span>
          </span>
        </div>
      </div>
    </div>
  );
}
