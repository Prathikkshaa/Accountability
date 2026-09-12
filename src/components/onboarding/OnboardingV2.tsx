'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Loader2, Lock, ShieldCheck, Users, Sparkles, Plus, RefreshCw, X, Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { PromiseList } from './PromiseList';
import { commitOnboarding, CommitmentInput } from '@/lib/onboardingApi';
import { sendMagicLink, acceptInvite } from '@/lib/appApi';
import { currentUserId } from '@/lib/supabase';

type Moment = 'welcome' | 'goal' | 'commit' | 'why' | 'you' | 'verify' | 'invite' | 'done' | 'signin';

interface GoalPreset {
  label: string;
  category: string;
  amount: string;
  freq: string;
}

interface SelectedGoal extends GoalPreset {}

const GOAL_PRESETS: GoalPreset[] = [
  { label: 'Get stronger', category: 'Fitness', amount: '30 minutes', freq: '3x a week' },
  { label: 'Run more', category: 'Fitness', amount: '30 minutes', freq: '3x a week' },
  { label: 'Read', category: 'Learning', amount: '20 pages', freq: '3x a week' },
  { label: 'Study', category: 'Learning', amount: '45 minutes', freq: 'Weekdays' },
  { label: 'Build something', category: 'Productivity', amount: '45 minutes', freq: 'Weekdays' },
  { label: 'Write', category: 'Creativity', amount: '500 words', freq: 'Every day' },
  { label: 'Sleep better', category: 'Wellness', amount: 'By 11pm', freq: 'Every day' },
  { label: 'Meditate', category: 'Mindfulness', amount: '10 minutes', freq: 'Every day' },
];

const FREQUENCY_OPTIONS = ['Every day', 'Weekdays', '3x a week', '2x a week'];
const TIMING_OPTIONS = ['Morning', 'Afternoon', 'Evening', "I'll decide each day"];
const WHY_LIST = [
  'I want to prove it to myself.',
  "I've been putting it off for too long.",
  'I want my life to feel different.',
  'Someone I care about is counting on me.',
  "I'll feel better if I do.",
];

const timingToReminder = (t: string): string | undefined => {
  if (t === 'Morning') return '07:00';
  if (t === 'Afternoon') return '13:00';
  if (t === 'Evening') return '19:00';
  return undefined;
};

const PROGRESS_ORDER: Moment[] = ['goal', 'commit', 'why', 'you', 'invite'];

export function OnboardingV2() {
  const router = useRouter();
  const [moment, setMoment] = useState<Moment>('welcome');
  const [history, setHistory] = useState<Moment[]>(['welcome']);

  // Handle returning from a magic link: if a session now exists, resume the
  // saved onboarding draft (create profile + goals + invite), pair if joining,
  // or just enter the app.
  useEffect(() => {
    (async () => {
      const id = await currentUserId();
      if (!id) return;
      let draft: any = null;
      try { draft = JSON.parse(localStorage.getItem('onboardingDraft') || 'null'); } catch {}
      if (draft) {
        try {
          const result = await commitOnboarding({
            name: draft.name, email: draft.email, commitments: draft.commitments, reminderTime: draft.reminderTime,
          });
          try { localStorage.removeItem('onboardingDraft'); } catch {}
          let pending: string | null = null;
          try { pending = localStorage.getItem('pendingInvite'); } catch {}
          if (pending) {
            try { localStorage.removeItem('pendingInvite'); await acceptInvite(pending); } catch {}
            router.replace('/app/partners'); return;
          }
          setName(draft.name); setGoals(draft.goals || []); setTiming(draft.timing || "I'll decide each day"); setReason(draft.reason || '');
          setInviteCode(result.inviteCode); setCommitted(true);
          setHistory(['invite']); setMoment('invite');
          return;
        } catch { /* fall through to app */ }
      }
      router.replace('/app');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [goals, setGoals] = useState<SelectedGoal[]>([]);
  const [timing, setTiming] = useState<string>("I'll decide each day");
  const [reason, setReason] = useState('');

  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const [inviteCode, setInviteCode] = useState('');
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const goTo = (next: Moment) => {
    setHistory(prev => [...prev, next]);
    setMoment(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    if (history.length <= 1) return;
    const h = [...history];
    h.pop();
    setHistory(h);
    setMoment(h[h.length - 1]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSelected = (label: string) => goals.some(g => g.label === label);
  const toggleGoal = (g: GoalPreset) => {
    setGoals(prev => (prev.some(x => x.label === g.label) ? prev.filter(x => x.label !== g.label) : [...prev, g]));
  };
  const addCustomGoal = () => {
    const label = customInput.trim();
    if (!label || isSelected(label)) return;
    setGoals(prev => [...prev, { label, category: 'General', amount: '30 minutes', freq: '3x a week' }]);
    setCustomInput('');
    setCustomMode(false);
  };
  const updateGoal = (idx: number, patch: Partial<SelectedGoal>) =>
    setGoals(prev => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));

  const resetAll = () => {
    setName('');
    setGoals([]);
    setTiming("I'll decide each day");
    setReason('');
    setCustomMode(false);
    setCustomInput('');
    setInviteCode('');
    setCommitted(false);
    setCommitError(null);
    setHistory(['welcome']);
    setMoment('welcome');
  };

  const copyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const redirectUrl = () => (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '/');

  // Onboarding: save the draft, then email a magic link. When they tap it,
  // the return handler above finishes creating everything.
  const handleSendLink = async () => {
    if (!name.trim() || !emailValid) return;
    setCommitting(true); setAuthError(null);
    try {
      const commitments: CommitmentInput[] = goals.map(g => ({ goal: g.label, amount: g.amount, frequency: g.freq, timing, category: g.category }));
      try {
        localStorage.setItem('onboardingDraft', JSON.stringify({
          name: name.trim(), email: email.trim(), goals, timing, reason, commitments, reminderTime: timingToReminder(timing),
        }));
      } catch {}
      await sendMagicLink(email.trim(), redirectUrl());
      setLinkSent(true);
      goTo('verify');
    } catch (e: any) {
      setAuthError(e?.message || 'Could not send the email. Try again.');
    } finally { setCommitting(false); }
  };

  // Returning users: just email a link (no draft; the return handler sends
  // them straight to the app).
  const handleSignInLink = async () => {
    if (!emailValid) return;
    setCommitting(true); setAuthError(null);
    try {
      try { localStorage.removeItem('onboardingDraft'); } catch {}
      await sendMagicLink(email.trim(), redirectUrl());
      setLinkSent(true);
    } catch (e: any) {
      setAuthError(e?.message || 'Could not send the email. Try again.');
    } finally { setCommitting(false); }
  };

  const progressIdx = PROGRESS_ORDER.indexOf(moment) + 1;

  return (
    <div className="bg-pattern min-h-screen text-foreground flex flex-col font-sans selection:bg-foreground selection:text-background">
      <header className="max-w-lg mx-auto w-full flex items-center justify-between px-5 sm:px-0 py-4">
        <div className="flex items-center gap-3">
          {history.length > 1 && moment !== 'done' && (
            <button type="button" onClick={goBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Back
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--warm)' }} />
            <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Accountability</span>
          </div>
        </div>

        {progressIdx > 0 && (
          <div className="flex items-center gap-1.5" aria-label={`Step ${progressIdx} of 5`}>
            {PROGRESS_ORDER.map((_, i) => (
              <span
                key={i}
                className={clsx(
                  'h-1.5 rounded-full transition-all duration-300',
                  i + 1 === progressIdx ? 'w-5 bg-foreground' : i + 1 < progressIdx ? 'w-1.5 bg-foreground/40' : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>
        )}

        {moment !== 'welcome' && moment !== 'done' && (
          <button type="button" onClick={() => setShowReset(true)} className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            Start over
          </button>
        )}
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 flex flex-col justify-center px-5 sm:px-0 py-6">
        {/* WELCOME */}
        {moment === 'welcome' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--warm)' }} /> Better together
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Habits don't fail loudly.
                <br />
                <span className="text-muted-foreground">They fade quietly.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                So don't do it alone. Pick what you want to keep showing up for, and bring someone who'll notice when you do.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <button
                type="button"
                onClick={() => goTo('goal')}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-base px-7 py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Pick my things
              </button>
              <button
                type="button"
                onClick={() => { setLinkSent(false); setAuthError(null); goTo('signin'); }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Already have an account? <span className="text-foreground font-semibold">Sign in</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Private invites</span>
              <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Just you and your person</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Leave anytime</span>
            </div>
          </div>
        )}

        {/* GOAL (multi-select) */}
        {moment === 'goal' && (
          <div className="space-y-7 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">What do you want to show up for?</h2>
              <p className="text-sm text-muted-foreground">Pick one or a few. You can always add more later.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {GOAL_PRESETS.map(g => {
                const selected = isSelected(g.label);
                return (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={clsx(
                      'p-4 text-left rounded-2xl border text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-between gap-2',
                      selected ? 'border-transparent bg-primary text-primary-foreground shadow-sm' : 'border-border/80 bg-card hover:bg-muted/60'
                    )}
                  >
                    <span>{g.label}</span>
                    {selected && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* custom + selected chips */}
            {!customMode ? (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full p-4 text-left rounded-2xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Something else
              </button>
            ) : (
              <form className="space-y-2 animate-fade-in" onSubmit={e => { e.preventDefault(); addCustomGoal(); }}>
                <input
                  autoFocus
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="e.g. Practice guitar"
                  className="w-full p-4 text-base rounded-2xl border border-foreground bg-card focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button type="submit" className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl">Add</button>
                  <button type="button" onClick={() => { setCustomMode(false); setCustomInput(''); }} className="text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              </form>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-muted-foreground">
                {goals.length === 0 ? 'Nothing picked yet' : `${goals.length} picked`}
              </span>
              <button
                type="button"
                disabled={goals.length === 0}
                onClick={() => goTo('commit')}
                className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-full disabled:opacity-30 hover:opacity-90 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* COMMIT (per-goal amount + freq, shared timing) */}
        {moment === 'commit' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Make {goals.length > 1 ? 'them' : 'it'} real.</h2>
              <p className="text-sm text-muted-foreground">We picked gentle starting points. Adjust anything.</p>
            </div>

            <div className="space-y-3">
              {goals.map((g, idx) => (
                <div key={g.label + idx} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold tracking-tight">{g.label}</h3>
                    <button
                      type="button"
                      onClick={() => setGoals(prev => prev.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${g.label}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={g.amount}
                    onChange={e => updateGoal(idx, { amount: e.target.value })}
                    className="w-full text-base font-semibold p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                  />
                  <div className="grid grid-cols-4 gap-1.5">
                    {FREQUENCY_OPTIONS.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => updateGoal(idx, { freq: f })}
                        className={clsx(
                          'px-2 py-2 rounded-lg border text-[11px] font-semibold transition-all',
                          g.freq === f ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted/60'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">When do you usually do these?</label>
              <div className="grid grid-cols-2 gap-2">
                {TIMING_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTiming(t)}
                    className={clsx(
                      'p-3 rounded-2xl border text-sm font-medium transition-all active:scale-[0.98]',
                      timing === t ? 'border-transparent bg-primary text-primary-foreground font-semibold' : 'border-border bg-card hover:bg-muted/60'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => goTo('why')} className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-full hover:opacity-90 transition-all">
                {goals.length > 1 ? "Those are my promises" : "That's my promise"}
              </button>
            </div>
          </div>
        )}

        {/* WHY */}
        {moment === 'why' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why these?</h2>
              <p className="text-sm text-muted-foreground">A reason to come back to on the hard days. Optional.</p>
            </div>

            <div className="space-y-2">
              {WHY_LIST.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(reason === r ? '' : r)}
                  className={clsx(
                    'w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-2',
                    reason === r ? 'border-transparent bg-muted font-semibold' : 'border-border/70 bg-card hover:bg-muted/50 text-muted-foreground'
                  )}
                >
                  <span>{r}</span>
                  {reason === r && <Check className="w-4 h-4 stroke-[3] shrink-0" style={{ color: 'var(--warm)' }} />}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => goTo('you')} className="text-sm font-medium text-muted-foreground hover:text-foreground">Skip</button>
              <button type="button" onClick={() => goTo('you')} className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-full hover:opacity-90 transition-all">Continue</button>
            </div>
          </div>
        )}

        {/* YOU */}
        {moment === 'you' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Last thing, who's this?</h2>
              <p className="text-sm text-muted-foreground">Your name so your partner knows you, and an email to save your account.</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); if (name.trim() && emailValid && !committing) handleSendLink(); }} className="space-y-4">
              <input
                autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full text-2xl font-bold p-4 border-b-2 border-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/30"
              />
              <input
                type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full text-base p-4 rounded-2xl border border-border bg-card focus:outline-none focus:border-foreground"
              />

              <PromiseList name={name} timing={timing} reason={reason} promises={goals} />

              {authError && <div className="p-3.5 rounded-2xl bg-danger/10 border border-danger/30 text-sm text-danger">{authError}</div>}

              <button
                type="submit" disabled={!name.trim() || !emailValid || committing}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-bold text-sm rounded-full disabled:opacity-40 hover:opacity-90 active:scale-[0.99] transition-all"
              >
                {committing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>) : (<><Mail className="w-4 h-4" /> Email me a sign-in link</>)}
              </button>
              <p className="text-[11px] text-muted-foreground text-center">We'll email you a link. Tap it on this phone to finish.</p>
            </form>
          </div>
        )}

        {/* VERIFY (onboarding) — check your email for the link */}
        {moment === 'verify' && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-7 h-7" style={{ color: 'var(--warm)' }} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Check your email.</h2>
              <p className="text-sm text-muted-foreground">We sent a sign-in link to <span className="font-semibold text-foreground">{email}</span>. Tap it <span className="font-semibold text-foreground">on this phone</span> to finish setting up.</p>
            </div>
            {authError && <div className="p-3.5 rounded-2xl bg-danger/10 border border-danger/30 text-sm text-danger">{authError}</div>}
            <div className="space-y-2">
              <button type="button" onClick={handleSendLink} disabled={committing} className="text-sm font-semibold text-foreground hover:opacity-70">
                {committing ? 'Sending…' : 'Resend link'}
              </button>
              <p className="text-[11px] text-muted-foreground">No email? Check spam. Built-in email can take a minute.</p>
            </div>
          </div>
        )}

        {/* SIGN IN (returning users) */}
        {moment === 'signin' && (
          <div className="space-y-6 animate-fade-in">
            {!linkSent ? (
              <>
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back.</h2>
                  <p className="text-sm text-muted-foreground">Enter your email and we'll send a sign-in link.</p>
                </div>
                <form onSubmit={e => { e.preventDefault(); if (emailValid && !committing) handleSignInLink(); }} className="space-y-4">
                  <input autoFocus type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                    className="w-full text-base p-4 rounded-2xl border border-border bg-card focus:outline-none focus:border-foreground" />
                  {authError && <div className="p-3.5 rounded-2xl bg-danger/10 border border-danger/30 text-sm text-danger">{authError}</div>}
                  <button type="submit" disabled={!emailValid || committing} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-bold text-sm rounded-full disabled:opacity-40">
                    {committing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>) : (<><Mail className="w-4 h-4" /> Email me a link</>)}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center"><Mail className="w-7 h-7" style={{ color: 'var(--warm)' }} /></div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Check your email.</h2>
                  <p className="text-sm text-muted-foreground">Tap the link we sent to <span className="font-semibold text-foreground">{email}</span> on this phone to sign in.</p>
                </div>
                <button type="button" onClick={handleSignInLink} disabled={committing} className="text-sm font-semibold text-foreground hover:opacity-70">{committing ? 'Sending…' : 'Resend link'}</button>
              </div>
            )}
          </div>
        )}

        {/* INVITE */}
        {moment === 'invite' && (
          <div className="space-y-7 animate-fade-in">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <Check className="w-4 h-4 stroke-[3]" /> You're set up, {name.split(' ')[0]}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Now bring your person in.</h2>
              <p className="text-sm text-muted-foreground">Accountability works because someone else knows. Share this private code.</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Your invite code</span>
              <span className="text-5xl font-mono font-bold tracking-[0.15em]">{inviteCode}</span>
              <button type="button" onClick={copyCode} className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
                {copied ? (<><Check className="w-4 h-4 stroke-[3]" /> Copied</>) : (<><Copy className="w-4 h-4" /> Copy code</>)}
              </button>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-muted-foreground rounded-2xl bg-muted/50 p-4">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Only someone with this code can pair with you. No public profiles, no discovery, and you can disconnect anytime.</p>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={() => goTo('done')} className="w-full px-6 py-4 bg-primary text-primary-foreground font-bold text-sm rounded-full hover:opacity-90 transition-all">I've shared it</button>
              <button type="button" onClick={() => goTo('done')} className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">I'll start solo, add them later</button>
            </div>
          </div>
        )}

        {/* DONE */}
        {moment === 'done' && (
          <div className="space-y-7 text-center animate-soft-pop">
            <div className="relative flex justify-center">
              <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card border border-border">
                <Check className="w-9 h-9 stroke-[2.5]" style={{ color: 'var(--warm)' }} />
              </span>
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="absolute top-2 w-1.5 h-1.5 rounded-full"
                  style={{ left: `${30 + i * 8}%`, backgroundColor: i % 2 ? 'var(--warm)' : 'var(--foreground)', animation: `drift ${1 + (i % 3) * 0.3}s ease-out ${i * 0.08}s forwards` }}
                />
              ))}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Day 0. Let's make it Day 1.</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your {goals.length > 1 ? 'promises are' : 'promise is'} set{committed ? ' and saved' : ''}. Come back tomorrow and check in. That's the whole game.
              </p>
            </div>

            <PromiseList className="text-left" name={name} timing={timing} reason={reason} promises={goals} />

            <button type="button" onClick={() => router.push('/app')} className="block w-full px-6 py-4 bg-primary text-primary-foreground font-bold text-sm rounded-full hover:opacity-90 transition-all">
              Enter my space
            </button>
            <button type="button" onClick={resetAll} className="text-xs font-medium text-muted-foreground hover:text-foreground">Replay</button>
          </div>
        )}
      </main>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold">Start over?</h3>
            <p className="text-sm text-muted-foreground">You'll lose what you've entered so far.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowReset(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="button" onClick={() => { setShowReset(false); resetAll(); }} className="px-4 py-2 bg-danger text-white text-sm font-bold rounded-xl">Start over</button>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-lg mx-auto w-full py-5 text-center text-[11px] text-muted-foreground">
        Simple promises, kept together.
      </footer>
    </div>
  );
}
