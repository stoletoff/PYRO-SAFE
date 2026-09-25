"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  opacity: number;
  maxOpacity: number;
  hue: number;
  decay: number;
}

export function FireBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    if (prefersReducedMotion) {
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    // Number of subtle rising embers (few and lightweight)
    const particleCount = width < 768 ? 20 : 35;
    const particles: Particle[] = [];

    const createParticle = (initialRandomY = false): Particle => {
      const baseRadius = 1 + Math.random() * 2.2;
      return {
        x: Math.random() * width,
        y: initialRandomY ? Math.random() * height : height + Math.random() * 30,
        radius: baseRadius,
        baseRadius,
        speedY: 0.35 + Math.random() * 0.65, // Gentle slow rise
        speedX: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.008 + Math.random() * 0.015,
        opacity: 0,
        maxOpacity: 0.25 + Math.random() * 0.45, // Soft, non-distracting
        // Warm flame palette: 15 (deep orange-red) to 42 (warm golden amber)
        hue: 18 + Math.random() * 24,
        decay: 0.0015 + Math.random() * 0.002,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.66, 2.5);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.angle += p.angularSpeed * delta;
        p.x += (p.speedX + Math.sin(p.angle) * 0.4) * delta;
        p.y -= p.speedY * delta;

        // Fade in when entering from bottom, fade out as it ascends
        const relativeY = p.y / height;
        if (relativeY > 0.8) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.02 * delta);
        } else if (relativeY < 0.25) {
          p.opacity = Math.max(0, p.opacity - p.decay * delta * 2.5);
        } else {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.005 * delta);
        }

        // Draw soft glowing particle
        if (p.opacity > 0.01) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

          // Subtle radial glow around ember
          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius * 2.5
          );
          grad.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${p.opacity})`);
          grad.addColorStop(0.5, `hsla(${p.hue - 5}, 90%, 55%, ${p.opacity * 0.5})`);
          grad.addColorStop(1, `hsla(${p.hue - 10}, 85%, 45%, 0)`);

          ctx.fillStyle = grad;
          ctx.shadowColor = `hsla(${p.hue}, 95%, 55%, ${p.opacity * 0.8})`;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }

        // Reset if offscreen or faded
        if (p.y < -20 || p.opacity <= 0.01 && relativeY < 0.3 || p.x < -30 || p.x > width + 30) {
          particles[i] = createParticle(false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* Мягкие рассеянные огненные пятна света (Ambient Glow) */}
      <div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1100px] h-[450px] rounded-full blur-[140px] opacity-20 bg-gradient-to-t from-orange-600 via-amber-600 to-transparent transition-opacity"
      />
      <div
        className="absolute top-1/4 -right-48 w-[400px] sm:w-[600px] h-[500px] rounded-full blur-[160px] opacity-10 bg-gradient-to-br from-red-600/60 to-orange-500/40"
      />
      <div
        className="absolute -top-32 -left-32 w-[350px] sm:w-[500px] h-[450px] rounded-full blur-[150px] opacity-10 bg-gradient-to-tr from-amber-600/50 to-orange-600/30"
      />

      {/* Тонкая сетка-градиент для высокотехнологичной инженерной глубины */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.06),rgba(255,255,255,0))]" />

      {/* Canvas с нежными парящими искрами (embers) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
