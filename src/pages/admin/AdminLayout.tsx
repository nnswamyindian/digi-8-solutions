import { useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Briefcase, MessageSquare, Settings,
  LogOut, Menu, X, Zap, BarChart2, Tag, BookOpen, Bell, DollarSign, Shield, Ticket
} from 'lucide-react';
import { supabase } from '../../lib/api';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Ticket, label: 'Support Tickets', href: '/admin/tickets' },
  { icon: Users, label: 'Leads', href: '/admin/leads' },
  { icon: FileText, label: 'Quotes', href: '/admin/quotes' },
  { icon: Briefcase, label: 'Projects', href: '/admin/projects' },
  { icon: MessageSquare, label: 'Contacts', href: '/admin/contacts' },
  { icon: Tag, label: 'Testimonials', href: '/admin/testimonials' },
  { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
  { icon: DollarSign, label: 'Pricing', href: '/admin/pricing' },
  { icon: Shield, label: 'User Management', href: '/admin/users' },
  { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [liveAlert, setLiveAlert] = useState<{ title: string; message: string; timestamp: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        const userObj = JSON.parse(stored);
        if (userObj?.email) setUserEmail(userObj.email);
      } else {
        setUserEmail('admin@digi8solutions.com');
      }
    } catch (e) {
      setUserEmail('admin@digi8solutions.com');
    }

    // Request browser Notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe to Realtime SSE Notifications from Backend
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const sseUrl = `${API_BASE.replace('/api', '')}/api/admin/events`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type !== 'CONNECTED') {
          setLiveAlert({
            title: data.title || 'System Notification',
            message: data.message || 'New update received',
            timestamp: new Date().toLocaleTimeString()
          });

          // Trigger Native Browser / PWA Push Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.title || 'Digi8 Admin Alert', {
              body: data.message,
              icon: '/favicon.svg'
            });
          }
        }
      } catch (e) {
        console.error('[SSE] Event parse error:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2 pt-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <div className="font-sora font-bold text-sm text-white">Digi 8</div>
                <div className="text-[9px] text-accent/70 uppercase tracking-widest">Admin</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-all ${location.pathname === item.href
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="border-t border-white/10 pt-4">
            {userEmail && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center text-white font-sora text-sm font-bold flex-shrink-0">
                  {userEmail[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-inter text-white truncate">{userEmail}</div>
                  <div className="text-[10px] text-slate-500">Administrator</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <div className="text-white font-sora font-semibold text-sm">
              {navItems.find(n => location.pathname.startsWith(n.href))?.label || 'Admin'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <Link to="/" className="text-xs text-accent hover:text-white transition-colors font-inter" target="_blank" rel="noopener noreferrer">
              View Site →
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 relative">
          {liveAlert && (
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-cyan/20 to-blue-600/20 border border-brand-cyan/50 rounded-2xl flex items-center justify-between shadow-xl shadow-cyan-500/10 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/50 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-brand-cyan" />
                </div>
                <div>
                  <h4 className="font-outfit font-bold text-white text-sm">{liveAlert.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{liveAlert.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">{liveAlert.timestamp}</span>
                <button
                  onClick={() => setLiveAlert(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
