import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Clock, ExternalLink, Star,
  CheckCircle2, AlertCircle, RefreshCw, X, Trash2, User
} from 'lucide-react';
import {
  type InterviewItem,
  type InterviewFeedback,
  type JobApplication,
  fetchInterviews,
  scheduleInterview,
  updateInterview,
  deleteInterview,
  fetchInterviewFeedback,
  submitInterviewFeedback,
  fetchCareerApplications
} from '../../lib/api';
import CandidateWorkspaceModal from '../../components/admin/ats/CandidateWorkspaceModal';
import AtsNavHeader from '../../components/admin/ats/AtsNavHeader';
import AdminLayout from './AdminLayout';

export default function AdminInterviews() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'completed'>('all');

  // Schedule Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Round 1');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewerName, setInterviewerName] = useState('Tech Lead');
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Scorecard modal state
  const [activeInterviewForScorecard, setActiveInterviewForScorecard] = useState<InterviewItem | null>(null);
  const [scoreTechnical, setScoreTechnical] = useState(4);
  const [scoreCommunication, setScoreCommunication] = useState(4);
  const [scoreProblemSolving, setScoreProblemSolving] = useState(4);
  const [scoreCulture, setScoreCulture] = useState(4);
  const [scoreRecommendation, setScoreRecommendation] = useState<'strong_hire' | 'hire' | 'neutral' | 'no_hire'>('hire');
  const [scoreFeedbackNotes, setScoreFeedbackNotes] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<InterviewFeedback[]>([]);
  const [submittingScorecard, setSubmittingScorecard] = useState(false);

  // Workspace modal
  const [workspaceAppId, setWorkspaceAppId] = useState<string | null>(null);

  useEffect(() => {
    loadInterviewData();
  }, []);

  const loadInterviewData = async () => {
    setLoading(true);
    try {
      const [interviewsRes, appsRes] = await Promise.all([
        fetchInterviews(),
        fetchCareerApplications()
      ]);
      setInterviews(interviewsRes);
      setApplications(appsRes);
    } catch (err) {
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(i => {
    if (activeTab === 'all') return true;
    return i.status === activeTab;
  });

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !interviewDate || !interviewTime) return;
    setScheduling(true);

    const app = applications.find(a => a.application_id === selectedAppId);
    if (!app) return;

    try {
      const scheduledDateTime = new Date(`${interviewDate}T${interviewTime}`).toISOString();
      const res = await scheduleInterview({
        application_id: app.application_id,
        candidate_name: app.candidate_name,
        candidate_email: app.email,
        interview_type: interviewType,
        scheduled_at: scheduledDateTime,
        duration_minutes: durationMinutes,
        interviewer_name: interviewerName,
        interviewer_email: interviewerEmail,
        meeting_link: meetingLink,
        notes
      });

      if (res.success && res.data) {
        setInterviews(prev => [res.data, ...prev]);
        setShowScheduleModal(false);
        setSelectedAppId('');
        setInterviewDate('');
        setInterviewTime('');
        setMeetingLink('');
        setNotes('');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenScorecard = async (interview: InterviewItem) => {
    setActiveInterviewForScorecard(interview);
    const feedbackList = await fetchInterviewFeedback(interview.id);
    setExistingFeedback(feedbackList);
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterviewForScorecard) return;
    setSubmittingScorecard(true);
    try {
      const res = await submitInterviewFeedback(activeInterviewForScorecard.id, {
        application_id: activeInterviewForScorecard.application_id,
        interviewer_name: interviewerName || activeInterviewForScorecard.interviewer_name,
        technical_rating: scoreTechnical,
        communication_rating: scoreCommunication,
        problem_solving_rating: scoreProblemSolving,
        culture_fit_rating: scoreCulture,
        recommendation: scoreRecommendation,
        feedback_notes: scoreFeedbackNotes
      });

      if (res.success && res.data) {
        setExistingFeedback(prev => [res.data, ...prev]);
        setScoreFeedbackNotes('');
        setActiveInterviewForScorecard(null);
        loadInterviewData();
      }
    } catch (err) {
      console.error('Error submitting scorecard:', err);
    } finally {
      setSubmittingScorecard(false);
    }
  };

  const handleCancelInterview = async (id: number) => {
    if (!window.confirm('Cancel this scheduled interview?')) return;
    try {
      await updateInterview(id, { status: 'cancelled' });
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: 'cancelled' } : i));
    } catch (err) {
      console.error('Error cancelling interview:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ATS Top Navigation Header */}
        <AtsNavHeader
          title="Interview Scheduling & Scorecards"
          subtitle="Coordinate interview rounds, dispatch automatic invites, and conduct structured scorecard ratings."
          badge="Evaluation Center"
          actionButton={
            <div className="flex items-center gap-2">
              <button
                onClick={loadInterviewData}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh interviews"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Plus size={14} /> Schedule Interview
              </button>
            </div>
          }
        />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 border-b-2 transition-colors ${
            activeTab === 'all' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          All Interviews ({interviews.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`pb-3 px-3 border-b-2 transition-colors ${
            activeTab === 'scheduled' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Upcoming / Scheduled ({interviews.filter(i => i.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-3 border-b-2 transition-colors ${
            activeTab === 'completed' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Completed ({interviews.filter(i => i.status === 'completed').length})
        </button>
      </div>

      {/* Interview Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-500">
            <Clock className="animate-spin mx-auto mb-2" size={24} />
            Loading interviews...
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 italic bg-slate-950/40 border border-slate-800/80 rounded-2xl">
            No interviews found in this category.
          </div>
        ) : (
          filteredInterviews.map(iv => {
            const isCompleted = iv.status === 'completed';
            const isCancelled = iv.status === 'cancelled';

            return (
              <div
                key={iv.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{iv.interview_type}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        isCancelled ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {iv.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                      <User size={13} className="text-cyan-400" />
                      <button
                        onClick={() => setWorkspaceAppId(iv.application_id)}
                        className="text-white hover:text-cyan-400 font-bold underline decoration-dotted"
                      >
                        {iv.candidate_name}
                      </button>
                      <span className="text-slate-500">({iv.candidate_email})</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-cyan-400">
                      {new Date(iv.scheduled_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({iv.duration_minutes}m)
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                  <p>Interviewer: <strong className="text-slate-200">{iv.interviewer_name}</strong> {iv.interviewer_email && `(${iv.interviewer_email})`}</p>
                  {iv.notes && <p className="text-slate-300 italic">Topics: {iv.notes}</p>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    {iv.meeting_link && !isCancelled && (
                      <a
                        href={iv.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-400 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink size={13} /> Launch Video Call
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleOpenScorecard(iv)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Star size={13} /> {isCompleted ? 'View Scorecard' : 'Fill Scorecard'}
                      </button>
                    )}
                    {iv.status === 'scheduled' && (
                      <button
                        type="button"
                        onClick={() => handleCancelInterview(iv.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Cancel Interview"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar size={16} className="text-cyan-400" /> Schedule Candidate Interview
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Candidate Application</label>
                <select
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {applications.map(app => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.candidate_name} &bull; {app.job_title || 'Role'} ({app.application_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Interview Round</label>
                  <select
                    value={interviewType}
                    onChange={e => setInterviewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option>Initial HR Screening</option>
                    <option>Technical Round 1 (Coding & Architecture)</option>
                    <option>Technical Round 2 (System Design)</option>
                    <option>Leadership & Cultural Fit</option>
                    <option>Executive Final Offer Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Time</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={e => setInterviewTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={e => setInterviewerName(e.target.value)}
                    placeholder="e.g. Siddharth Rao"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Interviewer Email</label>
                  <input
                    type="email"
                    value={interviewerEmail}
                    onChange={e => setInterviewerEmail(e.target.value)}
                    placeholder="interviewer@digi8solutions.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Meeting Link (Google Meet / Zoom / MS Teams)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Round Agenda & Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Assess full-stack proficiency, state management, and real-time telemetry..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {activeInterviewForScorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star size={16} className="text-purple-400" /> Scorecard Evaluation
                </h3>
                <p className="text-xs text-slate-400">
                  {activeInterviewForScorecard.interview_type} &bull; {activeInterviewForScorecard.candidate_name}
                </p>
              </div>
              <button onClick={() => setActiveInterviewForScorecard(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {existingFeedback.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase">Existing Submissions:</h4>
                {existingFeedback.map(sc => (
                  <div key={sc.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{sc.interviewer_name}</span>
                      <span className="font-bold text-cyan-400 uppercase">{sc.recommendation}</span>
                    </div>
                    <p className="text-slate-300 italic">{sc.feedback_notes}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmitScorecard} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Technical Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={scoreTechnical}
                    onChange={e => setScoreTechnical(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Communication Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={scoreCommunication}
                    onChange={e => setScoreCommunication(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Problem Solving (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={scoreProblemSolving}
                    onChange={e => setScoreProblemSolving(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Culture Fit (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={scoreCulture}
                    onChange={e => setScoreCulture(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Recommendation</label>
                <select
                  value={scoreRecommendation}
                  onChange={e => setScoreRecommendation(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-semibold"
                >
                  <option value="strong_hire">Strong Hire (High Priority)</option>
                  <option value="hire">Hire (Recommended)</option>
                  <option value="neutral">Neutral (Need Further Review)</option>
                  <option value="no_hire">No Hire (Reject)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Feedback Commentary</label>
                <textarea
                  rows={3}
                  value={scoreFeedbackNotes}
                  onChange={e => setScoreFeedbackNotes(e.target.value)}
                  placeholder="Detailed summary of candidate evaluation..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveInterviewForScorecard(null)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingScorecard}
                  className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {submittingScorecard ? 'Submitting...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Workspace Modal */}
      {workspaceAppId && (
        <CandidateWorkspaceModal
          applicationId={workspaceAppId}
          isOpen={Boolean(workspaceAppId)}
          onClose={() => setWorkspaceAppId(null)}
          onApplicationUpdated={loadInterviewData}
        />
      )}
      </div>
    </AdminLayout>
  );
}
