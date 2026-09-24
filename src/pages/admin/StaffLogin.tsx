import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, ShieldCheck, AlertCircle, ArrowRight, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { checkAuth, buildApiUrl } from "../../lib/api";

// Built-in default staff accounts
const DEFAULT_STAFF_ACCOUNTS = [
  { email: "subadmin@digi8solutions.com",   password: "SubAdmin@2026",     role: "Sub Admin",            name: "Sub Administrator" },
  { email: "hr@digi8solutions.com",          password: "HRPortal@2026",    role: "HR Admin",             name: "HR Manager" },
  { email: "dev@digi8solutions.com",         password: "DevTeam@2026",     role: "Developer",            name: "Lead Developer" },
  { email: "marketing@digi8solutions.com",   password: "Marketing@2026",   role: "Marketing Executive",  name: "Marketing Executive" },
  { email: "dbadmin@digi8solutions.com",     password: "DbAdmin@2026",     role: "Database Admin",       name: "Database Administrator" },
];

const roleGradients: Record<string, string> = {
  "Sub Admin":            "from-cyan-500 to-blue-600",
  "HR Admin":             "from-emerald-500 to-teal-600",
  "Developer":            "from-amber-500 to-orange-500",
  "Marketing Executive":  "from-rose-500 to-pink-600",
  "Database Admin":       "from-slate-500 to-gray-600",
  "Super Admin":          "from-purple-500 to-indigo-600",
};

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && u.role && u.role !== 'Super Admin') {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch {}
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    let matchedUser: any = null;
    let matchedToken: string | null = null;

    // 1. Check Pre-Configured Staff Accounts
    const defaultAccount = DEFAULT_STAFF_ACCOUNTS.find(
      a => a.email.toLowerCase() === cleanEmail && a.password === cleanPass
    );
    if (defaultAccount) {
      matchedUser = { email: defaultAccount.email, name: defaultAccount.name, role: defaultAccount.role };
      matchedToken = `staff_${defaultAccount.role.replace(/\s/g, "_")}_token`;
    }

    // 2. Check Custom Staff Logins Created by Admin in Local Store
    if (!matchedUser) {
      try {
        const localStore = localStorage.getItem("digi8_staff_users_db");
        if (localStore) {
          const customUsers = JSON.parse(localStore);
          const matched = customUsers.find(
            (u: any) => u.email.toLowerCase() === cleanEmail && (u.password === cleanPass || !u.password)
          );
          if (matched) {
            if (matched.status === 'suspended') {
              setErrorMsg("This staff account has been suspended by the Super Administrator.");
              setLoading(false);
              return;
            }
            matchedUser = { id: matched.id, email: matched.email, name: matched.name, role: matched.role };
            matchedToken = `staff_${matched.role.replace(/\s/g, "_")}_token`;
          }
        }
      } catch {}
    }

    // 3. Attempt Server-Side Authentication
    try {
      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        matchedToken = data.data.token;
        matchedUser = data.data.user;
      }
    } catch {
      // Backend offline or error, continue with local match
    }

    // 4. Complete Login
    if (matchedUser && matchedToken) {
      localStorage.setItem("admin_token", matchedToken);
      localStorage.setItem("admin_user", JSON.stringify(matchedUser));
      window.dispatchEvent(new Event("admin_auth_changed"));
      setLoading(false);
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    setErrorMsg("Invalid email or password. Please verify credentials or contact the Super Administrator.");
    setLoading(false);
  };

  const fillQuickAccount = (acc: typeof DEFAULT_STAFF_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10 bg-brand-dark">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple flex items-center justify-center mx-auto mb-3 shadow-glow-cyan">
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="font-sora font-black text-white text-2xl tracking-tight">Staff Portal Login</h1>
          <p className="text-slate-400 font-inter text-xs mt-1">Digi 8 Solutions — Direct Team Access</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mt-3">
            <CheckCircle2 size={13} /> Zero-Verification Direct Login
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-7 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Staff Email / Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. hr@digi8solutions.com"
                  className="form-input w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-inter"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your staff password"
                  className="form-input w-full pl-10 pr-12 py-3.5 rounded-xl text-sm font-inter"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-glow w-full py-3.5 rounded-xl font-poppins font-semibold text-white text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Verifying Credentials...</>
              ) : (
                <>Access Staff Dashboard <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center mb-2 font-inter">Click to autofill pre-configured staff accounts:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {DEFAULT_STAFF_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillQuickAccount(acc)}
                  className="text-[11px] p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex flex-col"
                >
                  <span className="font-semibold text-white truncate">{acc.role}</span>
                  <span className="text-[10px] text-slate-400 truncate">{acc.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-xs">
          <Link to="/admin" className="text-slate-400 hover:text-white transition-colors font-medium">← Super Admin Login (OTP)</Link>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Return to Public Portal</Link>
        </div>
      </div>
    </div>
  );
}
