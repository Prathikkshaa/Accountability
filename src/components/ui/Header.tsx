'use client';

import React, { useState } from 'react';
import { User, Nudge, GraceRequest } from '@/lib/types';
import { Avatar } from './Avatar';
import { Bell, UserCheck, Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onOpenInvite: () => void;
  onOpenNewGoal: () => void;
  nudges: Nudge[];
  pendingGraces: GraceRequest[];
  onReviewGrace: (grace: GraceRequest) => void;
}

export function Header({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenInvite,
  onOpenNewGoal,
  nudges,
  pendingGraces,
  onReviewGrace,
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = nudges.length + pendingGraces.length;

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Active Persona */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
            A
          </div>
          <select
            value={currentUser.id}
            onChange={e => onSwitchUser(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer tracking-tight"
          >
            {allUsers.map(u => (
              <option key={u.id} value={u.id} className="bg-card text-foreground">
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quiet Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-3 space-y-2 z-50 animate-fade-in">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Contextual Activity
                </span>

                {pendingGraces.length > 0 && (
                  <div className="space-y-1.5">
                    {pendingGraces.map(g => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onReviewGrace(g);
                          setNotificationsOpen(false);
                        }}
                        className="p-2 bg-muted/60 hover:bg-muted rounded-lg cursor-pointer text-xs space-y-0.5"
                      >
                        <span className="font-medium text-foreground block">{g.userName} requested grace</span>
                        <span className="text-[11px] text-muted-foreground">"{g.goalName}"</span>
                      </div>
                    ))}
                  </div>
                )}

                {nudges.length > 0 ? (
                  <div className="space-y-1.5">
                    {nudges.map(n => (
                      <div key={n.id} className="p-2 bg-muted/60 rounded-lg text-xs">
                        <span className="font-medium text-foreground block">{n.senderName} nudged you:</span>
                        <span className="text-muted-foreground italic">"{n.message}"</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  pendingGraces.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2 text-center">
                      No new activity.
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenInvite}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" /> Pair
          </button>

          <button
            type="button"
            onClick={onOpenNewGoal}
            className="text-xs font-medium text-foreground hover:opacity-80 flex items-center gap-1 bg-foreground text-background px-2.5 py-1 rounded-full transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Goal
          </button>
        </div>
      </div>
    </header>
  );
}
