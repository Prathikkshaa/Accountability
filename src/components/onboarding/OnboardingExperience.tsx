'use client';

import React, { useState } from 'react';
import {
  ArrowRight, Check, Copy, Sparkles, UserPlus, ShieldCheck, Heart, Share2, RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';

export type OnboardingStep =
  | 'intro'
  | 'intention'
  | 'make_it_real'
  | 'when'
  | 'reveal'
  | 'invite'
  | 'waiting'
  | 'skip'
  | 'commitment'
  | 'finished';

interface UserIntention {
  name: string;
  frequency: string;
  timeOfDay?: string;
  inviteCode?: string;
  paired: boolean;
}

const PRESET_INTENTIONS = [
  'Run more',
  'Read',
  'Study',
  'Work out',
  'Sleep better',
  'Build something',
  'Eat better',
  'Learn something',
  'Be more consistent',
];

export function OnboardingExperience() {
  const [step, setStep] = useState<OnboardingStep>('intro');
  const [intention, setIntention] = useState<UserIntention>({
    name: 'Run more',
    frequency: '3 times a week',
    timeOfDay: 'Morning',
    paired: false,
  });

  const [customGoalName, setCustomGoalName] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Helper step switcher
  const goTo = (nextStep: OnboardingStep) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIntention = (goal: string) => {
    setIsCustomInput(false);
    setIntention(prev => ({ ...prev, name: goal }));
    goTo('make_it_real');
  };

  const handleCustomIntentionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalName.trim()) return;
    setIntention(prev => ({ ...prev, name: customGoalName.trim() }));
    goTo('make_it_real');
  };

  const handleGenerateInvite = () => {
    // Generate 6-char human readable code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setIntention(prev => ({ ...prev, inviteCode: code, paired: true }));
    goTo('invite');
  };

  const handleCopyCode = () => {
    if (intention.inviteCode) {
      navigator.clipboard.writeText(intention.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#0d0e10] text-[#111110] dark:text-[#f4f4f5] flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-[#111110] selection:text-white dark:selection:bg-white dark:selection:text-[#0d0e10]">
      {/* Top Minimal Brand Mark */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Accountability</span>
        </div>
        {step !== 'intro' && step !== 'finished' && (
          <button
            onClick={() => goTo('intro')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Start over
          </button>
        )}
      </header>

      {/* Main Conversation Container */}
      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center py-12">
        {/* =================================================== */}
        {/* SCREEN 1 — INTRO                                     */}
        {/* =================================================== */}
        {step === 'intro' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                You don't have to do it alone.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
                Pick one thing you want to get better at. We'll help you keep showing up.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => goTo('intention')}
                className="inline-flex items-center gap-2 bg-foreground text-background font-medium text-base px-6 py-3.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95 shadow-xs"
              >
                Let's start <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 2 — INTENTION                                 */}
        {/* =================================================== */}
        {step === 'intention' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">01 · Intention</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                What do you want to change?
              </h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_INTENTIONS.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleSelectIntention(goal)}
                    className="p-4 text-left rounded-2xl border border-border/80 bg-background hover:bg-muted/80 text-foreground text-sm font-medium transition-all duration-150 active:scale-[0.98] flex items-center justify-between group"
                  >
                    <span>{goal}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                  </button>
                ))}
              </div>

              {!isCustomInput ? (
                <button
                  type="button"
                  onClick={() => setIsCustomInput(true)}
                  className="w-full p-4 text-left rounded-2xl border border-dashed border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground text-sm font-medium transition-all duration-150"
                >
                  + Create my own
                </button>
              ) : (
                <form onSubmit={handleCustomIntentionSubmit} className="space-y-3 animate-fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={customGoalName}
                    onChange={e => setCustomGoalName(e.target.value)}
                    placeholder="e.g. Write 500 words daily..."
                    className="w-full p-4 text-base rounded-2xl border border-foreground bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomInput(false)}
                      className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!customGoalName.trim()}
                      className="px-5 py-2.5 bg-foreground text-background text-xs font-semibold rounded-full disabled:opacity-40"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 3 — MAKE IT REAL                              */}
        {/* =================================================== */}
        {step === 'make_it_real' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">02 · Commitment</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                What would showing up look like for <span className="underline decoration-muted-foreground/40 underline-offset-4">"{intention.name}"</span>?
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                '3 times a week',
                'Every day',
                '2 times a week',
                '4 times a week',
                'Weekdays only',
              ].map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => {
                    setIntention(prev => ({ ...prev, frequency: freq }));
                    goTo('when');
                  }}
                  className={clsx(
                    'w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all duration-150 flex items-center justify-between',
                    intention.frequency === freq
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border/80 bg-background hover:bg-muted/80 text-foreground'
                  )}
                >
                  <span>{freq}</span>
                  {intention.frequency === freq && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 4 — WHEN?                                     */}
        {/* =================================================== */}
        {step === 'when' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">03 · Timing</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                When are you most likely to do it?
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                { time: 'Morning', sub: 'Before the day gets busy' },
                { time: 'Afternoon', sub: 'A midday focus block' },
                { time: 'Evening', sub: 'Winding down the day' },
                { time: "I'll decide each day", sub: 'Flexible schedule' },
              ].map(t => (
                <button
                  key={t.time}
                  type="button"
                  onClick={() => {
                    setIntention(prev => ({ ...prev, timeOfDay: t.time }));
                    goTo('reveal');
                  }}
                  className="w-full p-4 rounded-2xl border border-border/80 bg-background hover:bg-muted/80 text-left text-sm font-medium transition-all duration-150 flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{t.time}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">{t.sub}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 5 — THE ACCOUNTABILITY REVEAL                */}
        {/* =================================================== */}
        {step === 'reveal' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">04 · Accountability</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                Now, who's going to keep you honest?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Someone you trust makes it a lot harder to quietly disappear.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateInvite}
                className="w-full p-4 rounded-full bg-foreground text-background font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 shadow-xs"
              >
                <UserPlus className="w-4 h-4" /> Invite someone
              </button>

              <button
                type="button"
                onClick={() => goTo('skip')}
                className="w-full p-3.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                I'll start on my own
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 6 — INVITE                                    */}
        {/* =================================================== */}
        {step === 'invite' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">05 · Pair</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Pick your person.
              </h2>
              <p className="text-sm text-muted-foreground">
                We'll give you a private code to share with them.
              </p>
            </div>

            <div className="p-8 bg-muted/60 rounded-3xl border border-border/80 flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Your Private Code
              </span>
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-foreground py-2">
                {intention.inviteCode}
              </span>
              <span className="text-xs text-muted-foreground">Share this with a trusted friend or partner</span>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full p-4 rounded-full bg-foreground text-background font-semibold text-sm transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Code Copied' : 'Copy Code'}
              </button>

              <button
                type="button"
                onClick={() => goTo('waiting')}
                className="w-full p-3.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Continue to waiting room →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 7 — WAITING                                   */}
        {/* =================================================== */}
        {step === 'waiting' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                You're ready.
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span>Waiting for your accountability partner to join...</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 flex items-center justify-between text-xs">
              <span className="font-mono font-semibold tracking-wider text-foreground">
                Code: {intention.inviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => goTo('commitment')}
                className="px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                I'll continue →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 8 — IF THEY SKIP ACCOUNTABILITY               */}
        {/* =================================================== */}
        {step === 'skip' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                That's okay. Start with yourself.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You can bring someone in whenever you're ready.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => goTo('commitment')}
                className="px-6 py-3.5 bg-foreground text-background font-semibold text-sm rounded-full hover:opacity-90 transition-opacity"
              >
                Let's go <ArrowRight className="w-4 h-4 inline-block ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* SCREEN 9 — THE FIRST COMMITMENT                     */}
        {/* =================================================== */}
        {step === 'commitment' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final Step</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Tomorrow starts with one thing.
              </h2>
            </div>

            <div className="p-6 rounded-3xl border border-border/80 bg-background space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground">{intention.name}</h3>
              <p className="text-xs text-muted-foreground">
                {intention.frequency} · {intention.timeOfDay || 'Daily'}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium text-foreground">You've got this.</p>
              <button
                type="button"
                onClick={() => goTo('finished')}
                className="w-full p-4 rounded-full bg-foreground text-background font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                I'm in <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* FINISHED STATE / SUMMARY                            */}
        {/* =================================================== */}
        {step === 'finished' && (
          <div className="space-y-8 animate-fade-in text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">You're set.</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                First commitment: <span className="font-semibold text-foreground">"{intention.name}"</span> ({intention.frequency}).
                {intention.paired ? ` Private code generated: ${intention.inviteCode}` : ''}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => goTo('intro')}
                className="px-6 py-3 text-xs font-semibold rounded-full border border-border hover:bg-muted text-foreground transition-colors"
              >
                Replay Onboarding Flow
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="max-w-xl mx-auto w-full py-4 text-center text-[11px] text-muted-foreground">
        Accountability · Simple promises kept together
      </footer>
    </div>
  );
}
