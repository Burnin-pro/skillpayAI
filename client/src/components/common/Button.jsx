import React from 'react';
import { cn } from '../../utils/cn';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  disabled,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-heading font-semibold transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-blue-700 active:bg-blue-800 shadow-md',
    secondary: 'bg-surface text-ink border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'text-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-ink',
    ai: 'bg-ai-violet text-white hover:bg-purple-700 shadow-md shadow-purple-900/20',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 min-h-[36px]',
    md: 'text-base px-4 py-2 min-h-[44px]',
    lg: 'text-lg px-6 py-3 min-h-[52px]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!isLoading && LeftIcon && <LeftIcon className="mr-2 h-5 w-5" aria-hidden="true" />}
      {children}
      {!isLoading && RightIcon && <RightIcon className="ml-2 h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
