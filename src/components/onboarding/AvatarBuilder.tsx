'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  accessory: string;
  bgColor: string;
}

const SKIN_TONES = [
  { id: 'fair', color: '#f8d5c2', label: 'Fair' },
  { id: 'warm', color: '#e8b589', label: 'Warm' },
  { id: 'golden', color: '#c68a5c', label: 'Golden' },
  { id: 'deep', color: '#704214', label: 'Deep' },
];

const HAIR_STYLES = [
  { id: 'short', label: 'Short' },
  { id: 'waves', label: 'Waves' },
  { id: 'curly', label: 'Curly' },
  { id: 'bun', label: 'Topknot' },
  { id: 'minimal', label: 'Clean' },
];

const HAIR_COLORS = [
  { id: 'dark', color: '#262626' },
  { id: 'chestnut', color: '#5c3d2e' },
  { id: 'blonde', color: '#d4a359' },
  { id: 'silver', color: '#9ea3a8' },
];

const BG_COLORS = [
  { id: 'neutral', color: '#e5e5e0' },
  { id: 'warm', color: '#f3e8df' },
  { id: 'sage', color: '#dfebd9' },
  { id: 'dusk', color: '#e2e5f0' },
];

interface AvatarBuilderProps {
  value: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

export function AvatarBuilder({ value, onChange }: AvatarBuilderProps) {
  const [config, setConfig] = useState<AvatarConfig>(value);

  const update = (key: keyof AvatarConfig, val: string) => {
    const next = { ...config, [key]: val };
    setConfig(next);
    onChange(next);
  };

  const skin = SKIN_TONES.find(s => s.id === config.skinTone) || SKIN_TONES[0];
  const bg = BG_COLORS.find(b => b.id === config.bgColor) || BG_COLORS[0];
  const hairCol = HAIR_COLORS.find(h => h.id === config.hairColor) || HAIR_COLORS[0];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Avatar Live Preview Box */}
      <div className="flex justify-center py-4">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center relative overflow-hidden transition-colors duration-300 shadow-sm border border-border"
          style={{ backgroundColor: bg.color }}
        >
          {/* Face Base */}
          <div
            className="w-16 h-18 rounded-3xl relative flex flex-col items-center justify-center transition-colors duration-200"
            style={{ backgroundColor: skin.color }}
          >
            {/* Hair */}
            {config.hairStyle === 'short' && (
              <div
                className="absolute -top-2 w-16 h-8 rounded-t-full"
                style={{ backgroundColor: hairCol.color }}
              />
            )}
            {config.hairStyle === 'waves' && (
              <div
                className="absolute -top-3 w-18 h-11 rounded-t-2xl"
                style={{ backgroundColor: hairCol.color }}
              />
            )}
            {config.hairStyle === 'curly' && (
              <div
                className="absolute -top-3 w-18 h-10 rounded-full"
                style={{ backgroundColor: hairCol.color }}
              />
            )}
            {config.hairStyle === 'bun' && (
              <>
                <div
                  className="absolute -top-2 w-15 h-6 rounded-t-full"
                  style={{ backgroundColor: hairCol.color }}
                />
                <div
                  className="absolute -top-5 w-6 h-6 rounded-full"
                  style={{ backgroundColor: hairCol.color }}
                />
              </>
            )}

            {/* Eyes */}
            <div className="flex gap-4 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#1c1c1a]" />
              <div className="w-2 h-2 rounded-full bg-[#1c1c1a]" />
            </div>

            {/* Subtle smile */}
            <div className="w-3 h-1.5 border-b-2 border-[#1c1c1a] rounded-b-full mt-2" />
          </div>
        </div>
      </div>

      {/* Selector Options */}
      <div className="space-y-4 text-xs">
        {/* Skin Tone */}
        <div className="space-y-1.5">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
            Skin Tone
          </span>
          <div className="flex gap-2">
            {SKIN_TONES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => update('skinTone', s.id)}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center',
                  config.skinTone === s.id ? 'border-foreground scale-105' : 'border-transparent'
                )}
                style={{ backgroundColor: s.color }}
                aria-label={s.label}
              >
                {config.skinTone === s.id && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
              </button>
            ))}
          </div>
        </div>

        {/* Hair Style */}
        <div className="space-y-1.5">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
            Style
          </span>
          <div className="flex flex-wrap gap-2">
            {HAIR_STYLES.map(h => (
              <button
                key={h.id}
                type="button"
                onClick={() => update('hairStyle', h.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                  config.hairStyle === h.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                )}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hair Color */}
        <div className="space-y-1.5">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
            Hair Color
          </span>
          <div className="flex gap-2">
            {HAIR_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => update('hairColor', c.id)}
                className={clsx(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  config.hairColor === c.id ? 'border-foreground scale-105' : 'border-transparent'
                )}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>

        {/* Background Tone */}
        <div className="space-y-1.5">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
            Background Tone
          </span>
          <div className="flex gap-2">
            {BG_COLORS.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => update('bgColor', b.id)}
                className={clsx(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  config.bgColor === b.id ? 'border-foreground scale-105' : 'border-transparent'
                )}
                style={{ backgroundColor: b.color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
