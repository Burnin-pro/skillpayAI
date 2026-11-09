import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({ 
  children, 
  variant = 'neutral',
  className
}) {
  const variants = {
    neutral: 'bg-muted/10 text-muted',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    ai: 'bg-ai-violet/10 text-ai-violet dark:text-ai-light border border-ai-violet/20',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
}
