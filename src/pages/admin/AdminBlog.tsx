import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import type { BlogPost } from '../../lib/api';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    supabase
      .from('blog_posts')
      .select('id, title, slug, category, author, reading_time, published, published_at, created_at')
      .order('created_at', { ascending: false })
      .then((res: any) => { setPosts((res?.data || []) as BlogPost[]); setLoading(false); });
  };

  useEffect(load, []);

  const togglePublish = async (id: string | number | undefined, published: boolean | undefined) => {
    if (!id) return;
    const nextState = !published;
    await supabase
      .from('blog_posts')
      .update({ published: nextState, published_at: nextState ? new Date().toISOString() : null })
      .eq('id', id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: nextState } : p));
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sora font-black text-white text-2xl">Blog Posts</h1>
            <p className="text-slate-400 text-sm font-inter">{posts.length} posts</p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter">
              <thead>
                <tr className="border-b border-white/5">
                  {['Title', 'Category', 'Author', 'Read Time', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded w-20" /></td>)}</tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No blog posts yet.</td></tr>
                ) : (
                  posts.map(post => (
                    <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white max-w-xs">
                        <div className="truncate font-medium">{post.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{post.slug}</div>
                      </td>
                      <td className="px-4 py-3"><span className="tag text-[10px]">{post.category}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{post.author}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{post.reading_time} min</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${post.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{post.created_at ? new Date(post.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePublish(post.id, post.published)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-inter transition-colors ${post.published ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                        >
                          {post.published ? <><EyeOff size={10} /> Unpublish</> : <><Eye size={10} /> Publish</>}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
