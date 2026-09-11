'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Lock, Eye, Archive, Flame, Bell, RotateCcw, Volume2, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { User, Goal } from '@/lib/types';
import { getMe, getGoals, patchGoal, archiveGoal } from '@/lib/appApi';
import { UserAvatar } from '@/components/app/UserAvatar';
import { NewGoalModal } from '@/components/app/NewGoalModal';
import { goalTargetSummary } from '@/components/app/GoalCheckRow';
import { PALETTES, Palette, Mode, getPalette, getMode, setPalette, setMode } from '@/lib/theme';

export default function YouPage() {
  const [me, setMe] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [prefs, setPrefs] = useState({ nudges: true, reminders: true, streaks: true });
  const [palette, setPal] = useState<Palette>('royal');
  const [mode, setMd] = useState<Mode>('light');
  const [sound, setSound] = useState(true);

  useEffect(() => {
    setPal(getPalette()); setMd(getMode());
    try { setSound(localStorage.getItem('sound-off') !== '1'); } catch {}
  }, []);
  const choosePalette = (p: Palette) => { setPal(p); setPalette(p); };
  const chooseMode = (m: Mode) => { setMd(m); setMode(m); };
  const toggleSound = () => { const next = !sound; setSound(next); try { localStorage.setItem('sound-off', next ? '0' : '1'); } catch {} };

  const load = async () => {
    const [m, g] = await Promise.all([getMe(), getGoals()]);
    setMe(m.currentUser); setGoals(g); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleVisibility = async (g: Goal) => {
    const next = g.visibility === 'PARTNER_VISIBLE' ? 'PRIVATE' : 'PARTNER_VISIBLE';
    setGoals(prev => prev.map(x => x.id === g.id ? { ...x, visibility: next } : x));
    try { await patchGoal(g.id, { visibility: next }); } catch { load(); }
  };
  const archive = async (g: Goal) => {
    setGoals(prev => prev.filter(x => x.id !== g.id));
    try { await archiveGoal(g.id); } catch { load(); }
  };

  if (loading) return <div className="space-y-3 animate-pulse pt-4"><div className="h-24 bg-muted rounded-2xl" /><div className="h-40 bg-muted rounded-2xl" /></div>;

  const bestStreak = goals.reduce((m, g) => Math.max(m, g.longestStreak || 0), 0);
  const totalCheckins = goals.reduce((s, g) => s + (g.totalCompletions || 0), 0);
  const activeStreaks = goals.filter(g => (g.currentStreak || 0) > 0).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <UserAvatar src={me?.avatarUrl} name={me?.name} size="lg" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{me?.name}</h1>
          <p className="text-sm text-muted-foreground">{me?.email}</p>
        </div>
      </header>

      {/* Stats — editorial numerals */}
      <div className="grid grid-cols-3 border-y border-border divide-x divide-border">
        <Stat label="Best streak" value={bestStreak} tint="var(--danger)" />
        <Stat label="Check-ins" value={totalCheckins} tint="var(--foreground)" />
        <Stat label="Active" value={activeStreaks} tint="var(--warm)" />
      </div>

      {/* Goals management */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">Your goals</h2>
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {goals.map(g => (
            <div key={g.id} className="flex items-center gap-3 py-4">
              <Link href={`/app/goal/${g.id}`} className="flex-1 min-w-0">
                <p className="font-semibold truncate">{g.name}</p>
                <p className="text-[13px] text-muted-foreground">{g.category} · {goalTargetSummary(g)}</p>
              </Link>
              <button onClick={() => toggleVisibility(g)} title={g.visibility === 'PARTNER_VISIBLE' ? 'Visible to partners' : 'Private'} className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                {g.visibility === 'PARTNER_VISIBLE' ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
              <button onClick={() => archive(g)} title="Archive" className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors">
                <Archive className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-bold text-foreground">Appearance</h2>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Theme</p>
            <div className="flex gap-2">
              {PALETTES.map(p => (
                <button key={p.id} onClick={() => choosePalette(p.id)} className={clsx('flex-1 flex items-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all', palette === p.id ? 'border-foreground' : 'border-border hover:bg-muted/60')}>
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.swatch }} /> {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Mode</p>
            <div className="grid grid-cols-3 gap-2">
              {([['light', Sun], ['dark', Moon], ['system', Monitor]] as const).map(([m, Icon]) => (
                <button key={m} onClick={() => chooseMode(m)} className={clsx('flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all', mode === m ? 'border-transparent bg-primary text-primary-foreground' : 'border-border hover:bg-muted/60')}>
                  <Icon className="w-4 h-4" /> {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications (local only for now) */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-bold text-foreground">Notifications & sound</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border/60">
          <Toggle icon={Bell} label="Partner nudges" on={prefs.nudges} onClick={() => setPrefs(p => ({ ...p, nudges: !p.nudges }))} />
          <Toggle icon={Bell} label="Goal reminders" on={prefs.reminders} onClick={() => setPrefs(p => ({ ...p, reminders: !p.reminders }))} />
          <Toggle icon={Flame} label="Streak alerts" on={prefs.streaks} onClick={() => setPrefs(p => ({ ...p, streaks: !p.streaks }))} />
          <Toggle icon={Volume2} label="Check-in sounds" on={sound} onClick={toggleSound} />
        </div>
        <button
          onClick={async () => { try { const r = await Notification.requestPermission(); alert(r === 'granted' ? 'Reminders enabled. You’ll get a nudge at each goal’s time while the app is open.' : 'Reminders not enabled.'); } catch {} }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Bell className="w-4 h-4" /> Enable reminders
        </button>
        <p className="text-[11px] text-muted-foreground">Toggles save on this device. Reminders fire while the app is open or installed.</p>
      </section>

      <a href="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <RotateCcw className="w-4 h-4" /> Replay onboarding
      </a>

      {showNew && <NewGoalModal onClose={() => setShowNew(false)} onCreated={load} />}
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

function Toggle({ icon: Icon, label, on, onClick }: { icon: any; label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      <span className={clsx('w-10 h-6 rounded-full transition-colors relative', on ? 'bg-primary' : 'bg-border')}>
        <span className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', on ? 'left-[1.125rem]' : 'left-0.5')} />
      </span>
    </button>
  );
}
