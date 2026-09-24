import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, ShieldCheck, AlertCircle, ArrowRight, Lock, User, Eye, EyeOff } from "lucide-react";
import { checkAuth } from "../../lib/api";

// Staff credentials (in a real app these are stored in the DB & verified server-side)
// For demo: these are mock logins. Replace with real API-based auth as needed.
const STAFF_ACCOUNTS = [
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
};

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth().then((isAuthed) => {
      if (isAuthed) navigate("/admin/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    await new Promise(r => setTimeout(r, 600));

    const account = STAFF_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!account) {
      setErrorMsg("Invalid credentials. Please check your email and password.");
      setLoading(false);
      return;
    }

    // Store session
    const userObj = { email: account.email, name: account.name, role: account.role };
    localStorage.setItem("admin_user", JSON.stringify(userObj));
    localStorage.setItem("admin_token", `staff_${account.role.replace(/\s/g, "_")}_token`);
    setLoading(false);
    navigate("/admin/dashboard", { replace: true });
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
          <p className="text-slate-400 font-inter text-xs mt-1">Digi 8 Solutions — Role-Based Team Access</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono mt-3">
            <ShieldCheck size={13} /> Secure Role-Based Access
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
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Staff Email</label>
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

            <button type="submit" disabled={loading} className="btn-glow w-full py-3.5 rounded-xl font-poppins font-semibold text-white text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50">
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Verifying...</>
              ) : (
                <>Access Staff Dashboard <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Available roles info */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-3 font-inter">Available staff roles:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Sub Admin", "HR Admin", "Developer", "Marketing Executive", "Database Admin"].map(role => (
                <span key={role} className={`text-[10px] font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${roleGradients[role]} text-white`}>{role}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-xs">
          <Link to="/admin" className="text-slate-400 hover:text-white transition-colors font-medium">← Super Admin Login</Link>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Return to Public Portal</Link>
        </div>
      </div>
    </div>
  );
}
