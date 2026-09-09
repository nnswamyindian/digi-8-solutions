import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, X, Send, MessageCircle, Ticket, CheckCircle, Loader2,
  TrendingUp, Compass, ArrowRight, RefreshCw, Phone
} from 'lucide-react';
import { saveLead, submitSupportTicket } from '../lib/api';

type DiagnosticData = {
  problem: string;
  diagnosis: string;
  comboTitle: string;
  services: string[];
  whyItWorks: string;
  phases: { phase: string; timeline: string; title: string; deliverables: string[] }[];
  ctaUrl?: string;
  ctaText?: string;
};

type Message = {
  role: 'ai' | 'user';
  text: string;
  diagnostic?: DiagnosticData;
  options?: { label: string; action: string }[];
};

const scenarios: Record<string, {
  intro: string;
  diagnostic: DiagnosticData;
  followUpOptions: { label: string; action: string }[];
}> = {
  'scenario_startup': {
    intro: "Here is the architectural assessment for an early-stage startup or new product launch:",
    diagnostic: {
      problem: "New Startup / MVP Launch (Zero to One)",
      diagnosis: "Founders frequently waste months and burn capital coordinating disjointed freelancers for legal, branding, web/app, and marketing. Unaligned branding, unscalable code, and delayed MCA registration stall growth.",
      comboTitle: "Turnkey Founder Launchpad Suite",
      services: [
        "Business Registration & MCA Formation (Pvt Ltd / LLP + GST)",
        "Branding & 3D Logo Identity Suite (Guidelines, Pitch Deck, Stationery)",
        "Technology Infrastructure (Scalable Web / Mobile MVP in Flutter/Next.js)",
        "Go-to-Market Paid Acquisition & SEO Funnel (Meta & Google Search Ads)"
      ],
      whyItWorks: "All 4 critical pillars—legal protection, investor-ready brand design, production-grade MVP software, and customer acquisition—are built concurrently in a single sprint.",
      phases: [
        { phase: "Phase 1", timeline: "Weeks 1–2", title: "Inception & Legal Formation", deliverables: ["MCA Incorporation & GST", "Vector Logo & Brand Identity Book", "System Architecture Specs"] },
        { phase: "Phase 2", timeline: "Weeks 3–5", title: "MVP Engineering & Database", deliverables: ["Next.js / Flutter App MVP", "Auth & Stripe/Razorpay Payments", "Cloud Database & Security Rules"] },
        { phase: "Phase 3", timeline: "Weeks 6–7", title: "Audit, Launch & GTM Traction", deliverables: ["VAPT Security Clearance", "Production Store Deploy", "Paid Acquisition Ad Launch"] }
      ],
      ctaUrl: "/quote-calculator",
      ctaText: "Calculate Startup MVP Estimate →"
    },
    followUpOptions: [
      { label: "🧮 Calculate Exact Budget", action: "quote" },
      { label: "📱 Focus on Mobile App MVP", action: "scenario_mobile" },
      { label: "📞 Connect with Lead Architect", action: "human" },
      { label: "🔄 Explore Other Scenarios", action: "start" }
    ]
  },

  'scenario_leads': {
    intro: "Here is the performance growth diagnosis for scaling high-ticket client acquisition:",
    diagnostic: {
      problem: "Inconsistent Lead Pipeline & Low Client Conversion",
      diagnosis: "Relying on manual networking or passive word-of-mouth creates unpredictable revenue. Without a dedicated high-converting landing page, targeted intent PPC, and automated CRM follow-up, 80% of interested prospects bounce.",
      comboTitle: "B2B High-Velocity Client Acquisition Engine",
      services: [
        "High-Converting Landing Funnel Architecture (Next.js with Speed Optimization)",
        "Search Engine Optimization (SEO) & Google Ads B2B Intent PPC",
        "Meta & LinkedIn Sponsored Thought Leadership Campaigns",
        "Automated CRM Lead Pipeline & WhatsApp Notification APIs"
      ],
      whyItWorks: "Converts qualified search intent into booked discovery calls, while automated WhatsApp/Email workflows nurture leads instantly before competitors respond.",
      phases: [
        { phase: "Phase 1", timeline: "Weeks 1–2", title: "Target Audience & Funnel Audit", deliverables: ["Buyer Persona & Keyword Matrix", "Competitor Ad Gap Analysis", "High-Converting Wireframes"] },
        { phase: "Phase 2", timeline: "Weeks 3–4", title: "Funnel Build & Tracking Setup", deliverables: ["Conversion-Optimized Landing Page", "Google Analytics 4 & Meta CAPI", "CRM & WhatsApp Lead Routing"] },
        { phase: "Phase 3", timeline: "Weeks 5+", title: "Live Media Spend & Scaling", deliverables: ["Google Ads & LinkedIn Campaigns", "A/B Multivariate Headline Tests", "Weekly ROAS & Lead Reports"] }
      ],
      ctaUrl: "/services/digital-marketing-growth",
      ctaText: "Explore Digital Marketing Division →"
    },
    followUpOptions: [
      { label: "🧮 Estimate Marketing Package", action: "quote" },
      { label: "💻 Rebuild Landing Website", action: "web" },
      { label: "📞 Book 15-Min Strategy Call", action: "meeting" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  },

  'scenario_mobile': {
    intro: "Here is the mobile engineering diagnosis for cross-platform app delivery:",
    diagnostic: {
      problem: "Custom Mobile App Development (iOS & Android)",
      diagnosis: "Maintaining separate native iOS and Android codebases doubles engineering costs and causes feature desync. Modern applications require unified cross-platform architecture, biometric security, and offline syncing.",
      comboTitle: "Cross-Platform Enterprise Mobility Suite",
      services: [
        "Cross-Platform Flutter & React Native Engineering",
        "Cloud Microservices API & Real-time Database Sync (Node.js/PostgreSQL)",
        "Cybersecurity VAPT Mobile App Hardening (OWASP Mobile Top 10)",
        "Guaranteed App Store & Google Play Approval Operations"
      ],
      whyItWorks: "Single unified codebase saves up to 40% in development and ongoing maintenance costs while delivering 60 FPS native performance on both iPhone and Android devices.",
      phases: [
        { phase: "Phase 1", timeline: "Weeks 1–2", title: "Product Blueprint & UI/UX Design", deliverables: ["Interactive Figma Clickable Prototype", "REST API Data Contracts", "Cloud Architecture Blueprint"] },
        { phase: "Phase 2", timeline: "Weeks 3–6", title: "Core App & Backend Build", deliverables: ["Flutter iOS/Android App", "Push Notifications & Biometrics", "Payment Gateway & Offline Cache"] },
        { phase: "Phase 3", timeline: "Weeks 7–8", title: "Pen-Testing & Store Release", deliverables: ["Mobile VAPT Security Audit", "Apple TestFlight & Google Beta", "Production App Store Launch"] }
      ],
      ctaUrl: "/quote-calculator",
      ctaText: "Calculate Mobile App Cost →"
    },
    followUpOptions: [
      { label: "🧮 Calculate Mobile Budget", action: "quote" },
      { label: "🛡️ Check Security & VAPT Needs", action: "scenario_security" },
      { label: "📞 Talk to Mobile Engineer", action: "human" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  },

  'scenario_security': {
    intro: "Here is the cybersecurity posture evaluation and compliance roadmap:",
    diagnostic: {
      problem: "Vulnerabilities, Data Leaks & Regulatory Non-Compliance",
      diagnosis: "Unprotected REST APIs, legacy server misconfigurations, and lack of third-party security certifications leave organizations exposed to ransomware, breach liability, and customer trust loss.",
      comboTitle: "Zero-Trust Cyber Defense & ISO/SOC2 Compliance Shield",
      services: [
        "Vulnerability Assessment & Penetration Testing (VAPT)",
        "ISO 27001 & SOC 2 Type II Compliance Readiness Audit",
        "Cloud Infrastructure Hardening (AWS/GCP/VPS Firewall Rules)",
        "Emergency Incident Response & 24/7 Security Operations SLA"
      ],
      whyItWorks: "Provides objective third-party verification that satisfies enterprise procurement teams, banking partners, and government regulatory bodies.",
      phases: [
        { phase: "Phase 1", timeline: "Week 1", title: "Blackbox & Whitebox Assessment", deliverables: ["Automated Port & Attack Surface Scan", "Manual Penetration Exploitation", "Vulnerability Severity Matrix"] },
        { phase: "Phase 2", timeline: "Weeks 2–3", title: "Remediation & Cloud Hardening", deliverables: ["Step-by-step Patching Guides", "IAM Permission Hardening", "WAF & DDoS Rule Deployment"] },
        { phase: "Phase 3", timeline: "Week 4", title: "Verification & Official Certification", deliverables: ["Re-test of All Exploits", "Official VAPT Clearance Certificate", "Executive ISO Audit Dossier"] }
      ],
      ctaUrl: "/services/cyber-security-cloud",
      ctaText: "View Cyber Security Division →"
    },
    followUpOptions: [
      { label: "🧮 Estimate Security Audit", action: "quote" },
      { label: "🏢 Business Legal Registration", action: "scenario_compliance" },
      { label: "📞 Connect with Security Officer", action: "human" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  },

  'scenario_ai': {
    intro: "Here is the enterprise AI integration and workflow automation roadmap:",
    diagnostic: {
      problem: "Manual Operational Bottlenecks & Outdated Workforce Workflows",
      diagnosis: "Businesses lose countless hours every week to manual data entry, slow customer query handling, and repetitive report writing that modern generative AI tools can automate in seconds.",
      comboTitle: "GenAI Enterprise Modernization & Workflow Automation",
      services: [
        "Corporate AI Training & Generative AI Workforce Up-skilling",
        "Custom AI Chatbots & RAG Internal Knowledge Base Copilots",
        "Automated Business Workflows (Make/Zapier/Custom API Pipelines)",
        "Data Analytics & Real-Time Operational Dashboards"
      ],
      whyItWorks: "Elevates team output by 3x–5x while giving your customers 24/7 instant AI support that understands your company's proprietary service catalog.",
      phases: [
        { phase: "Phase 1", timeline: "Weeks 1–2", title: "Workflow & Data Discovery", deliverables: ["Repetitive Task Opportunity Matrix", "Data Readiness & Privacy Review", "Architecture Scope of Copilot"] },
        { phase: "Phase 2", timeline: "Weeks 3–4", title: "Custom AI Model / RAG Prototype", deliverables: ["Company Knowledge Vector Embeddings", "AI Chatbot Prototype with Guardrails", "Internal Testing & Feedback"] },
        { phase: "Phase 3", timeline: "Weeks 5–6", title: "Team Workshops & Production Deploy", deliverables: ["Hands-On GenAI Workforce Workshops", "Production API Integration", "Analytics & Token Optimization"] }
      ],
      ctaUrl: "/services/ai-training",
      ctaText: "View AI Training Solutions →"
    },
    followUpOptions: [
      { label: "🧮 Calculate AI Project Cost", action: "quote" },
      { label: "💻 Build Custom Software/Portal", action: "web" },
      { label: "📞 Speak with AI Architect", action: "human" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  },

  'scenario_compliance': {
    intro: "Here is the statutory legal inception and trademark roadmap:",
    diagnostic: {
      problem: "Company Registration, Licensing & Trademark Protection",
      diagnosis: "Starting or expanding a business without proper legal incorporation, trademark registration, and statutory filings exposes founders to personal liability and IP theft.",
      comboTitle: "Statutory Legal Armor & Business Inception",
      services: [
        "Private Limited / LLP / OPC Business Incorporation (MCA)",
        "GST, MSME Udyam & Professional Tax Registrations",
        "Trademark Brand Name & Logo Filing (Class Protection)",
        "Annual Statutory ROC Filing & Accounting Compliance"
      ],
      whyItWorks: "Guarantees 100% statutory compliance from day one, opening doors to corporate bank accounts, government subsidies, and venture capital funding.",
      phases: [
        { phase: "Phase 1", timeline: "Days 1–3", title: "Name Search & Digital Signatures", deliverables: ["MCA RUN Name Approval", "Class-3 DSC Issuance", "DIN Director Identification Numbers"] },
        { phase: "Phase 2", timeline: "Days 4–10", title: "SPICe+ Incorporation & MOA/AOA", deliverables: ["Certificate of Incorporation (COI)", "Company PAN & TAN Allocation", "Corporate Bank Account Resolution"] },
        { phase: "Phase 3", timeline: "Days 11–15", title: "Tax & Trademark Registrations", deliverables: ["GST Number & MSME Udyam Certificate", "Trademark Application (TM Symbol)", "Annual Compliance Roadmap"] }
      ],
      ctaUrl: "/services/business-registration",
      ctaText: "View Legal Compliance Services →"
    },
    followUpOptions: [
      { label: "🎨 Add Branding & Logo Suite", action: "branding_quote" },
      { label: "💻 Add Website Development", action: "web" },
      { label: "📞 Connect with Legal Consultant", action: "human" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  },

  'scenario_staffing': {
    intro: "Here is the on-demand engineering extension plan for scaling teams:",
    diagnostic: {
      problem: "Engineering Talent Shortage & Long Hiring Cycles",
      diagnosis: "Recruiting senior full-stack developers in-house takes 60–90 days, carries recruiter commissions, and risks mis-hires. Scaling demands pre-vetted engineers ready to ship code on Day 1.",
      comboTitle: "Elite Fractional Engineering & Workforce Extension",
      services: [
        "Dedicated Full-Stack Developers (React, Next.js, Node, Python, Flutter)",
        "Fractional CTO & Enterprise Cloud Solution Architecture",
        "UI/UX Product Designers & Figma Design Systems",
        "Agile Scrum Master & Quality Assurance (QA) Engineers"
      ],
      whyItWorks: "Zero recruitment overhead, flexible monthly contracts, and direct integration into your Slack/Jira channels within 48 to 72 hours.",
      phases: [
        { phase: "Phase 1", timeline: "48 Hours", title: "Skill Profiling & Developer Match", deliverables: ["Technical Requirement Matrix", "Curated Senior Engineer Profiles", "Direct Technical Video Interviews"] },
        { phase: "Phase 2", timeline: "Days 3–5", title: "Repo Onboarding & Tooling", deliverables: ["GitHub/GitLab Access & Secrets Setup", "Sprint Backlog Grooming", "First PR Committed to Repo"] },
        { phase: "Phase 3", timeline: "Week 2+", title: "Full Velocity Agile Execution", deliverables: ["Daily Standups & Weekly Demos", "Production Code Delivery", "Continuous Architecture Reviews"] }
      ],
      ctaUrl: "/services/workforce-support",
      ctaText: "View Workforce Support Division →"
    },
    followUpOptions: [
      { label: "🧮 Estimate Monthly Staffing", action: "quote" },
      { label: "🛡️ Cyber Security & Audit", action: "scenario_security" },
      { label: "📞 Schedule Developer Interview", action: "human" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  },

  'scenario_gifting': {
    intro: "Here is the executive brand merchandise and corporate gifting plan:",
    diagnostic: {
      problem: "Employee Onboarding & VIP Client Relationship Building",
      diagnosis: "Cheap, generic promotional items fail to leave an impression and dilute brand equity. Premium companies require bespoke laser-engraved merchandise and luxury unboxing experiences.",
      comboTitle: "Corporate Identity & Executive Gifting Suite",
      services: [
        "Customized Executive Welcome Kits & Onboarding Boxes",
        "Laser-Engraved Metal Tech Accessories (Powerbanks, Bottles, Mugs)",
        "High-Definition Digital & Offset Stationery Printing",
        "Turnkey Drop-Shipping & Global Warehousing"
      ],
      whyItWorks: "Elevates employee pride and builds immediate goodwill with enterprise clients through tangible, premium physical brand touchpoints.",
      phases: [
        { phase: "Phase 1", timeline: "Days 1–3", title: "Curated Box Selection & Design", deliverables: ["Product Catalog Curation", "3D Digital Logo Mockups", "Rigid Box Artwork Proofing"] },
        { phase: "Phase 2", timeline: "Days 4–8", title: "Sample Production & Approval", deliverables: ["Physical Laser Sample Crafting", "Client Video/Photo Approval", "Mass Production Run"] },
        { phase: "Phase 3", timeline: "Days 9–14", title: "Packaging & Dispatch", deliverables: ["Custom Ribbon & Foam Inlays", "Individual Pan-India Courier Dispatch", "Tracking Dashboard Handoff"] }
      ],
      ctaUrl: "/services/customized-gifting",
      ctaText: "View Corporate Gifting Division →"
    },
    followUpOptions: [
      { label: "🎨 View Branding & Design", action: "branding_quote" },
      { label: "🧮 Calculate Bulk Merchandise Cost", action: "quote" },
      { label: "📞 Speak with Merch Manager", action: "human" },
      { label: "🔄 Back to Menu", action: "start" }
    ]
  }
};

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    user_name: '',
    user_email: '',
    service_category: 'Technology & Digital Infrastructure',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping, showTicketForm]);

  const initialGreeting = () => {
    return {
      role: 'ai' as const,
      text: "👋 Welcome to Digi-8 Solutions! I am your AI Solution Architect. Rather than giving one-size-fits-all answers, I analyze your unique business problem, recommend synergistic service combos across our 8 corporate divisions, and map out a realistic phased execution roadmap.",
      options: [
        { label: "🚀 New Startup / MVP Launch", action: "scenario_startup" },
        { label: "📈 Need More High-Ticket Leads", action: "scenario_leads" },
        { label: "📱 Build Mobile App (iOS / Android)", action: "scenario_mobile" },
        { label: "🛡️ Cyber Security VAPT Audit", action: "scenario_security" },
        { label: "🤖 Enterprise AI & Automations", action: "scenario_ai" },
        { label: "🏢 Register Company (Pvt Ltd / GST)", action: "scenario_compliance" },
        { label: "👥 Dedicated Developers / Staffing", action: "scenario_staffing" },
        { label: "🎁 Executive Gifting & Printing", action: "scenario_gifting" },
        { label: "🎫 Raise Official Support Ticket", action: "ticket_form" },
        { label: "🧮 Interactive Quote Calculator", action: "quote" }
      ]
    };
  };

  const openChat = () => {
    setOpen(true);
    if (!hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        setMessages([initialGreeting()]);
      }, 300);
    }
  };

  const handleOption = (action: string) => {
    if (action === 'ticket_form') {
      setShowTicketForm(true);
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '🎫 Raise Support Ticket' },
        { role: 'ai', text: 'Please fill out the details below. Our Support & Operations Desk will be notified immediately:' }
      ]);
      return;
    }

    if (action === 'start') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '🔄 Restart Diagnostic Consultation' },
        initialGreeting()
      ]);
      return;
    }

    if (action === 'quote') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '🧮 Calculate Estimated Project Investment' },
        {
          role: 'ai',
          text: "You can calculate instant custom estimates across all our 8 divisions using our interactive proposal calculator!",
          options: [
            { label: "Open Quote Calculator", action: "open_calc" },
            { label: "Talk with Solution Architect", action: "human" },
            { label: "Back to Diagnostic Menu", action: "start" }
          ]
        }
      ]);
      return;
    }

    if (action === 'open_calc') {
      window.location.href = '/quote-calculator';
      return;
    }

    if (action === 'meeting') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '📞 Schedule Strategy Consultation' },
        {
          role: 'ai',
          text: "We'd love to connect! You can reach our senior solution architect directly at +91 9000207739 (Phone / WhatsApp) or email hello@digi8solutions.com. Or simply type your phone number / email here and we will reach out within 2 hours.",
          options: [
            { label: "Back to Diagnostic Menu", action: "start" }
          ]
        }
      ]);
      return;
    }

    if (action === 'human') {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: '👤 Talk to Senior Solution Architect' },
        {
          role: 'ai',
          text: "Connecting you with our leadership desk. Please leave your email or phone number here, or reach us at +91 9000207739 (Mon-Sat 9 AM - 7 PM IST). What is the best way to reach you?",
          options: [
            { label: "Back to Diagnostic Menu", action: "start" }
          ]
        }
      ]);
      return;
    }

    // Check pre-configured scenarios
    const scenario = scenarios[action];
    if (scenario) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: scenario.diagnostic.problem },
      ]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: scenario.intro,
            diagnostic: scenario.diagnostic,
            options: scenario.followUpOptions
          }
        ]);
      }, 700);
      return;
    }

    // Default fallback
    setMessages(prev => [
      ...prev,
      { role: 'user', text: action },
      {
        role: 'ai',
        text: "Tell me more about your business challenge, or pick one of the diagnostic scenarios below:",
        options: initialGreeting().options
      }
    ]);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    const res = await submitSupportTicket(ticketData);
    setSubmittingTicket(false);
    setShowTicketForm(false);

    if (res.success && res.data) {
      const tNum = res.data.ticket_number || 'TICK-NEW';
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: `🎉 Support Ticket #${tNum} created successfully! Our engineering desk has received your ticket and will follow up with ${ticketData.user_email} shortly.`,
          options: [{ label: 'Back to Diagnostic Hub', action: 'start' }]
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: 'Ticket created and sent to our support desk! We will reach out shortly.',
          options: [{ label: 'Back to Diagnostic Hub', action: 'start' }]
        }
      ]);
    }

    setTicketData({
      user_name: '',
      user_email: '',
      service_category: 'Technology & Digital Infrastructure',
      subject: '',
      description: '',
      priority: 'medium'
    });
  };

  // Natural Language Understanding Engine
  const analyzeUserInput = (rawText: string) => {
    const text = rawText.toLowerCase();

    // Check for leads (email / phone number)
    if (text.includes('@') || text.match(/\d{10}/)) {
      saveLead({
        name: 'AI Diagnostic User',
        email: text.includes('@') ? rawText : 'lead@chat.digi8',
        service: 'Consultative Chat Session',
        source: 'AI Solution Architect Chat',
        message: rawText,
      }).catch(() => {});
    }

    // Keyword & Semantic Matching
    if (text.includes('start') && (text.includes('new') || text.includes('company') || text.includes('idea') || text.includes('found'))) {
      return scenarios.scenario_startup;
    }
    if (text.includes('lead') || text.includes('sale') || text.includes('client') || text.includes('customer') || text.includes('traffic') || text.includes('market') || text.includes('seo') || text.includes('ads')) {
      return scenarios.scenario_leads;
    }
    if (text.includes('app') || text.includes('mobile') || text.includes('flutter') || text.includes('ios') || text.includes('android')) {
      return scenarios.scenario_mobile;
    }
    if (text.includes('security') || text.includes('hack') || text.includes('vapt') || text.includes('audit') || text.includes('iso') || text.includes('soc') || text.includes('compliance')) {
      return scenarios.scenario_security;
    }
    if (text.includes('ai') || text.includes('chatgpt') || text.includes('automate') || text.includes('bot') || text.includes('workflow') || text.includes('machine learning')) {
      return scenarios.scenario_ai;
    }
    if (text.includes('register') || text.includes('pvt') || text.includes('llp') || text.includes('trademark') || text.includes('gst') || text.includes('legal')) {
      return scenarios.scenario_compliance;
    }
    if (text.includes('hire') || text.includes('developer') || text.includes('engineer') || text.includes('staff') || text.includes('cto') || text.includes('team')) {
      return scenarios.scenario_staffing;
    }
    if (text.includes('gift') || text.includes('merch') || text.includes('print') || text.includes('swag') || text.includes('box') || text.includes('bottle')) {
      return scenarios.scenario_gifting;
    }

    // Dynamic tailored synthesis for arbitrary scenarios
    return {
      intro: `Thank you for sharing your scenario: "${rawText}". Here is my tailored consultative analysis:`,
      diagnostic: {
        problem: `Custom Business Scenario: ${rawText.slice(0, 50)}...`,
        diagnosis: "To solve this challenge reliably, piecemeal one-off solutions will fall short. We recommend a unified, multi-division transformation combining strategic branding, scalable technology, and high-intent acquisition.",
        comboTitle: "Enterprise Digital Acceleration Combo",
        services: [
          "Technology & Digital Infrastructure (Web/Mobile Custom Solution)",
          "Branding & User Experience Strategy",
          "Digital Marketing & Automated Lead Funnel",
          "Post-Launch Technical Maintenance & Security Governance"
        ],
        whyItWorks: "Unifies the technical execution, brand trustworthiness, and customer acquisition pipeline under a single SLA with measurable milestone accountability.",
        phases: [
          { phase: "Phase 1", timeline: "Weeks 1–2", title: "Discovery & Blueprint", deliverables: ["Technical Specs & Scope", "UI/UX Figma Architecture", "API Integration Contracts"] },
          { phase: "Phase 2", timeline: "Weeks 3–5", title: "Custom Engineering & Integration", deliverables: ["Core Functional Codebase", "Database & Cloud VPS Deploy", "QA & Cross-Device Testing"] },
          { phase: "Phase 3", timeline: "Weeks 6+", title: "Live Launch & Traction Scale", deliverables: ["Production Deployment", "Growth Acquisition Setup", "Continuous Monitoring SLA"] }
        ],
        ctaUrl: "/quote-calculator",
        ctaText: "Calculate Custom Project Cost →"
      },
      followUpOptions: [
        { label: "🧮 Estimate Investment in Calculator", action: "quote" },
        { label: "📞 Speak with Lead Architect (+91 9000207739)", action: "human" },
        { label: "🔄 View Standard Scenarios", action: "start" }
      ]
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const analysis = analyzeUserInput(userText);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: analysis.intro,
          diagnostic: analysis.diagnostic,
          options: analysis.followUpOptions
        }
      ]);
    }, 900);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!open && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer border border-cyan-300/40"
          aria-label="Open Digi-8 AI Solution Architect"
        >
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping opacity-30" />
          <MessageCircle size={26} className="text-slate-950 group-hover:scale-110 transition-transform fill-slate-950/20" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-950 shadow-md">
            AI
          </span>
        </button>
      )}

      {/* Main Chat Assistant Modal Panel */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <Compass size={20} className="text-slate-950" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  Digi-8 AI Solution Architect
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">Agent</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-inter">Active Business Diagnostic & Roadmap Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([initialGreeting()])}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Restart Session"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conversation Body */}
          <div ref={chatRef} className="flex-1 overflow-y-auto chat-scroll p-3.5 sm:p-4 space-y-3.5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] rounded-2xl p-3 sm:p-3.5 slide-in-up ${
                    msg.role === 'ai' ? 'ai-bubble rounded-tl-sm' : 'user-bubble rounded-tr-sm'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={11} className="text-brand-cyan" />
                      <span className="text-[10px] text-brand-cyan font-bold tracking-wide">SOLUTION ARCHITECT AGENT</span>
                    </div>
                  )}

                  <p className={`text-xs font-inter leading-relaxed ${msg.role === 'ai' ? 'text-slate-200' : 'text-white'}`}>
                    {msg.text}
                  </p>

                  {/* Rich Diagnostic Card & Roadmap Output */}
                  {msg.diagnostic && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-brand-cyan/30 text-xs space-y-3 font-inter shadow-xl">
                      {/* Problem & Diagnosis */}
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[10px] uppercase tracking-wider mb-1">
                          <Sparkles size={12} /> Bottleneck Analysis
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {msg.diagnostic.diagnosis}
                        </p>
                      </div>

                      {/* Recommended Service Combo */}
                      <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/25">
                        <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                          Recommended Service Combo
                        </div>
                        <div className="text-sm font-outfit font-bold text-white mt-0.5">
                          {msg.diagnostic.comboTitle}
                        </div>
                        <ul className="mt-2 space-y-1">
                          {msg.diagnostic.services.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 pt-2 border-t border-cyan-500/20 text-[10px] text-cyan-300 font-inter italic">
                          💡 <strong>Synergy:</strong> {msg.diagnostic.whyItWorks}
                        </div>
                      </div>

                      {/* Phased Execution Roadmap */}
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[10px] uppercase tracking-wider mb-2">
                          <TrendingUp size={12} /> Phased Execution Roadmap
                        </div>
                        <div className="space-y-2.5 border-l-2 border-emerald-500/30 pl-3 ml-1">
                          {msg.diagnostic.phases.map((p, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-white">{p.phase}: {p.title}</span>
                                <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                  {p.timeline}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                                {p.deliverables.join(' • ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action CTA */}
                      {msg.diagnostic.ctaUrl && (
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          <a
                            href={msg.diagnostic.ctaUrl}
                            className="flex-1 py-2 px-3 text-center bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>{msg.diagnostic.ctaText || 'Calculate Project Cost →'}</span>
                            <ArrowRight size={13} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Diagnostic Chips / Options */}
                  {msg.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.options.map(opt => (
                        <button
                          key={opt.action}
                          onClick={() => handleOption(opt.action)}
                          className="text-[10px] px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-slate-950 font-medium transition-all text-left flex items-center gap-1"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Support Ticket Modal Form */}
            {showTicketForm && (
              <form onSubmit={handleTicketSubmit} className="p-3.5 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl space-y-2.5 my-2">
                <div className="flex items-center gap-2 text-brand-cyan font-bold text-xs">
                  <Ticket size={14} /> Raise Official Support Ticket
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-cyan"
                    value={ticketData.user_name}
                    onChange={e => setTicketData({ ...ticketData, user_name: e.target.value })}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Official Email Address *"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-cyan"
                    value={ticketData.user_email}
                    onChange={e => setTicketData({ ...ticketData, user_email: e.target.value })}
                  />
                </div>
                <div>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-cyan"
                    value={ticketData.service_category}
                    onChange={e => setTicketData({ ...ticketData, service_category: e.target.value })}
                  >
                    <option value="Technology & Digital Infrastructure">Technology & Web/Mobile App Support</option>
                    <option value="Branding & Business Identity">Branding & Logo Identity</option>
                    <option value="Cyber Security & Cloud">Cyber Security & VAPT Audit</option>
                    <option value="Digital Marketing & Growth">Digital Marketing & SEO</option>
                    <option value="Business Registration">Business Registration & Legal</option>
                    <option value="Corporate AI Training">Corporate AI Training</option>
                    <option value="General Support">Other Corporate Query</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Subject / Summary *"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-cyan"
                    value={ticketData.subject}
                    onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe your issue or technical requirement..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-cyan resize-none"
                    value={ticketData.description}
                    onChange={e => setTicketData({ ...ticketData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTicketForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="btn-glow px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    {submittingTicket ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="ai-bubble rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] text-cyan-300 font-mono">Analyzing business scenario & roadmap...</span>
                </div>
              </div>
            )}
          </div>

          {/* User Input & Action Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Describe your business problem or requirement..."
                className="form-input flex-1 px-3 py-2.5 rounded-xl text-xs font-inter bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-brand-cyan outline-none"
              />
              <button
                onClick={handleSend}
                className="btn-glow px-3.5 py-2.5 rounded-xl flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500 font-inter px-1">
              <span>Digi-8 Enterprise Solution Architect</span>
              <a href="tel:+919000207739" className="text-cyan-400 hover:underline flex items-center gap-1">
                <Phone size={10} /> +91 9000207739
              </a>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
