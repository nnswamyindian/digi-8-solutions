import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBlogPosts } from '../lib/api';
import type { BlogPost } from '../lib/api';

const categories = ['All', 'AI & Technology', 'Design', 'Branding', 'Security', 'Startup', 'Mobile', 'Digital Marketing'];

export default function Blog() {
  const [active, setActive] = useState('All');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts(active).then(d => { setPosts(d); setLoading(false); }).catch(() => setLoading(false));
  }, [active]);

  const filtered = posts.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen">
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="tag mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex shadow-glass">
            Insights & Ideas
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
            The Digital <span className="text-gradient">Playbook</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Expert insights on web development, design, digital marketing, cybersecurity, and startup growth.
          </p>
          
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-white/5 bg-brand-surface relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  active === cat
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-neon-blue border border-brand-cyan/50'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card-premium h-80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400 font-medium glass-card-premium max-w-2xl mx-auto">
              No articles found.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="block group h-full">
                    <div className="glass-card-premium h-full flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:border-brand-cyan/30">
                      
                      {post.cover_url && (
                        <div className="h-48 relative overflow-hidden">
                          <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        </div>
                      )}
                      
                      <div className="p-6 flex flex-col flex-1 relative z-20">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan px-2 py-1 bg-brand-cyan/10 rounded border border-brand-cyan/20">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Clock size={12} /> {post.reading_time} min
                          </span>
                        </div>
                        
                        <h3 className="font-outfit font-bold text-white text-xl leading-snug line-clamp-2 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-cyan group-hover:to-brand-purple transition-all flex-1">
                          {post.title}
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                          <span className="text-xs font-semibold text-slate-500">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-brand-cyan group-hover:text-white transition-colors">
                            Read Article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
