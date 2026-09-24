import { useState, useEffect, ReactNode, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Briefcase, MessageSquare, Settings,
  LogOut, Menu, X, Zap, BarChart2, Tag, BookOpen, Bell, DollarSign, Shield, Ticket,
  UserCheck, Calendar, Mail, Search, ArrowLeft, ChevronRight, Code2, TrendingUp
} from "lucide-react";
import { supabase, buildApiUrl, logoutAdmin } from "../../lib/api";
import CommandPalette from "../../components/admin/ats/CommandPalette";

// ──────────────────────────────────────────────
// ROLE DEFINITIONS
// ──────────────────────────────────────────────
export type AdminRole =
  | "Super Admin"
  | "Sub Admin"
  | "HR Admin"
  | "Developer"
  | "Marketing Executive"
  | "Database Admin";

// Each nav item has a set of roles that can see it
interface NavItem {
  icon: any;
  label: string;
  href: string;
  roles: AdminRole[]; // empty = all roles
}

const ALL_ROLES: AdminRole[] = ["Super Admin", "Sub Admin", "HR Admin", "Developer", "Marketing Executive", "Database Admin"];
const SUPER_AND_SUB: AdminRole[] = ["Super Admin", "Sub Admin"];

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",             href: "/admin/dashboard",               roles: ALL_ROLES },
  // ── ATS / Careers ──
  { icon: UserCheck,       label: "Careers Overview",      href: "/admin/careers",                 roles: ["Super Admin", "Sub Admin", "HR Admin"] },
  { icon: Users,           label: "ATS Pipeline",          href: "/admin/careers/pipeline",         roles: ["Super Admin", "Sub Admin", "HR Admin"] },
  { icon: Briefcase,       label: "Candidate CRM",         href: "/admin/careers/candidates",       roles: ["Super Admin", "Sub Admin", "HR Admin"] },
  { icon: Calendar,        label: "Interviews",            href: "/admin/careers/interviews",       roles: ["Super Admin", "Sub Admin", "HR Admin"] },
  { icon: Mail,            label: "Email Automation",      href: "/admin/careers/automations",      roles: ["Super Admin", "Sub Admin", "HR Admin"] },
  { icon: BarChart2,       label: "Recruitment Funnel",    href: "/admin/careers/analytics",        roles: ["Super Admin", "Sub Admin", "HR Admin"] },
  // ── Business ──
  { icon: Ticket,          label: "Support Tickets",       href: "/admin/tickets",                  roles: ["Super Admin", "Sub Admin", "Developer"] },
  { icon: Users,           label: "Leads",                 href: "/admin/leads",                    roles: ["Super Admin", "Sub Admin", "Marketing Executive"] },
  { icon: FileText,        label: "Quotes",                href: "/admin/quotes",                   roles: ["Super Admin", "Sub Admin", "Marketing Executive"] },
  { icon: Briefcase,       label: "Projects",              href: "/admin/projects",                 roles: ["Super Admin", "Sub Admin", "Developer"] },
  { icon: MessageSquare,   label: "Contacts",              href: "/admin/contacts",                 roles: ["Super Admin", "Sub Admin", "Marketing Executive"] },
  { icon: Tag,             label: "Testimonials",          href: "/admin/testimonials",             roles: ["Super Admin", "Sub Admin", "Marketing Executive"] },
  { icon: BookOpen,        label: "Blog",                  href: "/admin/blog",                     roles: ["Super Admin", "Sub Admin", "Marketing Executive"] },
  { icon: DollarSign,      label: "Pricing",               href: "/admin/pricing",                  roles: ["Super Admin", "Sub Admin"] },
  // ── Developer ──
  { icon: Code2,           label: "Developer Tools",       href: "/admin/settings",                 roles: ["Super Admin", "Developer"] },
  // ── Admin only ──
  { icon: TrendingUp,      label: "Analytics",             href: "/admin/analytics",                roles: SUPER_AND_SUB },
  { icon: Shield,          label: "User Management",       href: "/admin/users",                    roles: ["Super Admin"] },
  { icon: Settings,        label: "Settings",              href: "/admin/settings",                 roles: ["Super Admin"] },
];

// Allowed paths per role (for redirect guard)
const roleAllowedPrefixes: Record<AdminRole, string[]> = {
  "Super Admin":           ["/admin"],
  "Sub Admin":             ["/admin/dashboard", "/admin/careers", "/admin/tickets", "/admin/leads", "/admin/quotes", "/admin/projects", "/admin/contacts", "/admin/testimonials", "/admin/blog", "/admin/pricing", "/admin/analytics"],
  "HR Admin":              ["/admin/dashboard", "/admin/careers"],
  "Developer":             ["/admin/dashboard", "/admin/tickets", "/admin/projects", "/admin/settings"],
  "Marketing Executive":   ["/admin/dashboard", "/admin/leads", "/admin/quotes", "/admin/contacts", "/admin/testimonials", "/admin/blog"],
  "Database Admin":        ["/admin/dashboard"],
};

const roleColors: Record<AdminRole, string> = {
  "Super Admin":           "from-purple-500 to-indigo-700",
  "Sub Admin":             "from-cyan-500 to-blue-600",
  "HR Admin":              "from-emerald-500 to-teal-700",
  "Developer":             "from-amber-500 to-orange-600",
  "Marketing Executive":   "from-rose-500 to-pink-600",
  "Database Admin":        "from-slate-500 to-gray-700",
};

const roleBadgeColors: Record<AdminRole, string> = {
  "Super Admin":           "text-purple-400",
  "Sub Admin":             "text-cyan-400",
  "HR Admin":              "text-emerald-400",
  "Developer":             "text-amber-400",
  "Marketing Executive":   "text-rose-400",
  "Database Admin":        "text-slate-400",
};

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────
export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<AdminRole>("Super Admin");
  const [liveAlert, setLiveAlert] = useState<{ title: string; message: string; timestamp: string } | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_user");
      if (stored) {
        const userObj = JSON.parse(stored);
        if (userObj?.email) setUserEmail(userObj.email);
        if (userObj?.name) setUserName(userObj.name);
        if (userObj?.role) setUserRole(userObj.role as AdminRole);
      } else {
        setUserEmail("admin@digi8solutions.com");
        setUserName("Digi-8 Super Admin");
        setUserRole("Super Admin");
      }
    } catch {
      setUserEmail("admin@digi8solutions.com");
      setUserRole("Super Admin");
    }
  }, []);

  // Route guard — runs after role is set
  useEffect(() => {
    if (!userRole || userRole === "Super Admin") return;
    const allowed = roleAllowedPrefixes[userRole] || [];
    const isAllowed = allowed.some(prefix =>
      location.pathname === prefix || location.pathname.startsWith(prefix + "/")
    );
    if (!isAllowed && location.pathname.startsWith("/admin")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [userRole, location.pathname, navigate]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const sseUrl = buildApiUrl("/api/admin/events");
    const eventSource = new EventSource(sseUrl);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type !== "CONNECTED") {
          setLiveAlert({ title: data.title || "System Notification", message: data.message || "New update received", timestamp: new Date().toLocaleTimeString() });
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(data.title || "Digi8 Admin Alert", { body: data.message, icon: "/favicon.svg" });
          }
        }
      } catch {}
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setShowCommandPalette(prev => !prev); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { eventSource.close(); window.removeEventListener("keydown", handleKeyDown); };
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin", { replace: true });
  };

  const visibleNavItems = useMemo(() => {
    return navItems.filter(item => item.roles.length === 0 || item.roles.includes(userRole));
  }, [userRole]);

  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/admin/dashboard" }];
    if (location.pathname === "/admin/dashboard") return crumbs;
    if (location.pathname.startsWith("/admin/careers")) {
      crumbs.push({ label: "Careers", href: "/admin/careers" });
      if (location.pathname === "/admin/careers/pipeline") crumbs.push({ label: "ATS Pipeline", href: "/admin/careers/pipeline" });
      else if (location.pathname === "/admin/careers/candidates") crumbs.push({ label: "Candidate CRM", href: "/admin/careers/candidates" });
      else if (location.pathname === "/admin/careers/interviews") crumbs.push({ label: "Interviews", href: "/admin/careers/interviews" });
      else if (location.pathname === "/admin/careers/automations") crumbs.push({ label: "Email Automation", href: "/admin/careers/automations" });
      else if (location.pathname === "/admin/careers/analytics") crumbs.push({ label: "Funnel Telemetry", href: "/admin/careers/analytics" });
      else if (location.pathname === "/admin/careers/jobs/new") crumbs.push({ label: "Create Job", href: "/admin/careers/jobs/new" });
      return crumbs;
    }
    const matchedNav = visibleNavItems.find(n => n.href === location.pathname);
    if (matchedNav) crumbs.push({ label: matchedNav.label, href: matchedNav.href });
    return crumbs;
  }, [location.pathname, visibleNavItems]);

  const handleBack = () => {
    if (location.pathname.startsWith("/admin/careers/") && location.pathname !== "/admin/careers") {
      navigate("/admin/careers");
    } else if (location.pathname !== "/admin/dashboard") {
      navigate("/admin/dashboard");
    } else {
      navigate(-1);
    }
  };

  const gradientClass = roleColors[userRole] || "from-accent to-highlight";
  const badgeColorClass = roleBadgeColors[userRole] || "text-slate-400";

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2 pt-2">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradientClass}`}>
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <div className="font-sora font-bold text-sm text-white">Digi 8</div>
                <div className={`text-[9px] uppercase tracking-widest font-mono ${badgeColorClass} font-bold`}>{userRole}</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
            {visibleNavItems.map(item => {
              const isSelected = location.pathname === item.href || (item.href === "/admin/careers" && location.pathname.startsWith("/admin/careers/jobs"));
              return (
                <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-all ${isSelected ? "bg-accent/15 text-accent border border-accent/20 font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Role Badge */}
          <div className={`mx-2 mb-3 px-3 py-2 rounded-xl bg-gradient-to-r ${gradientClass} opacity-90`}>
            <div className="text-[9px] font-mono text-white/70 uppercase tracking-widest">Logged in as</div>
            <div className="text-xs font-bold text-white">{userRole}</div>
          </div>

          {/* User */}
          <div className="border-t border-white/10 pt-4">
            {userEmail && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-sora text-xs font-bold flex-shrink-0 bg-gradient-to-br ${gradientClass}`}>
                  {(userName || userEmail)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-inter text-white truncate font-medium">{userName || userEmail}</div>
                  <div className={`text-[10px] font-semibold ${badgeColorClass}`}>{userRole}</div>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full">
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="glass border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white shrink-0" aria-label="Toggle navigation menu">
              <Menu size={18} />
            </button>
            {location.pathname !== "/admin/dashboard" && (
              <button onClick={handleBack} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-inter transition-all shrink-0 active:scale-95" title="Go Back">
                <ArrowLeft size={14} className="text-cyan-400" /><span className="hidden sm:inline font-medium">Back</span>
              </button>
            )}
            <nav className="flex items-center gap-1.5 text-xs font-inter min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={crumb.href + idx} className="flex items-center gap-1.5 min-w-0">
                    {idx > 0 && <ChevronRight size={12} className="text-slate-600 shrink-0" />}
                    {isLast ? (
                      <span className="text-white font-sora font-semibold truncate text-xs sm:text-sm">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.href} className="text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline truncate">{crumb.label}</Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={() => setShowCommandPalette(true)} className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-inter flex items-center gap-2 transition-colors" title="Global Quick Search (Ctrl + K)">
              <Search size={14} className="text-cyan-400" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-slate-400 font-mono">Ctrl K</kbd>
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors" aria-label="Notifications"><Bell size={18} /></button>
            <Link to="/" className="text-xs text-accent hover:text-white transition-colors font-inter hidden sm:inline" target="_blank" rel="noopener noreferrer">View Site →</Link>
          </div>
        </header>

        <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

        <main className="flex-1 p-4 sm:p-6 relative">
          {liveAlert && (
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-cyan/20 to-blue-600/20 border border-brand-cyan/50 rounded-2xl flex items-center justify-between shadow-xl shadow-cyan-500/10 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/50 flex items-center justify-center shrink-0"><Bell className="w-5 h-5 text-brand-cyan" /></div>
                <div>
                  <h4 className="font-outfit font-bold text-white text-sm">{liveAlert.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{liveAlert.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">{liveAlert.timestamp}</span>
                <button onClick={() => setLiveAlert(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
