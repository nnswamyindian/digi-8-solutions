import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, HelpCircle, AlertCircle, Sparkles, Wand2, RefreshCw, X, Tag } from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  createCareerJob,
  updateCareerJob,
  fetchJobBySlugOrId,
  type JobPosting,
  type ApplicationQuestion
} from '../../lib/api';
import AiJobGeneratorModal from '../../components/admin/ats/AiJobGeneratorModal';
import { generateJobWithAI, generateRelevantSkills, type GeneratedJobSpec } from '../../lib/aiJobGenerator';

export default function AdminJobEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Copilot State
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiGeneratingInline, setIsAiGeneratingInline] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [jobId, setJobId] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Remote');
  const [location, setLocation] = useState('Remote, India');
  const [experience, setExperience] = useState('2+ Years');
  const [openings, setOpenings] = useState(1);
  const [compensation, setCompensation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'closed' | 'archived'>('published');

  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  // Dynamic Lists
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [skillsText, setSkillsText] = useState('');
  const [documentsRequired, setDocumentsRequired] = useState<string[]>(['Resume/CV']);

  // Custom Questions Builder
  const [customQuestions, setCustomQuestions] = useState<ApplicationQuestion[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      loadJob(id);
    }
  }, [id]);

  const loadJob = async (jobIdentifier: string) => {
    setLoading(true);
    const data = await fetchJobBySlugOrId(jobIdentifier);
    if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setJobId(data.job_id);
      setCategory(data.category);
      setJobType(data.job_type);
      setWorkMode(data.work_mode);
      setLocation(data.location);
      setExperience(data.experience);
      setOpenings(data.openings || 1);
      setCompensation(data.compensation || '');
      setDeadline(data.application_deadline ? data.application_deadline.slice(0, 10) : '');
      setStatus(data.status);
      setShortDescription(data.short_description || '');
      setDescription(data.description || '');
      setResponsibilities(data.responsibilities && data.responsibilities.length > 0 ? data.responsibilities : ['']);
      setRequirements(data.requirements && data.requirements.length > 0 ? data.requirements : ['']);
      setSkillsText(data.skills?.join(', ') || '');
      setDocumentsRequired(data.documents_required || ['Resume/CV']);
      setCustomQuestions(data.custom_questions || []);
    } else {
      setErrorMessage('Failed to load job details');
    }
    setLoading(false);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  // AI Copilot Integration Handlers
  const handleApplyAiSpec = (spec: GeneratedJobSpec) => {
    setTitle(spec.title);
    if (!isEditing) {
      setSlug(spec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
    setCategory(spec.category);
    setExperience(spec.experience);
    setWorkMode(spec.workMode);
    setJobType(spec.jobType);
    setShortDescription(spec.shortDescription);
    setDescription(spec.description);
    setResponsibilities(spec.responsibilities);
    setRequirements(spec.requirements);
    setSkillsText(spec.skills.join(', '));
    if (spec.customQuestions && spec.customQuestions.length > 0) {
      setCustomQuestions(spec.customQuestions);
    }
    if (spec.suggestedCompensation && !compensation) {
      setCompensation(spec.suggestedCompensation);
    }
  };

  const handleQuickAiFillSection = (section: 'description' | 'responsibilities' | 'requirements' | 'skills' | 'questions' | 'all') => {
    const roleTitle = title.trim() || 'Senior Full Stack Developer';
    setIsAiGeneratingInline(true);
    setTimeout(() => {
      const spec = generateJobWithAI({
        title: roleTitle,
        category,
        experience,
        workMode,
        jobType
      });
      if (section === 'description' || section === 'all') {
        setShortDescription(spec.shortDescription);
        setDescription(spec.description);
      }
      if (section === 'responsibilities' || section === 'all') {
        setResponsibilities(spec.responsibilities);
      }
      if (section === 'requirements' || section === 'all') {
        setRequirements(spec.requirements);
      }
      if (section === 'skills' || section === 'all') {
        setSkillsText(spec.skills.join(', '));
      }
      if (section === 'questions' || section === 'all') {
        if (spec.customQuestions && spec.customQuestions.length > 0) {
          setCustomQuestions(spec.customQuestions);
        }
      }
      if (section === 'all' && !title.trim()) {
        setTitle(spec.title);
        if (!isEditing) {
          setSlug(spec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
      }
      setIsAiGeneratingInline(false);
    }, 300);
  };

  // Skills Management Helpers
  const currentSkillsList = skillsText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const addSkillTag = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!currentSkillsList.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...currentSkillsList, trimmed];
      setSkillsText(updated.join(', '));
    }
  };

  const removeSkillTag = (skillToRemove: string) => {
    const updated = currentSkillsList.filter(
      s => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    setSkillsText(updated.join(', '));
  };

  const suggestedSkills = generateRelevantSkills(
    title.trim() || 'Software Engineer',
    category
  ).filter(
    suggestion => !currentSkillsList.some(s => s.toLowerCase() === suggestion.toLowerCase())
  );

  // Responsibilities Handlers
  const addResponsibility = () => setResponsibilities([...responsibilities, '']);
  const updateResponsibility = (idx: number, val: string) => {
    const updated = [...responsibilities];
    updated[idx] = val;
    setResponsibilities(updated);
  };
  const removeResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  // Requirements Handlers
  const addRequirement = () => setRequirements([...requirements, '']);
  const updateRequirement = (idx: number, val: string) => {
    const updated = [...requirements];
    updated[idx] = val;
    setRequirements(updated);
  };
  const removeRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  // Custom Questions Handlers
  const addQuestion = () => {
    const newQ: ApplicationQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'short text',
      required: false,
      options: []
    };
    setCustomQuestions([...customQuestions, newQ]);
  };

  const updateQuestion = (idx: number, updates: Partial<ApplicationQuestion>) => {
    const updated = [...customQuestions];
    updated[idx] = { ...updated[idx], ...updates };
    setCustomQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
  };

  const handleSave = async (submitStatus: 'draft' | 'published' | 'closed' | 'archived') => {
    if (!title.trim()) {
      setErrorMessage('Job title is required');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Full job description is required');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const cleanResponsibilities = responsibilities.map(r => r.trim()).filter(Boolean);
    const cleanRequirements = requirements.map(r => r.trim()).filter(Boolean);

    const payload: Partial<JobPosting> = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      job_id: jobId.trim() || undefined,
      category,
      job_type: jobType,
      work_mode: workMode,
      location: location.trim(),
      experience: experience.trim(),
      openings: Number(openings),
      compensation: compensation.trim(),
      application_deadline: deadline || undefined,
      status: submitStatus,
      short_description: shortDescription.trim(),
      description: description.trim(),
      responsibilities: cleanResponsibilities,
      requirements: cleanRequirements,
      skills: skillsArray,
      documents_required: documentsRequired,
      custom_questions: customQuestions.filter(q => q.question.trim() !== '')
    };

    let res;
    if (isEditing && id) {
      res = await updateCareerJob(id, payload);
    } else {
      res = await createCareerJob(payload);
    }

    setSaving(false);

    if (res.success) {
      navigate('/admin/careers');
    } else {
      setErrorMessage(res.error || 'Failed to save job');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-20">

        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/careers"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-outfit font-black text-2xl text-white">
                {isEditing ? 'Edit Opportunity' : 'Create New Job Opportunity'}
              </h1>
              <p className="text-xs text-slate-400 font-inter">
                {isEditing ? `Updating ${jobId || title}` : 'Define role specifications, qualifications, and application questions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="btn-glow px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-neon-blue"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Publish Job'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* AI Copilot Launch Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-brand-cyan/15 via-brand-purple/15 to-brand-blue/15 border border-brand-cyan/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple flex items-center justify-center shadow-glow-cyan text-white shrink-0">
              <Sparkles size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Digi-8 AI Job Specification Copilot</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider border border-brand-cyan/30">
                  AI Auto-Fill
                </span>
              </div>
              <p className="text-xs text-slate-300 font-inter mt-0.5">
                Generate high-converting role descriptions, 6+ key responsibilities & roles, requirements, and tags in 1 click.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple shadow-glow-cyan hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <Wand2 size={14} /> Open AI Generator
            </button>
            <button
              type="button"
              disabled={isAiGeneratingInline}
              onClick={() => handleQuickAiFillSection('all')}
              className="px-3.5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Fast auto-fill based on current Title"
            >
              {isAiGeneratingInline ? (
                <>
                  <RefreshCw size={12} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-brand-cyan" /> Quick Auto-Fill All
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 1: Basic Information */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h2 className="font-outfit font-bold text-lg text-white border-b border-white/5 pb-2">
            1. Role & Placement Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Title <span className="text-brand-cyan">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL Slug</label>
              <input
                type="text"
                placeholder="senior-frontend-developer"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-brand-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Preview: /career/{slug || 'role'}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job ID (Internal)</label>
              <input
                type="text"
                placeholder="e.g. DIGI8-JOB-101"
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design & Creative</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Sales">Sales & BD</option>
                <option value="Infrastructure">Infrastructure & Cloud</option>
                <option value="Support">Operations & Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Type</label>
              <select
                value={jobType}
                onChange={e => setJobType(e.target.value)}
                className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              >
                <option value="Full-time">Full-time</option>
                <option value="Full-time / Freelance">Full-time / Freelance</option>
                <option value="Contract / Freelance">Contract / Freelance</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Mode</label>
              <select
                value={workMode}
                onChange={e => setWorkMode(e.target.value)}
                className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai / Remote, India"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Required</label>
              <input
                type="text"
                placeholder="e.g. 3+ Years"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Compensation (Disclosed/Range)</label>
              <input
                type="text"
                placeholder="e.g. ₹12,00,000 - ₹18,00,000 P.A."
                value={compensation}
                onChange={e => setCompensation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Publish Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
              >
                <option value="published">Published (Visible to public)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="closed">Closed (Expired)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Descriptions */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="font-outfit font-bold text-lg text-white">
              2. Opportunity Description
            </h2>
            <button
              type="button"
              disabled={isAiGeneratingInline}
              onClick={() => handleQuickAiFillSection('description')}
              className="px-3 py-1 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/25 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={12} /> Auto-Generate Description
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Description (Preview on Job Cards)
            </label>
            <textarea
              rows={2}
              placeholder="A concise 1-2 sentence overview of the role..."
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Job Description <span className="text-brand-cyan">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="Detailed description of the opportunity, team goals, and expectations..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan leading-relaxed"
              required
            />
          </div>
        </div>

        {/* SECTION 3: Responsibilities & Requirements */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="font-outfit font-bold text-lg text-white">
              3. Responsibilities & Requirements
            </h2>
            <button
              type="button"
              disabled={isAiGeneratingInline}
              onClick={() => {
                handleQuickAiFillSection('responsibilities');
                handleQuickAiFillSection('requirements');
                handleQuickAiFillSection('skills');
              }}
              className="px-3 py-1 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/25 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={12} /> Auto-Fill Roles & Skills
            </button>
          </div>

          {/* Responsibilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Key Responsibilities (Roles & Duties)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isAiGeneratingInline}
                  onClick={() => handleQuickAiFillSection('responsibilities')}
                  className="text-xs text-brand-cyan hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 font-medium transition-colors"
                >
                  <Sparkles size={11} /> AI Auto-Fill Key Roles
                </button>
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
            </div>
            {responsibilities.map((resp, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Architect and maintain React components..."
                  value={resp}
                  onChange={e => updateResponsibility(i, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
                {responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResponsibility(i)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Requirements & Qualifications</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isAiGeneratingInline}
                  onClick={() => handleQuickAiFillSection('requirements')}
                  className="text-xs text-brand-cyan hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 font-medium transition-colors"
                >
                  <Sparkles size={11} /> AI Auto-Fill Requirements
                </button>
                <button
                  type="button"
                  onClick={addRequirement}
                  className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
            </div>
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 3+ years professional experience with TypeScript..."
                  value={req}
                  onChange={e => updateRequirement(i, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(i)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Skills Tags */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Key Skills & Technologies
                </label>
                <p className="text-[11px] text-slate-400">
                  Required technical competencies, frameworks, or tools for this position.
                </p>
              </div>
              <button
                type="button"
                disabled={isAiGeneratingInline}
                onClick={() => handleQuickAiFillSection('skills')}
                className="text-xs text-brand-cyan hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={11} /> AI Auto-Fill Skills
              </button>
            </div>

            {/* Active Skills Pills */}
            {currentSkillsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/10 min-h-[42px]">
                {currentSkillsList.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-cyan/15 text-cyan-200 border border-brand-cyan/30 group"
                  >
                    <Tag size={10} className="text-brand-cyan" />
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkillTag(skill)}
                      className="p-0.5 text-cyan-400/70 hover:text-rose-400 hover:bg-white/10 rounded transition-colors"
                      title="Remove skill"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Type skills separated by commas (e.g. React, TypeScript, Node.js, Docker)"
              value={skillsText}
              onChange={e => setSkillsText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
            />

            {/* Role-Intelligent Skill Recommendations */}
            {suggestedSkills.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1.5">
                  <Sparkles size={11} className="text-brand-cyan" /> Suggested for this role (click to add):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {suggestedSkills.slice(0, 10).map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addSkillTag(suggestion)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-brand-cyan/20 text-slate-300 hover:text-brand-cyan border border-white/10 hover:border-brand-cyan/30 transition-all flex items-center gap-1"
                    >
                      <Plus size={10} /> {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Job-Specific Application Questions Builder */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <h2 className="font-outfit font-bold text-lg text-white">
                4. Job-Specific Application Questions
              </h2>
              <p className="text-xs text-slate-400">
                Define custom screening questions candidates must answer during the application process.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isAiGeneratingInline}
                onClick={() => handleQuickAiFillSection('questions')}
                className="px-3 py-1.5 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/25 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={12} /> AI Generate Questions
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-outline-glass px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-cyan flex items-center gap-1"
              >
                <Plus size={13} /> Add Question
              </button>
            </div>
          </div>

          {customQuestions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <HelpCircle size={24} className="mx-auto mb-2 text-slate-500" />
              <p className="text-xs text-slate-400">No screening questions configured for this role yet.</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  disabled={isAiGeneratingInline}
                  onClick={() => handleQuickAiFillSection('questions')}
                  className="px-4 py-2 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-brand-cyan/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles size={13} /> Auto-Generate Role-Specific Questions
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-xs text-slate-400 hover:text-white underline font-medium"
                >
                  + Add question manually
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {customQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          Q{idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. How many years of experience do you have with React?"
                          value={q.question}
                          onChange={e => updateQuestion(idx, { question: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-cyan"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Answer Type:</span>
                          <select
                            value={q.type}
                            onChange={e => updateQuestion(idx, { type: e.target.value as any })}
                            className="bg-[#101423] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-cyan"
                          >
                            <option value="short text">Short Text</option>
                            <option value="long text">Long Text</option>
                            <option value="number">Number</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="url">Website / Portfolio URL</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={e => updateQuestion(idx, { required: e.target.checked })}
                            className="accent-brand-cyan"
                          />
                          <span className="text-xs">Required Question</span>
                        </label>
                      </div>

                      {/* Options input if dropdown or radio */}
                      {['dropdown', 'radio', 'checkbox'].includes(q.type) && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Options (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="Option 1, Option 2, Option 3"
                            value={q.options?.join(', ') || ''}
                            onChange={e => updateQuestion(idx, {
                              options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-cyan"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Bar Footer */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/careers"
            className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(status)}
            className="btn-glow px-8 py-2.5 rounded-xl text-xs font-bold text-white shadow-neon-blue flex items-center gap-1.5"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Job Opportunity'}
          </button>
        </div>

      </div>

      {/* AI Job Specification Generator Modal */}
      <AiJobGeneratorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        initialTitle={title}
        initialCategory={category}
        initialExperience={experience}
        initialWorkMode={workMode}
        initialJobType={jobType}
        onApplySpec={handleApplyAiSpec}
      />
    </AdminLayout>
  );
}
