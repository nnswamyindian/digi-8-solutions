import { Palette, Cpu, FileText, TrendingUp, BookOpen, ShieldCheck, Users, Gift, Settings, Building2, Code, Smartphone, Briefcase, Lock, Database, Search, Megaphone, MapPin, Printer, Shield, UserPlus, Server } from 'lucide-react';

export const divisions = [
  {
    id: 'branding',
    title: 'Branding & Business Identity Solutions',
    slug: '/services/branding-identity',
    desc: 'Build a powerful first impression. We help startups, SMEs, and enterprises create a professional, memorable, and trustworthy brand identity.',
    color: '#EC4899',
    icon: Palette,
    img: '/images/services/branding_identity_hero_1785076638130.png',
    features: ['Business Name Consultation', 'Logo Design', 'Brand Guidelines', 'Company Profile Design', 'Packaging Design'],
    subServices: [
      { name: 'Business Name Consultation', type: 'Consultation', features: ['Brainstorming', 'Domain Check', 'Trademark Guidance', 'Tagline Suggestions'] },
      { name: 'Brand Strategy', type: 'Strategy', features: ['Positioning', 'Vision & Mission', 'Core Values', 'Target Audience', 'Competitor Analysis'] },
      { name: 'Brand Identity Development', type: 'Identity', features: ['Visual Identity', 'Color Palette', 'Typography', 'Brand Elements', 'Brand Story'] },
      { name: 'Logo Design', type: 'Design', features: ['Wordmark', 'Lettermark', 'Combination', 'Symbol', 'Minimal', '3D & Flat'] },
      { name: 'Brand Guidelines', type: 'Guidelines', features: ['Logo Rules', 'Color Codes', 'Typography', 'Icon Usage', 'Brand Voice'] },
      { name: 'Company Profile Design', type: 'Design', features: ['Introduction', 'Services', 'Portfolio', 'Achievements', 'Team'] },
      { name: 'Corporate Presentation', type: 'Pitch', features: ['Sales Deck', 'Investor Pitch Deck', 'Business Proposal', 'Annual Report'] },
      { name: 'Brochure & Catalogue', type: 'Print', features: ['Bi-Fold', 'Tri-Fold', 'Product Catalogue', 'Service Catalogue'] },
      { name: 'Business Stationery', type: 'Identity', features: ['Visiting Cards', 'Letterheads', 'Envelopes', 'ID Cards', 'Invoices'] },
      { name: 'Digital Branding', type: 'Digital', features: ['Email Signatures', 'Social Media Kits', 'Google Business Profile', 'Google Maps'] },
      { name: 'Packaging & Collaterals', type: 'Design', features: ['Product Boxes', 'Labels', 'Flyers', 'Banners', 'Standees'] }
    ]
  },
  {
    id: 'technology',
    title: 'Technology & Digital Infrastructure',
    slug: '/services/technology-infrastructure',
    desc: 'End-to-end technology solutions that help businesses establish a strong digital presence, automate operations, and scale efficiently.',
    color: '#3B82F6',
    icon: Cpu,
    img: '/images/services/tech_infrastructure_hero_1785076647437.png',
    features: ['Business Websites', 'E-Commerce', 'Mobile Apps', 'ERP & CRM Systems', 'Cloud Hosting'],
    subServices: [
      { name: 'Website Development', type: 'Web', features: ['Corporate Websites', 'Startup Portals', 'Portfolio', 'Landing Pages'] },
      { name: 'E-Commerce Website', type: 'Web', features: ['Product Catalog', 'Shopping Cart', 'Payments', 'Order Management'] },
      { name: 'Mobile App Development', type: 'Mobile', features: ['Android', 'iOS', 'Cross-Platform', 'Delivery & Booking Apps'] },
      { name: 'Custom Software', type: 'Software', features: ['Business Management', 'Billing', 'Dashboards', 'Workflow Automation'] },
      { name: 'CRM & ERP Setup', type: 'Enterprise', features: ['Lead Management', 'Finance', 'Inventory', 'HR & Sales Modules'] },
      { name: 'Specialized Systems', type: 'Enterprise', features: ['HRMS', 'School/College ERP', 'Hospital Management System'] },
      { name: 'Automation & AI', type: 'AI', features: ['Workflow Automation', 'ChatGPT/Gemini Integration', 'AI Chatbots', 'AI Analytics'] },
      { name: 'Workspace & Infrastructure', type: 'Cloud', features: ['Google Workspace', 'Microsoft 365', 'Business Email', 'Cloud Hosting'] },
      { name: 'Servers & Domains', type: 'Cloud', features: ['Domain Registration', 'VPS Setup', 'Dedicated Servers', 'Website Maintenance'] },
      { name: 'Integrations', type: 'API', features: ['Payment Gateways', 'WhatsApp API', 'Shipping APIs', 'Social Media APIs'] }
    ]
  },
  {
    id: 'compliance',
    title: 'Business Registration & Legal Compliance',
    slug: '/services/business-registration',
    desc: 'Complete business registration, legal documentation, statutory registrations, IP protection, and compliance services.',
    color: '#F59E0B',
    icon: FileText,
    img: '/images/services/business_registration_hero_1785076656663.png',
    features: ['Company Incorporation', 'GST & PAN', 'Trademark Registration', 'ISO Certifications', 'Annual Compliance'],
    subServices: [
      { name: 'Business Formation', type: 'Registration', features: ['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'OPC'] },
      { name: 'NGO & Trust', type: 'Registration', features: ['Trust Registration', 'Society Registration', 'Section 8 Company'] },
      { name: 'Tax & Identity', type: 'Tax', features: ['PAN Registration', 'TAN Registration', 'GST Registration', 'Professional Tax'] },
      { name: 'Business Licenses', type: 'License', features: ['MSME / Udyam', 'Startup India', 'Import Export Code (IEC)', 'Shop & Establishment'] },
      { name: 'Employee Compliance', type: 'HR', features: ['EPF Registration', 'ESI Registration', 'Labour Licenses'] },
      { name: 'Intellectual Property', type: 'IP', features: ['Trademark Registration', 'Copyright Registration', 'Patent Filing Assistance'] },
      { name: 'Certifications', type: 'Audit', features: ['ISO Certifications (9001, 14001, 27001)', 'FSSAI Registration'] },
      { name: 'Corporate Legal', type: 'Legal', features: ['Drafting MOA/AOA', 'Certificate of Incorporation', 'Annual ROC Filing'] }
    ]
  },
  {
    id: 'marketing',
    title: 'Digital Marketing & Business Growth',
    slug: '/services/digital-marketing-growth',
    desc: 'Increase online visibility, attract qualified leads, strengthen brand presence, and drive measurable business growth.',
    color: '#10B981',
    icon: TrendingUp,
    img: '/images/services/digital_marketing_hero_1785076666664.png',
    features: ['SEO Strategies', 'Google & Meta Ads', 'Social Media Management', 'Lead Generation', 'Content Marketing'],
    subServices: [
      { name: 'Search Engine Optimization', type: 'Organic', features: ['On-Page SEO', 'Off-Page SEO', 'Technical SEO', 'Local & E-Commerce'] },
      { name: 'Paid Advertising', type: 'Ads', features: ['Google Ads', 'Meta (Facebook/Instagram) Ads', 'LinkedIn Ads', 'YouTube Ads'] },
      { name: 'Social Media Management', type: 'Organic', features: ['Content Planning', 'Community Management', 'Profile Optimization', 'Reporting'] },
      { name: 'Content & Creatives', type: 'Content', features: ['Content Marketing', 'Graphic Design', 'Video Editing', 'Reels Creation'] },
      { name: 'Direct Marketing', type: 'Outreach', features: ['WhatsApp Marketing', 'Email Marketing', 'SMS Marketing', 'Influencer Marketing'] },
      { name: 'Growth Strategies', type: 'Growth', features: ['Lead Generation', 'Performance Marketing', 'Online Reputation Management'] },
      { name: 'Analytics', type: 'Data', features: ['Website Analytics', 'Campaign Performance', 'ROI Analysis', 'Dashboard Setup'] }
    ]
  },
  {
    id: 'training',
    title: 'AI, Corporate Training & Transformation',
    slug: '/services/ai-training',
    desc: 'Equip employees with future-ready skills, AI knowledge, productivity tools, and leadership capabilities.',
    color: '#8B5CF6',
    icon: BookOpen,
    img: '/images/services/ai_training_hero_1785076687307.png',
    features: ['AI for Business', 'Prompt Engineering', 'Digital Productivity', 'Leadership Development', 'Design Thinking'],
    subServices: [
      { name: 'Artificial Intelligence', type: 'AI', features: ['GenAI for Business', 'ChatGPT/Copilot Training', 'AI Automation', 'Responsible AI'] },
      { name: 'Prompt Engineering', type: 'AI', features: ['Prompt Frameworks', 'Business Templates', 'Role-Based Prompting'] },
      { name: 'Digital Tools', type: 'Software', features: ['Google Workspace', 'Microsoft 365', 'Notion/Trello/Asana', 'Collaboration Setup'] },
      { name: 'Tech & Development', type: 'Software', features: ['Git/GitHub', 'API Fundamentals', 'Cloud Basics', 'Low-Code Platforms'] },
      { name: 'Cognitive Skills', type: 'Soft Skills', features: ['Logical Thinking', 'Design Thinking', 'Problem Solving', 'Innovation Workshops'] },
      { name: 'Leadership & Process', type: 'Management', features: ['Manager Effectiveness', 'Business Process Excellence', 'Change Management'] },
      { name: 'Program Design', type: 'Consulting', features: ['Training Needs Analysis (TNA)', 'Customized Curriculum', 'Post-Training Implementation'] }
    ]
  },
  {
    id: 'security',
    title: 'Cyber Security & Cloud Infrastructure',
    slug: '/services/cyber-security-cloud',
    desc: 'Safeguard digital assets, secure IT environments, ensure business continuity, and build scalable cloud infrastructure.',
    color: '#F43F5E',
    icon: ShieldCheck,
    img: '/images/services/cyber_security_hero_1785076697820.png',
    features: ['Security Audits', 'VAPT Testing', 'Cloud Migration', 'AWS/Azure/GCP Setup', 'Disaster Recovery'],
    subServices: [
      { name: 'Security Assessments', type: 'Audit', features: ['Cyber Security Audit', 'Vulnerability Assessment', 'Penetration Testing (VAPT)'] },
      { name: 'Infrastructure Protection', type: 'Security', features: ['Firewall Configuration', 'Endpoint Security', 'Network Security', 'Email Security'] },
      { name: 'Data Management', type: 'Data', features: ['Automated Backups', 'Disaster Recovery Planning', 'Data Restoration'] },
      { name: 'Cloud Architecture', type: 'Cloud', features: ['Cloud Migration', 'AWS Deployment', 'Microsoft Azure', 'Google Cloud Platform'] },
      { name: 'Server Management', type: 'Ops', features: ['VPS Management', 'Server Monitoring', 'Performance Optimization'] },
      { name: 'Compliance & Trust', type: 'Compliance', features: ['SSL Certificates', 'Security Compliance Standards', 'Risk Management'] }
    ]
  },
  {
    id: 'workforce',
    title: 'Workforce & Business Support',
    slug: '/services/workforce-support',
    desc: 'End-to-end workforce and HR support services to help organizations attract, hire, manage, and retain the right talent.',
    color: '#06B6D4',
    icon: Users,
    img: '/images/services/workforce_support_hero_1785076708108.png',
    features: ['Permanent Staffing', 'Payroll Processing', 'HR Outsourcing', 'Background Verification', 'Virtual Assistants'],
    subServices: [
      { name: 'Talent Acquisition', type: 'Hiring', features: ['Permanent Staffing', 'Contract Staffing', 'Remote Staffing', 'Executive Hiring', 'Campus Recruitment'] },
      { name: 'Specialized Resourcing', type: 'Hiring', features: ['Freelancer Hiring', 'Dedicated Resources', 'Recruitment Process Outsourcing (RPO)'] },
      { name: 'HR Operations', type: 'HR', features: ['Payroll Processing', 'HR Outsourcing (HRO)', 'Employee Onboarding', 'Attendance Management'] },
      { name: 'Compliance & Support', type: 'HR', features: ['Background Verification', 'Performance Management', 'HR Documentation'] },
      { name: 'Business Administration', type: 'Admin', features: ['Virtual Assistant Services', 'Calendar Management', 'Data Entry', 'Customer Support'] }
    ]
  },
  {
    id: 'gifting',
    title: 'Customized & Corporate Gifting',
    slug: '/services/customized-gifting',
    desc: 'Powered by Anuragini. Meaningful gifts for special occasions and premium branded merchandise for corporate events.',
    color: '#6366F1',
    icon: Gift,
    img: '/images/services/corporate_gifting_hero_1785076722098.png',
    features: ['Corporate Merchandise', 'Personalized Gifts', 'Employee Swag Kits', 'Custom Crafting', 'Event Awards'],
    subServices: [
      { name: 'Relationship & Occasion Gifts', type: 'Personalized', features: ['Family/Friends Gifts', 'Birthday/Anniversary', 'Wedding/Festive Gifts'] },
      { name: 'Photo & Display Gifts', type: 'Personalized', features: ['LED Frames', 'Canvas Prints', 'Scrapbooks', 'Digital Portraits'] },
      { name: 'Personalized Accessories', type: 'Accessories', features: ['Custom Mugs', 'Keychains', 'Diaries/Pens', 'Name Plates'] },
      { name: 'Customized Apparel', type: 'Apparel', features: ['T-Shirts', 'Hoodies', 'Caps'] },
      { name: 'Premium & Corporate', type: 'Corporate', features: ['Crystal Gifts', 'Engraved Wooden Gifts', 'Corporate Swag Kits', 'Employee Onboarding Boxes'] },
      { name: 'Creative & Handmade', type: 'Craft', features: ['Resin Art', 'String Art', 'DIY Gift Boxes', 'Miniature Models'] }
    ]
  }
];
