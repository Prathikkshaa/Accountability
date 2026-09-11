'use client';

import React, { useRef, useState } from 'react';
import { X, Camera, Check, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { Goal, MoodState } from '@/lib/types';
import { goalTargetSummary } from './GoalCheckRow';

const MOODS: { state: MoodState; emoji: string; label: string }[] = [
  { state: 'BAD', emoji: '😞', label: 'Rough' },
  { state: 'MEH', emoji: '😐', label: 'Meh' },
  { state: 'GOOD', emoji: '🙂', label: 'Good' },
  { state: 'GREAT', emoji: '😄', label: 'Great' },
  { state: 'AMAZING', emoji: '🤩', label: 'Amazing' },
];

export interface CheckInPayload {
  quantityCompleted?: number;
  mood?: MoodState;
  note?: string;
  proofPhotoUrl?: string;
}

export function CheckInSheet({ goal, onClose, onConfirm }: {
  goal: Goal;
  onClose: () => void;
  onConfirm: (p: CheckInPayload) => void;
}) {
  const needsAmount = goal.measurementType === 'QUANTITY' || goal.measurementType === 'DURATION';
  const [amount, setAmount] = useState<number>(goal.targetValue);
  const [mood, setMood] = useState<MoodState | undefined>();
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // downscale to keep the stored data URL small
        const max = 800;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); setPhoto(canvas.toDataURL('image/jpeg', 0.72)); }
        else setPhoto(reader.result as string);
      };
      img.onerror = () => setPhoto(reader.result as string);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const confirm = () => {
    setSaving(true);
    onConfirm({
      quantityCompleted: needsAmount ? amount : undefined,
      mood,
      note: note.trim() || undefined,
      proofPhotoUrl: photo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-lg bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl p-5 space-y-4 animate-rise-in max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Check in</p>
            <h3 className="font-bold text-lg tracking-tight">{goal.name}</h3>
            <p className="text-xs text-muted-foreground">{goal.category} · {goalTargetSummary(goal)}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {needsAmount && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">How much did you do?</label>
            <div className="flex items-center gap-2">
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="flex-1 p-3 rounded-2xl border border-border bg-background text-lg font-bold focus:outline-none focus:border-foreground" />
              <span className="text-sm text-muted-foreground font-medium">{goal.targetUnit || (goal.measurementType === 'DURATION' ? 'min' : '')}</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">How did it feel? <span className="font-medium normal-case text-muted-foreground/70">optional</span></label>
          <div className="flex justify-between gap-1">
            {MOODS.map(m => (
              <button key={m.state} onClick={() => setMood(mood === m.state ? undefined : m.state)} className={clsx('flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl border transition-all', mood === m.state ? 'border-transparent bg-primary/10 scale-105' : 'border-transparent hover:bg-muted')}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proof <span className="font-medium normal-case text-muted-foreground/70">optional, builds trust</span></label>
          {photo ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="proof" className="w-full h-40 object-cover rounded-2xl border border-border" />
              <button onClick={() => setPhoto(undefined)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors">
              <Camera className="w-4 h-4" /> Add a photo
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        </div>

        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" rows={2} className="w-full p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-foreground resize-none" />

        <button onClick={confirm} disabled={saving} className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
          <Check className="w-4 h-4 stroke-[3]" /> {saving ? 'Saving…' : 'Mark done'}
        </button>
      </div>
    </div>
  );
}
