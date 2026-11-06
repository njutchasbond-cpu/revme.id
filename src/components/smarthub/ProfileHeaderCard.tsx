'use client';

import * as React from 'react';
import { MapPin, Share2, ShieldCheck } from 'lucide-react';
import type { Card as CardModel } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSmartHubTheme } from '@/components/smarthub/theme';

export interface ProfileHeaderCardProps {
  card: CardModel;
  onOpenShare: () => void;
}

export function ProfileHeaderCard({ card, onOpenShare }: ProfileHeaderCardProps) {
  const theme = getSmartHubTheme(card.theme_preset);
  const mapsQueryUrl = card.business_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${card.business_name || ''} ${card.business_address}`
      )}`
    : undefined;

  return (
    <div className="space-y-3">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Badge variant="default" className="bg-slate-900/90 border-slate-800 text-slate-300 text-[11px] py-1 px-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>Profil Resmi Terverifikasi</span>
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenShare}
          aria-label="Bagikan profil bisnis"
          className="rounded-full px-3.5 py-1.5 min-h-[36px] text-xs font-semibold"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
          <span>Bagikan</span>
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden text-center relative border-slate-800/90 bg-gradient-to-b from-slate-900/95 to-slate-900/80">
        {card.banner_url ? (
          <div className="relative h-32 sm:h-36 w-full bg-slate-950">
            <img
              src={card.banner_url}
              alt={`Banner ${card.business_name || 'Bisnis'}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400"
          />
        )}

        <div className={card.banner_url ? 'px-6 pb-6 -mt-10 relative z-10' : 'p-6'}>
          <div
            className={`w-20 h-20 mx-auto rounded-2xl bg-[#024aad] flex items-center justify-center font-black text-3xl text-white shadow-xl ${theme.avatarShadow} mb-3.5 border ${theme.avatarBorder} overflow-hidden ${
              card.banner_url ? 'ring-4 ring-slate-900' : ''
            }`}
          >
            <img
              src={card.logo_url || '/logo-kalcer.png'}
              alt={`Logo ${card.business_name || 'Bisnis'}`}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {card.business_name || 'Nama Bisnis'}
          </h1>

          {card.business_category && (
            <div className="mt-1.5">
              <Badge
                variant={theme.categoryBadgeVariant}
                className="uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5"
              >
                {card.business_category}
              </Badge>
            </div>
          )}

          {card.business_address && (
            <div className="mt-3 flex justify-center">
              {mapsQueryUrl ? (
                <a
                  href={mapsQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-xl hover:bg-slate-800/70 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-2">{card.business_address}</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs px-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-2">{card.business_address}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

