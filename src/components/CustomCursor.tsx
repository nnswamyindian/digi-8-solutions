import { useEffect, useRef, useState } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });
  const glowPos = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [isFinePointer] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  useEffect(() => {
    if (!isFinePointer) return;
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    const glow = glowRef.current;
    const canvas = canvasRef.current;
    if (!cursor || !trail || !glow || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#00E5FF', '#6C63FF', '#8B5CF6', '#00FFC6'];

    const spawnExplosion = (x: number, y: number) => {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = Math.random() * 4 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 1,
        });
      }
    };

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      cursor.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };

    const onDown = (e: MouseEvent) => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      spawnExplosion(e.clientX, e.clientY);
    };

    const onUp = () => {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
    };

    const onEnterInteractive = () => {
      trail.style.width = '56px';
      trail.style.height = '56px';
      trail.style.borderColor = 'rgba(0, 229, 255, 0.9)';
      trail.style.background = 'rgba(0, 229, 255, 0.05)';
      glow.style.width = '120px';
      glow.style.height = '120px';
    };

    const onLeaveInteractive = () => {
      trail.style.width = '36px';
      trail.style.height = '36px';
      trail.style.borderColor = 'rgba(0, 229, 255, 0.4)';
      trail.style.background = 'transparent';
      glow.style.width = '80px';
      glow.style.height = '80px';
    };

    // Magnetic button effect
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    const magneticHandlers: Array<{ el: Element; handler: (e: MouseEvent) => void; leave: () => void }> = [];

    magneticElements.forEach(el => {
      const handler = (e: Event) => {
        const me = e as MouseEvent;
        const rect = el.getBoundingClientRect();
        const x = me.clientX - rect.left - rect.width / 2;
        const y = me.clientY - rect.top - rect.height / 2;
        (el as HTMLElement).style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      };
      const leave = () => {
        (el as HTMLElement).style.transform = 'translate(0, 0)';
      };
      el.addEventListener('mousemove', handler as EventListener);
      el.addEventListener('mouseleave', leave);
      magneticHandlers.push({ el, handler, leave });
    });

    // Ripple effect on click for buttons
    const onRippleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button, a') as HTMLElement | null;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.marginLeft = '-10px';
      ripple.style.marginTop = '-10px';
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    const animate = () => {
      // Trail follows with lerp
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.12;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.12;
      trail.style.transform = `translate(${trailPos.current.x - 18}px, ${trailPos.current.y - 18}px)`;

      // Glow follows slower
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.08;
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.08;
      glow.style.transform = `translate(${glowPos.current.x - 40}px, ${glowPos.current.y - 40}px)`;

      // Particle explosion rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    const addInteractiveListeners = () => {
      const interactives = document.querySelectorAll('a, button, [data-cursor="interactive"], input, textarea, select');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    };

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('click', onRippleClick);
    addInteractiveListeners();
    window.addEventListener('resize', onResize);
    animRef.current = requestAnimationFrame(animate);

    const observer = new MutationObserver(addInteractiveListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('click', onRippleClick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      magneticHandlers.forEach(({ el, handler, leave }) => {
        el.removeEventListener('mousemove', handler as EventListener);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9996,
        }}
      />
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{
          width: '80px',
          height: '80px',
          willChange: 'transform',
        }}
      />
      <div
        ref={cursorRef}
        className="cursor-dot"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00E5FF, #6C63FF)',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.8)',
          transition: 'width 0.2s, height 0.2s',
          willChange: 'transform',
        }}
      />
      <div
        ref={trailRef}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1.5px solid rgba(0, 229, 255, 0.4)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9998,
          pointerEvents: 'none',
          transition: 'width 0.3s, height 0.3s, border-color 0.3s, background 0.3s',
          willChange: 'transform',
        }}
      />
    </>
  );
}
