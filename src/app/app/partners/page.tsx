'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Send, X, Copy, Check, Link2, Unlink, Sparkles, Flame, Share2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { User, AccountabilityPartner, Goal } from '@/lib/types';
import { getMe, getPartnerships, sendNudge, disconnectPartner, generateInvite, acceptInvite } from '@/lib/appApi';
import { UserAvatar } from '@/components/app/UserAvatar';
import { GoalCheckRow } from '@/components/app/GoalCheckRow';
import { ShareCard } from '@/components/app/ShareCard';

const NUDGE_PRESETS = [
  { type: 'COMPLETION_PUSH' as const, label: 'Your move 👀', message: "Your move today! You've got this." },
  { type: 'CELEBRATION' as const, label: 'Proud of you 🎉', message: "Proud of you for showing up." },
  { type: 'MISSED_DAY_SUPPORT' as const, label: 'Here for you 🤝', message: "No streak lasts without a wobble. Back at it tomorrow." },
  { type: 'STREAK_WARNING' as const, label: "Don't break it 🔥", message: "Don't let the streak slip today!" },
];

export default function PartnersPage() {
  const [me, setMe] = useState<User | null>(null);
  const [partners, setPartners] = useState<AccountabilityPartner[]>([]);
  const [loading, setLoading] = useState(true);

  const [nudgeFor, setNudgeFor] = useState<{ partner: AccountabilityPartner; goal?: Goal } | null>(null);
  const [nudgeText, setNudgeText] = useState('');
  const [nudgeSent, setNudgeSent] = useState(false);
  const [nudgeErr, setNudgeErr] = useState<string | null>(null);

  const [disconnectFor, setDisconnectFor] = useState<AccountabilityPartner | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [shareFor, setShareFor] = useState<AccountabilityPartner | null>(null);

  const load = async () => {
    const [m, p] = await Promise.all([getMe(), getPartnerships()]);
    setMe(m.currentUser);
    setPartners(p);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNudge = (partner: AccountabilityPartner, goal?: Goal) => {
    setNudgeFor({ partner, goal });
    setNudgeText(goal ? `Keep going on ${goal.name}!` : '');
    setNudgeSent(false);
    setNudgeErr(null);
  };

  const doSendNudge = async (message: string, type: any = 'CUSTOM') => {
    if (!nudgeFor || !message.trim()) return;
    setNudgeErr(null);
    try {
      await sendNudge({
        receiverId: nudgeFor.partner.partnerId,
        goalId: nudgeFor.goal?.id,
        goalName: nudgeFor.goal?.name,
        message,
        nudgeType: type,
      });
      setNudgeSent(true);
      setTimeout(() => setNudgeFor(null), 900);
    } catch (e: any) {
      setNudgeErr(e?.message || 'Could not send nudge.');
    }
  };

  const doDisconnect = async () => {
    if (!disconnectFor) return;
    const target = disconnectFor;
    setDisconnectFor(null);
    setPartners(prev => prev.filter(p => p.id !== target.id));
    try { await disconnectPartner(target.partnerId); } catch { load(); }
  };

  if (loading) {
    return <div className="space-y-3 animate-pulse pt-4"><div className="h-8 w-40 bg-muted rounded" /><div className="h-40 bg-muted rounded-2xl mt-4" /></div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Partners</h1>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
          <UserPlus className="w-4 h-4" /> Add
        </button>
      </header>

      {partners.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center space-y-3">
          <Link2 className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No partners yet. Accountability works better with someone beside you.</p>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Bring someone in</button>
        </div>
      ) : (
        <div className="space-y-5">
          {partners.map(p => {
            const done = p.goals.filter(g => g.completedToday).length;
            return (
              <div key={p.id} className="rounded-3xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <UserAvatar src={p.partnerUser.avatarUrl} name={p.partnerUser.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{p.partnerUser.name}</p>
                    <p className="text-xs text-muted-foreground">{done} of {p.goals.length} done today{p.daysSincePaired ? ` · ${p.daysSincePaired}d together` : ''}</p>
                  </div>
                  <button onClick={() => openNudge(p)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-muted text-sm font-semibold hover:bg-border transition-colors">
                    <Send className="w-3.5 h-3.5" /> Nudge
                  </button>
                </div>

                {/* shared streak banner */}
                {(p.sharedStreak || 0) > 0 && (
                  <button onClick={() => setShareFor(p)} className="w-full flex items-center justify-between gap-2 rounded-2xl border border-danger/25 bg-danger/[0.06] px-4 py-3 hover:bg-danger/10 transition-colors">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-danger"><Flame className="w-4 h-4 fill-current" /> {p.sharedStreak} days in sync</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Share2 className="w-3.5 h-3.5" /> Share</span>
                  </button>
                )}

                {p.goals.length > 0 && (
                  <div className="space-y-2">
                    {p.goals.map(g => <GoalCheckRow key={g.id} goal={g} readOnly />)}
                  </div>
                )}

                <button onClick={() => setDisconnectFor(p)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-danger transition-colors">
                  <Unlink className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Nudge composer */}
      {nudgeFor && (
        <Sheet onClose={() => setNudgeFor(null)}>
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar src={nudgeFor.partner.partnerUser.avatarUrl} name={nudgeFor.partner.partnerUser.name} size="sm" />
            <h3 className="font-bold">Nudge {nudgeFor.partner.partnerUser.name.split(' ')[0]}</h3>
          </div>
          {nudgeSent ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-success text-white flex items-center justify-center"><Check className="w-6 h-6 stroke-[3]" /></div>
              <p className="text-sm font-semibold">Sent!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {NUDGE_PRESETS.map(n => (
                  <button key={n.label} onClick={() => doSendNudge(n.message, n.type)} className="p-3 rounded-2xl border border-border bg-background text-sm font-medium text-left hover:bg-muted/60 transition-colors">
                    {n.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={nudgeText}
                  onChange={e => setNudgeText(e.target.value)}
                  placeholder="Write your own…"
                  className="flex-1 p-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                />
                <button onClick={() => doSendNudge(nudgeText)} disabled={!nudgeText.trim()} className="p-3 rounded-2xl bg-primary text-primary-foreground disabled:opacity-30"><Send className="w-4 h-4" /></button>
              </div>
              {nudgeErr && <p className="text-xs text-danger">{nudgeErr}</p>}
              <p className="text-[11px] text-muted-foreground text-center">Up to 5 nudges per partner each hour.</p>
            </div>
          )}
        </Sheet>
      )}

      {/* Disconnect confirm */}
      {disconnectFor && (
        <Modal onClose={() => setDisconnectFor(null)}>
          <h3 className="text-base font-bold">Disconnect from {disconnectFor.partnerUser.name.split(' ')[0]}?</h3>
          <p className="text-sm text-muted-foreground">You'll stop seeing each other's progress. Reconnecting has a 4-hour cooldown.</p>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setDisconnectFor(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={doDisconnect} className="px-4 py-2 bg-danger text-white text-sm font-bold rounded-xl">Disconnect</button>
          </div>
        </Modal>
      )}

      {/* Add partner */}
      {showAdd && <AddPartner me={me} onClose={() => setShowAdd(false)} onPaired={load} />}

      {/* Share streak card */}
      {shareFor && (
        <ShareCard
          bigNumber={shareFor.sharedStreak || 0}
          unit="days in sync"
          caption={`${me?.name.split(' ')[0] || 'You'} & ${shareFor.partnerUser.name.split(' ')[0]}`}
          onClose={() => setShareFor(null)}
        />
      )}
    </div>
  );
}

/* ---- Add partner (share code / enter code) ---- */
function AddPartner({ me, onClose, onPaired }: { me: User | null; onClose: () => void; onPaired: () => void }) {
  const [tab, setTab] = useState<'share' | 'enter'>('share');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinErr, setJoinErr] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (tab === 'share' && !code) generateInvite().then(r => setCode(r.invite.code)).catch(() => {});
  }, [tab, code]);

  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const join = async () => {
    setJoinErr(null);
    try {
      const r = await acceptInvite(joinCode.trim().toUpperCase());
      if (r.success) { setJoined(true); setTimeout(() => { onPaired(); onClose(); }, 900); }
      else setJoinErr(r.error || 'Invalid code.');
    } catch (e: any) { setJoinErr(e?.message || 'Invalid code.'); }
  };

  return (
    <Sheet onClose={onClose}>
      <h3 className="font-bold text-lg mb-3">Add a partner</h3>
      <div className="flex gap-1 p-1 rounded-full bg-muted mb-4">
        {(['share', 'enter'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={clsx('flex-1 py-2 rounded-full text-sm font-semibold transition-colors', tab === t ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
            {t === 'share' ? 'Share my code' : 'Enter a code'}
          </button>
        ))}
      </div>

      {tab === 'share' ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-muted-foreground">Share this private code with someone you trust.</p>
          <div className="rounded-2xl border border-border bg-background p-5">
            <span className="text-4xl font-mono font-bold tracking-[0.15em]">{code || '······'}</span>
          </div>
          <button onClick={copy} disabled={!code} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40">
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy code</>}
          </button>
        </div>
      ) : joined ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-success text-white flex items-center justify-center"><Check className="w-6 h-6 stroke-[3]" /></div>
          <p className="text-sm font-semibold">Paired! You're in this together.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            autoFocus value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter code" maxLength={6}
            className="w-full text-center text-2xl font-mono font-bold tracking-[0.2em] p-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-foreground uppercase"
          />
          {joinErr && <p className="text-xs text-danger text-center">{joinErr}</p>}
          <button onClick={join} disabled={joinCode.trim().length < 4} className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-30">Pair up</button>
        </div>
      )}
    </Sheet>
  );
}

/* ---- shared overlays ---- */
function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-lg bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl p-5 animate-rise-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        {children}
      </div>
    </div>
  );
}
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-3 animate-rise-in" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}
