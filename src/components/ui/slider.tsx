'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  ariaLabel?: string;
  className?: string;
}

export function Slider({
  id,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  ariaLabel,
  className,
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex w-full items-center py-2', className)}>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#040d1f] border border-[#024aad]/50">
        <div
          className="h-full bg-gradient-to-r from-[#024aad] to-[#599bff] transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-white bg-[#024aad] shadow-md shadow-[#024aad]/60 transition-all duration-150"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
}
