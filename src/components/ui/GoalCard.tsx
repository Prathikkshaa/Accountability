'use client';

import React, { useState } from 'react';
import { Goal, MoodState } from '@/lib/types';
import { CheckboxCheckIn } from './CheckboxCheckIn';
import { StreakBadge } from './StreakBadge';
import { MoodSelector } from './MoodSelector';
import { Lock, Eye, MessageSquare, Camera, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface GoalCardProps {
  goal: Goal;
  userId: string;
  onCheckInToggle: (goalId: string, completed: boolean, extra?: { note?: string; mood?: MoodState; proofPhotoUrl?: string }) => void;
  onRestart?: (goalId: string) => void;
}

export function GoalCard({ goal, userId, onCheckInToggle, onRestart }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(goal.todayCheckIn?.note || '');
  const [mood, setMood] = useState<MoodState | undefined>(goal.todayCheckIn?.mood);
  const [proofUrl, setProofUrl] = useState<string | undefined>(goal.todayCheckIn?.proofPhotoUrl);

  const isCompleted = !!goal.completedToday;

  const handleToggle = (nextState: boolean) => {
    onCheckInToggle(goal.id, nextState, { note, mood, proofPhotoUrl: proofUrl });
  };

  const handleSaveDetails = () => {
    if (isCompleted) {
      onCheckInToggle(goal.id, true, { note, mood, proofPhotoUrl: proofUrl });
    }
  };

  const getMeasurementLabel = () => {
    switch (goal.measurementType) {
      case 'DURATION':
        return `${goal.targetValue} ${goal.targetUnit || 'min'}`;
      case 'QUANTITY':
        return `${goal.targetValue} ${goal.targetUnit || 'units'}`;
      case 'FREQUENCY':
        return `${goal.targetValue}x / week`;
      case 'BINARY':
      default:
        return 'Daily Completion';
    }
  };

  return (
    <div
      className={clsx(
        'group relative bg-card border rounded-2xl p-4 transition-all duration-200 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700',
        isCompleted ? 'border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <CheckboxCheckIn checked={isCompleted} onToggle={handleToggle} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={clsx(
                  'text-base font-semibold transition-colors truncate',
                  isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {goal.name}
              </h4>

              {goal.visibility === 'PRIVATE' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/40">
                  <Lock className="w-3 h-3" /> Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  <Eye className="w-3 h-3 opacity-60" /> Partner Visible
                </span>
              )}
            </div>

            {goal.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted rounded-md text-foreground/80">{goal.category}</span>
              <span>•</span>
              <span>{getMeasurementLabel()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StreakBadge streak={goal.currentStreak || 0} size="sm" />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 p-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded contextual details: optional proof photo, note, mood, and restart button */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4 animate-pop-in">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Optional Note (Human Context)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={handleSaveDetails}
              placeholder="e.g. Was exhausted today but still showed up."
              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">How did it feel? (Optional Mood)</label>
            <MoodSelector
              selectedMood={mood}
              onSelect={m => {
                setMood(m);
                if (isCompleted) onCheckInToggle(goal.id, true, { note, mood: m, proofPhotoUrl: proofUrl });
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            {onRestart && (
              <button
                type="button"
                onClick={() => onRestart(goal.id)}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Goal (Preserves History)
              </button>
            )}

            {isCompleted && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Checked in today</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
