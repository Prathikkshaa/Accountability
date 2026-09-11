import React from 'react';
import { Flame } from 'lucide-react';
import { clsx } from 'clsx';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function StreakBadge({ streak, size = 'sm', className }: StreakBadgeProps) {
  if (streak <= 0) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium text-xs text-amber-600 dark:text-amber-400',
        className
      )}
    >
      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
      <span>{streak}d</span>
    </span>
  );
}
