import { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Send, CheckCircle, Sparkles } from 'lucide-react';
import { saveLead } from '../lib/api';

type Props = {
  source?: string;
  service?: string;
  compact?: boolean;
  title?: string;
  subtitle?: string;
};

export default function LeadGenForm({
  source = 'CTA Form',
  service = 'General Inquiry',
  compact = false,
  title = 'Get Your Free Consultation',
  subtitle = 'Fill in your details and our team will reach out within 24 hours.',
}: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setStatus('loading');
    try {
      await saveLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        service,
        source,
        message: form.message || `Lead from ${source}`,
      });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-emerald-300 text-center shadow-lg">
        <CheckCircle size={36} className="text-emerald-600 mx-auto mb-3" />
        <h4 className="font-manrope font-bold text-[#0F172A] text-lg mb-1">Thank You!</h4>
        <p className="text-sm text-[#64748B] font-inter">
          We've received your request. Our solution team will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl">
      {!compact && (
        <div className="mb-6 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={18} className="text-[#2563EB]" />
            <h4 className="font-manrope font-bold text-[#0F172A] text-xl">{title}</h4>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] font-inter font-normal">{subtitle}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Your Name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A] placeholder:text-[#64748B]/60 font-inter text-sm outline-none transition-all"
              required
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A] placeholder:text-[#64748B]/60 font-inter text-sm outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A] placeholder:text-[#64748B]/60 font-inter text-sm outline-none transition-all"
            required
          />
        </div>

        <div className="relative">
          <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-[#64748B]" />
          <textarea
            rows={3}
            placeholder="Tell us about your requirements or questions..."
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A] placeholder:text-[#64748B]/60 font-inter text-sm outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary w-full py-3.5 justify-center text-sm font-bold shadow-md"
        >
          {status === 'loading' ? (
            <span className="animate-pulse">Sending Inquiry...</span>
          ) : (
            <>
              Submit Request <Send size={16} />
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="text-xs text-rose-600 text-center font-medium">
            Submission failed. Please email us directly at hello@digi8solutions.com
          </p>
        )}
      </form>
    </div>
  );
}
