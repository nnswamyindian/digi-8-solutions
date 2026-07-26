import { useState } from 'react';
import { Check, X } from 'lucide-react';
import LeadGenForm from './LeadGenForm';

const services = [
  { id: 'web', name: 'Web Development', icon: '🌐' },
  { id: 'branding', name: 'Logo & Branding', icon: '🎨' },
  { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
  { id: 'security', name: 'Cyber Security', icon: '🔒' },
  { id: 'startup', name: 'Startup Guidance', icon: '🚀' },
  { id: 'mobile', name: 'Mobile App', icon: '📱' },
  { id: 'printing', name: 'Digital Printing', icon: '🖨️' },
  { id: 'gifting', name: 'Corporate Gifting', icon: '🎁' },
];

const timelines = [
  { id: 'standard', label: 'Standard', desc: '4-6 weeks' },
  { id: 'fast', label: 'Fast Track', desc: '2-3 weeks' },
  { id: 'urgent', label: 'Urgent', desc: '1-2 weeks' },
];

export default function PackageBuilder() {
  const [selected, setSelected] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('standard');

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectedNames = selected.map(id => services.find(s => s.id === id)?.name).filter(Boolean);

  return (
    <section id="package-builder" className="relative z-10 py-24 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-secondary/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-highlight/5 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag mx-auto mb-4">Package Builder</div>
          <h2 className="font-sora font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Build Your <span className="gradient-text">Digital Package</span>
          </h2>
          <p className="text-slate-400 font-inter max-w-2xl mx-auto">
            Select the services you need and get a custom proposal within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Service selection */}
          <div className="lg:col-span-3 glass-strong rounded-3xl border border-white/10 p-6">
            <h3 className="font-sora font-bold text-white text-lg mb-4">1. Select Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {services.map(s => {
                const isSelected = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isSelected ? 'bg-accent/15 border-accent shadow-glow-accent' : 'glass border-white/5 hover:border-accent/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-xs font-inter text-white">{s.name}</div>
                    {isSelected && <Check size={14} className="text-accent mx-auto mt-1" />}
                  </button>
                );
              })}
            </div>

            <h3 className="font-sora font-bold text-white text-lg mb-4 mt-6">2. Delivery Timeline</h3>
            <div className="grid grid-cols-3 gap-3">
              {timelines.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeline(t.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${timeline === t.id ? 'bg-accent/15 border-accent' : 'glass border-white/5'}`}
                >
                  <div className="font-inter font-semibold text-white text-sm">{t.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary + Lead form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-strong rounded-3xl border border-white/10 p-6">
              <h3 className="font-sora font-bold text-white text-lg mb-4">Your Package</h3>
              {selected.length === 0 ? (
                <div className="text-center py-8">
                  <X size={24} className="text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-inter">Select services to build your package</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedNames.map(name => (
                    <div key={name} className="flex items-center gap-2 text-sm font-inter text-white">
                      <Check size={14} className="text-accent" /> {name}
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-white/5 flex justify-between text-sm font-inter">
                    <span className="text-slate-400">Timeline</span>
                    <span className="text-accent">{timelines.find(t => t.id === timeline)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm font-inter">
                    <span className="text-slate-400">Services</span>
                    <span className="text-white">{selected.length} selected</span>
                  </div>
                </div>
              )}
            </div>

            <LeadGenForm
              source="Package Builder"
              service={selectedNames.join(', ') || 'Package Builder'}
              title="Get Your Custom Quote"
              subtitle="Based on your selections, we'll prepare a personalized proposal within 24 hours."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
