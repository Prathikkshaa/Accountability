export type Palette = 'royal' | 'ink' | 'forest';
export type Mode = 'light' | 'dark' | 'system';

export const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: 'royal', label: 'Royal', swatch: '#0b3a5d' },
  { id: 'ink', label: 'Ink', swatch: '#17150f' },
  { id: 'forest', label: 'Forest', swatch: '#1f6b4f' },
];

export function getPalette(): Palette {
  try { return (localStorage.getItem('palette') as Palette) || 'royal'; } catch { return 'royal'; }
}
export function getMode(): Mode {
  try { return (localStorage.getItem('mode') as Mode) || 'light'; } catch { return 'light'; }
}
export function applyTheme() {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  const p = getPalette();
  if (p === 'royal') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', p);
  const m = getMode();
  const dark = m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  el.classList.toggle('dark', dark);
}
export function setPalette(p: Palette) { try { localStorage.setItem('palette', p); } catch {} applyTheme(); }
export function setMode(m: Mode) { try { localStorage.setItem('mode', m); } catch {} applyTheme(); }
