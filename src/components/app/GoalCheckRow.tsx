'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Lock, ChevronRight, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import type { Goal } from '@/lib/types';

export function goalTargetSummary(g: Goal): string {
  switch (g.measurementType) {
    case 'DURATION': return `${g.targetValue} ${g.targetUnit || 'min'}`;
    case 'QUANTITY': return `${g.targetValue} ${g.targetUnit || ''}`.trim();
    case 'FREQUENCY': return `${g.frequencyPerWeek ?? g.targetValue}× a week`;
    default: return 'Daily';
  }
}

interface GoalCheckRowProps {
  goal: Goal;
  onToggle?: (goal: Goal) => void;
  busy?: boolean;
  readOnly?: boolean;
  href?: string;
}

// A hairline list row (no card box) — meant to sit inside a divided list.
export function GoalCheckRow({ goal, onToggle, busy, readOnly, href }: GoalCheckRowProps) {
  const done = !!goal.completedToday;
  const isPrivate = goal.visibility === 'PRIVATE';
  const streak = goal.currentStreak || 0;

  const body = (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <h3 className={clsx('font-semibold truncate', done ? 'text-muted-foreground' : 'text-foreground')}>{goal.name}</h3>
        {isPrivate && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
      </div>
      <p className="text-[13px] text-muted-foreground">{goal.category} · {goalTargetSummary(goal)}</p>
    </div>
  );

  return (
    <div className="flex items-center gap-4 py-4">
      <button
        type="button"
        disabled={readOnly || busy}
        onClick={() => onToggle?.(goal)}
        aria-label={done ? 'Completed today' : 'Mark done for today'}
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all',
          done ? 'bg-foreground text-background' : 'border-[1.5px] border-muted-foreground/40 text-transparent hover:border-foreground',
          !readOnly && !done && 'active:scale-90', readOnly && 'cursor-default'
        )}
      >
        <Check className="w-4 h-4 stroke-[3]" />
      </button>

      {href ? <Link href={href} className="min-w-0 flex-1">{body}</Link> : body}

      {streak > 0 && (
        <span className="inline-flex items-center gap-1 text-sm font-bold tnum shrink-0" style={{ color: 'var(--danger)' }}>
          <Flame className="w-3.5 h-3.5 fill-current" /> {streak}
        </span>
      )}
      {href && <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
    </div>
  );
}
