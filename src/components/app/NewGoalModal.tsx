'use client';

import React, { useState } from 'react';
import { X, Lock, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { createGoal } from '@/lib/appApi';
import { mapCommitmentToGoal } from '@/lib/onboardingApi';

const PRESETS = [
  { label: 'Get stronger', category: 'Fitness', amount: '30 minutes' },
  { label: 'Run more', category: 'Fitness', amount: '30 minutes' },
  { label: 'Read', category: 'Learning', amount: '20 pages' },
  { label: 'Study', category: 'Learning', amount: '45 minutes' },
  { label: 'Meditate', category: 'Mindfulness', amount: '10 minutes' },
  { label: 'Write', category: 'Creativity', amount: '500 words' },
];
const FREQS = ['Every day', 'Weekdays', '3x a week', '2x a week'];

export function NewGoalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [amount, setAmount] = useState('30 minutes');
  const [freq, setFreq] = useState('3x a week');
  const [visible, setVisible] = useState(true);
  const [stake, setStake] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = (p: typeof PRESETS[number]) => { setName(p.label); setCategory(p.category); setAmount(p.amount); };

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const mapped = mapCommitmentToGoal({ goal: name.trim(), amount, frequency: freq, timing: '', category });
      await createGoal({ ...mapped, visibility: visible ? 'PARTNER_VISIBLE' : 'PRIVATE', stake: stake.trim() || undefined });
      onCreated();
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-lg bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl p-5 space-y-4 animate-rise-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">New promise</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => pick(p)} className={clsx('px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors', name === p.label ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted/60')}>
              {p.label}
            </button>
          ))}
        </div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Goal name" className="w-full p-3.5 rounded-2xl border border-border bg-background font-semibold focus:outline-none focus:border-foreground" />

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">How much</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
            <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">How often</label>
          <div className="grid grid-cols-4 gap-1.5">
            {FREQS.map(f => (
              <button key={f} onClick={() => setFreq(f)} className={clsx('px-2 py-2 rounded-lg border text-[11px] font-semibold', freq === f ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted/60')}>{f}</button>
            ))}
          </div>
        </div>

        <input value={stake} onChange={e => setStake(e.target.value)} placeholder="Stake if you miss (optional) e.g. $5 to charity" className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />

        <button onClick={() => setVisible(v => !v)} className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-background">
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            {visible ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {visible ? 'Visible to partners' : 'Private to me'}
          </span>
          <span className={clsx('w-10 h-6 rounded-full transition-colors relative', visible ? 'bg-primary' : 'bg-border')}>
            <span className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', visible ? 'left-[1.125rem]' : 'left-0.5')} />
          </span>
        </button>

        <button onClick={save} disabled={!name.trim() || saving} className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40">
          {saving ? 'Adding…' : 'Add promise'}
        </button>
      </div>
    </div>
  );
}
