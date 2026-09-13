import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Mail, AlertCircle, ArrowRight,
  CheckCircle2, KeyRound, RefreshCw, Send, Lock
} from 'lucide-react';
import { checkAuth, sendAuthOtp, verifyAuthOtp } from '../../lib/api';

const SUPER_ADMIN_EMAIL = 'digi8solutions@gmail.com';

export default function AdminLogin() {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    checkAuth().then((isAuthed) => {
      if (isAuthed) {
        navigate('/admin/dashboard', { replace: true });
      }
    });
  }, [navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Super Admin Gmail
  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await sendAuthOtp(SUPER_ADMIN_EMAIL, 'login', 'Digi-8 Super Admin');
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error?.message || 'Failed to dispatch verification email');
      return;
    }

    setStep('verify');
    setResendCooldown(45);
    setSuccessMsg(`A 6-digit security OTP code was dispatched to ${SUPER_ADMIN_EMAIL}.`);
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP passcode');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await verifyAuthOtp({
      email: SUPER_ADMIN_EMAIL,
      otp: otpCode.trim(),
      purpose: 'login'
    });
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error?.message || 'Invalid or expired OTP code');
      return;
    }

    // Success! Redirect to Super Admin Dashboard
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple flex items-center justify-center mx-auto mb-3 shadow-glow-cyan">
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="font-sora font-black text-white text-2xl tracking-tight">Super Admin Gateway</h1>
          <p className="text-slate-400 font-inter text-xs mt-1">Digi 8 Solutions Executive Control Portal</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mt-3">
            <ShieldCheck size={13} /> Database-Verified OTP Security
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-strong rounded-2xl p-7 border border-white/10 shadow-2xl backdrop-blur-xl">

          {/* Super Admin Account Details Badge */}
          <div className="mb-6 p-4 rounded-xl bg-black/40 border border-brand-cyan/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  {SUPER_ADMIN_EMAIL}
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan font-semibold uppercase">
                    Super Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Primary Company Administrative Email</div>
              </div>
            </div>
            <Lock size={15} className="text-slate-500" />
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}


          {/* STEP 1: SEND OTP BUTTON */}
          {step === 'send' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                To access the Executive Admin Dashboard, a 6-digit verification passcode will be sent to the official Super Admin inbox ({SUPER_ADMIN_EMAIL}).
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="btn-glow w-full py-3.5 rounded-xl font-poppins font-semibold text-white text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Dispatching Security Passcode...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send OTP to {SUPER_ADMIN_EMAIL}
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STEP 2: VERIFY OTP FORM */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <KeyRound size={13} className="text-brand-cyan" />
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  className="form-input w-full px-4 py-3.5 rounded-xl text-center text-3xl font-mono tracking-[0.45em] font-black bg-black/60 border border-brand-cyan/50 text-brand-cyan focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                  placeholder="••••••"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <span className="block text-center mt-1.5 text-[11px] text-slate-400">
                  Passcode expires in 10 minutes. Verified directly in database.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="btn-glow w-full py-3.5 rounded-xl font-poppins font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow-cyan"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Verifying with Database...
                  </>
                ) : (
                  <>
                    Verify OTP & Access Admin Panel <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400 border-t border-white/10 mt-3">
                <span>Didn't receive email?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-brand-cyan hover:underline disabled:opacity-40 flex items-center gap-1 font-medium"
                >
                  <RefreshCw size={12} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors text-xs font-medium">
            ← Return to Digi 8 Solutions Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
