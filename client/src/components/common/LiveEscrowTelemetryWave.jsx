import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Activity, Sparkles, TrendingUp } from 'lucide-react';

export function LiveEscrowTelemetryWave({ released = 0, inEscrow = 0, height = 150 }) {
  const canvasRef = useRef(null);
  const [telemetryTick, setTelemetryTick] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      step += 0.04;
      const width = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, h);

      // Create rich gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(0, 121, 193, 0.35)');
      grad.addColorStop(0.5, 'rgba(108, 92, 231, 0.15)');
      grad.addColorStop(1, 'rgba(0, 48, 135, 0.0)');

      // Draw secondary background wave
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= width; x += 10) {
        const y = h * 0.62 + Math.sin(x * 0.015 + step * 0.7) * 14 + Math.cos(x * 0.03 - step * 0.5) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(108, 92, 231, 0.08)';
      ctx.fill();

      // Draw primary active wave
      ctx.beginPath();
      ctx.moveTo(0, h);
      const points = [];
      for (let x = 0; x <= width; x += 8) {
        const y = h * 0.52 + Math.sin(x * 0.02 + step) * 20 + Math.sin(x * 0.04 - step * 1.2) * 10;
        points.push({ x, y });
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw active crest stroke
      ctx.beginPath();
      points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = '#0079C1';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0079C1';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw live pulsing telemetry beads along the wave
      const beadIndex = Math.floor(((Math.sin(step) + 1) / 2) * (points.length - 1));
      const bead = points[beadIndex];
      if (bead) {
        ctx.beginPath();
        ctx.arc(bead.x, bead.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Outer ripple ring
        ctx.beginPath();
        ctx.arc(bead.x, bead.y, 10 + (Math.sin(step * 4) + 1) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Occasional telemetry counter tick
    const tickInterval = setInterval(() => {
      setTelemetryTick(prev => (prev + 1) % 100);
    }, 1500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(tickInterval);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Live Video / Stream Telemetry Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono px-1">
        <span className="flex items-center gap-1.5 text-emerald-500 font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <Activity className="w-3 h-3 text-emerald-500 inline" />
          STREAMING ESCROW TELEMETRY
        </span>
        <span className="text-slate-400 font-semibold">
          60 FPS • LIVE STREAM
        </span>
      </div>

      {/* Canvas Video Waveform Container */}
      <div 
        className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-[#001435] to-slate-950 border border-cyan-500/20 shadow-inner group"
        style={{ height: `${height}px` }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Video stream scanlines & vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/60" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />

        {/* Floating Telemetry Stats Badge */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-cyan-400/30 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            SECURE VAULT ACTIVE
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            ${released > 0 ? released.toFixed(2) : '0.00'} SETTLED
          </span>
        </div>

        {/* Bottom Right Floating Badge */}
        <div className="absolute bottom-2.5 right-3 pointer-events-none flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>PAYPAL SANDBOX VERIFIED</span>
        </div>
      </div>
    </div>
  );
}

