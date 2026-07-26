import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !type) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    verifyEmail(token, type)
      .then((res) => {
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(res.error || 'Failed to verify email. The link may have expired.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      });
  }, [token, type]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-24 px-4">
      <div className="glass-card-premium max-w-md w-full p-8 text-center rounded-2xl bg-[#0F0F13] border border-white/10">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-brand-cyan border-t-transparent animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-outfit">Verifying...</h2>
            <p className="text-brand-gray">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-outfit">Verified!</h2>
            <p className="text-brand-gray mb-8">{message}</p>
            <Link to="/" className="btn-glow text-sm px-8 py-3">
              Return Home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-outfit">Verification Failed</h2>
            <p className="text-brand-gray mb-8">{message}</p>
            <Link to="/" className="btn-outline-glass text-sm px-8 py-3">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
