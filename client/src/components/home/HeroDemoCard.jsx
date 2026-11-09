import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const DEMO_REQUEST = "I need a responsive restaurant website with menu, contact form and booking section. My budget is $100 and I need it in 4 days.";

export function HeroDemoCard() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(0); 
  // 0: Typing prompt, 1: Scanning & Extracting, 2: Matched Provider
  
  const [typedText, setTypedText] = useState('');
  const [displayedScore, setDisplayedScore] = useState(0);

  // Typing & Phase Progression Loop
  useEffect(() => {
    if (!isPlaying) return;

    let timeout;
    if (phase === 0) {
      if (typedText.length < DEMO_REQUEST.length) {
        timeout = setTimeout(() => {
          setTypedText(DEMO_REQUEST.slice(0, typedText.length + 3));
        }, 28);
      } else {
        timeout = setTimeout(() => setPhase(1), 700);
      }
    } else if (phase === 1) {
      timeout = setTimeout(() => {
        setPhase(2);
      }, 1900);
    } else if (phase === 2) {
      // Score increment counter animation
      let count = 0;
      const targetScore = 94;
      const interval = setInterval(() => {
        count += 3;
        if (count >= targetScore) {
          setDisplayedScore(targetScore);
          clearInterval(interval);
        } else {
          setDisplayedScore(count);
        }
      }, 25);

      timeout = setTimeout(() => {
        clearInterval(interval);
        setPhase(0);
        setTypedText('');
        setDisplayedScore(0);
      }, 6000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => clearTimeout(timeout);
  }, [phase, typedText, isPlaying]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      
      {/* Clean, Modern Card Frame (No Border Glowing Effect) */}
      <div className="relative rounded-2xl bg-white dark:bg-[#0A0F24] border border-slate-200 dark:border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[430px] transition-all duration-300">
        
        {/* Card Content */}
        <div className="flex flex-col gap-4 flex-1">
          
          {/* Header: Clean Title & Play/Pause Control */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
              AI Requirement Analyzer
            </h3>

            {/* Play / Pause Toggle Button */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title={isPlaying ? "Pause animation" : "Play animation"}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-accent" />}
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-1.5 py-0.5">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              phase >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-200 dark:bg-white/10'
            }`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              phase >= 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-slate-200 dark:bg-white/10'
            }`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              phase >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-200 dark:bg-white/10'
            }`} />
          </div>

          {/* User Input Box with Cinematic Laser Scanner Effect */}
          <div className="relative rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-4 min-h-[92px] overflow-hidden flex flex-col justify-between">
            
            {/* Window Dots & Character Counter */}
            <div className="flex items-center justify-between pb-1.5 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400/80" />
                <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                <span className="ml-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Project Scope</span>
              </div>
              <span>{typedText.length} chars</span>
            </div>

            {/* Typed Text with Pulsing Cursor */}
            <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 font-body leading-relaxed min-h-[50px]">
              {typedText}
              {phase === 0 && (
                <span className="inline-block w-1.5 h-3.5 bg-blue-600 dark:bg-blue-400 animate-pulse ml-1 align-middle rounded-xs" />
              )}
            </p>

            {/* Vertical Laser Scanline Beam during Phase 1 */}
            {phase === 1 && (
              <div className="absolute inset-x-0 h-10 pointer-events-none animate-scanline z-20">
                <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <div className="w-full h-8 bg-gradient-to-b from-blue-500/15 to-transparent backdrop-blur-[0.5px]" />
              </div>
            )}
          </div>

          {/* Extracted Data Section */}
          <div className="min-h-[76px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {phase >= 1 ? (
                <motion.div
                  key="extracted-data"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Extracted Data
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono">
                      AI Verified
                    </span>
                  </div>

                  {/* Clean Parameter Pills (Borderless) */}
                  <div className="flex flex-wrap gap-2">
                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                      className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold"
                    >
                      Web Development
                    </motion.span>

                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.22, type: "spring", stiffness: 300, damping: 20 }}
                      className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                    >
                      Budget: $100
                    </motion.span>

                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.34, type: "spring", stiffness: 300, damping: 20 }}
                      className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                    >
                      4 Days Delivery
                    </motion.span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center py-4 bg-slate-50/50 dark:bg-white/5 rounded-xl">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    Awaiting complete scope prompt...
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Matched Provider Card */}
          <div className="min-h-[105px] flex flex-col justify-end">
            <AnimatePresence mode="wait">
              {phase >= 2 ? (
                <motion.div
                  key="matched-provider"
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="relative p-4 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center gap-4 overflow-hidden"
                >
                  {/* Circular Score Dial */}
                  <div className="relative flex items-center justify-center shrink-0 w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-slate-200 dark:text-white/10"
                      />
                      <motion.circle
                        cx="28"
                        cy="28"
                        r="22"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 * (1 - 94 / 100)}
                        strokeLinecap="round"
                        className="text-purple-600 dark:text-purple-400"
                        initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - 94 / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center font-mono">
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-none">
                        {displayedScore}
                      </span>
                    </div>
                  </div>

                  {/* Matched Provider Card: Demo Escrow Provider */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      Alex Rivera
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Senior Full-Stack Escrow Specialist
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium truncate">
                      AI Match: 94% • Available for Escrow
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">Ready to match verified escrow providers...</span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Card Footer: Escrow Assurance (No Replay button) */}
          <div className="flex items-center justify-center pt-2.5 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>PayPal Smart Escrow Certified</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
