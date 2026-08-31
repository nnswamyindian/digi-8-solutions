import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/api';
import { RefreshCw, Star, ExternalLink } from 'lucide-react';
import type { Project } from '../../lib/api';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    supabase.from('projects').select('*').order('sort_order').order('created_at', { ascending: false })
      .then((res: any) => { setProjects((res?.data || []) as Project[]); setLoading(false); });
  };

  useEffect(load, []);

  const toggleFeatured = async (id: string | number | undefined, featured: boolean | undefined) => {
    if (!id) return;
    const nextState = !featured;
    await supabase.from('projects').update({ featured: nextState }).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, featured: nextState } : p));
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sora font-black text-white text-2xl">Portfolio Projects</h1>
            <p className="text-slate-400 text-sm font-inter">{projects.length} projects</p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass rounded-2xl h-52 shimmer border border-white/5" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl p-16 border border-white/10 text-center text-slate-400 font-inter">No projects yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div key={project.id} className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-accent/20 transition-all">
                {project.thumbnail_url && (
                  <img src={project.thumbnail_url} alt={project.title} className="w-full h-36 object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-sora font-semibold text-white text-sm">{project.title}</h3>
                    <button
                      onClick={() => toggleFeatured(project.id, project.featured)}
                      className={`flex-shrink-0 transition-colors ${project.featured ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                      title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star size={14} fill={project.featured ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="tag text-[10px]">{project.category}</span>
                    {project.client && <span className="text-[10px] text-slate-500">{project.client}</span>}
                  </div>
                  {project.tech_stack && (
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">{t}</span>
                      ))}
                    </div>
                  )}
                  {project.live_url && project.live_url !== '#' && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-accent hover:underline mt-2">
                      <ExternalLink size={10} /> Live site
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
