'use client';

import React, { useState } from 'react';
import { AccountabilityPartner, Goal } from '@/lib/types';
import { Avatar } from './Avatar';
import { StreakBadge } from './StreakBadge';
import { Button } from './Button';
import { Send, HeartHandshake, UserX, Check, Clock } from 'lucide-react';
import { NudgeSheet } from './NudgeSheet';
import { clsx } from 'clsx';

interface PersonRowProps {
  partnership: AccountabilityPartner;
  currentUserId: string;
  onNudge: (partnerId: string, goalName?: string) => void;
  onRescueStreak?: (goalId: string, goalName: string) => void;
  onDisconnect?: (partnerId: string) => void;
}

export function PersonRow({
  partnership,
  currentUserId,
  onNudge,
  onRescueStreak,
  onDisconnect,
}: PersonRowProps) {
  const [nudgeSheetOpen, setNudgeSheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();

  const partner = partnership.partnerUser;
  const goals = partnership.goals || [];
  const primaryGoal = goals[0];
  const isCheckedIn = primaryGoal?.completedToday;

  const handleOpenNudge = (goal?: Goal) => {
    setSelectedGoal(goal);
    setNudgeSheetOpen(true);
  };

  return (
    <div className="py-3 border-b border-border/60 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={partner.avatarUrl} name={partner.name} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold tracking-tight text-foreground truncate">{partner.name}</h4>
            {primaryGoal && (
              <StreakBadge streak={primaryGoal.currentStreak || 0} size="sm" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            {primaryGoal ? (
              <>
                <span className="font-medium text-foreground/90">{primaryGoal.name}</span>
                {isCheckedIn ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Check className="w-3 h-3 stroke-[3]" /> checked in
                  </span>
                ) : (
                  <span className="text-muted-foreground">· not checked in yet</span>
                )}
              </>
            ) : (
              <span>Accountability partner</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => handleOpenNudge(primaryGoal)}
          className="px-3 py-1 text-xs font-medium rounded-full border border-border bg-background hover:bg-muted text-foreground transition-colors"
        >
          Nudge
        </button>

        {onDisconnect && (
          <button
            type="button"
            onClick={() => onDisconnect(partner.id)}
            title="Disconnect"
            className="p-1.5 text-muted-foreground hover:text-danger rounded-full transition-colors"
          >
            <UserX className="w-3.5 h-3.5" />
          </button>
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
