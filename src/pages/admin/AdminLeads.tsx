import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "../../lib/api";
import { RefreshCw, Eye, X, User, Mail, Phone, Building2, Globe, DollarSign, Tag, MessageSquare, Calendar, UserCheck, ChevronDown } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  industry?: string;
  budget?: string;
  service?: string;
  status: string;
  source?: string;
  message?: string;
  assigned_to?: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: "bg-accent/10 text-accent border-accent/20",
  contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  qualified: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  closed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TEAM_MEMBERS = [
  { id: "", name: "— Unassigned —" },
  { id: "sales_1", name: "Arjun (Sales Lead)" },
  { id: "sales_2", name: "Priya (Sales Executive)" },
  { id: "mktg_1", name: "Rahul (Marketing)" },
  { id: "dev_1", name: "Vikram (Pre-Sales Tech)" },
  { id: "subadmin_1", name: "Sneha (Sub Admin)" },
];

function DetailModal({ lead, onClose, onStatusChange, onAssign }: { lead: Lead; onClose: () => void; onStatusChange: (id: string, status: string) => void; onAssign: (id: string, assignee: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-outfit font-bold text-xl text-white">{lead.name}</h2>
            <p className="text-slate-400 text-sm">{lead.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Status & Assign Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
              <div className="relative">
                <select value={lead.status} onChange={e => onStatusChange(lead.id, e.target.value)} className="w-full appearance-none bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm pr-10 focus:outline-none focus:border-brand-cyan/50 cursor-pointer">
                  {Object.keys(statusColors).map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Assign To</label>
              <div className="relative">
                <select value={lead.assigned_to || ""} onChange={e => onAssign(lead.id, e.target.value)} className="w-full appearance-none bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm pr-10 focus:outline-none focus:border-brand-cyan/50 cursor-pointer">
                  {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 border-b border-brand-cyan/20 pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.phone && <InfoRow icon={Phone} label="Phone" value={lead.phone} />}
              {lead.email && <InfoRow icon={Mail} label="Email" value={lead.email} />}
              {lead.source && <InfoRow icon={Tag} label="Source" value={lead.source} />}
              {lead.created_at && <InfoRow icon={Calendar} label="Submitted" value={new Date(lead.created_at).toLocaleString()} />}
            </div>
          </div>

          {/* Company Details */}
          {(lead.company || lead.website || lead.industry || lead.budget) && (
            <div>
              <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 border-b border-brand-cyan/20 pb-2">Company Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lead.company && <InfoRow icon={Building2} label="Company" value={lead.company} />}
                {lead.website && <InfoRow icon={Globe} label="Website" value={lead.website} href={lead.website} />}
                {lead.industry && <InfoRow icon={Tag} label="Industry" value={lead.industry} />}
                {lead.budget && <InfoRow icon={DollarSign} label="Budget" value={lead.budget} />}
              </div>
            </div>
          )}

          {/* Service & Assignment */}
          <div>
            <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 border-b border-brand-cyan/20 pb-2">Request Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.service && <InfoRow icon={UserCheck} label="Service Interested" value={lead.service} />}
              {lead.assigned_to && <InfoRow icon={User} label="Assigned To" value={TEAM_MEMBERS.find(m => m.id === lead.assigned_to)?.name || lead.assigned_to} />}
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-3 border-b border-brand-cyan/20 pb-2">Message / Notes</h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                <MessageSquare size={16} className="inline mr-2 text-slate-500" />
                {lead.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
      <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-brand-cyan" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-cyan hover:underline truncate block">{value}</a>
        ) : (
          <div className="text-sm text-white font-medium truncate">{value}</div>
        )}
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    supabase.from("leads").select("*").order("created_at", { ascending: false })
      .then((res: any) => { setLeads(res?.data || []); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, status } : prev);
  };

  const assignLead = async (id: string, assigned_to: string) => {
    await supabase.from("leads").update({ assigned_to }).eq("id", id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, assigned_to } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, assigned_to } : prev);
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="font-sora font-black text-white text-2xl">Leads Management</h1>
            <p className="text-slate-400 text-sm font-inter">{leads.length} total leads — View details and assign to team members</p>
          </div>
          <button onClick={load} className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2 self-start sm:self-auto">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input className="form-input px-4 py-2 rounded-xl text-sm font-inter flex-1" placeholder="Search by name, email, or company..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-inter focus:outline-none focus:border-brand-cyan/50">
            <option value="all">All Statuses</option>
            {Object.keys(statusColors).map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {["Name / Company", "Email", "Phone", "Service", "Status", "Assigned To", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded w-20" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No leads found.</td></tr>
                ) : (
                  filtered.map(lead => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{lead.name}</div>
                        {lead.company && <div className="text-slate-500 text-xs flex items-center gap-1"><Building2 size={10} />{lead.company}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[150px] truncate">{lead.email}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{lead.phone || "-"}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs max-w-[120px] truncate">{lead.service || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border ${statusColors[lead.status] || "bg-white/5 text-slate-400 border-white/10"}`}>{lead.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {lead.assigned_to ? (TEAM_MEMBERS.find(m => m.id === lead.assigned_to)?.name || lead.assigned_to) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedLead(lead)} className="px-2 py-1 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-xs font-semibold flex items-center gap-1 transition-colors border border-brand-cyan/20">
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => deleteLead(lead.id)} className="text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs transition-colors">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedLead && (
        <DetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={updateStatus}
          onAssign={assignLead}
        />
      )}
    </AdminLayout>
  );
}
