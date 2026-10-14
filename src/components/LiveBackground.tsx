import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  color: string;
  glowColor: string;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
}

export const LiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Warm Indian Royal & Culinary Spice Palette
    const palette = [
      { fill: '#FF9933', glow: 'rgba(255, 153, 51, 0.4)' }, // Saffron
      { fill: '#E5A93C', glow: 'rgba(229, 169, 60, 0.35)' }, // Royal Gold
      { fill: '#D97706', glow: 'rgba(217, 119, 6, 0.3)' }, // Warm Amber
      { fill: '#B81D45', glow: 'rgba(184, 29, 69, 0.25)' }, // Ruby Maroon
      { fill: '#FDE68A', glow: 'rgba(253, 230, 138, 0.4)' }, // Champagne Spark
      { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)' }, // Tandoor Flame
    ];

    const particleCount = Math.min(48, Math.max(24, Math.floor(width / 35)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const p = palette[Math.floor(Math.random() * palette.length)];
      const baseRadius = 1.2 + Math.random() * 2.6;
      const baseAlpha = 0.25 + Math.random() * 0.55;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: baseRadius,
        baseRadius,
        speedY: -(0.25 + Math.random() * 0.55),
        speedX: (Math.random() - 0.5) * 0.2,
        swaySpeed: 0.008 + Math.random() * 0.015,
        swayAmplitude: 0.8 + Math.random() * 1.6,
        swayOffset: Math.random() * Math.PI * 2,
        color: p.fill,
        glowColor: p.glow,
        alpha: baseAlpha,
        baseAlpha,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Mouse coordinates for gentle interactive aura
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Render interactive particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Natural rising and sinusoidal swaying
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayAmplitude + p.speedX;
        p.pulsePhase += 0.03;

        // Subtle pulsing size and shimmer alpha
        const pulse = Math.sin(p.pulsePhase);
        p.radius = p.baseRadius * (1 + pulse * 0.2);
        p.alpha = Math.max(0.1, Math.min(0.85, p.baseAlpha + pulse * 0.15));

        // Subtle interactive mouse repulsion
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        // Wrap around boundaries
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Draw glowing particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Living Animated Aurora / Ambient Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-amber-400/20 via-saffron-400/15 to-transparent blur-3xl animate-pulse-slow will-change-transform" />
      <div className="absolute top-1/3 -right-28 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-maroon-600/12 via-rose-500/10 to-transparent blur-3xl animate-pulse-delayed will-change-transform" />
      <div className="absolute -bottom-36 left-1/4 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-saffron-500/15 via-amber-300/12 to-transparent blur-3xl animate-pulse-slow will-change-transform" />

      {/* Royal Subtle Indian Jali Motif Geometric Watermark */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(circle at 15px 15px, #800020 2px, transparent 0), radial-gradient(circle at 45px 45px, #FF9933 1.5px, transparent 0)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Interactive 60fps Golden Embers & Spices Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
