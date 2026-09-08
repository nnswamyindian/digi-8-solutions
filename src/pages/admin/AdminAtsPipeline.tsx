import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, Calendar, Settings,
  Clock, CheckCircle2, ChevronRight, Briefcase, RefreshCw,
  ExternalLink, SlidersHorizontal, Eye, EyeOff, Trash2
} from 'lucide-react';
import {
  type JobApplication,
  type RecruitmentStage,
  type JobPosting,
  fetchRecruitmentStages,
  fetchCareerApplications,
  fetchCareersJobs,
  updateApplicationStage,
  createRecruitmentStage,
  updateRecruitmentStage,
  deleteRecruitmentStage
} from '../../lib/api';
import CandidateWorkspaceModal from '../../components/admin/ats/CandidateWorkspaceModal';
import AtsNavHeader from '../../components/admin/ats/AtsNavHeader';
import AdminLayout from './AdminLayout';

export default function AdminAtsPipeline() {
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Drag and Drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStageSlug, setDragOverStageSlug] = useState<string | null>(null);

  // Candidate Workspace Modal state
  const [workspaceAppId, setWorkspaceAppId] = useState<string | null>(null);

  // Stage Customization Modal state
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [editingStage, setEditingStage] = useState<RecruitmentStage | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageSlug, setNewStageSlug] = useState('');
  const [newStageColor, setNewStageColor] = useState('#06b6d4');
  const [newStageCandVisible, setNewStageCandVisible] = useState(true);
  const [newStageCandLabel, setNewStageCandLabel] = useState('');
  const [stageOpLoading, setStageOpLoading] = useState(false);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      const [stagesRes, appsRes, jobsRes] = await Promise.all([
        fetchRecruitmentStages(),
        fetchCareerApplications(),
        fetchCareersJobs({ all: true })
      ]);
      setStages(stagesRes);
      setApplications(appsRes);
      setJobs(jobsRes);
    } catch (err) {
      console.error('Error loading ATS pipeline data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const matchSearch =
      searchTerm === '' ||
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.current_role && app.current_role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.application_id && app.application_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchJob = selectedJobId === 'all' || app.job_id === selectedJobId;
    const matchPriority = selectedPriority === 'all' || (app.priority || 'normal') === selectedPriority;

    return matchSearch && matchJob && matchPriority;
  });

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageSlug: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageSlug !== stageSlug) {
      setDragOverStageSlug(stageSlug);
    }
  };

  const handleDragLeave = () => {
    setDragOverStageSlug(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageSlug: string) => {
    e.preventDefault();
    setDragOverStageSlug(null);
    const appId = draggedAppId || e.dataTransfer.getData('text/plain');
    if (!appId) return;

    const targetApp = applications.find(a => a.application_id === appId || String(a.id) === appId);
    if (!targetApp || targetApp.stage_slug === targetStageSlug) return;

    // Optimistic UI update
    setApplications(prev =>
      prev.map(a =>
        a.application_id === appId || String(a.id) === appId
          ? { ...a, stage_slug: targetStageSlug, status: targetStageSlug as any }
          : a
      )
    );

    // Call backend API
    try {
      await updateApplicationStage(appId, {
        stage_slug: targetStageSlug,
        reason: `Moved in Kanban board to ${targetStageSlug} stage`,
        changed_by: 'Pipeline Recruiter'
      });
    } catch (err) {
      console.error('Failed to update stage via drag and drop:', err);
      // Revert on error
      loadPipelineData();
    } finally {
      setDraggedAppId(null);
    }
  };

  // Create new custom stage
  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    setStageOpLoading(true);
    try {
      const generatedSlug = newStageSlug.trim() || newStageName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const res = await createRecruitmentStage({
        name: newStageName.trim(),
        slug: generatedSlug,
        color_code: newStageColor,
        candidate_visible: newStageCandVisible ? 1 : 0,
        candidate_label: newStageCandLabel.trim() || newStageName.trim()
      });

      if (res.success && res.data) {
        setStages(prev => [...prev, res.data]);
        setNewStageName('');
        setNewStageSlug('');
        setNewStageCandLabel('');
      }
    } catch (err) {
      console.error('Error creating stage:', err);
    } finally {
      setStageOpLoading(false);
    }
  };

  // Update existing stage
  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;
    setStageOpLoading(true);
    try {
      await updateRecruitmentStage(editingStage.id, {
        name: editingStage.name,
        color_code: editingStage.color_code,
        candidate_visible: editingStage.candidate_visible ? 1 : 0,
        candidate_label: editingStage.candidate_label
      });
      setStages(prev => prev.map(s => s.id === editingStage.id ? editingStage : s));
      setEditingStage(null);
    } catch (err) {
      console.error('Error updating stage:', err);
    } finally {
      setStageOpLoading(false);
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    if (!window.confirm('Are you sure you want to delete this recruitment stage?')) return;
    try {
      await deleteRecruitmentStage(stageId);
      setStages(prev => prev.filter(s => s.id !== stageId));
    } catch (err) {
      console.error('Error deleting stage:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ATS Top Navigation Header */}
        <AtsNavHeader
          title="Recruitment Pipeline"
          subtitle="Visual stage-by-stage Kanban tracking, drag-and-drop progression, and automated communication."
          badge="Interactive ATS"
          actionButton={
            <div className="flex items-center gap-2">
              <button
                onClick={loadPipelineData}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh pipeline data"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowStageSettings(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Settings size={14} className="text-cyan-400" /> Pipeline Stages
              </button>
            </div>
          }
        />

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate name, email, role, or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-slate-400">Role:</span>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium cursor-pointer"
            >
              <option value="all">All Positions ({jobs.length})</option>
              {jobs.map(j => (
                <option key={j.job_id} value={j.job_id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Priority:</span>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="text-slate-400 pl-2 border-l border-slate-800">
            Showing <strong className="text-white">{filteredApps.length}</strong> active applicants
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-[1400px]">
          {stages.map(stage => {
            const columnApps = filteredApps.filter(
              a => (a.stage_slug || 'applied').toLowerCase() === stage.slug.toLowerCase()
            );
            const isDragOver = dragOverStageSlug === stage.slug;

            return (
              <div
                key={stage.id}
                onDragOver={e => handleDragOver(e, stage.slug)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, stage.slug)}
                className={`w-72 flex-shrink-0 bg-slate-950/60 border rounded-2xl flex flex-col max-h-[78vh] transition-all ${
                  isDragOver
                    ? 'border-cyan-400 shadow-lg shadow-cyan-500/10 bg-slate-900/80 scale-[1.01]'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      style={{ backgroundColor: stage.color_code }}
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    />
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {stage.name}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {columnApps.length}
                    </span>
                  </div>

                  {Boolean(stage.candidate_visible) && (
                    <span title="Candidate Visible on Status Roadmap" className="text-cyan-400">
                      <Eye size={13} />
                    </span>
                  )}
                </div>

                {/* Column Candidate Cards List */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[150px]">
                  {columnApps.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] text-slate-500 italic">
                      Drag candidates here
                    </div>
                  ) : (
                    columnApps.map(app => {
                      const isDragged = draggedAppId === app.application_id || draggedAppId === String(app.id);

                      return (
                        <div
                          key={app.id || app.application_id}
                          draggable
                          onDragStart={e => handleDragStart(e, app.application_id)}
                          onClick={() => setWorkspaceAppId(app.application_id)}
                          className={`bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all ${
                            isDragged ? 'opacity-40 scale-95 border-cyan-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {app.candidate_name}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                {app.current_role || app.job_title || 'Applicant'}
                              </p>
                            </div>
                            {app.priority && (
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                app.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                app.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {app.priority}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-mono text-cyan-400/90">{app.application_id.split('-').pop()}</span>
                            <span>&bull;</span>
                            <span>{app.experience || 'Exp N/A'}</span>
                            <span>&bull;</span>
                            <span>{app.availability || 'Immediate'}</span>
                          </div>

                          {Array.isArray(app.skills) && app.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {app.skills.slice(0, 3).map((sk, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {sk}
                                </span>
                              ))}
                              {app.skills.length > 3 && (
                                <span className="text-[9px] text-slate-500 self-center">
                                  +{app.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                            <span>{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}</span>
                            <span className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5">
                              Workspace <ChevronRight size={11} />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Workspace Modal */}
      {workspaceAppId && (
        <CandidateWorkspaceModal
          applicationId={workspaceAppId}
          isOpen={Boolean(workspaceAppId)}
          onClose={() => setWorkspaceAppId(null)}
          onApplicationUpdated={loadPipelineData}
        />
      )}

      {/* Stage Settings & Customization Modal */}
      {showStageSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-cyan-400" /> Pipeline Stage Configuration
              </h3>
              <button onClick={() => setShowStageSettings(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            {/* List of current stages */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Active Stages</h4>
              {stages.map(st => (
                <div key={st.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span style={{ backgroundColor: st.color_code }} className="w-3 h-3 rounded-full shrink-0" />
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {st.name}
                        {st.is_system ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">Core System</span>
                        ) : null}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Slug: <span className="font-mono text-cyan-400">{st.slug}</span> &bull; Candidate Label: {st.candidate_label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      {st.candidate_visible ? <Eye size={12} className="text-cyan-400" /> : <EyeOff size={12} className="text-slate-600" />}
                      {st.candidate_visible ? 'Public' : 'Internal'}
                    </span>
                    {!st.is_system && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStage(st.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Custom Stage Form */}
            <form onSubmit={handleCreateStage} className="bg-slate-950 p-4 rounded-xl border border-cyan-500/20 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase">Add New Custom Stage</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Stage Name</label>
                  <input
                    type="text"
                    value={newStageName}
                    onChange={e => setNewStageName(e.target.value)}
                    placeholder="e.g. Background Check"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Slug (Identifier)</label>
                  <input
                    type="text"
                    value={newStageSlug}
                    onChange={e => setNewStageSlug(e.target.value)}
                    placeholder="e.g. background-check"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Color Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newStageColor}
                      onChange={e => setNewStageColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-300">{newStageColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Public Roadmap Label</label>
                  <input
                    type="text"
                    value={newStageCandLabel}
                    onChange={e => setNewStageCandLabel(e.target.value)}
                    placeholder="e.g. Reference & Background Check"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStageCandVisible}
                    onChange={e => setNewStageCandVisible(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                  />
                  <span>Show stage on candidate public status roadmap</span>
                </label>

                <button
                  type="submit"
                  disabled={stageOpLoading || !newStageName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  {stageOpLoading ? 'Saving...' : 'Create Stage'}
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowStageSettings(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
