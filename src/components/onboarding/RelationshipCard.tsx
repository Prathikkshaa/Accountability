'use client';

import React from 'react';
import { PersonState } from '@/lib/onboardingState';
import { V2Avatar } from './V2Avatar';
import { Link2, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface RelationshipCardProps {
  personA: PersonState;
  personB?: PersonState;
  inviteCode?: string;
  partnerJoined?: boolean;
}

export function RelationshipCard({
  personA,
  personB,
  inviteCode,
  partnerJoined = false,
}: RelationshipCardProps) {
  return (
    <div className="w-full space-y-4">
      {/* Visual Relationship Header Pair */}
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="flex flex-col items-center gap-1.5">
          <V2Avatar avatarId={personA.avatarId} name={personA.name} size="lg" />
          <span className="text-xs font-bold text-foreground">{personA.name.toUpperCase()}</span>
          <span className="text-[10px] text-muted-foreground font-semibold">YOU</span>
        </div>

        {/* Connecting Line & Metaphor Symbol */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-0.5 bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20 rounded-full" />
          <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs shadow-xs">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Connected
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          {partnerJoined && personB ? (
            <>
              <V2Avatar avatarId={personB.avatarId} name={personB.name} size="lg" />
              <span className="text-xs font-bold text-foreground">{personB.name.toUpperCase()}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> JOINED
              </span>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                +
              </div>
              <span className="text-xs font-bold text-muted-foreground">YOUR PERSON</span>
              <span className="text-[10px] text-muted-foreground">
                {inviteCode ? `CODE: ${inviteCode}` : 'WAITING'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Parallel Commitment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {/* Person A Commitment */}
        <div className="p-5 rounded-2xl border border-border bg-background space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {personA.name}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
              {personA.commitmentTiming || 'Daily'}
            </span>
          </div>

          <h4 className="text-lg font-bold tracking-tight text-foreground">{personA.goal}</h4>

          <div className="text-xs font-semibold text-foreground/90">
            {personA.commitmentAmount} · {personA.commitmentFrequency}
          </div>

          <p className="text-xs text-muted-foreground italic border-l-2 border-foreground/30 pl-2 py-0.5">
            "{personA.reason}"
          </p>
        </div>

        {/* Person B Commitment */}
        {partnerJoined && personB ? (
          <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.03] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {personB.name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Partner Goal
              </span>
            </div>

            <h4 className="text-lg font-bold tracking-tight text-foreground">{personB.goal}</h4>

            <div className="text-xs font-semibold text-foreground/90">
              {personB.commitmentAmount} · {personB.commitmentFrequency}
            </div>

            <p className="text-xs text-muted-foreground italic border-l-2 border-emerald-500/30 pl-2 py-0.5">
              "{personB.reason}"
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col justify-center items-center text-center space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {inviteCode ? `Invite Code: ${inviteCode}` : 'Waiting for partner...'}
            </span>
            <p className="text-xs text-muted-foreground max-w-xs">
              When your partner joins, their independent goal and commitment will display here alongside yours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
