import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AIBadge } from '../ai/AIBadge';

const SCENARIOS = [
  {
    step: 1,
    title: 'Initial Ask vs Offer',
    customer: 80,
    provider: 115,
    ai: 95,
    gap: 35,
    status: 'negotiating',
    note: 'Initial gap of $35. AI analyzing fair market value...',
  },
  {
    step: 2,
    title: 'AI Fair Pricing Mediation',
    customer: 90,
    provider: 100,
    ai: 95,
    gap: 10,
    status: 'mediating',
    note: 'AI recommends $95 based on 48 completed similar projects.',
  },
  {
    step: 3,
    title: 'Agreement Reached!',
    customer: 95,
    provider: 95,
    ai: 95,
    gap: 0,
    status: 'agreed',
    note: 'Both parties accepted $95! Ready for escrow checkout.',
  },
];

export function DealRoomDemoCard() {
  const [currentStep, setCurrentStep] = useState(1);
  const data = SCENARIOS[currentStep - 1];

  const minRange = 60;
  const maxRange = 130;
  const getPos = (val) => Math.max(5, Math.min(95, ((val - minRange) / (maxRange - minRange)) * 100));

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-ai-violet" />
          <span className="text-xs font-semibold text-ink">Live Deal Mediation</span>
        </div>
        {data.gap === 0 ? (
          <span className="text-xs font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Deal Locked ($95)
          </span>
        ) : (
          <span className="text-xs font-mono font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
            Gap: ${data.gap}
          </span>
        )}
      </div>

      {/* Interactive Step Switcher */}
      <div className="grid grid-cols-3 gap-1.5 bg-background/60 p-1 rounded-lg border border-border-subtle mb-4">
        {SCENARIOS.map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`py-1 px-1.5 text-[11px] rounded font-medium transition-all text-center truncate ${
              currentStep === s.step
                ? 'bg-ai-violet text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            Step {s.step}
          </button>
        ))}
      </div>

      {/* Animated Deal Track */}
      <div className="relative h-20 w-full pt-4 my-auto">
        {/* Track Line */}
        <div className="absolute left-0 right-0 h-2 bg-background rounded-full top-8 border border-border-subtle" />
        
        {/* AI Target Zone Highlight */}
        <div 
          className="absolute top-6 bottom-4 w-12 bg-ai-violet/15 rounded-full border border-ai-violet/30 transition-all duration-300"
          style={{ left: `calc(${getPos(data.ai)}% - 1.5rem)` }}
        />

        {/* Customer Marker (Blue) */}
        <motion.div
          animate={{ left: `${getPos(data.customer)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="absolute top-4 -ml-4 flex flex-col items-center z-10"
        >
          <div className="text-[11px] font-bold text-accent font-mono mb-0.5">${data.customer}</div>
          <div className="w-3.5 h-3.5 rounded-full bg-accent ring-4 ring-surface shadow-md" />
          <div className="text-[9px] text-muted uppercase font-semibold mt-0.5">Offer</div>
        </motion.div>

        {/* Provider Marker */}
        <motion.div
          animate={{ left: `${getPos(data.provider)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="absolute top-4 -ml-4 flex flex-col items-center z-10"
        >
          <div className="text-[11px] font-bold text-ink dark:text-white font-mono mb-0.5">${data.provider}</div>
          <div className="w-3.5 h-3.5 rounded-full bg-ink dark:bg-white ring-4 ring-surface shadow-md" />
          <div className="text-[9px] text-muted uppercase font-semibold mt-0.5">Ask</div>
        </motion.div>

        {/* AI Suggested Marker */}
        <motion.div
          animate={{ left: `${getPos(data.ai)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="absolute -top-1 -ml-5 flex flex-col items-center z-20"
        >
          <div className="text-[11px] font-bold text-ai-violet font-mono mb-0.5">${data.ai}</div>
          <div className="w-4 h-4 rounded-full bg-ai-violet ring-4 ring-surface shadow-[0_0_12px_rgba(124,58,237,0.6)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="text-[9px] text-ai-violet font-bold uppercase mt-0.5">AI Fair</div>
        </motion.div>
      </div>

      {/* AI Mediation Explanation */}
      <div className="bg-ai-violet/5 rounded-xl p-3 flex gap-2 items-start mt-3">
        <Sparkles className="w-4 h-4 text-ai-violet shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          {data.note}
        </p>
      </div>
    </div>
  );
}
