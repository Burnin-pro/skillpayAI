import React from 'react';
import { cn } from '../../utils/cn';

export function Chip({ 
  label, 
  onRemove, 
  className,
  variant = 'default',
  ...props 
}) {
  const variants = {
    default: 'bg-surface border border-border-subtle text-ink',
    ai: 'bg-ai-violet/10 border border-ai-violet/20 text-ai-violet dark:text-ai-light',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus-ring"
          aria-label={`Remove ${label}`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
