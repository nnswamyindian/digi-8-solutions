import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Plus, Search, RefreshCw,
  ExternalLink, Edit, Copy, Eye, EyeOff, Trash2, Download,
  AlertCircle, FileSpreadsheet, ArrowUpRight,
  Calendar, Mail, BarChart2, Briefcase
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import AtsNavHeader from '../../components/admin/ats/AtsNavHeader';
import AdminApplicationDetailModal from './AdminApplicationDetailModal';
import {
  fetchCareersStats,
  fetchCareersJobs,
  fetchCareerApplications,
  updateCareerJob,
  deleteCareerJob,
  createCareerJob,
  deleteCareerApplication,
  type JobPosting,
  type JobApplication,
  type CareerStats
} from '../../lib/api';

export default function AdminCareers() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications'>('overview');

  // Overview Stats
  const [stats, setStats] = useState<CareerStats>({
    activeJobs: 0,
    draftJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });

  // Data states
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Application Filters & Search
  const [appSearch, setAppSearch] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedExpFilter, setSelectedExpFilter] = useState('All');

  // Job Filters & Search
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('All');

  // Selected Application for Dossier Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  // Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'job' | 'app'; id: string | number; title: string } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [statsData, jobsData, appsData] = await Promise.all([
      fetchCareersStats(),
      fetchCareersJobs({ all: true }),
      fetchCareerApplications()
    ]);
    setStats(statsData);
    setJobs(jobsData);
    setApplications(appsData);
    setLoading(false);
  };

  // Job Actions
  const handleTogglePublish = async (job: JobPosting) => {
    if (!job.id) return;
    const nextStatus = job.status === 'published' ? 'draft' : 'published';
    await updateCareerJob(job.id, { status: nextStatus });
    loadAllData();
  };

  const handleDuplicateJob = async (job: JobPosting) => {
    const copyPayload: Partial<JobPosting> = {
      ...job,
      id: undefined,
      job_id: `DIGI8-JOB-${Math.floor(100 + Math.random() * 900)}`,
      title: `${job.title} (Copy)`,
      slug: `${job.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      applications_count: 0
    };
    await createCareerJob(copyPayload);
    loadAllData();
  };

  const handleDeleteJob = async (id: string | number) => {
    await deleteCareerJob(id);
    setDeleteConfirm(null);
    loadAllData();
  };

  const handleDeleteApp = async (id: string | number) => {
    await deleteCareerApplication(id);
    setDeleteConfirm(null);
    loadAllData();
  };

  // Export Applications to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) return;

    const headers = ['Application ID', 'Candidate Name', 'Email', 'Phone', 'Job Title', 'Experience', 'Status', 'Applied Date'];
    const rows = filteredApplications.map(a => [
      `"${a.application_id}"`,
      `"${a.candidate_name}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.job_title || a.job_id}"`,
      `"${a.experience || ''}"`,
      `"${a.status}"`,
      `"${new Date(a.created_at || Date.now()).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `digi8_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Applications to Excel (XML/HTML Table format recognized by MS Excel)
  const handleExportExcel = () => {
    if (applications.length === 0) return;

    let excelTable = `<table border="1">
      <thead>
        <tr style="background-color: #06B6D4; color: #ffffff; font-weight: bold;">
          <th>Application ID</th>
          <th>Candidate Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Job Title</th>
          <th>Current Role</th>
          <th>Experience</th>
          <th>Location</th>
          <th>Status</th>
          <th>Applied Date</th>
        </tr>
      </thead>
      <tbody>`;

    filteredApplications.forEach(a => {
      excelTable += `<tr>
        <td>${a.application_id}</td>
        <td>${a.candidate_name}</td>
        <td>${a.email}</td>
        <td>${a.phone}</td>
        <td>${a.job_title || a.job_id}</td>
        <td>${a.current_role || ''}</td>
        <td>${a.experience || ''}</td>
        <td>${a.location || ''}</td>
        <td>${a.status.toUpperCase()}</td>
        <td>${new Date(a.created_at || Date.now()).toLocaleDateString()}</td>
      </tr>`;
    });

    excelTable += `</tbody></table>`;

    const blob = new Blob([excelTable], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `digi8_applications_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Applications
  const filteredApplications = applications.filter(app => {
    const matchesJob = selectedJobFilter === 'All' || app.job_id === selectedJobFilter;
    const matchesStatus = selectedStatusFilter === 'All' || app.status === selectedStatusFilter;
    const matchesExp = selectedExpFilter === 'All' || (app.experience && app.experience.includes(selectedExpFilter));
    const s = appSearch.toLowerCase().trim();
    const matchesSearch = !s || (
      app.candidate_name.toLowerCase().includes(s) ||
      app.email.toLowerCase().includes(s) ||
      app.phone.includes(s) ||
      app.application_id.toLowerCase().includes(s) ||
      (app.job_title && app.job_title.toLowerCase().includes(s))
    );
    return matchesJob && matchesStatus && matchesExp && matchesSearch;
  });

  // Filtered Jobs
  const filteredJobs = jobs.filter(j => {
    const matchesStatus = jobStatusFilter === 'All' || j.status === jobStatusFilter;
    const s = jobSearch.toLowerCase().trim();
    const matchesSearch = !s || (
      j.title.toLowerCase().includes(s) ||
      j.job_id.toLowerCase().includes(s) ||
      j.category.toLowerCase().includes(s)
    );
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* Unified ATS Navigation Header */}
        <AtsNavHeader
          title="Careers Platform"
          subtitle="Manage job postings, track applicant submissions, review resumes, and export candidate data."
          badge="Careers & Recruitment"
          actionButton={
            <div className="flex items-center gap-2">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <Link
                to="/career/status"
                target="_blank"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-white hover:text-white font-semibold transition-all text-slate-400 text-xs"
              >
                <ExternalLink size={13} />
                <span>Status Tracker</span>
              </Link>
            </div>
          }
        />

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 font-semibold transition-colors relative ${
              activeTab === 'overview'
                ? 'text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2.5 font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Jobs</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
              {jobs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2.5 font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Applications</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-mono font-bold">
              {applications.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* 5 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Active Jobs</span>
                <div className="font-outfit font-black text-3xl text-emerald-400">{stats.activeJobs}</div>
                <span className="text-[10px] text-slate-500">Live on /career</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Draft Jobs</span>
                <div className="font-outfit font-black text-3xl text-amber-400">{stats.draftJobs}</div>
                <span className="text-[10px] text-slate-500">Unpublished</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Closed Jobs</span>
                <div className="font-outfit font-black text-3xl text-slate-400">{stats.closedJobs}</div>
                <span className="text-[10px] text-slate-500">Expired or archived</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Total Applications</span>
                <div className="font-outfit font-black text-3xl text-brand-cyan">{stats.totalApplications}</div>
                <span className="text-[10px] text-slate-500">Candidate records</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/[0.03] space-y-2">
                <span className="text-xs text-brand-cyan font-bold">New Applications</span>
                <div className="font-outfit font-black text-3xl text-brand-cyan">{stats.newApplications}</div>
                <span className="text-[10px] text-brand-cyan/70">Awaiting review</span>
              </div>
            </div>

            {/* Quick Actions & Recent Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Quick Actions Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-outfit font-bold text-base text-white">Recruitment Shortcuts</h3>
                <div className="space-y-2.5">
                  <Link
                    to="/admin/careers/jobs/new"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Plus size={15} className="text-brand-cyan" /> Create New Job Opening
                    </span>
                    <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white" />
                  </Link>

                  <button
                    onClick={() => setActiveTab('applications')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users size={15} className="text-brand-purple" /> Review Candidate Pipeline
                    </span>
                    <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white" />
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Download size={15} className="text-emerald-400" /> Export Candidate Database (CSV)
                    </span>
                    <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Recent Applications Preview */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-outfit font-bold text-base text-white">Recent Candidate Submissions</h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-brand-cyan hover:underline font-semibold"
                  >
                    View all ({applications.length})
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No applications submitted yet. Once candidates apply on /career, they will appear here.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {applications.slice(0, 5).map(app => (
                      <div
                        key={app.application_id}
                        onClick={() => setSelectedApp(app)}
                        className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-brand-cyan/30 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-white">{app.candidate_name}</span>
                            <span className="font-mono text-[10px] text-brand-cyan">{app.application_id}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {app.job_title || app.job_id} • {app.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                            app.status === 'new' ? 'bg-sky-500/10 text-sky-400' :
                            app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400' :
                            app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(app.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOBS MANAGEMENT */}
        {activeTab === 'jobs' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter & Search Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title or ID..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={jobStatusFilter}
                  onChange={e => setJobStatusFilter(e.target.value)}
                  className="bg-[#0f1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>

                <Link
                  to="/admin/careers/jobs/new"
                  className="btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-neon-blue"
                >
                  <Plus size={13} /> Add Job
                </Link>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-inter">
                  <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Job Title & ID</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Type & Mode</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Applications</th>
                      <th className="p-4">Deadline</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No jobs match the specified criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map(job => (
                        <tr key={job.job_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{job.title}</div>
                            <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-brand-cyan">
                              <span>{job.job_id}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400 font-sans">{job.location}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300">{job.category}</td>
                          <td className="p-4 text-slate-300">
                            <div>{job.job_type}</div>
                            <div className="text-[10px] text-slate-500">{job.work_mode}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize ${
                              job.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              job.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                              'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-brand-cyan">
                            {job.applications_count || 0}
                          </td>
                          <td className="p-4 text-slate-400">
                            {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Rolling'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Public link */}
                              <Link
                                to={`/career/${job.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-white/5"
                                title="View Public Page"
                              >
                                <ExternalLink size={14} />
                              </Link>

                              {/* Edit */}
                              <Link
                                to={`/admin/careers/jobs/${job.id}/edit`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                                title="Edit Job"
                              >
                                <Edit size={14} />
                              </Link>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicateJob(job)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-purple hover:bg-white/5"
                                title="Duplicate Job"
                              >
                                <Copy size={14} />
                              </button>

                              {/* Publish / Unpublish Toggle */}
                              <button
                                onClick={() => handleTogglePublish(job)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5"
                                title={job.status === 'published' ? 'Unpublish to Draft' : 'Publish Job'}
                              >
                                {job.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirm({ type: 'job', id: job.id || '', title: job.title })}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                title="Delete Job"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CANDIDATE APPLICATIONS DATABASE */}
        {activeTab === 'applications' && (
          <div className="space-y-4 animate-fade-in">

            {/* Filter, Search & Export Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="relative w-full lg:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate, email, ID..."
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto">
                <select
                  value={selectedJobFilter}
                  onChange={e => setSelectedJobFilter(e.target.value)}
                  className="bg-[#0f1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="All">All Positions</option>
                  {jobs.map(j => (
                    <option key={j.job_id} value={j.job_id}>{j.title}</option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={e => setSelectedStatusFilter(e.target.value)}
                  className="bg-[#0f1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={selectedExpFilter}
                  onChange={e => setSelectedExpFilter(e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-[#0f1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="All">All Experience</option>
                  <option value="0-1">0-1 Years</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="3-5">3-5 Years</option>
                  <option value="5-8">5-8 Years</option>
                  <option value="8+">8+ Years</option>
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  disabled={filteredApplications.length === 0}
                  className="btn-outline-glass px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  title="Export to CSV"
                >
                  <Download size={13} /> CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={filteredApplications.length === 0}
                  className="btn-outline-glass px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-white flex items-center gap-1.5"
                  title="Export to Excel"
                >
                  <FileSpreadsheet size={13} /> Excel
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-inter">
                  <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Application ID</th>
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Applied Role</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Experience</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Applied Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No candidate applications match the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map(app => (
                        <tr key={app.application_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-brand-cyan">
                            {app.application_id}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{app.candidate_name}</div>
                            {app.current_role && (
                              <div className="text-[11px] text-slate-400">{app.current_role}</div>
                            )}
                          </td>
                          <td className="p-4 text-slate-200">
                            <div>{app.job_title || app.job_id}</div>
                          </td>
                          <td className="p-4 text-slate-300">
                            <div>{app.email}</div>
                            <div className="text-[10px] text-slate-500">{app.phone}</div>
                          </td>
                          <td className="p-4 text-slate-300">{app.experience || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize ${
                              app.status === 'new' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                              app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {new Date(app.created_at || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="btn-outline-glass px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-cyan hover:text-white flex items-center gap-1"
                              >
                                View Dossier
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'app', id: app.id || '', title: app.candidate_name })}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                title="Delete Record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dossier Modal */}
        {selectedApp && (
          <AdminApplicationDetailModal
            application={selectedApp}
            isOpen={!!selectedApp}
            onClose={() => setSelectedApp(null)}
            onUpdated={loadAllData}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-outfit font-bold text-lg text-white">Confirm Deletion</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be reversed.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm.type === 'job' ? handleDeleteJob(deleteConfirm.id) : handleDeleteApp(deleteConfirm.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
