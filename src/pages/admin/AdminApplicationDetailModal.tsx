import { useState } from 'react';
import {
  X, Mail, Phone, MapPin, Download, Eye,
  ExternalLink, Edit3, FileText, Save
} from 'lucide-react';
import {
  updateCareerApplication,
  getResumeDocumentUrl,
  type JobApplication
} from '../../lib/api';

interface AdminApplicationDetailModalProps {
  application: JobApplication;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function AdminApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onUpdated
}: AdminApplicationDetailModalProps) {
  const [currentApp, setCurrentApp] = useState<JobApplication>(application);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    candidate_name: application.candidate_name,
    email: application.email,
    phone: application.phone,
    location: application.location || '',
    current_role: application.current_role || '',
    experience: application.experience || '',
    skills: Array.isArray(application.skills) ? application.skills.join(', ') : '',
    linkedin: application.linkedin || '',
    portfolio: application.portfolio || '',
    github: application.github || '',
    availability: application.availability || '',
    expected_compensation: application.expected_compensation || '',
    cover_message: application.cover_message || ''
  });

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: 'new' | 'reviewed' | 'shortlisted' | 'rejected') => {
    if (!currentApp.id) return;
    setStatusUpdating(true);
    const res = await updateCareerApplication(currentApp.id, { status: newStatus });
    setStatusUpdating(false);
    if (res.success) {
      setCurrentApp(prev => ({ ...prev, status: newStatus }));
      onUpdated();
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp.id) return;
    setSaving(true);

    const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      ...editForm,
      skills: skillsArray
    };

    const res = await updateCareerApplication(currentApp.id, payload);
    setSaving(false);

    if (res.success) {
      setCurrentApp(prev => ({
        ...prev,
        ...editForm,
        skills: skillsArray
      }));
      setIsEditing(false);
      onUpdated();
    }
  };

  const statusColors: Record<string, string> = {
    new: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    reviewed: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    shortlisted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0d121f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6">

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-2.5 py-0.5 rounded">
                {currentApp.application_id}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold border ${statusColors[currentApp.status] || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                {currentApp.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">
                Applied on {new Date(currentApp.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <h2 className="font-outfit font-bold text-2xl text-white">{currentApp.candidate_name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Position Applied: <strong className="text-slate-200">{currentApp.job_title || currentApp.job_id}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline-glass px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                title="Edit Candidate Details"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Status Control Bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">Application Status:</span>
          <div className="flex items-center gap-1.5">
            {(['new', 'reviewed', 'shortlisted', 'rejected'] as const).map((st) => (
              <button
                key={st}
                disabled={statusUpdating}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  currentApp.status === st
                    ? 'bg-brand-cyan text-brand-dark shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">

          {/* EDIT FORM VIEW */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-outfit font-bold text-base text-white flex items-center gap-2">
                  <Edit3 size={16} className="text-brand-cyan" /> Edit Candidate Record
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={editForm.candidate_name}
                    onChange={e => setEditForm({ ...editForm, candidate_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current Role</label>
                  <input
                    type="text"
                    value={editForm.current_role}
                    onChange={e => setEditForm({ ...editForm, current_role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Experience</label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={editForm.linkedin}
                    onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Portfolio</label>
                  <input
                    type="url"
                    value={editForm.portfolio}
                    onChange={e => setEditForm({ ...editForm, portfolio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={editForm.github}
                    onChange={e => setEditForm({ ...editForm, github: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Availability</label>
                  <input
                    type="text"
                    value={editForm.availability}
                    onChange={e => setEditForm({ ...editForm, availability: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Expected Compensation</label>
                  <input
                    type="text"
                    value={editForm.expected_compensation}
                    onChange={e => setEditForm({ ...editForm, expected_compensation: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-glow px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* CONTACT & PROFILE INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex items-center gap-2 text-slate-200">
                      <Mail size={13} className="text-brand-cyan" />
                      <a href={`mailto:${currentApp.email}`} className="hover:underline text-brand-cyan">{currentApp.email}</a>
                    </p>
                    <p className="flex items-center gap-2 text-slate-200">
                      <Phone size={13} className="text-brand-purple" />
                      <a href={`tel:${currentApp.phone}`} className="hover:underline">{currentApp.phone}</a>
                    </p>
                    {currentApp.location && (
                      <p className="flex items-center gap-2 text-slate-300">
                        <MapPin size={13} className="text-amber-400" />
                        {currentApp.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Profile</h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-300">
                      Current Role: <strong className="text-white">{currentApp.current_role || 'Not specified'}</strong>
                    </p>
                    <p className="text-slate-300">
                      Experience: <strong className="text-white">{currentApp.experience || 'Not specified'}</strong>
                    </p>
                    <p className="text-slate-300">
                      Availability: <strong className="text-white">{currentApp.availability || 'Not specified'}</strong>
                    </p>
                    {currentApp.expected_compensation && (
                      <p className="text-slate-300">
                        Expected Compensation: <strong className="text-emerald-400">{currentApp.expected_compensation}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL LINKS */}
              {(currentApp.linkedin || currentApp.portfolio || currentApp.github) && (
                <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Portfolios & Profiles</h4>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {currentApp.linkedin && (
                      <a
                        href={currentApp.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-brand-cyan hover:underline"
                      >
                        <ExternalLink size={12} /> LinkedIn
                      </a>
                    )}
                    {currentApp.portfolio && (
                      <a
                        href={currentApp.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-brand-purple hover:underline"
                      >
                        <ExternalLink size={12} /> Portfolio Website
                      </a>
                    )}
                    {currentApp.github && (
                      <a
                        href={currentApp.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:underline"
                      >
                        <ExternalLink size={12} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* CANDIDATE SKILLS */}
              {currentApp.skills && currentApp.skills.length > 0 && (
                <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentApp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CUSTOM APPLICATION QUESTIONS & ANSWERS */}
              {currentApp.custom_answers && currentApp.custom_answers.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role-Specific Questions & Answers
                  </h4>
                  <div className="space-y-3 divide-y divide-white/5 text-xs">
                    {currentApp.custom_answers.map((qa, i) => (
                      <div key={i} className="pt-2.5 first:pt-0 space-y-1">
                        <p className="font-semibold text-slate-300">{qa.question}</p>
                        <p className="text-brand-cyan font-mono bg-white/[0.02] p-2 rounded-lg border border-white/5">
                          {String(qa.answer) || '<No answer provided>'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COVER NOTE */}
              {currentApp.cover_message && (
                <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Cover Note</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    {currentApp.cover_message}
                  </p>
                </div>
              )}

              {/* RESUME & ATTACHMENTS */}
              <div className="glass-panel p-5 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/[0.03] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
                    Resume / CV Document
                  </h4>
                  <span className="text-[10px] text-slate-400">Secure Download</span>
                </div>

                {currentApp.resume_file ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-cyan/20 text-brand-cyan flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div className="truncate max-w-xs">
                        <p className="text-xs font-semibold text-white truncate">
                          {currentApp.resume_original_name || currentApp.resume_file}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{currentApp.resume_file}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getResumeDocumentUrl(currentApp.resume_file, false)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline-glass px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </a>
                      <a
                        href={getResumeDocumentUrl(currentApp.resume_file, true)}
                        className="btn-glow px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-neon-blue"
                      >
                        <Download size={12} /> Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No resume attached for this record.</p>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
