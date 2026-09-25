import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Calendar,
  Mail,
  BarChart2,
  ExternalLink,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface AtsNavHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  actionButton?: React.ReactNode;
}

export default function AtsNavHeader({ title, subtitle, badge, actionButton }: AtsNavHeaderProps) {
  const location = useLocation();

  const tabs = [
    { label: 'Job Postings & Applications', href: '/admin/careers', icon: Briefcase },
    { label: 'Pipeline Kanban', href: '/admin/careers/pipeline', icon: Users },
    { label: 'Candidate CRM', href: '/admin/careers/candidates', icon: Users },
    { label: 'Interviews & Scorecards', href: '/admin/careers/interviews', icon: Calendar },
    { label: 'Email Automations', href: '/admin/careers/automations', icon: Mail },
    { label: 'Funnel Telemetry', href: '/admin/careers/analytics', icon: BarChart2 },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Bar with Back Link & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft size={14} className="text-cyan-400" />
            <span>Dashboard</span>
          </Link>

          {location.pathname !== '/admin/careers' && (
            <Link
              to="/admin/careers"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-colors shrink-0"
              title="Back to Careers Overview"
            >
              <span>Careers Overview</span>
            </Link>
          )}

          {title && (
            <div className="border-l border-white/10 pl-3 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Digi 8"
                className="h-9 w-auto object-contain hidden lg:block drop-shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-outfit font-black text-2xl md:text-3xl text-white tracking-tight">
                    {title}
                  </h1>
                  {badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && <p className="text-slate-400 text-xs md:text-sm mt-0.5 font-inter">{subtitle}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <Link
            to="/career"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} className="text-slate-400" />
            <span>Public Portal</span>
          </Link>
          <Link
            to="/admin/careers/jobs/new"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus size={14} />
            <span>Post Job</span>
          </Link>
          {actionButton}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10 font-bold'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
