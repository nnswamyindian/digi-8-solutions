import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.error);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
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
          <h1 className="font-sora font-black text-white text-2xl">Reset Password</h1>
          <p className="text-slate-400 font-inter text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 border border-white/10 space-y-5">
          {status === 'success' ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Mail size={24} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-inter text-sm">{message}</p>
              <Link to="/admin" className="btn-glow w-full py-3 rounded-xl font-poppins font-semibold text-white mt-4 block">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-inter">Email Address</label>
                <input
                  type="email"
                  className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@digi8solutions.com"
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
                {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
              </button>
              
              <div className="text-center mt-4">
                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors text-xs font-inter inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Back to login
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
