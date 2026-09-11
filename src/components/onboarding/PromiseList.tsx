'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Clock, Repeat, Quote } from 'lucide-react';

export interface Promise {
  label: string;
  amount: string;
  freq: string;
}

interface PromiseListProps {
  name?: string;
  timing?: string;
  reason?: string;
  promises: Promise[];
  className?: string;
}

/** Read-only summary of everything the person committed to. Used on the
 *  final review and celebration screens. */
export function PromiseList({ name, timing, reason, promises, className }: PromiseListProps) {
  const who = name?.trim() ? `${name.split(' ')[0]}'s` : 'Your';

  return (
    <div
      className={clsx(
        'relative w-full rounded-3xl border border-border bg-card text-card-foreground p-6 shadow-sm overflow-hidden',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-[0.10] blur-2xl"
        style={{ backgroundColor: 'var(--warm)' }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {who} {promises.length > 1 ? 'promises' : 'promise'}
        </p>
        {timing && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted">{timing}</span>
        )}
      </div>

      <div className="relative mt-4 divide-y divide-border/60">
        {promises.map((p, i) => (
          <div key={p.label + i} className="py-3 first:pt-0 last:pb-0 animate-rise-in">
            <h4 className="text-lg font-bold tracking-tight leading-tight">{p.label}</h4>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted">
                <Clock className="w-3.5 h-3.5" /> {p.amount}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted">
                <Repeat className="w-3.5 h-3.5" /> {p.freq}
              </span>
            </div>
          </div>
        ))}
      </div>

      {reason && (
        <div className="relative mt-4 pt-4 border-t border-border/60 flex gap-2">
          <Quote className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warm)' }} />
          <p className="text-sm text-muted-foreground italic leading-relaxed">{reason}</p>
        </div>
      )}
    </div>
  );
}
