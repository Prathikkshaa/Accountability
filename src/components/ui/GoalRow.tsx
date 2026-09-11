'use client';

import React, { useState } from 'react';
import { Goal, MoodState } from '@/lib/types';
import { CheckboxCheckIn } from './CheckboxCheckIn';
import { StreakBadge } from './StreakBadge';
import { MoodSelector } from './MoodSelector';
import { Lock, ChevronDown, ChevronUp, RotateCcw, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

interface GoalRowProps {
  goal: Goal;
  onCheckInToggle: (goalId: string, completed: boolean, extra?: { note?: string; mood?: MoodState }) => void;
  onRestart?: (goalId: string) => void;
}

export function GoalRow({ goal, onCheckInToggle, onRestart }: GoalRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(goal.todayCheckIn?.note || '');
  const [mood, setMood] = useState<MoodState | undefined>(goal.todayCheckIn?.mood);

  const isCompleted = !!goal.completedToday;

  const handleToggle = (nextState: boolean) => {
    onCheckInToggle(goal.id, nextState, { note, mood });
  };

  const handleSaveDetails = () => {
    if (isCompleted) {
      onCheckInToggle(goal.id, true, { note, mood });
    }
  };

  const getSubtext = () => {
    switch (goal.measurementType) {
      case 'DURATION':
        return `${goal.targetValue} ${goal.targetUnit || 'min'}`;
      case 'QUANTITY':
        return `${goal.targetValue} ${goal.targetUnit || 'units'}`;
      case 'FREQUENCY':
        return `${goal.targetValue}× this week`;
      case 'BINARY':
      default:
        return goal.category;
    }
  };

  return (
    <div
      className={clsx(
        'group border-b border-border/60 py-3.5 px-1 transition-all duration-200',
        isCompleted && 'opacity-70'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Name & subtext */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            <h4
              className={clsx(
                'text-base font-medium tracking-tight transition-colors truncate',
                isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
            >
              {goal.name}
            </h4>

            {goal.visibility === 'PRIVATE' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                <Lock className="w-3 h-3 opacity-60" /> Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>{getSubtext()}</span>
            {goal.todayCheckIn?.note && (
              <>
                <span>•</span>
                <span className="italic truncate max-w-[200px]">"{goal.todayCheckIn.note}"</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Streak & Checkbox */}
        <div className="flex items-center gap-4 shrink-0">
          <StreakBadge streak={goal.currentStreak || 0} size="sm" />
          <CheckboxCheckIn checked={isCompleted} onToggle={handleToggle} size="md" />
        </div>
      </div>

      {/* Progressive disclosure on tap */}
      {expanded && (
        <div className="mt-3 pt-3 space-y-3 animate-fade-in text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Note for today
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={handleSaveDetails}
              placeholder="e.g. Was exhausted today but still showed up."
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Mood</label>
            <MoodSelector
              selectedMood={mood}
              onSelect={m => {
                setMood(m);
                if (isCompleted) onCheckInToggle(goal.id, true, { note, mood: m });
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
            {onRestart && (
              <button
                type="button"
                onClick={() => onRestart(goal.id)}
                className="hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Restart goal
              </button>
            )}
            <span>Tap goal to close details</span>
          </div>
        </div>
      )}
    </div>
  );
}
