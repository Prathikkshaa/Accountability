'use client';

import React from 'react';
import { PRESET_AVATARS } from '@/lib/onboardingState';
import { clsx } from 'clsx';

interface V2AvatarProps {
  avatarId: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function V2Avatar({ avatarId, name = '', size = 'md', className }: V2AvatarProps) {
  const preset = PRESET_AVATARS.find(a => a.id === avatarId) || PRESET_AVATARS[0];

  const dimMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const initial = name ? name[0].toUpperCase() : 'U';

  return (
    <div
      className={clsx(
        'relative rounded-full flex items-center justify-center font-semibold border border-border/60 shrink-0 transition-transform duration-200',
        dimMap[size],
        className
      )}
      style={{ backgroundColor: preset.bg }}
    >
      <div
        className="w-3/5 h-3/5 rounded-full flex items-center justify-center font-bold text-neutral-800 shadow-xs"
        style={{ backgroundColor: preset.skin }}
      >
        {initial}
      </div>
    </div>
  );
}
