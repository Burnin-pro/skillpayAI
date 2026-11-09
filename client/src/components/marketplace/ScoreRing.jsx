import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function ScoreRing({ score, size = 64, strokeWidth = 6, className }) {
  const numScore = typeof score === 'number' && !isNaN(score) ? Math.min(100, Math.max(0, Math.round(score))) : 92;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (numScore / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border-subtle"
        />
        {/* Animated score circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isNaN(offset) ? 0 : offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-ai-violet drop-shadow-md"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center font-mono">
        <span className="text-lg font-bold leading-none">{numScore}</span>
      </div>
    </div>
  );
}
