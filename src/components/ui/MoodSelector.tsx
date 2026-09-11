'use client';

import React from 'react';
import { MoodState } from '@/lib/types';
import { clsx } from 'clsx';

interface MoodSelectorProps {
  selectedMood?: MoodState;
  onSelect: (mood: MoodState) => void;
}

const MOODS: { type: MoodState; label: string; emoji: string }[] = [
  { type: 'BAD', label: 'Tough', emoji: '😞' },
  { type: 'MEH', label: 'Meh', emoji: '😐' },
  { type: 'GOOD', label: 'Good', emoji: '🙂' },
  { type: 'GREAT', label: 'Great', emoji: '😄' },
  { type: 'AMAZING', label: 'Amazing', emoji: '🚀' },
];

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-1 sm:gap-2">
      {MOODS.map(m => {
        const active = selectedMood === m.type;
        return (
          <button
            key={m.type}
            type="button"
            onClick={() => onSelect(m.type)}
            className={clsx(
              'flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-150 flex-1 active:scale-95',
              active
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="text-xl sm:text-2xl leading-none">{m.emoji}</span>
            <span className="text-[11px] font-medium mt-1">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
