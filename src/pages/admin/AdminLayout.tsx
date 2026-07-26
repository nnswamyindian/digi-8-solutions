import { useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Briefcase, MessageSquare, Settings,
  LogOut, Menu, X, Zap, BarChart2, Tag, BookOpen, Bell, DollarSign, Shield
} from 'lucide-react';
import { supabase } from '../../lib/api';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setUserEmail(session.user.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-all ${
                  location.pathname === item.href
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

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
