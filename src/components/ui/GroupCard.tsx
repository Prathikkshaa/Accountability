'use client';

import React from 'react';
import { Group } from '@/lib/types';
import { AvatarGroup, Avatar } from './Avatar';
import { Users, Target, ShieldCheck } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  currentUserId: string;
}

export function GroupCard({ group, currentUserId }: GroupCardProps) {
  const memberCount = group.members.length;
  const sharedGoal = group.sharedGoals[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold">{group.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{memberCount} of 15 members</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <AvatarGroup avatars={group.members.map(m => ({ src: m.avatarUrl, name: m.name }))} />
      </div>

      {sharedGoal && (
        <div className="p-4 bg-muted/60 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">{sharedGoal.name}</span>
            </div>
            <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Collective Goal
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Group Progress</span>
              <span className="font-medium text-foreground">
                {sharedGoal.contributions.reduce((acc, c) => acc + c.quantity, 0)} / {sharedGoal.targetValue} {sharedGoal.targetUnit}
              </span>
            </div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-foreground h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (sharedGoal.contributions.reduce((acc, c) => acc + c.quantity, 0) / sharedGoal.targetValue) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
