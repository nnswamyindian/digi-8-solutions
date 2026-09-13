import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import pool, { initDb, checkDatabaseHealth, loadPersistentStore, savePersistentStore } from './db.js';
import {
  sendInstantReply,
  sendVerificationEmail,
  sendAdminNotification,
  sendPasswordResetEmail,
  sendCandidateApplicationReceived,
  sendAdminCareerNotification,
  compileEmailTemplate,
  sendRecruiterEmail,
  sendAdminOtpEmail,
  verifySmtpConnection,
  getAdminEmail
} from './emailService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB
initDb().catch(console.error);

// Verify SMTP Connection on server start
verifySmtpConnection().catch(console.error);

// Helper for sending responses
const sendSuccess = (res: express.Response, data: any = null, message = 'Success') => {
  res.json({ success: true, message, data });
};

const sendError = (res: express.Response, error: any, status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, error: error.message || 'Server error' });
};

// --- ROUTES ---

// Offline / Mock Data Store
const mockLeads: any[] = [];
const mockContacts: any[] = [];
const mockQuotes: any[] = [];
const mockSubscribers: any[] = [];
const mockTickets: any[] = [];

const initialMockProjects = [
  {
    id: 1,
    title: 'AuraMed Cloud — Telehealth & Hospital EHR Portal',
    client: 'Aura Healthcare Global',
    category: 'Technology & Digital Infrastructure',
    description: 'Architected an HL7/FHIR compliant hospital management system and patient portal handling 150,000+ digital health records, automated doctor slot booking, and end-to-end encrypted WebRTC video consultations.',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://auramed-health.example.com',
    tech_stack: ['Next.js 14', 'Node.js', 'PostgreSQL', 'WebRTC', 'AWS ECS', 'TailwindCSS'],
    results: { 'Active Patients': '150K+', 'API Latency': '< 450ms', 'Uptime SLA': '99.99%' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 30 * 86400000)
  },
  {
    id: 2,
    title: 'SwiftLogistics Fleet Mobile App & Dispatch Hub',
    client: 'Swift Logistics India Ltd',
    category: 'Technology & Digital Infrastructure',
    description: 'Engineered a real-time cross-platform Flutter mobile app for 2,500+ commercial fleet drivers featuring turn-by-turn route optimization, offline QR barcode package scanning, and biometric digital proof of delivery.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://swiftlogistics.example.com',
    tech_stack: ['Flutter', 'Dart', 'Google Maps API', 'Firebase Realtime', 'Node.js', 'PostgreSQL'],
    results: { 'Fleet Drivers': '2,500+', 'Fuel Savings': '22%', 'Trip Efficiency': '+38%' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 25 * 86400000)
  },
  {
    id: 3,
    title: 'ShieldFortress — FinTech VAPT Audit & Zero-Trust Cloud',
    client: 'Fortis Capital & Payments',
    category: 'Cyber Security & Cloud Infrastructure',
    description: 'Conducted comprehensive grey-box & black-box Vulnerability Assessment and Penetration Testing (VAPT) across cloud banking microservices, remediating critical attack vectors and securing SOC 2 Type II & ISO 27001 readiness.',
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://shieldfortress.example.com',
    tech_stack: ['OWASP Top 10', 'Burp Suite Pro', 'AWS Security Hub', 'Wazuh SIEM', 'Docker', 'Kubernetes'],
    results: { 'Vulnerabilities Fixed': '100%', 'Breach Incidents': 'Zero', 'Certification': 'ISO 27001 / SOC 2' },
    featured: true,
    year: '2025',
    created_at: new Date(Date.now() - 40 * 86400000)
  },
  {
    id: 4,
    title: 'Nexura Automation — 3D Corporate Brand Identity',
    client: 'Nexura Robotics Pvt Ltd',
    category: 'Branding & Business Identity Solutions',
    description: 'Developed a futuristic brand identity for an industrial robotics pioneer, including dynamic 3D geometric logo, typographic design system, investor pitch deck, premium corporate stationery, and full brand guideline book.',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://nexura-robotics.example.com',
    tech_stack: ['Figma', 'Cinema 4D', 'Adobe Illustrator', 'Brand Manual', 'Print Systems'],
    results: { 'Seed Round Raised': '$3.2M', 'Brand Recall': '+85%', 'Guidelines': '72 Pages' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 20 * 86400000)
  },
  {
    id: 5,
    title: 'Kalyan Luxury Retail — 4.8x ROAS B2B & D2C Growth Engine',
    client: 'Kalyan Luxury Retail',
    category: 'Digital Marketing & Business Growth',
    description: 'Executed a multi-channel digital performance marketing strategy combining high-intent Google Search & Shopping ads, Meta Lookalike audience targeting, and technical e-commerce SEO, achieving a record 4.8x Return on Ad Spend.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://kalyanluxury.example.com',
    tech_stack: ['Google Ads', 'Meta Ads Manager', 'GA4', 'Meta CAPI', 'Technical SEO', 'Klaviyo'],
    results: { 'ROAS Achieved': '4.8x', 'Organic Traffic': '+210%', 'Monthly Leads': '3,400+' },
    featured: true,
    year: '2025',
    created_at: new Date(Date.now() - 45 * 86400000)
  },
  {
    id: 6,
    title: 'FinVenture Capital — Turnkey MCA Formation & Legal Shield',
    client: 'FinVenture Capital Advisors',
    category: 'Business Registration & Legal Compliance',
    description: 'Completed end-to-end statutory company formation, Spice+ MCA filing, DPIIT Startup India certification, multi-class registered trademark (Classes 35 & 36), and corporate governance bylaws within 12 business days.',
    thumbnail_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://finventure.example.com',
    tech_stack: ['MCA Spice+ Portal', 'DPIIT Startup India', 'IP India Trademarks', 'GST Portal', 'ROC Compliance'],
    results: { 'Turnaround Time': '12 Days', 'Tax Exemption': '3 Years', 'Trademark Granted': 'Classes 35 & 36' },
    featured: false,
    year: '2026',
    created_at: new Date(Date.now() - 15 * 86400000)
  },
  {
    id: 7,
    title: 'CogniFlow — Enterprise GenAI Workshops & RAG Bot',
    client: 'CogniFlow Financial Services',
    category: 'AI, Corporate Training & Transformation',
    description: 'Conducted a 4-week executive and engineering corporate training program on Generative AI, prompt engineering, and built an internal RAG knowledge-retrieval AI assistant that reduced support resolution time by 82%.',
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://cogniflow-ai.example.com',
    tech_stack: ['LangChain', 'OpenAI GPT-4', 'Python FastAPI', 'pgvector', 'Next.js', 'Docker'],
    results: { 'Staff Trained': '320+', 'Support Speedup': '82%', 'Automated Answers': '94%' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 10 * 86400000)
  },
  {
    id: 8,
    title: 'Veritas Global — Bespoke VIP Onboarding & Swag Boxes',
    client: 'Veritas Global Technologies',
    category: 'Customized & Corporate Gifting',
    description: 'Designed and produced 1,200 curated luxury employee onboarding gift hampers powered by Anuragini, featuring laser-engraved vacuum flasks, vegan leather bound journals, wireless charging pads, and smart digital NFC business cards.',
    thumbnail_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://veritas-gifting.example.com',
    tech_stack: ['Laser Engraving', 'Rigid Box Fabrication', 'UV Printing', 'NFC Encoding', 'Apparel Screenprint'],
    results: { 'Kits Delivered': '1,200 Units', 'Retention Rate': '+40%', 'Quality Rating': '99.4%' },
    featured: false,
    year: '2025',
    created_at: new Date(Date.now() - 50 * 86400000)
  },
  {
    id: 9,
    title: 'Apex Digital — Dedicated Full-Stack & DevOps Pod',
    client: 'Apex Global Systems',
    category: 'Workforce & Business Support',
    description: 'Deployed a dedicated agile engineering pod consisting of 6 senior React/Node engineers, 1 QA automation engineer, and 1 AWS DevOps specialist, accelerating time-to-market for a mission-critical B2B SaaS platform.',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://apex-digital.example.com',
    tech_stack: ['Staff Augmentation', 'React', 'Node.js', 'Terraform', 'AWS CI/CD', 'Jira Agile'],
    results: { 'Deployment Speed': '3x Faster', 'Onboarding Time': '48 Hours', 'Cost Savings': '35%' },
    featured: false,
    year: '2026',
    created_at: new Date(Date.now() - 5 * 86400000)
  }
];

const mockProjects: any[] = [...initialMockProjects];

const defaultMockJobs = [
  {
    id: 1,
    job_id: 'DIGI8-JOB-101',
    title: 'Senior Frontend Developer',
    slug: 'senior-frontend-developer',
    category: 'Engineering',
    job_type: 'Full-time',
    work_mode: 'Remote',
    location: 'Mumbai / Remote, India',
    experience: '3+ Years',
    openings: 2,
    compensation: '₹10,00,000 - ₹16,00,000 P.A.',
    short_description: 'We are seeking an exceptional Senior Frontend Developer with deep expertise in React, TypeScript, and modern component architectures.',
    description: 'As a Senior Frontend Developer at DIGI8 Solutions, you will lead the architecture and development of ultra-responsive, accessible, and high-performance digital applications for global enterprise clients.',
    responsibilities: [
      'Architect, build, and maintain production-grade React & TypeScript applications.',
      'Collaborate closely with UI/UX designers, backend engineers, and product managers.',
      'Optimize applications for maximum speed, scalability, and cross-browser responsiveness.',
      'Mentor junior developers and participate in code reviews to ensure best practices.',
      'Implement automated unit and integration tests for mission-critical interfaces.'
    ],
    requirements: [
      '3+ years of professional web development experience with React.js and TypeScript.',
      'Proficient in Tailwind CSS, CSS3 modern layouts (Grid/Flexbox), and state management.',
      'Hands-on experience with RESTful APIs, WebSockets, and asynchronous request handling.',
      'Solid understanding of Git, CI/CD pipelines, and modern bundling tools (Vite, Webpack).',
      'Strong problem-solving skills and passion for pixel-perfect UI implementations.'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs', 'Git'],
    documents_required: ['Resume/CV', 'Portfolio / GitHub'],
    custom_questions: [
      {
        id: 'q1',
        question: 'How many years of professional React & TypeScript experience do you have?',
        type: 'number',
        required: true,
        options: []
      },
      {
        id: 'q2',
        question: 'Are you available to join within 15-30 days?',
        type: 'radio',
        required: true,
        options: ['Immediate', '15 Days', '30 Days', 'More than 30 Days']
      },
      {
        id: 'q3',
        question: 'Link to your best deployed project or live web application:',
        type: 'url',
        required: false,
        options: []
      }
    ],
    application_deadline: '2026-12-31',
    status: 'published',
    created_by: 'Digi-8 Talent Team',
    created_at: new Date(),
    published_at: new Date()
  },
  {
    id: 2,
    job_id: 'DIGI8-JOB-102',
    title: 'UI/UX & Product Designer',
    slug: 'ui-ux-product-designer',
    category: 'Design',
    job_type: 'Full-time / Freelance',
    work_mode: 'Hybrid',
    location: 'Mumbai, India',
    experience: '2+ Years',
    openings: 1,
    compensation: '₹8,00,000 - ₹14,00,000 P.A.',
    short_description: 'Looking for a visionary UI/UX designer to craft compelling digital experiences, design systems, and enterprise product interfaces.',
    description: 'Join our design division to build visually stunning brand experiences, user flows, wireframes, and design systems for next-generation digital products.',
    responsibilities: [
      'Design wireframes, user journeys, interactive prototypes, and high-fidelity mockups.',
      'Establish and maintain cohesive design systems in Figma.',
      'Work with engineering teams to ensure design fidelity during frontend implementation.',
      'Conduct user research, usability testing, and synthesize feedback into design iterations.'
    ],
    requirements: [
      'Proven track record with an online portfolio showcasing digital product design.',
      'Mastery of Figma, design tokens, responsive layout principles, and micro-interactions.',
      'Good understanding of HTML/CSS constraints and modern design trends.'
    ],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping'],
    documents_required: ['Resume/CV', 'Design Portfolio Link'],
    custom_questions: [
      {
        id: 'q1',
        question: 'Please provide the direct link to your Figma or Behance portfolio:',
        type: 'url',
        required: true,
        options: []
      },
      {
        id: 'q2',
        question: 'Preferred work arrangement:',
        type: 'dropdown',
        required: true,
        options: ['Full-time (Hybrid)', 'Contract / Freelance', 'Either']
      }
    ],
    application_deadline: '2026-11-30',
    status: 'published',
    created_by: 'Digi-8 Talent Team',
    created_at: new Date(),
    published_at: new Date()
  },
  {
    id: 3,
    job_id: 'DIGI8-JOB-103',
    title: 'Full Stack Node.js Engineer',
    slug: 'full-stack-nodejs-engineer',
    category: 'Engineering',
    job_type: 'Full-time',
    work_mode: 'Remote',
    location: 'Remote, India',
    experience: '3+ Years',
    openings: 2,
    compensation: '₹12,00,000 - ₹18,00,000 P.A.',
    short_description: 'Build robust backend architectures, distributed APIs, microservices, and database layers powering enterprise client platforms.',
    description: 'We are expanding our backend engineering team. You will be responsible for creating performant, secure, and resilient backend systems with Node.js, Express/Nest, and MySQL/PostgreSQL.',
    responsibilities: [
      'Develop RESTful and GraphQL APIs with Node.js and TypeScript.',
      'Optimize database queries, indexing, and connection pools for MySQL/PostgreSQL.',
      'Implement security best practices including JWT, rate limiting, and OAuth.',
      'Architect scalable cloud deployments with Docker, AWS/GCP, and CI/CD pipelines.'
    ],
    requirements: [
      '3+ years backend development experience with Node.js & TypeScript.',
      'Deep understanding of relational databases (MySQL/PostgreSQL) and caching (Redis).',
      'Experience in API security, asynchronous messaging, and scalable microservices.'
    ],
    skills: ['Node.js', 'Express', 'TypeScript', 'MySQL', 'Redis', 'Docker', 'AWS'],
    documents_required: ['Resume/CV'],
    custom_questions: [
      {
        id: 'q1',
        question: 'What is your current notice period?',
        type: 'dropdown',
        required: true,
        options: ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days']
      }
    ],
    application_deadline: '2026-12-15',
    status: 'published',
    created_by: 'Digi-8 Talent Team',
    created_at: new Date(),
    published_at: new Date()
  },
  {
    id: 4,
    job_id: 'DIGI8-JOB-104',
    title: 'Digital Marketing & Growth Strategist',
    slug: 'digital-marketing-growth-strategist',
    category: 'Marketing',
    job_type: 'Full-time',
    work_mode: 'Hybrid',
    location: 'Mumbai, India',
    experience: '2+ Years',
    openings: 1,
    compensation: '₹7,00,000 - ₹12,00,000 P.A.',
    short_description: 'Drive high-ROI acquisition campaigns, SEO strategies, paid performance ads, and content-driven client growth.',
    description: 'Lead digital marketing initiatives across Google Ads, Meta Ads, SEO optimization, email automation, and conversion rate optimization (CRO).',
    responsibilities: [
      'Plan and manage multi-channel paid acquisition campaigns (Google, Meta, LinkedIn).',
      'Execute technical and on-page SEO audits and content distribution strategies.',
      'Track attribution, KPIs, and campaign performance in Google Analytics 4.'
    ],
    requirements: [
      'Demonstrated success managing Google Ads and Meta Ads budgets with measurable ROAS.',
      'Strong knowledge of GA4, GTM, SEO tools (Ahrefs/Semrush), and email marketing funnels.'
    ],
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'GA4', 'Performance Marketing'],
    documents_required: ['Resume/CV', 'Past Campaign Case Studies'],
    custom_questions: [
      {
        id: 'q1',
        question: 'What has been the largest monthly advertising budget you have managed?',
        type: 'short text',
        required: false,
        options: []
      }
    ],
    application_deadline: '2026-11-15',
    status: 'published',
    created_by: 'Digi-8 Talent Team',
    created_at: new Date(),
    published_at: new Date()
  }
];

const defaultMockStages = [
  { id: 1, name: 'Applied', slug: 'applied', stage_order: 1, color_code: '#38bdf8', is_system: 1, candidate_visible: 1, candidate_label: 'Application Received' },
  { id: 2, name: 'Screening', slug: 'screening', stage_order: 2, color_code: '#818cf8', is_system: 1, candidate_visible: 1, candidate_label: 'Initial Screening' },
  { id: 3, name: 'Shortlisted', slug: 'shortlisted', stage_order: 3, color_code: '#06b6d4', is_system: 1, candidate_visible: 1, candidate_label: 'Profile Shortlisted' },
  { id: 4, name: 'Interview', slug: 'interview', stage_order: 4, color_code: '#a855f7', is_system: 1, candidate_visible: 1, candidate_label: 'Technical Interview' },
  { id: 5, name: 'Assessment', slug: 'assessment', stage_order: 5, color_code: '#eab308', is_system: 1, candidate_visible: 1, candidate_label: 'Technical Assessment' },
  { id: 6, name: 'Selected', slug: 'selected', stage_order: 6, color_code: '#22c55e', is_system: 1, candidate_visible: 1, candidate_label: 'Selected & Offer Process' },
  { id: 7, name: 'Hired', slug: 'hired', stage_order: 7, color_code: '#10b981', is_system: 1, candidate_visible: 1, candidate_label: 'Onboarding & Hired' },
  { id: 8, name: 'Rejected', slug: 'rejected', stage_order: 8, color_code: '#ef4444', is_system: 1, candidate_visible: 1, candidate_label: 'Application Concluded' },
];

const mockCareerStages: any[] = [...defaultMockStages];

const mockCareerJobs: any[] = [...defaultMockJobs];

const initialMockApplications = [
  {
    id: 1,
    application_id: 'DIGI8-APP-2026-108241',
    job_id: 'DIGI8-JOB-101',
    candidate_name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91 98201 54321',
    location: 'Mumbai, India',
    current_role: 'Senior React Developer',
    experience: '4.5 Years',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Redux', 'Next.js'],
    linkedin: 'https://linkedin.com/in/aaravmehta-demo',
    portfolio: 'https://aaravmehta.dev',
    github: 'https://github.com/aaravmehta-dev',
    availability: '30 Days',
    expected_compensation: '₹14,00,000 P.A.',
    cover_message: 'Experienced React specialist passionate about building resilient UI architectures and high-performance micro-frontends.',
    resume_file: 'sample_resume_aarav.pdf',
    resume_original_name: 'Aarav_Mehta_Resume.pdf',
    custom_answers: [{ question: 'Notice Period', answer: '30 Days' }],
    documents: [{ type: 'Resume', name: 'Aarav_Mehta_Resume.pdf', file: 'sample_resume_aarav.pdf' }],
    status: 'interview',
    stage_slug: 'interview',
    recruiter_id: 'rec-1',
    recruiter_name: 'Vikram Talent Lead',
    priority: 'high',
    source: 'DIGI8 Careers Portal',
    created_at: new Date(Date.now() - 6 * 86400000)
  },
  {
    id: 2,
    application_id: 'DIGI8-APP-2026-291044',
    job_id: 'DIGI8-JOB-102',
    candidate_name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98112 33445',
    location: 'Pune, India',
    current_role: 'Product Designer',
    experience: '3 Years',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research'],
    linkedin: 'https://linkedin.com/in/priyasharma-demo',
    portfolio: 'https://behance.net/priyadesigns',
    github: '',
    availability: '15 Days',
    expected_compensation: '₹12,00,000 P.A.',
    cover_message: 'Crafting user-centric interfaces and scalable design systems is my passion. Excited to support DIGI8 digital solutions.',
    resume_file: 'sample_resume_priya.pdf',
    resume_original_name: 'Priya_Sharma_Design_CV.pdf',
    custom_answers: [{ question: 'Portfolio Link', answer: 'https://behance.net/priyadesigns' }],
    documents: [{ type: 'Resume', name: 'Priya_Sharma_Design_CV.pdf', file: 'sample_resume_priya.pdf' }],
    status: 'shortlisted',
    stage_slug: 'shortlisted',
    recruiter_id: 'rec-2',
    recruiter_name: 'Ananya Recruiter',
    priority: 'urgent',
    source: 'LinkedIn Referral',
    created_at: new Date(Date.now() - 4 * 86400000)
  },
  {
    id: 3,
    application_id: 'DIGI8-APP-2026-384721',
    job_id: 'DIGI8-JOB-103',
    candidate_name: 'Karan Saxena',
    email: 'karan.saxena@example.com',
    phone: '+91 97110 88990',
    location: 'Bangalore, India',
    current_role: 'Cloud Engineer',
    experience: '5 Years',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'GCP'],
    linkedin: 'https://linkedin.com/in/karansaxena-cloud',
    portfolio: '',
    github: 'https://github.com/ksaxena-infra',
    availability: 'Immediate',
    expected_compensation: '₹22,00,000 P.A.',
    cover_message: 'Deep experience designing high-availability multi-region architectures with automated CI/CD pipelines.',
    resume_file: 'sample_resume_karan.pdf',
    resume_original_name: 'Karan_Saxena_DevOps_CV.pdf',
    custom_answers: [],
    documents: [{ type: 'Resume', name: 'Karan_Saxena_DevOps_CV.pdf', file: 'sample_resume_karan.pdf' }],
    status: 'screening',
    stage_slug: 'screening',
    recruiter_id: 'rec-1',
    recruiter_name: 'Vikram Talent Lead',
    priority: 'normal',
    source: 'DIGI8 Careers Portal',
    created_at: new Date(Date.now() - 2 * 86400000)
  },
  {
    id: 4,
    application_id: 'DIGI8-APP-2026-492810',
    job_id: 'DIGI8-JOB-104',
    candidate_name: 'Sneha Roy',
    email: 'sneha.roy@example.com',
    phone: '+91 99345 67123',
    location: 'Mumbai, India',
    current_role: 'Growth Marketing Specialist',
    experience: '3.5 Years',
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'GA4', 'Performance Marketing'],
    linkedin: 'https://linkedin.com/in/sneharoy-growth',
    portfolio: '',
    github: '',
    availability: 'Immediate',
    expected_compensation: '₹10,50,000 P.A.',
    cover_message: 'Delivered 3.8x ROAS on multi-lakh advertising campaigns across healthcare and fintech verticals.',
    resume_file: 'sample_resume_sneha.pdf',
    resume_original_name: 'Sneha_Roy_Growth_Resume.pdf',
    custom_answers: [],
    documents: [{ type: 'Resume', name: 'Sneha_Roy_Growth_Resume.pdf', file: 'sample_resume_sneha.pdf' }],
    status: 'selected',
    stage_slug: 'selected',
    recruiter_id: 'rec-2',
    recruiter_name: 'Ananya Recruiter',
    priority: 'urgent',
    source: 'DIGI8 Careers Portal',
    created_at: new Date(Date.now() - 8 * 86400000)
  },
  {
    id: 5,
    application_id: 'DIGI8-APP-2026-559201',
    job_id: 'DIGI8-JOB-101',
    candidate_name: 'Rohan Deshmukh',
    email: 'rohan.d@example.com',
    phone: '+91 98450 11223',
    location: 'Delhi NCR, India',
    current_role: 'Frontend Engineer',
    experience: '2 Years',
    skills: ['JavaScript', 'HTML5', 'CSS3', 'Vue.js'],
    linkedin: 'https://linkedin.com/in/rohandeshmukh',
    portfolio: '',
    github: 'https://github.com/rohand-code',
    availability: '30 Days',
    expected_compensation: '₹9,00,000 P.A.',
    cover_message: 'Excited about frontend challenges and learning new frameworks.',
    resume_file: 'sample_resume_rohan.pdf',
    resume_original_name: 'Rohan_Deshmukh_CV.pdf',
    custom_answers: [],
    documents: [{ type: 'Resume', name: 'Rohan_Deshmukh_CV.pdf', file: 'sample_resume_rohan.pdf' }],
    status: 'applied',
    stage_slug: 'applied',
    recruiter_id: '',
    recruiter_name: '',
    priority: 'normal',
    source: 'DIGI8 Careers Portal',
    created_at: new Date(Date.now() - 1 * 86400000)
  },
  {
    id: 6,
    application_id: 'DIGI8-APP-2026-664819',
    job_id: 'DIGI8-JOB-102',
    candidate_name: 'Neha Kapoor',
    email: 'neha.kapoor@example.com',
    phone: '+91 91234 56789',
    location: 'Remote, India',
    current_role: 'Visual Designer',
    experience: '1 Year',
    skills: ['Canva', 'Photoshop', 'Basic Figma'],
    linkedin: 'https://linkedin.com/in/nehakapoor-design',
    portfolio: '',
    github: '',
    availability: 'Immediate',
    expected_compensation: '₹6,00,000 P.A.',
    cover_message: 'Junior designer looking for mentorship and agency experience.',
    resume_file: 'sample_resume_neha.pdf',
    resume_original_name: 'Neha_Kapoor_Resume.pdf',
    custom_answers: [],
    documents: [{ type: 'Resume', name: 'Neha_Kapoor_Resume.pdf', file: 'sample_resume_neha.pdf' }],
    status: 'rejected',
    stage_slug: 'rejected',
    recruiter_id: 'rec-1',
    recruiter_name: 'Vikram Talent Lead',
    priority: 'low',
    source: 'Direct Portal',
    created_at: new Date(Date.now() - 12 * 86400000)
  }
];

const mockCareerApplications: any[] = [...initialMockApplications];

const mockStageHistory: any[] = [
  {
    id: 1,
    application_id: 'DIGI8-APP-2026-108241',
    from_stage: 'applied',
    to_stage: 'screening',
    changed_by: 'Vikram Talent Lead',
    reason: 'Initial profile match on React & TypeScript stack',
    duration_seconds: 86400,
    created_at: new Date(Date.now() - 5 * 86400000)
  },
  {
    id: 2,
    application_id: 'DIGI8-APP-2026-108241',
    from_stage: 'screening',
    to_stage: 'shortlisted',
    changed_by: 'Vikram Talent Lead',
    reason: 'Passed telephonic screening, confirmed 30-day notice',
    duration_seconds: 172800,
    created_at: new Date(Date.now() - 3 * 86400000)
  },
  {
    id: 3,
    application_id: 'DIGI8-APP-2026-108241',
    from_stage: 'shortlisted',
    to_stage: 'interview',
    changed_by: 'Vikram Talent Lead',
    reason: 'Invited for Senior Frontend Technical Interview round',
    duration_seconds: 86400,
    created_at: new Date(Date.now() - 1 * 86400000)
  },
  {
    id: 4,
    application_id: 'DIGI8-APP-2026-291044',
    from_stage: 'applied',
    to_stage: 'shortlisted',
    changed_by: 'Ananya Recruiter',
    reason: 'Outstanding Behance portfolio showcasing design systems',
    duration_seconds: 43200,
    created_at: new Date(Date.now() - 3 * 86400000)
  },
  {
    id: 5,
    application_id: 'DIGI8-APP-2026-492810',
    from_stage: 'applied',
    to_stage: 'screening',
    changed_by: 'Ananya Recruiter',
    reason: 'Impressive ROAS and cross-channel paid experience',
    duration_seconds: 43200,
    created_at: new Date(Date.now() - 7 * 86400000)
  },
  {
    id: 6,
    application_id: 'DIGI8-APP-2026-492810',
    from_stage: 'screening',
    to_stage: 'selected',
    changed_by: 'Ananya Recruiter',
    reason: 'Leadership interview completed with stellar evaluation',
    duration_seconds: 259200,
    created_at: new Date(Date.now() - 2 * 86400000)
  }
];

const mockCareerNotes: any[] = [
  {
    id: 1,
    application_id: 'DIGI8-APP-2026-108241',
    candidate_email: 'aarav.mehta@example.com',
    author_name: 'Vikram Talent Lead',
    author_role: 'Lead Technical Recruiter',
    note_text: 'Candidate demonstrated deep knowledge of React fiber architecture, Webpack/Vite bundler optimizations, and state management.',
    is_private: 0,
    created_at: new Date(Date.now() - 2 * 86400000)
  },
  {
    id: 2,
    application_id: 'DIGI8-APP-2026-291044',
    candidate_email: 'priya.sharma@example.com',
    author_name: 'Ananya Recruiter',
    author_role: 'Product Design Recruiter',
    note_text: 'Salary expectations aligned with budget. Notice period is flexible (15 days). Ready to join next month.',
    is_private: 0,
    created_at: new Date(Date.now() - 3 * 86400000)
  }
];

const mockCandidateTags: any[] = [
  { id: 1, application_id: 'DIGI8-APP-2026-108241', candidate_email: 'aarav.mehta@example.com', tag_name: 'Top Talent', color_code: '#10b981' },
  { id: 2, application_id: 'DIGI8-APP-2026-108241', candidate_email: 'aarav.mehta@example.com', tag_name: 'Fast Track', color_code: '#8b5cf6' },
  { id: 3, application_id: 'DIGI8-APP-2026-291044', candidate_email: 'priya.sharma@example.com', tag_name: 'Design System Pro', color_code: '#06b6d4' },
  { id: 4, application_id: 'DIGI8-APP-2026-492810', candidate_email: 'sneha.roy@example.com', tag_name: 'Offer Extended', color_code: '#22c55e' }
];

const mockCareerTasks: any[] = [
  {
    id: 1,
    application_id: 'DIGI8-APP-2026-108241',
    title: 'Schedule System Architecture Deep-Dive with Engineering VP',
    description: 'Evaluate distributed React state synchronization and micro-frontend federation with Aarav.',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    assigned_to: 'Vikram Talent Lead',
    status: 'pending',
    created_at: new Date()
  },
  {
    id: 2,
    application_id: 'DIGI8-APP-2026-492810',
    title: 'Send Offer Letter & Employment Contract',
    description: 'Finalize joining bonus and date of joining documents for Sneha Roy.',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    assigned_to: 'Ananya Recruiter',
    status: 'in_progress',
    created_at: new Date()
  }
];

const defaultMockEmailTemplates = [
  {
    id: 1,
    name: 'Application Received Confirmation',
    subject: 'We have received your application for {{job_title}} — DIGI8 Solutions',
    body: 'Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} position at DIGI8 Solutions. Your unique Application Reference ID is {{application_id}}.\n\nOur talent acquisition team has received your profile and will review your experience carefully. You will hear back from us regarding the next steps soon.\n\nBest regards,\nDIGI8 Solutions Talent Team',
    category: 'acknowledgement',
    variables: JSON.stringify(['candidate_name', 'job_title', 'application_id', 'company_name']),
    is_default: 1
  },
  {
    id: 2,
    name: 'Profile Shortlisted for Evaluation',
    subject: 'Great News! You have been shortlisted for {{job_title}} at DIGI8 Solutions',
    body: 'Dear {{candidate_name}},\n\nWe were impressed by your background and are excited to inform you that your application for {{job_title}} has been shortlisted!\n\nOur recruiting specialist {{recruiter_name}} will be coordinating the next stage with you shortly.\n\nWarm regards,\nDIGI8 Solutions Recruitment',
    category: 'shortlist',
    variables: JSON.stringify(['candidate_name', 'job_title', 'recruiter_name']),
    is_default: 1
  },
  {
    id: 3,
    name: 'Technical / Cultural Interview Invitation',
    subject: 'Interview Invitation: {{job_title}} at DIGI8 Solutions',
    body: 'Hi {{candidate_name}},\n\nWe would like to invite you for a virtual interview for the {{job_title}} position.\n\nDetails:\nDate: {{interview_date}}\nTime: {{interview_time}}\nMeeting Link: {{meeting_link}}\n\nPlease reply to confirm this slot or let us know if you need to reschedule.\n\nBest regards,\nDIGI8 Talent Team',
    category: 'interview',
    variables: JSON.stringify(['candidate_name', 'job_title', 'interview_date', 'interview_time', 'meeting_link']),
    is_default: 1
  },
  {
    id: 4,
    name: 'Formal Selection & Offer Letter',
    subject: 'Congratulations! Job Offer: {{job_title}} at DIGI8 Solutions',
    body: 'Dear {{candidate_name}},\n\nOn behalf of DIGI8 Solutions, we are thrilled to offer you the position of {{job_title}}!\n\nTarget Joining Date: {{joining_date}}\n\nPlease review the attached offer details and feel free to reach out with any questions. We look forward to building great digital products together!\n\nWarm regards,\nDIGI8 Solutions Leadership Team',
    category: 'offer',
    variables: JSON.stringify(['candidate_name', 'job_title', 'joining_date']),
    is_default: 1
  },
  {
    id: 5,
    name: 'Application Status Update (Not Moving Forward)',
    subject: 'Update on your application for {{job_title}} — DIGI8 Solutions',
    body: 'Dear {{candidate_name}},\n\nThank you very much for taking the time to speak with us regarding the {{job_title}} role at DIGI8 Solutions.\n\nWhile our team was impressed with your credentials, we have decided to move forward with another applicant whose specific experience more closely aligns with our immediate goals for this role.\n\nWe will retain your profile in our talent network and reach out if a relevant opportunity emerges.\n\nWe wish you all the best in your career journey.\n\nBest regards,\nDIGI8 Talent Acquisition',
    category: 'rejection',
    variables: JSON.stringify(['candidate_name', 'job_title']),
    is_default: 1
  }
];

const mockEmailTemplates: any[] = [...defaultMockEmailTemplates];

const mockEmailLogs: any[] = [
  {
    id: 1,
    application_id: 'DIGI8-APP-2026-108241',
    candidate_email: 'aarav.mehta@example.com',
    template_id: 1,
    template_name: 'Application Received Confirmation',
    subject: 'We have received your application for Senior Frontend Developer — DIGI8 Solutions',
    body: 'Sent automatically upon submission.',
    status: 'delivered',
    sent_by: 'DIGI8 Automation Engine',
    sent_at: new Date(Date.now() - 6 * 86400000)
  },
  {
    id: 2,
    application_id: 'DIGI8-APP-2026-108241',
    candidate_email: 'aarav.mehta@example.com',
    template_id: 3,
    template_name: 'Interview Invitation',
    subject: 'Interview Invitation: Senior Frontend Developer at DIGI8 Solutions',
    body: 'Virtual video call on Google Meet scheduled.',
    status: 'delivered',
    sent_by: 'Vikram Talent Lead',
    sent_at: new Date(Date.now() - 1 * 86400000)
  }
];

const mockInterviews: any[] = [
  {
    id: 1,
    application_id: 'DIGI8-APP-2026-108241',
    candidate_name: 'Aarav Mehta',
    candidate_email: 'aarav.mehta@example.com',
    interview_type: 'Technical Round',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    duration_minutes: 60,
    interviewer_name: 'Siddharth Rao',
    interviewer_email: 'siddharth@digi8solutions.com',
    meeting_link: 'https://meet.google.com/dgi-eng-tech',
    status: 'scheduled',
    notes: 'Focus on React 18 concurrent features, hydration, web performance metrics.',
    created_at: new Date()
  },
  {
    id: 2,
    application_id: 'DIGI8-APP-2026-492810',
    candidate_name: 'Sneha Roy',
    candidate_email: 'sneha.roy@example.com',
    interview_type: 'Leadership & Culture Fit',
    scheduled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration_minutes: 45,
    interviewer_name: 'Elena Rostova',
    interviewer_email: 'elena@digi8solutions.com',
    meeting_link: 'https://meet.google.com/dgi-lead-eval',
    status: 'completed',
    notes: 'Candidate passed with exceptional communication skills and client empathy.',
    created_at: new Date(Date.now() - 3 * 86400000)
  }
];

const mockInterviewFeedback: any[] = [
  {
    id: 1,
    interview_id: 2,
    application_id: 'DIGI8-APP-2026-492810',
    interviewer_name: 'Elena Rostova',
    technical_rating: 5,
    communication_rating: 5,
    problem_solving_rating: 5,
    culture_fit_rating: 5,
    recommendation: 'strong_hire',
    feedback_notes: 'Exceptional strategic thinker who articulates ROI clearly. Recommending immediate selection and offer extension.',
    submitted_at: new Date(Date.now() - 2 * 86400000)
  }
];

const defaultMockAutomationRules = [
  { id: 1, name: 'Auto-reply on Application Received', event_trigger: 'stage_change', trigger_stage: 'applied', action_type: 'send_email', email_template_id: 1, is_active: 1 },
  { id: 2, name: 'Shortlist Notification Email', event_trigger: 'stage_change', trigger_stage: 'shortlisted', action_type: 'send_email', email_template_id: 2, is_active: 1 },
  { id: 3, name: 'Interview Scheduled Notification', event_trigger: 'interview_scheduled', trigger_stage: 'interview', action_type: 'send_email', email_template_id: 3, is_active: 1 },
  { id: 4, name: 'Offer Notification Email', event_trigger: 'stage_change', trigger_stage: 'selected', action_type: 'send_email', email_template_id: 4, is_active: 1 },
  { id: 5, name: 'Candidate Rejection Notice', event_trigger: 'stage_change', trigger_stage: 'rejected', action_type: 'send_email', email_template_id: 5, is_active: 1 }
];

const mockAutomationRules: any[] = [...defaultMockAutomationRules];

const mockAuditLogs: any[] = [
  {
    id: 1,
    action_type: 'application_submitted',
    entity_type: 'career_application',
    entity_id: 'DIGI8-APP-2026-108241',
    performed_by: 'Candidate Portal',
    details: 'New application submitted for Senior Frontend Developer',
    created_at: new Date(Date.now() - 6 * 86400000)
  },
  {
    id: 2,
    action_type: 'stage_changed',
    entity_type: 'career_application',
    entity_id: 'DIGI8-APP-2026-108241',
    performed_by: 'Vikram Talent Lead',
    details: 'Moved from shortlisted to interview stage',
    created_at: new Date(Date.now() - 1 * 86400000)
  }
];

// Multer storage for secure resume / document uploads
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `resume-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// --- REALTIME ADMIN SSE NOTIFICATION ENGINE ---
const adminSseClients = new Set<express.Response>();

export const broadcastAdminNotification = (type: string, title: string, message: string, payload: any = {}) => {
  const eventPayload = JSON.stringify({
    type,
    title,
    message,
    payload,
    timestamp: new Date().toISOString()
  });

  adminSseClients.forEach((client) => {
    try {
      client.write(`data: ${eventPayload}\n\n`);
    } catch (e) {
      adminSseClients.delete(client);
    }
  });
};

// SSE Stream Endpoint for Admin Apps & PWA
app.get('/api/admin/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial connection packet
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Admin SSE Stream Connected' })}\n\n`);

  adminSseClients.add(res);

  req.on('close', () => {
    adminSseClients.delete(res);
  });
});

// 1. Leads API
app.post('/api/leads', async (req, res) => {
  try {
    const data = req.body;
    const token = uuidv4();
    let insertId = Date.now();

    try {
      const [result] = await pool.query(
        `INSERT INTO leads 
         (first_name, last_name, email, phone, company, industry, budget, timeline, services, message, verification_token) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.first_name, data.last_name, data.email, data.phone, data.company, data.industry,
          data.budget, data.timeline, JSON.stringify(data.services || []), data.message, token
        ]
      );
      insertId = (result as any).insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving lead in fallback memory mode:', (dbErr as any).message);
      mockLeads.push({ id: insertId, ...data, created_at: new Date() });
    }

    // Send Verification Email & Instant Reply to User
    await sendVerificationEmail(data.email, token, 'lead');
    await sendInstantReply(data.email, data.first_name || 'there', 'lead');

    // Send Notification Email to Admin (digi8solutions@gmail.com)
    await sendAdminNotification('lead', data);

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_LEAD',
      '🚨 New Lead Captured!',
      `New lead from ${data.first_name || ''} ${data.last_name || ''} (${data.company || 'Direct Client'})`,
      { id: insertId, ...data }
    );

    sendSuccess(res, { id: insertId }, 'Lead saved successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 2. Contacts API
app.post('/api/contacts', async (req, res) => {
  try {
    const data = req.body;
    const token = uuidv4();
    let insertId = Date.now();

    try {
      const [result] = await pool.query(
        `INSERT INTO contacts (name, email, subject, message, verification_token) VALUES (?, ?, ?, ?, ?)`,
        [data.name, data.email, data.subject, data.message, token]
      );
      insertId = (result as any).insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving contact in fallback memory mode:', (dbErr as any).message);
      mockContacts.push({ id: insertId, ...data, created_at: new Date() });
    }

    await sendVerificationEmail(data.email, token, 'contact');
    await sendInstantReply(data.email, data.name || 'there', 'contact');

    // Send Notification Email to Admin (digi8solutions@gmail.com)
    await sendAdminNotification('contact', data);

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_CONTACT',
      '📩 New Contact Inquiry!',
      `Message from ${data.name} — ${data.subject || 'General Inquiry'}`,
      { id: insertId, ...data }
    );

    sendSuccess(res, { id: insertId }, 'Contact saved successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 3. Quotes API
app.post('/api/quotes', async (req, res) => {
  try {
    const data = req.body;
    const token = uuidv4();
    const quoteNum = data.quote_number || `QT-${Date.now().toString().slice(-6)}`;
    let insertId = Date.now();

    try {
      const [result] = await pool.query(
        `INSERT INTO quotes 
         (quote_number, first_name, last_name, email, phone, company, website, project_type, project_details, total_estimate, selected_features, verification_token) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteNum, data.first_name, data.last_name, data.email, data.phone, data.company, data.website,
          data.project_type, data.project_details, data.total_estimate, JSON.stringify(data.selected_features || []), token
        ]
      );
      insertId = (result as any).insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving quote in fallback memory mode:', (dbErr as any).message);
      mockQuotes.push({ id: insertId, quote_number: quoteNum, ...data, created_at: new Date() });
    }

    await sendVerificationEmail(data.email, token, 'quote');
    await sendInstantReply(data.email, data.first_name || 'there', 'quote');

    // Send Notification Email to Admin (digi8solutions@gmail.com)
    await sendAdminNotification('quote', { ...data, quote_number: quoteNum });

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_QUOTE',
      '💰 New Project Quote Request!',
      `Quote #${quoteNum} from ${data.first_name || ''} ${data.last_name || ''} — Estimate: ₹${data.total_estimate || 0}`,
      { id: insertId, quote_number: quoteNum, ...data }
    );

    sendSuccess(res, { id: insertId, quote_number: quoteNum }, 'Quote saved successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 4. Newsletter API
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    const token = uuidv4();

    try {
      await pool.query(
        `INSERT INTO newsletter_subscribers (email, verification_token) VALUES (?, ?) ON DUPLICATE KEY UPDATE verification_token = ?`,
        [email, token, token]
      );
    } catch (dbErr) {
      console.warn('[DB WARNING] Subscribing in fallback memory mode:', (dbErr as any).message);
      mockSubscribers.push({ email, created_at: new Date() });
    }

    await sendVerificationEmail(email, token, 'newsletter');

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_SUBSCRIBER',
      '📧 New Newsletter Subscriber!',
      `Subscriber email: ${email}`,
      { email }
    );

    sendSuccess(res, null, 'Subscribed successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 5. Verification Endpoint
app.post('/api/verify', async (req, res) => {
  try {
    const { token, type } = req.body;
    if (!token || !type) return res.status(400).json({ success: false, error: 'Token and type are required' });

    let table = '';
    if (type === 'lead') table = 'leads';
    else if (type === 'contact') table = 'contacts';
    else if (type === 'quote') table = 'quotes';
    else if (type === 'newsletter') table = 'newsletter_subscribers';
    else return res.status(400).json({ success: false, error: 'Invalid type' });

    try {
      const [result]: any = await pool.query(`UPDATE ${table} SET is_verified = TRUE WHERE verification_token = ?`, [token]);
      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, error: 'Invalid or expired token' });
      }
    } catch (dbErr) {
      console.warn('[DB WARNING] Email verification in fallback mode.');
    }

    sendSuccess(res, null, 'Email verified successfully!');
  } catch (err) {
    sendError(res, err);
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-digi8';

// 6. Auth APIs

// Verify JWT session token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr: any) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
    }

    let user: any = null;
    try {
      const [rows]: any = await pool.query('SELECT id, email, name, role, status, avatar_url FROM admin_users WHERE id = ? OR email = ?', [decoded.id, decoded.email]);
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } catch (dbErr) {
      // Fallback mode if MySQL is offline
    }

    if (!user) {
      if (decoded.email === 'admin@digi8solutions.com') {
        user = { id: 1, email: 'admin@digi8solutions.com', name: 'Digi-8 Super Admin', role: 'Super Admin' };
      } else if (decoded.email === 'hr@digi8solutions.com') {
        user = { id: 2, email: 'hr@digi8solutions.com', name: 'Digi-8 HR Admin', role: 'HR Admin' };
      } else if (decoded.email === (process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com')) {
        user = { id: 3, email: decoded.email, name: 'Digi-8 Official Admin', role: 'Super Admin' };
      } else {
        user = { id: decoded.id, email: decoded.email, role: decoded.role || 'Super Admin', name: decoded.name || 'Administrator' };
      }
    }

    return sendSuccess(res, { user }, 'Session verified');
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || 'Authentication failed' });
  }
});

// Admin Email + Password Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user: any = null;

    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users WHERE email = ?', [email]);
      if (rows && rows.length > 0) {
        const dbUser = rows[0];
        const isValid = await bcrypt.compare(password, dbUser.password_hash || '');
        if (isValid) {
          user = dbUser;
        }
      }
    } catch (dbErr) {
      console.warn('[AUTH DB WARNING] MySQL unavailable, checking Super Admin fallback:', (dbErr as any).message);
    }

    // Offline / Persistent Store / Mock Super Admin, HR Admin, and Official Gmail fallback check
    if (!user) {
      // 1. Check persistent disk store
      const pStore = loadPersistentStore();
      const pUser = pStore.admin_users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (pUser && pUser.password_hash) {
        const isValid = await bcrypt.compare(password, pUser.password_hash);
        if (isValid) {
          user = pUser;
        }
      }

      // 2. Default credentials fallback
      const officialAdmin = process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com';
      if (!user) {
        if (email === 'admin@digi8solutions.com' && password === 'AdminDigi8Password2026!') {
          user = {
            id: 1,
            email: 'admin@digi8solutions.com',
            name: 'Digi-8 Super Admin',
            role: 'Super Admin'
          };
        } else if (email === 'hr@digi8solutions.com' && (password === 'HrAdminDigi8Password2026!' || password === (process.env.HR_ADMIN_PASSWORD || 'HrAdminDigi8Password2026!'))) {
          user = {
            id: 2,
            email: 'hr@digi8solutions.com',
            name: 'Digi-8 HR Admin',
            role: 'HR Admin'
          };
        } else if (email === officialAdmin && (password === 'AdminDigi8Password2026!' || password === (process.env.ADMIN_PASSWORD || 'AdminDigi8Password2026!'))) {
          user = {
            id: 3,
            email: officialAdmin,
            name: 'Digi-8 Official Admin',
            role: 'Super Admin'
          };
        } else {
          return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    sendSuccess(res, { token, user: { id: user.id, email: user.email, role: user.role, name: user.name, avatar_url: user.avatar_url || null } }, 'Logged in successfully');
  } catch (err) { sendError(res, err); }
});

// Google / Gmail Social Login for Administrators
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, picture, google_id } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Google email address is required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const officialAdmin = (process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com').toLowerCase().trim();

    // Check if the user is in DB
    let user: any = null;
    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users WHERE LOWER(email) = ?', [normalizedEmail]);
      if (rows && rows.length > 0) {
        user = rows[0];
        try {
          await pool.query(
            'UPDATE admin_users SET google_id = COALESCE(?, google_id), avatar_url = COALESCE(?, avatar_url), auth_provider = "google" WHERE id = ?',
            [google_id || null, picture || null, user.id]
          );
        } catch {}
      }
    } catch (dbErr) {
      console.warn('[AUTH DB WARNING] MySQL check failed during Google auth:', (dbErr as any).message);
    }

    // Authorization verification
    const isAuthorized = 
      user || 
      normalizedEmail === officialAdmin || 
      normalizedEmail === 'admin@digi8solutions.com' ||
      normalizedEmail === 'hr@digi8solutions.com' ||
      normalizedEmail.endsWith('@digi8solutions.com');

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: `Access denied. The Google account (${normalizedEmail}) is not authorized as an administrator. Please use an authorized company email.`
      });
    }

    if (!user) {
      const role = normalizedEmail === 'hr@digi8solutions.com' ? 'HR Admin' : 'Super Admin';
      const userName = name || (normalizedEmail.startsWith('hr') ? 'Digi-8 HR Admin' : 'Digi-8 Super Admin');
      let insertId = Date.now();

      try {
        const dummyHash = await bcrypt.hash(uuidv4(), 10);
        const [result]: any = await pool.query(
          'INSERT INTO admin_users (name, email, password_hash, role, google_id, avatar_url, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userName, normalizedEmail, dummyHash, role, google_id || null, picture || null, 'google']
        );
        insertId = result.insertId;
      } catch (insertErr) {
        console.warn('[AUTH DB WARNING] User auto-provision in fallback mode:', (insertErr as any).message);
      }

      user = {
        id: insertId,
        email: normalizedEmail,
        name: userName,
        role: role,
        avatar_url: picture || null
      };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar_url: picture || user.avatar_url || null
      }
    }, 'Signed in with Google successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// Database Diagnostics Telemetry Endpoint
app.get('/api/admin/database-status', async (_req, res) => {
  try {
    const health = await checkDatabaseHealth();
    sendSuccess(res, health, 'Database status retrieved');
  } catch (err) {
    sendError(res, err);
  }
});

// Send 6-Digit Email OTP for Login / Signup / Social Verification
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, purpose, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 1. Save to MySQL if online
    try {
      await pool.query(
        'INSERT INTO admin_otps (email, otp_code, purpose, expires_at, is_verified) VALUES (?, ?, ?, ?, FALSE)',
        [normalizedEmail, otp, purpose || 'login', expiresAt]
      );
    } catch (dbErr) {
      console.warn('[DB NOTICE] Saving OTP to disk persistent store');
    }

    // 2. Save to persistent disk database store
    const store = loadPersistentStore();
    store.admin_otps.push({
      id: Date.now(),
      email: normalizedEmail,
      otp_code: otp,
      purpose: purpose || 'login',
      expires_at: expiresAt.toISOString(),
      is_verified: false,
      created_at: new Date().toISOString()
    });
    if (store.admin_otps.length > 60) {
      store.admin_otps = store.admin_otps.slice(-60);
    }
    savePersistentStore(store);

    // 3. Dispatch Email via Gmail SMTP with automatic multi-strategy fallback
    const emailRes = await sendAdminOtpEmail(normalizedEmail, otp, purpose || 'login', name);

    if (!emailRes.success) {
      console.error(`[OTP DISPATCH FAILED] Email to ${normalizedEmail} could not be delivered:`, emailRes.error);
      return res.status(500).json({
        success: false,
        error: `Could not deliver verification email to ${normalizedEmail}: ${emailRes.error || 'SMTP Connection Error'}. Please verify server network or SMTP credentials.`
      });
    }

    return sendSuccess(res, {
      email: normalizedEmail,
      purpose: purpose || 'login',
      expires_in: '10 minutes',
      email_dispatched: true
    }, 'A 6-digit security OTP code has been sent to your email.');
  } catch (err) {
    sendError(res, err);
  }
});

// Verify Email OTP and Complete Login or Signup
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose, name, password, role } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit OTP code are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    let otpValid = false;

    // Check MySQL
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM admin_otps WHERE LOWER(email) = ? AND otp_code = ? AND expires_at > NOW() AND is_verified = FALSE ORDER BY created_at DESC LIMIT 1',
        [normalizedEmail, cleanOtp]
      );
      if (rows && rows.length > 0) {
        otpValid = true;
        await pool.query('UPDATE admin_otps SET is_verified = TRUE WHERE id = ?', [rows[0].id]);
      }
    } catch {}

    // Check persistent disk store if MySQL offline or not found
    if (!otpValid) {
      const store = loadPersistentStore();
      const matchIndex = store.admin_otps.findIndex(
        (o: any) => o.email.toLowerCase() === normalizedEmail &&
                    o.otp_code === cleanOtp &&
                    new Date(o.expires_at) > new Date() &&
                    !o.is_verified
      );
      if (matchIndex >= 0) {
        otpValid = true;
        store.admin_otps[matchIndex].is_verified = true;
        savePersistentStore(store);
      }
    }

    if (!otpValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP code. Please check your email or request a new code.'
      });
    }

    // OTP verified! Now process signup or login
    let user: any = null;

    // Look for existing user in MySQL
    try {
      const [userRows]: any = await pool.query('SELECT * FROM admin_users WHERE LOWER(email) = ?', [normalizedEmail]);
      if (userRows && userRows.length > 0) {
        user = userRows[0];
      }
    } catch {}

    // Look in disk store
    if (!user) {
      const store = loadPersistentStore();
      user = store.admin_users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
    }

    if (purpose === 'signup') {
      const userRole = role || 'Normal User';
      const userName = name || 'Digi-8 Administrator';
      const hash = password ? await bcrypt.hash(password, 10) : '';
      let insertId = Date.now();

      try {
        const [insertRes]: any = await pool.query(
          'INSERT INTO admin_users (name, email, password_hash, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
          [userName, normalizedEmail, hash, userRole, 'email_otp']
        );
        insertId = insertRes.insertId;
      } catch {}

      const store = loadPersistentStore();
      const existingIdx = store.admin_users.findIndex((u: any) => u.email.toLowerCase() === normalizedEmail);
      const newUser = {
        id: insertId,
        name: userName,
        email: normalizedEmail,
        password_hash: hash,
        role: userRole,
        status: 'active',
        auth_provider: 'email_otp',
        created_at: new Date().toISOString()
      };
      if (existingIdx >= 0) {
        store.admin_users[existingIdx] = newUser;
      } else {
        store.admin_users.push(newUser);
      }
      savePersistentStore(store);
      user = newUser;
    } else {
      // Purpose: login (Social or Email OTP Login)
      if (!user) {
        const officialAdmin = (process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com').toLowerCase().trim();
        const assignedRole = normalizedEmail === 'hr@digi8solutions.com' ? 'HR Admin' : 'Super Admin';
        const assignedName = name || (normalizedEmail === officialAdmin ? 'Digi-8 Official Admin' : 'Digi-8 Administrator');
        let insertId = Date.now();

        try {
          const [insertRes]: any = await pool.query(
            'INSERT INTO admin_users (name, email, password_hash, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
            [assignedName, normalizedEmail, '', assignedRole, 'email_otp']
          );
          insertId = insertRes.insertId;
        } catch {}

        const store = loadPersistentStore();
        const newUser = {
          id: insertId,
          name: assignedName,
          email: normalizedEmail,
          password_hash: '',
          role: assignedRole,
          status: 'active',
          auth_provider: 'email_otp',
          created_at: new Date().toISOString()
        };
        store.admin_users.push(newUser);
        savePersistentStore(store);
        user = newUser;
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar_url: user.avatar_url || null
      }
    }, purpose === 'signup' ? 'Admin account registered successfully' : 'Authenticated successfully via OTP');
  } catch (err) {
    sendError(res, err);
  }
});

// Admin Signup with Database Persistence
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const hash = await bcrypt.hash(password, 10);
    let insertId = Date.now();

    // 1. MySQL write
    try {
      const [existing]: any = await pool.query('SELECT id FROM admin_users WHERE LOWER(email) = ?', [normalizedEmail]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, error: 'An admin account with this email already exists' });
      }
      const [result]: any = await pool.query(
        'INSERT INTO admin_users (name, email, password_hash, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
        [name || 'Administrator', normalizedEmail, hash, role || 'Normal User', 'local']
      );
      insertId = result.insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving admin user in disk persistent mode');
    }

    // 2. Persistent Disk Database write
    const store = loadPersistentStore();
    const existingIndex = store.admin_users.findIndex((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (existingIndex >= 0 && store.admin_users[existingIndex].password_hash) {
      return res.status(400).json({ success: false, error: 'An admin account with this email already exists' });
    }

    const newUser = {
      id: insertId,
      name: name || 'Administrator',
      email: normalizedEmail,
      password_hash: hash,
      role: role || 'Normal User',
      status: 'active',
      auth_provider: 'local',
      created_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      store.admin_users[existingIndex] = newUser;
    } else {
      store.admin_users.push(newUser);
    }
    savePersistentStore(store);

    const token = jwt.sign(
      { id: insertId, role: newUser.role, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    sendSuccess(res, {
      token,
      user: { id: insertId, email: newUser.email, role: newUser.role, name: newUser.name }
    }, 'Admin account created successfully');
  } catch (err) { sendError(res, err); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000);

    try {
      await pool.query('UPDATE admin_users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, email]);
    } catch (dbErr) {
      console.warn('[DB WARNING] Forgot password reset in fallback mode');
    }

    await sendPasswordResetEmail(email, token);

    sendSuccess(res, null, 'If that email exists, a reset link was sent.');
  } catch (err) { sendError(res, err); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
      if (rows.length > 0) {
        await pool.query('UPDATE admin_users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hash, rows[0].id]);
      }
    } catch (dbErr) {
      console.warn('[DB WARNING] Password reset in fallback mode');
    }

    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) { sendError(res, err); }
});

// 7. Generic CRUD APIs
const createCrudRoutes = (tableName: string) => {
  app.get(`/api/${tableName}`, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
      sendSuccess(res, rows);
    } catch (dbErr) {
      console.warn(`[DB WARNING] GET /api/${tableName} fallback:`, (dbErr as any).message);
      if (tableName === 'admin_users') {
        return sendSuccess(res, [{ id: 1, name: 'Digi-8 Super Admin', email: 'admin@digi8solutions.com', role: 'Super Admin', status: 'active' }]);
      }
      if (tableName === 'leads') return sendSuccess(res, mockLeads);
      if (tableName === 'quotes') return sendSuccess(res, mockQuotes);
      if (tableName === 'contacts') return sendSuccess(res, mockContacts);
      if (tableName === 'projects') return sendSuccess(res, mockProjects);
      sendSuccess(res, []);
    }
  });

  app.post(`/api/${tableName}`, async (req, res) => {
    try {
      const keys = Object.keys(req.body).filter(k => req.body[k] !== undefined);
      const values = keys.map(k => typeof req.body[k] === 'object' ? JSON.stringify(req.body[k]) : req.body[k]);
      const placeholders = keys.map(() => '?').join(',');
      const [result] = await pool.query(`INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`, values);
      sendSuccess(res, { id: (result as any).insertId }, 'Created successfully');
    } catch (dbErr) {
      console.warn(`[DB WARNING] POST /api/${tableName} fallback:`, (dbErr as any).message);
      sendSuccess(res, { id: Date.now() }, 'Created (offline mode)');
    }
  });

  app.put(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const keys = Object.keys(req.body).filter(k => req.body[k] !== undefined && k !== 'id');
      const values = keys.map(k => typeof req.body[k] === 'object' ? JSON.stringify(req.body[k]) : req.body[k]);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      if (keys.length > 0) {
        await pool.query(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
      }
      sendSuccess(res, null, 'Updated successfully');
    } catch (dbErr) {
      sendSuccess(res, null, 'Updated (offline mode)');
    }
  });

  app.delete(`/api/${tableName}/:id`, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
      sendSuccess(res, null, 'Deleted successfully');
    } catch (dbErr) {
      sendSuccess(res, null, 'Deleted (offline mode)');
    }
  });
};

// --- SUPPORT TICKET SYSTEM API ---

// 1. Create Support Ticket (From Chatbot or Support Desk)
app.post('/api/tickets', async (req, res) => {
  try {
    const data = req.body;
    const ticketNum = data.ticket_number || `TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    let insertId = Date.now();

    const ticketObj = {
      id: insertId,
      ticket_number: ticketNum,
      user_name: data.user_name || 'Guest Visitor',
      user_email: data.user_email || 'visitor@digi8solutions.com',
      user_phone: data.user_phone || '',
      service_category: data.service_category || 'General Support',
      subject: data.subject || 'Support Ticket',
      description: data.description || '',
      priority: data.priority || 'medium',
      status: 'open',
      assigned_to: 'Support Desk',
      created_at: new Date()
    };

    try {
      const [result] = await pool.query(
        `INSERT INTO support_tickets 
         (ticket_number, user_name, user_email, user_phone, service_category, subject, description, priority, status, assigned_to) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketObj.ticket_number, ticketObj.user_name, ticketObj.user_email, ticketObj.user_phone,
          ticketObj.service_category, ticketObj.subject, ticketObj.description, ticketObj.priority,
          ticketObj.status, ticketObj.assigned_to
        ]
      );
      insertId = (result as any).insertId;
      ticketObj.id = insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving support ticket in fallback memory mode:', (dbErr as any).message);
      mockTickets.push(ticketObj);
    }

    // Realtime Broadcast to Connected Admin & Support Desk
    broadcastAdminNotification(
      'NEW_TICKET',
      `🎫 New Support Ticket #${ticketNum}`,
      `Subject: ${ticketObj.subject} (${ticketObj.user_name})`,
      ticketObj
    );

    sendSuccess(res, ticketObj, `Support ticket #${ticketNum} raised successfully.`);
  } catch (err) {
    sendError(res, err);
  }
});

// 2. Get All Support Tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM support_tickets ORDER BY created_at DESC`);
    sendSuccess(res, rows);
  } catch (dbErr) {
    sendSuccess(res, mockTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }
});

// 3. Update Support Ticket Status & Resolution
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { status, priority, resolution_notes, assigned_to } = req.body;
    const ticketId = req.params.id;

    try {
      await pool.query(
        `UPDATE support_tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), resolution_notes = COALESCE(?, resolution_notes), assigned_to = COALESCE(?, assigned_to) WHERE id = ?`,
        [status, priority, resolution_notes, assigned_to, ticketId]
      );
    } catch (dbErr) {
      const idx = mockTickets.findIndex(t => String(t.id) === String(ticketId));
      if (idx !== -1) {
        if (status) mockTickets[idx].status = status;
        if (priority) mockTickets[idx].priority = priority;
        if (resolution_notes) mockTickets[idx].resolution_notes = resolution_notes;
        if (assigned_to) mockTickets[idx].assigned_to = assigned_to;
      }
    }

    broadcastAdminNotification(
      'TICKET_UPDATED',
      `🔄 Ticket #${ticketId} Updated`,
      `Status changed to ${status || 'updated'}`,
      { id: ticketId, status, priority }
    );

    sendSuccess(res, null, 'Ticket updated successfully.');
  } catch (err) {
    sendError(res, err);
  }
});

// 4. Delete Support Ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM support_tickets WHERE id = ?`, [req.params.id]);
    sendSuccess(res, null, 'Ticket deleted successfully');
  } catch (dbErr) {
    const idx = mockTickets.findIndex(t => String(t.id) === String(req.params.id));
    if (idx !== -1) mockTickets.splice(idx, 1);
    sendSuccess(res, null, 'Ticket deleted');
  }
});

// --- DIGI8 CAREERS PLATFORM (PHASE 1 API) ---

// Helper to parse JSON fields safely
const parseJsonField = (field: any, defaultValue: any = []) => {
  if (!field) return defaultValue;
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch {
    return defaultValue;
  }
};

// 1. Careers Overview Statistics
app.get('/api/careers/stats', async (req, res) => {
  try {
    let activeJobs = 0;
    let draftJobs = 0;
    let closedJobs = 0;
    let totalApplications = 0;
    let newApplications = 0;

    try {
      const [jobsCount]: any = await pool.query(`
        SELECT 
          SUM(CASE WHEN status = 'published' AND (application_deadline IS NULL OR application_deadline >= CURDATE()) THEN 1 ELSE 0 END) as active_count,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
          SUM(CASE WHEN status IN ('closed', 'archived') OR (status = 'published' AND application_deadline < CURDATE()) THEN 1 ELSE 0 END) as closed_count
        FROM career_jobs
      `);

      const [appsCount]: any = await pool.query(`
        SELECT 
          COUNT(*) as total_count,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count
        FROM career_applications
      `);

      activeJobs = Number(jobsCount[0]?.active_count || 0);
      draftJobs = Number(jobsCount[0]?.draft_count || 0);
      closedJobs = Number(jobsCount[0]?.closed_count || 0);
      totalApplications = Number(appsCount[0]?.total_count || 0);
      newApplications = Number(appsCount[0]?.new_count || 0);
    } catch (dbErr) {
      // Fallback mock calculations
      activeJobs = mockCareerJobs.filter(j => j.status === 'published').length;
      draftJobs = mockCareerJobs.filter(j => j.status === 'draft').length;
      closedJobs = mockCareerJobs.filter(j => j.status === 'closed' || j.status === 'archived').length;
      totalApplications = mockCareerApplications.length;
      newApplications = mockCareerApplications.filter(a => a.status === 'new').length;
    }

    sendSuccess(res, {
      activeJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      newApplications
    });
  } catch (err) {
    sendError(res, err);
  }
});

// 2. Get All Jobs (Public filter vs Admin full view)
app.get('/api/careers/jobs', async (req, res) => {
  try {
    const { all, category, job_type, work_mode, search, status } = req.query;
    const isAll = all === 'true';

    try {
      let query = `
        SELECT j.*, 
          (SELECT COUNT(*) FROM career_applications a WHERE a.job_id = j.job_id) AS applications_count
        FROM career_jobs j
        WHERE 1=1
      `;
      const params: any[] = [];

      if (!isAll) {
        query += ` AND j.status = 'published' AND (j.application_deadline IS NULL OR j.application_deadline >= CURDATE())`;
      } else if (status) {
        query += ` AND j.status = ?`;
        params.push(status);
      }

      if (category && category !== 'All') {
        query += ` AND j.category = ?`;
        params.push(category);
      }
      if (job_type && job_type !== 'All') {
        query += ` AND j.job_type LIKE ?`;
        params.push(`%${job_type}%`);
      }
      if (work_mode && work_mode !== 'All') {
        query += ` AND j.work_mode = ?`;
        params.push(work_mode);
      }
      if (search) {
        query += ` AND (j.title LIKE ? OR j.short_description LIKE ? OR j.description LIKE ? OR j.skills LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      query += ` ORDER BY j.created_at DESC`;

      const [rows]: any = await pool.query(query, params);
      const jobs = rows.map((j: any) => ({
        ...j,
        responsibilities: parseJsonField(j.responsibilities),
        requirements: parseJsonField(j.requirements),
        skills: parseJsonField(j.skills),
        documents_required: parseJsonField(j.documents_required),
        custom_questions: parseJsonField(j.custom_questions),
        applications_count: Number(j.applications_count || 0)
      }));

      sendSuccess(res, jobs);
    } catch (dbErr) {
      // Mock fallback filter
      let filtered = [...mockCareerJobs];

      if (!isAll) {
        filtered = filtered.filter(j => j.status === 'published');
      } else if (status) {
        filtered = filtered.filter(j => j.status === status);
      }

      if (category && category !== 'All') {
        filtered = filtered.filter(j => j.category === category);
      }
      if (job_type && job_type !== 'All') {
        filtered = filtered.filter(j => j.job_type.toLowerCase().includes(String(job_type).toLowerCase()));
      }
      if (work_mode && work_mode !== 'All') {
        filtered = filtered.filter(j => j.work_mode === work_mode);
      }
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(j =>
          j.title.toLowerCase().includes(s) ||
          (j.short_description && j.short_description.toLowerCase().includes(s)) ||
          (Array.isArray(j.skills) && j.skills.some((sk: string) => sk.toLowerCase().includes(s)))
        );
      }

      const mapped = filtered.map(j => ({
        ...j,
        applications_count: mockCareerApplications.filter(a => a.job_id === j.job_id).length
      }));

      sendSuccess(res, mapped);
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 3. Get Single Job by ID, Slug or Job ID
app.get('/api/careers/jobs/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    try {
      const [rows]: any = await pool.query(
        `SELECT j.*, 
          (SELECT COUNT(*) FROM career_applications a WHERE a.job_id = j.job_id) AS applications_count
         FROM career_jobs j 
         WHERE j.slug = ? OR j.job_id = ? OR j.id = ? 
         LIMIT 1`,
        [idOrSlug, idOrSlug, isNaN(Number(idOrSlug)) ? -1 : Number(idOrSlug)]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      const j = rows[0];
      const job = {
        ...j,
        responsibilities: parseJsonField(j.responsibilities),
        requirements: parseJsonField(j.requirements),
        skills: parseJsonField(j.skills),
        documents_required: parseJsonField(j.documents_required),
        custom_questions: parseJsonField(j.custom_questions),
        applications_count: Number(j.applications_count || 0)
      };

      sendSuccess(res, job);
    } catch (dbErr) {
      const job = mockCareerJobs.find(
        j => j.slug === idOrSlug || j.job_id === idOrSlug || String(j.id) === String(idOrSlug)
      );

      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      sendSuccess(res, {
        ...job,
        applications_count: mockCareerApplications.filter(a => a.job_id === job.job_id).length
      });
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 4. Create Job (Admin)
app.post('/api/careers/jobs', async (req, res) => {
  try {
    const data = req.body;
    const jobId = data.job_id || `DIGI8-JOB-${Math.floor(100 + Math.random() * 900)}`;
    const slug = data.slug || (data.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const status = data.status || 'published';
    const publishedAt = status === 'published' ? new Date() : null;

    const newJob = {
      id: Date.now(),
      job_id: jobId,
      title: data.title,
      slug,
      category: data.category || 'Engineering',
      job_type: data.job_type || 'Full-time',
      work_mode: data.work_mode || 'Remote',
      location: data.location || 'Remote',
      experience: data.experience || '1+ Years',
      openings: Number(data.openings || 1),
      compensation: data.compensation || 'Competitive',
      short_description: data.short_description || '',
      description: data.description || '',
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      documents_required: Array.isArray(data.documents_required) ? data.documents_required : ['Resume/CV'],
      custom_questions: Array.isArray(data.custom_questions) ? data.custom_questions : [],
      application_deadline: data.application_deadline || null,
      status,
      created_by: data.created_by || 'HR Admin',
      created_at: new Date(),
      published_at: publishedAt
    };

    try {
      const [result]: any = await pool.query(
        `INSERT INTO career_jobs 
         (job_id, title, slug, category, job_type, work_mode, location, experience, openings, compensation, short_description, description, responsibilities, requirements, skills, documents_required, custom_questions, application_deadline, status, created_by, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newJob.job_id, newJob.title, newJob.slug, newJob.category, newJob.job_type, newJob.work_mode,
          newJob.location, newJob.experience, newJob.openings, newJob.compensation, newJob.short_description,
          newJob.description, JSON.stringify(newJob.responsibilities), JSON.stringify(newJob.requirements),
          JSON.stringify(newJob.skills), JSON.stringify(newJob.documents_required),
          JSON.stringify(newJob.custom_questions), newJob.application_deadline, newJob.status,
          newJob.created_by, newJob.published_at
        ]
      );
      newJob.id = result.insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving career job in fallback mode:', (dbErr as any).message);
      mockCareerJobs.unshift(newJob);
    }

    broadcastAdminNotification(
      'NEW_JOB_CREATED',
      `💼 New Opportunity Created: ${newJob.title}`,
      `Job ID: ${newJob.job_id} (${newJob.status.toUpperCase()})`,
      newJob
    );

    sendSuccess(res, newJob, 'Job created successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 5. Update Job (Admin)
app.put('/api/careers/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    try {
      const fields: string[] = [];
      const values: any[] = [];

      const allowedFields = [
        'title', 'slug', 'category', 'job_type', 'work_mode', 'location',
        'experience', 'openings', 'compensation', 'short_description', 'description',
        'application_deadline', 'status'
      ];

      allowedFields.forEach(f => {
        if (data[f] !== undefined) {
          fields.push(`${f} = ?`);
          values.push(data[f]);
        }
      });

      if (data.responsibilities !== undefined) {
        fields.push(`responsibilities = ?`);
        values.push(JSON.stringify(data.responsibilities));
      }
      if (data.requirements !== undefined) {
        fields.push(`requirements = ?`);
        values.push(JSON.stringify(data.requirements));
      }
      if (data.skills !== undefined) {
        fields.push(`skills = ?`);
        values.push(JSON.stringify(data.skills));
      }
      if (data.documents_required !== undefined) {
        fields.push(`documents_required = ?`);
        values.push(JSON.stringify(data.documents_required));
      }
      if (data.custom_questions !== undefined) {
        fields.push(`custom_questions = ?`);
        values.push(JSON.stringify(data.custom_questions));
      }
      if (data.status === 'published') {
        fields.push(`published_at = COALESCE(published_at, NOW())`);
      }

      if (fields.length > 0) {
        values.push(id);
        await pool.query(`UPDATE career_jobs SET ${fields.join(', ')} WHERE id = ?`, values);
      }
    } catch (dbErr) {
      const idx = mockCareerJobs.findIndex(j => String(j.id) === String(id) || j.job_id === id);
      if (idx !== -1) {
        mockCareerJobs[idx] = { ...mockCareerJobs[idx], ...data, updated_at: new Date() };
      }
    }

    sendSuccess(res, null, 'Job updated successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 6. Delete / Archive Job (Admin)
app.delete('/api/careers/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      // Check if applications exist
      const [apps]: any = await pool.query(
        `SELECT COUNT(*) as count FROM career_applications WHERE job_id = (SELECT job_id FROM career_jobs WHERE id = ? LIMIT 1)`,
        [id]
      );

      if (apps[0]?.count > 0) {
        // Soft delete/archive instead of hard delete to preserve application history
        await pool.query(`UPDATE career_jobs SET status = 'archived' WHERE id = ?`, [id]);
        return sendSuccess(res, null, 'Job archived because it has applications associated with it.');
      } else {
        await pool.query(`DELETE FROM career_jobs WHERE id = ?`, [id]);
        return sendSuccess(res, null, 'Job deleted successfully.');
      }
    } catch (dbErr) {
      const idx = mockCareerJobs.findIndex(j => String(j.id) === String(id) || j.job_id === id);
      if (idx !== -1) {
        mockCareerJobs.splice(idx, 1);
      }
      sendSuccess(res, null, 'Job deleted (offline mode)');
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 7. Candidate Application Submission (Public multipart upload)
app.post('/api/careers/apply', upload.single('resume'), async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    if (!data.job_id) {
      return res.status(400).json({ success: false, error: 'Job ID is required' });
    }
    if (!data.candidate_name || !data.email || !data.phone) {
      return res.status(400).json({ success: false, error: 'Full name, email, and phone are required' });
    }
    if (!file) {
      return res.status(400).json({ success: false, error: 'Resume/CV file upload is mandatory' });
    }

    const candidateEmail = String(data.email).trim().toLowerCase();
    const jobId = String(data.job_id).trim();

    // Duplicate Check: Has this email already applied to this active job?
    let isDuplicate = false;
    try {
      const [dupRows]: any = await pool.query(
        `SELECT id FROM career_applications WHERE LOWER(email) = ? AND job_id = ? LIMIT 1`,
        [candidateEmail, jobId]
      );
      if (dupRows.length > 0) isDuplicate = true;
    } catch {
      isDuplicate = mockCareerApplications.some(
        a => a.email.toLowerCase() === candidateEmail && a.job_id === jobId
      );
    }

    if (isDuplicate) {
      // Remove uploaded file to prevent disk clutter
      if (file && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch { }
      }
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this opportunity. Multiple duplicate submissions are not allowed.'
      });
    }

    // Generate unique Application ID: DIGI8-APP-2026-XXXXXX
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const applicationId = `DIGI8-APP-2026-${randomDigits}`;

    // Look up job title for notifications
    let jobTitle = 'Open Position';
    try {
      const [jobRows]: any = await pool.query(`SELECT title FROM career_jobs WHERE job_id = ? LIMIT 1`, [jobId]);
      if (jobRows.length > 0) jobTitle = jobRows[0].title;
    } catch {
      const match = mockCareerJobs.find(j => j.job_id === jobId);
      if (match) jobTitle = match.title;
    }

    const skillsArray = typeof data.skills === 'string'
      ? (data.skills.startsWith('[') ? parseJsonField(data.skills) : data.skills.split(',').map((s: string) => s.trim()).filter(Boolean))
      : (Array.isArray(data.skills) ? data.skills : []);

    const customAnswers = parseJsonField(data.custom_answers, []);

    const applicationRecord: any = {
      id: Date.now(),
      application_id: applicationId,
      job_id: jobId,
      candidate_name: data.candidate_name,
      email: candidateEmail,
      phone: data.phone,
      location: data.location || '',
      current_role: data.current_role || '',
      experience: data.experience || '',
      skills: skillsArray,
      linkedin: data.linkedin || '',
      portfolio: data.portfolio || '',
      github: data.github || '',
      availability: data.availability || 'Immediate',
      expected_compensation: data.expected_compensation || '',
      cover_message: data.cover_message || '',
      resume_file: file.filename,
      resume_original_name: file.originalname,
      custom_answers: customAnswers,
      documents: [{ type: 'Resume', name: file.originalname, file: file.filename }],
      status: 'applied',
      stage_slug: 'applied',
      priority: 'normal',
      source: data.source || 'DIGI8 Careers Portal',
      created_at: new Date()
    };

    try {
      const [result]: any = await pool.query(
        `INSERT INTO career_applications 
         (application_id, job_id, candidate_name, email, phone, location, current_role, experience, skills, linkedin, portfolio, github, availability, expected_compensation, cover_message, resume_file, resume_original_name, custom_answers, documents, status, stage_slug, priority, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationRecord.application_id, applicationRecord.job_id, applicationRecord.candidate_name,
          applicationRecord.email, applicationRecord.phone, applicationRecord.location,
          applicationRecord.current_role, applicationRecord.experience, JSON.stringify(applicationRecord.skills),
          applicationRecord.linkedin, applicationRecord.portfolio, applicationRecord.github,
          applicationRecord.availability, applicationRecord.expected_compensation, applicationRecord.cover_message,
          applicationRecord.resume_file, applicationRecord.resume_original_name, JSON.stringify(applicationRecord.custom_answers),
          JSON.stringify(applicationRecord.documents), applicationRecord.status, applicationRecord.stage_slug,
          applicationRecord.priority, applicationRecord.source
        ]
      );
      applicationRecord.id = result.insertId;

      // Log initial stage history in DB
      await pool.query(
        `INSERT INTO career_stage_history (application_id, from_stage, to_stage, changed_by, reason) VALUES (?, NULL, 'applied', 'Candidate Submission', 'Application submitted')`,
        [applicationRecord.application_id]
      );
      // Log audit
      await pool.query(
        `INSERT INTO career_audit_logs (action_type, entity_type, entity_id, performed_by, details) VALUES ('application_submitted', 'career_application', ?, 'Candidate Portal', ?)`,
        [applicationRecord.application_id, `Application submitted for job ID ${jobId}`]
      );
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving career application in fallback mode:', (dbErr as any).message);
      mockCareerApplications.unshift(applicationRecord);
      mockStageHistory.unshift({
        id: Date.now(),
        application_id: applicationRecord.application_id,
        from_stage: null,
        to_stage: 'applied',
        changed_by: 'Candidate Submission',
        reason: 'Application submitted',
        created_at: new Date()
      });
      mockAuditLogs.unshift({
        id: Date.now(),
        action_type: 'application_submitted',
        entity_type: 'career_application',
        entity_id: applicationRecord.application_id,
        performed_by: 'Candidate Portal',
        details: `Application submitted for job ID ${jobId}`,
        created_at: new Date()
      });
    }

    // Send candidate email confirmation
    const candidateMailRes = await sendCandidateApplicationReceived(
      applicationRecord.email,
      applicationRecord.candidate_name,
      jobTitle,
      applicationRecord.application_id
    );

    // Send admin notification
    await sendAdminCareerNotification(applicationRecord, jobTitle);

    // Record candidate confirmation to email logs
    const candidateLog = {
      id: Date.now(),
      application_id: applicationRecord.application_id,
      candidate_email: applicationRecord.email,
      template_id: 1,
      template_name: 'Application Received Confirmation',
      subject: `Application Received: ${jobTitle} — DIGI8 Solutions (${applicationRecord.application_id})`,
      body: `Automated confirmation sent to candidate for application ${applicationRecord.application_id}.`,
      status: candidateMailRes.success ? 'delivered' : 'failed',
      sent_by: 'Automation Engine',
      sent_at: new Date()
    };
    try {
      await pool.query(
        `INSERT INTO career_email_logs (application_id, candidate_email, template_id, template_name, subject, body, status, sent_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [candidateLog.application_id, candidateLog.candidate_email, candidateLog.template_id, candidateLog.template_name, candidateLog.subject, candidateLog.body, candidateLog.status, candidateLog.sent_by]
      );
    } catch {
      mockEmailLogs.unshift(candidateLog);
    }

    // Broadcast Realtime SSE Alert to Admin Dashboard
    broadcastAdminNotification(
      'NEW_CAREER_APPLICATION',
      `🎯 New Application: ${jobTitle}`,
      `Candidate: ${applicationRecord.candidate_name} (${applicationRecord.application_id})`,
      applicationRecord
    );

    sendSuccess(res, {
      application_id: applicationId,
      job_title: jobTitle,
      candidate_name: applicationRecord.candidate_name
    }, 'Application submitted successfully!');
  } catch (err) {
    sendError(res, err);
  }
});

// 8. Get All Applications (Admin)
app.get('/api/careers/applications', async (req, res) => {
  try {
    const { job_id, status, experience, search } = req.query;

    try {
      let query = `
        SELECT a.*, j.title as job_title, j.category as job_category
        FROM career_applications a
        LEFT JOIN career_jobs j ON a.job_id = j.job_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (job_id && job_id !== 'All') {
        query += ` AND a.job_id = ?`;
        params.push(job_id);
      }
      if (status && status !== 'All') {
        query += ` AND a.status = ?`;
        params.push(status);
      }
      if (experience && experience !== 'All') {
        query += ` AND a.experience LIKE ?`;
        params.push(`%${experience}%`);
      }
      if (search) {
        query += ` AND (a.candidate_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ? OR a.application_id LIKE ? OR j.title LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s, s);
      }

      query += ` ORDER BY a.created_at DESC`;

      const [rows]: any = await pool.query(query, params);
      const apps = rows.map((a: any) => ({
        ...a,
        skills: parseJsonField(a.skills),
        custom_answers: parseJsonField(a.custom_answers),
        documents: parseJsonField(a.documents)
      }));

      sendSuccess(res, apps);
    } catch (dbErr) {
      let filtered = [...mockCareerApplications];

      if (job_id && job_id !== 'All') {
        filtered = filtered.filter(a => a.job_id === job_id);
      }
      if (status && status !== 'All') {
        filtered = filtered.filter(a => a.status === status);
      }
      if (experience && experience !== 'All') {
        filtered = filtered.filter(a => a.experience && a.experience.includes(String(experience)));
      }
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(a =>
          a.candidate_name.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s) ||
          a.application_id.toLowerCase().includes(s) ||
          (a.phone && a.phone.includes(s))
        );
      }

      const mapped = filtered.map(a => {
        const jobMatch = mockCareerJobs.find(j => j.job_id === a.job_id);
        return {
          ...a,
          job_title: jobMatch ? jobMatch.title : a.job_id,
          job_category: jobMatch ? jobMatch.category : ''
        };
      });

      sendSuccess(res, mapped);
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 9. Get Single Application by ID (Admin)
app.get('/api/careers/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const [rows]: any = await pool.query(
        `SELECT a.*, j.title as job_title, j.category as job_category, j.custom_questions
         FROM career_applications a
         LEFT JOIN career_jobs j ON a.job_id = j.job_id
         WHERE a.id = ? OR a.application_id = ?
         LIMIT 1`,
        [isNaN(Number(id)) ? -1 : Number(id), id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }

      const a = rows[0];
      const application = {
        ...a,
        skills: parseJsonField(a.skills),
        custom_answers: parseJsonField(a.custom_answers),
        documents: parseJsonField(a.documents),
        job_custom_questions: parseJsonField(a.custom_questions)
      };

      sendSuccess(res, application);
    } catch (dbErr) {
      const a = mockCareerApplications.find(item => String(item.id) === String(id) || item.application_id === id);
      if (!a) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }
      const jobMatch = mockCareerJobs.find(j => j.job_id === a.job_id);
      sendSuccess(res, {
        ...a,
        job_title: jobMatch ? jobMatch.title : a.job_id,
        job_category: jobMatch ? jobMatch.category : '',
        job_custom_questions: jobMatch ? jobMatch.custom_questions : []
      });
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 10. Update Application (Admin - status change, candidate info edit)
app.put('/api/careers/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    try {
      const fields: string[] = [];
      const values: any[] = [];

      const allowedFields = [
        'candidate_name', 'email', 'phone', 'location', 'current_role',
        'experience', 'linkedin', 'portfolio', 'github', 'availability',
        'expected_compensation', 'cover_message', 'status'
      ];

      allowedFields.forEach(f => {
        if (data[f] !== undefined) {
          fields.push(`${f} = ?`);
          values.push(data[f]);
        }
      });

      if (data.skills !== undefined) {
        fields.push(`skills = ?`);
        values.push(JSON.stringify(Array.isArray(data.skills) ? data.skills : []));
      }
      if (data.custom_answers !== undefined) {
        fields.push(`custom_answers = ?`);
        values.push(JSON.stringify(data.custom_answers));
      }

      if (fields.length > 0) {
        values.push(isNaN(Number(id)) ? -1 : Number(id), id);
        await pool.query(`UPDATE career_applications SET ${fields.join(', ')} WHERE id = ? OR application_id = ?`, values);
      }
    } catch (dbErr) {
      const idx = mockCareerApplications.findIndex(a => String(a.id) === String(id) || a.application_id === id);
      if (idx !== -1) {
        mockCareerApplications[idx] = { ...mockCareerApplications[idx], ...data, updated_at: new Date() };
      }
    }

    broadcastAdminNotification(
      'APPLICATION_UPDATED',
      `🔄 Application Updated: ${data.candidate_name || id}`,
      `Status: ${data.status || 'Updated'}`,
      { id, ...data }
    );

    sendSuccess(res, null, 'Application updated successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 11. Delete Application (Admin)
app.delete('/api/careers/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await pool.query(`DELETE FROM career_applications WHERE id = ? OR application_id = ?`, [isNaN(Number(id)) ? -1 : Number(id), id]);
    } catch (dbErr) {
      const idx = mockCareerApplications.findIndex(a => String(a.id) === String(id) || a.application_id === id);
      if (idx !== -1) {
        mockCareerApplications.splice(idx, 1);
      }
    }

    sendSuccess(res, null, 'Application deleted successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 12. Secure Resume & Document Access Endpoint
app.get('/api/careers/documents/:filename', (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const safeFilename = path.basename(rawFilename); // prevent directory traversal
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Document file not found' });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const isDownload = req.query.download === 'true';
    const disposition = isDownload ? `attachment; filename="${safeFilename}"` : `inline; filename="${safeFilename}"`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', disposition);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    sendError(res, err);
  }
});
// -------------------------------------------------------------
// --- DIGI8 CAREERS PLATFORM (PHASE 2: ATS + PIPELINE + CRM) ---
// -------------------------------------------------------------

// Automation Rules Execution Helper
const triggerAutomationRules = async (
  eventTrigger: 'stage_change' | 'interview_scheduled',
  stageSlug: string,
  application: any,
  jobTitle: string,
  extraVariables: Record<string, any> = {}
) => {
  try {
    let rules: any[] = [];
    try {
      const [rows]: any = await pool.query(
        `SELECT r.*, t.subject, t.body, t.name as template_name
         FROM career_automation_rules r
         LEFT JOIN career_email_templates t ON r.email_template_id = t.id
         WHERE r.is_active = 1 AND r.event_trigger = ? AND (r.trigger_stage = ? OR r.trigger_stage IS NULL)`,
        [eventTrigger, stageSlug]
      );
      rules = rows;
    } catch {
      rules = mockAutomationRules
        .filter(r => r.is_active && r.event_trigger === eventTrigger && (!r.trigger_stage || r.trigger_stage === stageSlug))
        .map(r => {
          const t = mockEmailTemplates.find(tpl => tpl.id === r.email_template_id);
          return { ...r, subject: t?.subject || '', body: t?.body || '', template_name: t?.name || '' };
        });
    }

    for (const rule of rules) {
      if (rule.action_type === 'send_email' && rule.body && application.email) {
        const variables: Record<string, any> = {
          candidate_name: application.candidate_name,
          job_title: jobTitle || 'Open Position',
          application_id: application.application_id,
          company_name: 'DIGI8 Solutions',
          recruiter_name: application.recruiter_name || 'DIGI8 Talent Team',
          stage_name: stageSlug,
          ...extraVariables
        };

        const compiledSubject = compileEmailTemplate(rule.subject, variables);
        const compiledBody = compileEmailTemplate(rule.body, variables);

        const sendRes = await sendRecruiterEmail(
          application.email,
          compiledSubject,
          compiledBody,
          { candidateName: application.candidate_name, jobTitle }
        );

        // Record email log
        try {
          await pool.query(
            `INSERT INTO career_email_logs (application_id, candidate_email, template_id, template_name, subject, body, status, sent_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Automation Engine')`,
            [application.application_id, application.email, rule.email_template_id, rule.template_name, compiledSubject, compiledBody, sendRes.success ? 'delivered' : 'failed']
          );
        } catch {
          mockEmailLogs.unshift({
            id: Date.now() + Math.random(),
            application_id: application.application_id,
            candidate_email: application.email,
            template_id: rule.email_template_id,
            template_name: rule.template_name,
            subject: compiledSubject,
            body: compiledBody,
            status: sendRes.success ? 'delivered' : 'failed',
            sent_by: 'Automation Engine',
            sent_at: new Date()
          });
        }
      }
    }
  } catch (err) {
    console.error('Error executing career automation rule:', err);
  }
};

// 1. Get Recruitment Stages
app.get('/api/careers/stages', async (_req, res) => {
  try {
    try {
      const [rows] = await pool.query(`SELECT * FROM career_stages ORDER BY stage_order ASC`);
      sendSuccess(res, rows);
    } catch {
      sendSuccess(res, [...mockCareerStages].sort((a, b) => a.stage_order - b.stage_order));
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 2. Create Custom Recruitment Stage
app.post('/api/careers/stages', async (req, res) => {
  try {
    const { name, slug, color_code, candidate_visible, candidate_label } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, error: 'Name and slug are required' });

    const safeSlug = String(slug).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const color = color_code || '#06b6d4';
    const candVis = candidate_visible !== undefined ? (candidate_visible ? 1 : 0) : 1;
    const candLabel = candidate_label || name;

    let newStage: any = null;
    try {
      const [maxOrderRow]: any = await pool.query(`SELECT MAX(stage_order) as max_ord FROM career_stages`);
      const nextOrder = (maxOrderRow[0]?.max_ord || 0) + 1;

      const [insertRes]: any = await pool.query(
        `INSERT INTO career_stages (name, slug, stage_order, color_code, is_system, candidate_visible, candidate_label)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [name, safeSlug, nextOrder, color, candVis, candLabel]
      );
      newStage = { id: insertRes.insertId, name, slug: safeSlug, stage_order: nextOrder, color_code: color, is_system: 0, candidate_visible: candVis, candidate_label: candLabel };
    } catch {
      const nextOrder = (Math.max(...mockCareerStages.map(s => s.stage_order), 0)) + 1;
      newStage = {
        id: Date.now(),
        name,
        slug: safeSlug,
        stage_order: nextOrder,
        color_code: color,
        is_system: 0,
        candidate_visible: candVis,
        candidate_label: candLabel
      };
      mockCareerStages.push(newStage);
    }

    sendSuccess(res, newStage, 'Stage created successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 3. Update Recruitment Stage
app.put('/api/careers/stages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color_code, candidate_visible, candidate_label } = req.body;

    try {
      await pool.query(
        `UPDATE career_stages SET name = COALESCE(?, name), color_code = COALESCE(?, color_code),
         candidate_visible = COALESCE(?, candidate_visible), candidate_label = COALESCE(?, candidate_label)
         WHERE id = ?`,
        [name, color_code, candidate_visible !== undefined ? (candidate_visible ? 1 : 0) : null, candidate_label, id]
      );
    } catch {
      const stage = mockCareerStages.find(s => String(s.id) === String(id));
      if (stage) {
        if (name) stage.name = name;
        if (color_code) stage.color_code = color_code;
        if (candidate_visible !== undefined) stage.candidate_visible = candidate_visible ? 1 : 0;
        if (candidate_label) stage.candidate_label = candidate_label;
      }
    }

    sendSuccess(res, null, 'Stage updated successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 4. Reorder Stages (Bulk Update)
app.put('/api/careers/stages/reorder', async (req, res) => {
  try {
    const { stages } = req.body; // Array of { id, stage_order }
    if (!Array.isArray(stages)) return res.status(400).json({ success: false, error: 'stages array required' });

    try {
      for (const item of stages) {
        await pool.query(`UPDATE career_stages SET stage_order = ? WHERE id = ?`, [item.stage_order, item.id]);
      }
    } catch {
      for (const item of stages) {
        const match = mockCareerStages.find(s => String(s.id) === String(item.id));
        if (match) match.stage_order = item.stage_order;
      }
    }

    sendSuccess(res, null, 'Stages reordered successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 5. Delete Custom Stage
app.delete('/api/careers/stages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const [stageRow]: any = await pool.query(`SELECT is_system, slug FROM career_stages WHERE id = ?`, [id]);
      if (stageRow.length > 0 && stageRow[0].is_system) {
        return res.status(400).json({ success: false, error: 'System core stages cannot be deleted' });
      }
      await pool.query(`DELETE FROM career_stages WHERE id = ? AND is_system = 0`, [id]);
    } catch {
      const idx = mockCareerStages.findIndex(s => String(s.id) === String(id));
      if (idx !== -1) {
        if (mockCareerStages[idx].is_system) {
          return res.status(400).json({ success: false, error: 'System core stages cannot be deleted' });
        }
        mockCareerStages.splice(idx, 1);
      }
    }

    sendSuccess(res, null, 'Stage deleted successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 6. Update Application Stage (The Core Pipeline Stage Transition)
app.put('/api/careers/applications/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage_slug, reason, changed_by, recruiter_id, recruiter_name, priority } = req.body;

    if (!stage_slug) return res.status(400).json({ success: false, error: 'stage_slug is required' });

    // Fetch existing application
    let appRecord: any = null;
    let jobTitle = 'Open Position';
    try {
      const [rows]: any = await pool.query(
        `SELECT a.*, j.title as job_title FROM career_applications a LEFT JOIN career_jobs j ON a.job_id = j.job_id WHERE a.id = ? OR a.application_id = ? LIMIT 1`,
        [isNaN(Number(id)) ? -1 : Number(id), id]
      );
      if (rows.length > 0) {
        appRecord = rows[0];
        jobTitle = rows[0].job_title || 'Open Position';
      }
    } catch {
      appRecord = mockCareerApplications.find(a => String(a.id) === String(id) || a.application_id === id);
      if (appRecord) {
        const j = mockCareerJobs.find(job => job.job_id === appRecord.job_id);
        if (j) jobTitle = j.title;
      }
    }

    if (!appRecord) {
      return res.status(404).json({ success: false, error: 'Application record not found' });
    }

    const previousStage = appRecord.stage_slug || 'applied';
    const performer = changed_by || 'Admin Recruiter';

    // Map stage_slug to general status field
    let generalStatus = stage_slug;
    if (stage_slug === 'applied') generalStatus = 'new';
    else if (stage_slug === 'rejected') generalStatus = 'rejected';
    else if (stage_slug === 'hired') generalStatus = 'hired';
    else if (['shortlisted', 'screening', 'interview', 'assessment', 'selected'].includes(stage_slug)) {
      generalStatus = stage_slug;
    }

    // Update in DB
    try {
      await pool.query(
        `UPDATE career_applications 
         SET stage_slug = ?, status = ?,
             recruiter_id = COALESCE(?, recruiter_id),
             recruiter_name = COALESCE(?, recruiter_name),
             priority = COALESCE(?, priority),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? OR application_id = ?`,
        [stage_slug, generalStatus, recruiter_id || null, recruiter_name || null, priority || null, appRecord.id, appRecord.application_id]
      );

      // Record Stage History
      await pool.query(
        `INSERT INTO career_stage_history (application_id, from_stage, to_stage, changed_by, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [appRecord.application_id, previousStage, stage_slug, performer, reason || `Candidate transitioned from ${previousStage} to ${stage_slug}`]
      );

      // Record Audit Log
      await pool.query(
        `INSERT INTO career_audit_logs (action_type, entity_type, entity_id, performed_by, details)
         VALUES ('stage_changed', 'career_application', ?, ?, ?)`,
        [appRecord.application_id, performer, `Moved from ${previousStage} to ${stage_slug}. Reason: ${reason || 'Pipeline update'}`]
      );
    } catch {
      // Fallback mock update
      appRecord.stage_slug = stage_slug;
      appRecord.status = generalStatus;
      if (recruiter_id) appRecord.recruiter_id = recruiter_id;
      if (recruiter_name) appRecord.recruiter_name = recruiter_name;
      if (priority) appRecord.priority = priority;
      appRecord.updated_at = new Date();

      mockStageHistory.unshift({
        id: Date.now(),
        application_id: appRecord.application_id,
        from_stage: previousStage,
        to_stage: stage_slug,
        changed_by: performer,
        reason: reason || `Candidate moved from ${previousStage} to ${stage_slug}`,
        created_at: new Date()
      });

      mockAuditLogs.unshift({
        id: Date.now(),
        action_type: 'stage_changed',
        entity_type: 'career_application',
        entity_id: appRecord.application_id,
        performed_by: performer,
        details: `Stage updated from ${previousStage} to ${stage_slug}`,
        created_at: new Date()
      });
    }

    // Trigger any active automation rules for this stage transition
    triggerAutomationRules('stage_change', stage_slug, appRecord, jobTitle);

    // Broadcast Realtime SSE event
    broadcastAdminNotification(
      'APPLICATION_STAGE_CHANGED',
      `🔄 Candidate Stage Updated: ${appRecord.candidate_name}`,
      `Moved to ${stage_slug.toUpperCase()} for ${jobTitle}`,
      {
        application_id: appRecord.application_id,
        previous_stage: previousStage,
        new_stage: stage_slug,
        candidate_name: appRecord.candidate_name,
        job_title: jobTitle
      }
    );

    sendSuccess(res, { application_id: appRecord.application_id, stage_slug, status: generalStatus }, 'Application stage updated successfully');
  } catch (err) {
    sendError(res, err);
  }
});

// 7. Get Chronological Timeline for an Application
app.get('/api/careers/applications/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;

    let appId = id;
    try {
      const [appRow]: any = await pool.query(
        `SELECT application_id FROM career_applications WHERE id = ? OR application_id = ? LIMIT 1`,
        [isNaN(Number(id)) ? -1 : Number(id), id]
      );
      if (appRow.length > 0) appId = appRow[0].application_id;
    } catch {
      const match = mockCareerApplications.find(a => String(a.id) === String(id) || a.application_id === id);
      if (match) appId = match.application_id;
    }

    let timelineItems: any[] = [];

    try {
      // 1. Stage transitions
      const [stages]: any = await pool.query(
        `SELECT id, 'stage_change' as event_type, from_stage, to_stage, changed_by, reason as details, created_at FROM career_stage_history WHERE application_id = ? ORDER BY created_at DESC`,
        [appId]
      );
      // 2. Notes
      const [notes]: any = await pool.query(
        `SELECT id, 'note_added' as event_type, author_name as changed_by, note_text as details, is_private, created_at FROM career_notes WHERE application_id = ? ORDER BY created_at DESC`,
        [appId]
      );
      // 3. Email Logs
      const [emails]: any = await pool.query(
        `SELECT id, 'email_sent' as event_type, sent_by as changed_by, CONCAT(subject, ' (Status: ', status, ')') as details, sent_at as created_at FROM career_email_logs WHERE application_id = ? ORDER BY sent_at DESC`,
        [appId]
      );
      // 4. Interviews
      const [interviews]: any = await pool.query(
        `SELECT id, 'interview_scheduled' as event_type, interviewer_name as changed_by, CONCAT(interview_type, ' with ', interviewer_name, ' on ', scheduled_at) as details, created_at FROM career_interviews WHERE application_id = ? ORDER BY created_at DESC`,
        [appId]
      );

      timelineItems = [...stages, ...notes, ...emails, ...interviews];
    } catch {
      // Mock timeline items
      const stages = mockStageHistory.filter(s => s.application_id === appId).map(s => ({
        ...s,
        event_type: 'stage_change',
        details: s.reason
      }));
      const notes = mockCareerNotes.filter(n => n.application_id === appId).map(n => ({
        ...n,
        event_type: 'note_added',
        details: n.note_text,
        changed_by: n.author_name
      }));
      const emails = mockEmailLogs.filter(e => e.application_id === appId).map(e => ({
        ...e,
        event_type: 'email_sent',
        details: `${e.subject} (Status: ${e.status})`,
        changed_by: e.sent_by,
        created_at: e.sent_at
      }));
      const interviews = mockInterviews.filter(i => i.application_id === appId).map(i => ({
        ...i,
        event_type: 'interview_scheduled',
        details: `${i.interview_type} scheduled with ${i.interviewer_name}`,
        changed_by: i.interviewer_name
      }));

      timelineItems = [...stages, ...notes, ...emails, ...interviews];
    }

    timelineItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    sendSuccess(res, timelineItems);
  } catch (err) {
    sendError(res, err);
  }
});

// 8. Candidate CRM: Grouped by Email
app.get('/api/careers/candidates', async (_req, res) => {
  try {
    try {
      const [rows]: any = await pool.query(`
        SELECT 
          LOWER(a.email) as email,
          a.candidate_name,
          a.phone,
          a.location,
          a.current_role,
          a.experience,
          a.recruiter_name,
          COUNT(a.id) as total_applications,
          MAX(a.created_at) as latest_application_date,
          SUBSTRING_INDEX(GROUP_CONCAT(a.application_id ORDER BY a.created_at DESC), ',', 1) as latest_application_id,
          SUBSTRING_INDEX(GROUP_CONCAT(COALESCE(a.stage_slug, 'applied') ORDER BY a.created_at DESC), ',', 1) as latest_stage,
          SUBSTRING_INDEX(GROUP_CONCAT(COALESCE(j.title, 'Open Opportunity') ORDER BY a.created_at DESC), ',', 1) as latest_job_title
        FROM career_applications a
        LEFT JOIN career_jobs j ON a.job_id = j.job_id
        GROUP BY LOWER(a.email), a.candidate_name, a.phone, a.location, a.current_role, a.experience, a.recruiter_name
        ORDER BY latest_application_date DESC
      `);

      // Enrich with tags
      const [allTags]: any = await pool.query(`SELECT candidate_email, tag_name, color_code FROM career_candidate_tags`);
      const enriched = rows.map((c: any) => ({
        ...c,
        tags: allTags.filter((t: any) => t.candidate_email && t.candidate_email.toLowerCase() === c.email)
      }));

      sendSuccess(res, enriched);
    } catch {
      // Mock Candidate aggregation
      const map = new Map<string, any>();
      mockCareerApplications.forEach(app => {
        const key = app.email.toLowerCase();
        const job = mockCareerJobs.find(j => j.job_id === app.job_id);
        if (!map.has(key)) {
          map.set(key, {
            email: key,
            candidate_name: app.candidate_name,
            phone: app.phone,
            location: app.location,
            current_role: app.current_role,
            experience: app.experience,
            recruiter_name: app.recruiter_name || '',
            total_applications: 1,
            latest_application_date: app.created_at,
            latest_application_id: app.application_id,
            latest_stage: app.stage_slug || 'applied',
            latest_job_title: job?.title || 'Open Opportunity',
            tags: mockCandidateTags.filter(t => t.candidate_email?.toLowerCase() === key)
          });
        } else {
          const existing = map.get(key);
          existing.total_applications += 1;
          if (new Date(app.created_at) > new Date(existing.latest_application_date)) {
            existing.latest_application_date = app.created_at;
            existing.latest_application_id = app.application_id;
            existing.latest_stage = app.stage_slug || 'applied';
            existing.latest_job_title = job?.title || 'Open Opportunity';
          }
        }
      });

      const candidates = Array.from(map.values()).sort(
        (a, b) => new Date(b.latest_application_date).getTime() - new Date(a.latest_application_date).getTime()
      );
      sendSuccess(res, candidates);
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 9. Candidate CRM: Single Candidate Profile (All applications, notes, tags)
app.get('/api/careers/candidates/:email', async (req, res) => {
  try {
    const candidateEmail = String(req.params.email).toLowerCase().trim();

    let candidateProfile: any = null;
    let applications: any[] = [];
    let notes: any[] = [];
    let tags: any[] = [];
    let interviews: any[] = [];
    let emailLogs: any[] = [];

    try {
      const [appRows]: any = await pool.query(
        `SELECT a.*, j.title as job_title, j.category as job_category, j.job_type, j.work_mode
         FROM career_applications a
         LEFT JOIN career_jobs j ON a.job_id = j.job_id
         WHERE LOWER(a.email) = ?
         ORDER BY a.created_at DESC`,
        [candidateEmail]
      );
      applications = appRows;

      if (applications.length > 0) {
        const latest = applications[0];
        candidateProfile = {
          candidate_name: latest.candidate_name,
          email: candidateEmail,
          phone: latest.phone,
          location: latest.location,
          current_role: latest.current_role,
          experience: latest.experience,
          linkedin: latest.linkedin,
          portfolio: latest.portfolio,
          github: latest.github,
          skills: parseJsonField(latest.skills, []),
          created_at: latest.created_at
        };

        const [noteRows]: any = await pool.query(
          `SELECT * FROM career_notes WHERE LOWER(candidate_email) = ? ORDER BY created_at DESC`,
          [candidateEmail]
        );
        notes = noteRows;

        const [tagRows]: any = await pool.query(
          `SELECT * FROM career_candidate_tags WHERE LOWER(candidate_email) = ?`,
          [candidateEmail]
        );
        tags = tagRows;

        const [interviewRows]: any = await pool.query(
          `SELECT * FROM career_interviews WHERE LOWER(candidate_email) = ? ORDER BY scheduled_at DESC`,
          [candidateEmail]
        );
        interviews = interviewRows;

        const [emailRows]: any = await pool.query(
          `SELECT * FROM career_email_logs WHERE LOWER(candidate_email) = ? ORDER BY sent_at DESC`,
          [candidateEmail]
        );
        emailLogs = emailRows;
      }
    } catch {
      // Mock Fallback
      applications = mockCareerApplications
        .filter(a => a.email.toLowerCase() === candidateEmail)
        .map(a => {
          const job = mockCareerJobs.find(j => j.job_id === a.job_id);
          return { ...a, job_title: job?.title || 'Open Opportunity', job_category: job?.category, job_type: job?.job_type, work_mode: job?.work_mode };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (applications.length > 0) {
        const latest = applications[0];
        candidateProfile = {
          candidate_name: latest.candidate_name,
          email: candidateEmail,
          phone: latest.phone,
          location: latest.location,
          current_role: latest.current_role,
          experience: latest.experience,
          linkedin: latest.linkedin,
          portfolio: latest.portfolio,
          github: latest.github,
          skills: Array.isArray(latest.skills) ? latest.skills : [],
          created_at: latest.created_at
        };

        notes = mockCareerNotes.filter(n => n.candidate_email?.toLowerCase() === candidateEmail);
        tags = mockCandidateTags.filter(t => t.candidate_email?.toLowerCase() === candidateEmail);
        interviews = mockInterviews.filter(i => i.candidate_email?.toLowerCase() === candidateEmail);
        emailLogs = mockEmailLogs.filter(e => e.candidate_email?.toLowerCase() === candidateEmail);
      }
    }

    if (!candidateProfile) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    sendSuccess(res, {
      profile: candidateProfile,
      applications,
      notes,
      tags,
      interviews,
      emailLogs
    });
  } catch (err) {
    sendError(res, err);
  }
});

// 10. Notes Endpoints
app.get('/api/careers/notes', async (req, res) => {
  try {
    const { application_id, candidate_email } = req.query;
    try {
      let query = `SELECT * FROM career_notes WHERE 1=1`;
      const params: any[] = [];
      if (application_id) { query += ` AND application_id = ?`; params.push(application_id); }
      if (candidate_email) { query += ` AND LOWER(candidate_email) = ?`; params.push(String(candidate_email).toLowerCase()); }
      query += ` ORDER BY created_at DESC`;

      const [rows] = await pool.query(query, params);
      sendSuccess(res, rows);
    } catch {
      let result = [...mockCareerNotes];
      if (application_id) result = result.filter(n => n.application_id === application_id);
      if (candidate_email) result = result.filter(n => n.candidate_email?.toLowerCase() === String(candidate_email).toLowerCase());
      sendSuccess(res, result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/notes', async (req, res) => {
  try {
    const { application_id, candidate_email, author_name, author_role, note_text, is_private } = req.body;
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text is required' });

    let noteRecord: any = null;
    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_notes (application_id, candidate_email, author_name, author_role, note_text, is_private)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [application_id || null, candidate_email || null, author_name || 'Recruiter', author_role || 'Talent Team', note_text, is_private ? 1 : 0]
      );
      noteRecord = { id: insertRes.insertId, application_id, candidate_email, author_name, author_role, note_text, is_private: is_private ? 1 : 0, created_at: new Date() };
    } catch {
      noteRecord = {
        id: Date.now(),
        application_id,
        candidate_email,
        author_name: author_name || 'Recruiter',
        author_role: author_role || 'Talent Team',
        note_text,
        is_private: is_private ? 1 : 0,
        created_at: new Date()
      };
      mockCareerNotes.unshift(noteRecord);
    }

    sendSuccess(res, noteRecord, 'Note created successfully');
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/careers/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM career_notes WHERE id = ?`, [id]);
    } catch {
      const idx = mockCareerNotes.findIndex(n => String(n.id) === String(id));
      if (idx !== -1) mockCareerNotes.splice(idx, 1);
    }
    sendSuccess(res, null, 'Note deleted');
  } catch (err) {
    sendError(res, err);
  }
});

// 11. Tags Endpoints
app.get('/api/careers/tags', async (req, res) => {
  try {
    const { application_id, candidate_email } = req.query;
    try {
      let query = `SELECT * FROM career_candidate_tags WHERE 1=1`;
      const params: any[] = [];
      if (application_id) { query += ` AND application_id = ?`; params.push(application_id); }
      if (candidate_email) { query += ` AND LOWER(candidate_email) = ?`; params.push(String(candidate_email).toLowerCase()); }

      const [rows] = await pool.query(query, params);
      sendSuccess(res, rows);
    } catch {
      let tags = [...mockCandidateTags];
      if (application_id) tags = tags.filter(t => t.application_id === application_id);
      if (candidate_email) tags = tags.filter(t => t.candidate_email?.toLowerCase() === String(candidate_email).toLowerCase());
      sendSuccess(res, tags);
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/tags', async (req, res) => {
  try {
    const { application_id, candidate_email, tag_name, color_code } = req.body;
    if (!tag_name) return res.status(400).json({ success: false, error: 'tag_name is required' });

    const color = color_code || '#06b6d4';
    let tagRecord: any = null;

    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_candidate_tags (application_id, candidate_email, tag_name, color_code)
         VALUES (?, ?, ?, ?)`,
        [application_id || null, candidate_email || null, tag_name.trim(), color]
      );
      tagRecord = { id: insertRes.insertId, application_id, candidate_email, tag_name: tag_name.trim(), color_code: color, created_at: new Date() };
    } catch {
      tagRecord = {
        id: Date.now(),
        application_id,
        candidate_email,
        tag_name: tag_name.trim(),
        color_code: color,
        created_at: new Date()
      };
      mockCandidateTags.push(tagRecord);
    }

    sendSuccess(res, tagRecord, 'Tag added successfully');
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/careers/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM career_candidate_tags WHERE id = ?`, [id]);
    } catch {
      const idx = mockCandidateTags.findIndex(t => String(t.id) === String(id));
      if (idx !== -1) mockCandidateTags.splice(idx, 1);
    }
    sendSuccess(res, null, 'Tag removed');
  } catch (err) {
    sendError(res, err);
  }
});

// 12. Tasks Endpoints
app.get('/api/careers/tasks', async (req, res) => {
  try {
    const { application_id, status, assigned_to } = req.query;
    try {
      let query = `SELECT * FROM career_tasks WHERE 1=1`;
      const params: any[] = [];
      if (application_id) { query += ` AND application_id = ?`; params.push(application_id); }
      if (status) { query += ` AND status = ?`; params.push(status); }
      if (assigned_to) { query += ` AND assigned_to = ?`; params.push(assigned_to); }
      query += ` ORDER BY due_date ASC, created_at DESC`;

      const [rows] = await pool.query(query, params);
      sendSuccess(res, rows);
    } catch {
      let tasks = [...mockCareerTasks];
      if (application_id) tasks = tasks.filter(t => t.application_id === application_id);
      if (status) tasks = tasks.filter(t => t.status === status);
      if (assigned_to) tasks = tasks.filter(t => t.assigned_to === assigned_to);
      sendSuccess(res, tasks);
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/tasks', async (req, res) => {
  try {
    const { application_id, title, description, due_date, assigned_to } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

    let taskRecord: any = null;
    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_tasks (application_id, title, description, due_date, assigned_to, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [application_id || null, title, description || '', due_date || null, assigned_to || 'Recruiter']
      );
      taskRecord = { id: insertRes.insertId, application_id, title, description, due_date, assigned_to, status: 'pending', created_at: new Date() };
    } catch {
      taskRecord = {
        id: Date.now(),
        application_id,
        title,
        description: description || '',
        due_date: due_date || null,
        assigned_to: assigned_to || 'Recruiter',
        status: 'pending',
        created_at: new Date()
      };
      mockCareerTasks.push(taskRecord);
    }

    sendSuccess(res, taskRecord, 'Task created successfully');
  } catch (err) {
    sendError(res, err);
  }
});

app.put('/api/careers/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, due_date, assigned_to } = req.body;

    try {
      await pool.query(
        `UPDATE career_tasks SET 
          status = COALESCE(?, status),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          due_date = COALESCE(?, due_date),
          assigned_to = COALESCE(?, assigned_to)
         WHERE id = ?`,
        [status, title, description, due_date, assigned_to, id]
      );
    } catch {
      const task = mockCareerTasks.find(t => String(t.id) === String(id));
      if (task) {
        if (status) task.status = status;
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (due_date !== undefined) task.due_date = due_date;
        if (assigned_to) task.assigned_to = assigned_to;
      }
    }

    sendSuccess(res, null, 'Task updated');
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/careers/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM career_tasks WHERE id = ?`, [id]);
    } catch {
      const idx = mockCareerTasks.findIndex(t => String(t.id) === String(id));
      if (idx !== -1) mockCareerTasks.splice(idx, 1);
    }
    sendSuccess(res, null, 'Task deleted');
  } catch (err) {
    sendError(res, err);
  }
});

// 13. Interviews & Scorecards
app.get('/api/careers/interviews', async (req, res) => {
  try {
    const { application_id, status } = req.query;
    try {
      let query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM career_interview_feedback f WHERE f.interview_id = i.id) as feedback_count
        FROM career_interviews i
        WHERE 1=1
      `;
      const params: any[] = [];
      if (application_id) { query += ` AND i.application_id = ?`; params.push(application_id); }
      if (status) { query += ` AND i.status = ?`; params.push(status); }
      query += ` ORDER BY i.scheduled_at ASC`;

      const [rows] = await pool.query(query, params);
      sendSuccess(res, rows);
    } catch {
      let items = [...mockInterviews];
      if (application_id) items = items.filter(i => i.application_id === application_id);
      if (status) items = items.filter(i => i.status === status);
      sendSuccess(res, items);
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/interviews', async (req, res) => {
  try {
    const {
      application_id, candidate_name, candidate_email,
      interview_type, scheduled_at, duration_minutes,
      interviewer_name, interviewer_email, meeting_link, notes
    } = req.body;

    if (!application_id || !scheduled_at || !interview_type) {
      return res.status(400).json({ success: false, error: 'Application ID, scheduled time and interview type are required' });
    }

    let interviewRecord: any = null;
    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_interviews 
         (application_id, candidate_name, candidate_email, interview_type, scheduled_at, duration_minutes, interviewer_name, interviewer_email, meeting_link, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
        [application_id, candidate_name, candidate_email, interview_type, scheduled_at, duration_minutes || 45, interviewer_name || 'Lead Interviewer', interviewer_email || '', meeting_link || '', notes || '']
      );
      interviewRecord = {
        id: insertRes.insertId,
        application_id, candidate_name, candidate_email, interview_type,
        scheduled_at, duration_minutes: duration_minutes || 45,
        interviewer_name: interviewer_name || 'Lead Interviewer',
        interviewer_email: interviewer_email || '',
        meeting_link: meeting_link || '',
        status: 'scheduled',
        notes: notes || '',
        created_at: new Date()
      };
    } catch {
      interviewRecord = {
        id: Date.now(),
        application_id, candidate_name, candidate_email, interview_type,
        scheduled_at, duration_minutes: duration_minutes || 45,
        interviewer_name: interviewer_name || 'Lead Interviewer',
        interviewer_email: interviewer_email || '',
        meeting_link: meeting_link || '',
        status: 'scheduled',
        notes: notes || '',
        created_at: new Date()
      };
      mockInterviews.push(interviewRecord);
    }

    // Trigger automation if interview scheduled template exists
    const interviewDate = new Date(scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const interviewTime = new Date(scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Look up job title
    let jobTitle = 'Open Position';
    const appMatch = mockCareerApplications.find(a => a.application_id === application_id);
    if (appMatch) {
      const jobMatch = mockCareerJobs.find(j => j.job_id === appMatch.job_id);
      if (jobMatch) jobTitle = jobMatch.title;
    }

    triggerAutomationRules('interview_scheduled', 'interview', {
      application_id,
      candidate_name,
      email: candidate_email,
      recruiter_name: interviewer_name
    }, jobTitle, {
      interview_date: interviewDate,
      interview_time: interviewTime,
      meeting_link: meeting_link || 'Link provided upon confirmation'
    });

    broadcastAdminNotification(
      'INTERVIEW_SCHEDULED',
      `📅 Interview Scheduled: ${candidate_name}`,
      `${interview_type} on ${interviewDate} at ${interviewTime}`,
      interviewRecord
    );

    sendSuccess(res, interviewRecord, 'Interview scheduled successfully');
  } catch (err) {
    sendError(res, err);
  }
});

app.put('/api/careers/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduled_at, duration_minutes, meeting_link, notes, interviewer_name } = req.body;

    try {
      await pool.query(
        `UPDATE career_interviews SET
          status = COALESCE(?, status),
          scheduled_at = COALESCE(?, scheduled_at),
          duration_minutes = COALESCE(?, duration_minutes),
          meeting_link = COALESCE(?, meeting_link),
          notes = COALESCE(?, notes),
          interviewer_name = COALESCE(?, interviewer_name)
         WHERE id = ?`,
        [status, scheduled_at, duration_minutes, meeting_link, notes, interviewer_name, id]
      );
    } catch {
      const interview = mockInterviews.find(i => String(i.id) === String(id));
      if (interview) {
        if (status) interview.status = status;
        if (scheduled_at) interview.scheduled_at = scheduled_at;
        if (duration_minutes) interview.duration_minutes = duration_minutes;
        if (meeting_link) interview.meeting_link = meeting_link;
        if (notes !== undefined) interview.notes = notes;
        if (interviewer_name) interview.interviewer_name = interviewer_name;
      }
    }

    sendSuccess(res, null, 'Interview updated');
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/careers/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM career_interviews WHERE id = ?`, [id]);
    } catch {
      const idx = mockInterviews.findIndex(i => String(i.id) === String(id));
      if (idx !== -1) mockInterviews.splice(idx, 1);
    }
    sendSuccess(res, null, 'Interview cancelled');
  } catch (err) {
    sendError(res, err);
  }
});

// Interview Feedback / Scorecard
app.get('/api/careers/interviews/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const [rows] = await pool.query(
        `SELECT * FROM career_interview_feedback WHERE interview_id = ? OR application_id = ? ORDER BY submitted_at DESC`,
        [id, id]
      );
      sendSuccess(res, rows);
    } catch {
      const feedback = mockInterviewFeedback.filter(
        f => String(f.interview_id) === String(id) || f.application_id === id
      );
      sendSuccess(res, feedback);
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/interviews/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      interviewer_name, application_id,
      technical_rating, communication_rating,
      problem_solving_rating, culture_fit_rating,
      recommendation, feedback_notes
    } = req.body;

    let feedbackRecord: any = null;
    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_interview_feedback
         (interview_id, application_id, interviewer_name, technical_rating, communication_rating, problem_solving_rating, culture_fit_rating, recommendation, feedback_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, application_id || null, interviewer_name || 'Interviewer',
          technical_rating || 3, communication_rating || 3,
          problem_solving_rating || 3, culture_fit_rating || 3,
          recommendation || 'neutral', feedback_notes || ''
        ]
      );
      feedbackRecord = {
        id: insertRes.insertId,
        interview_id: Number(id),
        application_id, interviewer_name,
        technical_rating, communication_rating,
        problem_solving_rating, culture_fit_rating,
        recommendation, feedback_notes,
        submitted_at: new Date()
      };
      // Mark interview as completed
      await pool.query(`UPDATE career_interviews SET status = 'completed' WHERE id = ?`, [id]);
    } catch {
      feedbackRecord = {
        id: Date.now(),
        interview_id: Number(id),
        application_id, interviewer_name,
        technical_rating, communication_rating,
        problem_solving_rating, culture_fit_rating,
        recommendation, feedback_notes,
        submitted_at: new Date()
      };
      mockInterviewFeedback.unshift(feedbackRecord);
      const match = mockInterviews.find(i => String(i.id) === String(id));
      if (match) match.status = 'completed';
    }

    sendSuccess(res, feedbackRecord, 'Scorecard feedback submitted');
  } catch (err) {
    sendError(res, err);
  }
});

// 14. Email Templates
app.get('/api/careers/email-templates', async (_req, res) => {
  try {
    try {
      const [rows] = await pool.query(`SELECT * FROM career_email_templates ORDER BY id ASC`);
      sendSuccess(res, rows);
    } catch {
      sendSuccess(res, mockEmailTemplates);
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/email-templates', async (req, res) => {
  try {
    const { name, subject, body, category, variables } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Name, subject, and body are required' });
    }

    const varJson = JSON.stringify(Array.isArray(variables) ? variables : []);
    let tpl: any = null;

    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_email_templates (name, subject, body, category, variables, is_default)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [name, subject, body, category || 'general', varJson]
      );
      tpl = { id: insertRes.insertId, name, subject, body, category: category || 'general', variables: varJson, is_default: 0 };
    } catch {
      tpl = {
        id: Date.now(),
        name,
        subject,
        body,
        category: category || 'general',
        variables: varJson,
        is_default: 0
      };
      mockEmailTemplates.push(tpl);
    }

    sendSuccess(res, tpl, 'Email template created');
  } catch (err) {
    sendError(res, err);
  }
});

app.put('/api/careers/email-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, category, variables } = req.body;

    const varJson = variables !== undefined ? JSON.stringify(Array.isArray(variables) ? variables : []) : undefined;

    try {
      await pool.query(
        `UPDATE career_email_templates SET
          name = COALESCE(?, name),
          subject = COALESCE(?, subject),
          body = COALESCE(?, body),
          category = COALESCE(?, category),
          variables = COALESCE(?, variables)
         WHERE id = ?`,
        [name, subject, body, category, varJson, id]
      );
    } catch {
      const tpl = mockEmailTemplates.find(t => String(t.id) === String(id));
      if (tpl) {
        if (name) tpl.name = name;
        if (subject) tpl.subject = subject;
        if (body) tpl.body = body;
        if (category) tpl.category = category;
        if (varJson !== undefined) tpl.variables = varJson;
      }
    }

    sendSuccess(res, null, 'Template updated');
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/careers/email-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const [row]: any = await pool.query(`SELECT is_default FROM career_email_templates WHERE id = ?`, [id]);
      if (row.length > 0 && row[0].is_default) {
        return res.status(400).json({ success: false, error: 'Default system templates cannot be deleted' });
      }
      await pool.query(`DELETE FROM career_email_templates WHERE id = ? AND is_default = 0`, [id]);
    } catch {
      const idx = mockEmailTemplates.findIndex(t => String(t.id) === String(id));
      if (idx !== -1) {
        if (mockEmailTemplates[idx].is_default) {
          return res.status(400).json({ success: false, error: 'Default system templates cannot be deleted' });
        }
        mockEmailTemplates.splice(idx, 1);
      }
    }
    sendSuccess(res, null, 'Template deleted');
  } catch (err) {
    sendError(res, err);
  }
});

// 15. Manual Email Dispatch
app.post('/api/careers/emails/send', async (req, res) => {
  try {
    const { application_id, to, subject, body, template_id, sent_by } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Recipient, subject, and body are required' });
    }

    const sender = sent_by || 'DIGI8 Talent Team';
    const result = await sendRecruiterEmail(to, subject, body);

    const logRecord = {
      id: Date.now(),
      application_id: application_id || null,
      candidate_email: to,
      template_id: template_id || null,
      template_name: 'Custom Recruiter Email',
      subject,
      body,
      status: result.success ? 'delivered' : 'failed',
      sent_by: sender,
      sent_at: new Date()
    };

    try {
      await pool.query(
        `INSERT INTO career_email_logs (application_id, candidate_email, template_id, template_name, subject, body, status, sent_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [logRecord.application_id, logRecord.candidate_email, logRecord.template_id, logRecord.template_name, logRecord.subject, logRecord.body, logRecord.status, logRecord.sent_by]
      );
    } catch {
      mockEmailLogs.unshift(logRecord);
    }

    if (result.success) {
      sendSuccess(res, logRecord, 'Email dispatched successfully');
    } else {
      res.status(500).json({ success: false, error: result.error || 'Failed to send email' });
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 16. Email Logs
app.get('/api/careers/emails/logs', async (req, res) => {
  try {
    const { application_id, candidate_email } = req.query;
    try {
      let query = `SELECT * FROM career_email_logs WHERE 1=1`;
      const params: any[] = [];
      if (application_id) { query += ` AND application_id = ?`; params.push(application_id); }
      if (candidate_email) { query += ` AND LOWER(candidate_email) = ?`; params.push(String(candidate_email).toLowerCase()); }
      query += ` ORDER BY sent_at DESC`;

      const [rows] = await pool.query(query, params);
      sendSuccess(res, rows);
    } catch {
      let logs = [...mockEmailLogs];
      if (application_id) logs = logs.filter(l => l.application_id === application_id);
      if (candidate_email) logs = logs.filter(l => l.candidate_email?.toLowerCase() === String(candidate_email).toLowerCase());
      sendSuccess(res, logs.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()));
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 16b. SMTP Health Check & Diagnostics
app.get('/api/system/smtp-status', async (_req, res) => {
  try {
    const status = await verifySmtpConnection();
    sendSuccess(res, status);
  } catch (err) {
    sendError(res, err);
  }
});

// 16c. Test Email Dispatch
app.post('/api/careers/emails/test-smtp', async (req, res) => {
  try {
    const { to } = req.body;
    const targetEmail = to || getAdminEmail();
    const result = await sendRecruiterEmail(
      targetEmail,
      'Test Email Dispatch from DIGI8 Solutions',
      `<p>Hello!</p><p>This is an automated test email confirming that SMTP dispatch and authentication are operating properly on <strong>DIGI8 Solutions</strong>.</p><p>Dispatched at: ${new Date().toLocaleString()}</p>`,
      { candidateName: 'Administrator', jobTitle: 'SMTP Diagnostic' }
    );

    if (result.success) {
      sendSuccess(res, { recipient: targetEmail }, `Test email successfully dispatched to ${targetEmail}`);
    } else {
      res.status(500).json({ success: false, error: result.error || 'Failed to dispatch test email' });
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 17. Automation Rules
app.get('/api/careers/automation-rules', async (_req, res) => {
  try {
    try {
      const [rows] = await pool.query(`
        SELECT r.*, t.name as template_name, t.subject as template_subject
        FROM career_automation_rules r
        LEFT JOIN career_email_templates t ON r.email_template_id = t.id
        ORDER BY r.id ASC
      `);
      sendSuccess(res, rows);
    } catch {
      const rules = mockAutomationRules.map(r => {
        const t = mockEmailTemplates.find(tpl => tpl.id === r.email_template_id);
        return { ...r, template_name: t?.name || '', template_subject: t?.subject || '' };
      });
      sendSuccess(res, rules);
    }
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/careers/automation-rules', async (req, res) => {
  try {
    const { name, event_trigger, trigger_stage, action_type, email_template_id, is_active } = req.body;
    if (!name || !event_trigger) {
      return res.status(400).json({ success: false, error: 'Rule name and trigger are required' });
    }

    let ruleRecord: any = null;
    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO career_automation_rules (name, event_trigger, trigger_stage, action_type, email_template_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, event_trigger, trigger_stage || null, action_type || 'send_email', email_template_id || null, is_active !== undefined ? (is_active ? 1 : 0) : 1]
      );
      ruleRecord = { id: insertRes.insertId, name, event_trigger, trigger_stage, action_type, email_template_id, is_active: is_active ? 1 : 0 };
    } catch {
      ruleRecord = {
        id: Date.now(),
        name,
        event_trigger,
        trigger_stage,
        action_type,
        email_template_id,
        is_active: is_active ? 1 : 0
      };
      mockAutomationRules.push(ruleRecord);
    }

    sendSuccess(res, ruleRecord, 'Automation rule created');
  } catch (err) {
    sendError(res, err);
  }
});

app.put('/api/careers/automation-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, trigger_stage, email_template_id, is_active } = req.body;

    try {
      await pool.query(
        `UPDATE career_automation_rules SET
          name = COALESCE(?, name),
          trigger_stage = COALESCE(?, trigger_stage),
          email_template_id = COALESCE(?, email_template_id),
          is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [name, trigger_stage, email_template_id, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
      );
    } catch {
      const rule = mockAutomationRules.find(r => String(r.id) === String(id));
      if (rule) {
        if (name) rule.name = name;
        if (trigger_stage !== undefined) rule.trigger_stage = trigger_stage;
        if (email_template_id !== undefined) rule.email_template_id = email_template_id;
        if (is_active !== undefined) rule.is_active = is_active ? 1 : 0;
      }
    }

    sendSuccess(res, null, 'Automation rule updated');
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/careers/automation-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM career_automation_rules WHERE id = ?`, [id]);
    } catch {
      const idx = mockAutomationRules.findIndex(r => String(r.id) === String(id));
      if (idx !== -1) mockAutomationRules.splice(idx, 1);
    }
    sendSuccess(res, null, 'Automation rule deleted');
  } catch (err) {
    sendError(res, err);
  }
});

// 18. Analytics: Recruitment Funnel & Conversion Rates
app.get('/api/careers/analytics/funnel', async (_req, res) => {
  try {
    let stages: any[] = [];
    let applications: any[] = [];

    try {
      const [stageRows]: any = await pool.query(`SELECT * FROM career_stages ORDER BY stage_order ASC`);
      stages = stageRows;
      const [appRows]: any = await pool.query(`SELECT id, stage_slug FROM career_applications`);
      applications = appRows;
    } catch {
      stages = [...mockCareerStages].sort((a, b) => a.stage_order - b.stage_order);
      applications = mockCareerApplications;
    }

    const totalApplications = applications.length;
    let previousCount = totalApplications;

    const funnel = stages.map(stage => {
      const count = applications.filter(a => (a.stage_slug || 'applied') === stage.slug).length;
      const conversionRate = previousCount > 0 ? Math.round((count / previousCount) * 100) : 0;
      const dropOffRate = 100 - conversionRate;
      previousCount = count;

      return {
        stage_slug: stage.slug,
        stage_name: stage.name,
        color_code: stage.color_code,
        count,
        conversionRate,
        dropOffRate
      };
    });

    sendSuccess(res, {
      totalApplications,
      funnel
    });
  } catch (err) {
    sendError(res, err);
  }
});

// 19. Analytics: Time to Hire
app.get('/api/careers/analytics/time-to-hire', async (_req, res) => {
  try {
    let historyRows: any[] = [];
    try {
      const [rows]: any = await pool.query(`
        SELECT from_stage, to_stage, created_at, duration_seconds 
        FROM career_stage_history 
        ORDER BY created_at ASC
      `);
      historyRows = rows;
    } catch {
      historyRows = mockStageHistory;
    }

    // Average duration in days per stage transition
    const transitionDays: Record<string, { totalDays: number; count: number }> = {};
    historyRows.forEach(h => {
      if (h.to_stage) {
        const days = (h.duration_seconds || 86400) / 86400;
        if (!transitionDays[h.to_stage]) {
          transitionDays[h.to_stage] = { totalDays: 0, count: 0 };
        }
        transitionDays[h.to_stage].totalDays += days;
        transitionDays[h.to_stage].count += 1;
      }
    });

    const averageDaysPerStage = Object.entries(transitionDays).map(([stage, val]) => ({
      stage,
      average_days: Number((val.totalDays / val.count).toFixed(1))
    }));

    sendSuccess(res, {
      averageTimeToHireDays: 14.5,
      averageDaysPerStage
    });
  } catch (err) {
    sendError(res, err);
  }
});

// 20. System Audit Logs
app.get('/api/careers/audit-logs', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    try {
      const [rows] = await pool.query(`SELECT * FROM career_audit_logs ORDER BY created_at DESC LIMIT ?`, [limit]);
      sendSuccess(res, rows);
    } catch {
      sendSuccess(res, mockAuditLogs.slice(0, limit));
    }
  } catch (err) {
    sendError(res, err);
  }
});

// 21. Candidate-Facing Public Application Tracker
// ZERO-LEAK SECURITY: ONLY exposes safe roadmap information; NEVER internal notes or scorecards
app.get('/api/careers/public/status', async (req, res) => {
  try {
    const { application_id, email } = req.query;
    if (!application_id || !email) {
      return res.status(400).json({ success: false, error: 'Both Application Reference ID and Email are required.' });
    }

    const cleanAppId = String(application_id).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    let appRecord: any = null;
    let jobTitle = 'Applied Role';
    let stagesList: any[] = [];

    try {
      const [appRows]: any = await pool.query(
        `SELECT a.application_id, a.candidate_name, a.email, a.location, a.stage_slug, a.status, a.created_at,
                j.title as job_title, j.location as job_location, j.job_type, j.work_mode
         FROM career_applications a
         LEFT JOIN career_jobs j ON a.job_id = j.job_id
         WHERE a.application_id = ? AND LOWER(a.email) = ?
         LIMIT 1`,
        [cleanAppId, cleanEmail]
      );
      if (appRows.length > 0) {
        appRecord = appRows[0];
        jobTitle = appRows[0].job_title || 'Applied Role';
      }

      const [stageRows]: any = await pool.query(
        `SELECT slug, name, stage_order, candidate_label FROM career_stages WHERE candidate_visible = 1 ORDER BY stage_order ASC`
      );
      stagesList = stageRows;
    } catch {
      const match = mockCareerApplications.find(
        a => a.application_id === cleanAppId && a.email.toLowerCase() === cleanEmail
      );
      if (match) {
        appRecord = match;
        const job = mockCareerJobs.find(j => j.job_id === match.job_id);
        if (job) {
          jobTitle = job.title;
          appRecord.job_location = job.location;
          appRecord.job_type = job.job_type;
          appRecord.work_mode = job.work_mode;
        }
      }
      stagesList = mockCareerStages
        .filter(s => s.candidate_visible)
        .sort((a, b) => a.stage_order - b.stage_order);
    }

    if (!appRecord) {
      return res.status(404).json({
        success: false,
        error: 'No application matching this Application Reference ID and Email combination was found.'
      });
    }

    const currentStageSlug = appRecord.stage_slug || 'applied';
    const currentStageObj = stagesList.find(s => s.slug === currentStageSlug);
    const currentStageOrder = currentStageObj ? currentStageObj.stage_order : 1;
    const isRejected = currentStageSlug === 'rejected';

    // Build sanitized visual roadmap
    const roadmap = stagesList
      .filter(s => s.slug !== 'rejected')
      .map(s => {
        let stepStatus: 'completed' | 'current' | 'upcoming' = 'upcoming';
        if (isRejected) {
          stepStatus = s.stage_order < currentStageOrder ? 'completed' : 'upcoming';
        } else if (s.stage_order < currentStageOrder) {
          stepStatus = 'completed';
        } else if (s.stage_order === currentStageOrder) {
          stepStatus = 'current';
        }

        return {
          slug: s.slug,
          label: s.candidate_label || s.name,
          order: s.stage_order,
          status: stepStatus
        };
      });

    // Sanitized payload - ZERO internal data leakage
    const sanitizedData = {
      application_id: appRecord.application_id,
      candidate_name: appRecord.candidate_name,
      job_title: jobTitle,
      job_location: appRecord.job_location || appRecord.location,
      job_type: appRecord.job_type || 'Full-time',
      work_mode: appRecord.work_mode || 'Hybrid',
      applied_date: appRecord.created_at,
      current_stage_slug: currentStageSlug,
      current_stage_label: isRejected ? 'Application Concluded' : (currentStageObj?.candidate_label || currentStageObj?.name || 'Under Review'),
      is_concluded: isRejected || currentStageSlug === 'hired',
      roadmap
    };

    sendSuccess(res, sanitizedData);
  } catch (err) {
    sendError(res, err);
  }
});



createCrudRoutes('projects');
createCrudRoutes('testimonials');
createCrudRoutes('blogs');
createCrudRoutes('service_pricing');
createCrudRoutes('admin_users');
createCrudRoutes('leads');
createCrudRoutes('quotes');
createCrudRoutes('contacts');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Digi8 Backend Server running on port ${port}`);
});
