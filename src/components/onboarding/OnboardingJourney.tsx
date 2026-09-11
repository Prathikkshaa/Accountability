'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Copy, UserPlus, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { AvatarBuilder, AvatarConfig } from './AvatarBuilder';

export type OnboardingPhase =
  | 'entry'
  | 'name'
  | 'avatar'
  | 'goal'
  | 'why'
  | 'commitment'
  | 'frequency'
  | 'timing'
  | 'support_style'
  | 'motivation'
  | 'reveal'
  | 'invite'
  | 'waiting'
  | 'solo'
  | 'summary'
  | 'first_day';

export interface UserOnboardingState {
  name: string;
  avatar: AvatarConfig;
  goal: string;
  whyReason: string;
  whyCustomNote: string;
  commitmentValue: string;
  frequency: string;
  timing: string;
  supportStyle: string;
  motivation: string;
  partnerChoice: 'partner' | 'solo';
  inviteCode?: string;
  partnerName?: string;
}

const GOAL_PRESETS = [
  'Run more',
  'Read',
  'Study',
  'Get stronger',
  'Sleep better',
  'Eat better',
  'Build something',
  'Learn something',
  'Create',
  'Be more consistent',
];

const WHY_REASONS = [
  'I want to prove it to myself.',
  "I've been putting it off.",
  'I want my life to feel different.',
  "I have something I'm working toward.",
  "I'll feel better about myself if I do.",
  'Someone I care about is counting on me.',
  'I want to become more consistent.',
];

const FREQUENCY_CHOICES = [
  'Every day',
  '3x a week',
  '2x a week',
  'Weekdays',
  'Custom schedule',
];

const TIMING_CHOICES = [
  { label: 'Morning', detail: 'Start the day strong' },
  { label: 'Afternoon', detail: 'Midday focus block' },
  { label: 'Evening', detail: 'Wind down your day' },
  { label: "I'll decide each day", detail: 'Flexible daily decision' },
];

const SUPPORT_STYLES = [
  { title: 'Keep it gentle.', desc: 'Encouraging nudges and warm reminders' },
  { title: 'Be direct.', desc: 'Clear, honest accountability without fluff' },
  { title: 'Get someone involved.', desc: 'Notify my accountability partner when I slip' },
  { title: 'Give me some space.', desc: 'Let me reflect before sending follow ups' },
  { title: 'It depends.', desc: 'Adapt based on my past consistency' },
];

const MOTIVATION_CHOICES = [
  'Seeing progress',
  'Keeping a promise to myself',
  'Someone counting on me',
  'Small wins',
  'Feeling proud of myself',
  "I'm still figuring it out",
];

export function OnboardingJourney() {
  const [phase, setPhase] = useState<OnboardingPhase>('entry');
  const [data, setData] = useState<UserOnboardingState>({
    name: '',
    avatar: {
      skinTone: 'fair',
      hairStyle: 'short',
      hairColor: 'dark',
      accessory: 'none',
      bgColor: 'neutral',
    },
    goal: 'Study',
    whyReason: "I have something I'm working toward.",
    whyCustomNote: '',
    commitmentValue: '45 minutes',
    frequency: '3x a week',
    timing: 'Morning',
    supportStyle: 'Keep it gentle.',
    motivation: 'Keeping a promise to myself',
    partnerChoice: 'partner',
  });

  const [customGoalInput, setCustomGoalInput] = useState('');
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [customWhyInput, setCustomWhyInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const goTo = (nextPhase: OnboardingPhase) => {
    setPhase(nextPhase);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const update = (key: keyof UserOnboardingState, val: any) => {
    setData(prev => ({ ...prev, [key]: val }));
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) return;
    goTo('avatar');
  };

  const handleGoalSelect = (selectedGoal: string) => {
    setIsCustomGoal(false);
    update('goal', selectedGoal);
    // Set intelligent default commitment based on goal
    if (selectedGoal.includes('Run') || selectedGoal.includes('stronger')) {
      update('commitmentValue', '30 minutes');
    } else if (selectedGoal.includes('Read')) {
      update('commitmentValue', '20 pages');
    } else {
      update('commitmentValue', '45 minutes');
    }
    goTo('why');
  };

  const handleCustomGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalInput.trim()) return;
    update('goal', customGoalInput.trim());
    update('commitmentValue', '30 minutes');
    goTo('why');
  };

  const handleGenerateInvite = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setData(prev => ({ ...prev, inviteCode: code, partnerChoice: 'partner', partnerName: 'Alex' }));
    goTo('invite');
  };

  const handleCopyCode = () => {
    if (data.inviteCode) {
      navigator.clipboard.writeText(data.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#0d0e10] text-[#111110] dark:text-[#f4f4f5] flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-[#111110] selection:text-white dark:selection:bg-white dark:selection:text-[#0d0e10]">
      {/* Top Header Mark */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Accountability
          </span>
        </div>

        {phase !== 'entry' && phase !== 'first_day' && (
          <button
            type="button"
            onClick={() => goTo('entry')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Start over
          </button>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center py-10">
        {/* ========================================================= */}
        {/* PHASE 1: ENTRY SCREEN (Editorial, minimal)                */}
        {/* ========================================================= */}
        {phase === 'entry' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                You don't have to do it alone.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Pick something you want to get better at. We'll help you keep showing up.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => goTo('name')}
                className="inline-flex items-center gap-2 bg-foreground text-background font-medium text-base px-6 py-3.5 rounded-full transition-all hover:opacity-90 active:scale-95 shadow-xs"
              >
                Let's start <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 2: NAME (Single-field interaction)                   */}
        {/* ========================================================= */}
        {phase === 'name' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 1: Introduction
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What should we call you?
              </h2>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <input
                type="text"
                autoFocus
                value={data.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Your name"
                className="w-full text-2xl font-bold p-4 border-b-2 border-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/40"
              />

              {data.name.trim() && (
                <p className="text-sm font-medium text-muted-foreground animate-fade-in">
                  Nice to meet you, {data.name.trim()}.
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!data.name.trim()}
                  className="inline-flex items-center gap-2 bg-foreground text-background font-medium text-sm px-6 py-3 rounded-full disabled:opacity-30 hover:opacity-90"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 3: AVATAR BUILDER                                   */}
        {/* ========================================================= */}
        {phase === 'avatar' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 2: Personal Identity
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                Give yourself a little identity.
              </h2>
              <p className="text-xs text-muted-foreground">
                How do you want to show up here, {data.name}?
              </p>
            </div>

            <AvatarBuilder
              value={data.avatar}
              onChange={config => update('avatar', config)}
            />

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={() => goTo('goal')}
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={() => goTo('goal')}
                className="px-6 py-2.5 bg-foreground text-background font-semibold text-xs rounded-full hover:opacity-90"
              >
                Save avatar
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 4: GOAL SELECTION                                   */}
        {/* ========================================================= */}
        {phase === 'goal' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 3: Intention
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What do you want to get better at?
              </h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_PRESETS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGoalSelect(g)}
                    className="p-4 text-left rounded-2xl border border-border/80 bg-background hover:bg-muted/80 text-foreground text-sm font-medium transition-all flex items-center justify-between group"
                  >
                    <span>{g}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </button>
                ))}
              </div>

              {!isCustomGoal ? (
                <button
                  type="button"
                  onClick={() => setIsCustomGoal(true)}
                  className="w-full p-4 text-left rounded-2xl border border-dashed border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  + Something else
                </button>
              ) : (
                <form onSubmit={handleCustomGoalSubmit} className="space-y-3 animate-fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={customGoalInput}
                    onChange={e => setCustomGoalInput(e.target.value)}
                    placeholder="e.g. Write 500 words daily..."
                    className="w-full p-4 text-base rounded-2xl border border-foreground bg-background focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomGoal(false)}
                      className="px-4 py-2 text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!customGoalInput.trim()}
                      className="px-5 py-2 bg-foreground text-background text-xs font-semibold rounded-full disabled:opacity-30"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 5: WHY (Emotional Context)                          */}
        {/* ========================================================= */}
        {phase === 'why' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 4: Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Why does "{data.goal}" matter to you?
              </h2>
            </div>

            <div className="space-y-2.5">
              {WHY_REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    update('whyReason', r);
                    goTo('commitment');
                  }}
                  className={clsx(
                    'w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between',
                    data.whyReason === r
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border/80 bg-background hover:bg-muted/80 text-foreground'
                  )}
                >
                  <span>{r}</span>
                  {data.whyReason === r && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>

            {/* Optional Free-text entry */}
            <div className="pt-2 border-t border-border/40 space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">
                Or tell us in your own words (optional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWhyInput}
                  onChange={e => setCustomWhyInput(e.target.value)}
                  placeholder="e.g. I want to build a better future..."
                  className="flex-1 p-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customWhyInput.trim()) {
                      update('whyReason', customWhyInput.trim());
                      update('whyCustomNote', customWhyInput.trim());
                    }
                    goTo('commitment');
                  }}
                  className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 6: COMMITMENT (Concrete target)                      */}
        {/* ========================================================= */}
        {phase === 'commitment' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 5: Observable Commitment
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What would showing up look like?
              </h2>
            </div>

            <div className="p-6 bg-muted/40 rounded-3xl border border-border/80 space-y-4">
              <span className="text-xs text-muted-foreground font-semibold block uppercase">
                Goal: {data.goal}
              </span>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Commitment target:
                </label>
                <input
                  type="text"
                  value={data.commitmentValue}
                  onChange={e => update('commitmentValue', e.target.value)}
                  placeholder="e.g. 45 minutes, 20 pages"
                  className="w-full text-xl font-bold p-3 rounded-xl border border-border bg-background focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goTo('frequency')}
                className="px-6 py-3 bg-foreground text-background font-semibold text-xs rounded-full hover:opacity-90"
              >
                Next: Frequency →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 7: FREQUENCY                                        */}
        {/* ========================================================= */}
        {phase === 'frequency' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 6: Pace
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                How often feels realistic?
              </h2>
            </div>

            <div className="space-y-2.5">
              {FREQUENCY_CHOICES.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    update('frequency', f);
                    goTo('timing');
                  }}
                  className={clsx(
                    'w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between',
                    data.frequency === f
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border/80 bg-background hover:bg-muted/80 text-foreground'
                  )}
                >
                  <span>{f}</span>
                  {data.frequency === f && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 8: TIMING                                           */}
        {/* ========================================================= */}
        {phase === 'timing' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 7: Rhythm
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                When are you most likely to do it?
              </h2>
            </div>

            <div className="space-y-2.5">
              {TIMING_CHOICES.map(t => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    update('timing', t.label);
                    goTo('support_style');
                  }}
                  className="w-full p-4 rounded-2xl border border-border/80 bg-background hover:bg-muted/80 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-foreground text-sm block">{t.label}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">{t.detail}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 9: SUPPORT STYLE                                    */}
        {/* ========================================================= */}
        {phase === 'support_style' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 8: Accountability Style
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                When you're slipping, what kind of push works for you?
              </h2>
            </div>

            <div className="space-y-2.5">
              {SUPPORT_STYLES.map(s => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    update('supportStyle', s.title);
                    goTo('motivation');
                  }}
                  className="w-full p-4 rounded-2xl border border-border/80 bg-background hover:bg-muted/80 text-left transition-all group"
                >
                  <span className="font-bold text-foreground text-sm block">{s.title}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 10: MOTIVATION                                      */}
        {/* ========================================================= */}
        {phase === 'motivation' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 9: Driver
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What makes you want to keep going?
              </h2>
            </div>

            <div className="space-y-2.5">
              {MOTIVATION_CHOICES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    update('motivation', m);
                    goTo('reveal');
                  }}
                  className="w-full p-4 rounded-2xl border border-border/80 bg-background hover:bg-muted/80 text-left text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>{m}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 11: ACCOUNTABILITY REVEAL                            */}
        {/* ========================================================= */}
        {phase === 'reveal' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Step 10: Relationship Differentiator
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                Do you want someone in your corner?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Someone who knows what you're trying to do, sees when you show up, and can give you a push when you need it.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateInvite}
                className="w-full p-4 rounded-full bg-foreground text-background font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-xs"
              >
                <UserPlus className="w-4 h-4" /> Bring someone in
              </button>

              <button
                type="button"
                onClick={() => {
                  update('partnerChoice', 'solo');
                  goTo('solo');
                }}
                className="w-full p-3.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                I'll start on my own
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 12: PARTNER INVITE CODE                              */}
        {/* ========================================================= */}
        {phase === 'invite' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Private Pairing
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Who do you want beside you?
              </h2>
              <p className="text-sm text-muted-foreground">
                They'll use this private code to join you.
              </p>
            </div>

            <div className="p-8 bg-muted/50 rounded-3xl border border-border/80 flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Private Invitation Code
              </span>
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-foreground py-2">
                {data.inviteCode}
              </span>
              <span className="text-xs text-muted-foreground">Direct pairing. No public directory.</span>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full p-4 rounded-full bg-foreground text-background font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              >
                {copiedCode ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Code Copied' : 'Copy invite'}
              </button>

              <button
                type="button"
                onClick={() => goTo('waiting')}
                className="w-full p-3.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Continue to waiting room &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 13: WAITING ROOM                                     */}
        {/* ========================================================= */}
        {phase === 'waiting' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                You're doing this together now.
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span>Waiting for your person to join...</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 flex items-center justify-between text-xs">
              <span className="font-mono font-semibold tracking-wider text-foreground">
                Code: {data.inviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => goTo('summary')}
                className="px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-full hover:opacity-90"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 14: SOLO ACKNOWLEDGMENT                             */}
        {/* ========================================================= */}
        {phase === 'solo' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                That's okay.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You can bring someone in whenever you're ready.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => goTo('summary')}
                className="px-6 py-3.5 bg-foreground text-background font-semibold text-sm rounded-full hover:opacity-90"
              >
                Let's go &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 15: FINAL PERSONALIZED COMMITMENT SUMMARY            */}
        {/* ========================================================= */}
        {phase === 'summary' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Alright, {data.name}.
              </h2>

              <div className="p-6 rounded-3xl border border-border/80 bg-background space-y-4 text-sm">
                <p className="text-base font-semibold leading-relaxed">
                  You're going to <span className="underline">{data.goal}</span> {data.frequency} for {data.commitmentValue}.
                </p>

                <p className="text-xs text-muted-foreground italic border-l-2 border-foreground/30 pl-3 py-1">
                  Because "{data.whyReason}"
                </p>

                {data.partnerChoice === 'partner' ? (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    And Alex is in your corner.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Starting solo. Partner pairing available anytime.
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Let's see what happens when you keep showing up.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => goTo('first_day')}
                className="w-full p-4 rounded-full bg-foreground text-background font-bold text-sm transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
              >
                I'm in <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 16: FIRST DAY PRODUCT TRANSITION                    */}
        {/* ========================================================= */}
        {phase === 'first_day' && (
          <div className="space-y-8 animate-fade-in py-4">
            <div className="space-y-1 border-b border-border/40 pb-4">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                Today
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Welcome, {data.name}.</h2>
            </div>

            <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{data.goal}</h3>
                  <span className="text-xs text-muted-foreground">
                    {data.commitmentValue} · {data.frequency}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                  {data.timing}
                </span>
              </div>

              <blockquote className="text-xs text-muted-foreground italic border-l-2 border-foreground/30 pl-3 py-1">
                You said this matters because: "{data.whyReason}"
              </blockquote>

              {data.partnerChoice === 'partner' && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Alex is in your corner
                  </span>
                  <span className="text-muted-foreground">Code: {data.inviteCode}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goTo('entry')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Replay Onboarding Journey
              </button>

              <button
                type="button"
                onClick={() => alert(`Showing up for ${data.goal}!`)}
                className="px-6 py-3 bg-foreground text-background font-bold text-xs rounded-full hover:opacity-90 flex items-center gap-1.5"
              >
                Show up <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-xl mx-auto w-full py-4 text-center text-[11px] text-muted-foreground">
        Accountability. Simple promises kept together.
      </footer>
    </div>
  );
}
