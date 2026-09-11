'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Clock, Repeat, Quote, Sun, Sunrise, Sunset, CalendarDays } from 'lucide-react';
import { V2Avatar } from './V2Avatar';

interface CommitmentCardProps {
  name?: string;
  avatarId?: string;
  goal?: string;
  amount?: string;
  frequency?: string;
  timing?: string;
  reason?: string;
  className?: string;
}

const timingIcon = (timing?: string) => {
  switch (timing) {
    case 'Morning':
      return Sunrise;
    case 'Afternoon':
      return Sun;
    case 'Evening':
      return Sunset;
    default:
      return CalendarDays;
  }
};

/**
 * The emotional through-line of onboarding: a single "promise" card that fills
 * in as the person moves through the flow — goal, then amount, then reason,
 * then their face. Watching it grow is the momentum beat.
 */
export function CommitmentCard({
  name,
  avatarId = 'av_1',
  goal,
  amount,
  frequency,
  timing,
  reason,
  className,
}: CommitmentCardProps) {
  const TimingIcon = timingIcon(timing);
  const hasIdentity = !!name?.trim();

  return (
    <div
      className={clsx(
        'relative w-full rounded-3xl border border-border bg-card text-card-foreground p-6 shadow-sm overflow-hidden',
        className
      )}
    >
      {/* soft warm wash in the corner — the only color, kept faint */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-[0.10] blur-2xl"
        style={{ backgroundColor: 'var(--warm)' }}
      />

      <div className="relative flex items-center gap-3">
        {hasIdentity ? (
          <V2Avatar avatarId={avatarId} name={name} size="md" className="animate-soft-pop" />
        ) : (
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-border shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {hasIdentity ? `${name}'s promise` : 'Your promise'}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasIdentity ? 'Kept, one day at a time.' : 'It takes shape as you go.'}
          </p>
        </div>
      </div>

      <div className="relative mt-5 min-h-[2.25rem]">
        {goal ? (
          <h3 key={goal} className="text-2xl font-bold tracking-tight leading-tight animate-rise-in">
            {goal}
          </h3>
        ) : (
          <div className="h-7 w-40 rounded-lg bg-muted" />
        )}
      </div>

      {(amount || frequency || timing) && (
        <div className="relative mt-3 flex flex-wrap gap-2 animate-fade-in">
          {amount && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted">
              <Clock className="w-3.5 h-3.5" /> {amount}
            </span>
          )}
          {frequency && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted">
              <Repeat className="w-3.5 h-3.5" /> {frequency}
            </span>
          )}
          {timing && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted">
              <TimingIcon className="w-3.5 h-3.5" /> {timing}
            </span>
          )}
        </div>
      )}

      {reason && (
        <div className="relative mt-4 flex gap-2 animate-rise-in">
          <Quote className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warm)' }} />
          <p className="text-sm text-muted-foreground italic leading-relaxed">{reason}</p>
        </div>
      )}
    </div>
  );
}
