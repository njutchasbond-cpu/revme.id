'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Coffee,
  Copy,
  ExternalLink,
  Instagram,
  Layers,
  MapPin,
  MessageCircle,
  QrCode,
  Scissors,
  ShoppingBag,
  Smartphone,
  Star,
  Store,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface PersonaPreset {
  id: string;
  label: string;
  brandName: string;
  category: string;
  address: string;
  wifiSsid: string;
  wifiPass: string;
  socialHandle: string;
  avatarGrad: string;
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'retail',
    label: 'Distro & Retail',
    brandName: 'Alone Wear Brand',
    category: 'DENIM HOUSE & STORE',
    address: 'Jl. Sukoharjo III, Kec. Sukoharjo, Pringsewu, Lampung',
    wifiSsid: 'AWB',
    wifiPass: 'kopienakbanget',
    socialHandle: '@alonewear.co',
    avatarGrad: 'from-[#024aad] to-[#1d6ff2]',
  },
  {
    id: 'cafe',
    label: 'Kafe & Roastery',
    brandName: 'Kopi Kalcer Roastery',
    category: 'SPECIALTY COFFEE & SPACE',
    address: 'Jl. Senopati No. 48, Kebayoran Baru, Jakarta Selatan',
    wifiSsid: 'Kalcer_5G',
    wifiPass: 'ngopiduluyuk',
    socialHandle: '@kopikalcer.id',
    avatarGrad: 'from-[#024aad] to-[#023b8a]',
  },
  {
    id: 'barber',
    label: 'Barbershop & Salon',
    brandName: 'Gentlemen Cut Studio',
    category: 'PREMIUM BARBERSHOP & GROOMING',
    address: 'Jl. Riau No. 112, Kec. Bandung Wetan, Kota Bandung',
    wifiSsid: 'Gentlemen_VIP',
    wifiPass: 'gantengmaksimal',
    socialHandle: '@gentlemencut.bdg',
    avatarGrad: 'from-[#1d6ff2] to-[#024aad]',
  },
  {
    id: 'resto',
    label: 'Restoran & Kuliner',
    brandName: 'Bumbu Warisan Nusantara',
    category: 'FAMILY RESTAURANT & CATERING',
    address: 'Jl. Malioboro No. 88, Sosromenduran, Yogyakarta',
    wifiSsid: 'Warisan_Free',
    wifiPass: 'makanenakterus',
    socialHandle: '@bumbuwarisan.yk',
    avatarGrad: 'from-[#024aad] to-[#052e6b]',
  },
];

export interface InteractiveSimulatorProps {
  selectedPersona: PersonaPreset;
  onSelectPersona: (persona: PersonaPreset) => void;
  orderWhatsAppUrl: string;
}

export function InteractiveSimulator({
  selectedPersona,
  onSelectPersona,
  orderWhatsAppUrl,
}: InteractiveSimulatorProps) {
  const [previewMode, setPreviewMode] = React.useState<'smart_hub' | 'direct_review'>('smart_hub');
  const [copiedDemoWifi, setCopiedDemoWifi] = React.useState(false);
  const [manualCode, setManualCode] = React.useState('');

  const handleCopyDemoWifi = () => {
    navigator.clipboard.writeText(selectedPersona.wifiPass).catch(() => {});
    setCopiedDemoWifi(true);
    setTimeout(() => setCopiedDemoWifi(false), 2000);
  };

  return (
    <section id="live-customizer" className="space-y-10">
      {/* Hero Headlines */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <Badge
          variant="blue"
          className="px-4 py-1.5 uppercase tracking-wider text-[11px] font-extrabold bg-[#024aad]/30 border-[#1d6ff2]/60 text-white shadow-md shadow-[#024aad]/25"
        >
          <span>Kartu NFC & Dynamic QR All-in-One Pertama dengan First-Tap Claim</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Satu Tap di Kasir untuk{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8ebeff] to-[#1d6ff2]">
            Seluruh Info & Rating Bisnismu.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#d9e8ff] max-w-2xl mx-auto leading-relaxed">
          Gantikan tumpukan stiker QR di meja Anda. Satu kartu pintar untuk mendongkrak ulasan Google Maps bintang 5, membagikan kata sandi WiFi otomatis, membuka buku menu, marketplace, hingga media sosial.
        </p>

        {/* Dual Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={orderWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3.5 rounded-xl bg-[#024aad] hover:bg-[#1d6ff2] text-white font-black text-xs sm:text-sm border border-white/30 shadow-xl shadow-[#024aad]/45 transition transform hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Pesan Kartu Pintar Sekarang</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>

          <a
            href="#simulasi-alur"
            className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3.5 rounded-xl bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/60 text-white font-bold text-xs sm:text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff]"
          >
            <Smartphone className="w-4 h-4 text-[#599bff]" aria-hidden="true" />
            <span>Uji Simulasi Alur Lengkap</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs text-[#d9e8ff] font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#599bff]" aria-hidden="true" />
            <span>Ready Stock (Tanpa Pre-Order)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#599bff]" aria-hidden="true" />
            <span>Aktivasi Mandiri 60 Detik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#599bff]" aria-hidden="true" />
            <span>Sekali Beli Tanpa Biaya Bulanan</span>
          </div>
        </div>
      </div>

      {/* Main Simulator Container */}
      <Card className="bg-[#071326]/90 border-[#024aad]/50 rounded-3xl p-5 sm:p-10 space-y-8 shadow-2xl shadow-[#024aad]/15">
        {/* Top Control Bar: Mode Switcher + Persona Switcher */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#040d1f] border border-[#024aad]/45 rounded-2xl p-4 shadow-lg">
          {/* 1. Mode Switcher (shadcn/ui Tabs) */}
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#bcd7ff]">
              Pilih Simulasi Mode Tampilan Kartu
            </div>
            <Tabs
              defaultValue="smart_hub"
              value={previewMode}
              onValueChange={(v) => setPreviewMode(v as 'smart_hub' | 'direct_review')}
            >
              <TabsList className="bg-[#071326] border-[#024aad]/50">
                <TabsTrigger
                  value="smart_hub"
                  activeClassName="bg-[#024aad] text-white border border-white/25 shadow-md shadow-[#024aad]/40"
                >
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>1. Mode Smart Hub</span>
                </TabsTrigger>
                <TabsTrigger
                  value="direct_review"
                  activeClassName="bg-white text-[#024aad] shadow-md font-extrabold"
                >
                  <Star className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>2. Mode Direct Review</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 2. Preset Persona Bisnis */}
          <div className="space-y-1.5 text-center lg:text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#bcd7ff]">
              Contoh Tampilan Jenis Usaha
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-1.5">
              {PERSONA_PRESETS.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => onSelectPersona(persona)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff] ${
                      isSelected
                        ? 'bg-[#024aad] border-white/50 text-white shadow-md shadow-[#024aad]/35'
                        : 'bg-[#071326] border-[#024aad]/40 text-[#d9e8ff] hover:text-white hover:border-[#599bff]'
                    }`}
                  >
                    {persona.id === 'retail' && <Store className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                    {persona.id === 'cafe' && <Coffee className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />}
                    {persona.id === 'barber' && <Scissors className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />}
                    {persona.id === 'resto' && <Utensils className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />}
                    <span>{persona.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two-Column Preview: Left Physical Card + Right Phone Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3D Physical NFC Card in Studio Kalcer Cobalt Blue */}
          <div className="lg:col-span-6 flex flex-col items-center text-center space-y-5">
            <Badge
              variant="default"
              className="bg-[#040d1f] border-[#024aad]/60 text-white py-1 px-3.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#599bff] animate-ping" aria-hidden="true" />
              <span>Ilustrasi Kartu Fisik di Meja Kasir Anda</span>
            </Badge>

            <Link
              href="/c/AKTIF1"
              className="group relative mx-auto w-72 sm:w-80 h-48 rounded-2xl bg-gradient-to-br from-[#024aad] via-[#023b8a] to-[#040d1f] p-5 text-white shadow-2xl shadow-[#024aad]/35 border-2 border-white/25 hover:border-white/70 flex flex-col justify-between text-left overflow-hidden animate-float-card card-shimmer transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Klik kartu untuk membuka halaman /c/AKTIF1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo-kalcer.png"
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6 rounded-md border border-white/50 object-cover"
                  />
                  <div className="flex items-center gap-0.5 text-amber-300" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
                    ))}
                  </div>
                </div>

                {/* NFC Signal Indicator */}
                <div className="relative flex items-center gap-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-white font-extrabold">
                    NFC TAP
                  </span>
                  <div className="relative w-6 h-6 rounded-full bg-white/15 border border-white/40 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-white animate-radar-pulse" />
                    <span className="absolute inset-0 rounded-full border border-[#8ebeff] animate-radar-pulse-delayed" />
                    <Wifi className="w-3 h-3 text-white rotate-90" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 my-auto">
                <div className="text-[10px] uppercase tracking-widest text-[#bcd7ff] font-extrabold">
                  {previewMode === 'smart_hub'
                    ? 'ALL-IN-ONE SMART HUB'
                    : 'DIRECT GOOGLE REVIEW'}
                </div>
                <div className="text-lg font-black tracking-tight text-white truncate">
                  {selectedPersona.brandName}
                </div>
                <div className="text-[11px] text-[#d9e8ff] truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-white shrink-0" aria-hidden="true" />
                  <span className="truncate">{selectedPersona.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-white pt-2.5 border-t border-white/20">
                <span className="px-2.5 py-0.5 rounded-md bg-white text-[#024aad] text-[10px] font-extrabold group-hover:bg-[#d9e8ff] transition">
                  Klik untuk Simulasi Tap
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <QrCode className="w-3.5 h-3.5 text-[#bcd7ff]" aria-hidden="true" />
                  <span>#AKTIF1</span>
                </div>
              </div>
            </Link>

            <p className="text-xs text-[#d9e8ff] max-w-xs leading-relaxed">
              Pelanggan cukup menempelkan bagian belakang HP (NFC) atau memindai QR Code tanpa perlu mengunduh aplikasi tambahan.
            </p>
          </div>

          {/* Right Column: Interactive Phone Screen Preview */}
          <div className="lg:col-span-6">
            <div className="bg-[#040d1f] border-2 border-[#024aad]/60 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-md mx-auto">
              <div className="w-12 h-1 bg-[#024aad]/60 rounded-full mx-auto mb-4" aria-hidden="true" />

              {previewMode === 'smart_hub' ? (
                <div className="space-y-3 text-left">
                  {/* Phone Store Header */}
                  <div className="bg-[#071326] border border-[#024aad]/45 rounded-2xl p-4 text-center space-y-1.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#024aad] border border-white/35 mx-auto flex items-center justify-center overflow-hidden shadow-md shadow-[#024aad]/40">
                      <img
                        src="/logo-kalcer.png"
                        alt={`Logo ${selectedPersona.brandName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-base font-bold text-white truncate">
                      {selectedPersona.brandName}
                    </div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#599bff]">
                      {selectedPersona.category}
                    </div>
                    <div className="text-[11px] text-[#d9e8ff] truncate flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-[#599bff] shrink-0" aria-hidden="true" />
                      <span className="truncate">{selectedPersona.address}</span>
                    </div>
                  </div>

                  {/* Primary Google Review CTA */}
                  <Link
                    href="/c/AKTIF1"
                    className="block bg-gradient-to-r from-[#024aad] to-[#1d6ff2] hover:from-[#1d6ff2] hover:to-[#024aad] border border-white/25 rounded-xl p-3.5 text-white shadow-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
                          <Star className="w-5 h-5 fill-amber-300 text-amber-300" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold">
                            Beri Ulasan di Google Maps
                          </div>
                          <div className="text-[10px] text-[#eef5ff]">
                            Ulasan bintang 5 sangat berarti bagi kami
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                  </Link>

                  {/* Interactive WiFi Row inside Phone Preview */}
                  <div className="bg-[#071326] border border-[#024aad]/45 rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#024aad]/30 text-[#8ebeff] border border-[#1d6ff2]/40 flex items-center justify-center shrink-0">
                        <Wifi className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          WiFi Pengunjung: {selectedPersona.wifiSsid}
                        </div>
                        <div className="text-[10px] text-[#bcd7ff] font-mono truncate">
                          Sandi: {selectedPersona.wifiPass}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDemoWifi}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#d9e8ff] text-[#024aad] text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 cursor-pointer transition"
                    >
                      {copiedDemoWifi ? (
                        <Check className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3 h-3" aria-hidden="true" />
                      )}
                      <span>{copiedDemoWifi ? 'Tersalin!' : 'Salin Sandi'}</span>
                    </button>
                  </div>

                  {/* 2-Column Bento Channels Preview */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/c/AKTIF1"
                      className="bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/40 rounded-xl p-2.5 flex items-center gap-2 transition"
                    >
                      <BookOpen className="w-4 h-4 text-[#8ebeff] shrink-0" aria-hidden="true" />
                      <span className="text-[11px] font-bold text-white truncate">
                        Buku Menu & Harga
                      </span>
                    </Link>
                    <Link
                      href="/c/AKTIF1"
                      className="bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/40 rounded-xl p-2.5 flex items-center gap-2 transition"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#8ebeff] shrink-0" aria-hidden="true" />
                      <span className="text-[11px] font-bold text-white truncate">
                        Shopee & Tokopedia
                      </span>
                    </Link>
                    <Link
                      href="/c/AKTIF1"
                      className="bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/40 rounded-xl p-2.5 flex items-center gap-2 transition"
                    >
                      <Instagram className="w-4 h-4 text-[#8ebeff] shrink-0" aria-hidden="true" />
                      <span className="text-[11px] font-bold text-white truncate">
                        {selectedPersona.socialHandle}
                      </span>
                    </Link>
                    <Link
                      href="/c/AKTIF1"
                      className="bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/40 rounded-xl p-2.5 flex items-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-[#8ebeff] shrink-0" aria-hidden="true" />
                      <span className="text-[11px] font-bold text-white truncate">
                        WhatsApp Reservasi
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Direct Review Mode Phone Screen */
                <div className="bg-[#071326] border border-[#024aad]/50 rounded-2xl p-5 text-center space-y-4">
                  <Badge variant="blue" className="uppercase text-[10px] font-extrabold text-white">
                    <Zap className="w-3 h-3 text-[#8ebeff]" aria-hidden="true" />
                    <span>Redirect Instan 0 Klik Tambahan</span>
                  </Badge>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-white">
                      {selectedPersona.brandName}
                    </div>
                    <div className="text-xs text-[#d9e8ff]">
                      Membuka jendela penulisan ulasan resmi Google Maps secara langsung:
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-2" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-7 h-7 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <div className="bg-[#040d1f] border border-[#024aad]/40 rounded-xl p-3 text-left text-xs text-[#d9e8ff]">
                    &ldquo;Pelayanan di {selectedPersona.brandName} sangat ramah dan memuaskan. Sangat direkomendasikan!&rdquo;
                  </div>
                  <Link
                    href="/c/DIRECT1"
                    target="_blank"
                    className="block w-full py-2.5 bg-[#024aad] hover:bg-[#1d6ff2] text-white text-xs font-extrabold rounded-xl border border-white/25 transition cursor-pointer"
                  >
                    Coba Mode Direct Review Sekarang
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Simulation Flow Bar & Serial Code Input */}
      <div
        id="simulasi-alur"
        className="bg-[#071326] border border-[#024aad]/50 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2.5 text-center lg:text-left">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#8ebeff]">
            Simulasi Alur Pengguna (Klik untuk Menguji Langsung)
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <Link
              href="/claim/DEMO1"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl bg-white text-[#024aad] hover:bg-[#d9e8ff] font-extrabold text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>1. Uji First-Tap Claim (Kartu Baru)</span>
            </Link>
            <Link
              href="/c/AKTIF1"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl bg-[#024aad] border border-white/30 text-white hover:bg-[#1d6ff2] font-bold text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>2. Tampilan All-in-One Smart Hub</span>
            </Link>
            <Link
              href="/c/DIRECT1"
              target="_blank"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl bg-[#040d1f] border border-[#1d6ff2]/60 text-white hover:bg-[#071d42] font-bold text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#599bff]"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>3. Mode Direct Google Review</span>
            </Link>
          </div>
        </div>

        {/* Serial Code Input */}
        <div className="w-full lg:w-auto lg:min-w-[330px] bg-[#040d1f] p-3.5 rounded-xl border border-[#024aad]/50">
          <label
            htmlFor="serial-code-input"
            className="text-[11px] font-bold text-white mb-1.5 flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-[#599bff]" aria-hidden="true" />
            <span>Sudah Terima Paket Kartu? Cek / Aktivasi:</span>
          </label>
          <div className="flex gap-2">
            <input
              id="serial-code-input"
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Ketik kode (misal: AKTIF1)"
              className="flex-1 min-h-[38px] px-3 py-1.5 text-xs bg-[#071326] border border-[#024aad]/50 rounded-lg outline-none focus:ring-2 focus:ring-[#599bff] uppercase font-mono text-white placeholder:text-[#8ebeff]/60"
            />
            <Link
              href={manualCode ? `/c/${manualCode}` : '/claim/DEMO1'}
              className="min-h-[38px] px-3.5 py-1.5 bg-[#024aad] hover:bg-[#1d6ff2] text-white rounded-lg text-xs font-extrabold border border-white/25 transition inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Buka</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
