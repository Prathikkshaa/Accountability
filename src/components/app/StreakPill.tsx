'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { clsx } from 'clsx';

export function StreakPill({ count, className }: { count?: number; className?: string }) {
  const n = count || 0;
  const active = n > 0;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
        active ? 'bg-danger/10 text-danger' : 'bg-muted text-muted-foreground',
        className
      )}
      title={`${n} day streak`}
    >
      <Flame className={clsx('w-3.5 h-3.5', active && 'fill-current')} />
      {n}
    </span>
  );
}
