import { useState } from 'react';
import {
  Sparkles, X, Check, Copy, RefreshCw, Wand2,
  FileText, CheckCircle2, ListChecks
} from 'lucide-react';
import {
  generateJobWithAI,
  PRESET_ROLES,
  type GeneratedJobSpec
} from '../../../lib/aiJobGenerator';

interface AiJobGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialCategory?: string;
  initialExperience?: string;
  initialWorkMode?: string;
  initialJobType?: string;
  onApplySpec: (spec: GeneratedJobSpec) => void;
}

export default function AiJobGeneratorModal({
  isOpen,
  onClose,
  initialTitle = '',
  initialCategory = 'Engineering',
  initialExperience = '3+ Years',
  initialWorkMode = 'Remote',
  initialJobType = 'Full-time',
  onApplySpec
}: AiJobGeneratorModalProps) {
  const [title, setTitle] = useState(initialTitle || 'Senior Full Stack Developer');
  const [category, setCategory] = useState(initialCategory);
  const [experience, setExperience] = useState(initialExperience);
  const [workMode, setWorkMode] = useState(initialWorkMode);
  const [jobType, setJobType] = useState(initialJobType);
  const [customInstructions, setCustomInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<GeneratedJobSpec | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'requirements'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetTitle: string, presetCategory: string, presetExp: string) => {
    setTitle(presetTitle);
    setCategory(presetCategory);
    setExperience(presetExp);
    // Instant generation for preset
    handleGenerate(presetTitle, presetCategory, presetExp);
  };

  const handleGenerate = (
    overrideTitle?: string,
    overrideCategory?: string,
    overrideExp?: string
  ) => {
    setIsGenerating(true);
    setTimeout(() => {
      const spec = generateJobWithAI({
        title: overrideTitle || title,
        category: overrideCategory || category,
        experience: overrideExp || experience,
        workMode,
        jobType,
        customInstructions: customInstructions.trim() || undefined
      });
      setGeneratedSpec(spec);
      setIsGenerating(false);
    }, 400);
  };

  const handleApplyAll = () => {
    if (generatedSpec) {
      onApplySpec(generatedSpec);
      onClose();
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col glass-strong rounded-3xl border border-brand-cyan/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-white">

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple flex items-center justify-center shadow-glow-cyan text-white">
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-outfit font-black text-lg text-white tracking-tight">
                  Digi-8 AI Job Specification Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider border border-brand-cyan/30">
                  GenAI v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-inter">
                Auto-generate comprehensive job descriptions, key roles, responsibilities, and skill sets in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* Configuration Grid */}
          <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wand2 size={13} className="text-brand-cyan" /> Quick AI Role Presets:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ROLES.slice(0, 8).map(preset => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleSelectPreset(preset.title, preset.category, preset.defaultExperience)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    title.toLowerCase() === preset.title.toLowerCase()
                      ? 'bg-brand-cyan text-brand-dark font-bold shadow-glow-cyan'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lead Cloud Architect"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan font-medium"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Department
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales & BD</option>
                  <option value="Support">Operations / Support</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="1+ Years">Entry / Junior (1+ Years)</option>
                  <option value="2+ Years">Mid-Level (2+ Years)</option>
                  <option value="3+ Years">Experienced (3+ Years)</option>
                  <option value="5+ Years">Senior (5+ Years)</option>
                  <option value="7+ Years">Lead / Principal (7+ Years)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Work Mode
                </label>
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

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  className="w-full bg-[#101423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract / Freelance">Contract / Freelance</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="sm:col-span-12">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Custom AI Focus / Nuances (Optional)
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on microservices, mentorship, client-facing presentation, and startup agility..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isGenerating || !title.trim()}
                onClick={() => handleGenerate()}
                className="btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Synthesizing Role Specification...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Generate Complete Job Specification
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Specification Preview */}
          {generatedSpec && (
            <div className="space-y-4 animate-fadeIn">
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-brand-cyan text-brand-cyan font-bold'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText size={14} /> Full Job Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'roles'
                      ? 'border-brand-cyan text-brand-cyan font-bold'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <ListChecks size={14} /> Key Roles & Responsibilities ({generatedSpec.responsibilities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('requirements')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'requirements'
                      ? 'border-brand-cyan text-brand-cyan font-bold'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={14} /> Requirements & Skills ({generatedSpec.requirements.length})
                </button>
              </div>

              {/* Tab 1: Full Job Description */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Short Description */}
                  <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-brand-cyan uppercase tracking-wider">
                        Short Card Summary (Preview)
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedSpec.shortDescription, 'short')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'short' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedKey === 'short' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-inter">
                      {generatedSpec.shortDescription}
                    </p>
                  </div>

                  {/* Full Description */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Structured Full Description
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedSpec.description, 'full')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'full' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedKey === 'full' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-inter bg-black/30 p-3 rounded-lg border border-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                      {generatedSpec.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Key Roles & Responsibilities */}
              {activeTab === 'roles' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      These <span className="text-brand-cyan font-bold">{generatedSpec.responsibilities.length}</span> key responsibilities will be mapped to the job form:
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedSpec.responsibilities.map(r => `• ${r}`).join('\n'), 'roles')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'roles' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedKey === 'roles' ? 'Copied List' : 'Copy All'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {generatedSpec.responsibilities.map((resp, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-cyan/30 transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-brand-cyan/10 text-brand-cyan text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-brand-cyan/20">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-inter flex-1">
                          {resp}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Requirements & Skills */}
              {activeTab === 'requirements' && (
                <div className="space-y-4">
                  {/* Skills tags */}
                  <div>
                    <label className="block text-[11px] font-bold text-brand-cyan uppercase tracking-wider mb-2">
                      Suggested Key Skills & Tech Stack
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      {generatedSpec.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements list */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">
                        Qualifications & Requirements:
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedSpec.requirements.map(r => `• ${r}`).join('\n'), 'reqs')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'reqs' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedKey === 'reqs' ? 'Copied' : 'Copy All'}
                      </button>
                    </div>
                    {generatedSpec.requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors"
                      >
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-200 leading-relaxed font-inter flex-1">
                          {req}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          {generatedSpec && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
              <button
                type="button"
                onClick={handleApplyAll}
                className="btn-glow px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Check size={15} /> Apply All To Job Form
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
