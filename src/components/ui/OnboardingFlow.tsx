'use client';

import React, { useState } from 'react';
import { Target, Sparkles, UserPlus, ArrowRight, Check } from 'lucide-react';
import { Button } from './Button';

interface OnboardingFlowProps {
  onComplete: (firstGoalName: string) => void;
  onOpenInvite: () => void;
}

export function OnboardingFlow({ onComplete, onOpenInvite }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGoal, setSelectedGoal] = useState('Morning Run');

  const popular = [
    'Morning Run',
    'Workout Session',
    'Deep Study',
    'Read Books',
    'Meditate',
    'Journaling',
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 animate-pop-in">
      {step === 1 ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to Accountability
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">What do you want to change?</h2>
            <p className="text-xs text-muted-foreground">
              Choose your first goal. People fail when nobody notices when they stop showing up.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {popular.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGoal(g)}
                className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                  selectedGoal === g
                    ? 'border-foreground bg-foreground text-background shadow-xs'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" onClick={() => setStep(2)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Step 2: Accountability Partner
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Who keeps you accountable?</h2>
            <p className="text-xs text-muted-foreground">
              Invite a trusted friend or partner using a 6-character code or invite link.
            </p>
          </div>

          <div className="p-4 bg-muted/60 rounded-xl border border-border space-y-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Goal set: "{selectedGoal}"</span>
            </div>
            <p className="text-muted-foreground">
              Both of you will see each other's progress and nudge one another to stay consistent.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="ghost" onClick={() => onComplete(selectedGoal)}>
              Skip Pairing for Now
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onComplete(selectedGoal);
                onOpenInvite();
              }}
            >
              Invite Partner Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
