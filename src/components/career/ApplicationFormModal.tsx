import { useState, useRef } from 'react';
import {
  X, CheckCircle, UploadCloud, FileText, AlertCircle, ArrowRight,
  ArrowLeft, Check, Sparkles, User, Briefcase, HelpCircle, FileCheck
} from 'lucide-react';
import { submitCareerApplication, type JobPosting } from '../../lib/api';

interface ApplicationFormModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationFormModal({ job, isOpen, onClose }: ApplicationFormModalProps) {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ applicationId: string; candidateName: string } | null>(null);

  // Form Fields State
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: 'India'
  });

  const [professional, setProfessional] = useState({
    currentRole: '',
    experience: '',
    skills: job.skills?.slice(0, 4).join(', ') || '',
    linkedin: '',
    portfolio: '',
    github: ''
  });

  const [applicationInfo, setApplicationInfo] = useState({
    availability: 'Immediate (within 15 days)',
    expectedCompensation: '',
    coverMessage: ''
  });

  // Custom Questions State
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  // File Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(ext)) {
        setErrorMessage('Only PDF, DOC, and DOCX files are allowed.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 10MB limit.');
        return;
      }

      setErrorMessage(null);
      setResumeFile(file);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!personal.name.trim()) { setErrorMessage('Full Name is required'); return false; }
      if (!personal.email.trim() || !personal.email.includes('@')) { setErrorMessage('A valid email address is required'); return false; }
      if (!personal.phone.trim()) { setErrorMessage('Phone number is required'); return false; }
      return true;
    }
    if (currentStep === 2) {
      if (!professional.currentRole.trim()) { setErrorMessage('Current Role / Title is required'); return false; }
      if (!professional.experience.trim()) { setErrorMessage('Years of experience is required'); return false; }
      return true;
    }
    if (currentStep === 3) {
      // Validate mandatory custom questions
      if (job.custom_questions && job.custom_questions.length > 0) {
        for (const q of job.custom_questions) {
          if (q.required && (!customAnswers[q.id] || String(customAnswers[q.id]).trim() === '')) {
            setErrorMessage(`Please answer the required question: "${q.question}"`);
            return false;
          }
        }
      }
      return true;
    }
    if (currentStep === 4) {
      if (!resumeFile) {
        setErrorMessage('Resume / CV file upload is mandatory.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('job_id', job.job_id);
    formData.append('candidate_name', personal.name.trim());
    formData.append('email', personal.email.trim());
    formData.append('phone', personal.phone.trim());
    formData.append('location', `${personal.city}${personal.city && personal.country ? ', ' : ''}${personal.country}`);
    formData.append('current_role', professional.currentRole.trim());
    formData.append('experience', professional.experience.trim());
    formData.append('skills', professional.skills.trim());
    formData.append('linkedin', professional.linkedin.trim());
    formData.append('portfolio', professional.portfolio.trim());
    formData.append('github', professional.github.trim());
    formData.append('availability', applicationInfo.availability.trim());
    formData.append('expected_compensation', applicationInfo.expectedCompensation.trim());
    formData.append('cover_message', applicationInfo.coverMessage.trim());

    // Format custom answers
    const answersPayload = (job.custom_questions || []).map(q => ({
      question_id: q.id,
      question: q.question,
      answer: customAnswers[q.id] || ''
    }));
    formData.append('custom_answers', JSON.stringify(answersPayload));

    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    const res = await submitCareerApplication(formData);
    setSubmitting(false);

    if (res.success) {
      setSuccessData({
        applicationId: res.data?.application_id || 'DIGI8-APP-2026-CONFIRMED',
        candidateName: personal.name
      });
    } else {
      setErrorMessage(res.error || 'Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-6">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="pr-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-cyan">Application Form</span>
            <h2 className="font-outfit font-bold text-xl sm:text-2xl text-white truncate">{job.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-mono text-slate-300">{job.job_id}</span>
              <span>•</span>
              <span>{job.job_type}</span>
              <span>•</span>
              <span>{job.work_mode}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Confirmation View */}
        {successData ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-neon-blue">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit font-bold text-2xl text-white">Application Submitted Successfully!</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Thank you for applying to DIGI8 Solutions, <strong className="text-white">{successData.candidateName}</strong>.
                We have received your application.
              </p>
            </div>

            <div className="bg-white/5 border border-brand-cyan/30 rounded-xl p-5 max-w-md mx-auto space-y-2">
              <span className="text-xs text-slate-400 font-inter uppercase tracking-wider">Your Unique Application ID</span>
              <div className="font-mono font-bold text-xl text-brand-cyan tracking-wider select-all">
                {successData.applicationId}
              </div>
              <p className="text-[11px] text-slate-400">
                Please save this reference ID. A confirmation email has been dispatched to <span className="text-slate-200">{personal.email}</span>.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="btn-glow px-8 py-3 rounded-xl font-bold text-white text-sm"
              >
                Close & View Opportunities
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Steps Progress Indicator */}
            <div className="px-6 pt-5 pb-3 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between text-xs font-medium">
                {[
                  { num: 1, label: 'Personal', icon: User },
                  { num: 2, label: 'Professional', icon: Briefcase },
                  { num: 3, label: 'Questions', icon: HelpCircle },
                  { num: 4, label: 'Resume', icon: UploadCloud },
                  { num: 5, label: 'Review', icon: FileCheck },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = step === s.num;
                  const isDone = step > s.num;
                  return (
                    <div key={s.num} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold ${
                          isActive
                            ? 'bg-brand-cyan text-brand-dark shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : isDone
                            ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
                            : 'bg-white/5 text-slate-500 border border-white/10'
                        }`}
                      >
                        {isDone ? <Check size={14} /> : <Icon size={14} />}
                      </div>
                      <span className={`text-[11px] hidden sm:block ${isActive ? 'text-white font-semibold' : 'text-slate-500'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Steps */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* STEP 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-outfit font-semibold text-lg text-white mb-2">1. Personal Information</h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name <span className="text-brand-cyan">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={personal.name}
                      onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address <span className="text-brand-cyan">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={personal.email}
                        onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone / WhatsApp <span className="text-brand-cyan">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={personal.phone}
                        onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai / Bangalore"
                        value={personal.city}
                        onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={personal.country}
                        onChange={(e) => setPersonal({ ...personal, country: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Professional Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-outfit font-semibold text-lg text-white mb-2">2. Professional Profile</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Current Role / Title <span className="text-brand-cyan">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Engineer / Freelance Designer"
                        value={professional.currentRole}
                        onChange={(e) => setProfessional({ ...professional, currentRole: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Years of Experience <span className="text-brand-cyan">*</span>
                      </label>
                      <select
                        value={professional.experience}
                        onChange={(e) => setProfessional({ ...professional, experience: e.target.value })}
                        className="w-full bg-[#121727] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1 Years (Fresher/Junior)">0-1 Years (Fresher / Junior)</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-8 Years">5-8 Years</option>
                        <option value="8+ Years (Lead/Architect)">8+ Years (Lead / Architect)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, CSS, Tailwind..."
                      value={professional.skills}
                      onChange={(e) => setProfessional({ ...professional, skills: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">LinkedIn Profile</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={professional.linkedin}
                        onChange={(e) => setProfessional({ ...professional, linkedin: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Portfolio / Website</label>
                      <input
                        type="url"
                        placeholder="https://myportfolio.dev"
                        value={professional.portfolio}
                        onChange={(e) => setProfessional({ ...professional, portfolio: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Profile</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={professional.github}
                        onChange={(e) => setProfessional({ ...professional, github: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Job-Specific Questions & Availability */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-outfit font-semibold text-lg text-white mb-2">3. Role-Specific Questions</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Availability / Notice Period</label>
                      <select
                        value={applicationInfo.availability}
                        onChange={(e) => setApplicationInfo({ ...applicationInfo, availability: e.target.value })}
                        className="w-full bg-[#121727] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors"
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="Freelance / Flexible Hours">Freelance / Flexible Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expected Compensation (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹12 LPA or ₹1,500/hr"
                        value={applicationInfo.expectedCompensation}
                        onChange={(e) => setApplicationInfo({ ...applicationInfo, expectedCompensation: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>

                  {/* Render Custom Questions defined for this Job */}
                  {job.custom_questions && job.custom_questions.length > 0 ? (
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <p className="text-xs text-brand-cyan font-semibold uppercase tracking-wider">
                        Questions from the Hiring Team
                      </p>
                      {job.custom_questions.map((q) => (
                        <div key={q.id} className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-300">
                            {q.question} {q.required && <span className="text-brand-cyan">*</span>}
                          </label>

                          {q.type === 'dropdown' && (
                            <select
                              value={customAnswers[q.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                              className="w-full bg-[#121727] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan"
                            >
                              <option value="">Select an option</option>
                              {(q.options || []).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {q.type === 'radio' && (
                            <div className="flex flex-wrap gap-3 pt-1">
                              {(q.options || []).map((opt) => (
                                <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={customAnswers[q.id] === opt}
                                    onChange={() => setCustomAnswers({ ...customAnswers, [q.id]: opt })}
                                    className="accent-brand-cyan"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {q.type === 'number' && (
                            <input
                              type="number"
                              placeholder="Enter number"
                              value={customAnswers[q.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                            />
                          )}

                          {q.type === 'url' && (
                            <input
                              type="url"
                              placeholder="https://..."
                              value={customAnswers[q.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                            />
                          )}

                          {(q.type === 'short text' || (!['dropdown', 'radio', 'number', 'url', 'long text'].includes(q.type))) && (
                            <input
                              type="text"
                              placeholder="Your answer"
                              value={customAnswers[q.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                            />
                          )}

                          {q.type === 'long text' && (
                            <textarea
                              rows={2}
                              placeholder="Provide details..."
                              value={customAnswers[q.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Why are you interested in DIGI8 Solutions? (Cover Note)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what excites you about this role..."
                      value={applicationInfo.coverMessage}
                      onChange={(e) => setApplicationInfo({ ...applicationInfo, coverMessage: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Resume Upload */}
              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="font-outfit font-semibold text-lg text-white mb-2">4. Upload Resume / CV</h3>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {resumeFile ? (
                    <div className="p-5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm truncate max-w-xs">{resumeFile.name}</p>
                          <p className="text-slate-400 text-xs">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:underline px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-brand-cyan/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white/[0.02] group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-brand-cyan/10 text-slate-400 group-hover:text-brand-cyan flex items-center justify-center mx-auto mb-3 transition-colors">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-white font-medium text-sm mb-1">Click to select or drag & drop your resume</p>
                      <p className="text-slate-400 text-xs">Supported formats: PDF, DOC, DOCX (Max size: 10MB)</p>
                    </div>
                  )}

                  {job.documents_required && job.documents_required.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-2">
                      <span className="font-semibold text-slate-300">Required Documents for this Role:</span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {job.documents_required.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Review & Confirmation */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-brand-cyan" />
                    <h3 className="font-outfit font-semibold text-lg text-white">5. Verify Application Details</h3>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Position:</span>
                      <span className="text-white font-bold">{job.title} ({job.job_id})</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Candidate Name:</span>
                      <span className="text-white font-semibold">{personal.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Email & Phone:</span>
                      <span className="text-white">{personal.email} • {personal.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Current Role & Exp:</span>
                      <span className="text-white">{professional.currentRole} ({professional.experience})</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Availability:</span>
                      <span className="text-white">{applicationInfo.availability}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400">Resume Attached:</span>
                      <span className="text-brand-cyan font-mono font-semibold flex items-center gap-1">
                        <FileText size={13} /> {resumeFile?.name}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    By submitting, you certify that the provided information is true and accurate.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : <div />}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-neon-blue"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-glow px-8 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-neon-blue"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
