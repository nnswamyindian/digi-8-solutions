/*
# Digi 8 Solutions - Complete Database Schema

1. New Tables
- `leads` - Stores all inbound leads from quote forms and contact forms
  - id, name, email, phone, service, status, source, message, created_at
- `quotes` - Generated quotations from the quote calculator
  - id, quote_number, lead_id (fk), service, features, timeline, budget, gst, discount, referral_discount, final_price, delivery_days, status, created_at
- `contacts` - General contact form submissions
  - id, name, email, phone, message, subject, created_at
- `testimonials` - Client testimonials and reviews
  - id, client_name, company, role, review, rating, video_url, logo_url, service, approved, created_at
- `projects` - Portfolio projects
  - id, title, category, client, tech_stack, description, thumbnail_url, live_url, before_url, after_url, featured, created_at
- `blog_posts` - Blog articles
  - id, title, slug, category, content, excerpt, author, reading_time, cover_url, seo_title, seo_desc, published, published_at, created_at
- `referral_codes` - Discount referral codes
  - id, code, discount_percent, max_uses, uses_count, active, created_at
- `newsletter_subscribers` - Email newsletter list
  - id, email, subscribed_at

2. Security
- RLS enabled on all tables
- Public (anon) SELECT on testimonials, projects, blog_posts (published only)
- Public (anon) INSERT on leads, contacts, newsletter_subscribers
- Admin (authenticated) full CRUD on all tables
- quotes readable by anon for PDF download flow

3. Notes
- All policies use anon, authenticated for public-facing reads/writes
- Admin actions require authenticated session (Supabase Auth)
- blog_posts filtered by published=true for anon reads
*/

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  status text NOT NULL DEFAULT 'new',
  source text DEFAULT 'website',
  message text,
  form_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_leads" ON leads;
CREATE POLICY "auth_select_leads" ON leads FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_leads" ON leads;
CREATE POLICY "auth_update_leads" ON leads FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_leads" ON leads;
CREATE POLICY "auth_delete_leads" ON leads FOR DELETE
TO authenticated USING (true);

-- QUOTES TABLE
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  service text NOT NULL,
  features jsonb DEFAULT '[]',
  timeline text,
  urgency text,
  support_plan text,
  hosting boolean DEFAULT false,
  domain boolean DEFAULT false,
  amc boolean DEFAULT false,
  maintenance boolean DEFAULT false,
  base_price numeric(12,2) DEFAULT 0,
  gst numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  referral_discount numeric(12,2) DEFAULT 0,
  final_price numeric(12,2) DEFAULT 0,
  delivery_days integer DEFAULT 30,
  status text DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_quotes" ON quotes;
CREATE POLICY "anon_insert_quotes" ON quotes FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_quotes" ON quotes;
CREATE POLICY "anon_select_quotes" ON quotes FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_quotes" ON quotes;
CREATE POLICY "auth_update_quotes" ON quotes FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quotes" ON quotes;
CREATE POLICY "auth_delete_quotes" ON quotes FOR DELETE
TO authenticated USING (true);

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  type text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_contacts" ON contacts;
CREATE POLICY "auth_select_contacts" ON contacts FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_contacts" ON contacts;
CREATE POLICY "auth_update_contacts" ON contacts FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contacts" ON contacts;
CREATE POLICY "auth_delete_contacts" ON contacts FOR DELETE
TO authenticated USING (true);

-- TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  company text,
  role text,
  review text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  video_url text,
  logo_url text,
  avatar_url text,
  service text,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT
TO anon, authenticated USING (approved = true);

DROP POLICY IF EXISTS "anon_insert_testimonials" ON testimonials;
CREATE POLICY "anon_insert_testimonials" ON testimonials FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials" ON testimonials FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials" ON testimonials FOR DELETE
TO authenticated USING (true);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  client text,
  description text,
  tech_stack text[],
  thumbnail_url text,
  live_url text,
  before_url text,
  after_url text,
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE
TO authenticated USING (true);

-- BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  content text,
  excerpt text,
  author text DEFAULT 'Digi 8 Team',
  reading_time integer DEFAULT 5,
  cover_url text,
  seo_title text,
  seo_description text,
  tags text[],
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blog" ON blog_posts;
CREATE POLICY "anon_select_blog" ON blog_posts FOR SELECT
TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "auth_insert_blog" ON blog_posts;
CREATE POLICY "auth_insert_blog" ON blog_posts FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_blog" ON blog_posts;
CREATE POLICY "auth_update_blog" ON blog_posts FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_blog" ON blog_posts;
CREATE POLICY "auth_delete_blog" ON blog_posts FOR DELETE
TO authenticated USING (true);

-- REFERRAL CODES TABLE
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer DEFAULT 10 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses integer DEFAULT 100,
  uses_count integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_referral" ON referral_codes;
CREATE POLICY "anon_select_referral" ON referral_codes FOR SELECT
TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "auth_insert_referral" ON referral_codes;
CREATE POLICY "auth_insert_referral" ON referral_codes FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_referral" ON referral_codes;
CREATE POLICY "auth_update_referral" ON referral_codes FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_referral" ON referral_codes;
CREATE POLICY "auth_delete_referral" ON referral_codes FOR DELETE
TO authenticated USING (true);

-- NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_newsletter" ON newsletter_subscribers;
CREATE POLICY "auth_select_newsletter" ON newsletter_subscribers FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_delete_newsletter" ON newsletter_subscribers;
CREATE POLICY "auth_delete_newsletter" ON newsletter_subscribers FOR DELETE
TO authenticated USING (true);

-- SEED REFERRAL CODES
INSERT INTO referral_codes (code, discount_percent, max_uses) VALUES
  ('DIGI10', 10, 500),
  ('LAUNCH20', 20, 100),
  ('PARTNER15', 15, 200)
ON CONFLICT (code) DO NOTHING;

-- SEED SAMPLE TESTIMONIALS
INSERT INTO testimonials (client_name, company, role, review, rating, service, approved) VALUES
  ('Rajesh Kumar', 'TechVenture Pvt Ltd', 'CEO', 'Digi 8 Solutions transformed our digital presence completely. Their web development team delivered a stunning e-commerce platform that increased our sales by 180% in just 3 months.', 5, 'Web Development', true),
  ('Priya Sharma', 'GreenLeaf Organic', 'Founder', 'The branding package from Digi 8 was exceptional. Our new logo and brand identity perfectly captures the essence of our organic products business.', 5, 'Logo & Branding', true),
  ('Ahmed Al-Rashid', 'Gulf Trading Co', 'Marketing Director', 'Their digital marketing campaigns delivered incredible ROI. We saw a 320% increase in qualified leads within the first two months.', 5, 'Digital Marketing', true),
  ('Sarah Johnson', 'InnovateTech USA', 'CTO', 'Outstanding cybersecurity audit. They identified critical vulnerabilities we had no idea existed and helped us build a bulletproof security framework.', 5, 'Cyber Security', true),
  ('Vikram Patel', 'StartupX India', 'Co-Founder', 'Their startup guidance was invaluable. From company registration to pitch deck, they helped us secure our Series A funding round.', 5, 'Startup Guidance', true),
  ('Chen Wei', 'SinoApp Solutions', 'Product Manager', 'The mobile app they built for us has 50,000+ downloads and a 4.8 star rating. The UI/UX is world-class.', 5, 'Mobile App Development', true)
ON CONFLICT DO NOTHING;

-- SEED SAMPLE PROJECTS
INSERT INTO projects (title, category, client, description, tech_stack, thumbnail_url, live_url, featured) VALUES
  ('E-Commerce Revolution', 'Web Development', 'RetailMax', 'Full-stack e-commerce platform with AI recommendations, payment gateway, and inventory management.', ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe'], 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800', '#', true),
  ('Brand Identity Redesign', 'Logo & Branding', 'NovaCorp', 'Complete brand overhaul including logo, color system, typography, and brand guidelines.', ARRAY['Figma', 'Illustrator', 'Photoshop'], 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800', '#', true),
  ('Digital Marketing Scale-up', 'Digital Marketing', 'GrowthHub', 'Integrated digital marketing campaign spanning SEO, Google Ads, Meta Ads, and email marketing.', ARRAY['Google Ads', 'Meta Ads', 'SEMrush', 'Mailchimp'], 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800', '#', true),
  ('FinTech Mobile App', 'Mobile App', 'PayFlow', 'Cross-platform fintech app with biometric auth, real-time transactions, and AI fraud detection.', ARRAY['React Native', 'Firebase', 'Node.js', 'TensorFlow'], 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800', '#', true),
  ('Security Infrastructure Overhaul', 'Cyber Security', 'SecureBank', 'Enterprise-grade security audit, penetration testing, and implementation of zero-trust architecture.', ARRAY['Kali Linux', 'Metasploit', 'Cloudflare', 'AWS WAF'], 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800', '#', false),
  ('Startup Launch Package', 'Startup Guidance', 'EcoTech', 'End-to-end startup launch: company registration, branding, MVP website, and investor pitch deck.', ARRAY['React', 'Figma', 'PowerPoint', 'Stripe'], 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800', '#', true)
ON CONFLICT DO NOTHING;

-- SEED SAMPLE BLOG POSTS
INSERT INTO blog_posts (title, slug, category, excerpt, author, reading_time, cover_url, published, published_at) VALUES
  ('10 AI Tools That Will Transform Your Business in 2025', 'ai-tools-transform-business-2025', 'AI & Technology', 'Discover the cutting-edge AI tools that industry leaders are using to automate workflows, boost productivity, and drive unprecedented growth.', 'Digi 8 Team', 8, 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800', true, now() - interval '2 days'),
  ('The Ultimate Guide to Web Design Trends in 2025', 'web-design-trends-2025', 'Design', 'From glassmorphism to AI-generated interfaces, explore the design trends that are defining the digital landscape this year.', 'Digi 8 Team', 6, 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800', true, now() - interval '5 days'),
  ('How to Build a Million-Dollar Brand Identity on Any Budget', 'build-brand-identity-budget', 'Branding', 'Learn the proven strategies that successful startups use to create memorable, impactful brand identities without breaking the bank.', 'Digi 8 Team', 7, 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800', true, now() - interval '8 days'),
  ('Cybersecurity Threats Every Business Must Know About', 'cybersecurity-threats-business', 'Security', 'Ransomware, phishing, zero-day exploits — the threat landscape is evolving fast. Here is what your business needs to know.', 'Digi 8 Team', 9, 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800', true, now() - interval '12 days'),
  ('From Idea to IPO: The Startup Roadmap That Actually Works', 'startup-roadmap-idea-to-ipo', 'Startup', 'A practical, step-by-step framework for taking your startup from a napkin idea to a funded, scaling business.', 'Digi 8 Team', 11, 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800', true, now() - interval '15 days'),
  ('Mobile-First: Why Your App Strategy Needs to Change Now', 'mobile-first-app-strategy', 'Mobile', 'With 70% of web traffic coming from mobile devices, a mobile-first strategy is no longer optional — it is survival.', 'Digi 8 Team', 6, 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800', true, now() - interval '18 days')
ON CONFLICT (slug) DO NOTHING;
