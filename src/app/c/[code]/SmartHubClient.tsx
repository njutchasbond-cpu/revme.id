'use client';

import React, { useState } from 'react';
import type { Card } from '@/lib/types';
import { normalizeCardMedia } from '@/lib/image-utils';
import { ProfileHeaderCard } from '@/components/smarthub/ProfileHeaderCard';
import { GoogleReviewHeroCTA } from '@/components/smarthub/GoogleReviewHeroCTA';
import { WifiConnectCard } from '@/components/smarthub/WifiConnectCard';
import { BentoActionGrid } from '@/components/smarthub/BentoActionGrid';
import { ShareProfileDialog } from '@/components/smarthub/ShareProfileDialog';

interface SmartHubClientProps {
  card: Card;
}

export default function SmartHubClient({ card: rawCard }: SmartHubClientProps) {
  const card = normalizeCardMedia(rawCard);
  const [shareOpen, setShareOpen] = useState(false);

  const logInteraction = (type: string) => {
    try {
      fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: card.id,
          interaction_type: type,
        }),
      });
    } catch {
      // Non-blocking background analytics
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center py-6 px-4 sm:px-6 selection:bg-blue-600 selection:text-white">
      <main className="w-full max-w-md flex flex-col space-y-4">
        {/* 1. Header Profil Bisnis & Tombol Bagikan */}
        <ProfileHeaderCard
          card={card}
          onOpenShare={() => {
            setShareOpen(true);
            logInteraction('click_share_profile');
          }}
        />

        {/* 2. Hero CTA: Beri Ulasan di Google Maps */}
        {card.review_url && (
          <GoogleReviewHeroCTA
            reviewUrl={card.review_url}
            themePreset={card.theme_preset}
            onLogInteraction={logInteraction}
          />
        )}

        {/* 3. Koneksi WiFi Instan (Copy Sandi + QR Code WiFi) */}
        {card.wifi_ssid && (
          <WifiConnectCard
            ssid={card.wifi_ssid}
            password={card.wifi_password}
            businessName={card.business_name}
            onLogInteraction={logInteraction}
          />
        )}

        {/* 4. Bento Action Grid (Layanan Utama + Grid 2 Kolom Sosmed & Marketplace) */}
        <BentoActionGrid card={card} onLogInteraction={logInteraction} />

        {/* 5. Footer & B2B Viral Loop */}
        <footer className="pt-6 pb-4 text-center space-y-2.5">
          <div className="inline-block">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-blue-500/40 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Ingin kartu pintar NFC seperti ini untuk bisnis Anda?</span>
              <span className="text-blue-400 font-bold underline underline-offset-2">
                Coba Gratis
              </span>
            </a>
          </div>
          <div>
            <p className="text-xs text-slate-400">
              Diberdayakan oleh{' '}
              <a
                href="https://studiokalcer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline underline-offset-2 transition font-medium"
              >
                studiokalcer.com
              </a>
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Kode Seri: {card.short_code}
            </p>
          </div>
        </footer>

        {/* 6. Modal Bagikan Profil + QR Code */}
        <ShareProfileDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          businessName={card.business_name || 'Profil Bisnis'}
          shortCode={card.short_code}
        />
      </main>
    </div>
  );
}
