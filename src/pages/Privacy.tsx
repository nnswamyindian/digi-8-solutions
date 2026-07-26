import { Link } from 'react-router-dom';
import { BRAND } from '../lib/config';

export default function Privacy() {
  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      
      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="font-outfit font-black text-white text-4xl sm:text-5xl mb-4">Privacy <span className="text-gradient">Policy</span></h1>
            <p className="text-slate-400 font-inter text-sm uppercase tracking-widest font-semibold">Last updated: January 1, 2025</p>
          </div>
          <div className="space-y-6 font-inter text-slate-300 leading-relaxed">
            {[
              {
                title: '1. Information We Collect',
                content: 'We collect information you provide directly to us, such as when you fill out a contact form, request a quote, subscribe to our newsletter, or communicate with us. This includes your name, email address, phone number, business details, and any other information you choose to provide. We may also collect certain information automatically when you visit our website, including your IP address, browser type, device information, and pages visited.',
              },
              {
                title: '2. How We Use Your Information',
                content: 'We use the information we collect to: provide and improve our services; respond to your inquiries and fulfill requests; send you marketing and promotional communications (with your consent); process transactions; analyze usage patterns and improve our website; comply with legal obligations; and protect against fraud and abuse.',
              },
              {
                title: '3. Information Sharing',
                content: 'We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent, except to trusted partners who assist us in operating our website and conducting our business, provided those parties agree to keep this information confidential. We may also release your information when required by law or to protect our rights.',
              },
              {
                title: '4. Data Security',
                content: 'We implement a variety of security measures to maintain the safety of your personal information. All sensitive data is transmitted via Secure Socket Layer (SSL) technology. We use Supabase for database management, which follows enterprise-grade security standards including encryption at rest and in transit.',
              },
              {
                title: '5. Cookies',
                content: 'Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalise content. You can choose to disable cookies through your browser settings, but this may affect your ability to use certain features of our website.',
              },
              {
                title: '6. Your Rights',
                content: `You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at ${BRAND.email.privacy}. We will respond to your request within 30 days.`,
              },
              {
                title: '7. Contact Us',
                content: `If you have questions about this Privacy Policy, please contact us at: ${BRAND.name}, ${BRAND.address.city}, ${BRAND.address.state}, ${BRAND.address.country}. Email: ${BRAND.email.privacy}`,
              },
            ].map(section => (
              <div key={section.title} className="glass-card-premium rounded-2xl p-8 border-white/5 hover:border-brand-cyan/20 transition-colors">
                <h2 className="font-outfit font-bold text-white text-xl mb-4">{section.title}</h2>
                <p className="text-sm font-inter text-slate-400">{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/" className="btn-outline-glass px-8 py-3 rounded-xl font-bold inline-block">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
