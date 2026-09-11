'use client';

import { useEffect } from 'react';

// Registers the service worker so the installed app works offline.
export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {});
    }
  }, []);
  return null;
}
