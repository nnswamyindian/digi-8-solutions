import { useState } from 'react';
import { Lock } from 'lucide-react';
import ServicePage, { useQuoteSubmit } from '../ServicePage';

function SecurityForm() {
  const { status, submit } = useQuoteSubmit('Cyber Security & Compliance');
  const [form, setForm] = useState<Record<string, string | string[]>>({
    business_name: '', contact_person: '', email: '', phone: '',
    audit_type: 'Vulnerability Assessment & Pen Testing (VAPT)', comments: ''
  });

  if (status === 'success') return (
    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white">
      <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-3">
        <Lock size={24} />
      </div>
      <h3 className="font-manrope font-bold text-white text-xl mb-1">Security Audit Request Received!</h3>
      <p className="text-slate-400 text-sm">Our Certified Ethical Hacking Team will reach out under strict NDA within 24 hours.</p>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); submit(form); }} className="space-y-4 text-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.business_name as string} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Organization Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.contact_person as string} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Full Name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email *</label>
          <input type="email" className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.email as string} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
          <input className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" required
            value={form.phone as string} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 ..." />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Audit / Security Requirement</label>
        <select className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" value={form.audit_type as string} onChange={e => setForm(p => ({ ...p, audit_type: e.target.value }))}>
          {['Vulnerability Assessment & Pen Testing (VAPT)', 'Web / Mobile App Security Audit', 'ISO 27001 / SOC 2 Compliance Audit', 'Cloud Infrastructure Hardening', 'Emergency Breach Incident Response'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Target Scope / Comments</label>
        <textarea className="form-input w-full px-3.5 py-2 rounded-lg text-xs bg-white/5 border-white/10 text-white" rows={3}
          value={form.comments as string} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
          placeholder="Specify URLs, IP ranges, compliance goals, or urgency level..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-xs justify-center font-bold bg-red-600 border-red-600">
        {status === 'loading' ? 'Submitting...' : 'Request Confidential Cyber Security Audit'}
      </button>
    </form>
  );
}

export default function CyberSecurity() {
  return (
    <ServicePage
      color="#DC2626"
      icon={<Lock size={24} />}
      title="Cyber Security & Compliance"
      tagline="Vulnerability Assessment, Penetration Testing & Threat Hardening"
      description="ISO 27001 Readiness, SOC 2 Audits, VAPT Testing & Zero-Trust Cloud Protection"
      heroImage="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"
      overview="Our Cyber Security Division provides certified offensive and defensive security engineering, vulnerability assessment (VAPT), compliance audits, and cloud infrastructure hardening."
      problemsSolved={[
        'Unidentified security loopholes exposing corporate databases to ransomware',
        'Failure to pass vendor compliance audits (ISO 27001, SOC 2, CERT-In)',
        'Unprotected web APIs and mobile apps prone to OWASP Top 10 exploits',
        'Lack of incident response protocols during an active malware outbreak'
      ]}
      solutionsProvided={[
        'Comprehensive VAPT audits with executive vulnerability remediation reports',
        'Zero-trust cloud infrastructure configuration and Cloudflare WAF deployment',
        'CERT-In certified security clearance documentation for enterprise RFPs',
        '24/7 SOC security event logging, intrusion prevention, and breach response'
      ]}
      categories={[
        {
          title: 'Offensive Security (VAPT)',
          items: ['Web Application Pen Testing', 'Mobile App VAPT', 'Network Vulnerability Audits', 'API Security Hardening'],
        },
        {
          title: 'Compliance & Governance',
          items: ['ISO 27001 Readiness Audit', 'SOC 2 Type II Preparation', 'GDPR & DPDP Act Compliance', 'CERT-In Certification Support'],
        },
      ]}
      benefits={[
        'Guaranteed vulnerability remediation with re-testing included',
        'CERT-In / ISO compliant reporting recognized by global enterprise auditors',
        'Strict Non-Disclosure Agreements (NDA) protecting corporate data',
        'Proactive threat prevention reducing data breach financial risks'
      ]}
      whyChooseUs={['CEH Certified Engineers', 'Strict Corporate NDA', 'Zero-Trust Architecture', 'CERT-In Readiness']}
      technologies={[
        { name: 'Burp Suite' }, { name: 'Metasploit' }, { name: 'Wireshark' },
        { name: 'Nmap' }, { name: 'Cloudflare WAF' }, { name: 'OWASP ZAP' }
      ]}
      process={[
        { title: 'Reconnaissance & Scope', desc: 'Executing non-intrusive asset discovery under NDA.' },
        { title: 'Penetration Testing', desc: 'Simulating real-world cyber attacks across network & application layers.' },
        { title: 'Report & Remediation', desc: 'Delivering detailed vulnerability reports with step-by-step code fixes.' },
        { title: 'Re-Testing & Clearance', desc: 'Re-evaluating patched systems to issue security clearance certificate.' }
      ]}
      pricing={[
        { name: 'VAPT Essentials', features: ['Web Application Pen Test', 'OWASP Top 10 Assessment', 'Executive Fix Report', 'Single Re-Test Included'] },
        { name: 'Enterprise VAPT & Network', features: ['Web + Mobile + API VAPT', 'Internal Network Scan', 'Cloud Infrastructure Hardening', 'CERT-In Format Report', 'Re-Test & Clearance'], popular: true },
        { name: 'Continuous SOC Monitoring', features: ['24/7 Security Event Logs', 'SIEM Integration', 'Quarterly Pen Testing', 'Dedicated Security Officer'] }
      ]}
      faqs={[
        { q: 'Is our corporate data safe during pen testing?', a: 'Yes. All security engagements are conducted under a legally binding Non-Disclosure Agreement (NDA) following controlled testing protocols.' },
        { q: 'What deliverables do we receive after a security audit?', a: 'You receive an Executive Summary for board members, a Technical Vulnerability Report detailing PoC exploits and code-level fixes, and a Certificate of Clearance post-remediation.' }
      ]}
      pricingSlug="cyber-security"
      quoteForm={<SecurityForm />}
      relatedServices={[
        { title: 'Website Development', href: '/services/web-development' },
        { title: 'Mobile App Development', href: '/services/mobile-app' },
      ]}
    />
  );
}
