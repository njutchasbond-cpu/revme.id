import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'emerald'
  | 'amber'
  | 'outline'
  | 'secondary'
  | 'ghost';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[#024aad] text-white hover:bg-[#1d6ff2] shadow-lg shadow-[#024aad]/35 border border-[#599bff]/35',
  primary:
    'bg-gradient-to-r from-[#024aad] to-[#1d6ff2] hover:from-[#1d6ff2] hover:to-[#024aad] text-white shadow-lg shadow-[#024aad]/40 border border-white/25',
  emerald:
    'bg-[#024aad] text-white hover:bg-[#1d6ff2] shadow-md shadow-[#024aad]/30 border border-[#599bff]/35',
  amber:
    'bg-[#024aad]/20 text-white hover:bg-[#024aad]/35 border border-[#599bff]/40',
  outline:
    'bg-[#071326]/90 text-white hover:bg-[#052e6b]/60 border border-[#024aad]/45 hover:border-[#599bff]/60',
  secondary:
    'bg-[#071d42] text-white hover:bg-[#052e6b] border border-[#024aad]/50',
  ghost:
    'bg-transparent text-slate-200 hover:bg-[#071d42] hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'min-h-[44px] px-4 py-2.5 text-xs sm:text-sm rounded-xl',
  sm: 'min-h-[36px] px-3 py-1.5 text-xs rounded-xl',
  lg: 'min-h-[48px] px-6 py-3.5 text-xs sm:text-sm rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040d1f] disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
