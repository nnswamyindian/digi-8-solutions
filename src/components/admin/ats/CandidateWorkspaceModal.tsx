import React, { useState, useEffect } from 'react';
import {
  X, Mail, Phone, MapPin, Briefcase, Calendar, CheckCircle2,
  Clock, AlertCircle, MessageSquare, Tag, FileText, Send, User,
  Star, ExternalLink, Download, Plus, Trash2, CheckSquare, Sparkles, ChevronRight
} from 'lucide-react';
import {
  type JobApplication,
  type RecruitmentStage,
  type CandidateNote,
  type CandidateTag,
  type RecruiterTask,
  type InterviewItem,
  type InterviewFeedback,
  type EmailTemplate,
  type EmailLog,
  type StageHistory,
  fetchRecruitmentStages,
  updateApplicationStage,
  fetchApplicationTimeline,
  fetchCandidateNotes,
  createCandidateNote,
  deleteCandidateNote,
  fetchCandidateTags,
  createCandidateTag,
  deleteCandidateTag,
  fetchRecruiterTasks,
  createRecruiterTask,
  updateRecruiterTask,
  deleteRecruiterTask,
  fetchInterviews,
  scheduleInterview,
  fetchInterviewFeedback,
  submitInterviewFeedback,
  fetchEmailTemplates,
  sendRecruiterEmailApi,
  fetchEmailLogs,
  getResumeDocumentUrl,
  fetchCareerApplicationById
} from '../../../lib/api';

interface CandidateWorkspaceModalProps {
  applicationId: string;
  candidateEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onApplicationUpdated?: () => void;
}

export default function CandidateWorkspaceModal({
  applicationId,
  candidateEmail: propEmail,
  isOpen,
  onClose,
  onApplicationUpdated
}: CandidateWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes' | 'interviews' | 'emails' | 'tasks'>('overview');
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<JobApplication | null>(null);
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [tags, setTags] = useState<CandidateTag[]>([]);
  const [tasks, setTasks] = useState<RecruiterTask[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);

  // Stage transition form state
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [stageReason, setStageReason] = useState<string>('');
  const [isChangingStage, setIsChangingStage] = useState(false);

  // New Note state
  const [newNoteText, setNewNoteText] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // New Tag state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#06b6d4');

  // New Task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Email composer state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');

  // Interview Schedule Modal inside workspace
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [interviewType, setInterviewType] = useState('Technical Round');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerName, setInterviewerName] = useState('Senior Tech Lead');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Interview Scorecard Modal
  const [activeInterviewForScorecard, setActiveInterviewForScorecard] = useState<InterviewItem | null>(null);
  const [scoreTechnical, setScoreTechnical] = useState(4);
  const [scoreCommunication, setScoreCommunication] = useState(4);
  const [scoreProblemSolving, setScoreProblemSolving] = useState(4);
  const [scoreCulture, setScoreCulture] = useState(4);
  const [scoreRecommendation, setScoreRecommendation] = useState<'strong_hire' | 'hire' | 'neutral' | 'no_hire'>('hire');
  const [scoreFeedbackNotes, setScoreFeedbackNotes] = useState('');
  const [submittingScorecard, setSubmittingScorecard] = useState(false);
  const [scorecards, setScorecards] = useState<InterviewFeedback[]>([]);

  const candidateEmail = app?.email || propEmail || '';

  useEffect(() => {
    if (!isOpen || !applicationId) return;
    loadWorkspaceData();
  }, [isOpen, applicationId]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      // Fetch application details & stages
      const [stagesData, timelineData, templatesData] = await Promise.all([
        fetchRecruitmentStages(),
        fetchApplicationTimeline(applicationId),
        fetchEmailTemplates()
      ]);

      setStages(stagesData);
      setTimeline(timelineData);
      setEmailTemplates(templatesData);

      // Fetch application by ID from applications endpoint
      const appData = await fetchCareerApplicationById(applicationId);
      if (appData) {
        setApp(appData);
        setSelectedStage(appData.stage_slug || 'applied');
      }

      // Fetch notes, tags, tasks, interviews, emails
      const targetEmail = appData?.email || propEmail;
      const [notesData, tagsData, tasksData, interviewsData, emailsData] = await Promise.all([
        fetchCandidateNotes({ application_id: applicationId, candidate_email: targetEmail }),
        fetchCandidateTags({ application_id: applicationId, candidate_email: targetEmail }),
        fetchRecruiterTasks({ application_id: applicationId }),
        fetchInterviews({ application_id: applicationId }),
        fetchEmailLogs({ application_id: applicationId, candidate_email: targetEmail })
      ]);

      setNotes(notesData);
      setTags(tagsData);
      setTasks(tasksData);
      setInterviews(interviewsData);
      setEmailLogs(emailsData);
    } catch (err) {
      console.error('Error loading candidate workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async () => {
    if (!selectedStage || selectedStage === app?.stage_slug) return;
    setIsChangingStage(true);
    try {
      const res = await updateApplicationStage(applicationId, {
        stage_slug: selectedStage,
        reason: stageReason || `Moved to ${selectedStage} stage in candidate workspace`,
        changed_by: 'Recruiter'
      });

      if (res.success) {
        setApp(prev => prev ? { ...prev, stage_slug: selectedStage } : null);
        setStageReason('');
        // Refresh timeline
        const updatedTimeline = await fetchApplicationTimeline(applicationId);
        setTimeline(updatedTimeline);
        onApplicationUpdated?.();
      }
    } catch (err) {
      console.error('Failed to change stage:', err);
    } finally {
      setIsChangingStage(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await createCandidateNote({
        application_id: applicationId,
        candidate_email: candidateEmail,
        author_name: 'Lead Recruiter',
        author_role: 'Talent Acquisition',
        note_text: newNoteText.trim(),
        is_private: isPrivateNote
      });

      if (res.success && res.data) {
        setNotes(prev => [res.data, ...prev]);
        setNewNoteText('');
        setIsPrivateNote(false);
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteCandidateNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const res = await createCandidateTag({
        application_id: applicationId,
        candidate_email: candidateEmail,
        tag_name: newTagName.trim(),
        color_code: newTagColor
      });

      if (res.success && res.data) {
        setTags(prev => [...prev, res.data]);
        setNewTagName('');
      }
    } catch (err) {
      console.error('Error adding tag:', err);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      await deleteCandidateTag(tagId);
      setTags(prev => prev.filter(t => t.id !== tagId));
    } catch (err) {
      console.error('Error removing tag:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setSubmittingTask(true);
    try {
      const res = await createRecruiterTask({
        application_id: applicationId,
        title: newTaskTitle.trim(),
        due_date: newTaskDate || undefined,
        assigned_to: 'Talent Team'
      });

      if (res.success && res.data) {
        setTasks(prev => [res.data, ...prev]);
        setNewTaskTitle('');
        setNewTaskDate('');
      }
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: RecruiterTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateRecruiterTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId);
    const tpl = emailTemplates.find(t => t.id === templateId);
    if (tpl && app) {
      const compiledSubject = tpl.subject
        .replace(/\{\{candidate_name\}\}/g, app.candidate_name)
        .replace(/\{\{job_title\}\}/g, app.job_title || 'Open Role')
        .replace(/\{\{application_id\}\}/g, app.application_id);

      const compiledBody = tpl.body
        .replace(/\{\{candidate_name\}\}/g, app.candidate_name)
        .replace(/\{\{job_title\}\}/g, app.job_title || 'Open Role')
        .replace(/\{\{application_id\}\}/g, app.application_id)
        .replace(/\{\{recruiter_name\}\}/g, app.recruiter_name || 'DIGI8 Talent Team')
        .replace(/\{\{company_name\}\}/g, 'DIGI8 Solutions');

      setEmailSubject(compiledSubject);
      setEmailBody(compiledBody);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim() || !candidateEmail) return;
    setSendingEmail(true);
    setEmailSuccessMsg('');
    try {
      const res = await sendRecruiterEmailApi({
        application_id: applicationId,
        to: candidateEmail,
        subject: emailSubject,
        body: emailBody,
        template_id: typeof selectedTemplateId === 'number' ? selectedTemplateId : undefined,
        sent_by: 'Talent Acquisition'
      });

      if (res.success) {
        setEmailSuccessMsg('Email dispatched successfully to candidate!');
        setEmailLogs(prev => [res.data, ...prev]);
        setEmailSubject('');
        setEmailBody('');
        setSelectedTemplateId('');
        setTimeout(() => setEmailSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error sending email:', err);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime || !app) return;
    try {
      const scheduledDateTime = new Date(`${interviewDate}T${interviewTime}`).toISOString();
      const res = await scheduleInterview({
        application_id: applicationId,
        candidate_name: app.candidate_name,
        candidate_email: app.email,
        interview_type: interviewType,
        scheduled_at: scheduledDateTime,
        duration_minutes: 45,
        interviewer_name: interviewerName,
        meeting_link: meetingLink,
        notes: interviewNotes
      });

      if (res.success && res.data) {
        setInterviews(prev => [res.data, ...prev]);
        setShowScheduleForm(false);
        setInterviewDate('');
        setInterviewTime('');
        setMeetingLink('');
        setInterviewNotes('');
        // Refresh timeline
        const updatedTimeline = await fetchApplicationTimeline(applicationId);
        setTimeline(updatedTimeline);
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
    }
  };

  const handleOpenScorecard = async (interview: InterviewItem) => {
    setActiveInterviewForScorecard(interview);
    const feedbackList = await fetchInterviewFeedback(interview.id);
    setScorecards(feedbackList);
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterviewForScorecard) return;
    setSubmittingScorecard(true);
    try {
      const res = await submitInterviewFeedback(activeInterviewForScorecard.id, {
        application_id: applicationId,
        interviewer_name: activeInterviewForScorecard.interviewer_name,
        technical_rating: scoreTechnical,
        communication_rating: scoreCommunication,
        problem_solving_rating: scoreProblemSolving,
        culture_fit_rating: scoreCulture,
        recommendation: scoreRecommendation,
        feedback_notes: scoreFeedbackNotes
      });

      if (res.success && res.data) {
        setScorecards(prev => [res.data, ...prev]);
        setScoreFeedbackNotes('');
        setActiveInterviewForScorecard(null);
        // Refresh interviews
        const refreshed = await fetchInterviews({ application_id: applicationId });
        setInterviews(refreshed);
      }
    } catch (err) {
      console.error('Error submitting scorecard:', err);
    } finally {
      setSubmittingScorecard(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-8 bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {app?.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">{app?.candidate_name || 'Candidate Details'}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                  {app?.application_id}
                </span>
                {app?.priority && (
                  <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    app.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    app.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {app.priority}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{app?.job_title || 'Application'}</span>
                <span>&bull;</span>
                <span>Applied {app?.created_at ? new Date(app.created_at).toLocaleDateString() : 'recently'}</span>
                <span>&bull;</span>
                <span className="text-slate-300">{app?.location || 'Remote'}</span>
              </p>
            </div>
          </div>

          {/* Quick Stage Promotion Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-xs text-slate-400 font-medium">Pipeline Stage:</span>
              <select
                value={selectedStage}
                onChange={e => setSelectedStage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-cyan-400 outline-none cursor-pointer"
              >
                {stages.map(st => (
                  <option key={st.id} value={st.slug} className="bg-slate-900 text-white">
                    {st.name}
                  </option>
                ))}
              </select>
              {selectedStage !== app?.stage_slug && (
                <button
                  type="button"
                  disabled={isChangingStage}
                  onClick={handleStageChange}
                  className="ml-2 px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-sm"
                >
                  {isChangingStage ? 'Updating...' : 'Apply Stage'}
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tags Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Tag size={13} className="text-cyan-400" /> Tags:
          </span>
          {tags.map(t => (
            <span
              key={t.id}
              style={{ backgroundColor: `${t.color_code}15`, borderColor: `${t.color_code}40`, color: t.color_code }}
              className="px-2.5 py-0.5 rounded-md border font-medium flex items-center gap-1.5"
            >
              <span>{t.tag_name}</span>
              <button
                type="button"
                onClick={() => handleDeleteTag(t.id)}
                className="hover:opacity-75 transition-opacity"
              >
                &times;
              </button>
            </span>
          ))}

          <form onSubmit={handleAddTag} className="flex items-center gap-1 ml-2">
            <input
              type="text"
              placeholder="+ Add tag..."
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/60 rounded px-2 py-0.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-24"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={e => setNewTagColor(e.target.value)}
              className="w-5 h-5 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              title="Tag color"
            />
          </form>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview & Profile', icon: User },
            { id: 'timeline', label: `Timeline & Audit (${timeline.length})`, icon: Clock },
            { id: 'notes', label: `Internal Notes (${notes.length})`, icon: MessageSquare },
            { id: 'interviews', label: `Interviews & Scorecards (${interviews.length})`, icon: Calendar },
            { id: 'emails', label: `Email Automation (${emailLogs.length})`, icon: Mail },
            { id: 'tasks', label: `Recruiter Tasks (${tasks.length})`, icon: CheckSquare },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-cyan-400 text-cyan-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Clock className="animate-spin mr-2" size={20} /> Loading candidate profile...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & PROFILE */}
              {activeTab === 'overview' && app && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Candidate Contact & Core Specs */}
                  <div className="space-y-6">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <User size={15} /> Contact & Details
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Mail size={14} className="text-slate-500" />
                          <a href={`mailto:${app.email}`} className="text-cyan-400 hover:underline">{app.email}</a>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Phone size={14} className="text-slate-500" />
                          <span>{app.phone}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <MapPin size={14} className="text-slate-500" />
                          <span>{app.location || 'Location Not Specified'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Briefcase size={14} className="text-slate-500" />
                          <span>Experience: <strong>{app.experience || 'Not specified'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Clock size={14} className="text-slate-500" />
                          <span>Availability: <strong>{app.availability || 'Immediate'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <span className="text-slate-500 font-mono">₹</span>
                          <span>Expected: <strong>{app.expected_compensation || 'Negotiable'}</strong></span>
                        </div>
                      </div>

                      {/* External Social Profiles */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
                        {app.linkedin && (
                          <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 flex items-center gap-1.5 transition-colors">
                            <ExternalLink size={12} /> LinkedIn
                          </a>
                        )}
                        {app.portfolio && (
                          <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded bg-slate-800 text-purple-400 hover:bg-slate-700 flex items-center gap-1.5 transition-colors">
                            <ExternalLink size={12} /> Portfolio
                          </a>
                        )}
                        {app.github && (
                          <a href={app.github} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 transition-colors">
                            <ExternalLink size={12} /> GitHub
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Resume / Document Action Card */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <FileText size={15} /> Attached Documents
                      </h3>
                      {app.resume_file ? (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={20} className="text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">{app.resume_original_name || 'Candidate_Resume.pdf'}</p>
                              <p className="text-[10px] text-slate-400">PDF / DOCX Resume</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={getResumeDocumentUrl(app.resume_file, false)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                              title="Preview Document"
                            >
                              <ExternalLink size={15} />
                            </a>
                            <a
                              href={getResumeDocumentUrl(app.resume_file, true)}
                              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                              title="Download Document"
                            >
                              <Download size={15} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No resume file uploaded for this application.</p>
                      )}
                    </div>
                  </div>

                  {/* Right 2 Columns: Skills, Cover Letter, Answers */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Skills Breakdown */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Sparkles size={15} /> Candidate Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(app.skills) && app.skills.length > 0 ? (
                          app.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No specific skills listed.</span>
                        )}
                      </div>
                    </div>

                    {/* Cover Message / Note from Candidate */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-2">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
                        Candidate Cover Message
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-lg border border-slate-800/80">
                        {app.cover_message || 'No custom cover message provided by the applicant.'}
                      </p>
                    </div>

                    {/* Screening Answers */}
                    {app.custom_answers && app.custom_answers.length > 0 && (
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
                          Custom Screening Questions
                        </h3>
                        <div className="space-y-3">
                          {app.custom_answers.map((ans, idx) => (
                            <div key={idx} className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                              <p className="text-xs text-slate-400 font-medium">{ans.question}</p>
                              <p className="text-xs text-white font-semibold mt-1">
                                {typeof ans.answer === 'object' ? JSON.stringify(ans.answer) : String(ans.answer || 'N/A')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CHRONOLOGICAL TIMELINE & AUDIT */}
              {activeTab === 'timeline' && (
                <div className="max-w-3xl mx-auto space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
                    Application History & Pipeline Audit Trail
                  </h3>
                  {timeline.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No timeline events recorded yet.</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 my-4">
                      {timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                            item.event_type === 'stage_change' ? 'bg-cyan-500 border-slate-950' :
                            item.event_type === 'interview_scheduled' ? 'bg-purple-500 border-slate-950' :
                            item.event_type === 'email_sent' ? 'bg-blue-500 border-slate-950' :
                            'bg-amber-500 border-slate-950'
                          }`} />
                          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-white capitalize flex items-center gap-1.5">
                                {item.event_type.replace('_', ' ')}
                                {item.to_stage && (
                                  <span className="text-cyan-400 font-mono">({item.from_stage || 'init'} &rarr; {item.to_stage})</span>
                                )}
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{item.details}</p>
                            {item.changed_by && (
                              <p className="text-[10px] text-slate-500">By: {item.changed_by}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INTERNAL NOTES */}
              {activeTab === 'notes' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <MessageSquare size={14} /> Add Recruiter Note (Internal Only)
                    </h3>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      placeholder="Add an internal evaluation note, interview observations, or salary alignment..."
                      className="w-full bg-slate-900 border border-slate-700/70 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrivateNote}
                          onChange={e => setIsPrivateNote(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                        <span>Confidential / Private to Hiring Leads</span>
                      </label>
                      <button
                        type="submit"
                        disabled={submittingNote || !newNoteText.trim()}
                        className="btn-glow px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50"
                      >
                        {submittingNote ? 'Saving...' : 'Post Note'}
                      </button>
                    </div>
                  </form>

                  {/* Notes Feed */}
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">No internal notes added yet.</p>
                    ) : (
                      notes.map(note => (
                        <div key={note.id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{note.author_name}</span>
                              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                {note.author_role}
                              </span>
                              {Boolean(note.is_private) && (
                                <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                                  Confidential
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                              <span>{new Date(note.created_at).toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{note.note_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: INTERVIEWS & SCORECARDS */}
              {activeTab === 'interviews' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
                        Interview Schedule & Evaluations
                      </h3>
                      <p className="text-xs text-slate-400">Manage rounds and submit standardized scorecard reviews.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowScheduleForm(!showScheduleForm)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Plus size={14} /> Schedule Interview
                    </button>
                  </div>

                  {/* Schedule Interview Form Panel */}
                  {showScheduleForm && (
                    <form onSubmit={handleScheduleInterviewSubmit} className="bg-slate-950 border border-cyan-500/30 rounded-xl p-5 space-y-4 shadow-xl">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Schedule New Interview Round</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Interview Round</label>
                          <select
                            value={interviewType}
                            onChange={e => setInterviewType(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                          >
                            <option>Initial HR Screening</option>
                            <option>Technical Round 1 (Coding & Architecture)</option>
                            <option>Technical Round 2 (System Design)</option>
                            <option>Leadership & Cultural Fit</option>
                            <option>Executive Final Offer Discussion</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Interviewer Name</label>
                          <input
                            type="text"
                            value={interviewerName}
                            onChange={e => setInterviewerName(e.target.value)}
                            placeholder="e.g. Elena Rostova / Lead Tech"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Date</label>
                          <input
                            type="date"
                            value={interviewDate}
                            onChange={e => setInterviewDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Time</label>
                          <input
                            type="time"
                            value={interviewTime}
                            onChange={e => setInterviewTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-slate-400 block mb-1">Meeting Link (Google Meet / Zoom / Teams)</label>
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={e => setMeetingLink(e.target.value)}
                            placeholder="https://meet.google.com/..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-slate-400 block mb-1">Round Objectives & Topics</label>
                          <textarea
                            rows={2}
                            value={interviewNotes}
                            onChange={e => setInterviewNotes(e.target.value)}
                            placeholder="Focus on component architecture, state machines, and system performance..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowScheduleForm(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        >
                          Confirm Schedule & Notify
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Scheduled Interviews List */}
                  <div className="space-y-4">
                    {interviews.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">No interviews scheduled yet.</p>
                    ) : (
                      interviews.map(iv => (
                        <div key={iv.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{iv.interview_type}</h4>
                                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                  iv.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  iv.status === 'scheduled' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {iv.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                <span>Interviewer: <strong className="text-slate-200">{iv.interviewer_name}</strong></span>
                                <span>&bull;</span>
                                <span>{new Date(iv.scheduled_at).toLocaleString()} ({iv.duration_minutes} min)</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {iv.meeting_link && (
                                <a
                                  href={iv.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 text-xs flex items-center gap-1 font-medium"
                                >
                                  <ExternalLink size={12} /> Join Call
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenScorecard(iv)}
                                className="px-3 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1"
                              >
                                <Star size={12} /> Evaluate Scorecard
                              </button>
                            </div>
                          </div>

                          {iv.notes && (
                            <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                              {iv.notes}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Modal for Submitting Interview Scorecard */}
                  {activeInterviewForScorecard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <Star size={16} className="text-purple-400" /> Interview Scorecard Evaluation
                            </h3>
                            <p className="text-xs text-slate-400">{activeInterviewForScorecard.interview_type} &bull; {activeInterviewForScorecard.candidate_name}</p>
                          </div>
                          <button onClick={() => setActiveInterviewForScorecard(null)} className="text-slate-400 hover:text-white">
                            <X size={18} />
                          </button>
                        </div>

                        {/* Existing Scorecards */}
                        {scorecards.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase">Existing Submissions:</h4>
                            {scorecards.map(sc => (
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
                              <label className="text-slate-400 block mb-1">Technical Competence (1-5)</label>
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
                              <label className="text-slate-400 block mb-1">Communication Skills (1-5)</label>
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
                              <label className="text-slate-400 block mb-1">Culture & Values Fit (1-5)</label>
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
                            <label className="text-slate-400 block mb-1">Overall Hiring Recommendation</label>
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
                            <label className="text-slate-400 block mb-1">Evaluation Commentary & Rationale</label>
                            <textarea
                              rows={3}
                              value={scoreFeedbackNotes}
                              onChange={e => setScoreFeedbackNotes(e.target.value)}
                              placeholder="Describe strengths, code quality observations, areas of improvement..."
                              className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white"
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
                              {submittingScorecard ? 'Submitting...' : 'Submit Evaluation'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: EMAIL COMMUNICATIONS */}
              {activeTab === 'emails' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Direct Composer */}
                  <form onSubmit={handleSendEmail} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Mail size={15} /> Compose Email to Candidate
                      </h3>
                      {emailSuccessMsg && (
                        <span className="text-xs text-green-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 size={13} /> {emailSuccessMsg}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">Load Template:</span>
                      <select
                        value={selectedTemplateId}
                        onChange={e => handleTemplateSelect(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      >
                        <option value="">-- Choose Email Template --</option>
                        {emailTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">To</label>
                        <input
                          type="email"
                          value={candidateEmail}
                          disabled
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Subject</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          placeholder="Email Subject..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Email Body</label>
                        <textarea
                          rows={6}
                          value={emailBody}
                          onChange={e => setEmailBody(e.target.value)}
                          placeholder="Write your email to the candidate..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-sans text-xs leading-relaxed"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                        className="btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send size={13} /> {sendingEmail ? 'Dispatching...' : 'Send Recruiter Email'}
                      </button>
                    </div>
                  </form>

                  {/* Email Logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatched Email History</h4>
                    {emailLogs.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4">No emails sent to this candidate yet.</p>
                    ) : (
                      emailLogs.map(log => (
                        <div key={log.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{log.subject}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                log.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {log.status}
                              </span>
                              <span className="text-slate-500 text-[11px]">{new Date(log.sent_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2">{log.body}</p>
                          <p className="text-[10px] text-slate-500">Sent by: {log.sent_by}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: RECRUITER TASKS */}
              {activeTab === 'tasks' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Add Task Form */}
                  <form onSubmit={handleAddTask} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Add an actionable recruiter task..."
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      required
                    />
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={e => setNewTaskDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={submittingTask || !newTaskTitle.trim()}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                    >
                      Add Task
                    </button>
                  </form>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">No tasks linked to this application.</p>
                    ) : (
                      tasks.map(task => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              isDone ? 'bg-slate-950/30 border-slate-900 text-slate-500' : 'bg-slate-950/70 border-slate-800 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleTaskStatus(task)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
                              />
                              <div>
                                <p className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                  {task.title}
                                </p>
                                {task.due_date && (
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Clock size={11} /> Due: {new Date(task.due_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteRecruiterTask(task.id);
                                setTasks(prev => prev.filter(t => t.id !== task.id));
                              }}
                              className="text-slate-600 hover:text-red-400 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>DIGI8 Solutions &bull; Applicant Tracking & Candidate CRM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Close Workspace
          </button>
        </div>

      </div>
    </div>
  );
}
