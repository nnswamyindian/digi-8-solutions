import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, EyeOff, Eye } from 'lucide-react';
import { api } from '../../lib/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.post('/api/auth/reset-password', { token, password });
      if (res.success) {
        alert('Password reset successfully! You can now log in.');
        navigate('/admin');
      } else {
        setStatus('error');
        setMessage(res.error);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-brand-dark text-white text-center">
        <div>
          <h2 className="text-xl font-sora mb-2">Invalid Reset Link</h2>
          <p className="text-slate-400 mb-4">No token provided in the URL.</p>
          <Link to="/admin" className="text-accent hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

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
          <h1 className="font-sora font-black text-white text-2xl">Create New Password</h1>
          <p className="text-slate-400 font-inter text-sm mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 border border-white/10 space-y-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-inter">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-inter">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {status === 'error' && (
            <div className="text-red-400 text-xs font-inter text-center">{message}</div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-glow w-full py-3 rounded-xl font-poppins font-semibold text-white"
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
