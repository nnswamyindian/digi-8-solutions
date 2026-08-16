import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Ticket, Search, CheckCircle, Clock, AlertCircle, RefreshCw, Trash2, User, Mail } from 'lucide-react';
import { fetchTickets, updateTicketStatus, deleteTicket, SupportTicket } from '../../lib/api';

export default function AdminTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [updating, setUpdating] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchTickets();
        setTickets(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleStatusUpdate = async (id: number | string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
        setUpdating(true);
        await updateTicketStatus(id, { status: newStatus, resolution_notes: resolutionNote });
        setUpdating(false);
        setSelectedTicket(null);
        setResolutionNote('');
        loadData();
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm('Are you sure you want to delete this support ticket?')) return;
        await deleteTicket(id);
        loadData();
    };

    const filteredTickets = tickets.filter(t => {
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesSearch =
            (t.ticket_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><AlertCircle size={12} /> Open</span>;
            case 'in_progress':
                return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><Clock size={12} /> In Progress</span>;
            case 'resolved':
                return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle size={12} /> Resolved</span>;
            case 'closed':
                return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1">Closed</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/5">{status}</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                        <h1 className="text-2xl font-outfit font-bold text-white flex items-center gap-2.5">
                            <Ticket className="text-brand-cyan" /> Support Ticket Desk
                        </h1>
                        <p className="text-xs text-slate-400 font-inter mt-1">
                            Manage visitor issues, service inquiries, and support tickets raised via Chatbot or Web.
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition-colors self-start sm:self-auto"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Desk
                    </button>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-inter capitalize transition-all whitespace-nowrap ${filterStatus === status
                                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Ticket #, Name, Email..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-cyan"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table / Grid */}
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-inter text-sm">
                        <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-brand-cyan" />
                        Loading support tickets...
                    </div>
                ) : filteredTickets.length > 0 ? (
                    <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-inter">
                                <thead className="bg-white/5 text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="p-4">Ticket #</th>
                                        <th className="p-4">User / Contact</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Subject</th>
                                        <th className="p-4">Priority</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-200">
                                    {filteredTickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-mono font-bold text-brand-cyan">
                                                {ticket.ticket_number}
                                                <div className="text-[10px] text-slate-500 font-inter font-normal">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white flex items-center gap-1.5">
                                                    <User size={12} className="text-slate-400" /> {ticket.user_name}
                                                </div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Mail size={10} /> {ticket.user_email}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">
                                                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                                                    {ticket.service_category}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <div className="font-semibold text-white truncate">{ticket.subject}</div>
                                                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{ticket.description}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${ticket.priority === 'urgent' || ticket.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-300'
                                                    }`}>
                                                    {ticket.priority || 'medium'}
                                                </span>
                                            </td>
                                            <td className="p-4">{getStatusBadge(ticket.status)}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className="px-2.5 py-1 rounded-lg bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 text-xs font-semibold border border-brand-cyan/30 transition-colors"
                                                >
                                                    Manage
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ticket.id)}
                                                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                    title="Delete Ticket"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="py-16 text-center text-slate-400 glass rounded-2xl border border-white/10">
                        <Ticket size={36} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-sm font-semibold text-white">No support tickets found</p>
                        <p className="text-xs text-slate-500 mt-1">When visitors raise tickets via chatbot, they will show up here live.</p>
                    </div>
                )}

                {/* Ticket Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                        <div className="bg-[#050816] border border-brand-cyan/30 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="font-outfit font-bold text-white text-base flex items-center gap-2">
                                    <Ticket className="text-brand-cyan" size={18} /> Ticket #{selectedTicket.ticket_number}
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-3 text-xs font-inter text-slate-300">
                                <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl">
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">User Name</span>
                                        <span className="font-bold text-white">{selectedTicket.user_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">User Email</span>
                                        <span className="font-bold text-white">{selectedTicket.user_email}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-slate-500 text-[10px] block">Subject</span>
                                    <span className="font-bold text-white text-sm">{selectedTicket.subject}</span>
                                </div>

                                <div>
                                    <span className="text-slate-500 text-[10px] block">Description</span>
                                    <p className="p-3 bg-black/40 border border-white/10 rounded-xl mt-1 text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Update Status</label>
                                    <div className="flex gap-2">
                                        {(['open', 'in_progress', 'resolved', 'closed'] as const).map(st => (
                                            <button
                                                key={st}
                                                onClick={() => handleStatusUpdate(selectedTicket.id, st)}
                                                disabled={updating}
                                                className={`flex-1 py-1.5 rounded-lg text-xs capitalize font-bold transition-all border ${selectedTicket.status === st
                                                    ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/50'
                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {st.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
