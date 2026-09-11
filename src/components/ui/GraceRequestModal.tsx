'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, HeartHandshake, Check, ThumbsDown } from 'lucide-react';
import { Button } from './Button';
import { GraceRequest } from '@/lib/types';
import { Avatar } from './Avatar';

interface GraceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: GraceRequest;
  reviewerId: string;
  onReviewed: () => void;
}

export function GraceRequestModal({
  isOpen,
  onClose,
  request,
  reviewerId,
  onReviewed,
}: GraceRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/grace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVIEW',
          graceId: request.id,
          reviewerId,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Review failed');
      }

      onReviewed();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-pop-in">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Streak Grace Request</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-danger/10 text-danger border border-danger/20 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-muted/60 rounded-xl border border-border">
          <Avatar src={request.userAvatar} name={request.userName} size="md" />
          <div>
            <h4 className="text-sm font-semibold">{request.userName}</h4>
            <p className="text-xs text-muted-foreground">
              Requesting grace for <span className="font-medium text-foreground">"{request.goalName}"</span> ({request.date})
            </p>
          </div>
        </div>

        <div className="space-y-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 p-4 rounded-xl text-xs text-amber-900 dark:text-amber-200">
          <span className="font-semibold block">Reason Note:</span>
          <p className="italic">"{request.reasonNote}"</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Giving grace preserves {request.userName}'s streak while maintaining an auditable historical log.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" loading={loading} onClick={() => handleAction('REJECTED')}>
            <ThumbsDown className="w-4 h-4" /> Keep Missed
          </Button>
          <Button variant="primary" loading={loading} onClick={() => handleAction('APPROVED')}>
            <Check className="w-4 h-4" /> Give Grace
          </Button>
        </div>
      </div>
    </div>
  );
}
