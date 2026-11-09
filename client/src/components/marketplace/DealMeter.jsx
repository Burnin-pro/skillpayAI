import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { AIBadge } from '../ai/AIBadge';

export function DealMeter({ 
  customerOffer, 
  providerAsk, 
  aiSuggestion, 
  minRange = 50, 
  maxRange = 150 
}) {
  const gap = providerAsk - customerOffer;
  
  // Calculate positions as percentages
  const getPos = (val) => Math.max(0, Math.min(100, ((val - minRange) / (maxRange - minRange)) * 100));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-semibold">Live Deal Meter</h3>
        {gap <= 0 ? (
          <span className="text-success text-sm font-bold flex items-center gap-1">
            <Scale className="w-4 h-4" /> Agreement Reached
          </span>
        ) : (
          <span className="text-muted text-sm font-mono">Gap: ${gap}</span>
        )}
      </div>

      <div className="relative h-16 w-full pt-6">
        {/* Track */}
        <div className="absolute left-0 right-0 h-2 bg-surface rounded-full top-8 border border-border-subtle" />
        
        {/* AI Suggestion Zone */}
        {aiSuggestion && (
          <div 
            className="absolute top-7 bottom-0 w-16 bg-ai-violet/10 rounded-full border border-ai-violet/20"
            style={{ left: `calc(${getPos(aiSuggestion)}% - 2rem)` }}
          />
        )}

        {/* Customer Marker (Blue) */}
        <motion.div
          animate={{ left: `${getPos(customerOffer)}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="absolute top-4 -ml-4 flex flex-col items-center"
        >
          <div className="text-xs font-bold text-accent mb-1 font-mono">${customerOffer}</div>
          <div className="w-3 h-3 rounded-full bg-accent ring-4 ring-background shadow-md" />
          <div className="text-[10px] text-muted mt-1 uppercase font-semibold">You</div>
        </motion.div>

        {/* Provider Marker (Dark) */}
        <motion.div
          animate={{ left: `${getPos(providerAsk)}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="absolute top-4 -ml-4 flex flex-col items-center"
        >
          <div className="text-xs font-bold text-ink mb-1 font-mono">${providerAsk}</div>
          <div className="w-3 h-3 rounded-full bg-ink ring-4 ring-background shadow-md dark:bg-white" />
          <div className="text-[10px] text-muted mt-1 uppercase font-semibold">Provider</div>
        </motion.div>

        {/* AI Marker (Violet) */}
        {aiSuggestion && (
          <motion.div
            animate={{ left: `${getPos(aiSuggestion)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="absolute -top-1 -ml-6 flex flex-col items-center"
          >
            <div className="text-xs font-bold text-ai-violet mb-1 font-mono">${aiSuggestion}</div>
            <div className="w-4 h-4 rounded-full bg-ai-violet ring-4 ring-background shadow-[0_0_10px_rgba(124,58,237,0.5)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <div className="text-[10px] text-ai-violet mt-1 uppercase font-semibold">AI</div>
          </motion.div>
        )}
      </div>

      {aiSuggestion && gap > 0 ? (
        <div className="bg-ai-violet/5 border border-ai-violet/20 rounded-xl p-3 flex gap-2 items-start mt-2">
          <AIBadge label="AI Analysis" className="shrink-0" />
          <p className="text-xs text-muted">
            The fair market value is around ${aiSuggestion}. We suggest meeting closer to the middle to reach an agreement quickly.
          </p>
        </div>
      ) : gap <= 0 ? (
        <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex gap-2 items-start mt-2">
          <AIBadge label="Deal Locked" className="shrink-0 bg-success/20 text-success border-success/30" />
          <p className="text-xs text-ink font-medium">
            Both parties agreed at ${customerOffer}. Ready for contract signing & payment escrow!
          </p>
        </div>
      ) : null}
    </div>
  );
}
