'use client';

import React, { useState } from 'react';
import { NavbarHeader } from '@/components/landing/NavbarHeader';
import {
  InteractiveSimulator,
  PERSONA_PRESETS,
  type PersonaPreset,
} from '@/components/landing/InteractiveSimulator';
import { ReviewGapCalculator } from '@/components/landing/ReviewGapCalculator';
import {
  BUNDLE_OPTIONS,
  SmartBundleRecommender,
} from '@/components/landing/SmartBundleRecommender';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';

export default function HomePage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaPreset>(
    PERSONA_PRESETS[0]
  );
  const [selectedBundleId, setSelectedBundleId] = useState<string>('fnb');

  const activeBundle =
    BUNDLE_OPTIONS.find((b) => b.id === selectedBundleId) || BUNDLE_OPTIONS[0];

  const buildOrderWhatsAppUrl = (customNote?: string) => {
    const text =
      customNote ||
      `Halo Admin Studio Kalcer, saya sudah mencoba simulasi di web dan ingin memesan SmartHub Card untuk bisnis saya: *${selectedPersona.brandName}* (${activeBundle.title} - ${activeBundle.cardCount} Kartu). Mohon info selanjutnya.`;
    return `https://wa.me/6282278281649?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#040d1f] text-white selection:bg-[#024aad] selection:text-white">
      <NavbarHeader orderWhatsAppUrl={buildOrderWhatsAppUrl()} />

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-24 space-y-24">
        <InteractiveSimulator
          selectedPersona={selectedPersona}
          onSelectPersona={setSelectedPersona}
          orderWhatsAppUrl={buildOrderWhatsAppUrl()}
        />

        <ReviewGapCalculator
          brandName={selectedPersona.brandName}
          buildOrderWhatsAppUrl={buildOrderWhatsAppUrl}
        />

        <SmartBundleRecommender
          selectedBundleId={selectedBundleId}
          onSelectBundleId={setSelectedBundleId}
          brandName={selectedPersona.brandName}
          orderWhatsAppUrl={buildOrderWhatsAppUrl()}
        />

        <HowItWorksSection orderWhatsAppUrl={buildOrderWhatsAppUrl()} />
      </main>

      <footer className="border-t border-[#024aad]/40 bg-[#040d1f] py-8 text-center text-xs text-[#bcd7ff]">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/logo-kalcer.png"
            alt="Logo Studio Kalcer"
            className="w-5 h-5 rounded-md border border-white/40 object-cover"
          />
          <span>
            Diberdayakan oleh{' '}
            <a
              href="https://studiokalcer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#8ebeff] underline underline-offset-2 transition font-bold"
            >
              studiokalcer.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
