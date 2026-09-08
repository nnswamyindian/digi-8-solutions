import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Mail, Phone, MapPin, Tag,
  ExternalLink, ChevronRight, Briefcase, RefreshCw,
  Sparkles, Layers
} from 'lucide-react';
import {
  type CandidateCrmSummary,
  fetchCandidatesCrm
} from '../../lib/api';
import CandidateWorkspaceModal from '../../components/admin/ats/CandidateWorkspaceModal';
import AtsNavHeader from '../../components/admin/ats/AtsNavHeader';
import AdminLayout from './AdminLayout';

export default function AdminCandidateCrm() {
  const [candidates, setCandidates] = useState<CandidateCrmSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    loadCrmData();
  }, []);

  const loadCrmData = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidatesCrm();
      setCandidates(data);
    } catch (err) {
      console.error('Error loading candidate CRM:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchSearch =
      searchTerm === '' ||
      c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.current_role && c.current_role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.latest_job_title && c.latest_job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStage = stageFilter === 'all' || (c.latest_stage && c.latest_stage.toLowerCase() === stageFilter.toLowerCase());

    return matchSearch && matchStage;
  });

  const totalUniqueCandidates = candidates.length;
  const multiApplicationCandidates = candidates.filter(c => c.total_applications > 1).length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ATS Top Navigation Header */}
        <AtsNavHeader
          title="Candidate CRM"
          subtitle="Unified talent profiles grouped by candidate email across all roles, historical applications, notes, and tags."
          badge="Centralized Talent Hub"
          actionButton={
            <button
              onClick={loadCrmData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh CRM records"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          }
        />

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Unique Candidates</p>
            <p className="text-xl font-black text-white">{totalUniqueCandidates}</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Multi-Role Applicants</p>
            <p className="text-xl font-black text-white">{multiApplicationCandidates}</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Candidate Pool</p>
            <p className="text-xl font-black text-white">
              {candidates.filter(c => c.latest_stage !== 'rejected' && c.latest_stage !== 'hired').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate name, email, role, or skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-slate-400">Stage:</span>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="assessment">Assessment</option>
              <option value="selected">Selected</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="text-slate-400 pl-2 border-l border-slate-800">
            Showing <strong className="text-white">{filteredCandidates.length}</strong> profiles
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Latest Role</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4">Recruiter</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading CRM candidate profiles...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 italic">
                    No candidates match your search filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(cand => (
                  <tr
                    key={cand.email}
                    onClick={() => setSelectedAppId(cand.latest_application_id)}
                    className="hover:bg-slate-900/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {cand.candidate_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {cand.candidate_name}
                          </p>
                          <p className="text-[11px] text-slate-400">{cand.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{cand.latest_job_title}</p>
                      <p className="text-[10px] text-slate-500">{cand.current_role || 'Current role not specified'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                        cand.latest_stage === 'interview' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        cand.latest_stage === 'shortlisted' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        cand.latest_stage === 'selected' || cand.latest_stage === 'hired' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        cand.latest_stage === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {cand.latest_stage || 'applied'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {cand.total_applications} {cand.total_applications === 1 ? 'role' : 'roles'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {cand.tags && cand.tags.length > 0 ? (
                          cand.tags.map((t, idx) => (
                            <span
                              key={idx}
                              style={{ color: t.color_code, borderColor: `${t.color_code}40`, backgroundColor: `${t.color_code}15` }}
                              className="text-[9px] font-semibold px-1.5 py-0.2 rounded border"
                            >
                              {t.tag_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-600">&mdash;</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {cand.recruiter_name || 'Unassigned'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(cand.latest_application_date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppId(cand.latest_application_id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        Profile <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workspace Modal */}
      {selectedAppId && (
        <CandidateWorkspaceModal
          applicationId={selectedAppId}
          isOpen={Boolean(selectedAppId)}
          onClose={() => setSelectedAppId(null)}
          onApplicationUpdated={loadCrmData}
        />
      )}
      </div>
    </AdminLayout>
  );
}
