"use client";

import React, { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  drift: number;
  driftSpeed: number;
  opacity: number;
  maxOpacity: number;
  color: string;
}

export function FireBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Embers palette: bright glowing fire colors
    const colors = [
      "255, 120, 20",  // Bright fiery orange
      "255, 160, 40",  // Golden flame
      "255, 80, 20",   // Deep orange-red
      "251, 191, 36",  // Warm amber
      "249, 115, 22",  // Flame orange
      "239, 68, 68",   // Warm red ember
    ];

    const count = width < 768 ? 28 : 55;
    const embers: Ember[] = [];

    const createEmber = (randomY = false): Ember => {
      const radius = 1.2 + Math.random() * 2.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 10 + Math.random() * 40,
        radius,
        speedY: 0.5 + Math.random() * 1.1,
        speedX: (Math.random() - 0.5) * 0.4,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.01 + Math.random() * 0.02,
        opacity: randomY ? 0.2 + Math.random() * 0.6 : 0,
        maxOpacity: 0.45 + Math.random() * 0.45, // Clearly visible glow
        color,
      };
    };

    for (let i = 0; i < count; i++) {
      embers.push(createEmber(true));
    }

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];

        e.drift += e.driftSpeed * delta;
        e.x += (e.speedX + Math.sin(e.drift) * 0.6) * delta;
        e.y -= e.speedY * delta;

        // Fade in when rising from bottom, gentle fade out towards top
        if (e.y > height * 0.75) {
          e.opacity = Math.min(e.maxOpacity, e.opacity + 0.02 * delta);
        } else if (e.y < height * 0.2) {
          e.opacity = Math.max(0, e.opacity - 0.008 * delta);
        } else {
          e.opacity = Math.min(e.maxOpacity, e.opacity + 0.005 * delta);
        }

        if (e.opacity > 0.02) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${e.color}, ${e.opacity})`;
          ctx.shadowColor = `rgba(${e.color}, ${e.opacity * 0.95})`;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }

        // Reset ember if it left screen or dissolved
        if (e.y < -10 || e.opacity <= 0.01 && e.y < height * 0.3 || e.x < -20 || e.x > width + 20) {
          embers[i] = createEmber(false);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Глубокое огненное свечение снизу (Flame Glow at bottom) */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[130%] h-[380px] bg-gradient-to-t from-orange-600/25 via-amber-600/15 to-transparent blur-3xl"
      />

      {/* 2. Левое огненное пятно (Warm Red-Orange Aura) */}
      <div
        className="absolute -bottom-10 -left-20 w-[420px] sm:w-[550px] h-[400px] rounded-full bg-gradient-to-tr from-red-600/20 via-orange-600/15 to-transparent blur-[90px]"
      />

      {/* 3. Правое огненное пятно (Amber-Gold Aura) */}
      <div
        className="absolute -bottom-10 -right-20 w-[420px] sm:w-[550px] h-[400px] rounded-full bg-gradient-to-tl from-amber-600/20 via-orange-500/15 to-transparent blur-[90px]"
      />

      {/* 4. Верхний мягкий ореол тепла */}
      <div
        className="absolute -top-32 right-1/4 w-[500px] h-[280px] rounded-full bg-orange-500/10 blur-[110px]"
      />

      {/* 5. Canvas с живыми поднимающимися искрами огня (Embers) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
