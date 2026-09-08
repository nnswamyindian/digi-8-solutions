import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Briefcase, Clock, Sparkles,
  ArrowRight, Globe, BookOpen, Heart, TrendingUp, Compass, Laptop,
  ChevronRight
} from 'lucide-react';
import { fetchCareersJobs, type JobPosting } from '../lib/api';
import ApplicationFormModal from '../components/career/ApplicationFormModal';

export default function CareerLanding() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobPosting | null>(null);

  useEffect(() => {
    loadJobs();
  }, [selectedCategory, selectedType, selectedMode]);

  const loadJobs = async () => {
    setLoading(true);
    const data = await fetchCareersJobs({
      category: selectedCategory,
      job_type: selectedType,
      work_mode: selectedMode,
      search: searchTerm,
      status: 'published'
    });
    setJobs(data);
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedMode('All');
  };

  const perks = [
    { title: 'Remote-First Culture', desc: 'Work flexibly from anywhere in India with asynchronous autonomy.', icon: Globe, color: '#3B82F6' },
    { title: 'Generous Learning Budget', desc: 'Annual stipend for technical certifications, courses, and conferences.', icon: BookOpen, color: '#8B5CF6' },
    { title: 'Comprehensive Wellness', desc: 'Medical insurance covering you and your dependents from day one.', icon: Heart, color: '#F43F5E' },
    { title: 'Competitive Compensation & ESOPs', desc: 'Above-market pay structures with milestone performance bonuses.', icon: TrendingUp, color: '#10B981' },
    { title: 'Annual Offsites & Retreats', desc: 'Regular team gatherings to celebrate milestones, bond, and recharge.', icon: Compass, color: '#F59E0B' },
    { title: 'High-Spec Tech Hardware', desc: 'Top-tier Apple Silicon MacBooks and modern developer tooling.', icon: Laptop, color: '#06B6D4' },
  ];

  const categories = ['All', 'Engineering', 'Design', 'Marketing', 'Sales', 'Infrastructure'];
  const workModes = ['All', 'Remote', 'Hybrid', 'On-site'];
  const jobTypes = ['All', 'Full-time', 'Freelance', 'Contract', 'Part-time'];

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative pt-16 md:pt-28 pb-16 md:pb-24 border-b border-white/5 z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-6 shadow-neon-blue">
            <Sparkles size={13} />
            <span>Join Our Global Team</span>
          </div>

          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight tracking-tight">
            Build Your Future <span className="text-gradient">With DIGI8 Solutions</span>
          </h1>

          <p className="text-slate-300 font-inter text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            We are actively looking for visionary engineers, designers, strategists, and freelancers to architect next-generation digital solutions for global enterprises.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#opportunities"
              className="w-full sm:w-auto btn-glow px-8 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-neon-blue transition-all"
            >
              Explore Opportunities <ArrowRight size={16} />
            </a>
            <Link
              to="/career/status"
              className="w-full sm:w-auto btn-outline-glass px-6 py-3.5 rounded-xl font-semibold text-sm text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:text-white transition-colors text-center flex items-center justify-center gap-2"
            >
              <Clock size={16} /> Track Application Status
            </Link>
            <a
              href="#why-digi8"
              className="w-full sm:w-auto btn-outline-glass px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white transition-colors text-center"
            >
              Why Work With Us
            </a>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-outfit font-bold text-2xl sm:text-3xl text-white">100%</div>
              <div className="text-xs text-slate-400 font-inter mt-0.5">Remote & Hybrid Friendly</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-outfit font-bold text-2xl sm:text-3xl text-brand-cyan">15+</div>
              <div className="text-xs text-slate-400 font-inter mt-0.5">Global Enterprise Clients</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-outfit font-bold text-2xl sm:text-3xl text-brand-purple">4.9/5</div>
              <div className="text-xs text-slate-400 font-inter mt-0.5">Team Satisfaction Score</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-outfit font-bold text-2xl sm:text-3xl text-emerald-400">Fast-Track</div>
              <div className="text-xs text-slate-400 font-inter mt-0.5">1-Week Hiring Process</div>
            </div>
          </div>
        </div>
      </section>

      {/* JOB SEARCH & OPPORTUNITIES SECTION */}
      <section id="opportunities" className="py-16 md:py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="tag mb-3 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex">
                Active Listings
              </div>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">
                Current <span className="text-gradient">Opportunities</span>
              </h2>
              <p className="text-slate-400 text-sm font-inter mt-1">
                Find the ideal role matching your expertise, whether full-time, contract, or freelance.
              </p>
            </div>
            <div className="text-xs font-semibold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1.5 rounded-xl self-start md:self-auto">
              {jobs.length} Available {jobs.length === 1 ? 'Role' : 'Roles'}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-card-premium p-4 sm:p-5 rounded-2xl mb-8 border border-white/10 shadow-glass">
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by role, keyword, or technology (e.g. React, UI/UX, SEO)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#050811] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-brand-cyan"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>Category: {c}</option>
                  ))}
                </select>

                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-brand-cyan"
                >
                  {workModes.map((m) => (
                    <option key={m} value={m}>Work Mode: {m}</option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-brand-cyan"
                >
                  {jobTypes.map((t) => (
                    <option key={t} value={t}>Type: {t}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-glow px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  Search
                </button>
                {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All' || selectedMode !== 'All') && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs"
                    title="Clear Filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card-premium p-6 rounded-2xl h-36 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card-premium p-12 text-center rounded-2xl border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={22} />
              </div>
              <h3 className="font-outfit font-bold text-xl text-white mb-2">No matching opportunities found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Try adjusting your search terms or clearing category filters to view other openings.
              </p>
              <button
                onClick={resetFilters}
                className="btn-outline-glass px-6 py-2.5 rounded-xl text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="glass-card-premium p-6 sm:p-7 rounded-2xl border border-white/10 hover:border-brand-cyan/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)] group relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left Accent Stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-cyan/40 group-hover:bg-brand-cyan transition-colors" />

                  {/* Job Details */}
                  <div className="pl-3 sm:pl-4 space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-brand-cyan font-bold bg-brand-cyan/10 px-2.5 py-0.5 rounded-md border border-brand-cyan/20">
                        {job.job_id}
                      </span>
                      <span className="text-slate-400 font-medium">{job.category}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{job.location}</span>
                    </div>

                    <div>
                      <Link
                        to={`/career/${job.slug}`}
                        className="font-outfit font-bold text-xl sm:text-2xl text-white group-hover:text-brand-cyan transition-colors"
                      >
                        {job.title}
                      </Link>
                      {job.short_description && (
                        <p className="text-slate-300 text-sm line-clamp-2 mt-1 font-inter">
                          {job.short_description}
                        </p>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Briefcase size={13} className="text-brand-cyan" /> {job.job_type}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Globe size={13} className="text-brand-purple" /> {job.work_mode}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Clock size={13} className="text-amber-400" /> {job.experience}
                      </span>
                      {job.compensation && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                          {job.compensation}
                        </span>
                      )}
                    </div>

                    {/* Skills pills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.03] text-slate-400 border border-white/5"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-[11px] text-slate-500 px-1 py-0.5">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2.5 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <button
                      onClick={() => setSelectedJobForModal(job)}
                      className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white text-center shadow-neon-blue"
                    >
                      Apply Now
                    </button>
                    <Link
                      to={`/career/${job.slug}`}
                      className="btn-outline-glass px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white text-center flex items-center justify-center gap-1"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY WORK AT DIGI8 / PERKS SECTION */}
      <section id="why-digi8" className="py-16 md:py-24 px-4 sm:px-6 relative z-10 bg-brand-surface border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="tag mx-auto mb-3 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex">
              Culture & Benefits
            </div>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">
              Why Professionals Choose <span className="text-gradient">DIGI8 Solutions</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
              We empower ambitious builders with autonomy, modern technology stacks, and holistic support.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="glass-card-premium p-7 rounded-2xl group hover:-translate-y-1.5 transition-all duration-300 border border-white/10"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${perk.color}15`, borderColor: `${perk.color}35` }}
                  >
                    <Icon size={22} style={{ color: perk.color }} />
                  </div>
                  <h3 className="font-outfit font-bold text-white text-lg mb-2">{perk.title}</h3>
                  <p className="text-slate-400 text-xs font-inter leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OPEN TALENT CALL BANNER */}
      <section className="py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto glass-card-premium p-8 sm:p-10 rounded-3xl border border-brand-cyan/20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="font-outfit font-bold text-2xl sm:text-3xl text-white mb-3">
            Don't see your exact role listed?
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
            We are always eager to connect with outstanding developers, UI/UX designers, and freelance collaborators. Send your portfolio directly to our recruitment team.
          </p>
          <a
            href="mailto:careers@digi8solutions.com?subject=Unsolicited%20Talent%20Inquiry%20%E2%80%94%20DIGI8%20Solutions"
            className="btn-glow px-8 py-3 rounded-xl font-bold text-white text-sm inline-flex items-center gap-2"
          >
            Introduce Yourself <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* Application Modal Trigger */}
      {selectedJobForModal && (
        <ApplicationFormModal
          job={selectedJobForModal}
          isOpen={!!selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
        />
      )}
    </div>
  );
}
