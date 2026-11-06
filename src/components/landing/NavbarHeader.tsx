'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Settings } from 'lucide-react';

export interface NavbarHeaderProps {
  orderWhatsAppUrl: string;
}

export function NavbarHeader({ orderWhatsAppUrl }: NavbarHeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#040d1f]/90 border-b border-[#024aad]/40">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] rounded-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[#024aad] border border-white/40 shadow-lg shadow-[#024aad]/50 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/logo-kalcer.png"
              alt="Logo Studio Kalcer SmartHub Card"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-white block leading-none">
              Smart<span className="text-[#599bff]">Hub</span> Card
            </span>
            <span className="text-[11px] text-[#bcd7ff] font-medium">
              by Studio Kalcer • NFC & Dynamic QR
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-xs font-bold text-[#d9e8ff]"
        >
          <a
            href="#live-customizer"
            className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] rounded-md px-1 py-0.5"
          >
            Simulasi Toko Anda
          </a>
          <a
            href="#rating-analyzer"
            className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] rounded-md px-1 py-0.5"
          >
            Kalkulator Rating
          </a>
          <a
            href="#bundle-recommender"
            className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] rounded-md px-1 py-0.5"
          >
            Rekomendasi Paket
          </a>
          <a
            href="#cara-kerja"
            className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] rounded-md px-1 py-0.5"
          >
            Cara Kerja
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={orderWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-1.5 rounded-xl bg-[#024aad] hover:bg-[#1d6ff2] text-xs font-extrabold text-white border border-white/25 shadow-lg shadow-[#024aad]/40 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Pesan Kartu</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#024aad]/50 bg-[#071326] hover:bg-[#071d42] text-xs font-bold text-white transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff]"
          >
            <Settings className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
