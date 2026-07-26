import { Link } from 'react-router-dom';
import { BRAND } from '../lib/config';

export default function Terms() {
  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      
      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="font-outfit font-black text-white text-4xl sm:text-5xl mb-4">Terms of <span className="text-gradient">Service</span></h1>
            <p className="text-slate-400 font-inter text-sm uppercase tracking-widest font-semibold">Last updated: January 1, 2025</p>
          </div>
          <div className="space-y-6 font-inter text-slate-300 leading-relaxed">
            {[
              {
                title: '1. Acceptance of Terms',
                content: `By accessing and using the ${BRAND.name} website and services, you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service apply to all visitors, users and others who access or use our service.`,
              },
              {
                title: '2. Services',
                content: `${BRAND.name} provides digital services including web development, graphic design, digital marketing, mobile app development, cyber security, startup guidance, digital printing, and corporate gifting. The scope, timeline, and pricing for each project are defined in a separate Statement of Work (SOW) or project proposal.`,
              },
              {
                title: '3. Payment Terms',
                content: 'Payment is required as follows: 50% advance before project commencement, 25% at design/prototype approval, and 25% upon project delivery. For monthly retainer services, payment is due on the 1st of each month. All prices are in Indian Rupees (INR) unless otherwise stated. GST at 18% is applicable on all services.',
              },
              {
                title: '4. Intellectual Property',
                content: `Upon receipt of full payment, all intellectual property rights for deliverables (designs, code, content) transfer to the client. ${BRAND.name} retains the right to display completed work in our portfolio unless a Non-Disclosure Agreement is in place. We also retain rights to our proprietary tools, frameworks, and methodologies used during development.`,
              },
              {
                title: '5. Revisions and Changes',
                content: 'Each project includes a specified number of revision rounds as outlined in the project proposal. Additional revisions beyond the agreed scope will be billed at our standard hourly rate. Significant scope changes may require a revised proposal and timeline.',
              },
              {
                title: '6. Limitation of Liability',
                content: `${BRAND.name} shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services.`,
              },
              {
                title: '7. Contact',
                content: `For any questions regarding these Terms of Service, please contact us at ${BRAND.email.hello}.`,
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
