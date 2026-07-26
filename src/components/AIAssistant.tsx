import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, ArrowRight, Check, Globe, Users, Clock,
  Code2, Palette, TrendingUp, Shield, Rocket, Smartphone,
  MessageCircle, Mail, Calendar, Download, TrendingUp as Growth,
  Zap, Target, RotateCcw, Link2, Search, AlertTriangle,
  Lightbulb, TrendingDown, ExternalLink, Activity, Eye
} from 'lucide-react';
import { saveLead, saveQuote, generateQuoteNumber, type Lead } from '../lib/api';
import LeadGenForm from './LeadGenForm';
import { computeReportScores, analyzeWebsite, type Selections, type WebsiteAnalysis } from '../lib/reportEngine';

type Step = 'intro' | 'business' | 'need' | 'current' | 'website' | 'businessName' | 'competitors' | 'audience' | 'country' | 'challenges' | 'visitors' | 'marketingBudget' | 'features' | 'analyzing' | 'result';

type Conversation = { role: 'ai' | 'user'; text: string };

const businessTypes = [
  { label: 'Restaurant', icon: '🍽️' }, { label: 'College', icon: '🎓' },
  { label: 'Hospital', icon: '🏥' }, { label: 'Startup', icon: '🚀' },
  { label: 'School', icon: '🏫' }, { label: 'NGO', icon: '🤝' },
  { label: 'Real Estate', icon: '🏠' }, { label: 'Construction', icon: '🏗️' },
  { label: 'Doctor', icon: '⚕️' }, { label: 'Lawyer', icon: '⚖️' },
  { label: 'E-Commerce', icon: '🛒' }, { label: 'Others', icon: '✨' },
];

const needs = [
  { label: 'Website', icon: Code2, color: '#00E5FF' },
  { label: 'App', icon: Smartphone, color: '#6C63FF' },
  { label: 'Marketing', icon: TrendingUp, color: '#8B5CF6' },
  { label: 'Branding', icon: Palette, color: '#EC4899' },
  { label: 'Security', icon: Shield, color: '#10B981' },
  { label: 'Automation', icon: Zap, color: '#F59E0B' },
];

const currentSituations = [
  { label: 'No online presence', desc: 'Starting from scratch', icon: '🆕' },
  { label: 'Have a basic website', desc: 'Needs improvement', icon: '🌐' },
  { label: 'Active but not growing', desc: 'Stagnant results', icon: '📊' },
  { label: 'Doing well, want to scale', desc: 'Ready to expand', icon: '📈' },
  { label: 'Rebranding', desc: 'Fresh start', icon: '🎨' },
];

const audiences = ['Local Customers', 'National Market', 'International', 'B2B / Corporate', 'Students / Youth', 'Professionals', 'General Public', 'Niche / Premium'];
const countries = ['India', 'USA', 'UK', 'UAE', 'Singapore', 'Australia', 'Canada', 'Others'];

const challenges = [
  { label: 'Not getting enough leads', icon: '📉' },
  { label: 'Low website traffic', icon: '🌐' },
  { label: 'Poor Google ranking', icon: '🔍' },
  { label: 'High competition', icon: '⚔️' },
  { label: 'Low brand awareness', icon: '👁️' },
  { label: 'Outdated technology', icon: '⚙️' },
  { label: 'No online sales', icon: '💸' },
  { label: 'Customer retention', icon: '🔄' },
];

const visitorRanges = [
  'Less than 100/month', '100-500/month', '500-1,000/month',
  '1,000-5,000/month', '5,000-10,000/month', '10,000+/month', 'Not sure',
];

const marketingBudgets = [
  'Not investing yet', 'Under ₹10,000/mo', '₹10,000-25,000/mo',
  '₹25,000-50,000/mo', '₹50,000+/mo', 'Prefer not to say',
];

const allFeatures = [
  { label: 'E-Commerce', weeks: 1 }, { label: 'Payment Gateway', weeks: 0.5 },
  { label: 'Multi-Language', weeks: 0.5 }, { label: 'AI Chatbot', weeks: 1 },
  { label: 'Booking System', weeks: 1 }, { label: 'CRM Integration', weeks: 1 },
  { label: 'SEO Optimization', weeks: 0.5 }, { label: 'Social Media API', weeks: 0.5 },
  { label: 'Push Notifications', weeks: 0.5 }, { label: 'Analytics Dashboard', weeks: 1 },
  { label: 'Cloud Hosting (1yr)', weeks: 0 }, { label: 'SSL & Security', weeks: 0 },
];

const serviceMap: Record<string, { name: string; baseWeeks: number; tech: string[]; color: string }> = {
  'Website': { name: 'Web Development', baseWeeks: 3, tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Vercel'], color: '#00E5FF' },
  'App': { name: 'Mobile App Development', baseWeeks: 5, tech: ['Flutter', 'React Native', 'Firebase', 'REST API'], color: '#6C63FF' },
  'Marketing': { name: 'Digital Marketing', baseWeeks: 2, tech: ['Google Ads', 'Meta Ads', 'SEO', 'Email Marketing', 'Analytics'], color: '#8B5CF6' },
  'Branding': { name: 'Logo & Brand Identity', baseWeeks: 2, tech: ['Figma', 'Illustrator', 'Photoshop', 'Brand Guidelines'], color: '#EC4899' },
  'Security': { name: 'Cyber Security Audit', baseWeeks: 2, tech: ['Penetration Testing', 'OWASP', 'SSL', 'Firewall', 'Monitoring'], color: '#10B981' },
  'Automation': { name: 'Business Automation', baseWeeks: 3, tech: ['Zapier', 'n8n', 'APIs', 'CRM', 'Workflows'], color: '#F59E0B' },
};

const businessContext: Record<string, { question: string; recommendation: string }> = {
  'Restaurant': { question: 'Do you need online ordering, table reservations, or a menu showcase?', recommendation: 'online ordering system with table booking' },
  'College': { question: 'Do you need admission forms, course catalogs, or student portals?', recommendation: 'admission portal with course management' },
  'Hospital': { question: 'Do you need appointment booking, patient records, or doctor profiles?', recommendation: 'appointment system with patient portal' },
  'Startup': { question: 'Are you looking for an MVP, investor pitch deck, or full launch?', recommendation: 'MVP with investor-ready presentation' },
  'School': { question: 'Do you need fee payment, attendance tracking, or parent communication?', recommendation: 'school management with parent portal' },
  'NGO': { question: 'Do you need donation collection, volunteer management, or event pages?', recommendation: 'donation platform with volunteer coordination' },
  'Real Estate': { question: 'Do you need property listings, virtual tours, or lead capture?', recommendation: 'property listing system with lead capture' },
  'Construction': { question: 'Do you need project portfolios, quote forms, or client portals?', recommendation: 'project portfolio with quote management' },
  'Doctor': { question: 'Do you need appointment booking, telemedicine, or patient records?', recommendation: 'appointment system with telemedicine' },
  'Lawyer': { question: 'Do you need case management, client intake, or document portals?', recommendation: 'client intake system with document portal' },
  'E-Commerce': { question: 'Do you need a full store, payment integration, or inventory management?', recommendation: 'full e-commerce store with inventory' },
  'Others': { question: 'What specific outcome are you looking to achieve?', recommendation: 'custom digital solution' },
};

export type ReportData = {
  businessType: string;
  need: string;
  serviceName: string;
  serviceColor: string;
  technologies: string[];
  timeline: string;
  deliveryDays: number;
  deliveryWeeks: number;
  audience: string;
  country: string;
  currentSituation: string;
  selectedFeatures: string[];
  successScore: number;
  growthPrediction: number;
  estimatedROI: string;
  digitalScores: { website: number; seo: number; social: number; brand: number; security: number };
  overallScore: number;
  potentialScore: number;
  roadmap: { phase: string; duration: string; desc: string }[];
  websiteUrl: string;
  businessName: string;
  competitors: string;
  monthlyVisitors: string;
  topChallenge: string;
  marketingBudget: string;
  websiteAnalysis: WebsiteAnalysis | null;
  recommendations: string[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  insights: string[];
  competitorResults: { name: string; found: boolean }[];
};

export default function AIAssistant() {
  const [step, setStep] = useState<Step>('intro');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [textValue, setTextValue] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [conversations, isTyping]);

  const addAI = (text: string) => {
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setConversations(prev => [...prev, { role: 'ai', text }]); }, 800);
  };
  const addUser = (text: string) => setConversations(prev => [...prev, { role: 'user', text }]);

  const startConversation = () => {
    setStep('business');
    setConversations([{ role: 'ai', text: "Hello! I'm Digi AI, your Digital Business Consultant. I'll analyze your business and create a detailed report. Let's start — what type of business do you own?" }]);
  };

  const selectBusiness = (biz: string) => {
    addUser(biz); setSelections(prev => ({ ...prev, business: biz })); setStep('need');
    const ctx = businessContext[biz] || businessContext['Others'];
    setTimeout(() => addAI(`Great! You're in the ${biz} space. ${ctx.question} What service do you need?`), 500);
  };

  const selectNeed = (need: string) => {
    addUser(need); setSelections(prev => ({ ...prev, need })); setStep('current');
    setTimeout(() => addAI(`Got it — ${need}. What's your current digital situation?`), 500);
  };

  const selectCurrent = (current: string) => {
    addUser(current); setSelections(prev => ({ ...prev, current }));
    if (current.includes('No online') || current.includes('Rebranding')) {
      setStep('businessName');
      setTimeout(() => addAI("What's your business name? This helps me check your online presence."), 500);
    } else {
      setStep('website');
      setTimeout(() => addAI("What's your website URL? I'll analyze it in real-time — checking SEO, speed, security, and social presence."), 500);
    }
  };

  const submitWebsite = () => {
    const val = textValue.trim();
    if (!val) { setStep('businessName'); addUser('Skip'); }
    else { addUser(val); setSelections(prev => ({ ...prev, websiteUrl: val })); }
    setTextValue('');
    setStep('businessName');
    setTimeout(() => addAI("What's your business name? I'll use it to check your Google presence."), 500);
  };

  const submitBusinessName = () => {
    const val = textValue.trim() || 'Not provided';
    addUser(val); setSelections(prev => ({ ...prev, businessName: val }));
    setTextValue('');
    setStep('competitors');
    setTimeout(() => addAI("Who are your top competitors? (Enter names separated by commas, or 'Skip')"), 500);
  };

  const submitCompetitors = () => {
    const val = textValue.trim() || 'Skip';
    addUser(val); setSelections(prev => ({ ...prev, competitors: val }));
    setTextValue('');
    setStep('challenges');
    setTimeout(() => addAI("What's your biggest challenge right now?"), 500);
  };

  const selectChallenge = (challenge: string) => {
    addUser(challenge); setSelections(prev => ({ ...prev, topChallenge: challenge }));
    setStep('visitors');
    setTimeout(() => addAI("How many visitors does your website get per month?"), 500);
  };

  const selectVisitors = (visitors: string) => {
    addUser(visitors); setSelections(prev => ({ ...prev, monthlyVisitors: visitors }));
    setStep('marketingBudget');
    setTimeout(() => addAI("How much are you currently investing in marketing per month?"), 500);
  };

  const selectMarketingBudget = (budget: string) => {
    addUser(budget); setSelections(prev => ({ ...prev, marketingBudget: budget }));
    setStep('audience');
    setTimeout(() => addAI("Who is your primary target audience?"), 500);
  };

  const selectAudience = (audience: string) => {
    addUser(audience); setSelections(prev => ({ ...prev, audience })); setStep('country');
    setTimeout(() => addAI("Which country or region are you targeting?"), 500);
  };

  const selectCountry = (country: string) => {
    addUser(country); setSelections(prev => ({ ...prev, country })); setStep('features');
    const biz = selections.business as string;
    const ctx = businessContext[biz] || businessContext['Others'];
    setTimeout(() => addAI(`Last question! Based on your ${biz} business, I recommend a ${ctx.recommendation}. Which features would you like? Select all that apply.`), 500);
  };

  const toggleFeature = (feature: string) => {
    setSelections(prev => {
      const current = (prev.features as string[]) || [];
      return { ...prev, features: current.includes(feature) ? current.filter(f => f !== feature) : [...current, feature] };
    });
  };

  const calculateTimeline = (need: string, features: string[]) => {
    const service = serviceMap[need] || serviceMap['Website'];
    let weeks = service.baseWeeks;
    features.forEach(f => { const feat = allFeatures.find(af => af.label === f); if (feat) weeks += feat.weeks; });
    weeks = Math.min(6, Math.max(1, Math.ceil(weeks)));
    const days = weeks * 7;
    let label = weeks <= 1 ? '1 week' : weeks <= 2 ? '2 weeks' : weeks <= 3 ? '3 weeks' : weeks <= 4 ? '4 weeks' : weeks <= 5 ? '5 weeks' : '6 weeks';
    return { weeks, days, label };
  };

  const generateRoadmap = (totalWeeks: number, serviceName: string) => {
    if (totalWeeks <= 2) return [
      { phase: 'Discovery & Planning', duration: 'Days 1-2', desc: 'Requirements analysis, wireframes, and project scope' },
      { phase: 'Design & Development', duration: 'Days 3-10', desc: `Rapid ${serviceName.toLowerCase()} design and development` },
      { phase: 'Testing & Launch', duration: 'Days 11-14', desc: 'Quality assurance, client review, and deployment' },
    ];
    if (totalWeeks <= 4) return [
      { phase: 'Discovery & Planning', duration: 'Week 1', desc: 'Requirements analysis, wireframes, and project roadmap' },
      { phase: 'Design & Branding', duration: 'Week 2', desc: 'UI/UX design, brand assets, and client approval' },
      { phase: 'Development', duration: 'Week 2-3', desc: `Core ${serviceName.toLowerCase()} development with agile sprints` },
      { phase: 'Testing & Launch', duration: 'Week 4', desc: 'Quality assurance, performance testing, and deployment' },
    ];
    return [
      { phase: 'Discovery & Planning', duration: 'Week 1', desc: 'Requirements analysis, wireframes, and project roadmap' },
      { phase: 'Design & Branding', duration: 'Week 2', desc: 'UI/UX design, brand assets, and client approval' },
      { phase: 'Core Development', duration: 'Week 3-4', desc: `Primary ${serviceName.toLowerCase()} development with agile sprints` },
      { phase: 'Feature Integration', duration: 'Week 4-5', desc: 'Additional features, integrations, and refinements' },
      { phase: 'Testing & Launch', duration: 'Week 5-6', desc: 'Quality assurance, performance, security testing, and deployment' },
    ];
  };

  const generateProposal = async () => {
    const features = (selections.features as string[]) || [];
    addUser(features.length > 0 ? features.join(', ') : 'No specific features');
    setStep('analyzing');

    const steps = [
      'Analyzing business type...', 'Matching services...', 'Checking website...',
      'Scanning Google presence...', 'Analyzing competitors...', 'Computing scores...',
      'Generating recommendations...', 'Building roadmap...',
    ];
    for (let i = 0; i < steps.length; i++) {
      setProgressLabel(steps[i]);
      setProgress((i + 1) * (100 / steps.length));
      await new Promise(r => setTimeout(r, 400));
    }

    const need = selections.need as string;
    const service = serviceMap[need] || serviceMap['Website'];
    const timeline = calculateTimeline(need, features);
    const roadmap = generateRoadmap(timeline.weeks, service.name);

    const sel: Selections = {
      business: selections.business as string, need, current: selections.current as string,
      audience: selections.audience as string, country: selections.country as string,
      features, websiteUrl: selections.websiteUrl as string || '',
      businessName: selections.businessName as string || '',
      competitors: selections.competitors as string || '',
      monthlyVisitors: selections.monthlyVisitors as string || '',
      topChallenge: selections.topChallenge as string || '',
      marketingBudget: selections.marketingBudget as string || '',
    };

    const scores = computeReportScores(sel);

    // Real-time website analysis
    let websiteAnalysis: WebsiteAnalysis | null = null;
    if (sel.websiteUrl && sel.websiteUrl.length > 3) {
      setProgressLabel('Running live website analysis...');
      websiteAnalysis = await analyzeWebsite(sel.websiteUrl, sel.business, sel.businessName, sel.competitors);
    }

    // Merge live analysis scores if available
    let finalDigitalScores = scores.digitalScores;
    let finalOverall = scores.overallScore;
    if (websiteAnalysis) {
      finalDigitalScores = {
        website: websiteAnalysis.websiteScore,
        seo: websiteAnalysis.seoScore,
        social: websiteAnalysis.socialScore,
        brand: websiteAnalysis.brandScore,
        security: websiteAnalysis.securityScore,
      };
      finalOverall = websiteAnalysis.overallScore;
    }

    const reportData: ReportData = {
      businessType: sel.business, need, serviceName: service.name, serviceColor: service.color,
      technologies: service.tech, timeline: timeline.label, deliveryDays: timeline.days,
      deliveryWeeks: timeline.weeks, audience: sel.audience, country: sel.country,
      currentSituation: sel.current, selectedFeatures: features,
      successScore: scores.successScore, growthPrediction: scores.growthPrediction,
      estimatedROI: scores.estimatedROI, digitalScores: finalDigitalScores,
      overallScore: finalOverall, potentialScore: scores.potentialScore, roadmap,
      websiteUrl: sel.websiteUrl, businessName: sel.businessName, competitors: sel.competitors,
      monthlyVisitors: sel.monthlyVisitors, topChallenge: sel.topChallenge,
      marketingBudget: sel.marketingBudget, websiteAnalysis,
      recommendations: websiteAnalysis?.recommendations || [],
      swot: websiteAnalysis?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      insights: websiteAnalysis?.insights || [],
      competitorResults: websiteAnalysis?.competitors || [],
    };

    setReport(reportData);

    try {
      const lead: Lead = {
        name: sel.businessName || 'AI Consultation Lead', email: 'pending@ai-consult.digi8',
        service: need, source: 'AI Assistant',
        message: `Business: ${sel.business}, Need: ${need}, Current: ${sel.current}, Website: ${sel.websiteUrl}, Challenge: ${sel.topChallenge}, Visitors: ${sel.monthlyVisitors}, Marketing: ${sel.marketingBudget}, Timeline: ${timeline.label}, Audience: ${sel.audience}, Country: ${sel.country}, Features: ${features.join(', ')}`,
        form_data: selections as Record<string, unknown>,
      };
      const saved = await saveLead(lead);
      const quoteNumber = generateQuoteNumber();
      await saveQuote({
        quote_number: quoteNumber, lead_id: saved?.id, service: need, features,
        timeline: timeline.label, delivery_days: timeline.days, status: 'AI Generated',
      });
    } catch { /* continue */ }

    setStep('result');
  };

  const reset = () => {
    setStep('intro'); setConversations([]); setSelections({}); setReport(null); setProgress(0); setTextValue('');
  };

  // ===== INTRO SCREEN =====
  if (step === 'intro') {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-highlight/10 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-purple/5 blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-28 pb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-accent/20 slide-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-xs font-inter text-accent tracking-wider">AI-POWERED DIGITAL CONSULTANT</span>
          </div>

          <div className="slide-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-sora font-black text-5xl sm:text-6xl md:text-7xl text-white leading-[1.1] mb-2">Hello</h1>
            <h2 className="font-sora font-bold text-3xl sm:text-4xl md:text-5xl gradient-text mb-4">I'm Digi AI.</h2>
            <p className="font-sora font-semibold text-xl sm:text-2xl text-white/70 mb-2">Your Digital Business Consultant.</p>
            <p className="font-inter text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
              I analyze your website, check Google presence, scan competitors, and generate a detailed report — in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto slide-in-up" style={{ animationDelay: '0.3s' }}>
            {[
              { label: 'Build My Website', icon: Code2, color: '#00E5FF' },
              { label: 'Grow My Business', icon: TrendingUp, color: '#8B5CF6' },
              { label: 'Need Branding', icon: Palette, color: '#EC4899' },
              { label: 'Build Mobile App', icon: Smartphone, color: '#6C63FF' },
              { label: 'Need Marketing', icon: Target, color: '#F59E0B' },
              { label: 'Protect My Business', icon: Shield, color: '#10B981' },
              { label: 'Start My Startup', icon: Rocket, color: '#00FFC6' },
              { label: 'Automate Everything', icon: Zap, color: '#8B5CF6' },
            ].map((btn, i) => (
              <button key={btn.label} onClick={startConversation} data-magnetic
                className="glass rounded-2xl p-4 border border-white/5 hover:border-accent/30 transition-all group text-left magnetic"
                style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                  style={{ background: `${btn.color}15`, border: `1px solid ${btn.color}30` }}>
                  <btn.icon size={18} style={{ color: btn.color }} />
                </div>
                <span className="text-xs font-inter text-white/80 group-hover:text-white transition-colors">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12 slide-in-up" style={{ animationDelay: '0.6s' }}>
            {[{ value: '500+', label: 'Happy Clients' }, { value: '1200+', label: 'Projects Completed' },
              { value: '8+', label: 'Years Experience' }, { value: '25+', label: 'Countries Served' }].map(stat => (
              <div key={stat.label} className="glass rounded-2xl p-4 border border-white/5 hover:border-accent/20 transition-all">
                <div className="font-sora font-black text-2xl sm:text-3xl gradient-text-blue">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1 font-inter">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ===== ANALYZING SCREEN =====
  if (step === 'analyzing') {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="relative z-10 max-w-md w-full text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border border-highlight/30 animate-spin-slow" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-glow-accent animate-pulse-glow">
              <Sparkles size={32} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border border-accent/40 pulse-ring" />
            <div className="absolute inset-0 rounded-full border border-accent/40 pulse-ring" style={{ animationDelay: '0.5s' }} />
          </div>
          <h3 className="font-sora font-bold text-2xl text-white mb-2">Analyzing Your Business</h3>
          <p className="text-slate-400 font-inter text-sm mb-8">{progressLabel || 'AI is analyzing your requirements...'}</p>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-4">
            <div className="h-full progress-fill rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-accent font-inter">{Math.floor(progress)}% Complete</p>
        </div>
      </div>
    );
  }

  // ===== RESULT =====
  if (step === 'result' && report) return <AIReport report={report} onReset={reset} />;

  // ===== CONVERSATION FLOW =====
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-24">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-highlight/5 blur-3xl animate-float" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-glow-accent">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-white text-lg">Digi AI Consultant</h3>
              <p className="text-xs text-accent/60 font-inter">AI-Powered Session Active</p>
            </div>
          </div>
          <button onClick={reset} className="glass rounded-xl p-2.5 border border-white/5 hover:border-accent/30 transition-all">
            <RotateCcw size={16} className="text-slate-400 hover:text-accent transition-colors" />
          </button>
        </div>

        <div ref={chatRef} className="glass-strong rounded-3xl border border-white/10 p-6 h-[500px] overflow-y-auto chat-scroll mb-4">
          <div className="space-y-4">
            {conversations.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 slide-in-up ${msg.role === 'ai' ? 'ai-bubble rounded-tl-sm' : 'user-bubble rounded-tr-sm'}`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={12} className="text-accent" />
                      <span className="text-[10px] text-accent font-inter font-medium">DIGI AI</span>
                    </div>
                  )}
                  <p className={`text-sm font-inter ${msg.role === 'ai' ? 'text-slate-200' : 'text-white'}`}>{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="ai-bubble rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="typing-dots flex items-center"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-strong rounded-3xl border border-white/10 p-4">
          {step === 'business' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Select your business type:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {businessTypes.map(biz => (
                  <button key={biz.label} onClick={() => selectBusiness(biz.label)} className="option-card glass rounded-xl p-3 border border-white/5 text-center">
                    <div className="text-2xl mb-1">{biz.icon}</div>
                    <span className="text-xs font-inter text-white/80">{biz.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'need' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">What service do you need?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {needs.map(need => (
                  <button key={need.label} onClick={() => selectNeed(need.label)} className="option-card glass rounded-xl p-3 border border-white/5 flex items-center gap-2">
                    <need.icon size={18} style={{ color: need.color }} />
                    <span className="text-sm font-inter text-white/80">{need.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'current' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">What's your current digital situation?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentSituations.map(sit => (
                  <button key={sit.label} onClick={() => selectCurrent(sit.label)} className="option-card glass rounded-xl p-3 border border-white/5 flex items-center gap-3">
                    <span className="text-xl">{sit.icon}</span>
                    <div>
                      <div className="text-sm font-inter text-white/80">{sit.label}</div>
                      <div className="text-[10px] text-slate-500">{sit.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'website' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Enter your website URL (or skip):</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={textValue} onChange={e => setTextValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitWebsite()}
                    placeholder="https://yourwebsite.com" autoFocus
                    className="form-input w-full pl-10 pr-3 py-2.5 rounded-xl text-sm font-inter" />
                </div>
                <button onClick={submitWebsite} className="btn-glow px-4 py-2.5 rounded-xl font-poppins font-semibold text-white text-sm">Next</button>
              </div>
            </div>
          )}

          {step === 'businessName' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Your business name:</p>
              <div className="flex gap-2">
                <input type="text" value={textValue} onChange={e => setTextValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitBusinessName()}
                  placeholder="e.g. Spice Garden Restaurant" autoFocus
                  className="form-input flex-1 px-4 py-2.5 rounded-xl text-sm font-inter" />
                <button onClick={submitBusinessName} className="btn-glow px-4 py-2.5 rounded-xl font-poppins font-semibold text-white text-sm">Next</button>
              </div>
            </div>
          )}

          {step === 'competitors' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Top competitors (comma-separated, or skip):</p>
              <div className="flex gap-2">
                <input type="text" value={textValue} onChange={e => setTextValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitCompetitors()}
                  placeholder="e.g. competitor1.com, competitor2.com" autoFocus
                  className="form-input flex-1 px-4 py-2.5 rounded-xl text-sm font-inter" />
                <button onClick={submitCompetitors} className="btn-glow px-4 py-2.5 rounded-xl font-poppins font-semibold text-white text-sm">Next</button>
              </div>
            </div>
          )}

          {step === 'challenges' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">What's your biggest challenge?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {challenges.map(ch => (
                  <button key={ch.label} onClick={() => selectChallenge(ch.label)} className="option-card glass rounded-xl p-3 border border-white/5 text-center">
                    <div className="text-xl mb-1">{ch.icon}</div>
                    <span className="text-[10px] font-inter text-white/80">{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'visitors' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Monthly website visitors?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visitorRanges.map(v => (
                  <button key={v} onClick={() => selectVisitors(v)} className="option-card glass rounded-xl p-3 border border-white/5 text-center">
                    <span className="text-xs font-inter text-white/80">{v}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'marketingBudget' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Monthly marketing investment?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {marketingBudgets.map(b => (
                  <button key={b} onClick={() => selectMarketingBudget(b)} className="option-card glass rounded-xl p-3 border border-white/5 text-center">
                    <span className="text-xs font-inter text-white/80">{b}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'audience' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Who is your target audience?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {audiences.map(aud => (
                  <button key={aud} onClick={() => selectAudience(aud)} className="option-card glass rounded-xl p-3 border border-white/5 text-center">
                    <Users size={16} className="text-accent mx-auto mb-1" />
                    <span className="text-xs font-inter text-white/80">{aud}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'country' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Select your target country:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {countries.map(country => (
                  <button key={country} onClick={() => selectCountry(country)} className="option-card glass rounded-xl p-3 border border-white/5 flex items-center justify-center gap-2">
                    <Globe size={16} className="text-accent" />
                    <span className="text-sm font-inter text-white/80">{country}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'features' && (
            <div>
              <p className="text-xs text-slate-400 font-inter mb-3">Select features (optional):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto chat-scroll">
                {allFeatures.map(feature => {
                  const selected = ((selections.features as string[]) || []).includes(feature.label);
                  return (
                    <button key={feature.label} onClick={() => toggleFeature(feature.label)}
                      className={`option-card glass rounded-xl p-3 border flex items-center justify-between ${selected ? 'selected' : 'border-white/5'}`}>
                      <span className="text-xs font-inter text-white/80">{feature.label}</span>
                      {selected && <Check size={14} className="text-accent" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={generateProposal} data-magnetic
                className="btn-glow w-full mt-4 px-6 py-3.5 rounded-xl font-poppins font-semibold text-white text-sm inline-flex items-center justify-center gap-2 magnetic">
                <Sparkles size={16} /> Generate AI Report <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== AI REPORT COMPONENT =====
function AIReport({ report, onReset }: { report: ReportData; onReset: () => void }) {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + report.deliveryDays);
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const wa = report.websiteAnalysis;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `*Digi 8 Solutions - AI Report*\n\nBusiness: ${report.businessType}\nService: ${report.serviceName}\nTimeline: ${report.timeline} (Delivery by ${deliveryDateStr})\nOverall Score: ${report.overallScore}/100\nGrowth Prediction: +${report.growthPrediction}%\n\nI'd like to discuss this report.`
    );
    window.open(`https://wa.me/919000207739?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Digi 8 Solutions - AI Business Report');
    const body = encodeURIComponent(
      `Business: ${report.businessType}\nService: ${report.serviceName}\nWebsite: ${report.websiteUrl || 'N/A'}\nOverall Score: ${report.overallScore}/100\nGrowth: +${report.growthPrediction}%\nTimeline: ${report.timeline}\nDelivery: ${deliveryDateStr}\n\nI'd like to discuss this report.`
    );
    window.open(`mailto:hello@digi8solutions.com?subject=${subject}&body=${body}`);
  };

  const handleDownload = () => {
    const content = `DIGI 8 SOLUTIONS - AI BUSINESS REPORT
=====================================

Business: ${report.businessType}
Business Name: ${report.businessName}
Service: ${report.serviceName}
Website: ${report.websiteUrl || 'N/A'}
Current Situation: ${report.currentSituation}
Top Challenge: ${report.topChallenge}
Monthly Visitors: ${report.monthlyVisitors}
Marketing Budget: ${report.marketingBudget}
Target Audience: ${report.audience}
Country: ${report.country}
Timeline: ${report.timeline} (${report.deliveryWeeks} weeks)
Delivery Date: ${deliveryDateStr}

DIGITAL PRESENCE SCORES
=======================
Website: ${report.digitalScores.website}%
SEO: ${report.digitalScores.seo}%
Social Media: ${report.digitalScores.social}%
Brand Identity: ${report.digitalScores.brand}%
Cyber Security: ${report.digitalScores.security}%

Overall Digital Score: ${report.overallScore}/100
Potential After Digi 8: ${report.potentialScore}/100
Estimated Growth: +${report.growthPrediction}%
Success Score: ${report.successScore}/100
Estimated ROI: ${report.estimatedROI}

${wa ? `LIVE WEBSITE ANALYSIS
=====================
URL: ${wa.url}
Reachable: ${wa.reachable}
SSL: ${wa.hasSSL}
Title: ${wa.title} (${wa.titleLength} chars)
Meta Description: ${wa.metaDescription || 'Missing'}
Structured Data: ${wa.hasStructuredData}
Open Graph: ${wa.hasOpenGraph}
Google Analytics: ${wa.hasGoogleAnalytics}
Contact Form: ${wa.hasContactForm}
Live Chat: ${wa.hasLiveChat}
WhatsApp: ${wa.hasWhatsApp}
Social Profiles: ${wa.socialProfiles.map(s => s.platform).join(', ') || 'None'}
Page Weight: ${(wa.pageWeight / 1024).toFixed(0)}KB
Load Time: ${(wa.loadTimeMs / 1000).toFixed(1)}s
Google Results: ${wa.googleResultsCount}
Google Business Profile: ${wa.googleBusinessProfile}
Robots.txt: ${wa.hasRobotsTxt}
Sitemap: ${wa.hasSitemap}

SEO Score: ${wa.seoScore}/100
Social Score: ${wa.socialScore}/100
Performance Score: ${wa.performanceScore}/100
Security Score: ${wa.securityScore}/100
Brand Score: ${wa.brandScore}/100

` : ''}${report.swot.strengths.length > 0 ? `SWOT ANALYSIS
=============
Strengths:
${report.swot.strengths.map(s => `- ${s}`).join('\n')}

Weaknesses:
${report.swot.weaknesses.map(s => `- ${s}`).join('\n')}

Opportunities:
${report.swot.opportunities.map(s => `- ${s}`).join('\n')}

Threats:
${report.swot.threats.map(s => `- ${s}`).join('\n')}

` : ''}${report.recommendations.length > 0 ? `RECOMMENDATIONS
===============
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

` : ''}${report.insights.length > 0 ? `INSIGHTS
=========
${report.insights.map(s => `- ${s}`).join('\n')}

` : ''}${report.competitorResults.length > 0 ? `COMPETITORS
===========
${report.competitorResults.map(c => `- ${c.name}: ${c.found ? 'Website found' : 'Not found'}`).join('\n')}

` : ''}TECHNOLOGIES
============
${report.technologies.join(', ')}

PROJECT ROADMAP
===============
${report.roadmap.map(r => `${r.phase} (${r.duration}): ${r.desc}`).join('\n')}

SELECTED FEATURES
=================
${report.selectedFeatures.join(', ') || 'None selected'}

---
Generated by Digi AI - Digi 8 Solutions
hello@digi8solutions.com | +91 9000207739`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Digi8-AI-Report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen overflow-hidden py-24 px-4 sm:px-6">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-highlight/5 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 slide-in-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 border border-accent/20">
            <Check size={14} className="text-accent-green" />
            <span className="text-xs font-inter text-accent-green tracking-wider">REPORT GENERATED</span>
          </div>
          <h2 className="font-sora font-black text-3xl sm:text-4xl md:text-5xl text-white mb-2">
            DIGI AI <span className="gradient-text">BUSINESS REPORT</span>
          </h2>
          <p className="text-slate-400 font-inter text-sm">Real-time analysis with deterministic scoring</p>
        </div>

        {/* Business Profile + Scores */}
        <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h3 className="font-sora font-bold text-white text-lg mb-4">Business Profile</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Business</span><span className="text-sm text-white font-inter font-medium">{report.businessType}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Name</span><span className="text-sm text-white font-inter font-medium">{report.businessName}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Service</span><span className="text-sm font-inter font-medium" style={{ color: report.serviceColor }}>{report.serviceName}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Challenge</span><span className="text-sm text-white font-inter font-medium">{report.topChallenge}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Visitors</span><span className="text-sm text-white font-inter font-medium">{report.monthlyVisitors}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Marketing</span><span className="text-sm text-white font-inter font-medium">{report.marketingBudget}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Timeline</span><span className="text-sm text-accent font-inter font-medium">{report.timeline}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Delivery By</span><span className="text-sm text-accent-green font-inter font-medium">{deliveryDateStr}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Audience</span><span className="text-sm text-white font-inter font-medium">{report.audience}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400 font-inter">Country</span><span className="text-sm text-white font-inter font-medium">{report.country}</span></div>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <ScoreRing score={report.overallScore} potentialScore={report.potentialScore} />
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400 font-inter">Overall Digital Score</p>
                <p className="text-2xl font-sora font-black gradient-text">{report.overallScore} / 100</p>
                <p className="text-xs text-accent-green mt-1 font-inter">Potential: {report.potentialScore} / 100</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h3 className="font-sora font-bold text-white text-lg mb-4">Growth Prediction</h3>
              <div className="glass rounded-2xl p-5 border border-accent-green/20 text-center">
                <Growth size={32} className="text-accent-green mx-auto mb-2" />
                <div className="font-sora font-black text-4xl gradient-text-green">+{report.growthPrediction}%</div>
                <p className="text-xs text-slate-400 font-inter mt-1">Estimated Growth After Digi 8</p>
              </div>
              <div className="glass rounded-2xl p-4 border border-white/5 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 font-inter">Success Score</span>
                  <span className="text-sm font-sora font-bold text-accent">{report.successScore}/100</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full progress-fill rounded-full" style={{ width: `${report.successScore}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3 mb-2">
                  <span className="text-xs text-slate-400 font-inter">Est. ROI</span>
                  <span className="text-sm font-sora font-bold text-accent-green">{report.estimatedROI}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Presence Scores */}
        <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-sora font-bold text-white text-lg mb-6">Digital Presence Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Website', score: report.digitalScores.website, icon: Code2, color: '#00E5FF' },
              { label: 'Google SEO', score: report.digitalScores.seo, icon: TrendingUp, color: '#8B5CF6' },
              { label: 'Social Media', score: report.digitalScores.social, icon: Users, color: '#EC4899' },
              { label: 'Brand Identity', score: report.digitalScores.brand, icon: Palette, color: '#F59E0B' },
              { label: 'Cyber Security', score: report.digitalScores.security, icon: Shield, color: '#10B981' },
            ].map(item => (
              <div key={item.label} className="glass rounded-2xl p-4 border border-white/5 text-center">
                <item.icon size={20} className="mx-auto mb-2" style={{ color: item.color }} />
                <div className="font-sora font-black text-2xl" style={{ color: item.color }}>{item.score}%</div>
                <p className="text-xs text-slate-400 font-inter mt-1">{item.label}</p>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.score}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Website Analysis */}
        {wa && (
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={20} className="text-accent" />
              <h3 className="font-sora font-bold text-white text-lg">Live Website Analysis</h3>
              <a href={wa.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-accent font-inter flex items-center gap-1 hover:underline">
                <ExternalLink size={12} /> {wa.url.replace(/^https?:\/\//, '').slice(0, 30)}
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'SSL Secure', value: wa.hasSSL, icon: Shield, color: '#10B981' },
                { label: 'Meta Description', value: wa.hasMetaDescription, icon: Search, color: '#8B5CF6' },
                { label: 'Structured Data', value: wa.hasStructuredData, icon: Code2, color: '#00E5FF' },
                { label: 'Open Graph', value: wa.hasOpenGraph, icon: Globe, color: '#EC4899' },
                { label: 'Google Analytics', value: wa.hasGoogleAnalytics, icon: TrendingUp, color: '#F59E0B' },
                { label: 'Contact Form', value: wa.hasContactForm, icon: MessageCircle, color: '#00E5FF' },
                { label: 'Live Chat', value: wa.hasLiveChat, icon: MessageCircle, color: '#6C63FF' },
                { label: 'WhatsApp', value: wa.hasWhatsApp, icon: MessageCircle, color: '#10B981' },
                { label: 'Mobile Friendly', value: wa.mobileFriendly, icon: Smartphone, color: '#00E5FF' },
                { label: 'Robots.txt', value: wa.hasRobotsTxt, icon: Search, color: '#8B5CF6' },
                { label: 'Sitemap', value: wa.hasSitemap, icon: Code2, color: '#00E5FF' },
                { label: 'Favicon', value: wa.hasFavicon, icon: Globe, color: '#EC4899' },
              ].map(item => (
                <div key={item.label} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-2">
                  {item.value ? <Check size={14} style={{ color: item.color }} /> : <AlertTriangle size={14} className="text-red-400/60" />}
                  <span className="text-xs font-inter text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="glass rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-slate-400 font-inter">Page Size</p>
                <p className="text-sm font-sora font-bold text-white">{(wa.pageWeight / 1024).toFixed(0)} KB</p>
              </div>
              <div className="glass rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-slate-400 font-inter">Load Time</p>
                <p className="text-sm font-sora font-bold text-white">{(wa.loadTimeMs / 1000).toFixed(1)}s</p>
              </div>
              <div className="glass rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-slate-400 font-inter">Google Results</p>
                <p className="text-sm font-sora font-bold text-white">{wa.googleResultsCount}</p>
              </div>
              <div className="glass rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-slate-400 font-inter">Social Profiles</p>
                <p className="text-sm font-sora font-bold text-white">{wa.socialProfiles.length}</p>
              </div>
            </div>

            {wa.socialProfiles.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 font-inter mb-2">Social Media Presence:</p>
                <div className="flex flex-wrap gap-2">
                  {wa.socialProfiles.map(s => (
                    <span key={s.platform} className="px-3 py-1.5 rounded-full glass border border-accent/20 text-xs font-inter text-accent">{s.platform}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'SEO', score: wa.seoScore, color: '#8B5CF6' },
                { label: 'Social', score: wa.socialScore, color: '#EC4899' },
                { label: 'Performance', score: wa.performanceScore, color: '#00E5FF' },
                { label: 'Security', score: wa.securityScore, color: '#10B981' },
                { label: 'Brand', score: wa.brandScore, color: '#F59E0B' },
                { label: 'Website', score: wa.websiteScore, color: '#00E5FF' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-sora font-black text-xl" style={{ color: s.color }}>{s.score}</div>
                  <p className="text-[10px] text-slate-400 font-inter">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SWOT Analysis */}
        {report.swot.strengths.length > 0 && (
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-sora font-bold text-white text-lg mb-6">SWOT Analysis</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 border border-accent-green/20">
                <div className="flex items-center gap-2 mb-3"><Check size={16} className="text-accent-green" /><h4 className="font-sora font-bold text-accent-green text-sm">Strengths</h4></div>
                <ul className="space-y-1.5">{report.swot.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300 font-inter flex items-start gap-2"><span className="text-accent-green mt-0.5">+</span>{s}</li>)}</ul>
              </div>
              <div className="glass rounded-2xl p-5 border border-red-400/20">
                <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-red-400" /><h4 className="font-sora font-bold text-red-400 text-sm">Weaknesses</h4></div>
                <ul className="space-y-1.5">{report.swot.weaknesses.map((s, i) => <li key={i} className="text-xs text-slate-300 font-inter flex items-start gap-2"><span className="text-red-400 mt-0.5">-</span>{s}</li>)}</ul>
              </div>
              <div className="glass rounded-2xl p-5 border border-accent/20">
                <div className="flex items-center gap-2 mb-3"><Lightbulb size={16} className="text-accent" /><h4 className="font-sora font-bold text-accent text-sm">Opportunities</h4></div>
                <ul className="space-y-1.5">{report.swot.opportunities.map((s, i) => <li key={i} className="text-xs text-slate-300 font-inter flex items-start gap-2"><span className="text-accent mt-0.5">→</span>{s}</li>)}</ul>
              </div>
              <div className="glass rounded-2xl p-5 border border-orange-400/20">
                <div className="flex items-center gap-2 mb-3"><TrendingDown size={16} className="text-orange-400" /><h4 className="font-sora font-bold text-orange-400 text-sm">Threats</h4></div>
                <ul className="space-y-1.5">{report.swot.threats.map((s, i) => <li key={i} className="text-xs text-slate-300 font-inter flex items-start gap-2"><span className="text-orange-400 mt-0.5">!</span>{s}</li>)}</ul>
              </div>
            </div>
          </div>
        )}

        {/* Competitors */}
        {report.competitorResults.length > 0 && (
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.35s' }}>
            <h3 className="font-sora font-bold text-white text-lg mb-4">Competitor Analysis</h3>
            <div className="space-y-2">
              {report.competitorResults.map(c => (
                <div key={c.name} className="flex items-center justify-between glass rounded-xl p-3 border border-white/5">
                  <span className="text-sm font-inter text-white">{c.name}</span>
                  {c.found ? <span className="text-xs text-accent-green font-inter flex items-center gap-1"><Check size={12} /> Website Active</span> : <span className="text-xs text-red-400/60 font-inter flex items-center gap-1"><AlertTriangle size={12} /> Not Found</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {report.insights.length > 0 && (
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-4"><Eye size={20} className="text-accent" /><h3 className="font-sora font-bold text-white text-lg">AI Insights</h3></div>
            <div className="space-y-2">
              {report.insights.map((insight, i) => (
                <div key={i} className="glass rounded-xl p-3 border border-white/5 flex items-start gap-3">
                  <Lightbulb size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-300 font-inter">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.45s' }}>
            <div className="flex items-center gap-2 mb-4"><Target size={20} className="text-accent" /><h3 className="font-sora font-bold text-white text-lg">Recommendations</h3></div>
            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="glass rounded-xl p-3 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs font-sora font-bold text-accent flex-shrink-0">{i + 1}</span>
                  <p className="text-xs text-slate-300 font-inter">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead Gen + Technologies */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="slide-in-up" style={{ animationDelay: '0.5s' }}>
            <LeadGenForm source="AI Assistant Report" service={report.serviceName}
              title="Get Your Custom Quote" subtitle="Based on your AI analysis, our team will prepare a detailed proposal. Share your details and we'll reach out within 24 hours." />
          </div>
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 slide-in-up" style={{ animationDelay: '0.55s' }}>
            <h3 className="font-sora font-bold text-white text-lg mb-4">Recommended Technologies</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {report.technologies.map(tech => (
                <span key={tech} className="px-3 py-1.5 rounded-full glass border border-accent/20 text-xs font-inter text-accent">{tech}</span>
              ))}
            </div>
            {report.selectedFeatures.length > 0 && (
              <>
                <h4 className="font-sora font-semibold text-white text-sm mb-3">Selected Features</h4>
                <div className="flex flex-wrap gap-2">
                  {report.selectedFeatures.map(feat => (
                    <span key={feat} className="px-3 py-1.5 rounded-full glass border border-white/10 text-xs font-inter text-slate-300">{feat}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Roadmap */}
        <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 slide-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sora font-bold text-white text-lg">Project Roadmap</h3>
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-accent/20">
              <Clock size={14} className="text-accent" /><span className="text-xs font-inter text-accent">{report.timeline} delivery</span>
            </div>
          </div>
          <div className="space-y-4">
            {report.roadmap.map((phase, i) => (
              <div key={phase.phase} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center font-sora font-bold text-white text-sm shadow-glow-accent">{i + 1}</div>
                  {i < report.roadmap.length - 1 && <div className="w-0.5 h-12 bg-gradient-to-b from-accent/50 to-transparent mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-sora font-semibold text-white text-sm">{phase.phase}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-inter">{phase.duration}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-inter">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 slide-in-up" style={{ animationDelay: '0.7s' }}>
          <button onClick={handleDownload} data-magnetic className="btn-glow px-4 py-3.5 rounded-xl font-poppins font-semibold text-white text-sm inline-flex items-center justify-center gap-2 magnetic"><Download size={16} /> Download</button>
          <button onClick={handleWhatsApp} data-magnetic className="glass border border-accent-green/30 px-4 py-3.5 rounded-xl font-poppins font-medium text-accent-green text-sm inline-flex items-center justify-center gap-2 hover:bg-accent-green/10 transition-all magnetic"><MessageCircle size={16} /> WhatsApp</button>
          <button onClick={handleEmail} data-magnetic className="glass border border-accent/30 px-4 py-3.5 rounded-xl font-poppins font-medium text-accent text-sm inline-flex items-center justify-center gap-2 hover:bg-accent/10 transition-all magnetic"><Mail size={16} /> Email</button>
          <button data-magnetic className="glass border border-highlight/30 px-4 py-3.5 rounded-xl font-poppins font-medium text-highlight text-sm inline-flex items-center justify-center gap-2 hover:bg-highlight/10 transition-all magnetic"><Calendar size={16} /> Book Meeting</button>
        </div>

        <div className="text-center mt-6">
          <button onClick={onReset} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-accent transition-colors font-inter"><RotateCcw size={14} /> Start New Consultation</button>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score, potentialScore }: { score: number; potentialScore: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const potentialOffset = circumference - (potentialScore / 100) * circumference;
  return (
    <div className="relative w-40 h-40">
      <svg className="score-ring w-full h-full" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="80" cy="80" r={radius + 6} fill="none" stroke="rgba(0, 255, 198, 0.3)" strokeWidth="2" strokeDasharray={circumference + 38} strokeDashoffset={potentialOffset + 38} strokeLinecap="round" className="score-ring-progress" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke="url(#scoreGradient)" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="score-ring-progress" />
        <defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00E5FF" /><stop offset="100%" stopColor="#6C63FF" /></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-sora font-black text-3xl gradient-text">{score}</div>
          <div className="text-[10px] text-slate-400 font-inter">/ 100</div>
        </div>
      </div>
    </div>
  );
}
