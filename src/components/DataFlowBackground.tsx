import React, { useEffect, useRef } from 'react';

export default function DataFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays (4k support)
    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Get the device pixel ratio, falling back to 1.
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        return { width: rect.width, height: rect.height };
      }
      return { width: window.innerWidth, height: window.innerHeight };
    };

    let { width, height } = setCanvasSize();
    
    const resize = () => {
      const dims = setCanvasSize();
      width = dims.width;
      height = dims.height;
    };
    
    window.addEventListener('resize', resize);

    // Network Node Particles
    let particles: { x: number, y: number, vx: number, vy: number, size: number, opacity: number, glow: number }[] = [];
    const particleCount = 70; 

    // Data Streams
    let streams: { x: number, y: number, speed: number, length: number, opacity: number }[] = [];
    const streamCount = 15;

    // Initialize network nodes
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 + 0.1, // Slight downward drift
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        glow: Math.random() * 10 + 5
      });
    }

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 3 + 1,
        length: Math.random() * 100 + 50,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // --- 1. Draw Deep Cyber Background & Cinematic Lighting ---
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
      gradient.addColorStop(0, 'rgba(5, 10, 20, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // --- 2. Draw Subtle Grid ---
      ctx.strokeStyle = 'rgba(0, 194, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offsetX = (time * 10) % gridSize;
      const offsetY = (time * 10) % gridSize;
      
      ctx.beginPath();
      for (let x = -offsetX; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = -offsetY; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // --- 3. Draw Data Streams (Falling matrix-like lines) ---
      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y > height + s.length) {
          s.y = -s.length;
          s.x = Math.random() * width;
        }
        
        const streamGrad = ctx.createLinearGradient(s.x, s.y - s.length, s.x, s.y);
        streamGrad.addColorStop(0, 'rgba(0, 194, 255, 0)');
        streamGrad.addColorStop(0.8, `rgba(0, 194, 255, ${s.opacity})`);
        streamGrad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity * 1.5})`);
        
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.length);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // --- 4. Draw Floating Glowing Particles & Connections ---
      ctx.shadowBlur = 0; // Reset
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Node Glow Effect
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = 'rgba(0, 194, 255, 0.8)';
        ctx.fillStyle = `rgba(0, 194, 255, ${p.opacity})`;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow for lines to keep them crisp

        // Connect proximal nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const connectionDistance = 150;
          if (dist < connectionDistance) {
            const lineOpacity = (1 - dist / connectionDistance) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Add subtle purple accent to some lines for cyber feel
            if (i % 5 === 0) {
               ctx.strokeStyle = `rgba(168, 85, 247, ${lineOpacity * 1.2})`;
            } else {
               ctx.strokeStyle = `rgba(0, 194, 255, ${lineOpacity})`;
            }
            
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      
      // --- 5. Vignette Overlay (Darken Edges) ---
      const vignette = ctx.createRadialGradient(width/2, height/2, width * 0.4, width/2, height/2, width * 0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      if (!document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        render();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen h-[100vh] z-0 overflow-hidden pointer-events-none bg-[#02050A]">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-80"
        aria-hidden="true"
        role="presentation"
      />
    </div>
  );
}
