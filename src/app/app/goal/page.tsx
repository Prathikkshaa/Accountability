'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Pencil, Archive, RotateCcw, HeartHandshake, X, Lock, Eye, Coins } from 'lucide-react';
import { clsx } from 'clsx';
import type { Goal, DailyCheckIn, MoodState, AccountabilityPartner } from '@/lib/types';
import { getGoalDetail, patchGoal, archiveGoal, restartGoal, getPartnerships, requestGrace } from '@/lib/appApi';
import { goalTargetSummary } from '@/components/app/GoalCheckRow';

const MOOD_EMOJI: Record<MoodState, string> = { BAD: '😞', MEH: '😐', GOOD: '🙂', GREAT: '😄', AMAZING: '🤩' };
const FREQS = ['Every day', 'Weekdays', '3x a week', '2x a week'];
const freqToPerWeek = (f: string) => (f === 'Every day' ? 7 : f === 'Weekdays' ? 5 : f === '3x a week' ? 3 : 2);
const perWeekToFreq = (n?: number) => (n === 7 ? 'Every day' : n === 5 ? 'Weekdays' : n === 3 ? '3x a week' : '2x a week');
const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function GoalDetailRoute() {
  return (
    <Suspense fallback={<div className="pt-10 text-center text-sm text-muted-foreground">Loading…</div>}>
      <GoalDetail />
    </Suspense>
  );
}

function GoalDetail() {
  const id = useSearchParams().get('id') || '';
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [partners, setPartners] = useState<AccountabilityPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showGrace, setShowGrace] = useState(false);

  const load = async () => {
    try {
      const [d, p] = await Promise.all([getGoalDetail(id), getPartnerships()]);
      setGoal(d.goal); setCheckIns(d.checkIns); setPartners(p);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { if (id) load(); }, [id]);

  if (loading || !goal) return <div className="space-y-3 animate-pulse pt-4"><div className="h-8 w-40 bg-muted rounded" /><div className="h-24 bg-muted rounded-2xl" /></div>;

  const completed = new Set(checkIns.filter(c => c.completed).map(c => c.date));
  const today = new Date();
  const days: string[] = [];
  for (let i = 69; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(dateStr(d)); }
  const week: { label: string; date: string; done: boolean; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); const ds = dateStr(d); week.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), date: ds, done: completed.has(ds), isToday: i === 0 }); }
  const timeline = [...checkIns].filter(c => c.completed).reverse().slice(0, 8);
  const missedDays = week.filter(w => !w.done && !w.isToday).map(w => w.date);

  const doArchive = async () => { await archiveGoal(goal.id); router.push('/app'); };
  const doRestart = async () => { await restartGoal(goal.id); load(); };

  return (
    <div className="space-y-6 pb-4">
      <header className="flex items-center justify-between">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={() => setShowEdit(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-muted text-sm font-semibold hover:bg-border"><Pencil className="w-3.5 h-3.5" /> Edit</button>
      </header>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{goal.name}</h1>
          {goal.visibility === 'PRIVATE' && <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>
        <p className="text-sm text-muted-foreground">{goal.category} · {goalTargetSummary(goal)}</p>
      </div>

      {goal.stake && (
        <div className="flex items-center gap-2 rounded-2xl border border-warm/40 bg-warm/[0.06] p-3.5 text-sm">
          <Coins className="w-4 h-4 text-warm shrink-0" />
          <span><span className="font-semibold">On the line:</span> {goal.stake}</span>
        </div>
      )}

      <div className="grid grid-cols-3 border-y border-border divide-x divide-border">
        <Stat label="Current" value={goal.currentStreak || 0} tint="var(--danger)" />
        <Stat label="Longest" value={goal.longestStreak || 0} tint="var(--warm)" />
        <Stat label="Total" value={goal.totalCompletions || 0} tint="var(--foreground)" />
      </div>

      <section className="space-y-2">
        <h2 className="text-[15px] font-bold text-foreground">This week</h2>
        <div className="flex justify-between gap-1.5 py-2">
          {week.map(w => (
            <div key={w.date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">{w.label}</span>
              <span className={clsx('w-8 h-8 rounded-full flex items-center justify-center', w.done ? 'bg-foreground text-background' : 'bg-muted', w.isToday && 'ring-2 ring-warm ring-offset-1 ring-offset-background')}>
                {w.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[15px] font-bold text-foreground">Last 10 weeks</h2>
        <div className="overflow-x-auto py-1">
          <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
            {days.map(d => {
              const done = completed.has(d);
              const isToday = d === dateStr(today);
              return <span key={d} title={d} className={clsx('w-3.5 h-3.5 rounded-[3px]', done ? 'bg-foreground' : 'bg-muted', isToday && 'ring-1 ring-warm')} />;
            })}
          </div>
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[15px] font-bold text-foreground">Recent check-ins</h2>
          <div className="divide-y divide-border border-t border-border">
            {timeline.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-3">
                {c.mood && <span className="text-xl">{MOOD_EMOJI[c.mood]}</span>}
                {c.proofPhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.proofPhotoUrl} alt="proof" className="w-10 h-10 rounded-lg object-cover border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{c.quantityCompleted ? ` · ${c.quantityCompleted} ${goal.targetUnit || ''}` : ''}</p>
                  {c.note && <p className="text-[13px] text-muted-foreground italic truncate">“{c.note}”</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-2 pt-2">
        {partners.length > 0 && missedDays.length > 0 && (
          <button onClick={() => setShowGrace(true)} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-warm/50 text-warm font-semibold text-sm hover:bg-warm/10"><HeartHandshake className="w-4 h-4" /> Ask a partner for grace</button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={doRestart} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm font-medium hover:bg-muted"><RotateCcw className="w-4 h-4" /> Restart</button>
          <button onClick={doArchive} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:bg-danger/10 hover:text-danger"><Archive className="w-4 h-4" /> Archive</button>
        </div>
      </div>

      {showEdit && <EditGoal goal={goal} onClose={() => setShowEdit(false)} onSaved={load} />}
      {showGrace && <GraceRequest goal={goal} partner={partners[0]} missedDays={missedDays} onClose={() => setShowGrace(false)} onSent={load} />}
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className="py-4 text-center">
      <p className="display text-[40px] leading-none tnum" style={{ color: tint }}>{value}</p>
      <p className="text-[13px] font-medium text-muted-foreground mt-1.5">{label}</p>
    </div>
  );
}

function EditGoal({ goal, onClose, onSaved }: { goal: Goal; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(goal.name);
  const [amount, setAmount] = useState(String(goal.targetValue));
  const [unit, setUnit] = useState(goal.targetUnit || '');
  const [freq, setFreq] = useState(perWeekToFreq(goal.frequencyPerWeek));
  const [visible, setVisible] = useState(goal.visibility === 'PARTNER_VISIBLE');
  const [stake, setStake] = useState(goal.stake || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await patchGoal(goal.id, {
        name: name.trim() || goal.name,
        targetValue: Number(amount) || goal.targetValue,
        targetUnit: unit || undefined,
        frequencyPerWeek: freqToPerWeek(freq),
        visibility: visible ? 'PARTNER_VISIBLE' : 'PRIVATE',
        stake: stake.trim() || undefined,
      });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <Sheet onClose={onClose} title="Edit goal">
      <div className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3.5 rounded-2xl border border-border bg-background font-semibold focus:outline-none focus:border-foreground" />
        <div className="grid grid-cols-2 gap-2">
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit (min, pages…)" className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {FREQS.map(f => <button key={f} onClick={() => setFreq(f)} className={clsx('px-2 py-2 rounded-lg border text-[11px] font-semibold', freq === f ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-background')}>{f}</button>)}
        </div>
        <input value={stake} onChange={e => setStake(e.target.value)} placeholder="Stake (optional) e.g. $5 to charity" className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
        <button onClick={() => setVisible(v => !v)} className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-background">
          <span className="inline-flex items-center gap-2 text-sm font-medium">{visible ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}{visible ? 'Visible to partners' : 'Private to me'}</span>
          <span className={clsx('w-10 h-6 rounded-full transition-colors relative', visible ? 'bg-primary' : 'bg-border')}><span className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', visible ? 'left-[1.125rem]' : 'left-0.5')} /></span>
        </button>
        <button onClick={save} disabled={saving} className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </Sheet>
  );
}

function GraceRequest({ goal, partner, missedDays, onClose, onSent }: { goal: Goal; partner: AccountabilityPartner; missedDays: string[]; onClose: () => void; onSent: () => void }) {
  const [date, setDate] = useState(missedDays[0] || '');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!date || !reason.trim()) return;
    setSending(true);
    try { await requestGrace({ goalId: goal.id, date, reasonNote: reason.trim(), reviewerId: partner.partnerId }); setSent(true); setTimeout(() => { onSent(); onClose(); }, 900); }
    finally { setSending(false); }
  };

  return (
    <Sheet onClose={onClose} title={`Ask ${partner.partnerUser.name.split(' ')[0]} for grace`}>
      {sent ? (
        <div className="py-8 text-center text-sm font-semibold">Grace requested.</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Missed days happen. Ask your partner to keep your streak alive this once.</p>
          <div className="flex flex-wrap gap-2">
            {missedDays.map(d => <button key={d} onClick={() => setDate(d)} className={clsx('px-3 py-1.5 rounded-full border text-xs font-semibold', date === d ? 'border-transparent bg-primary text-primary-foreground' : 'border-border')}>{new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</button>)}
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="What happened?" className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-foreground resize-none" />
          <button onClick={send} disabled={!date || !reason.trim() || sending} className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40">{sending ? 'Sending…' : 'Ask for grace'}</button>
        </div>
      )}
    </Sheet>
  );
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-lg bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl p-5 space-y-4 animate-rise-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}
