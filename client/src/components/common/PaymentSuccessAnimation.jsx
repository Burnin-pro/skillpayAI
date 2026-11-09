import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Web Audio API synthesizer for the real payment confirmation chime.
 * Emulates the iconic ascending harmonic bell chord heard in Apple Pay, Google Pay, and PayPal.
 * Zero external audio files, zero latency, zero CORS or network dependencies.
 */
function playPaymentChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Ascending harmonic chime: C5 -> E5 -> G5 -> C6
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.20, vol: 0.14 }, // C5
      { freq: 659.25, time: 0.07, dur: 0.24, vol: 0.17 }, // E5
      { freq: 783.99, time: 0.14, dur: 0.32, vol: 0.22 }, // G5
      { freq: 1046.50, time: 0.22, dur: 0.65, vol: 0.26 }  // C6 (bright bell ring)
    ];

    notes.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + time);
      gainNode.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + time + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

export function PaymentSuccessAnimation() {
  // Automatically play real payment chime right as the checkmark draws in (at 280ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      playPaymentChime();
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Generate 26 festive confetti burst particles (dots, rotating ribbons, and sparkle stars)
  const particles = Array.from({ length: 26 }).map((_, i) => {
    const angle = (i / 26) * 360 + (Math.sin(i * 1.5) * 14);
    const rad = (angle * Math.PI) / 180;
    const distance = 85 + (i % 5) * 14;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    
    // Confetti palette: emerald, mint, cyan, gold, royal indigo, fuchsia
    const colors = ['#10b981', '#34d399', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#22c55e'];
    const color = colors[i % colors.length];
    
    const type = i % 3 === 0 ? 'ribbon' : i % 3 === 1 ? 'star' : 'dot';
    const size = type === 'dot' ? 6 : type === 'star' ? 9 : 8;

    return { id: i, x, y, size, color, type };
  });

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Animation Stage - Plays automatically once */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Halo behind the badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.3, 1.1], opacity: [0, 0.7, 0.4] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute w-44 h-44 rounded-full bg-emerald-500/25 blur-2xl pointer-events-none"
        />

        {/* 1. Ripple Wave 1 (Large Outer Shockwave) */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0.8 }}
          animate={{ scale: [0.75, 1.8, 2.3], opacity: [0.8, 0.35, 0] }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-28 h-28 rounded-full bg-emerald-500/20 pointer-events-none"
        />

        {/* 2. Ripple Wave 2 (Middle Border Pulse) */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0.9 }}
          animate={{ scale: [0.75, 1.45, 1.9], opacity: [0.9, 0.45, 0] }}
          transition={{ duration: 1.2, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-28 h-28 rounded-full border-2 border-emerald-400/50 pointer-events-none"
        />

        {/* 3. Ripple Wave 3 (Tight Inner Pulse) */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0.8 }}
          animate={{ scale: [0.75, 1.2, 1.5], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 0.9, delay: 0.24, ease: "easeOut" }}
          className="absolute w-28 h-28 rounded-full border border-teal-300/40 pointer-events-none"
        />

        {/* 4. Confetti Particles Bursting Outwards */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.3, 0.9, 0],
              opacity: [1, 1, 0.85, 0],
              rotate: [0, p.type === 'ribbon' ? 260 : 120]
            }}
            transition={{
              duration: 0.95,
              delay: 0.32 + (p.id % 4) * 0.04,
              ease: [0.25, 1, 0.5, 1]
            }}
            style={{
              backgroundColor: p.color,
              width: p.type === 'ribbon' ? p.size * 1.6 : p.size,
              height: p.type === 'ribbon' ? p.size * 0.6 : p.size,
              borderRadius: p.type === 'dot' ? '9999px' : p.type === 'ribbon' ? '2px' : '3px',
              boxShadow: `0 2px 6px ${p.color}55`
            }}
            className="absolute pointer-events-none z-0"
          />
        ))}

        {/* 5. Main Green Checkmark Circle Badge (Spring pop physics) */}
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: [0, 1.15, 0.96, 1], rotate: 0, opacity: 1 }}
          transition={{
            duration: 0.55,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-2 shadow-[0_12px_40px_rgba(16,185,129,0.45)] ring-4 ring-emerald-500/25 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95"
        >
          {/* Top gloss highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none" />

          {/* SVG Animated Circle Track and Checkmark Path */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Track Base */}
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="4"
            />

            {/* Outer Drawing Circle Ring (sweeps 360 deg) */}
            <motion.circle
              cx="50"
              cy="50"
              r="43"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ pathLength: 1, rotate: -90 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ transformOrigin: "center" }}
            />

            {/* Iconic Checkmark Path (Traces out from left to corner to right tip) */}
            <motion.path
              d="M 28 50 L 43 65 L 72 34"
              stroke="#ffffff"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { delay: 0.28, duration: 0.42, ease: [0.65, 0, 0.35, 1] },
                opacity: { delay: 0.26, duration: 0.05 }
              }}
            />
          </svg>

          {/* Diagonal Glass Sheen Sweep */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            animate={{ opacity: [0, 0.7, 0], x: [-70, 70] }}
            transition={{ delay: 0.65, duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none transform -rotate-45"
          />
        </motion.div>
      </div>
    </div>
  );
}
