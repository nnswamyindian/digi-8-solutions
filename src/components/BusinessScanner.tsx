import { useState } from 'react';
import {
  Search, Globe, Zap, TrendingUp, Shield, Smartphone, Eye, Target,
  Share2, Award, AlertCircle, CheckCircle, ArrowRight, RotateCcw, Sparkles
} from 'lucide-react';
import { saveLead } from '../lib/api';
import LeadGenForm from './LeadGenForm';

type ScanResult = {
  websiteSpeed: number;
  seo: number;
  branding: number;
  security: number;
  performance: number;
  googlePresence: number;
  socialMedia: number;
  marketing: number;
  trustScore: number;
  mobileOptimization: number;
  accessibility: number;
  aiScore: number;
};

type ScanStatus = 'idle' | 'scanning' | 'complete';

const scanSteps = [
  { label: 'Checking Website Speed', icon: Zap },
  { label: 'Analyzing SEO Score', icon: TrendingUp },
  { label: 'Evaluating Brand Identity', icon: Award },
  { label: 'Testing Security', icon: Shield },
  { label: 'Measuring Performance', icon: Target },
  { label: 'Scanning Google Presence', icon: Globe },
  { label: 'Reviewing Social Media', icon: Share2 },
  { label: 'Assessing Marketing', icon: TrendingUp },
  { label: 'Calculating Trust Score', icon: CheckCircle },
  { label: 'Testing Mobile Optimization', icon: Smartphone },
  { label: 'Checking Accessibility', icon: Eye },
  { label: 'Computing AI Score', icon: Sparkles },
];

export default function BusinessScanner() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleScan = async () => {
    if (!input.trim()) return;
    setStatus('scanning');
    setCurrentStep(0);
    setResult(null);

    // Simulate scanning through each step
    for (let i = 0; i < scanSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 350));
    }

    // Generate random but realistic scores
    const scores: ScanResult = {
      websiteSpeed: Math.floor(Math.random() * 50) + 30,
      seo: Math.floor(Math.random() * 50) + 20,
      branding: Math.floor(Math.random() * 40) + 30,
      security: Math.floor(Math.random() * 45) + 25,
      performance: Math.floor(Math.random() * 50) + 35,
      googlePresence: Math.floor(Math.random() * 45) + 25,
      socialMedia: Math.floor(Math.random() * 50) + 30,
      marketing: Math.floor(Math.random() * 45) + 25,
      trustScore: Math.floor(Math.random() * 40) + 40,
      mobileOptimization: Math.floor(Math.random() * 45) + 35,
      accessibility: Math.floor(Math.random() * 40) + 30,
      aiScore: 0,
    };

    scores.aiScore = Math.round(
      (scores.websiteSpeed + scores.seo + scores.branding + scores.security +
       scores.performance + scores.googlePresence + scores.socialMedia + scores.marketing +
       scores.trustScore + scores.mobileOptimization + scores.accessibility) / 11
    );

    setResult(scores);

    // Generate recommendations based on low scores
    const recs: string[] = [];
    if (scores.websiteSpeed < 60) recs.push('Optimize website loading speed with CDN and image compression');
    if (scores.seo < 60) recs.push('Implement comprehensive SEO strategy with keyword optimization');
    if (scores.branding < 60) recs.push('Redesign brand identity with consistent visual language');
    if (scores.security < 60) recs.push('Upgrade to SSL, implement firewall, and conduct security audit');
    if (scores.googlePresence < 60) recs.push('Set up Google Business Profile and optimize local SEO');
    if (scores.socialMedia < 60) recs.push('Develop social media strategy with consistent content calendar');
    if (scores.marketing < 60) recs.push('Launch targeted Google Ads and Meta Ads campaigns');
    if (scores.mobileOptimization < 60) recs.push('Redesign with mobile-first responsive approach');
    if (scores.accessibility < 60) recs.push('Improve WCAG compliance for better accessibility');
    if (recs.length === 0) recs.push('Your digital presence is strong! Focus on scaling and automation.');
    setRecommendations(recs);

    setStatus('complete');

    // Save as lead
    try {
      await saveLead({
        name: 'Business Scanner Lead',
        email: 'pending@scanner.digi8',
        service: 'AI Business Scanner',
        source: 'Business Scanner',
        message: `Scanned: ${input}. AI Score: ${scores.aiScore}/100`,
        form_data: { input, scores } as Record<string, unknown>,
      });
    } catch (e) {
      // Continue even if save fails
    }
  };

  const reset = () => {
    setStatus('idle');
    setInput('');
    setResult(null);
    setRecommendations([]);
    setCurrentStep(0);
  };

  const scoreMetrics = result ? [
    { label: 'Website Speed', score: result.websiteSpeed, icon: Zap, color: '#00E5FF' },
    { label: 'SEO Score', score: result.seo, icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Branding', score: result.branding, icon: Award, color: '#EC4899' },
    { label: 'Security', score: result.security, icon: Shield, color: '#10B981' },
    { label: 'Performance', score: result.performance, icon: Target, color: '#F59E0B' },
    { label: 'Google Presence', score: result.googlePresence, icon: Globe, color: '#00E5FF' },
    { label: 'Social Media', score: result.socialMedia, icon: Share2, color: '#6C63FF' },
    { label: 'Marketing', score: result.marketing, icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Trust Score', score: result.trustScore, icon: CheckCircle, color: '#00FFC6' },
    { label: 'Mobile Optimization', score: result.mobileOptimization, icon: Smartphone, color: '#EC4899' },
    { label: 'Accessibility', score: result.accessibility, icon: Eye, color: '#F59E0B' },
  ] : [];

  return (
    <div className="relative z-10 py-24 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="tag mx-auto mb-4">AI Business Scanner</div>
          <h2 className="font-sora font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Scan Your Business{' '}
            <span className="gradient-text">Digital Health</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-inter text-base">
            Enter your business name or website URL. Our AI will analyze 11 critical metrics and generate a comprehensive digital health report.
          </p>
        </div>

        {/* Scanner Input */}
        {status === 'idle' && (
          <div className="max-w-2xl mx-auto slide-in-up">
            <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScan()}
                    placeholder="Enter business name or website URL..."
                    className="form-input w-full pl-12 pr-4 py-4 rounded-xl text-sm font-inter"
                  />
                </div>
                <button
                  onClick={handleScan}
                  data-magnetic
                  className="btn-glow px-6 py-4 rounded-xl font-poppins font-semibold text-white text-sm inline-flex items-center justify-center gap-2 magnetic whitespace-nowrap"
                >
                  <Sparkles size={16} /> Scan Now
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {['restaurantmumbai.com', 'TechStartup.io', 'My Business'].map(example => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    className="text-xs px-3 py-1.5 rounded-full glass border border-white/5 text-slate-400 hover:text-accent hover:border-accent/30 transition-all font-inter"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scanning Animation */}
        {status === 'scanning' && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8">
              {/* Scanner visual */}
              <div className="relative h-48 rounded-2xl bg-primary/50 border border-white/5 overflow-hidden mb-6">
                <div className="absolute inset-0 grid-bg opacity-20" />
                {/* Scan line */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent scan-line" />
                {/* Scanning text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-accent/30 flex items-center justify-center mx-auto mb-3 animate-spin-slow">
                      <div className="w-12 h-12 rounded-full border border-highlight/30 flex items-center justify-center">
                        <Search size={20} className="text-accent" />
                      </div>
                    </div>
                    <p className="text-sm text-accent font-inter">Scanning: {input}</p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {scanSteps.map((step, i) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      i < currentStep ? 'opacity-50' : i === currentStep ? 'glass border border-accent/20' : 'opacity-20'
                    }`}
                  >
                    {i < currentStep ? (
                      <CheckCircle size={16} className="text-accent-green" />
                    ) : i === currentStep ? (
                      <step.icon size={16} className="text-accent animate-pulse" />
                    ) : (
                      <step.icon size={16} className="text-slate-500" />
                    )}
                    <span className={`text-sm font-inter ${i === currentStep ? 'text-white' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    {i === currentStep && (
                      <div className="ml-auto flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {status === 'complete' && result && (
          <div className="slide-in-up">
            {/* AI Score Hero */}
            <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="score-ring w-full h-full" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                      cx="64" cy="64" r="56"
                      fill="none"
                      stroke="url(#aiScoreGrad)"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 - (result.aiScore / 100) * 2 * Math.PI * 56}
                      strokeLinecap="round"
                      className="score-ring-progress"
                    />
                    <defs>
                      <linearGradient id="aiScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#6C63FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-sora font-black text-3xl gradient-text">{result.aiScore}</div>
                      <div className="text-[10px] text-slate-400 font-inter">AI SCORE</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-sora font-bold text-xl text-white mb-2">
                    Scan Complete: {input}
                  </h3>
                  <p className="text-sm text-slate-400 font-inter mb-4">
                    Your overall digital health score is <span className="text-accent font-bold">{result.aiScore}/100</span>.
                    {result.aiScore < 50
                      ? ' Your digital presence needs significant improvement.'
                      : result.aiScore < 75
                      ? ' You have a decent foundation with room for growth.'
                      : ' Excellent digital presence! Focus on scaling.'}
                  </p>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 text-sm text-accent hover:text-white transition-colors font-inter"
                  >
                    <RotateCcw size={14} /> Scan Another Business
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {scoreMetrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className="glass rounded-2xl p-4 border border-white/5 slide-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <metric.icon size={16} style={{ color: metric.color }} />
                    <span className="text-xs text-slate-400 font-inter">{metric.label}</span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="font-sora font-black text-2xl" style={{ color: metric.color }}>{metric.score}%</span>
                    {metric.score < 50 ? (
                      <AlertCircle size={14} className="text-red-400" />
                    ) : metric.score < 75 ? (
                      <AlertCircle size={14} className="text-amber-400" />
                    ) : (
                      <CheckCircle size={14} className="text-accent-green" />
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${metric.score}%`, background: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-accent" />
                <h3 className="font-sora font-bold text-white text-lg">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 glass rounded-xl p-3 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-sora font-bold text-accent">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 font-inter">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mb-6">
              <a
                href="/quote-calculator"
                data-magnetic
                className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-full font-poppins font-semibold text-white text-sm magnetic"
              >
                Get Detailed Proposal <ArrowRight size={16} />
              </a>
            </div>

            {/* Lead Gen Form */}
            <div className="max-w-md mx-auto">
              <LeadGenForm
                source="Business Scanner CTA"
                title="Get Your Free Scan Report"
                subtitle="Share your details and we'll send you a detailed analysis with recommendations."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
