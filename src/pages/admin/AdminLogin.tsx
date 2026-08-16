import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const { error } = await loginAdmin(email, password);
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center mx-auto mb-4 shadow-glow-accent">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="font-sora font-black text-white text-2xl">Admin Login</h1>
          <p className="text-slate-400 font-inter text-sm mt-1">Digi 8 Solutions Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="glass-strong rounded-2xl p-8 border border-white/10 space-y-5">
          <div className="bg-brand-cyan/10 border border-brand-cyan/20 p-3.5 rounded-xl text-xs font-inter text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-brand-cyan block">Super Admin Access</span>
              <span className="text-[11px] text-slate-400">admin@digi8solutions.com</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@digi8solutions.com');
                setPassword('AdminDigi8Password2026!');
              }}
              className="text-[11px] font-bold bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 px-2.5 py-1 rounded-lg transition-colors border border-brand-cyan/30"
            >
              Quick Fill
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-inter">Email</label>
            <input
              type="email"
              className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@digi8solutions.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-inter">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <Link to="/forgot-password" className="text-accent hover:text-white transition-colors text-xs font-inter">
                Forgot password?
              </Link>
            </div>
          </div>

          {status === 'error' && (
            <div className="text-red-400 text-xs font-inter text-center">{errorMsg}</div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-glow w-full py-3 rounded-xl font-poppins font-semibold text-white"
          >
            {status === 'loading' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
