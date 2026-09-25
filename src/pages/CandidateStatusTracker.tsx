import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, CheckCircle2, Clock, ArrowRight, ShieldCheck,
  AlertCircle, Briefcase, MapPin, Calendar, HelpCircle, ArrowLeft
} from 'lucide-react';
import { fetchPublicApplicationStatus, type PublicApplicationStatus } from '../lib/api';

export default function CandidateStatusTracker() {
  const [appId, setAppId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<PublicApplicationStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim() || !email.trim()) {
      setErrorMsg('Please provide both your Application Reference ID and Email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setStatusResult(null);

    try {
      const res = await fetchPublicApplicationStatus(appId, email);
      if (res.success && res.data) {
        setStatusResult(res.data);
      } else {
        setErrorMsg(res.error || 'No matching application was found. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to retrieve application status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back navigation */}
        <div>
          <Link
            to="/career"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Open Opportunities
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group mb-1">
            <img
              src="/logo.png"
              alt="Digi 8 Solutions"
              className="h-14 sm:h-16 w-auto object-contain mx-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-105"
            />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide">
              <ShieldCheck size={14} /> Candidate Self-Service Portal
            </div>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
            Track Your Application Status
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Enter your unique Application Reference ID and the email you used to apply to check real-time progress.
          </p>
        </div>

        {/* Lookup Card */}
        <div className="glass-card-premium bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Application Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIGI8-APP-2026-108241"
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Applicant Email Address
                </label>
                <input
                  type="email"
                  placeholder="youremail@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-glow px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm flex items-center gap-2 shadow-neon-blue transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin" size={16} /> Checking Application...
                  </>
                ) : (
                  <>
                    <Search size={16} /> Check Status
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Status Result Display */}
        {statusResult && (
          <div className="glass-card-premium bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl animate-fade-in">
            {/* Header / Position summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  {statusResult.application_id}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {statusResult.job_title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-500" /> {statusResult.job_location}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-500" /> {statusResult.job_type} ({statusResult.work_mode})
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-500" /> Submitted on {new Date(statusResult.applied_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Current Status Pill */}
              <div className="sm:text-right">
                <p className="text-xs text-slate-400 mb-1">Current Milestone</p>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                  statusResult.current_stage_slug === 'hired' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  statusResult.current_stage_slug === 'rejected' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {statusResult.current_stage_label}
                </span>
              </div>
            </div>

            {/* Visual Milestone Roadmap */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recruitment Process Roadmap
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {statusResult.roadmap.map((step, idx) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';

                  return (
                    <div
                      key={step.slug}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 scale-[1.02]'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold">
                          0{idx + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : isCurrent ? (
                          <Clock size={16} className="text-cyan-400 animate-pulse" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-700" />
                        )}
                      </div>

                      <div>
                        <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-cyan-400' : ''}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] uppercase font-semibold mt-1">
                          {isCompleted ? 'Completed' : isCurrent ? 'Under Evaluation' : 'Upcoming'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Narrative Note */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs text-slate-300">
              {statusResult.current_stage_slug === 'rejected' ? (
                <>
                  <p className="font-bold text-white">Application Update</p>
                  <p className="leading-relaxed">
                    Thank you for your interest in DIGI8 Solutions. For this specific opening, our talent acquisition team has concluded this hiring process or selected another applicant whose immediate qualifications aligned with the opening.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Your resume remains stored securely in our talent network. We will contact you proactively if an aligned future opening becomes available.
                  </p>
                </>
              ) : statusResult.current_stage_slug === 'hired' ? (
                <>
                  <p className="font-bold text-emerald-400">Congratulations!</p>
                  <p className="leading-relaxed">
                    You have successfully completed all recruitment milestones and have been selected to join DIGI8 Solutions. Our HR operations team is coordinating your formal onboarding.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-cyan-400">What Happens Next?</p>
                  <p className="leading-relaxed">
                    Our talent acquisition specialists review every candidate submission with care. If your profile advances to the next stage or an interview round is scheduled, you will receive an automatic email invitation with full details.
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
              <Link
                to="/career"
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5"
              >
                Browse other openings at DIGI8 Solutions <ArrowRight size={13} />
              </Link>
              <a
                href="mailto:careers@digi8solutions.com"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Need assistance? Contact Talent Support
              </a>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="border-t border-slate-800 pt-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HelpCircle size={16} className="text-cyan-400" /> Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <p className="font-bold text-white">Where do I find my Application ID?</p>
              <p className="text-slate-400">
                Your ID (e.g. <code>DIGI8-APP-2026-XXXXXX</code>) was displayed immediately upon submission and was also emailed to your inbox.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <p className="font-bold text-white">How often is status updated?</p>
              <p className="text-slate-400">
                The tracker updates in real-time as recruiters review applications, schedule interviews, and finalize hiring decisions.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
