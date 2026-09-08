import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase, MapPin, Globe, Clock, Calendar, CheckCircle2,
  ArrowLeft, Send, FileText, Check, Copy, AlertCircle
} from 'lucide-react';
import { fetchJobBySlugOrId, type JobPosting } from '../lib/api';
import ApplicationFormModal from '../components/career/ApplicationFormModal';

export default function JobDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchJobBySlugOrId(slug).then((res) => {
      setJob(res);
      setLoading(false);
      if (res) {
        document.title = `${res.title} — DIGI8 Solutions Careers`;
      }
    });
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Career Opportunity at DIGI8 Solutions: ${job?.title} - ${window.location.href}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`We are hiring! ${job?.title} at DIGI8 Solutions: `)}&url=${encodeURIComponent(window.location.href)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-inter">Loading opportunity details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[70vh] bg-brand-dark flex items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-outfit font-bold text-2xl text-white">Opportunity Not Found</h2>
          <p className="text-slate-400 text-sm">
            This job listing may have been closed, archived, or the link has expired.
          </p>
          <Link
            to="/career"
            className="btn-glow inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white mt-2"
          >
            <ArrowLeft size={14} /> Back to All Opportunities
          </Link>
        </div>
      </div>
    );
  }

  // JSON-LD Structured Data for Google JobPosting
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.short_description,
    identifier: {
      '@type': 'PropertyValue',
      name: 'DIGI8 Solutions',
      value: job.job_id
    },
    datePosted: job.created_at || new Date().toISOString(),
    validThrough: job.application_deadline || '2026-12-31',
    employmentType: job.job_type.toUpperCase().includes('FULL') ? 'FULL_TIME' : 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'DIGI8 Solutions',
      sameAs: 'https://digi8solutions.com'
    },
    jobLocationType: job.work_mode.toLowerCase().includes('remote') ? 'TELECOMMUTE' : undefined,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'IN'
      }
    }
  };

  return (
    <div className="bg-brand-dark text-white font-inter min-h-screen relative pb-20">
      {/* Google JobPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Lights */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Navigation Breadcrumb */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link
          to="/career"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-cyan transition-colors"
        >
          <ArrowLeft size={14} /> Back to Careers
        </Link>
      </div>

      {/* JOB HEADER CARD */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="glass-card-premium p-6 sm:p-10 rounded-3xl border border-white/10 shadow-glass space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-3 py-1 rounded-lg">
                {job.job_id}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {job.category}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Actively Hiring
            </span>
          </div>

          <div>
            <h1 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl text-white mb-3">
              {job.title}
            </h1>
            {job.short_description && (
              <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
                {job.short_description}
              </p>
            )}
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Briefcase size={13} className="text-brand-cyan" /> Job Type
              </span>
              <p className="font-semibold text-white">{job.job_type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Globe size={13} className="text-brand-purple" /> Work Mode
              </span>
              <p className="font-semibold text-white">{job.work_mode}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin size={13} className="text-amber-400" /> Location
              </span>
              <p className="font-semibold text-white">{job.location}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock size={13} className="text-emerald-400" /> Experience
              </span>
              <p className="font-semibold text-white">{job.experience}</p>
            </div>
          </div>

          {/* Compensation & Deadline */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            {job.compensation && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Compensation:</span>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {job.compensation}
                </span>
              </div>
            )}
            {job.application_deadline && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={13} className="text-brand-cyan" />
                <span>Deadline: <strong className="text-slate-200">{new Date(job.application_deadline).toLocaleDateString()}</strong></span>
              </div>
            )}
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="btn-glow px-8 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-neon-blue"
            >
              <Send size={16} /> Apply for this Role
            </button>
            <button
              onClick={handleCopyLink}
              className="btn-outline-glass px-5 py-3.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Opportunity'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 Cols: Detailed Descriptions */}
        <div className="lg:col-span-2 space-y-8">

          {/* About the Opportunity */}
          <div className="glass-card-premium p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="font-outfit font-bold text-xl text-white border-b border-white/10 pb-3">
              About the Opportunity
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-3 font-inter">
              {job.description}
            </div>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="glass-card-premium p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="font-outfit font-bold text-xl text-white border-b border-white/10 pb-3">
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                    <CheckCircle2 size={16} className="text-brand-cyan flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="glass-card-premium p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="font-outfit font-bold text-xl text-white border-b border-white/10 pb-3">
                Requirements & Qualifications
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                    <CheckCircle2 size={16} className="text-brand-purple flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hiring Process Overview */}
          <div className="glass-card-premium p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
            <h2 className="font-outfit font-bold text-xl text-white border-b border-white/10 pb-3">
              Our Selection Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-xs text-brand-cyan font-bold">Step 01</span>
                <h4 className="text-sm font-bold text-white">Application Review</h4>
                <p className="text-xs text-slate-400">Our hiring team thoroughly evaluates your resume and portfolio.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-xs text-brand-purple font-bold">Step 02</span>
                <h4 className="text-sm font-bold text-white">Introductory Chat</h4>
                <p className="text-xs text-slate-400">30-minute discussion regarding mutual goals, alignment, and culture.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-xs text-amber-400 font-bold">Step 03</span>
                <h4 className="text-sm font-bold text-white">Technical Deep Dive</h4>
                <p className="text-xs text-slate-400">Practical domain assessment, code review, or design sprint.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-xs text-emerald-400 font-bold">Step 04</span>
                <h4 className="text-sm font-bold text-white">Offer & Onboarding</h4>
                <p className="text-xs text-slate-400">Fast decision, transparent compensation terms, and welcome pack.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Skills, Documents & Social Share */}
        <div className="space-y-6">

          {/* Required Skills Widget */}
          {job.skills && job.skills.length > 0 && (
            <div className="glass-card-premium p-6 rounded-3xl border border-white/10 space-y-3">
              <h3 className="font-outfit font-bold text-base text-white">Key Technologies & Skills</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Documents Widget */}
          <div className="glass-card-premium p-6 rounded-3xl border border-white/10 space-y-3">
            <h3 className="font-outfit font-bold text-base text-white">Documents Required</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="flex items-center gap-2 text-slate-200">
                  <FileText size={14} className="text-brand-cyan" /> Resume / CV
                </span>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Mandatory</span>
              </div>
              {job.documents_required?.filter(d => !d.toLowerCase().includes('resume')).map((doc) => (
                <div key={doc} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-slate-200">
                    <FileText size={14} className="text-brand-purple" /> {doc}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Optional</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Share Widget */}
          <div className="glass-card-premium p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-outfit font-bold text-base text-white">Share this Opportunity</h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                X (Twitter)
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Apply Now Sticky Sidebar CTA */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-cyan/15 to-brand-purple/15 border border-brand-cyan/30 text-center space-y-4">
            <h4 className="font-outfit font-bold text-lg text-white">Ready to make an impact?</h4>
            <p className="text-xs text-slate-300">
              Submit your profile directly to our hiring leaders. No complex registration required.
            </p>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full btn-glow py-3 rounded-xl font-bold text-white text-xs shadow-neon-blue"
            >
              Apply Now
            </button>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {isApplyModalOpen && (
        <ApplicationFormModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
}
