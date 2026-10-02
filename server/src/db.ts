import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'digi8_database.json');

export interface PersistentDbStore {
  admin_users: any[];
  admin_otps: any[];
  leads: any[];
  contacts: any[];
  quotes: any[];
  career_jobs: any[];
  career_applications: any[];
  customers: any[];
  products: any[];
  invoices: any[];
  invoice_items: any[];
  payments: any[];
  projects: any[];
  project_expenses: any[];
  invoice_sequences: any[];
  invoice_settings: any[];
  invoice_audit_logs: any[];
  [key: string]: any[];
}

export const DEFAULT_BILLING_PRODUCTS = [
  {
    id: 1,
    name: 'Digi8 Kirana Software',
    code: 'DIGI8-SW-KIRANA',
    category: 'Software',
    description: 'Complete Kirana, Supermarket & Retail Billing with Barcode Scanner & Inventory sync',
    market_price: 25000,
    default_selling_price: 20000,
    tax_percentage: 18,
    hsn_sac: '997331',
    unit: 'license',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Custom Software Development',
    code: 'DIGI8-SW-CUSTOM',
    category: 'Software',
    description: 'Bespoke enterprise web and mobile software tailored to specific workflows',
    market_price: 85000,
    default_selling_price: 65000,
    tax_percentage: 18,
    hsn_sac: '998314',
    unit: 'project',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'SaaS Subscription (Annual)',
    code: 'DIGI8-SW-SAAS',
    category: 'Software',
    description: 'Enterprise Cloud SaaS subscription including automated daily backups & SLAs',
    market_price: 36000,
    default_selling_price: 28000,
    tax_percentage: 18,
    hsn_sac: '997331',
    unit: 'year',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Website & E-Commerce Development',
    code: 'DIGI8-SW-WEB',
    category: 'Software',
    description: 'High-speed headless e-commerce store with integrated payment gateways and CMS',
    market_price: 45000,
    default_selling_price: 35000,
    tax_percentage: 18,
    hsn_sac: '998314',
    unit: 'website',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Mobile Application (iOS & Android)',
    code: 'DIGI8-SW-APP',
    category: 'Software',
    description: 'Cross-platform Flutter / React Native mobile app with push notifications',
    market_price: 90000,
    default_selling_price: 75000,
    tax_percentage: 18,
    hsn_sac: '998314',
    unit: 'app',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Digi8 CRM Suite',
    code: 'DIGI8-SW-CRM',
    category: 'Software',
    description: 'Lead management, omnichannel WhatsApp bot, pipeline forecasting and analytics',
    market_price: 30000,
    default_selling_price: 24000,
    tax_percentage: 18,
    hsn_sac: '997331',
    unit: 'license',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Digi8 Enterprise ERP',
    code: 'DIGI8-SW-ERP',
    category: 'Software',
    description: 'End-to-end ERP for procurement, multi-warehouse stock, GST e-invoicing & accounts',
    market_price: 150000,
    default_selling_price: 120000,
    tax_percentage: 18,
    hsn_sac: '998314',
    unit: 'deployment',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    name: 'Omnidirectional 2D Barcode Scanner',
    code: 'DIGI8-HW-SCAN2D',
    category: 'Hardware',
    description: 'High-speed hands-free omnidirectional 1D/2D desktop QR & barcode scanner',
    market_price: 4000,
    default_selling_price: 3500,
    tax_percentage: 18,
    hsn_sac: '847160',
    unit: 'pcs',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    name: 'High Speed 80mm Bill Thermal Printer',
    code: 'DIGI8-HW-PRN80',
    category: 'Hardware',
    description: 'Heavy-duty 80mm USB/LAN/Bluetooth thermal receipt printer with auto-cutter',
    market_price: 8000,
    default_selling_price: 6500,
    tax_percentage: 18,
    hsn_sac: '844332',
    unit: 'pcs',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 10,
    name: 'All-in-One Touch POS Terminal',
    code: 'DIGI8-HW-POSTERM',
    category: 'Hardware',
    description: 'Capacitive touch 15.6 inch POS terminal with Intel processor, 8GB RAM, 128GB SSD',
    market_price: 38000,
    default_selling_price: 32000,
    tax_percentage: 18,
    hsn_sac: '847141',
    unit: 'pcs',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 11,
    name: 'Heavy Duty Electronic Cash Drawer',
    code: 'DIGI8-HW-DRAWER',
    category: 'Hardware',
    description: '5-bill 8-coin RJ11 auto-trigger steel cash drawer',
    market_price: 4500,
    default_selling_price: 3800,
    tax_percentage: 18,
    hsn_sac: '830300',
    unit: 'pcs',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 12,
    name: 'Onsite Installation & Setup',
    code: 'DIGI8-SRV-INST',
    category: 'Services',
    description: 'Onsite hardware configuration, network cabling, driver setup, and printer calibration',
    market_price: 2000,
    default_selling_price: 1500,
    tax_percentage: 18,
    hsn_sac: '998713',
    unit: 'visit',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 13,
    name: 'Staff Training & Workflow Onboarding',
    code: 'DIGI8-SRV-TRAIN',
    category: 'Services',
    description: 'Comprehensive staff training session, manual handover, and operational drill',
    market_price: 3500,
    default_selling_price: 2500,
    tax_percentage: 18,
    hsn_sac: '999293',
    unit: 'session',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 14,
    name: 'Annual Maintenance Contract (AMC)',
    code: 'DIGI8-SRV-AMC',
    category: 'Services',
    description: '12-month priority hardware & software support, quarterly preventive visits',
    market_price: 12000,
    default_selling_price: 9500,
    tax_percentage: 18,
    hsn_sac: '998713',
    unit: 'year',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 15,
    name: 'Custom API & Gateway Integration',
    code: 'DIGI8-SRV-API',
    category: 'Services',
    description: 'Payment gateway, SMS, WhatsApp API, and third-party accounting integration',
    market_price: 15000,
    default_selling_price: 10000,
    tax_percentage: 18,
    hsn_sac: '998314',
    unit: 'integration',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_BILLING_SETTINGS = {
  id: 1,
  company_name: 'Digi8 Solutions Private Limited',
  company_address: 'Level 5, Infinity Tower, Mindspace Tech Park, Malad West',
  company_city: 'Mumbai',
  company_state: 'Maharashtra',
  company_state_code: '27',
  company_pincode: '400064',
  company_phone: '+91 98200 88888',
  company_email: 'billing@digi8solutions.com',
  company_website: 'https://digi8solutions.com',
  company_gstin: '27AABCD1234F1Z5',
  company_pan: 'AABCD1234F',
  invoice_prefix: 'D8/INV',
  financial_year: '2026-27',
  starting_number: 1,
  next_number: 5,
  number_padding: 6,
  terms_conditions: '1. Payment is strictly due within 15 days of invoice generation.\n2. Goods once sold are covered under respective manufacturer warranty.\n3. Custom software deliveries are governed by the Master Service Agreement (MSA).\n4. All disputes are subject to Mumbai jurisdiction only.',
  bank_name: 'HDFC Bank Ltd',
  bank_account_holder: 'Digi8 Solutions Private Limited',
  bank_account_number: '50200098765432',
  bank_ifsc: 'HDFC0000123',
  bank_branch: 'Mindspace Branch, Mumbai',
  upi_id: 'digi8solutions@hdfcbank',
  upi_display_name: 'Digi8 Solutions Pvt Ltd',
  show_upi_qr: true,
  show_bank_details: true,
  payment_instructions: 'Scan the UPI QR code using any UPI App (GPay, PhonePe, Paytm, BHIM) to pay instantly. For direct NEFT/RTGS/IMPS, transfer to our HDFC corporate account above and mention the Invoice number in the transaction description.',
  seal_url: '/images/seal.png',
  signature_url: '/images/signature.png',
  authorized_signatory_name: 'Authorized Signatory',
  authorized_signatory_title: 'Corporate Finance & Accounts Division'
};

export const DEFAULT_PROJECTS = [
  {
    id: 1,
    project_code: 'PROJ-2026-001',
    title: 'AuraMed Cloud — Telehealth & Hospital EHR Portal',
    client: 'Aura Healthcare Global',
    category: 'Technology & Digital Infrastructure',
    description: 'Architected an HL7/FHIR compliant hospital management system and patient portal handling 150,000+ digital health records, automated doctor slot booking, and end-to-end encrypted WebRTC video consultations.',
    project_value: 850000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://auramed-health.example.com',
    tech_stack: ['Next.js 14', 'Node.js', 'PostgreSQL', 'WebRTC', 'AWS ECS', 'TailwindCSS'],
    results: { 'Active Patients': '150K+', 'API Latency': '< 450ms', 'Uptime SLA': '99.99%' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 2,
    project_code: 'PROJ-2026-002',
    title: 'SwiftLogistics Fleet Mobile App & Dispatch Hub',
    client: 'Swift Logistics India Ltd',
    category: 'Technology & Digital Infrastructure',
    description: 'Engineered a real-time cross-platform Flutter mobile app for 2,500+ commercial fleet drivers featuring turn-by-turn route optimization, offline QR barcode package scanning, and biometric digital proof of delivery.',
    project_value: 650000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://swiftlogistics.example.com',
    tech_stack: ['Flutter', 'Dart', 'Google Maps API', 'Firebase Realtime', 'Node.js', 'PostgreSQL'],
    results: { 'Fleet Drivers': '2,500+', 'Fuel Savings': '22%', 'Trip Efficiency': '+38%' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 3,
    project_code: 'PROJ-2026-003',
    title: 'ShieldFortress — FinTech VAPT Audit & Zero-Trust Cloud',
    client: 'Fortis Capital & Payments',
    category: 'Cyber Security & Cloud Infrastructure',
    description: 'Conducted comprehensive grey-box & black-box Vulnerability Assessment and Penetration Testing (VAPT) across cloud banking microservices, remediating critical attack vectors and securing SOC 2 Type II & ISO 27001 readiness.',
    project_value: 450000,
    status: 'completed',
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://shieldfortress.example.com',
    tech_stack: ['OWASP Top 10', 'Burp Suite Pro', 'AWS Security Hub', 'Wazuh SIEM', 'Docker', 'Kubernetes'],
    results: { 'Vulnerabilities Fixed': '100%', 'Breach Incidents': 'Zero', 'Certification': 'ISO 27001 / SOC 2' },
    featured: true,
    year: '2025',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 4,
    project_code: 'PROJ-2026-004',
    title: 'Nexura Automation — 3D Corporate Brand Identity',
    client: 'Nexura Robotics Pvt Ltd',
    category: 'Branding & Business Identity Solutions',
    description: 'Developed a futuristic brand identity for an industrial robotics pioneer, including dynamic 3D geometric logo, typographic design system, investor pitch deck, premium corporate stationery, and full brand guideline book.',
    project_value: 320000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://nexura-robotics.example.com',
    tech_stack: ['Figma', 'Cinema 4D', 'Adobe Illustrator', 'Brand Manual', 'Print Systems'],
    results: { 'Seed Round Raised': '$3.2M', 'Brand Recall': '+85%', 'Guidelines': '72 Pages' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 5,
    project_code: 'PROJ-2026-005',
    title: 'Kalyan Luxury Retail — 4.8x ROAS B2B & D2C Growth Engine',
    client: 'Kalyan Luxury Retail',
    category: 'Digital Marketing & Business Growth',
    description: 'Executed a multi-channel digital performance marketing strategy combining high-intent Google Search & Shopping ads, Meta Lookalike audience targeting, and technical e-commerce SEO, achieving a record 4.8x Return on Ad Spend.',
    project_value: 380000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://kalyanluxury.example.com',
    tech_stack: ['Google Ads', 'Meta Ads Manager', 'GA4', 'Meta CAPI', 'Technical SEO', 'Klaviyo'],
    results: { 'ROAS Achieved': '4.8x', 'Organic Traffic': '+210%', 'Monthly Leads': '3,400+' },
    featured: true,
    year: '2025',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 6,
    project_code: 'PROJ-2026-006',
    title: 'FinVenture Capital — Turnkey MCA Formation & Legal Shield',
    client: 'FinVenture Capital Advisors',
    category: 'Business Registration & Legal Compliance',
    description: 'Completed end-to-end statutory company formation, Spice+ MCA filing, DPIIT Startup India certification, multi-class registered trademark (Classes 35 & 36), and corporate governance bylaws within 12 business days.',
    project_value: 180000,
    status: 'completed',
    thumbnail_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://finventure.example.com',
    tech_stack: ['MCA Spice+ Portal', 'DPIIT Startup India', 'IP India Trademarks', 'GST Portal', 'ROC Compliance'],
    results: { 'Turnaround Time': '12 Days', 'Tax Exemption': '3 Years', 'Trademark Granted': 'Classes 35 & 36' },
    featured: false,
    year: '2026',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 7,
    project_code: 'PROJ-2026-007',
    title: 'CogniFlow — Enterprise GenAI Workshops & RAG Bot',
    client: 'CogniFlow Financial Services',
    category: 'AI, Corporate Training & Transformation',
    description: 'Conducted a 4-week executive and engineering corporate training program on Generative AI, prompt engineering, and built an internal RAG knowledge-retrieval AI assistant that reduced support resolution time by 82%.',
    project_value: 520000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://cogniflow-ai.example.com',
    tech_stack: ['LangChain', 'OpenAI GPT-4', 'Python FastAPI', 'pgvector', 'Next.js', 'Docker'],
    results: { 'Staff Trained': '320+', 'Support Speedup': '82%', 'Automated Answers': '94%' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 8,
    project_code: 'PROJ-2026-008',
    title: 'Veritas Global — Bespoke VIP Onboarding & Swag Boxes',
    client: 'Veritas Global Technologies',
    category: 'Customized & Corporate Gifting',
    description: 'Designed and produced 1,200 curated luxury employee onboarding gift hampers powered by Anuragini, featuring laser-engraved vacuum flasks, vegan leather bound journals, wireless charging pads, and smart digital NFC business cards.',
    project_value: 420000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://veritas-gifting.example.com',
    tech_stack: ['Laser Engraving', 'Rigid Box Fabrication', 'UV Printing', 'NFC Encoding', 'Apparel Screenprint'],
    results: { 'Kits Delivered': '1,200 Units', 'Retention Rate': '+40%', 'Quality Rating': '99.4%' },
    featured: false,
    year: '2025',
    created_at: new Date(Date.now() - 50 * 86400000).toISOString()
  },
  {
    id: 9,
    project_code: 'PROJ-2026-009',
    title: 'Apex Digital — Dedicated Full-Stack & DevOps Pod',
    client: 'Apex Global Systems',
    category: 'Workforce & Business Support',
    description: 'Deployed a dedicated agile engineering pod consisting of 6 senior React/Node engineers, 1 QA automation engineer, and 1 AWS DevOps specialist, accelerating time-to-market for a mission-critical B2B SaaS platform.',
    project_value: 950000,
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    live_url: 'https://apexdigital.example.com',
    tech_stack: ['React', 'TypeScript', 'Node.js', 'AWS', 'Terraform', 'PostgreSQL'],
    results: { 'Engineers Deployed': '8 Specialists', 'Sprint Velocity': '+65%', 'Deployment Time': '< 15 mins' },
    featured: true,
    year: '2026',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString()
  }
];

export const DEFAULT_PROJECT_EXPENSES = [
  {
    id: 1,
    project_id: 1,
    title: 'AWS HIPAA-Compliant ECS Cluster & RDS Hosting',
    category: 'Cloud Infrastructure',
    amount: 45000.00,
    expense_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    vendor: 'Amazon Web Services India',
    receipt_ref: 'AWS-INV-9921',
    notes: 'Secure cloud container hosting cluster',
    created_by: 'DevOps Lead',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 2,
    project_id: 1,
    title: 'WebRTC Signaling & Video Stream Gateway License',
    category: 'Software Licenses',
    amount: 30000.00,
    expense_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    vendor: 'Agora IO',
    receipt_ref: 'AG-9182',
    notes: 'Annual developer license for high-res telehealth calls',
    created_by: 'DevOps Lead',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 3,
    project_id: 2,
    title: 'Google Maps Geocoding & Fleet Route API Enterprise Quota',
    category: 'APIs & Services',
    amount: 38000.00,
    expense_date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0],
    vendor: 'Google Cloud Platform',
    receipt_ref: 'GCP-88129',
    notes: 'Fleet dispatch live matrix calculation quota',
    created_by: 'Engineering VP',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  }
];

let memoryStore: PersistentDbStore | null = null;

export const loadPersistentStore = (): PersistentDbStore => {
  if (memoryStore) return memoryStore;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      memoryStore = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DISK DB] Error reading persistent store:', err);
  }

  if (!memoryStore) {
    memoryStore = {
      admin_users: [],
      admin_otps: [],
      leads: [],
      contacts: [],
      quotes: [],
      career_jobs: [],
      career_applications: [],
      customers: [],
      products: [],
      invoices: [],
      invoice_items: [],
      payments: [],
      projects: [...DEFAULT_PROJECTS],
      project_expenses: [...DEFAULT_PROJECT_EXPENSES],
      invoice_sequences: [],
      invoice_settings: [],
      invoice_audit_logs: []
    };
  }

  // Ensure arrays exist
  if (!Array.isArray(memoryStore.customers)) memoryStore.customers = [];
  if (!Array.isArray(memoryStore.products) || memoryStore.products.length === 0) memoryStore.products = [...DEFAULT_BILLING_PRODUCTS];
  if (!Array.isArray(memoryStore.projects) || memoryStore.projects.length === 0) memoryStore.projects = [...DEFAULT_PROJECTS];
  if (!Array.isArray(memoryStore.project_expenses) || memoryStore.project_expenses.length === 0) memoryStore.project_expenses = [...DEFAULT_PROJECT_EXPENSES];
  if (!Array.isArray(memoryStore.invoices)) memoryStore.invoices = [];
  if (!Array.isArray(memoryStore.invoice_items)) memoryStore.invoice_items = [];
  if (!Array.isArray(memoryStore.payments)) memoryStore.payments = [];
  if (!Array.isArray(memoryStore.invoice_sequences)) memoryStore.invoice_sequences = [];
  if (!Array.isArray(memoryStore.invoice_settings) || memoryStore.invoice_settings.length === 0) {
    memoryStore.invoice_settings = [{ ...DEFAULT_BILLING_SETTINGS }];
  } else {
    memoryStore.invoice_settings[0] = { ...DEFAULT_BILLING_SETTINGS, ...memoryStore.invoice_settings[0] };
  }
  if (!Array.isArray(memoryStore.invoice_audit_logs)) memoryStore.invoice_audit_logs = [];

  // Seed default customers if empty
  if (memoryStore.customers.length === 0) {
    memoryStore.customers = [
      {
        id: 1,
        name: 'Rajesh Sharma',
        company_name: 'Apex Supermarket & Kirana',
        mobile: '+91 98201 11222',
        email: 'rajesh@apexkirana.com',
        billing_address: 'Shop 12-14, Green Valley Heights, Andheri West',
        shipping_address: 'Shop 12-14, Green Valley Heights, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        gstin: '27AABCA1234A1Z1',
        pan: 'AABCA1234A',
        customer_type: 'Retail',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 2,
        name: 'Vikramaditya Roy',
        company_name: 'Nexus Cloud Logistics Ltd',
        mobile: '+91 98302 33445',
        email: 'v.roy@nexuslogistics.in',
        billing_address: 'Plot 45, Sector 18, Electronics Zone',
        shipping_address: 'Warehouse Hub 3, Bhiwandi Road',
        city: 'Thane',
        state: 'Maharashtra',
        pincode: '421302',
        gstin: '27AABCN5678B1Z9',
        pan: 'AABCN5678B',
        customer_type: 'Enterprise',
        created_at: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        id: 3,
        name: 'Ananya Deshmukh',
        company_name: 'Aarav Fashion & Lifestyle',
        mobile: '+91 97654 44556',
        email: 'ananya@aaravfashions.com',
        billing_address: 'MG Road, Camp Area',
        shipping_address: 'MG Road, Camp Area',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        gstin: '27AABCD9012C1Z4',
        pan: 'AABCD9012C',
        customer_type: 'Retail',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 4,
        name: 'Suresh Patel',
        company_name: 'Patel Electronics & Gadgets',
        mobile: '+91 98250 99887',
        email: 'suresh@patelelectronics.com',
        billing_address: 'Near Clock Tower, Navrangpura',
        shipping_address: 'Near Clock Tower, Navrangpura',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380009',
        gstin: '24AABCP3456D1Z2',
        pan: 'AABCP3456D',
        customer_type: 'B2B',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
  }

  // Seed sample invoices if empty
  if (memoryStore.invoices.length === 0) {
    const inv1Date = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
    const inv2Date = new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0];
    const inv3Date = new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0];

    // Invoice 1: Apex Kirana (Paid)
    // Kirana Software (25k market, 20k selling) + Scanner (4k market, 3.5k selling) + Printer (8k market, 6.5k selling) + Installation (2k market, 1.5k selling)
    // Market: 39000. Selling: 31500. Discount: 7500. GST 18%: 5670. Total: 37170. Paid: 37170.
    memoryStore.invoices.push({
      id: 1,
      invoice_number: 'D8/INV/2026-27/000001',
      invoice_date: inv1Date,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      financial_year: '2026-27',
      lead_id: null,
      customer_id: 1,
      customer_name: 'Rajesh Sharma',
      customer_company: 'Apex Supermarket & Kirana',
      customer_mobile: '+91 98201 11222',
      customer_email: 'rajesh@apexkirana.com',
      customer_address: 'Shop 12-14, Green Valley Heights, Andheri West, Mumbai, Maharashtra 400053',
      customer_city: 'Mumbai',
      customer_state: 'Maharashtra',
      customer_pincode: '400053',
      customer_gstin: '27AABCA1234A1Z1',
      sales_user_id: 4,
      sales_person_name: 'Arjun Verma',
      market_total: 39000.00,
      discount_total: 7500.00,
      extra_discount_type: 'fixed',
      extra_discount_value: 0.00,
      extra_discount_amount: 0.00,
      taxable_amount: 31500.00,
      tax_type: 'intra_state',
      cgst_amount: 2835.00,
      sgst_amount: 2835.00,
      igst_amount: 0.00,
      tax_total: 5670.00,
      round_off: 0.00,
      grand_total: 37170.00,
      amount_paid: 37170.00,
      balance_amount: 0.00,
      payment_status: 'paid',
      invoice_status: 'generated',
      notes: 'Hardware delivered and installed on site. Complete retail setup handed over.',
      terms_conditions: DEFAULT_BILLING_SETTINGS.terms_conditions,
      created_by: 'Arjun Verma',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
    });

    memoryStore.invoice_items.push(
      {
        id: 1,
        invoice_id: 1,
        product_id: 1,
        item_type: 'software',
        item_name: 'Digi8 Kirana Software',
        description: 'Retail & Supermarket Billing Suite (Single Terminal Lifetime License)',
        sku: 'DIGI8-SW-KIRANA',
        quantity: 1,
        unit: 'license',
        market_price: 25000.00,
        selling_price: 20000.00,
        discount_type: 'fixed',
        discount_value: 5000.00,
        discount_amount: 5000.00,
        tax_percentage: 18.00,
        tax_amount: 3600.00,
        line_total: 23600.00,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 2,
        invoice_id: 1,
        product_id: 8,
        item_type: 'hardware',
        item_name: 'Omnidirectional 2D Barcode Scanner',
        description: 'Hands-free desktop 1D/2D QR scanner',
        sku: 'DIGI8-HW-SCAN2D',
        quantity: 1,
        unit: 'pcs',
        market_price: 4000.00,
        selling_price: 3500.00,
        discount_type: 'fixed',
        discount_value: 500.00,
        discount_amount: 500.00,
        tax_percentage: 18.00,
        tax_amount: 630.00,
        line_total: 4130.00,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 3,
        invoice_id: 1,
        product_id: 9,
        item_type: 'hardware',
        item_name: 'High Speed 80mm Bill Thermal Printer',
        description: 'Thermal receipt printer with auto-cutter',
        sku: 'DIGI8-HW-PRN80',
        quantity: 1,
        unit: 'pcs',
        market_price: 8000.00,
        selling_price: 6500.00,
        discount_type: 'fixed',
        discount_value: 1500.00,
        discount_amount: 1500.00,
        tax_percentage: 18.00,
        tax_amount: 1170.00,
        line_total: 7670.00,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 4,
        invoice_id: 1,
        product_id: 12,
        item_type: 'services',
        item_name: 'Onsite Installation & Setup',
        description: 'Hardware configuration & printer testing',
        sku: 'DIGI8-SRV-INST',
        quantity: 1,
        unit: 'visit',
        market_price: 2000.00,
        selling_price: 1500.00,
        discount_type: 'fixed',
        discount_value: 500.00,
        discount_amount: 500.00,
        tax_percentage: 18.00,
        tax_amount: 270.00,
        line_total: 1770.00,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    );

    memoryStore.payments.push({
      id: 1,
      invoice_id: 1,
      payment_number: 'PAY-2026-0001',
      amount: 37170.00,
      payment_method: 'UPI',
      transaction_reference: 'UPI/98201/9928198291',
      payment_date: inv1Date,
      notes: 'Full payment received via PhonePe QR code.',
      created_by: 'Arjun Verma',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    });

    // Invoice 2: Nexus Cloud Logistics (Partially Paid)
    // Custom Software + ERP modules (Market: 1,50,000, Selling: 1,20,000) + Custom API Integration (Market: 15k, Selling: 10k)
    // Total Market: 165000. Selling: 130000. Discount: 35000. Taxable: 130000. GST 18%: 23400. Grand: 153400. Paid: 80000. Bal: 73400.
    memoryStore.invoices.push({
      id: 2,
      invoice_number: 'D8/INV/2026-27/000002',
      invoice_date: inv2Date,
      due_date: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
      financial_year: '2026-27',
      lead_id: null,
      customer_id: 2,
      customer_name: 'Vikramaditya Roy',
      customer_company: 'Nexus Cloud Logistics Ltd',
      customer_mobile: '+91 98302 33445',
      customer_email: 'v.roy@nexuslogistics.in',
      customer_address: 'Plot 45, Sector 18, Electronics Zone, Thane, Maharashtra 421302',
      customer_city: 'Thane',
      customer_state: 'Maharashtra',
      customer_pincode: '421302',
      customer_gstin: '27AABCN5678B1Z9',
      sales_user_id: 5,
      sales_person_name: 'Priya Sharma',
      market_total: 165000.00,
      discount_total: 35000.00,
      extra_discount_type: 'fixed',
      extra_discount_value: 0.00,
      extra_discount_amount: 0.00,
      taxable_amount: 130000.00,
      tax_type: 'intra_state',
      cgst_amount: 11700.00,
      sgst_amount: 11700.00,
      igst_amount: 0.00,
      tax_total: 23400.00,
      round_off: 0.00,
      grand_total: 153400.00,
      amount_paid: 80000.00,
      balance_amount: 73400.00,
      payment_status: 'partially_paid',
      invoice_status: 'generated',
      notes: 'Phase 1 advance paid (₹80,000). Balance due on milestone acceptance.',
      terms_conditions: DEFAULT_BILLING_SETTINGS.terms_conditions,
      created_by: 'Priya Sharma',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
    });

    memoryStore.invoice_items.push(
      {
        id: 5,
        invoice_id: 2,
        product_id: 7,
        item_type: 'software',
        item_name: 'Digi8 Enterprise ERP',
        description: 'Multi-warehouse fleet & consignment dispatch ERP',
        sku: 'DIGI8-SW-ERP',
        quantity: 1,
        unit: 'deployment',
        market_price: 150000.00,
        selling_price: 120000.00,
        discount_type: 'fixed',
        discount_value: 30000.00,
        discount_amount: 30000.00,
        tax_percentage: 18.00,
        tax_amount: 21600.00,
        line_total: 141600.00,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 6,
        invoice_id: 2,
        product_id: 15,
        item_type: 'custom',
        item_name: 'Custom Fleet GPS Gateway Integration',
        description: 'Real-time telemetry and FASTag automatic toll deduction API sync',
        sku: 'CUSTOM-GPS-API',
        quantity: 1,
        unit: 'integration',
        market_price: 15000.00,
        selling_price: 10000.00,
        discount_type: 'fixed',
        discount_value: 5000.00,
        discount_amount: 5000.00,
        tax_percentage: 18.00,
        tax_amount: 1800.00,
        line_total: 11800.00,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    );

    memoryStore.payments.push({
      id: 2,
      invoice_id: 2,
      payment_number: 'PAY-2026-0002',
      amount: 80000.00,
      payment_method: 'Bank Transfer',
      transaction_reference: 'NEFT/HDFC/N29381029381',
      payment_date: inv2Date,
      notes: 'Initial mobilization advance payment.',
      created_by: 'Priya Sharma',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    });

    // Invoice 3: Patel Electronics (Inter-state Gujarat: IGST, Unpaid)
    // POS Terminal (38k market, 32k selling) + Printer (8k market, 6.5k selling)
    // Market: 46000. Selling: 38500. Discount: 7500. IGST 18%: 6930. Grand: 45430. Paid: 0. Balance: 45430.
    memoryStore.invoices.push({
      id: 3,
      invoice_number: 'D8/INV/2026-27/000003',
      invoice_date: inv3Date,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      financial_year: '2026-27',
      lead_id: null,
      customer_id: 4,
      customer_name: 'Suresh Patel',
      customer_company: 'Patel Electronics & Gadgets',
      customer_mobile: '+91 98250 99887',
      customer_email: 'suresh@patelelectronics.com',
      customer_address: 'Near Clock Tower, Navrangpura, Ahmedabad, Gujarat 380009',
      customer_city: 'Ahmedabad',
      customer_state: 'Gujarat',
      customer_pincode: '380009',
      customer_gstin: '24AABCP3456D1Z2',
      sales_user_id: 4,
      sales_person_name: 'Arjun Verma',
      market_total: 46000.00,
      discount_total: 7500.00,
      extra_discount_type: 'fixed',
      extra_discount_value: 0.00,
      extra_discount_amount: 0.00,
      taxable_amount: 38500.00,
      tax_type: 'inter_state',
      cgst_amount: 0.00,
      sgst_amount: 0.00,
      igst_amount: 6930.00,
      tax_total: 6930.00,
      round_off: 0.00,
      grand_total: 45430.00,
      amount_paid: 0.00,
      balance_amount: 45430.00,
      payment_status: 'unpaid',
      invoice_status: 'generated',
      notes: 'Hardware dispatched via BlueDart Express (Waybill #BD8892182). Due in 14 days.',
      terms_conditions: DEFAULT_BILLING_SETTINGS.terms_conditions,
      created_by: 'Arjun Verma',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    });

    memoryStore.invoice_items.push(
      {
        id: 7,
        invoice_id: 3,
        product_id: 10,
        item_type: 'hardware',
        item_name: 'All-in-One Touch POS Terminal',
        description: 'Capacitive touch 15.6 inch POS terminal (Intel / 8GB / 128GB SSD)',
        sku: 'DIGI8-HW-POSTERM',
        quantity: 1,
        unit: 'pcs',
        market_price: 38000.00,
        selling_price: 32000.00,
        discount_type: 'fixed',
        discount_value: 6000.00,
        discount_amount: 6000.00,
        tax_percentage: 18.00,
        tax_amount: 5760.00,
        line_total: 37760.00,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 8,
        invoice_id: 3,
        product_id: 9,
        item_type: 'hardware',
        item_name: 'High Speed 80mm Bill Thermal Printer',
        description: 'Heavy duty USB/LAN thermal printer with cutter',
        sku: 'DIGI8-HW-PRN80',
        quantity: 1,
        unit: 'pcs',
        market_price: 8000.00,
        selling_price: 6500.00,
        discount_type: 'fixed',
        discount_value: 1500.00,
        discount_amount: 1500.00,
        tax_percentage: 18.00,
        tax_amount: 1170.00,
        line_total: 7670.00,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    );

    memoryStore.invoice_audit_logs.push(
      {
        id: 1,
        invoice_id: 1,
        invoice_number: 'D8/INV/2026-27/000001',
        action: 'GENERATED',
        old_value: 'Draft',
        new_value: 'Generated (₹37,170.00)',
        performed_by: 'Arjun Verma',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 2,
        invoice_id: 1,
        invoice_number: 'D8/INV/2026-27/000001',
        action: 'PAYMENT_ADDED',
        old_value: 'Balance ₹37,170.00',
        new_value: 'Paid ₹37,170.00 (UPI)',
        performed_by: 'Arjun Verma',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 3,
        invoice_id: 2,
        invoice_number: 'D8/INV/2026-27/000002',
        action: 'GENERATED',
        old_value: 'Draft',
        new_value: 'Generated (₹1,53,400.00)',
        performed_by: 'Priya Sharma',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 4,
        invoice_id: 2,
        invoice_number: 'D8/INV/2026-27/000002',
        action: 'PAYMENT_ADDED',
        old_value: 'Balance ₹1,53,400.00',
        new_value: 'Paid ₹80,000.00 (Bank Transfer)',
        performed_by: 'Priya Sharma',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 5,
        invoice_id: 3,
        invoice_number: 'D8/INV/2026-27/000003',
        action: 'GENERATED',
        old_value: 'Draft',
        new_value: 'Generated (₹45,430.00)',
        performed_by: 'Arjun Verma',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    );
  }

  // Ensure default seed users exist in persistent store
  const superAdminEmail = 'admin@digi8solutions.com';
  if (!memoryStore.admin_users.some(u => u.email === superAdminEmail)) {
    memoryStore.admin_users.push({
      id: 1,
      name: 'Digi-8 Super Admin',
      email: superAdminEmail,
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash for AdminDigi8Password2026!
      role: 'Super Admin',
      status: 'active',
      auth_provider: 'local',
      allowed_modules: ['*'],
      created_at: new Date().toISOString()
    });
  }

  const officialGmail = (process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com').toLowerCase().trim();
  if (!memoryStore.admin_users.some(u => u.email.toLowerCase() === officialGmail)) {
    memoryStore.admin_users.push({
      id: 2,
      name: 'Digi-8 Official Admin',
      email: officialGmail,
      password_hash: '',
      role: 'Super Admin',
      status: 'active',
      auth_provider: 'google',
      allowed_modules: ['*'],
      created_at: new Date().toISOString()
    });
  }

  // Seed Sales Executive
  const salesEmail = 'sales@digi8solutions.com';
  if (!memoryStore.admin_users.some(u => u.email.toLowerCase() === salesEmail)) {
    memoryStore.admin_users.push({
      id: 4,
      name: 'Arjun Verma (Sales)',
      email: salesEmail,
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'Sales Executive',
      status: 'active',
      auth_provider: 'local',
      allowed_modules: ['dashboard', 'invoices', 'customers', 'leads'],
      created_at: new Date().toISOString()
    });
  }

  // Seed Sales Manager
  const managerEmail = 'manager@digi8solutions.com';
  if (!memoryStore.admin_users.some(u => u.email.toLowerCase() === managerEmail)) {
    memoryStore.admin_users.push({
      id: 5,
      name: 'Priya Sharma (Sales Manager)',
      email: managerEmail,
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'Sales Manager',
      status: 'active',
      auth_provider: 'local',
      allowed_modules: ['dashboard', 'invoices', 'customers', 'leads', 'analytics'],
      created_at: new Date().toISOString()
    });
  }

  savePersistentStore(memoryStore);
  return memoryStore;
};

export const savePersistentStore = (store: PersistentDbStore) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    memoryStore = store;
  } catch (err) {
    console.warn('[DISK DB] Error saving persistent store:', err);
  }
};

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'digi8';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Guard pool against unhandled error crashes
(pool as any).on?.('error', (err: any) => {
  console.warn('[DB POOL EVENT] MySQL Pool Notice:', err?.message || err);
});

export const initDb = async () => {
  try {
    // 1. Two-stage setup: connect without database to ensure database exists
    try {
      const bootstrapConn = await mysql.createConnection({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        port: dbPort,
        connectTimeout: 3000
      });
      await bootstrapConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await bootstrapConn.end();
    } catch (bootstrapErr: any) {
      // If raw bootstrap fails (e.g. server offline), proceed to pool attempt which catches appropriately
    }

    const connection = await pool.getConnection();
    try {
      // Basic tables matching schema
      await connection.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          first_name VARCHAR(255),
          last_name VARCHAR(255),

        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        industry VARCHAR(255),
        budget VARCHAR(100),
        timeline VARCHAR(100),
        services JSON,
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        quote_number VARCHAR(100),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        website VARCHAR(255),
        project_type VARCHAR(100),
        project_details TEXT,
        total_estimate DECIMAL(10,2),
        selected_features JSON,
        status VARCHAR(50) DEFAULT 'pending',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) UNIQUE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);
      await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Normal User',
        status VARCHAR(50) DEFAULT 'active',
        google_id VARCHAR(255) NULL,
        avatar_url VARCHAR(255) NULL,
        auth_provider VARCHAR(50) DEFAULT 'local',
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP NULL
      );
    `);

      // Safe migrations for social auth and custom access modules
      try { await connection.query(`ALTER TABLE admin_users ADD COLUMN google_id VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE admin_users ADD COLUMN avatar_url VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE admin_users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local'`); } catch {}
      try { await connection.query(`ALTER TABLE admin_users ADD COLUMN allowed_modules TEXT NULL`); } catch {}

      // Admin OTPs table for 2FA / Social / Signup verification
      await connection.query(`
        CREATE TABLE IF NOT EXISTS admin_otps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          email VARCHAR(255) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          purpose VARCHAR(50) DEFAULT 'login',
          expires_at TIMESTAMP NOT NULL,
          is_verified BOOLEAN DEFAULT FALSE
        );
      `);

      const superAdminEmail = 'admin@digi8solutions.com';
      const superAdminPassword = process.env.ADMIN_PASSWORD || 'AdminDigi8Password2026!';

      const [adminRows]: any = await connection.query('SELECT * FROM admin_users WHERE email = ?', [superAdminEmail]);
      if (adminRows.length === 0) {
        const defaultHash = await bcrypt.hash(superAdminPassword, 10);
        await connection.query(
          'INSERT INTO admin_users (name, email, password_hash, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
          ['Digi-8 Super Admin', superAdminEmail, defaultHash, 'Super Admin', 'local']
        );
        console.log(`[DB INFO] Default Super Admin user created: ${superAdminEmail}`);
      }

      // Seed official company Gmail as Super Admin for direct Google / OTP Login
      const officialGmail = process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com';
      const [gmailRows]: any = await connection.query('SELECT * FROM admin_users WHERE email = ?', [officialGmail]);
      if (gmailRows.length === 0) {
        const gmailHash = await bcrypt.hash(superAdminPassword, 10);
        await connection.query(
          'INSERT INTO admin_users (name, email, password_hash, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
          ['Digi-8 Official Admin', officialGmail, gmailHash, 'Super Admin', 'google']
        );
        console.log(`[DB INFO] Default Gmail Super Admin user created: ${officialGmail}`);
      }

      await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        image_url VARCHAR(255),
        client VARCHAR(255),
        completion_date VARCHAR(100),
        results JSON,
        sort_order INT DEFAULT 0
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        role VARCHAR(100),
        company VARCHAR(255),
        content TEXT,
        rating INT DEFAULT 5,
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255),
        slug VARCHAR(255) UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        author VARCHAR(100),
        category VARCHAR(100),
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft'
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        price VARCHAR(100),
        features JSON
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ticket_number VARCHAR(100) UNIQUE NOT NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        user_phone VARCHAR(50),
        service_category VARCHAR(100),
        subject VARCHAR(255),
        description TEXT,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        assigned_to VARCHAR(255) DEFAULT 'Support Desk',
        resolution_notes TEXT
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS career_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at TIMESTAMP NULL,
        job_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        job_type VARCHAR(100) NOT NULL,
        work_mode VARCHAR(50) NOT NULL,
        location VARCHAR(150) NOT NULL,
        experience VARCHAR(100) NOT NULL,
        openings INT DEFAULT 1,
        compensation VARCHAR(150),
        short_description TEXT,
        description LONGTEXT,
        responsibilities JSON,
        requirements JSON,
        skills JSON,
        documents_required JSON,
        custom_questions JSON,
        application_deadline DATE,
        status VARCHAR(50) DEFAULT 'published',
        created_by VARCHAR(255) DEFAULT 'HR Admin'
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS career_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        application_id VARCHAR(50) UNIQUE NOT NULL,
        job_id VARCHAR(50) NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        location VARCHAR(150),
        current_role VARCHAR(150),
        experience VARCHAR(100),
        skills JSON,
        linkedin VARCHAR(255),
        portfolio VARCHAR(255),
        github VARCHAR(255),
        availability VARCHAR(100),
        expected_compensation VARCHAR(150),
        cover_message TEXT,
        resume_file VARCHAR(255),
        resume_original_name VARCHAR(255),
        custom_answers JSON,
        documents JSON,
        status VARCHAR(50) DEFAULT 'new'
      )
    `);

      // Seed default active opportunities if career_jobs table is empty
      const [existingJobs]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_jobs');
      if (existingJobs[0]?.cnt === 0) {
        const initialJobs = [
          {
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
            responsibilities: JSON.stringify([
              'Architect, build, and maintain production-grade React & TypeScript applications.',
              'Collaborate closely with UI/UX designers, backend engineers, and product managers.',
              'Optimize applications for maximum speed, scalability, and cross-browser responsiveness.',
              'Mentor junior developers and participate in code reviews to ensure best practices.',
              'Implement automated unit and integration tests for mission-critical interfaces.'
            ]),
            requirements: JSON.stringify([
              '3+ years of professional web development experience with React.js and TypeScript.',
              'Proficient in Tailwind CSS, CSS3 modern layouts (Grid/Flexbox), and state management.',
              'Hands-on experience with RESTful APIs, WebSockets, and asynchronous request handling.',
              'Solid understanding of Git, CI/CD pipelines, and modern bundling tools (Vite, Webpack).',
              'Strong problem-solving skills and passion for pixel-perfect UI implementations.'
            ]),
            skills: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs', 'Git']),
            documents_required: JSON.stringify(['Resume/CV', 'Portfolio / GitHub']),
            custom_questions: JSON.stringify([
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
            ]),
            application_deadline: '2026-12-31',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          },
          {
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
            responsibilities: JSON.stringify([
              'Design wireframes, user journeys, interactive prototypes, and high-fidelity mockups.',
              'Establish and maintain cohesive design systems in Figma.',
              'Work with engineering teams to ensure design fidelity during frontend implementation.',
              'Conduct user research, usability testing, and synthesize feedback into design iterations.'
            ]),
            requirements: JSON.stringify([
              'Proven track record with an online portfolio showcasing digital product design.',
              'Mastery of Figma, design tokens, responsive layout principles, and micro-interactions.',
              'Good understanding of HTML/CSS constraints and modern design trends.'
            ]),
            skills: JSON.stringify(['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping']),
            documents_required: JSON.stringify(['Resume/CV', 'Design Portfolio Link']),
            custom_questions: JSON.stringify([
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
            ]),
            application_deadline: '2026-11-30',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          },
          {
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
            responsibilities: JSON.stringify([
              'Develop RESTful and GraphQL APIs with Node.js and TypeScript.',
              'Optimize database queries, indexing, and connection pools for MySQL/PostgreSQL.',
              'Implement security best practices including JWT, rate limiting, and OAuth.',
              'Architect scalable cloud deployments with Docker, AWS/GCP, and CI/CD pipelines.'
            ]),
            requirements: JSON.stringify([
              '3+ years backend development experience with Node.js & TypeScript.',
              'Deep understanding of relational databases (MySQL/PostgreSQL) and caching (Redis).',
              'Experience in API security, asynchronous messaging, and scalable microservices.'
            ]),
            skills: JSON.stringify(['Node.js', 'Express', 'TypeScript', 'MySQL', 'Redis', 'Docker', 'AWS']),
            documents_required: JSON.stringify(['Resume/CV']),
            custom_questions: JSON.stringify([
              {
                id: 'q1',
                question: 'What is your current notice period?',
                type: 'dropdown',
                required: true,
                options: ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days']
              }
            ]),
            application_deadline: '2026-12-15',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          },
          {
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
            responsibilities: JSON.stringify([
              'Plan and manage multi-channel paid acquisition campaigns (Google, Meta, LinkedIn).',
              'Execute technical and on-page SEO audits and content distribution strategies.',
              'Track attribution, KPIs, and campaign performance in Google Analytics 4.'
            ]),
            requirements: JSON.stringify([
              'Demonstrated success managing Google Ads and Meta Ads budgets with measurable ROAS.',
              'Strong knowledge of GA4, GTM, SEO tools (Ahrefs/Semrush), and email marketing funnels.'
            ]),
            skills: JSON.stringify(['SEO', 'Google Ads', 'Meta Ads', 'GA4', 'Performance Marketing']),
            documents_required: JSON.stringify(['Resume/CV', 'Past Campaign Case Studies']),
            custom_questions: JSON.stringify([
              {
                id: 'q1',
                question: 'What has been the largest monthly advertising budget you have managed?',
                type: 'short text',
                required: false,
                options: []
              }
            ]),
            application_deadline: '2026-11-15',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          }
        ];

        for (const j of initialJobs) {
          await connection.query(
            `INSERT INTO career_jobs 
             (job_id, title, slug, category, job_type, work_mode, location, experience, openings, compensation, short_description, description, responsibilities, requirements, skills, documents_required, custom_questions, application_deadline, status, created_by, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              j.job_id, j.title, j.slug, j.category, j.job_type, j.work_mode, j.location,
              j.experience, j.openings, j.compensation, j.short_description, j.description,
              j.responsibilities, j.requirements, j.skills, j.documents_required, j.custom_questions,
              j.application_deadline, j.status, j.created_by
            ]
          );
        }
        console.log('[DB INFO] Seeded 4 initial career opportunity listings.');
      }

      // --- PHASE 2 ATS TABLES & SEEDS ---

      // Safely ensure Phase 2 columns exist on career_applications
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN stage_slug VARCHAR(50) DEFAULT 'applied'`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN recruiter_id VARCHAR(50) NULL`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN recruiter_name VARCHAR(150) NULL`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN source VARCHAR(100) DEFAULT 'website'`);
      } catch {}

      // 1. Recruitment Stages
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_stages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(50) UNIQUE NOT NULL,
          color VARCHAR(30) DEFAULT '#06b6d4',
          order_index INT DEFAULT 0,
          stage_type VARCHAR(50) DEFAULT 'in_progress',
          is_system BOOLEAN DEFAULT TRUE,
          active BOOLEAN DEFAULT TRUE
        )
      `);

      // Seed Default Stages
      const [stageRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_stages');
      if (stageRows[0]?.cnt === 0) {
        const defaultStages = [
          { name: 'Applied', slug: 'applied', color: '#0ea5e9', order_index: 1, stage_type: 'applied' },
          { name: 'Screening', slug: 'screening', color: '#8b5cf6', order_index: 2, stage_type: 'screening' },
          { name: 'Shortlisted', slug: 'shortlisted', color: '#06b6d4', order_index: 3, stage_type: 'shortlisted' },
          { name: 'Interview', slug: 'interview', color: '#f59e0b', order_index: 4, stage_type: 'interview' },
          { name: 'Assessment', slug: 'assessment', color: '#3b82f6', order_index: 5, stage_type: 'assessment' },
          { name: 'Selected', slug: 'selected', color: '#10b981', order_index: 6, stage_type: 'selected' },
          { name: 'Hired', slug: 'hired', color: '#059669', order_index: 7, stage_type: 'hired' },
          { name: 'Rejected', slug: 'rejected', color: '#ef4444', order_index: 8, stage_type: 'rejected' }
        ];

        for (const st of defaultStages) {
          await connection.query(
            `INSERT INTO career_stages (name, slug, color, order_index, stage_type, is_system, active) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)`,
            [st.name, st.slug, st.color, st.order_index, st.stage_type]
          );
        }
        console.log('[DB INFO] Seeded default recruitment stages.');
      }

      // 2. Stage History
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_stage_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          application_id VARCHAR(50) NOT NULL,
          from_stage VARCHAR(50),
          to_stage VARCHAR(50) NOT NULL,
          changed_by VARCHAR(150) DEFAULT 'Recruiter',
          notes TEXT
        )
      `);

      // 3. Internal Notes
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255) NOT NULL,
          application_id VARCHAR(50),
          author_name VARCHAR(150) DEFAULT 'Recruiter',
          content TEXT NOT NULL
        )
      `);

      // 4. Candidate Tags
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_candidate_tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255) NOT NULL,
          tag_name VARCHAR(100) NOT NULL
        )
      `);

      // 5. Recruiter Tasks
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255),
          application_id VARCHAR(50),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          assigned_to VARCHAR(150) DEFAULT 'Recruiter',
          due_date DATE,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(30) DEFAULT 'pending'
        )
      `);

      // 6. Email Templates
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_email_templates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          body LONGTEXT NOT NULL,
          category VARCHAR(50) DEFAULT 'general',
          variables TEXT,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Seed Default Email Templates
      const [tplRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_email_templates');
      if (tplRows[0]?.cnt === 0) {
        const defaultTemplates = [
          {
            name: 'Application Received Confirmation',
            subject: 'We have received your application for {{job_title}} — DIGI8 Solutions',
            body: 'Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} position at DIGI8 Solutions. Your unique Application Reference ID is {{application_id}}.\n\nOur talent acquisition team has received your profile and will review your experience carefully. You will hear back from us regarding the next steps soon.\n\nBest regards,\nDIGI8 Solutions Talent Team',
            category: 'acknowledgement',
            variables: JSON.stringify(['candidate_name', 'job_title', 'application_id', 'company_name']),
            is_default: true
          },
          {
            name: 'Profile Shortlisted for Evaluation',
            subject: 'Great News! You have been shortlisted for {{job_title}} at DIGI8 Solutions',
            body: 'Dear {{candidate_name}},\n\nWe were impressed by your background and are excited to inform you that your application for {{job_title}} has been shortlisted!\n\nOur recruiting specialist {{recruiter_name}} will be coordinating the next stage with you shortly.\n\nWarm regards,\nDIGI8 Solutions Recruitment',
            category: 'shortlist',
            variables: JSON.stringify(['candidate_name', 'job_title', 'recruiter_name']),
            is_default: true
          },
          {
            name: 'Technical / Cultural Interview Invitation',
            subject: 'Interview Invitation: {{job_title}} at DIGI8 Solutions',
            body: 'Hi {{candidate_name}},\n\nWe would like to invite you for a virtual interview for the {{job_title}} position.\n\nDetails:\nDate: {{interview_date}}\nTime: {{interview_time}}\nMeeting Link: {{meeting_link}}\n\nPlease reply to confirm this slot or let us know if you need to reschedule.\n\nBest regards,\nDIGI8 Talent Team',
            category: 'interview',
            variables: JSON.stringify(['candidate_name', 'job_title', 'interview_date', 'interview_time', 'meeting_link']),
            is_default: true
          },
          {
            name: 'Formal Selection & Offer Letter',
            subject: 'Congratulations! Job Offer: {{job_title}} at DIGI8 Solutions',
            body: 'Dear {{candidate_name}},\n\nOn behalf of DIGI8 Solutions, we are thrilled to offer you the position of {{job_title}}!\n\nTarget Joining Date: {{joining_date}}\n\nPlease review the attached offer details and feel free to reach out with any questions. We look forward to building great digital products together!\n\nWarm regards,\nDIGI8 Solutions Leadership Team',
            category: 'offer',
            variables: JSON.stringify(['candidate_name', 'job_title', 'joining_date']),
            is_default: true
          },
          {
            name: 'Candidate Rejection Notice',
            subject: 'Update on your application for {{job_title}} — DIGI8 Solutions',
            body: 'Dear {{candidate_name}},\n\nThank you very much for taking the time to speak with us regarding the {{job_title}} role at DIGI8 Solutions.\n\nWhile our team was impressed with your credentials, we have decided to move forward with another applicant whose specific experience more closely aligns with our immediate goals for this role.\n\nWe will retain your profile in our talent network and reach out if a relevant opportunity emerges.\n\nWe wish you all the best in your career journey.\n\nBest regards,\nDIGI8 Talent Acquisition',
            category: 'rejection',
            variables: JSON.stringify(['candidate_name', 'job_title']),
            is_default: true
          }
        ];

        for (const tpl of defaultTemplates) {
          await connection.query(
            `INSERT INTO career_email_templates (name, subject, body, category, variables, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
            [tpl.name, tpl.subject, tpl.body, tpl.category, tpl.variables, tpl.is_default]
          );
        }
        console.log('[DB INFO] Seeded default email templates.');
      }

      // 7. Email Logs (Communication History)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_email_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          application_id VARCHAR(50),
          candidate_email VARCHAR(255) NOT NULL,
          template_id INT,
          template_name VARCHAR(255),
          subject VARCHAR(255) NOT NULL,
          body LONGTEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'delivered',
          sent_by VARCHAR(150) DEFAULT 'System',
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 8. Interviews
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_interviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255) NOT NULL,
          application_id VARCHAR(50) NOT NULL,
          job_id VARCHAR(50),
          interview_type VARCHAR(50) DEFAULT 'Video',
          interviewer VARCHAR(150) DEFAULT 'Technical Lead',
          date DATE NOT NULL,
          time VARCHAR(50) NOT NULL,
          duration VARCHAR(50) DEFAULT '45 mins',
          meeting_link VARCHAR(255),
          location VARCHAR(150),
          status VARCHAR(50) DEFAULT 'scheduled',
          instructions TEXT,
          notes TEXT
        )
      `);

      // 9. Interview Feedback
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_interview_feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          interview_id INT NOT NULL,
          interviewer VARCHAR(150) NOT NULL,
          rating INT DEFAULT 4,
          recommendation VARCHAR(50) DEFAULT 'Hire',
          strengths TEXT,
          concerns TEXT,
          notes TEXT
        )
      `);

      // 10. Automation Rules
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_automation_rules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          event_trigger VARCHAR(50) NOT NULL DEFAULT 'stage_change',
          trigger_stage VARCHAR(50),
          action_type VARCHAR(50) NOT NULL DEFAULT 'send_email',
          email_template_id INT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Seed Default Automation Rules
      const [autoRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_automation_rules');
      if (autoRows[0]?.cnt === 0) {
        const defaultRules = [
          { name: 'Auto-reply on Application Received', event_trigger: 'stage_change', trigger_stage: 'applied', action_type: 'send_email', email_template_id: 1 },
          { name: 'Shortlist Notification Email', event_trigger: 'stage_change', trigger_stage: 'shortlisted', action_type: 'send_email', email_template_id: 2 },
          { name: 'Interview Scheduled Notification', event_trigger: 'interview_scheduled', trigger_stage: 'interview', action_type: 'send_email', email_template_id: 3 },
          { name: 'Offer Notification Email', event_trigger: 'stage_change', trigger_stage: 'selected', action_type: 'send_email', email_template_id: 4 },
          { name: 'Candidate Rejection Notice', event_trigger: 'stage_change', trigger_stage: 'rejected', action_type: 'send_email', email_template_id: 5 }
        ];
        for (const rule of defaultRules) {
          await connection.query(
            `INSERT INTO career_automation_rules (name, event_trigger, trigger_stage, action_type, email_template_id, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`,
            [rule.name, rule.event_trigger, rule.trigger_stage, rule.action_type, rule.email_template_id]
          );
        }
        console.log('[DB INFO] Seeded default ATS automation rules.');
      }

      // 11. Audit Logs
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_name VARCHAR(150) DEFAULT 'Recruiter',
          action VARCHAR(100) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(50) NOT NULL,
          details TEXT
        )
      `);

      // ──────────────────────────────────────────────
      // 12. INVOICE & BILLING MANAGEMENT MODULE TABLES
      // ──────────────────────────────────────────────

      // Customers Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          company_name VARCHAR(255),
          mobile VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          billing_address TEXT,
          shipping_address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(20),
          gstin VARCHAR(50),
          pan VARCHAR(50),
          customer_type VARCHAR(50) DEFAULT 'B2B',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Products & Services Catalogue
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(100) UNIQUE NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT,
          market_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          default_selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
          hsn_sac VARCHAR(50),
          unit VARCHAR(50) DEFAULT 'pcs',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Invoice Settings & Branding
      await connection.query(`
        CREATE TABLE IF NOT EXISTS invoice_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_name VARCHAR(255) DEFAULT 'Digi8 Solutions Private Limited',
          company_address TEXT,
          company_city VARCHAR(100) DEFAULT 'Mumbai',
          company_state VARCHAR(100) DEFAULT 'Maharashtra',
          company_state_code VARCHAR(10) DEFAULT '27',
          company_pincode VARCHAR(20) DEFAULT '400064',
          company_phone VARCHAR(50) DEFAULT '+91 98200 88888',
          company_email VARCHAR(255) DEFAULT 'billing@digi8solutions.com',
          company_website VARCHAR(255) DEFAULT 'https://digi8solutions.com',
          company_gstin VARCHAR(50) DEFAULT '27AABCD1234F1Z5',
          company_pan VARCHAR(50) DEFAULT 'AABCD1234F',
          invoice_prefix VARCHAR(50) DEFAULT 'D8/INV',
          financial_year VARCHAR(50) DEFAULT '2026-27',
          starting_number INT DEFAULT 1,
          next_number INT DEFAULT 1,
          number_padding INT DEFAULT 6,
          terms_conditions TEXT,
          bank_name VARCHAR(150) DEFAULT 'HDFC Bank Ltd',
          bank_account_number VARCHAR(100) DEFAULT '50200098765432',
          bank_ifsc VARCHAR(50) DEFAULT 'HDFC0000123',
          bank_branch VARCHAR(150) DEFAULT 'Mindspace Branch, Mumbai',
          upi_id VARCHAR(100) DEFAULT 'digi8solutions@hdfcbank',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Invoice Sequences (Concurrency-safe sequence tracking)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS invoice_sequences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          financial_year VARCHAR(50) UNIQUE NOT NULL,
          prefix VARCHAR(50) NOT NULL DEFAULT 'D8/INV',
          last_number INT NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Invoices Main Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_number VARCHAR(100) UNIQUE NOT NULL,
          invoice_date DATE NOT NULL,
          due_date DATE NULL,
          financial_year VARCHAR(50) NOT NULL,
          lead_id INT NULL,
          customer_id INT NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_company VARCHAR(255),
          customer_mobile VARCHAR(50),
          customer_email VARCHAR(255),
          customer_address TEXT,
          customer_city VARCHAR(100),
          customer_state VARCHAR(100),
          customer_pincode VARCHAR(20),
          customer_gstin VARCHAR(50),
          sales_user_id INT NULL,
          sales_person_name VARCHAR(255) NOT NULL,
          market_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          discount_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          extra_discount_type VARCHAR(20) DEFAULT 'fixed',
          extra_discount_value DECIMAL(12,2) DEFAULT 0.00,
          extra_discount_amount DECIMAL(12,2) DEFAULT 0.00,
          taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          tax_type VARCHAR(50) DEFAULT 'intra_state',
          cgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          sgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          igst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          tax_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          round_off DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
          invoice_status VARCHAR(50) NOT NULL DEFAULT 'draft',
          cancelled_reason TEXT NULL,
          cancelled_at TIMESTAMP NULL,
          notes TEXT,
          terms_conditions TEXT,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_invoice_num (invoice_number),
          INDEX idx_customer (customer_id),
          INDEX idx_sales_user (sales_user_id),
          INDEX idx_status (invoice_status),
          INDEX idx_payment (payment_status)
        )
      `);

      // Invoice Items Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS invoice_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_id INT NOT NULL,
          product_id INT NULL,
          item_type VARCHAR(50) NOT NULL DEFAULT 'software',
          item_name VARCHAR(255) NOT NULL,
          description TEXT,
          sku VARCHAR(100),
          quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
          unit VARCHAR(50) DEFAULT 'pcs',
          market_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          discount_type VARCHAR(20) DEFAULT 'fixed',
          discount_value DECIMAL(12,2) DEFAULT 0.00,
          discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
          tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          line_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_invoice_id (invoice_id)
        )
      `);

      // Payments Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_id INT NOT NULL,
          payment_number VARCHAR(100) UNIQUE NOT NULL,
          amount DECIMAL(12,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          transaction_reference VARCHAR(255),
          payment_date DATE NOT NULL,
          notes TEXT,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_payment_invoice (invoice_id)
        )
      `);

      // Invoice Audit Logs
      await connection.query(`
        CREATE TABLE IF NOT EXISTS invoice_audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_id INT NOT NULL,
          invoice_number VARCHAR(100),
          action VARCHAR(100) NOT NULL,
          old_value TEXT,
          new_value TEXT,
          performed_by VARCHAR(255) NOT NULL,
          ip_address VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_audit_invoice (invoice_id)
        )
      `);

      // Safe migrations for financial workflow enhancements
      try { await connection.query(`ALTER TABLE invoices ADD COLUMN project_id INT NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoices ADD COLUMN project_name VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoices ADD COLUMN payment_details_snapshot JSON NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoices ADD COLUMN tax_calculation_mode VARCHAR(20) DEFAULT 'exclusive'`); } catch {}
      try { await connection.query(`ALTER TABLE invoices ADD COLUMN revision_number INT DEFAULT 1`); } catch {}

      try { await connection.query(`ALTER TABLE payments ADD COLUMN project_id INT NULL`); } catch {}
      try { await connection.query(`ALTER TABLE payments ADD COLUMN status VARCHAR(50) DEFAULT 'success'`); } catch {}
      try { await connection.query(`ALTER TABLE payments ADD COLUMN reversed_at TIMESTAMP NULL`); } catch {}
      try { await connection.query(`ALTER TABLE payments ADD COLUMN reversed_by VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE payments ADD COLUMN reversal_reason TEXT NULL`); } catch {}

      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN upi_display_name VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN bank_account_holder VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN show_upi_qr BOOLEAN DEFAULT TRUE`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN show_bank_details BOOLEAN DEFAULT TRUE`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN payment_instructions TEXT NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN seal_url VARCHAR(500) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN signature_url VARCHAR(500) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN authorized_signatory_name VARCHAR(255) NULL`); } catch {}
      try { await connection.query(`ALTER TABLE invoice_settings ADD COLUMN authorized_signatory_title VARCHAR(255) NULL`); } catch {}

      // Project Expenses Table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          expense_date DATE NOT NULL,
          vendor VARCHAR(255),
          receipt_ref VARCHAR(100),
          notes TEXT,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_expense_project (project_id)
        )
      `);

      // Seed default products if empty in MySQL
      const [prodRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM products');
      if (prodRows[0]?.cnt === 0) {
        for (const p of DEFAULT_BILLING_PRODUCTS) {
          await connection.query(
            `INSERT INTO products (name, code, category, description, market_price, default_selling_price, tax_percentage, hsn_sac, unit, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.name, p.code, p.category, p.description, p.market_price, p.default_selling_price, p.tax_percentage, p.hsn_sac, p.unit, p.is_active]
          );
        }
        console.log('[DB INFO] Seeded default billing products in MySQL.');
      }

      // Seed default invoice settings if empty in MySQL
      const [settingsRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM invoice_settings');
      if (settingsRows[0]?.cnt === 0) {
        await connection.query(
          `INSERT INTO invoice_settings (company_name, company_address, company_city, company_state, company_state_code, company_pincode, company_phone, company_email, company_website, company_gstin, company_pan, invoice_prefix, financial_year, starting_number, next_number, number_padding, terms_conditions, bank_name, bank_account_number, bank_ifsc, bank_branch, upi_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            DEFAULT_BILLING_SETTINGS.company_name, DEFAULT_BILLING_SETTINGS.company_address, DEFAULT_BILLING_SETTINGS.company_city,
            DEFAULT_BILLING_SETTINGS.company_state, DEFAULT_BILLING_SETTINGS.company_state_code, DEFAULT_BILLING_SETTINGS.company_pincode,
            DEFAULT_BILLING_SETTINGS.company_phone, DEFAULT_BILLING_SETTINGS.company_email, DEFAULT_BILLING_SETTINGS.company_website,
            DEFAULT_BILLING_SETTINGS.company_gstin, DEFAULT_BILLING_SETTINGS.company_pan, DEFAULT_BILLING_SETTINGS.invoice_prefix,
            DEFAULT_BILLING_SETTINGS.financial_year, DEFAULT_BILLING_SETTINGS.starting_number, 4,
            DEFAULT_BILLING_SETTINGS.number_padding, DEFAULT_BILLING_SETTINGS.terms_conditions, DEFAULT_BILLING_SETTINGS.bank_name,
            DEFAULT_BILLING_SETTINGS.bank_account_number, DEFAULT_BILLING_SETTINGS.bank_ifsc, DEFAULT_BILLING_SETTINGS.bank_branch,
            DEFAULT_BILLING_SETTINGS.upi_id
          ]
        );
        console.log('[DB INFO] Seeded default invoice settings in MySQL.');
      }

      // Seed sales users in MySQL
      const defaultSalesUsers = [
        { name: 'Arjun Verma (Sales)', email: 'sales@digi8solutions.com', role: 'Sales Executive', modules: JSON.stringify(['dashboard', 'invoices', 'customers', 'leads']) },
        { name: 'Priya Sharma (Sales Manager)', email: 'manager@digi8solutions.com', role: 'Sales Manager', modules: JSON.stringify(['dashboard', 'invoices', 'customers', 'leads', 'analytics']) }
      ];
      const salesPassHash = await bcrypt.hash('AdminDigi8Password2026!', 10);
      for (const su of defaultSalesUsers) {
        const [suRows]: any = await connection.query('SELECT id FROM admin_users WHERE email = ?', [su.email]);
        if (suRows.length === 0) {
          await connection.query(
            'INSERT INTO admin_users (name, email, password_hash, role, auth_provider, allowed_modules) VALUES (?, ?, ?, ?, ?, ?)',
            [su.name, su.email, salesPassHash, su.role, 'local', su.modules]
          );
        }
      }

      console.log('Database initialized successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.warn('[DB WARNING] Local MySQL connection failed. Server running in offline persistent mode:', (error as any).message);
    loadPersistentStore();
  }
};

export const checkDatabaseHealth = async () => {
  const startTime = Date.now();
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query('SELECT 1');
      const latency = Date.now() - startTime;

      const [tableRows]: any = await connection.query(`
        SELECT table_name AS tableName, table_rows AS rowCount 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [dbName]);

      return {
        status: 'connected',
        isLive: true,
        host: dbHost,
        port: dbPort,
        database: dbName,
        latencyMs: latency,
        tables: tableRows || [],
        timestamp: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return {
      status: 'offline_fallback',
      isLive: false,
      host: dbHost,
      port: dbPort,
      database: dbName,
      latencyMs: null,
      error: err.message,
      tip: 'Start Apache & MySQL in XAMPP Control Panel (C:\\xampp\\xampp-control.exe) or verify MySQL service on port 3306.',
      tables: [],
      timestamp: new Date().toISOString()
    };
  }
};

export default pool;

