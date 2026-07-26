// Central config for brand details — DIGI8 SOLUTIONS INDIA PRIVATE LIMITED
export const BRAND = {
  legalName: 'DIGI8 SOLUTIONS INDIA PRIVATE LIMITED',
  name: 'Digi8 Solutions',
  tagline: 'One Partner. Eight Digital Solutions.',
  vision: 'A premium digital transformation company providing end-to-end technology, branding, performance marketing, cyber security, startup, printing, and corporate solutions.',
  email: {
    hello: 'hello@digi8solutions.com',
    support: 'support@digi8solutions.com',
    careers: 'careers@digi8solutions.com',
    privacy: 'privacy@digi8solutions.com',
  },
  phone: {
    primary: '+91 9000207739',
    whatsapp: '919000207739',
  },
  address: {
    line1: 'Corporate Tower, Financial District',
    city: 'Hyderabad',
    state: 'Telangana',
    pin: '500032',
    country: 'India',
  },
  social: {
    twitter: 'https://twitter.com/digi8solutions',
    linkedin: 'https://linkedin.com/company/digi8solutions',
    instagram: 'https://instagram.com/digi8solutions',
    github: 'https://github.com/digi8solutions',
    youtube: 'https://youtube.com/@digi8solutions',
  },
  divisions: [
    { slug: 'web-development', name: 'Website Development', accent: '#2563EB', tag: 'Enterprise Web & Cloud Systems' },
    { slug: 'mobile-app', name: 'Mobile App Development', accent: '#06B6D4', tag: 'iOS, Android & Smart Mobility' },
    { slug: 'branding', name: 'Branding & Creative Studio', accent: '#7C3AED', tag: 'Design Systems & Visual Identity' },
    { slug: 'digital-marketing', name: 'Digital Marketing & Growth', accent: '#10B981', tag: 'SEO, Ads & Lead Generation' },
    { slug: 'cyber-security', name: 'Cyber Security & Compliance', accent: '#0F172A', tag: 'VAPT & Security Audits' },
    { slug: 'startup-solutions', name: 'Startup Incubation & MVP', accent: '#F59E0B', tag: 'MVP Build & Scaling' },
    { slug: 'corporate-gifting', name: 'Corporate Gifting & Kits', accent: '#06B6D4', tag: 'Executive Merchandise & Swag' },
    { slug: 'digital-printing', name: 'Digital & Offset Printing', accent: '#2563EB', tag: 'High-Def Media & Print' },
  ],
} as const;
