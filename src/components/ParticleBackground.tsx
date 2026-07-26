import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  baseX: number;
  baseY: number;
  update: () => void;
  draw: () => void;
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulse: number;
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let nodes: Node[] = [];
    let mouse = { x: -1000, y: -1000 };
    let isVisible = !document.hidden;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const colors = ['#00E5FF', '#6C63FF', '#8B5CF6', '#00FFC6'];

    class ParticleImpl implements Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; life: number;
      baseX: number; baseY: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = Math.random();
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life += 0.002;
        this.opacity = Math.sin(this.life * Math.PI) * 0.4;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.vx -= dx * 0.0003;
          this.vy -= dy * 0.0003;
        }

        // Gentle return to base position
        this.vx += (this.baseX - this.x) * 0.00005;
        this.vy += (this.baseY - this.y) * 0.00005;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        if (this.x < 0) this.x = canvas!.width;
        if (this.x > canvas!.width) this.x = 0;
        if (this.y < 0) this.y = canvas!.height;
        if (this.y > canvas!.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(Math.max(this.opacity, 0) * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }

    const initParticles = () => {
      const count = Math.min(120, Math.floor((canvas!.width * canvas!.height) / 15000));
      particles = Array.from({ length: count }, () => new ParticleImpl());

      // Neural network nodes
      const nodeCount = Math.min(15, Math.floor((canvas!.width * canvas!.height) / 80000));
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const drawConnections = () => {
      // Particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 100) * 0.1;
            ctx!.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Neural network connections (thicker, pulsing)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const alpha = (1 - dist / 250) * 0.15;
            const pulse = Math.sin(time * 0.02 + i + j) * 0.5 + 0.5;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `rgba(108, 99, 255, ${alpha * pulse})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }
    };

    const drawNodes = () => {
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;

        if (node.x < 0 || node.x > canvas!.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas!.height) node.vy *= -1;

        const pulseSize = 3 + Math.sin(node.pulse) * 2;
        const glowSize = pulseSize * 3;

        // Glow
        const gradient = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx!.fillStyle = '#00E5FF';
        ctx!.fill();
      });
    };

    const drawAurora = () => {
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        const yBase = canvas!.height * (0.3 + w * 0.25);
        const amplitude = 30;
        const frequency = 0.003;
        const speed = time * 0.0005;

        ctx!.beginPath();
        ctx!.moveTo(0, yBase);
        for (let x = 0; x <= canvas!.width; x += 5) {
          const y = yBase + Math.sin(x * frequency + speed + w) * amplitude;
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(canvas!.width, canvas!.height);
        ctx!.lineTo(0, canvas!.height);
        ctx!.closePath();

        const gradient = ctx!.createLinearGradient(0, yBase - amplitude, 0, canvas!.height);
        const color = w === 0 ? 'rgba(0, 229, 255, 0.02)' : w === 1 ? 'rgba(108, 99, 255, 0.02)' : 'rgba(139, 92, 246, 0.02)';
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }
    };

    const animate = () => {
      if (!isVisible) return;
      time++;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      drawAurora();
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      drawNodes();
      animId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) animId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animId = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
