import { useState, useEffect } from 'react';

const bootSteps = [
  'Initializing AI...',
  'Loading Services',
  'Connecting Servers',
  'Building Experience',
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const duration = 3200;
    const interval = 30;
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + increment, 100);
        const step = Math.min(Math.floor((next / 100) * bootSteps.length), bootSteps.length - 1);
        setStepIndex(step);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setExiting(true), 400);
          setTimeout(onComplete, 1200);
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`boot-screen ${exiting ? 'boot-screen-exit' : ''}`}>
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Aurora layers */}
      <div className="aurora-bg">
        <div className="aurora-layer w-[500px] h-[500px] bg-accent top-1/4 left-1/4" style={{ animationDelay: '0s' }} />
        <div className="aurora-layer w-[400px] h-[400px] bg-highlight top-1/2 right-1/4" style={{ animationDelay: '-7s' }} />
        <div className="aurora-layer w-[300px] h-[300px] bg-accent-purple bottom-1/4 left-1/3" style={{ animationDelay: '-14s' }} />
      </div>

      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="light-ray"
            style={{
              left: `${15 + i * 20}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: '8s',
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="boot-logo-glow flex flex-col items-center">
          <img src="/logo.png" alt="Digi8 Solutions Logo" className="h-100 w-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse" />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="font-sora font-black text-2xl sm:text-3xl text-white tracking-tight">
            DIGI <span className="gradient-text">8</span> SOLUTIONS
          </h1>
          <p className="text-xs text-accent/60 font-inter tracking-[0.3em] uppercase mt-2">
            AI-Powered Digital Agency
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 sm:w-80">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full boot-progress-bar rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-slate-400 font-inter">
              {bootSteps[stepIndex]}
            </span>
            <span className="text-xs font-sora font-bold gradient-text-blue">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        {/* Status dots */}
        <div className="flex gap-2">
          {bootSteps.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i <= stepIndex ? 'bg-accent shadow-glow-accent' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
