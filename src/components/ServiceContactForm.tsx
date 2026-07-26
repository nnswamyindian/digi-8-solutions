import { useState } from 'react';
import { useQuoteSubmit } from '../pages/ServicePage';

export default function ServiceContactForm({ serviceName, color }: { serviceName: string, color: string }) {
  const { status, submit } = useQuoteSubmit(serviceName);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', comments: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(formData);
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-white mb-2">Request Submitted</h3>
        <p className="text-slate-400">Our technical team will respond within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Email</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Phone</label>
        <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Project Details</label>
        <textarea required rows={4} value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500"></textarea>
      </div>
      <button disabled={status === 'loading'} type="submit" className="btn-glow w-full py-4 rounded-xl font-bold mt-4 transition-all disabled:opacity-50" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}>
        {status === 'loading' ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
