import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles, Building2, Code, Shield, Megaphone, Cpu, Briefcase, HelpCircle } from 'lucide-react';
import { divisions } from '../data/servicesData';

interface SearchResult {
    id: string;
    title: string;
    category: 'Service' | 'Technology' | 'Article' | 'Page';
    description: string;
    url: string;
    icon?: any;
}

const searchableDatabase: SearchResult[] = [
    ...divisions.map(d => ({
        id: d.slug,
        title: d.title,
        category: 'Service' as const,
        description: d.desc,
        url: d.slug,
        icon: d.icon
    })),
    { id: 'tech-stack', title: 'Enterprise Technology Infrastructure', category: 'Technology', description: 'Cloud infrastructure, DevOps, Microservices, and AI integrations.', url: '/technologies', icon: Code },
    { id: 'web-dev', title: 'Custom Web & Mobile Application Development', category: 'Service', description: 'React, Node.js, Next.js, Flutter high-performance apps.', url: '/services/web-development', icon: Code },
    { id: 'cyber', title: 'Cybersecurity & Cloud Compliance Audit', category: 'Service', description: 'SOC2 compliance, penetration testing, and cloud architecture security.', url: '/services/cyber-security', icon: Shield },
    { id: 'ai-train', title: 'Enterprise AI & Machine Learning Workforce Training', category: 'Service', description: 'Empower your teams with generative AI and custom LLM workflows.', url: '/services/ai-training', icon: Cpu },
    { id: 'growth-mktg', title: 'Performance Digital Marketing & SEO Growth Engine', category: 'Service', description: 'Data-driven B2B lead generation and search engine optimization.', url: '/services/digital-marketing', icon: Megaphone },
    { id: 'brand-id', title: '3D Brand Identity & Corporate Design', category: 'Service', description: 'Fortune 500 branding assets, logos, and UI/UX design systems.', url: '/services/branding', icon: Sparkles },
    { id: 'portfolio', title: 'Enterprise Case Studies & Client Success Stories', category: 'Page', description: 'Explore past digital transformation deliverables and results.', url: '/portfolio', icon: Briefcase },
    { id: 'calculator', title: 'Instant Interactive Quote & Cost Calculator', category: 'Page', description: 'Calculate custom estimates for your software & marketing needs.', url: '/quote-calculator', icon: Sparkles },
    { id: 'pricing', title: 'Transparent Service Packages & Enterprise Pricing', category: 'Page', description: 'Browse startup, growth, and enterprise monthly plans.', url: '/pricing', icon: Building2 },
    { id: 'contact', title: 'Contact Us & Book Free Strategy Call', category: 'Page', description: 'Connect directly with our senior solution architects.', url: '/contact', icon: HelpCircle },
];

export default function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onClose(); // parent handles toggle
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredResults = searchableDatabase.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl bg-[#050816] border border-brand-cyan/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden relative isolate">

                {/* Input Bar */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Search size={20} className="text-brand-cyan" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent text-white placeholder-slate-400 font-inter text-sm md:text-base outline-none border-none"
                        placeholder="Search services, technology, case studies, or pages... (Esc to close)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                    <button onClick={onClose} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400 hover:text-white">
                        ESC
                    </button>
                </div>

                {/* Results Body */}
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                    {filteredResults.length > 0 ? (
                        filteredResults.map((result) => {
                            const IconComp = result.icon || Sparkles;
                            return (
                                <Link
                                    key={result.id}
                                    to={result.url}
                                    onClick={onClose}
                                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.02] hover:bg-brand-cyan/10 border border-white/5 hover:border-brand-cyan/30 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-brand-cyan/40 group-hover:bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0 transition-colors">
                                        <IconComp size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-sm font-outfit font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
                                                {result.title}
                                            </h4>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 shrink-0">
                                                {result.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-inter">{result.description}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-500 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                                </Link>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center text-slate-400">
                            <Search size={32} className="mx-auto mb-3 text-slate-600 animate-bounce" />
                            <p className="text-sm font-inter">No results matching "<span className="text-white font-semibold">{query}</span>"</p>
                            <p className="text-xs text-slate-500 mt-1">Try searching for "Web", "Cyber", "Pricing", or "Branding"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] font-inter text-slate-500 px-5">
                    <span>Digi-8 Solutions Global Index</span>
                    <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">Ctrl+K</span> to search anytime</span>
                </div>

            </div>
        </div>
    );
}
