import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-foreground text-background hover:opacity-90 shadow-sm focus-visible:ring-foreground',
    secondary: 'bg-muted text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 focus-visible:ring-muted-foreground',
    outline: 'border border-border bg-transparent text-foreground hover:bg-muted focus-visible:ring-border',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-muted-foreground',
    danger: 'bg-danger text-white hover:opacity-90 focus-visible:ring-danger',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
      {children}
    </button>
  );
}
