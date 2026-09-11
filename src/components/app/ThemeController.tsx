'use client';

import { useEffect } from 'react';
import { applyTheme, getMode } from '@/lib/theme';

// Applies the saved palette + light/dark mode on mount and keeps 'system'
// mode in sync with the OS preference.
export function ThemeController() {
  useEffect(() => {
    applyTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (getMode() === 'system') applyTheme(); };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return null;
}
