import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
      variant === 'default' && 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      variant === 'outline' && 'bg-transparent border-white/15 text-foreground',
      className
    )}
    {...props}
  />
);
