import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'purple'
  | 'rose'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#071326] text-white border-[#024aad]/45',
  blue: 'bg-[#024aad]/25 text-[#8ebeff] border-[#1d6ff2]/45',
  emerald: 'bg-[#024aad]/25 text-white border-[#599bff]/45',
  amber: 'bg-white/10 text-white border-white/25',
  purple: 'bg-[#024aad]/30 text-[#bcd7ff] border-[#599bff]/40',
  rose: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  outline: 'bg-transparent text-white border-[#1d6ff2]/50',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
