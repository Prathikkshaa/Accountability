'use client';

import { useEffect } from 'react';

// Registers the service worker so the installed app works offline.
export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
