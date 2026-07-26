import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft, Share2 } from 'lucide-react';
import { getBlogPost } from '../lib/api';
import type { BlogPost } from '../lib/api';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getBlogPost(slug)
        .then(d => { setPost(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return (
    <div className="bg-brand-dark min-h-screen relative z-10 pt-32 px-4 flex justify-center">
      <div className="max-w-3xl w-full">
        <div className="h-8 w-2/3 bg-white/5 animate-pulse rounded-xl mb-4" />
        <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded-xl mb-8" />
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl mb-8" />
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-white/5 animate-pulse rounded-xl mb-3" />)}
      </div>
    </div>
  );

  if (!post) return (
    <div className="bg-brand-dark min-h-screen relative z-10 pt-40 text-center">
      <h1 className="font-outfit font-black text-white text-4xl mb-6">Article Not Found</h1>
      <Link to="/blog" className="btn-glow py-3 px-6 text-sm font-bold inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Blog
      </Link>
    </div>
  );

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen">
      
      {/* Hero image */}
      {post.cover_url && (
        <div className="h-[40vh] sm:h-[60vh] relative overflow-hidden">
          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-32">
        <div className="relative z-10 -mt-20">
          
          <div className="glass-card-premium p-8 md:p-12 mb-12 shadow-2xl">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan px-2 py-1 bg-brand-cyan/10 rounded border border-brand-cyan/20">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Clock size={12} /> {post.reading_time} min read
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </span>
            </div>

            <h1 className="font-outfit font-black text-3xl sm:text-5xl text-white leading-[1.1] mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-slate-300 font-inter text-lg leading-relaxed mb-8 border-l-4 border-brand-cyan pl-6 bg-brand-cyan/5 p-4 rounded-r-xl">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white font-outfit font-bold text-base shadow-glass">
                  D8
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{post.author || 'Digi8 Editorial Team'}</div>
                  <div className="text-xs text-slate-400">Enterprise Digital Insights</div>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-cyan transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-brand-cyan/30">
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose-content">
            {post.content ? (
              <div className="text-slate-300 font-inter leading-loose whitespace-pre-wrap text-base sm:text-lg max-w-none">
                {post.content}
              </div>
            ) : (
              <div className="glass-card-premium p-8 text-center">
                <h3 className="font-outfit font-bold text-2xl text-white mb-4">Premium Content</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  This is a preview of the article. In this article, we explore the key insights and strategies that modern businesses need to thrive in the digital landscape.
                </p>
                <Link to="/contact" className="btn-glow py-3 px-8 text-sm font-bold inline-flex">
                  Subscribe for Full Access
                </Link>
              </div>
            )}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <Link to="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm">
              <ArrowLeft size={16} /> Back to Insights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
