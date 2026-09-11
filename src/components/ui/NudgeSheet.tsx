'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { clsx } from 'clsx';

interface NudgeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  partnerAvatar?: string;
  partnerId: string;
  senderId: string;
  goalName?: string;
  goalId?: string;
  contextType?: 'COMPLETION_PUSH' | 'STREAK_WARNING' | 'MISSED_DAY_SUPPORT' | 'CELEBRATION';
  onNudgeSent: (nudge: any) => void;
}

export function NudgeSheet({
  isOpen,
  onClose,
  partnerName,
  partnerAvatar,
  partnerId,
  senderId,
  goalName,
  goalId,
  contextType = 'COMPLETION_PUSH',
  onNudgeSent,
}: NudgeSheetProps) {
  const suggestedNudges = [
    { text: 'Your move.', type: 'COMPLETION_PUSH' },
    { text: "Don't break it now. You've come so far!", type: 'STREAK_WARNING' },
    { text: 'One bad day doesn\'t need to become two.', type: 'MISSED_DAY_SUPPORT' },
    { text: 'Looks like this one\'s been tough lately. I\'m rooting for you!', type: 'MISSED_DAY_SUPPORT' },
    { text: 'Keep going! Showing up is winning.', type: 'CELEBRATION' },
  ];

  const defaultMsg = suggestedNudges.find(s => s.type === contextType)?.text || suggestedNudges[0].text;
  const [selectedMessage, setSelectedMessage] = useState(defaultMsg);
  const [customText, setCustomText] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    const messageToSend = isCustom ? customText.trim() : selectedMessage;
    if (!messageToSend) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/nudges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          receiverId: partnerId,
          goalId,
          goalName,
          message: messageToSend,
          nudgeType: contextType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send nudge');
      }

      onNudgeSent(data.nudge);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-pop-in">
      <div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={partnerAvatar} name={partnerName} size="md" />
            <div>
              <h3 className="text-base font-semibold">Nudge {partnerName}</h3>
              <p className="text-xs text-muted-foreground">
                {goalName ? `Regarding "${goalName}"` : 'Send a contextual accountability push'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-danger/10 text-danger border border-danger/20 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Suggested Human Nudges
          </label>
          <div className="space-y-2">
            {suggestedNudges.map((n, idx) => {
              const isSelected = !isCustom && selectedMessage === n.text;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedMessage(n.text);
                    setIsCustom(false);
                  }}
                  className={clsx(
                    'w-full text-left p-3 rounded-xl border text-sm transition-all duration-150',
                    isSelected
                      ? 'border-foreground bg-foreground text-background font-medium shadow-xs'
                      : 'border-border bg-card hover:bg-muted text-foreground'
                  )}
                >
                  "{n.text}"
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setIsCustom(!isCustom)}
            className="text-xs font-medium text-accent hover:underline"
          >
            {isCustom ? '← Choose suggested nudge' : '+ Write custom nudge'}
          </button>

          {isCustom && (
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Write a human, encouraging nudge..."
              className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
              rows={3}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSend}>
            <Send className="w-4 h-4" /> Send Nudge
          </Button>
        </div>
      </div>
    </div>
  );
}
