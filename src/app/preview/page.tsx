'use client';

// Hidden dev-only route: the partner-JOIN side of pairing (someone entering
// an invite code) plus a "simulate join" demo. Kept off the real onboarding
// path so the product flow stays clean. Reach it at /preview.

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { CommitmentCard } from '@/components/onboarding/CommitmentCard';
import { PRESET_AVATARS } from '@/lib/onboardingState';
import { V2Avatar } from '@/components/onboarding/V2Avatar';

type Step = 'landing' | 'name' | 'goal' | 'summary';

const INVITER = { name: 'Zara', avatarId: 'av_1', goal: 'Get stronger', amount: '30 minutes', freq: '3x a week', timing: 'Evening' };
const JOINER_GOALS = ['Read', 'Study', 'Workout', 'Run', 'Sleep better'];

export default function PreviewPage() {
  const [step, setStep] = useState<Step>('landing');
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState('av_3');
  const [goal, setGoal] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="mb-6 text-[11px] uppercase tracking-wider font-bold text-warning">
          Dev preview · partner join flow
        </div>

        {step === 'landing' && (
          <div className="space-y-7 animate-fade-in text-center">
            <V2Avatar avatarId={INVITER.avatarId} name={INVITER.name} size="xl" className="mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{INVITER.name} invited you to do this together.</h1>
              <p className="text-sm text-muted-foreground">
                They're working on <span className="font-semibold text-foreground">"{INVITER.goal}"</span> ({INVITER.amount} · {INVITER.freq}).
              </p>
            </div>
            <button onClick={() => setStep('name')} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-full">
              Join {INVITER.name} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'name' && (
          <form
            className="space-y-6 animate-fade-in"
            onSubmit={e => { e.preventDefault(); if (name.trim()) setStep('goal'); }}
          >
            <h1 className="text-2xl font-bold tracking-tight">What should we call you?</h1>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full text-2xl font-bold p-4 border-b-2 border-foreground bg-transparent focus:outline-none" />
            <div className="flex gap-3">
              {PRESET_AVATARS.map(av => (
                <button key={av.id} type="button" onClick={() => setAvatarId(av.id)} className={clsx('p-1 rounded-full', avatarId === av.id ? 'ring-2 ring-foreground' : 'opacity-60')}>
                  <V2Avatar avatarId={av.id} name={name} size="md" />
                </button>
              ))}
            </div>
            <button type="submit" disabled={!name.trim()} className="px-6 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full disabled:opacity-30">
              Next <ArrowRight className="w-4 h-4 inline" />
            </button>
          </form>
        )}

        {step === 'goal' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your own goal.</h1>
              <p className="text-sm text-muted-foreground">It doesn't have to match {INVITER.name}'s.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {JOINER_GOALS.map(g => (
                <button key={g} onClick={() => setGoal(g)} className={clsx('p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between', goal === g ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted/60')}>
                  <span>{g}</span>{goal === g && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>
            <button disabled={!goal} onClick={() => setStep('summary')} className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-full disabled:opacity-30">
              Join {INVITER.name}
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-5 animate-soft-pop">
            <h1 className="text-2xl font-bold tracking-tight text-center">You're in this together.</h1>
            <CommitmentCard name={INVITER.name} avatarId={INVITER.avatarId} goal={INVITER.goal} amount={INVITER.amount} frequency={INVITER.freq} timing={INVITER.timing} />
            <CommitmentCard name={name} avatarId={avatarId} goal={goal} amount="20 pages" frequency="4x a week" timing="Evening" />
            <button onClick={() => setStep('landing')} className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground">Replay</button>
          </div>
        )}
      </div>
    </div>
  );
}
