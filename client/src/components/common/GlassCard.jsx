import React from 'react';
import { cn } from '../../utils/cn';

export function GlassCard({ children, className, glow = false, ...props }) {
  return (
    <div 
      className={cn(
        'glass-panel relative overflow-hidden',
        glow && 'before:absolute before:inset-0 before:-z-10 before:bg-ai-violet/5 before:blur-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
