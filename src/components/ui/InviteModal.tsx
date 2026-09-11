'use client';

import React, { useState } from 'react';
import { X, Copy, Check, QrCode, UserPlus, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { InviteCode } from '@/lib/types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onPartnerJoined: () => void;
}

export function InviteModal({
  isOpen,
  onClose,
  userId,
  onPartnerJoined,
}: InviteModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [invite, setInvite] = useState<InviteCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE_INVITE', userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate code');
      setInvite(data.invite);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!invite) return;
    navigator.clipboard.writeText(invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT_INVITE', userId, code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect invite code');

      setSuccessMsg(`Successfully connected with ${data.invite.inviterName}! Your accountability partnership is now active.`);
      setTimeout(() => {
        onPartnerJoined();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-pop-in">
      <div className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Accountability Pairing</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => { setActiveTab('create'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'create' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Invite a Friend
          </button>
          <button
            onClick={() => { setActiveTab('join'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'join' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Enter Code
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-danger/10 text-danger border border-danger/20 rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl font-medium">
            {successMsg}
          </div>
        )}

        {activeTab === 'create' ? (
          <div className="space-y-4 text-center py-2">
            {!invite ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Generate a 6-character code or invite link to share with your trusted accountability partner.
                </p>
                <Button variant="primary" loading={loading} onClick={handleGenerateCode} className="w-full">
                  <Sparkles className="w-4 h-4" /> Generate Invite Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-2xl border border-border flex flex-col items-center justify-center gap-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Your Invite Code</span>
                  <span className="text-3xl font-mono font-bold tracking-widest text-foreground">{invite.code}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">Valid for 7 days</span>
                </div>
                <Button variant="outline" onClick={handleCopy} className="w-full">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Code Copied!' : 'Copy Invite Code'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleAcceptCode} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Partner's Invite Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. K7P4QX"
                className="w-full p-3 text-center text-xl font-mono uppercase tracking-widest rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
              />
            </div>
            <Button variant="primary" loading={loading} type="submit" className="w-full" disabled={!joinCode.trim()}>
              Connect Partner
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
