'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, UsersRound, Check, X, Heart, Flame, Send, Plus, ArrowRight, ShieldQuestion, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { User, Goal, AccountabilityPartner, Nudge, GraceRequest, MoodState } from '@/lib/types';
import { getMe, getGoals, getPartnerships, getNudges, getPendingGrace, checkIn, reviewGrace, sendNudge } from '@/lib/appApi';
import { getTodayDateString } from '@/lib/utils';
import { UserAvatar } from '@/components/app/UserAvatar';
import { GoalCheckRow, goalTargetSummary } from '@/components/app/GoalCheckRow';
import { NewGoalModal } from '@/components/app/NewGoalModal';
import { CheckInSheet, CheckInPayload } from '@/components/app/CheckInSheet';
import { playCheckInSound, playCelebrationSound, haptic, soundEnabled } from '@/lib/sound';

const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100];
const MOOD_EMOJI: Record<MoodState, string> = { BAD: '😞', MEH: '😐', GOOD: '🙂', GREAT: '😄', AMAZING: '🤩' };

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const prettyDate = () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const to12h = (t?: string) => { if (!t) return null; const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; const hh = h % 12 || 12; return `${hh}${m ? ':' + String(m).padStart(2, '0') : ''}${ap}`; };

export default function TodayPage() {
  const [me, setMe] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [partners, setPartners] = useState<AccountabilityPartner[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [grace, setGrace] = useState<GraceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showBell, setShowBell] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [checkInFor, setCheckInFor] = useState<Goal | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [reacted, setReacted] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const [meRes, g, p, n, gr] = await Promise.all([getMe(), getGoals(), getPartnerships(), getNudges(), getPendingGrace()]);
    setMe(meRes.currentUser); setGoals(g); setPartners(p); setNudges(n); setGrace(gr); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const flashToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const onRowToggle = (goal: Goal) => { if (goal.completedToday) uncheck(goal); else setCheckInFor(goal); };

  const uncheck = async (goal: Goal) => {
    setBusyId(goal.id);
    try { await checkIn({ goalId: goal.id, completed: false, date: getTodayDateString() }); setGoals(await getGoals()); }
    catch {} finally { setBusyId(null); }
  };

  const confirmCheckIn = async (payload: CheckInPayload) => {
    if (!checkInFor) return;
    const goal = checkInFor;
    setBusyId(goal.id);
    try {
      const res = await checkIn({ goalId: goal.id, completed: true, date: getTodayDateString(), ...payload });
      setCheckInFor(null);
      setGoals(await getGoals());
      if (soundEnabled()) playCheckInSound();
      haptic(12);
      if (res.streak && MILESTONES.includes(res.streak.currentStreak)) {
        setMilestone(res.streak.currentStreak);
        if (soundEnabled()) playCelebrationSound();
        haptic([0, 40, 60, 40, 60, 80]);
      }
    } catch (e: any) { flashToast(e?.message || 'Could not check in'); }
    finally { setBusyId(null); }
  };

  const handleGrace = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setGrace(prev => prev.filter(x => x.id !== id));
    try { await reviewGrace(id, status); } catch { load(); }
  };

  const react = async (p: AccountabilityPartner, g: Goal, message: string) => {
    setReacted(prev => ({ ...prev, [g.id]: true }));
    try { await sendNudge({ receiverId: p.partnerId, goalId: g.id, goalName: g.name, message, nudgeType: 'CELEBRATION' }); flashToast(`Sent to ${p.partnerUser.name.split(' ')[0]}`); }
    catch (e: any) { flashToast(e?.message || 'Could not send'); setReacted(prev => { const n = { ...prev }; delete n[g.id]; return n; }); }
  };
  const nudge = async (p: AccountabilityPartner, g: Goal, msg?: string) => {
    try { await sendNudge({ receiverId: p.partnerId, goalId: g.id, goalName: g.name, message: msg || `A quiet nudge on ${g.name}.`, nudgeType: 'COMPLETION_PUSH' }); flashToast(`Sent to ${p.partnerUser.name.split(' ')[0]}`); }
    catch (e: any) { flashToast(e?.message || 'Could not send'); }
  };

  const doneCount = goals.filter(g => g.completedToday).length;
  const total = goals.length;
  const nextGoal = goals.find(g => !g.completedToday);
  const movers = partners.filter(p => p.goals.some(g => g.completedToday));
  const topShared = partners.slice().sort((a, b) => (b.sharedStreak || 0) - (a.sharedStreak || 0))[0];
  const bellCount = nudges.length + grace.length;

  if (loading) return <div className="space-y-6 animate-pulse pt-6"><div className="h-9 w-56 bg-muted rounded-lg" /><div className="h-28 bg-muted rounded-3xl mt-4" /><div className="h-16 bg-muted rounded" /></div>;

  return (
    <div className="space-y-10">
      {/* Masthead */}
      <header className="flex items-start justify-between pt-1">
        <div>
          <p className="eyebrow">{prettyDate()}</p>
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight mt-0.5">{greeting()},<br />{me?.name.split(' ')[0]}.</h1>
        </div>
        <div className="flex items-center gap-1 -mr-1">
          <Link href="/app/groups" className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Circles"><UsersRound className="w-[18px] h-[18px]" /></Link>
          <button onClick={() => setShowBell(true)} className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Notifications">
            <Bell className="w-[18px] h-[18px]" />
            {bellCount > 0 && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-danger" />}
          </button>
          <Link href="/app/you" aria-label="Your profile" className="ml-1"><UserAvatar src={me?.avatarUrl} name={me?.name} size="sm" /></Link>
        </div>
      </header>

      {/* Hero: next up + momentum */}
      <div className="rounded-[26px] bg-card border border-border overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="p-6">
          {nextGoal ? (
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Next up · {doneCount} of {total} kept</p>
                <h2 className="text-[26px] font-extrabold tracking-tight leading-tight mt-1 truncate">{nextGoal.name}</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">{goalTargetSummary(nextGoal)}{nextGoal.reminderTime ? ` · by ${to12h(nextGoal.reminderTime)}` : ''}</p>
              </div>
              <button onClick={() => setCheckInFor(nextGoal)} className="shrink-0 inline-flex items-center gap-1.5 pl-5 pr-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
                Check in <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <p className="eyebrow">{total === 0 ? 'A blank page' : 'Today'}</p>
              <h2 className="text-[26px] font-extrabold tracking-tight leading-tight mt-1">{total === 0 ? 'Pick one thing to keep.' : 'Every promise kept.'}</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">{total === 0 ? 'Small and honest beats big and vague.' : 'Nothing left to do but rest. Your circle can see it.'}</p>
            </div>
          )}
        </div>
        {partners.length > 0 && (
          <Link href="/app/partners" className="flex items-center gap-3 px-6 py-3.5 border-t border-border hover:bg-muted/40 transition-colors">
            <div className="flex -space-x-2">{partners.map(p => <UserAvatar key={p.id} src={p.partnerUser.avatarUrl} name={p.partnerUser.name} size="xs" className="ring-2 ring-card" />)}</div>
            <p className="text-[13px] text-muted-foreground flex-1">
              {topShared && (topShared.sharedStreak || 0) > 0 ? (
                <><span className="font-bold text-foreground tnum">{topShared.sharedStreak} days</span> in sync with {topShared.partnerUser.name.split(' ')[0]}</>
              ) : movers.length > 0 ? (
                <><span className="font-semibold text-foreground">{movers.map(m => m.partnerUser.name.split(' ')[0]).join(' & ')}</span> also showed up today</>
              ) : 'Be the first in your circle to move today.'}
            </p>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground/50" />
          </Link>
        )}
      </div>

      {/* Grace (kept lightweight, above the fold only if pending) */}
      {grace.length > 0 && grace.map(gr => (
        <div key={gr.id} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold">A grace request</h2>
            <span className="eyebrow">from {gr.userName.split(' ')[0]}</span>
          </div>
          <div className="flex items-start gap-3">
            <UserAvatar src={gr.userAvatar} name={gr.userName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm"><span className="font-semibold">{gr.goalName}</span> · missed {new Date(gr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              <p className="text-sm text-muted-foreground mt-0.5">“{gr.reasonNote}”</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleGrace(gr.id, 'APPROVED')} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Forgive</button>
                <button onClick={() => handleGrace(gr.id, 'REJECTED')} className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">Not this time</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Promises — a clean divided list, no boxes */}
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-[15px] font-bold">Your promises</h2>
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground"><Plus className="w-3.5 h-3.5" /> Add</button>
        </div>
        {goals.length === 0 ? (
          <button onClick={() => setShowNew(true)} className="w-full text-left py-6 text-sm text-muted-foreground border-t border-border hover:text-foreground">Nothing yet. Add the first thing you want to keep.</button>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {goals.map(g => <GoalCheckRow key={g.id} goal={g} onToggle={onRowToggle} busy={busyId === g.id} href={`/app/goal?id=${g.id}`} />)}
          </div>
        )}
      </section>

      {/* Circle */}
      {partners.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-[15px] font-bold">Your circle today</h2>
          {partners.map(p => {
            const pDone = p.goals.filter(g => g.completedToday).length;
            const onTrack = p.goals.length > 0 && pDone === p.goals.length;
            return (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center gap-3 pb-1">
                  <UserAvatar src={p.partnerUser.avatarUrl} name={p.partnerUser.name} size="sm" />
                  <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{p.partnerUser.name}</p><p className="text-[13px] text-muted-foreground">{pDone} of {p.goals.length} today</p></div>
                  {onTrack && <span className="text-[13px] font-semibold text-success">On track</span>}
                </div>
                <div className="divide-y divide-border border-t border-border">
                  {p.goals.map(g => {
                    const chk = g.todayCheckIn;
                    const hasProof = !!(chk && (chk.proofPhotoUrl || chk.note || chk.mood));
                    return (
                      <div key={g.id} className="py-3">
                        <div className="flex items-center gap-3">
                          <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', g.completedToday ? 'bg-success' : 'bg-muted-foreground/30')} />
                          <div className="flex-1 min-w-0"><p className={clsx('text-sm font-medium truncate', g.completedToday && 'text-muted-foreground')}>{g.name}</p></div>
                          {g.completedToday ? (
                            reacted[g.id] ? <span className="text-[13px] font-semibold text-muted-foreground shrink-0">Sent</span> : (
                              <div className="flex items-center gap-0.5">
                                {!hasProof && <button onClick={() => nudge(p, g, `Mind sharing proof for ${g.name}?`)} title="Ask for proof" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"><ShieldQuestion className="w-[18px] h-[18px]" /></button>}
                                <button onClick={() => react(p, g, `Cheering you on for ${g.name}.`)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors" aria-label="Cheer"><Flame className="w-[18px] h-[18px]" style={{ color: 'var(--danger)' }} /></button>
                                <button onClick={() => react(p, g, `Proud of you.`)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors" aria-label="Send love"><Heart className="w-[18px] h-[18px]" style={{ color: 'var(--danger)' }} /></button>
                              </div>
                            )
                          ) : (
                            <button onClick={() => nudge(p, g)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground shrink-0"><Send className="w-3.5 h-3.5" /> Nudge</button>
                          )}
                        </div>
                        {hasProof && (
                          <div className="ml-4 mt-1.5 flex items-center gap-2">
                            {chk?.proofPhotoUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={chk.proofPhotoUrl} alt="proof" className="w-9 h-9 rounded-lg object-cover border border-border" />
                            )}
                            {chk?.mood && <span className="text-base leading-none">{MOOD_EMOJI[chk.mood]}</span>}
                            {chk?.note && <p className="text-[13px] text-muted-foreground italic truncate">“{chk.note}”</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {checkInFor && <CheckInSheet goal={checkInFor} onClose={() => setCheckInFor(null)} onConfirm={confirmCheckIn} />}
      {showNew && <NewGoalModal onClose={() => setShowNew(false)} onCreated={load} />}

      {/* Bell */}
      {showBell && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowBell(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <div className="relative w-full max-w-lg bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl p-6 space-y-4 max-h-[75vh] overflow-y-auto animate-rise-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg tracking-tight">Notifications</h3><button onClick={() => setShowBell(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button></div>
            {grace.map(gr => (
              <div key={gr.id} className="space-y-2 border-b border-border pb-4">
                <p className="text-sm"><span className="font-semibold">{gr.userName}</span> asked for grace · <span className="text-muted-foreground">{gr.goalName}</span></p>
                <p className="text-[13px] text-muted-foreground italic">“{gr.reasonNote}”</p>
                <div className="flex gap-2"><button onClick={() => handleGrace(gr.id, 'APPROVED')} className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold">Forgive</button><button onClick={() => handleGrace(gr.id, 'REJECTED')} className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground">Not this time</button></div>
              </div>
            ))}
            {nudges.length === 0 && grace.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">All quiet. That's okay too.</p>}
            {nudges.map(n => (
              <div key={n.id} className="flex gap-3">
                <UserAvatar src={n.senderAvatar} name={n.senderName} size="sm" />
                <div className="min-w-0"><p className="text-sm"><span className="font-semibold">{n.senderName}</span>{n.goalName ? ` · ${n.goalName}` : ''}</p><p className="text-sm text-muted-foreground">{n.message}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone */}
      {milestone && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" onClick={() => setMilestone(null)}>
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm animate-fade-in" />
          {[...Array(14)].map((_, i) => <span key={i} className="absolute top-1/3 w-1.5 h-1.5 rounded-full" style={{ left: `${12 + i * 5.5}%`, backgroundColor: i % 3 === 0 ? 'var(--warm)' : i % 3 === 1 ? 'var(--danger)' : 'var(--primary)', animation: `drift ${1.2 + (i % 4) * 0.3}s ease-out ${i * 0.05}s forwards` }} />)}
          <div className="relative text-center animate-soft-pop">
            <p className="display text-[96px] leading-none" style={{ color: milestone >= 30 ? 'var(--warm)' : 'var(--danger)' }}>{milestone}</p>
            <h2 className="text-xl font-extrabold tracking-tight mt-1">days in a row</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-[15rem] mx-auto">{milestone >= 100 ? 'Legendary. This is who you are now.' : milestone >= 30 ? 'A real habit. This is sticking.' : milestone >= 7 ? 'A full week of showing up.' : 'Off to a strong start.'}</p>
            <button onClick={() => setMilestone(null)} className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">Keep going</button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-24 inset-x-0 z-[55] flex justify-center px-5 animate-rise-in"><div className="px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold shadow-lg">{toast}</div></div>}
    </div>
  );
}
