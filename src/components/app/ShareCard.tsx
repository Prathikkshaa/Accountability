'use client';

import React, { useEffect, useRef } from 'react';
import { X, Download } from 'lucide-react';

interface ShareCardProps {
  bigNumber: number | string;
  unit: string; // e.g. "days in sync"
  caption: string; // e.g. "Tara & Alex"
  onClose: () => void;
}

// Draws a clean, on-brand streak card straight onto a canvas so it can be
// downloaded as a PNG to share. No external libraries.
export function ShareCard({ bigNumber, unit, caption, onClose }: ShareCardProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  const readVar = (name: string, fallback: string) => {
    try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; } catch { return fallback; }
  };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 1080, H = 1350;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bg = readVar('--background', '#faf5e9');
    const fg = readVar('--primary', '#0b3a5d');
    const warm = readVar('--warm', '#c9a227');
    const muted = readVar('--muted-foreground', '#6d6552');

    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // dotted texture
    ctx.fillStyle = readVar('--pattern', '#e7dcc2');
    for (let y = 40; y < H; y += 44) for (let x = 40; x < W; x += 44) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }

    // card
    const cx = 90, cy = 120, cw = W - 180, chh = H - 240, r = 48;
    ctx.fillStyle = readVar('--card', '#fffdf7');
    roundRect(ctx, cx, cy, cw, chh, r); ctx.fill();
    ctx.strokeStyle = readVar('--border', '#e4dbc5'); ctx.lineWidth = 2; roundRect(ctx, cx, cy, cw, chh, r); ctx.stroke();

    // label
    ctx.fillStyle = muted; ctx.textAlign = 'center';
    ctx.font = '600 34px system-ui, sans-serif';
    ctx.fillText('ACCOUNTABILITY', W / 2, cy + 130);

    // big number
    ctx.fillStyle = fg;
    ctx.font = '800 340px system-ui, sans-serif';
    ctx.fillText(String(bigNumber), W / 2, cy + 560);

    // flame accent
    ctx.font = '160px serif';
    ctx.fillText('🔥', W / 2, cy + 760);

    // unit
    ctx.fillStyle = fg; ctx.font = '700 60px system-ui, sans-serif';
    ctx.fillText(unit, W / 2, cy + 880);

    // caption
    ctx.fillStyle = warm; ctx.font = '600 44px system-ui, sans-serif';
    ctx.fillText(caption, W / 2, cy + 960);

    // footer
    ctx.fillStyle = muted; ctx.font = '500 30px system-ui, sans-serif';
    ctx.fillText('Simple promises, kept together.', W / 2, cy + chh - 70);
  }, [bigNumber, unit, caption]);

  const download = () => {
    const canvas = ref.current; if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `streak-${bigNumber}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-xs space-y-3 animate-rise-in" onClick={e => e.stopPropagation()}>
        <canvas ref={ref} className="w-full rounded-3xl border border-border shadow-xl" />
        <div className="flex gap-2">
          <button onClick={download} className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm"><Download className="w-4 h-4" /> Save image</button>
          <button onClick={onClose} className="w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
