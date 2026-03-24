"use client";

import { useEffect, useRef } from "react";

export function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let w = 0;
    let h = 0;
    let time = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, w, h);

      // Draw 3 aurora bands with different phases
      const bands = [
        { color: [74, 93, 79], offset: 0, amplitude: 40, y: 0.2, opacity: 0.06 },
        { color: [100, 130, 90], offset: 2, amplitude: 50, y: 0.25, opacity: 0.04 },
        { color: [60, 80, 70], offset: 4, amplitude: 35, y: 0.15, opacity: 0.05 },
      ];

      for (const band of bands) {
        const baseY = h * band.y;

        ctx.beginPath();
        ctx.moveTo(0, h);

        // Draw flowing wave across width
        for (let x = 0; x <= w; x += 3) {
          const normalX = x / w;
          const wave1 = Math.sin(normalX * 3 + time + band.offset) * band.amplitude;
          const wave2 = Math.sin(normalX * 1.5 - time * 0.7 + band.offset) * band.amplitude * 0.6;
          const wave3 = Math.sin(normalX * 5 + time * 0.4 + band.offset) * band.amplitude * 0.3;

          // Fade at edges
          const edgeFade = Math.sin(normalX * Math.PI);
          const y = baseY + (wave1 + wave2 + wave3) * edgeFade;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        // Gradient from aurora color to transparent
        const gradient = ctx.createLinearGradient(0, baseY - band.amplitude * 2, 0, baseY + h * 0.4);
        const [r, g, b] = band.color;

        // Pulsing opacity
        const pulse = 0.8 + Math.sin(time * 0.5 + band.offset) * 0.2;
        const opacity = band.opacity * pulse;

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.8 }}
    />
  );
}
