import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Calendar, Mail, TrendingUp, Plus,
  FileText, Briefcase, ArrowRight, X
} from 'lucide-react';
import { fetchCareerApplications, type JobApplication } from '../../../lib/api';

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CommandPalette({ isOpen: controlledOpen, onClose }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const navigate = useNavigate();

  const isPaletteOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isPaletteOpen) {
        if (onClose) onClose();
        else setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, onClose]);

  useEffect(() => {
    if (isPaletteOpen) {
      fetchCareerApplications().then(setApplications).catch(() => {});
    }
  }, [isPaletteOpen]);

  const handleClose = () => {
    if (onClose) onClose();
    else setIsOpen(false);
    setQuery('');
  };

  const executeAction = (path: string) => {
    navigate(path);
    handleClose();
  };

  if (!isPaletteOpen) return null;

  const quickNav = [
    { title: 'Recruitment Kanban Pipeline', desc: 'Drag-and-drop applicant progression', path: '/admin/careers/pipeline', icon: Users },
    { title: 'Unified Candidate CRM', desc: 'Search and group talent across all roles', path: '/admin/careers/candidates', icon: Briefcase },
    { title: 'Interview Center & Scorecards', desc: 'Schedule rounds & evaluate evaluations', path: '/admin/careers/interviews', icon: Calendar },
    { title: 'Email Templates & Automation', desc: 'Configure automated notification rules', path: '/admin/careers/automations', icon: Mail },
    { title: 'Recruitment Funnel & Analytics', desc: 'Telemetry, conversion rates & velocity', path: '/admin/careers/analytics', icon: TrendingUp },
    { title: 'Post New Opportunity', desc: 'Create and publish job opening', path: '/admin/careers/jobs/new', icon: Plus },
    { title: 'Public Careers Portal', desc: 'Candidate-facing listings', path: '/career', icon: FileText },
    { title: 'Applicant Status Tracker', desc: 'Candidate self-service tracker', path: '/career/status', icon: Search },
  ];

  const filteredNav = quickNav.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const matchedCandidates = applications
    .filter(a =>
      a.candidate_name.toLowerCase().includes(query.toLowerCase()) ||
      a.email.toLowerCase().includes(query.toLowerCase()) ||
      (a.application_id && a.application_id.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search size={18} className="text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search candidates, or jump to ATS views (Ctrl+K)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
          <button onClick={handleClose} className="text-slate-500 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4">
          {/* Quick Navigation Commands */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
              ATS Quick Navigation
            </p>
            <div className="space-y-1">
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => executeAction(item.path)}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 flex items-center justify-center text-slate-400 transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched Candidates */}
          {query.trim() && matchedCandidates.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                Matched Candidates
              </p>
              <div className="space-y-1">
                {matchedCandidates.map(c => (
                  <button
                    key={c.application_id}
                    onClick={() => executeAction('/admin/careers/pipeline')}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        {c.candidate_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {c.candidate_name} &bull; <span className="text-[11px] text-slate-400 font-normal">{c.current_role || c.job_title}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">{c.application_id} &bull; {c.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {c.stage_slug || 'applied'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">↓</kbd></span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Enter</kbd> to select</span>
        </div>
      </div>
    </div>
  );
}
