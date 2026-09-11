'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X, Target, Users as UsersIcon, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import type { Group, SharedGoal } from '@/lib/types';
import { getGroups, createGroup } from '@/lib/appApi';
import { UserAvatar } from '@/components/app/UserAvatar';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => { setGroups(await getGroups()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try { await createGroup(name.trim()); setName(''); setShowCreate(false); await load(); }
    finally { setCreating(false); }
  };

  if (loading) return <div className="space-y-3 animate-pulse pt-4"><div className="h-8 w-32 bg-muted rounded" /><div className="h-40 bg-muted rounded-2xl mt-4" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> New
        </button>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center space-y-3">
          <UsersIcon className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No groups yet. Rally a few people around a shared target.</p>
          <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Start a group</button>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-4 animate-rise-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold">Start a group</h3>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Group name" className="w-full p-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-foreground" />
            <p className="text-xs text-muted-foreground">Up to 15 members can join and chase a shared goal together.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={create} disabled={!name.trim() || creating} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-40">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg tracking-tight">{group.name}</h2>
          <p className="text-xs text-muted-foreground">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex -space-x-2">
          {group.members.slice(0, 4).map(m => (
            <UserAvatar key={m.userId} src={m.avatarUrl} name={m.name} size="sm" className="ring-2 ring-card" />
          ))}
          {group.members.length > 4 && (
            <span className="w-9 h-9 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">+{group.members.length - 4}</span>
          )}
        </div>
      </div>

      {group.sharedGoals.length > 0 ? (
        <div className="space-y-3">
          {group.sharedGoals.map(sg => <SharedGoalRow key={sg.id} sg={sg} />)}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No shared goal yet.</p>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 border-t border-border/60">
        {group.members.slice(0, 8).map(m => (
          <span key={m.userId} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            {m.role === 'ADMIN' && <Crown className="w-3 h-3 text-warm" />}
            {m.name.split(' ')[0]}
          </span>
        ))}
        {group.members.length > 8 && (
          <span className="text-[11px] text-muted-foreground">+{group.members.length - 8} more</span>
        )}
      </div>
    </div>
  );
}

function SharedGoalRow({ sg }: { sg: SharedGoal }) {
  const total = sg.contributions.reduce((s, c) => s + (c.quantity || 0), 0);
  const isCollective = sg.mode === 'COLLECTIVE_TARGET';
  const doneCount = sg.contributions.filter(c => c.completed).length;
  const pct = isCollective
    ? Math.min(100, Math.round((total / sg.targetValue) * 100))
    : Math.round((doneCount / Math.max(1, sg.contributions.length)) * 100);

  return (
    <div className="rounded-2xl bg-muted/50 p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-warm" />
          <span className="font-semibold text-sm">{sg.name}</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background text-muted-foreground">
          {isCollective ? 'Collective' : 'Challenge'}
        </span>
      </div>

      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">
          {isCollective ? `${total} / ${sg.targetValue} ${sg.targetUnit || ''}` : `${doneCount} of ${sg.contributions.length} on track`}
        </span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
    </div>
  );
}
