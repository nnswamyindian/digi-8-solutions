import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, HelpCircle, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  createCareerJob,
  updateCareerJob,
  fetchJobBySlugOrId,
  type JobPosting,
  type ApplicationQuestion
} from '../../lib/api';

export default function AdminJobEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          <h2 className="font-outfit font-bold text-lg text-white border-b border-white/5 pb-2">
            2. Opportunity Description
          </h2>

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
          <h2 className="font-outfit font-bold text-lg text-white border-b border-white/5 pb-2">
            3. Responsibilities & Requirements
          </h2>

          {/* Responsibilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Key Responsibilities</label>
              <button
                type="button"
                onClick={addResponsibility}
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Item
              </button>
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
              <button
                type="button"
                onClick={addRequirement}
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Item
              </button>
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
          <div className="pt-4 border-t border-white/5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Key Skills (comma-separated tags)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Tailwind CSS, REST APIs, Git"
              value={skillsText}
              onChange={e => setSkillsText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
            />
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
                Define custom questions candidates must answer during the application process.
              </p>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="btn-outline-glass px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-cyan flex items-center gap-1"
            >
              <Plus size={13} /> Add Question
            </button>
          </div>

          {customQuestions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
              <HelpCircle size={24} className="mx-auto mb-2 text-slate-500" />
              <p className="text-xs text-slate-400">No custom questions created yet.</p>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs text-brand-cyan hover:underline mt-2 font-semibold"
              >
                + Add your first role-specific question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">Q{idx + 1}</span>
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
                          <span className="text-slate-400">Type:</span>
                          <select
                            value={q.type}
                            onChange={e => updateQuestion(idx, { type: e.target.value as any })}
                            className="bg-[#101423] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                          >
                            <option value="short text">Short Text</option>
                            <option value="long text">Long Text</option>
                            <option value="number">Number</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="url">Website / URL</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={e => updateQuestion(idx, { required: e.target.checked })}
                            className="accent-brand-cyan"
                          />
                          <span>Required Question</span>
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
                      className="p-1.5 text-slate-500 hover:text-rose-400"
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
    </AdminLayout>
  );
}
