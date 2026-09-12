'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeController } from '@/components/app/ThemeController';
import { ReminderScheduler } from '@/components/app/ReminderScheduler';
import { currentUserId } from '@/lib/supabase';
import { acceptInvite } from '@/lib/appApi';

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Two core destinations only: your day, and your person. Groups + settings
// live as header icons on Today — power features, not peers of the daily loop.
const TABS: Tab[] = [
  { href: '/app', label: 'Today', icon: Home },
  { href: '/app/partners', label: 'Partner', icon: Heart },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Auth gate: no Supabase session → send to onboarding/sign-in first.
  useEffect(() => {
    currentUserId()
      .then(async id => {
        if (!id) { router.replace('/'); return; }
        // Auto-pair if they arrived via an invite link before signing in.
        try {
          const pending = localStorage.getItem('pendingInvite');
          if (pending) { localStorage.removeItem('pendingInvite'); await acceptInvite(pending); }
        } catch {}
        setReady(true);
      })
      .catch(() => router.replace('/'));
  }, [router]);

  return (
    <div className="bg-pattern min-h-screen text-foreground font-sans">
      <ThemeController />
      {ready && <ReminderScheduler />}
      <div className="max-w-lg mx-auto w-full px-5 pb-28 pt-6 min-h-screen">{ready ? children : null}</div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40">
        <div className="max-w-xs mx-auto px-5 pb-4">
          <div className="flex items-center justify-around rounded-full border border-border bg-card/90 backdrop-blur-md shadow-lg px-3 py-2">
            {TABS.map(t => {
              const active = t.href === '/app' ? pathname === '/app' : pathname.startsWith(t.href);
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-2 rounded-full transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className={clsx('w-5 h-5', active && 'fill-current')} />
                  <span className="text-sm font-bold">{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
