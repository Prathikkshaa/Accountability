'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { currentUserId } from '@/lib/supabase';
import { acceptInvite } from '@/lib/appApi';

export default function JoinRoute() {
  return (
    <Suspense fallback={<Screen msg="Loading…" />}>
      <Join />
    </Suspense>
  );
}

function Join() {
  const code = (useSearchParams().get('code') || '').toUpperCase();
  const router = useRouter();
  const [msg, setMsg] = useState('Joining…');

  useEffect(() => {
    (async () => {
      if (!code) { router.replace('/'); return; }
      const id = await currentUserId();
      if (!id) {
        // Not signed in yet: remember the code, send them through onboarding,
        // and we'll auto-pair the moment they land in the app.
        try { localStorage.setItem('pendingInvite', code); } catch {}
        router.replace('/');
        return;
      }
      const r = await acceptInvite(code);
      if (r.success) router.replace('/app/partners');
      else setMsg(r.error || 'That invite could not be used.');
    })();
  }, [code, router]);

  return <Screen msg={msg} />;
}

function Screen({ msg }: { msg: string }) {
  return (
    <div className="bg-pattern min-h-screen flex items-center justify-center px-6 text-center">
      <p className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}
