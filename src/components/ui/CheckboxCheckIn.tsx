'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { playCheckInSound } from '@/lib/sound';

interface CheckboxCheckInProps {
  checked: boolean;
  onToggle: (newState: boolean) => void;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

export function CheckboxCheckIn({
  checked,
  onToggle,
  disabled = false,
  size = 'md',
}: CheckboxCheckInProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    const nextState = !checked;
    if (nextState) {
      playCheckInSound();
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }
    onToggle(nextState);
  };

  const dimSizes = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const iconSizes = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={checked ? 'Mark uncompleted' : 'Mark completed today'}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full transition-all duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
        dimSizes,
        checked
          ? 'bg-emerald-600 text-white shadow-sm scale-100'
          : 'border-2 border-border hover:border-neutral-400 bg-transparent text-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800',
        animating && 'animate-pop-in scale-110 ring-4 ring-emerald-500/20',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Check
        className={clsx(
          iconSizes,
          'transition-transform duration-200 stroke-[3]',
          checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        )}
      />
    </button>
  );
}
