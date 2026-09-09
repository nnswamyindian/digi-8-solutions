export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  thumbnail_url: string;
  live_url: string;
  tech_stack: string[];
  results: Record<string, string>;
  featured: boolean;
  year: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'auramed-telehealth',
    title: 'AuraMed Cloud — Telehealth & Hospital EHR Portal',
    client: 'Aura Healthcare Global',
    category: 'Technology & Digital Infrastructure',
    description: 'Architected an HL7/FHIR compliant hospital management system and patient portal handling 150,000+ digital health records, automated doctor slot booking, and end-to-end encrypted WebRTC video consultations.',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://auramed-health.example.com',
    tech_stack: ['Next.js 14', 'Node.js', 'PostgreSQL', 'WebRTC', 'AWS ECS', 'TailwindCSS'],
    results: { 'Active Patients': '150K+', 'API Latency': '< 450ms', 'Uptime SLA': '99.99%' },
    featured: true,
    year: '2026'
  },
  {
    id: 'swiftlogistics-app',
    title: 'SwiftLogistics Fleet Mobile App & Dispatch Hub',
    client: 'Swift Logistics India Ltd',
    category: 'Technology & Digital Infrastructure',
    description: 'Engineered a real-time cross-platform Flutter mobile app for 2,500+ commercial fleet drivers featuring turn-by-turn route optimization, offline QR barcode package scanning, and biometric digital proof of delivery.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://swiftlogistics.example.com',
    tech_stack: ['Flutter', 'Dart', 'Google Maps API', 'Firebase Realtime', 'Node.js', 'PostgreSQL'],
    results: { 'Fleet Drivers': '2,500+', 'Fuel Savings': '22%', 'Trip Efficiency': '+38%' },
    featured: true,
    year: '2026'
  },
  {
    id: 'shieldfortress-vapt',
    title: 'ShieldFortress — FinTech VAPT Audit & Zero-Trust Cloud',
    client: 'Fortis Capital & Payments',
    category: 'Cyber Security & Cloud Infrastructure',
    description: 'Conducted comprehensive grey-box & black-box Vulnerability Assessment and Penetration Testing (VAPT) across cloud banking microservices, remediating critical attack vectors and securing SOC 2 Type II & ISO 27001 readiness.',
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://shieldfortress.example.com',
    tech_stack: ['OWASP Top 10', 'Burp Suite Pro', 'AWS Security Hub', 'Wazuh SIEM', 'Docker', 'Kubernetes'],
    results: { 'Vulnerabilities Fixed': '100%', 'Breach Incidents': 'Zero', 'Certification': 'ISO 27001 / SOC 2' },
    featured: true,
    year: '2025'
  },
  {
    id: 'nexura-robotics-branding',
    title: 'Nexura Automation — 3D Corporate Brand Identity',
    client: 'Nexura Robotics Pvt Ltd',
    category: 'Branding & Business Identity Solutions',
    description: 'Developed a futuristic brand identity for an industrial robotics pioneer, including dynamic 3D geometric logo, typographic design system, investor pitch deck, premium corporate stationery, and full brand guideline book.',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://nexura-robotics.example.com',
    tech_stack: ['Figma', 'Cinema 4D', 'Adobe Illustrator', 'Brand Manual', 'Print Systems'],
    results: { 'Seed Round Raised': '$3.2M', 'Brand Recall': '+85%', 'Guidelines': '72 Pages' },
    featured: true,
    year: '2026'
  },
  {
    id: 'kalyan-omnichannel-growth',
    title: 'Kalyan Luxury Retail — 4.8x ROAS B2B & D2C Growth Engine',
    client: 'Kalyan Luxury Retail',
    category: 'Digital Marketing & Business Growth',
    description: 'Executed a multi-channel digital performance marketing strategy combining high-intent Google Search & Shopping ads, Meta Lookalike audience targeting, and technical e-commerce SEO, achieving a record 4.8x Return on Ad Spend.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://kalyanluxury.example.com',
    tech_stack: ['Google Ads', 'Meta Ads Manager', 'GA4', 'Meta CAPI', 'Technical SEO', 'Klaviyo'],
    results: { 'ROAS Achieved': '4.8x', 'Organic Traffic': '+210%', 'Monthly Leads': '3,400+' },
    featured: true,
    year: '2025'
  },
  {
    id: 'finventure-incorporation',
    title: 'FinVenture Capital — Turnkey MCA Formation & Legal Shield',
    client: 'FinVenture Capital Advisors',
    category: 'Business Registration & Legal Compliance',
    description: 'Completed end-to-end statutory company formation, Spice+ MCA filing, DPIIT Startup India certification, multi-class registered trademark (Classes 35 & 36), and corporate governance bylaws within 12 business days.',
    thumbnail_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://finventure.example.com',
    tech_stack: ['MCA Spice+ Portal', 'DPIIT Startup India', 'IP India Trademarks', 'GST Portal', 'ROC Compliance'],
    results: { 'Turnaround Time': '12 Days', 'Tax Exemption': '3 Years', 'Trademark Granted': 'Classes 35 & 36' },
    featured: false,
    year: '2026'
  },
  {
    id: 'cogniflow-ai-training',
    title: 'CogniFlow — Enterprise GenAI Workshops & RAG Bot',
    client: 'CogniFlow Financial Services',
    category: 'AI, Corporate Training & Transformation',
    description: 'Conducted a 4-week executive and engineering corporate training program on Generative AI, prompt engineering, and built an internal RAG knowledge-retrieval AI assistant that reduced support resolution time by 82%.',
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://cogniflow-ai.example.com',
    tech_stack: ['LangChain', 'OpenAI GPT-4', 'Python FastAPI', 'pgvector', 'Next.js', 'Docker'],
    results: { 'Staff Trained': '320+', 'Support Speedup': '82%', 'Automated Answers': '94%' },
    featured: true,
    year: '2026'
  },
  {
    id: 'veritas-executive-gifting',
    title: 'Veritas Global — Bespoke VIP Onboarding & Swag Boxes',
    client: 'Veritas Global Technologies',
    category: 'Customized & Corporate Gifting',
    description: 'Designed and produced 1,200 curated luxury employee onboarding gift hampers powered by Anuragini, featuring laser-engraved vacuum flasks, vegan leather bound journals, wireless charging pads, and smart digital NFC business cards.',
    thumbnail_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://veritas-gifting.example.com',
    tech_stack: ['Laser Engraving', 'Rigid Box Fabrication', 'UV Printing', 'NFC Encoding', 'Apparel Screenprint'],
    results: { 'Kits Delivered': '1,200 Units', 'Retention Rate': '+40%', 'Quality Rating': '99.4%' },
    featured: false,
    year: '2025'
  },
  {
    id: 'apex-dedicated-staffing',
    title: 'Apex Digital — Dedicated Full-Stack & DevOps Pod',
    client: 'Apex Global Systems',
    category: 'Workforce & Business Support',
    description: 'Deployed a dedicated agile engineering pod consisting of 6 senior React/Node engineers, 1 QA automation engineer, and 1 AWS DevOps specialist, accelerating time-to-market for a mission-critical B2B SaaS platform.',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://apex-digital.example.com',
    tech_stack: ['Staff Augmentation', 'React', 'Node.js', 'Terraform', 'AWS CI/CD', 'Jira Agile'],
    results: { 'Deployment Speed': '3x Faster', 'Onboarding Time': '48 Hours', 'Cost Savings': '35%' },
    featured: false,
    year: '2026'
  }
];
