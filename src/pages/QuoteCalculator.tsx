import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, RefreshCw, Calculator, Sparkles } from "lucide-react";
import { saveLead, saveQuote, generateQuoteNumber } from "../lib/api";
import { BRAND } from "../lib/config";
import { divisions } from "../data/servicesData";

const services = divisions.map(div => ({ id: div.id, name: div.title, icon: div.icon, desc: div.desc, color: div.color }));
const featuresByService: Record<string, { id: string; label: string }[]> = {};
divisions.forEach(div => {
  featuresByService[div.id] = div.subServices.map((sub, i) => ({ id: `${div.id}-${i}`, label: sub.name }));
});

const timelineOptions = [
  { id: "standard", label: "Standard Schedule", desc: "4-6 weeks (Recommended)" },
  { id: "fast", label: "Fast-Track", desc: "2-3 weeks (Dedicated Sprints)" },
  { id: "urgent", label: "Urgent Launch", desc: "1-2 weeks (Priority Allocation)" },
];
const supportPlans = [
  { id: "none", label: "Standard Handover (No Extended AMC)" },
  { id: "basic", label: "1 Month Warranty & Bug Fix Support" },
  { id: "standard", label: "3 Months Dedicated Managed Maintenance" },
  { id: "premium", label: "6 Months SLA Guarantee & 24/7 Monitoring" },
];
const budgetRanges = [
  { id: "under_50k", label: "Under Rs.50,000" },
  { id: "50k_150k", label: "Rs.50,000 - Rs.1,50,000" },
  { id: "150k_500k", label: "Rs.1,50,000 - Rs.5,00,000" },
  { id: "500k_1m", label: "Rs.5,00,000 - Rs.10,00,000" },
  { id: "above_1m", label: "Above Rs.10,00,000" },
  { id: "discuss", label: "Let us Discuss Budget" },
];
const companySizes = [
  { id: "solo", label: "Solo / Freelancer" },
  { id: "2_10", label: "2-10 Employees (Startup)" },
  { id: "11_50", label: "11-50 Employees (SME)" },
  { id: "51_200", label: "51-200 Employees (Mid-Market)" },
  { id: "200_plus", label: "200+ Employees (Enterprise)" },
];

type Step = 1 | 2 | 3 | 4;

export default function QuoteCalculator() {
  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("standard");
  const [supportPlan, setSupportPlan] = useState("none");
  const [addons] = useState({ hosting: false, domain: false, amc: false, maintenance: false });
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "", company: "", website: "", company_size: "", industry: "", budget: "", project_description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleFeature = (id: string) => setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  const handleNext = () => { if (step === 1 && !selectedService) return; if (step < 4) setStep((step + 1) as Step); };
  const handlePrev = () => { if (step > 1) setStep((step - 1) as Step); };
  const handleReset = () => { setStep(1); setSelectedService(""); setSelectedFeatures([]); setTimeline("standard"); setSupportPlan("none"); setContactInfo({ name: "", email: "", phone: "", company: "", website: "", company_size: "", industry: "", budget: "", project_description: "" }); setSubmitted(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) return;
    setIsSubmitting(true);
    try {
      const selectedServiceObj = services.find(s => s.id === selectedService);
      const serviceName = selectedServiceObj ? selectedServiceObj.name : selectedService;
      const quoteNum = generateQuoteNumber();
      const detailsStr = `Service: ${serviceName} | Timeline: ${timeline} | Features: ${selectedFeatures.join(", ") || "Standard"} | Company: ${contactInfo.company || "N/A"} | Budget: ${contactInfo.budget || "N/A"}`;
      await Promise.all([
        saveQuote({ quote_number: quoteNum, client_name: contactInfo.name, client_email: contactInfo.email, client_phone: contactInfo.phone, company: contactInfo.company, website: contactInfo.website, service: serviceName, features: selectedFeatures, timeline, support_plan: supportPlan, addons, details: detailsStr, project_details: contactInfo.project_description, estimated_amount: 0, budget: contactInfo.budget, industry: contactInfo.industry, company_size: contactInfo.company_size }),
        saveLead({ name: contactInfo.name, email: contactInfo.email, phone: contactInfo.phone, company: contactInfo.company, industry: contactInfo.industry, budget: contactInfo.budget, service: serviceName, services: [serviceName], source: "Proposal Calculator", message: `Quote Request #${quoteNum}: ${detailsStr}\n\nProject Description: ${contactInfo.project_description || "N/A"}` }),
      ]);
      setSubmitted(true);
    } catch { setSubmitted(true); } finally { setIsSubmitting(false); }
  };

  const activeServiceColor = services.find(s => s.id === selectedService)?.color || "#06B6D4";

  return (
    <div className="bg-brand-dark text-white font-inter relative min-h-screen overflow-hidden">
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <section className="relative pt-16 sm:pt-20 pb-10 sm:pb-16 border-b border-white/5 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6 relative z-10">
          <span className="tag mx-auto mb-4 bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 inline-flex shadow-glass">
            <Calculator size={14} className="mr-2" /> Interactive Commercial Proposal Calculator
          </span>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
            Configure Your <span className="text-gradient">Enterprise Solution</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Select your division, technical specifications, and timeline options to generate a custom proposal blueprint for {BRAND.legalName}.
          </p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="glass-card-premium p-3 sm:p-6 mb-6 sm:mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
            <div className="h-full transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%`, backgroundColor: activeServiceColor }} />
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-4 mt-2">
            {[{ num: 1, label: "Division" }, { num: 2, label: "Features" }, { num: 3, label: "Timeline" }, { num: 4, label: "Details" }].map(s => (
              <div key={s.num} className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-2 sm:p-4 rounded-xl transition-all ${step === s.num ? "bg-white/10 text-white shadow-glass" : step > s.num ? "bg-white/5 text-slate-300" : "bg-transparent text-slate-500 opacity-50"}`} style={step === s.num ? { border: `1px solid ${activeServiceColor}40` } : {}}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${step === s.num ? "text-white" : step > s.num ? "text-white bg-white/10" : "bg-white/5 text-slate-500"}`} style={step === s.num ? { backgroundColor: activeServiceColor } : {}}>
                  {step > s.num ? <CheckCircle size={14} /> : s.num}
                </div>
                <span className="font-bold text-[9px] sm:text-sm text-center sm:text-left leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 blur-[100px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: activeServiceColor }} />
          {step === 1 && (
            <div className="glass-card-premium p-6 sm:p-10 relative z-10 border-white/10">
              <div className="mb-6 sm:mb-8 text-center sm:text-left">
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">Select Corporate Division</h3>
                <p className="text-slate-400 mt-2 text-sm sm:text-base">Choose the core division aligned with your project goals.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {services.map(s => (
                  <button key={s.id} onClick={() => setSelectedService(s.id)} className={`p-4 sm:p-6 rounded-2xl text-left transition-all flex flex-col gap-3 sm:gap-4 group ${selectedService === s.id ? "bg-white/10 shadow-glass translate-y-[-4px]" : "bg-white/5 hover:bg-white/10 hover:translate-y-[-2px]"}`} style={selectedService === s.id ? { border: `1px solid ${s.color}60`, boxShadow: `0 10px 30px -10px ${s.color}40` } : { border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                      <s.icon size={20} style={{ color: s.color }} />
                    </div>
                    <div>
                      <h4 className="font-outfit font-bold text-white text-sm sm:text-lg mb-1 leading-tight">{s.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-inter hidden sm:block">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/10">
                <button onClick={handleNext} disabled={!selectedService} className="btn-glow px-6 sm:px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-neon-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center" style={selectedService ? { backgroundColor: activeServiceColor, boxShadow: `0 0 20px ${activeServiceColor}40` } : {}}>
                  Continue to Features <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="glass-card-premium p-6 sm:p-10 relative z-10 border-white/10">
              <div className="mb-6 sm:mb-8">
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">Technical Specifications & Modules</h3>
                <p className="text-slate-400 mt-2 text-sm sm:text-base">Select the specialized modules required for your enterprise architecture.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {(featuresByService[selectedService] || []).map(f => {
                  const isChecked = selectedFeatures.includes(f.id);
                  return (
                    <button key={f.id} onClick={() => toggleFeature(f.id)} className={`p-4 sm:p-5 rounded-xl border text-left flex items-center justify-between transition-all group ${isChecked ? "bg-white/10 text-white font-bold shadow-glass" : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20"}`} style={isChecked ? { borderColor: `${activeServiceColor}60` } : {}}>
                      <span className="text-sm font-inter group-hover:text-white transition-colors">{f.label}</span>
                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? "text-white" : "border border-white/20 bg-white/5"}`} style={isChecked ? { backgroundColor: activeServiceColor, borderColor: activeServiceColor } : {}}>
                        {isChecked && <CheckCircle size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/10">
                <button onClick={handlePrev} className="btn-outline-glass px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center"><ArrowLeft size={16} /> Back</button>
                <button onClick={handleNext} className="btn-glow px-8 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center" style={{ backgroundColor: activeServiceColor, boxShadow: `0 0 20px ${activeServiceColor}40` }}>Continue to Timeline <ArrowRight size={16} /></button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="glass-card-premium p-6 sm:p-10 relative z-10 border-white/10 space-y-8">
              <div>
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">Timeline & SLA Maintenance</h3>
                <p className="text-slate-400 mt-2 text-sm sm:text-base">Configure delivery speed and post-launch AMC options.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-outfit font-bold text-sm text-slate-300 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeServiceColor }} />Target Delivery Timeline</h4>
                <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                  {timelineOptions.map(t => (
                    <button key={t.id} onClick={() => setTimeline(t.id)} className={`p-4 sm:p-5 rounded-xl border text-left transition-all ${timeline === t.id ? "bg-white/10 text-white shadow-glass translate-y-[-2px]" : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"}`} style={timeline === t.id ? { borderColor: `${activeServiceColor}60` } : {}}>
                      <div className="text-sm sm:text-base font-bold text-white mb-1.5">{t.label}</div>
                      <div className="text-xs text-slate-400 font-inter">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-outfit font-bold text-sm text-slate-300 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeServiceColor }} />Post-Launch SLA Maintenance</h4>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {supportPlans.map(s => (
                    <button key={s.id} onClick={() => setSupportPlan(s.id)} className={`p-4 sm:p-5 rounded-xl border text-left transition-all ${supportPlan === s.id ? "bg-white/10 text-white shadow-glass translate-y-[-2px]" : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"}`} style={supportPlan === s.id ? { borderColor: `${activeServiceColor}60` } : {}}>
                      <div className="text-sm font-semibold font-inter">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                <button onClick={handlePrev} className="btn-outline-glass px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center"><ArrowLeft size={16} /> Back</button>
                <button onClick={handleNext} className="btn-glow px-8 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center" style={{ backgroundColor: activeServiceColor, boxShadow: `0 0 20px ${activeServiceColor}40` }}>Review Proposal Scope <ArrowRight size={16} /></button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="glass-card-premium p-6 sm:p-10 relative z-10 border-white/10">
              {!submitted ? (
                <>
                  <div className="mb-6 sm:mb-8">
                    <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">Request Formal Commercial Proposal</h3>
                    <p className="text-slate-400 mt-2 text-sm sm:text-base">Review your configuration and submit your details to receive an official proposal.</p>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 self-start relative overflow-hidden order-2 lg:order-1">
                      <div className="absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-20 pointer-events-none" style={{ backgroundColor: activeServiceColor }} />
                      <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 flex-wrap gap-2">
                        <span className="font-bold text-sm text-slate-300 flex items-center gap-2"><Sparkles size={16} style={{ color: activeServiceColor }} /> Selected Division</span>
                        <span className="font-black text-base sm:text-lg" style={{ color: activeServiceColor }}>{services.find(s => s.id === selectedService)?.name}</span>
                      </div>
                      <div className="text-sm space-y-4 relative z-10 font-inter">
                        <div>
                          <strong className="text-white block mb-2">Selected Features ({selectedFeatures.length}):</strong>
                          <div className="flex flex-wrap gap-2">
                            {selectedFeatures.length > 0 ? selectedFeatures.map(fid => {
                              const featObj = (featuresByService[selectedService] || []).find(f => f.id === fid);
                              return <span key={fid} className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-xs font-semibold">{featObj ? featObj.label : fid}</span>;
                            }) : <span className="text-slate-500 italic px-3 py-1.5 bg-white/5 rounded-lg text-xs">Standard Base Specification</span>}
                          </div>
                        </div>
                        <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                          <div><strong className="text-white block mb-1">Timeline:</strong><span className="text-slate-400 text-xs font-semibold">{timelineOptions.find(t => t.id === timeline)?.label}</span></div>
                          <div><strong className="text-white block mb-1">SLA Support:</strong><span className="text-slate-400 text-xs font-semibold">{supportPlans.find(s => s.id === supportPlan)?.label}</span></div>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5 order-1 lg:order-2">
                      <div>
                        <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 border-b border-brand-cyan/20 pb-2">Contact Information</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Your Full Name *</label>
                            <input type="text" required value={contactInfo.name} onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Corporate Email *</label>
                              <input type="email" required value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} placeholder="rahul@company.com" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Phone *</label>
                              <input type="tel" required value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} placeholder="+91 9000207739" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 border-b border-brand-cyan/20 pb-2">Company Details</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Company Name</label>
                              <input type="text" value={contactInfo.company} onChange={e => setContactInfo({ ...contactInfo, company: e.target.value })} placeholder="e.g. Acme Pvt Ltd" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Website</label>
                              <input type="url" value={contactInfo.website} onChange={e => setContactInfo({ ...contactInfo, website: e.target.value })} placeholder="https://yourcompany.com" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Industry</label>
                              <input type="text" value={contactInfo.industry} onChange={e => setContactInfo({ ...contactInfo, industry: e.target.value })} placeholder="e.g. Healthcare, E-commerce" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Company Size</label>
                              <select value={contactInfo.company_size} onChange={e => setContactInfo({ ...contactInfo, company_size: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0d1117] focus:ring-1 focus:outline-none transition-all text-white text-sm">
                                <option value="">Select size...</option>
                                {companySizes.map(cs => <option key={cs.id} value={cs.id}>{cs.label}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Estimated Budget Range</label>
                            <select value={contactInfo.budget} onChange={e => setContactInfo({ ...contactInfo, budget: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0d1117] focus:ring-1 focus:outline-none transition-all text-white text-sm">
                              <option value="">Select budget range...</option>
                              {budgetRanges.map(br => <option key={br.id} value={br.id}>{br.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Project Description</label>
                            <textarea rows={3} value={contactInfo.project_description} onChange={e => setContactInfo({ ...contactInfo, project_description: e.target.value })} placeholder="Briefly describe your project goals and expected outcomes..." className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-1 focus:outline-none transition-all text-white placeholder-slate-500 text-sm resize-none" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={handlePrev} className="btn-outline-glass px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto"><ArrowLeft size={16} /> Back</button>
                        <button type="submit" disabled={isSubmitting} className="btn-glow px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:flex-1 disabled:opacity-50" style={{ backgroundColor: activeServiceColor, boxShadow: `0 0 20px ${activeServiceColor}40` }}>
                          {isSubmitting ? "Generating Proposal..." : "Submit Request"}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 sm:py-16 space-y-6">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="font-outfit font-black text-2xl sm:text-3xl lg:text-4xl text-white">Proposal Scope Submitted Successfully!</h3>
                  <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-inter px-4">
                    Thank you for configuring your project requirements. A senior solution architect from DIGI8 SOLUTIONS INDIA PRIVATE LIMITED will review your specifications and issue a commercial proposal to <strong className="text-white">{contactInfo.email}</strong> within 24 business hours.
                  </p>
                  <div className="pt-8">
                    <button onClick={handleReset} className="btn-outline-glass px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2">
                      <RefreshCw size={18} /> Configure Another Proposal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
