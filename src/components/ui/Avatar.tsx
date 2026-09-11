import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const dim = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={clsx(
        'relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-medium border border-border bg-neutral-200 dark:bg-neutral-800 text-foreground',
        dim[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function AvatarGroup({ avatars }: { avatars: { src?: string; name: string }[] }) {
  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {avatars.slice(0, 4).map((av, idx) => (
        <Avatar key={idx} src={av.src} name={av.name} size="sm" className="ring-2 ring-background" />
      ))}
      {avatars.length > 4 && (
        <div className="w-7 h-7 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-[10px] font-semibold ring-2 ring-background">
          +{avatars.length - 4}
        </div>
      )}
    </div>
  );
}
