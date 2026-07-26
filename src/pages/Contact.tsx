import { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, Clock, Send, Sparkles } from 'lucide-react';
import { saveContact } from '../lib/api';
import { BRAND } from '../lib/config';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', type: 'general' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await saveContact(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '', type: 'general' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-brand-dark text-white min-h-screen relative overflow-hidden font-inter">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="tag mx-auto mb-6 bg-brand-purple/10 text-brand-purple border-brand-purple/20 inline-flex shadow-glass">
            <Sparkles size={14} className="mr-2" /> Get in Touch
          </div>
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-6">
            Let's Start a <span className="text-gradient">Conversation</span>
          </h1>
          <p className="text-slate-300 font-inter text-lg max-w-2xl mx-auto leading-relaxed">
            Have a project in mind? A question? Or just want to say hi? We're always happy to hear from you.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 px-4 sm:px-6 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12">
          
          {/* Corporate Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-outfit font-black text-white text-3xl mb-8">Contact Information</h2>

              <div className="space-y-4">
                {[
                  {
                    icon: MapPin,
                    title: 'Corporate Office',
                    lines: [BRAND.legalName, BRAND.address.line1, `${BRAND.address.city}, ${BRAND.address.state} ${BRAND.address.pin}`],
                    color: '#3B82F6'
                  },
                  {
                    icon: Phone,
                    title: 'Direct Phone',
                    lines: [BRAND.phone.primary, `+${BRAND.phone.whatsapp} (WhatsApp)`],
                    color: '#10B981'
                  },
                  {
                    icon: Mail,
                    title: 'Official Email',
                    lines: [BRAND.email.hello, BRAND.email.support],
                    color: '#8B5CF6'
                  },
                  {
                    icon: Clock,
                    title: 'Working Hours',
                    lines: ['Mon–Sat: 9:00 AM – 7:00 PM IST', 'Emergency: 24/7 SLA Support Line'],
                    color: '#F59E0B'
                  },
                ].map(({ icon: Icon, title, lines, color }) => (
                  <div key={title} className="glass-card-premium p-6 hover:shadow-2xl transition-all flex gap-5 group" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30` }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-outfit font-bold text-white text-base mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, #fff, ${color})` }}>{title}</div>
                      {lines.map(line => <div key={line} className="text-slate-400 text-sm font-inter leading-relaxed">{line}</div>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Contact Actions */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <a
                  href={`https://wa.me/${BRAND.phone.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-glass"
                >
                  <MessageSquare size={16} /> WhatsApp
                </a>
                <a
                  href={`tel:${BRAND.phone.primary.replace(/\s/g, '')}`}
                  className="btn-outline-glass py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white"
                >
                  <Phone size={16} /> Call Now
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 relative">
            
            {/* Form Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-cyan/20 blur-[100px] pointer-events-none" />

            <div className="relative z-10 h-full">
              {status === 'success' ? (
                <div className="glass-card-premium p-12 text-center h-full flex flex-col justify-center border-brand-cyan/30">
                  <div className="w-20 h-20 rounded-full bg-brand-cyan/20 flex items-center justify-center mx-auto mb-6 text-brand-cyan border border-brand-cyan/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <Send size={32} />
                  </div>
                  <h3 className="font-outfit font-black text-white text-3xl mb-4">Message Sent!</h3>
                  <p className="text-slate-300 font-inter text-lg">We'll get back to you within 24 hours. In the meantime, feel free to explore our services.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card-premium p-8 sm:p-10 space-y-8 h-full">
                  {/* Inquiry Type Tabs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 font-inter">
                      What can we help you with?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['general', 'project', 'support', 'partnership', 'press'].map(t => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setForm(p => ({ ...p, type: t }))}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize border ${
                            form.type === t
                              ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-neon-blue border-brand-cyan/50'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2 font-inter">Name *</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan text-white text-sm outline-none transition-all font-inter placeholder-slate-500"
                        required
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2 font-inter">Email *</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan text-white text-sm outline-none transition-all font-inter placeholder-slate-500"
                        required
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2 font-inter">Phone</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan text-white text-sm outline-none transition-all font-inter placeholder-slate-500"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder={BRAND.phone.primary}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2 font-inter">Subject</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan text-white text-sm outline-none transition-all font-inter placeholder-slate-500"
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 font-inter">Message *</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan text-white text-sm outline-none resize-none transition-all font-inter placeholder-slate-500"
                      rows={5}
                      required
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us about your project, question or idea..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-glow w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-neon-blue disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                  {status === 'error' && <p className="text-rose-500 text-sm text-center font-inter mt-4">Something went wrong. Try again.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-24 px-4 sm:px-6 relative z-10 bg-brand-surface">
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-24">
          <div className="glass-card-premium overflow-hidden h-72 relative flex items-center justify-center group">
            {/* Map Placeholder Glow */}
            <div className="absolute inset-0 bg-brand-dark" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')] opacity-20 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-brand-dark/60 group-hover:bg-brand-dark/40 transition-colors duration-700" />
            
            <div className="relative z-10 text-center p-8 glass-card-premium shadow-2xl max-w-sm w-full mx-4 border-brand-cyan/20">
              <MapPin size={40} className="text-brand-cyan mx-auto mb-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
              <p className="font-outfit font-black text-white text-xl mb-1">{BRAND.address.city}</p>
              <p className="text-slate-300 text-sm mt-2 font-inter leading-relaxed">{BRAND.address.line1}, {BRAND.address.state}, {BRAND.address.country}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${BRAND.address.line1}, ${BRAND.address.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-cyan text-sm font-bold font-inter mt-6 hover:text-white transition-colors"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
