'use client';

import React, { useState } from 'react';
import { AccountabilityPartner, Goal } from '@/lib/types';
import { Avatar } from './Avatar';
import { StreakBadge } from './StreakBadge';
import { Button } from './Button';
import { Send, ShieldAlert, HeartHandshake, UserX, CheckCircle2, Clock } from 'lucide-react';
import { NudgeSheet } from './NudgeSheet';

interface PersonCardProps {
  partnership: AccountabilityPartner;
  currentUserId: string;
  onNudge: (partnerId: string, goalName?: string) => void;
  onRescueStreak?: (goalId: string, goalName: string) => void;
  onDisconnect?: (partnerId: string) => void;
}

export function PersonCard({
  partnership,
  currentUserId,
  onNudge,
  onRescueStreak,
  onDisconnect,
}: PersonCardProps) {
  const [nudgeSheetOpen, setNudgeSheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [disconnecting, setDisconnecting] = useState(false);

  const partner = partnership.partnerUser;
  const goals = partnership.goals || [];

  const completedTodayCount = goals.filter(g => g.completedToday).length;
  const totalGoals = goals.length;
  const showUpRate = totalGoals > 0 ? Math.round((completedTodayCount / totalGoals) * 100) : 0;

  const handleOpenNudge = (goal?: Goal) => {
    setSelectedGoal(goal);
    setNudgeSheetOpen(true);
  };

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect from ${partner.name}? Reconnecting with ${partner.name} will have a server-enforced 4-hour cooldown.`)) {
      return;
    }
    if (onDisconnect) {
      onDisconnect(partner.id);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={partner.avatarUrl} name={partner.name} size="lg" />
          <div>
            <h4 className="text-base font-semibold">{partner.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{completedTodayCount} of {totalGoals} checked in today</span>
              <span>•</span>
              <span className="font-semibold text-foreground">{showUpRate}% showed up</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleOpenNudge()}>
            <Send className="w-3.5 h-3.5 text-accent" /> Nudge
          </Button>
          <button
            type="button"
            onClick={handleDisconnect}
            title="Disconnect Partner (4-hour reconnect cooldown)"
            className="p-2 text-muted-foreground hover:text-danger rounded-xl hover:bg-muted transition-colors"
          >
            <UserX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Partner's Partner-Visible Goals List */}
      <div className="space-y-2 pt-2 border-t border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Partner Goals ({goals.length})
        </span>

        {goals.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No partner-visible goals set yet.
          </p>
        ) : (
          <div className="space-y-2">
            {goals.map(g => {
              const isDone = g.completedToday;
              return (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className={`font-semibold ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {g.name}
                      </span>
                      {g.todayCheckIn?.note && (
                        <p className="text-[11px] text-muted-foreground italic mt-0.5">
                          "{g.todayCheckIn.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StreakBadge streak={g.currentStreak || 0} size="sm" />
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => handleOpenNudge(g)}
                        className="px-2 py-1 bg-background hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border rounded-lg text-[11px] font-medium text-foreground transition-colors"
                      >
                        Push
                      </button>
                    )}
                    {!isDone && onRescueStreak && (
                      <button
                        type="button"
                        onClick={() => onRescueStreak(g.id, g.name)}
                        title="Rescue partner streak"
                        className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 rounded-lg transition-colors"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NudgeSheet
        isOpen={nudgeSheetOpen}
        onClose={() => setNudgeSheetOpen(false)}
        partnerName={partner.name}
        partnerAvatar={partner.avatarUrl}
        partnerId={partner.id}
        senderId={currentUserId}
        goalName={selectedGoal?.name}
        goalId={selectedGoal?.id}
        contextType={selectedGoal?.completedToday ? 'CELEBRATION' : 'COMPLETION_PUSH'}
        onNudgeSent={() => {
          onNudge(partner.id, selectedGoal?.name);
        }}
      />
    </div>
  );
}
