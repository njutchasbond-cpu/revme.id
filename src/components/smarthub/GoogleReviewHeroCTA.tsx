'use client';

import * as React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { getSmartHubTheme } from '@/components/smarthub/theme';

export interface GoogleReviewHeroCTAProps {
  reviewUrl: string;
  themePreset?: string | null;
  onLogInteraction: (type: string) => void;
}

export function GoogleReviewHeroCTA({
  reviewUrl,
  themePreset,
  onLogInteraction,
}: GoogleReviewHeroCTAProps) {
  const theme = getSmartHubTheme(themePreset);

  return (
    <a
      href={reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onLogInteraction('click_review')}
      className={`group relative overflow-hidden bg-gradient-to-r ${theme.reviewCtaGradient} rounded-2xl p-4 sm:p-4.5 shadow-xl ${theme.reviewCtaShadow} border ${theme.reviewCtaBorder} flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.99] card-shimmer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-amber-300 shrink-0 border border-white/25 shadow-inner">
          <Star className="w-6 h-6 fill-amber-300" aria-hidden="true" />
        </div>
        <div className="text-left space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Beri Ulasan di Google Maps
            </span>
          </div>
          <div className="text-xs text-blue-100/95 font-medium">
            Ulasan bintang 5 sangat berarti bagi kami
          </div>
          <div className="flex items-center gap-0.5 pt-0.5" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />
            ))}
            <span className="text-[10px] font-semibold text-blue-100 ml-1.5">
              Buka Pop-up Instan
            </span>
          </div>
        </div>
      </div>

      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 ml-2 group-hover:bg-white/20 transition">
        <ExternalLink
          className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform"
          aria-hidden="true"
        />
      </div>
    </a>
  );
}

