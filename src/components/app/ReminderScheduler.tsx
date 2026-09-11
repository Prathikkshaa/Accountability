'use client';

import { useEffect } from 'react';
import { getGoals } from '@/lib/appApi';

// Best-effort local reminders: while the app is open (or installed and
// running), schedule a notification at each incomplete goal's reminder time.
// Full background push needs a server + web-push; this covers the open-app case.
export function ReminderScheduler() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    (async () => {
      try {
        const goals = await getGoals();
        const now = new Date();
        goals.forEach(g => {
          if (g.completedToday || !g.reminderTime) return;
          const [h, m] = g.reminderTime.split(':').map(Number);
          const when = new Date();
          when.setHours(h, m, 0, 0);
          const delay = when.getTime() - now.getTime();
          if (delay > 0 && delay < 86400000) {
            timers.push(setTimeout(() => {
              try { new Notification('Time to show up', { body: `${g.name} — keep your streak alive.`, icon: '/icon.svg' }); } catch {}
            }, delay));
          }
        });
      } catch {}
    })();

    return () => { timers.forEach(clearTimeout); };
  }, []);

  return null;
}
