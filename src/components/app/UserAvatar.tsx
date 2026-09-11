'use client';

import React from 'react';
import { clsx } from 'clsx';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  ring?: boolean;
}

const dims = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
};

export function UserAvatar({ src, name = '', size = 'md', className, ring }: UserAvatarProps) {
  const initial = name ? name[0].toUpperCase() : 'U';
  return (
    <div
      className={clsx(
        'relative rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center font-bold text-muted-foreground',
        dims[size],
        ring && 'ring-2 ring-warm ring-offset-2 ring-offset-background',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
