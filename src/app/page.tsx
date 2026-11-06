'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Settings,
  CheckCircle2,
  Wifi,
  Instagram,
  Layers,
  ExternalLink,
  PackageCheck,
  Search,
  MapPin,
  TrendingUp,
  Clock,
  Zap,
  Store,
  Coffee,
  Scissors,
  ShoppingBag,
  MessageCircle,
  BookOpen,
  Gift,
  Smartphone,
  Check
} from 'lucide-react';
import type { PlacePrediction } from '@/lib/types';

interface BundleOption {
  id: string;
  categoryName: string;
  badge: string;
  title: string;
  cardCount: number;
  placement: string;
  insight: string;
  benefits: string[];
}

const BUNDLE_OPTIONS: BundleOption[] = [
  {
    id: 'fnb',
    categoryName: 'Kafe & Restoran',
    badge: 'Paling Laris (Rekomendasi FnB)',
    title: 'Paket Meja Makan & Kasir (6 Kartu)',
    cardCount: 6,
    placement: '1 Meja Kasir Utama + 5 Meja Makan Pelanggan',
    insight:
      'Pelanggan paling santai memainkan ponsel saat duduk menunggu makanan datang di meja, bukan saat sedang terburu-buru antre membayar di kasir.',
    benefits: [
      'Pelanggan langsung konek WiFi & buka Buku Menu dari meja',
      'Kenaikan ulasan Google Maps hingga 5x lebih cepat dibanding 1 kartu kasir',
      'Bisa diklaim semua ke 1 toko yang sama dalam hitungan menit'
    ]
  },
  {
    id: 'service',
    categoryName: 'Barbershop, Salon & Klinik',
    badge: 'Konversi Tap Tertinggi',
    title: 'Paket Cermin & Kursi Layanan (4 Kartu)',
    cardCount: 4,
    placement: '1 Meja Resepsionis + 3 Cermin / Ruang Tindakan',
    insight:
      'Pelanggan duduk diam menghadap cermin selama 30 hingga 60 menit. Kartu yang menempel tepat di depan cermin memiliki tingkat interaksi hampir 90%.',
    benefits: [
      'Mengisi waktu tunggu pelanggan dengan melihat katalog layanan & sosmed',
      'Memudahkan pelanggan memberi ulasan tepat setelah hasil potong/perawatan selesai',
      'Tampilan meja cermin lebih rapi dan berkelas'
    ]
  },
  {
    id: 'retail',
    categoryName: 'Toko Ritel, Distro & Bengkel',
    badge: 'Favorit UMKM',
    title: 'Paket Kasir & Area Tunggu (2 Kartu)',
    cardCount: 2,
    placement: '1 Meja Kasir + 1 Area Tunggu / Fitting Room',
    insight:
      'Ubah pembeli toko fisik menjadi pelanggan tetap di Shopee, Tokopedia, Instagram, dan TikTok saat mereka menunggu barang dikemas.',
    benefits: [
      'Menampilkan tombol marketplace (Shopee & Tokopedia) untuk repeat order dari rumah',
      'Meningkatkan jumlah pengikut media sosial toko secara organik',
      'Mendongkrak reputasi pencarian lokal di Google Maps'
    ]
  },
  {
    id: 'starter',
    categoryName: 'Coba Satuan (Starter)',
    badge: 'Paket Uji Coba',
    title: 'Paket Starter Meja Kasir (1 Kartu)',
    cardCount: 1,
    placement: '1 Titik Meja Kasir Utama',
    insight:
      'Pilihan hemat untuk membuktikan sendiri kecepatan aktivasi First-Tap Claim 60 detik dan kemudahan mengumpulkan ulasan bintang 5.',
    benefits: [
      'Sudah termasuk fitur lengkap All-in-One Smart Hub & Direct Review',
      'Bebas ubah mode kartu dan tautan kapan saja tanpa batas',
      'Sekali beli untuk selamanya tanpa biaya langganan bulanan'
    ]
  }
];

export default function HomePage() {
  const [manualCode, setManualCode] = useState('');

  // State Strategi 1: Instant Live Brand Customizer
  const [brandSearch, setBrandSearch] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [previewBrandName, setPreviewBrandName] = useState('Alone Wear Brand');
  const [previewBrandCategory, setPreviewBrandCategory] = useState('Denim House & Store');
  const [previewBrandAddress, setPreviewBrandAddress] = useState(
    'Jl. Sukoharjo III, Kec. Sukoharjo, Pringsewu, Lampung'
  );
  const [isCustomPreview, setIsCustomPreview] = useState(false);

  // State Mode Switcher & Strategi 4 (Reward Callout)
  const [previewMode, setPreviewMode] = useState<'smart_hub' | 'direct_review'>('smart_hub');
  const [showRewardBanner, setShowRewardBanner] = useState(true);

  // State Strategi 2: Review Gap Analyzer (Kalkulator Target Bintang)
  const [currentRating, setCurrentRating] = useState<number>(4.2);
  const [currentReviews, setCurrentReviews] = useState<number>(25);
  const [targetRating, setTargetRating] = useState<number>(4.8);
  const [dailyTaps, setDailyTaps] = useState<number>(5);

  // State Strategi 3: Smart Bundle Recommender
  const [selectedBundleId, setSelectedBundleId] = useState<string>('fnb');

  // Debounced pencarian nama toko real-time
  useEffect(() => {
    if (!brandSearch || brandSearch.trim().length < 2) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlace(true);
      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(brandSearch)}`
        );
        const data = await res.json();
        if (data.predictions) {
          setPredictions(data.predictions);
          setShowDropdown(true);
        }
      } catch (err) {
        // Fallback tenang jika offline
      } finally {
        setIsSearchingPlace(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brandSearch]);

  const handleSelectPrediction = (item: PlacePrediction) => {
    const cleanName = item.main_text.replace(/^Gunakan nama:\s*"|"$|/g, '');
    setPreviewBrandName(cleanName || 'Bisnis Anda');
    setPreviewBrandAddress(
      item.place_id.startsWith('custom_')
        ? 'Lokasi Terverifikasi Google Maps'
        : item.secondary_text || item.description
    );
    setPreviewBrandCategory('Official Business Hub');
    setBrandSearch(cleanName);
    setIsCustomPreview(true);
    setShowDropdown(false);
  };

  const handleManualBrandTyping = (val: string) => {
    setBrandSearch(val);
    if (val.trim().length > 0) {
      setPreviewBrandName(val.trim());
      setIsCustomPreview(true);
    } else {
      setPreviewBrandName('Alone Wear Brand');
      setPreviewBrandCategory('Denim House & Store');
      setPreviewBrandAddress('Jl. Sukoharjo III, Kec. Sukoharjo, Pringsewu, Lampung');
      setIsCustomPreview(false);
    }
  };

  // Perhitungan Matematika Review Gap Analyzer
  const safeTarget = Math.max(targetRating, currentRating + 0.1);
  const rawNeeded = Math.ceil(
    (currentReviews * (safeTarget - currentRating)) / (5 - safeTarget)
  );
  const reviewsNeeded = Math.max(5, isFinite(rawNeeded) && rawNeeded > 0 ? rawNeeded : 15);
  const daysWithCard = Math.max(1, Math.ceil(reviewsNeeded / dailyTaps));
  const monthsWithoutCard = Math.max(1, Math.round(reviewsNeeded / 3)); // Asumsi manual hanya ~3 ulasan/bulan

  const activeBundle =
    BUNDLE_OPTIONS.find((b) => b.id === selectedBundleId) || BUNDLE_OPTIONS[0];

  // Generator Link Pemesanan WhatsApp Terpersonalisasi
  const buildOrderWhatsAppUrl = (customNote?: string) => {
    const storeLabel = isCustomPreview ? previewBrandName : 'Bisnis Saya';
    const text =
      customNote ||
      `Halo Admin Studio Kalcer, saya sudah mencoba simulasi di web dan ingin memesan SmartHub Card untuk bisnis saya: *${storeLabel}* (${activeBundle.title} - ${activeBundle.cardCount} Kartu). Mohon info selanjutnya.`;
    return `https://wa.me/6282278281649?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/85 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                Smart<span className="text-blue-500">Hub</span> Card
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                NFC & Dynamic QR Business Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#live-customizer" className="hover:text-white transition">
              Simulasi Toko Anda
            </a>
            <a href="#rating-analyzer" className="hover:text-white transition">
              Kalkulator Rating
            </a>
            <a href="#bundle-recommender" className="hover:text-white transition">
              Rekomendasi Paket
            </a>
            <a href="#cara-kerja" className="hover:text-white transition">
              Cara Kerja
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={buildOrderWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition"
            >
              Pesan Kartu <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" /> Admin Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-24 space-y-24">
        {/* =====================================================================
            HERO SECTION & STRATEGI 1: INSTANT LIVE BRAND CUSTOMIZER
        ===================================================================== */}
        <section id="live-customizer" className="space-y-10">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Kartu NFC & Dynamic QR All-in-One Pertama dengan First-Tap Claim
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Satu Tap di Kasir untuk{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400">
                Seluruh Info & Rating Bisnismu.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Gantikan tumpukan stiker QR di meja Anda. Satu kartu pintar untuk mendongkrak ulasan Google Maps bintang 5, membagikan kata sandi WiFi otomatis, membuka buku menu, marketplace, hingga media sosial.
            </p>

            {/* Dual Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={buildOrderWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
              >
                <span>Pesan Kartu Pintar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#simulasi-alur"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs sm:text-sm transition"
              >
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Uji Simulasi Alur Lengkap</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ready Stock (Tanpa Pre-Order)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aktivasi Mandiri 60 Detik</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sekali Beli Tanpa Biaya Bulanan</span>
              </div>
            </div>
          </div>

          {/* =====================================================================
              LIVE 3D FLOATING CARD + INTERACTIVE PHONE SCREEN PREVIEW
          ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-10">
            {/* Kolom Kiri: Kartu Fisik NFC Interaktif (5 Kolom) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Ilustrasi Kartu Fisik di Meja Kasir Anda</span>
              </div>

              {/* Kartu Fisik dengan Animasi CSS GPU Floating + Shimmer + NFC Radar Pulse */}
              <Link
                href="/c/AKTIF1"
                className="group relative mx-auto w-72 sm:w-80 h-48 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-2xl border border-slate-700/80 hover:border-blue-500/60 flex flex-col justify-between text-left overflow-hidden animate-float-card card-shimmer transition"
                title="Klik kartu untuk simulasi Tap!"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  {/* Indikator Gelombang Sinyal NFC */}
                  <div className="relative flex items-center gap-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-blue-300 font-semibold">
                      NFC TAP
                    </span>
                    <div className="relative w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full border border-blue-400 animate-radar-pulse" />
                      <span className="absolute inset-0 rounded-full border border-blue-300 animate-radar-pulse-delayed" />
                      <Wifi className="w-3 h-3 text-blue-300 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 my-auto">
                  <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                    {previewMode === 'smart_hub'
                      ? 'ALL-IN-ONE SMART HUB'
                      : 'DIRECT GOOGLE REVIEW'}
                  </div>
                  <div className="text-lg font-black tracking-tight text-white truncate">
                    {previewBrandName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{previewBrandAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-800/90">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-semibold text-white group-hover:bg-blue-600 transition">
                      Klik untuk Simulasi Tap
                    </span>
                  </div>
                  <div className="font-mono text-slate-300">#AKTIF1</div>
                </div>
              </Link>

              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Pelanggan cukup menempelkan bagian belakang HP (NFC) atau memindai QR Code tanpa perlu mengunduh aplikasi tambahan.
              </p>
            </div>

            {/* Kolom Kanan: Live Mode Switcher & Layar HP Interaktif (7 Kolom) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Bar Kontrol Sakelar Mode & Strategi 4 (Banner Pancingan Ulasan) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('smart_hub')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      previewMode === 'smart_hub'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Mode Smart Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('direct_review')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      previewMode === 'direct_review'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2. Mode Direct Review
                  </button>
                </div>

                {/* Toggle Strategi 4: In-Store Reward Banner */}
                {previewMode === 'smart_hub' && (
                  <button
                    type="button"
                    onClick={() => setShowRewardBanner(!showRewardBanner)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      showRewardBanner
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>
                      {showRewardBanner
                        ? 'Promo Pancingan Ulasan: Aktif'
                        : 'Aktifkan Promo Ulasan'}
                    </span>
                  </button>
                )}
              </div>

              {/* Simulasi Layar Smartphone */}
              <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-md mx-auto">
                <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-4" />

                {previewMode === 'smart_hub' ? (
                  <div className="space-y-3 text-left">
                    {/* Header Toko di Layar HP */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto flex items-center justify-center text-lg font-black text-white shadow-md">
                        {previewBrandName.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-base font-bold text-white truncate">
                        {previewBrandName}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                        {previewBrandCategory}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {previewBrandAddress}
                      </div>
                    </div>

                    {/* Strategi 4: Banner Pancingan Ulasan Kasir */}
                    {showRewardBanner && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2.5 text-amber-300">
                        <Gift className="w-4 h-4 shrink-0 text-amber-400" />
                        <div className="text-[11px] leading-snug">
                          <span className="font-bold">Promo Hari Ini:</span> Tunjukkan ulasan bintang 5 Anda ke kasir untuk mendapatkan Diskon / Gratis Minuman!
                        </div>
                      </div>
                    )}

                    {/* Tombol Utama Google Review */}
                    <Link
                      href="/c/AKTIF1"
                      className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl p-3.5 text-white shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                            <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">
                              Beri Ulasan di Google Maps
                            </div>
                            <div className="text-[10px] text-blue-100">
                              Ulasan bintang 5 sangat berarti bagi kami
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-100" />
                      </div>
                    </Link>

                    {/* Baris WiFi Instan */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            WiFi Pengunjung: {previewBrandName.split(' ')[0]}_Free
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Sandi: 12345678
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 text-[10px] font-bold">
                        Salin Sandi
                      </span>
                    </div>

                    {/* Grid Kanal Lainnya (Menu, Shopee, Tokopedia, IG) */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-200 truncate">
                          Buku Menu & Harga
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-200 truncate">
                          Shopee & Tokopedia
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-200 truncate">
                          Instagram & TikTok
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-200 truncate">
                          WhatsApp Reservasi
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tampilan Mode Direct Google Review */
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                      <Zap className="w-3 h-3" /> Redirect Instan 0 Klik Tambahan
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-bold text-white">
                        {previewBrandName}
                      </div>
                      <div className="text-xs text-slate-400">
                        Membuka jendela penulisan ulasan resmi Google Maps secara langsung:
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-7 h-7 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left text-xs text-slate-400">
                      &ldquo;Pelayanan di {previewBrandName} sangat ramah dan memuaskan. Sangat direkomendasikan!&rdquo;
                    </div>
                    <Link
                      href="/c/DIRECT1"
                      target="_blank"
                      className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
                    >
                      Coba Mode Direct Review Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================================
              SIMULASI ALUR PENGGUNA (3 TOMBOL INSTAN) & AKSES KODE SERI
          ===================================================================== */}
          <div
            id="simulasi-alur"
            className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 text-center lg:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Simulasi Alur Pengguna (Klik untuk Menguji Langsung)
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <Link
                  href="/claim/DEMO1"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs transition"
                >
                  <Sparkles className="w-4 h-4" /> 1. Uji First-Tap Claim (Kartu Baru)
                </Link>
                <Link
                  href="/c/AKTIF1"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 font-semibold text-xs transition"
                >
                  <Layers className="w-4 h-4" /> 2. Tampilan All-in-One Smart Hub
                </Link>
                <Link
                  href="/c/DIRECT1"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-xs transition"
                >
                  <Star className="w-4 h-4 fill-emerald-400" /> 3. Mode Direct Google Review
                </Link>
              </div>
            </div>

            {/* Input Manual Kode Kartu bagi yang Sudah Membeli */}
            <div className="w-full lg:w-auto lg:min-w-[320px] bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-blue-400" /> Sudah Terima Paket Kartu? Cek / Aktivasi:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Ketik kode (misal: DEMO1)"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono text-white placeholder:text-slate-600"
                />
                <Link
                  href={manualCode ? `/c/${manualCode}` : '/claim/DEMO1'}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                >
                  Buka <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            STRATEGI 2: REVIEW GAP ANALYZER (KALKULATOR TARGET RATING GOOGLE MAPS)
        ===================================================================== */}
        <section
          id="rating-analyzer"
          className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8"
        >
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Diagnosa Kebutuhan Ulasan Google Maps
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Berapa Lama Toko Anda Mencapai Rating 4.8+ Bintang?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pelanggan yang kecewa hampir selalu menulis ulasan buruk, sedangkan 95% pelanggan yang puas lupa memberi ulasan karena malas mencari nama toko secara manual di Google Maps. Hitung perbedaannya di bawah ini:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Parameter Input Slider (7 Kolom) */}
            <div className="lg:col-span-7 space-y-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6">
              {/* Pilihan Rating Saat Ini */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">1. Rating Google Maps Toko Saat Ini:</span>
                  <span className="text-amber-400 font-bold">{currentRating.toFixed(1)} Bintang</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[3.8, 4.0, 4.2, 4.4, 4.6].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setCurrentRating(val);
                        if (targetRating <= val) {
                          setTargetRating(Number(Math.min(4.9, val + 0.3).toFixed(1)));
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        currentRating === val
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {val.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Jumlah Ulasan Saat Ini */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">2. Total Ulasan yang Sudah Ada Sekarang:</span>
                  <span className="text-blue-400 font-bold">{currentReviews} Ulasan</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={currentReviews}
                  onChange={(e) => setCurrentReviews(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5 Ulasan (Toko Baru)</span>
                  <span>100 Ulasan</span>
                  <span>200 Ulasan</span>
                </div>
              </div>

              {/* Pilihan Target Rating */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">3. Target Rating Impian Anda:</span>
                  <span className="text-emerald-400 font-bold">{safeTarget.toFixed(1)} Bintang</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[4.7, 4.8, 4.9].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetRating(val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        targetRating === val
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Target {val.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Tap Harian */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">4. Estimasi Pelanggan Tap Kartu per Hari:</span>
                  <span className="text-blue-400 font-bold">{dailyTaps} Pelanggan / Hari</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  step={1}
                  value={dailyTaps}
                  onChange={(e) => setDailyTaps(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>2 Tap/Hari (Sepi)</span>
                  <span>10 Tap/Hari (Normal)</span>
                  <span>25 Tap/Hari (Ramai)</span>
                </div>
              </div>
            </div>

            {/* Kartu Hasil Diagnosa Perbandingan (5 Kolom) */}
            <div className="lg:col-span-5 bg-slate-950 border-2 border-blue-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hasil Diagnosa untuk {previewBrandName}
                </div>
                <div className="text-sm text-slate-300">
                  Untuk naik dari <span className="font-bold text-white">{currentRating.toFixed(1)}</span> ke{' '}
                  <span className="font-bold text-emerald-400">{safeTarget.toFixed(1)} Bintang</span>, Anda membutuhkan:
                </div>
                <div className="text-3xl font-black text-blue-400 pt-1">
                  +{reviewsNeeded} Ulasan Bintang 5
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-rose-300">
                      Cara Lama (Tanpa Kartu NFC)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Pelanggan harus cari manual di aplikasi Maps
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-rose-400">
                      ~{monthsWithoutCard} Bulan
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-300">
                      Dengan SmartHub Card ({dailyTaps} Tap/Hari)
                    </div>
                    <div className="text-[11px] text-emerald-200/80">
                      Pop-up bintang 5 terbuka dalam 1 detik
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">
                      {daysWithCard} Hari Saja!
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={buildOrderWhatsAppUrl(
                  `Halo Admin Studio Kalcer, saya ingin mengejar target rating ${safeTarget.toFixed(
                    1
                  )} Bintang (+${reviewsNeeded} ulasan baru) untuk bisnis saya *${previewBrandName}*. Mohon info pemesanan SmartHub Card.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition"
              >
                <span>Kejar Target Rating {safeTarget.toFixed(1)} Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* =====================================================================
            STRATEGI 3: SMART BUNDLE RECOMMENDER (REKOMENDASI TITIK PASANG)
        ===================================================================== */}
        <section id="bundle-recommender" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" /> Rekomendasi Titik Penempatan Strategis
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Jangan Hanya Pasang 1 Kartu di Meja Kasir.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Pilih jenis usaha Anda di bawah ini untuk melihat titik pemasangan kartu yang menghasilkan jumlah tap dan ulasan paling tinggi:
            </p>
          </div>

          {/* Tab Kategori Bisnis */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {BUNDLE_OPTIONS.map((item) => {
              const isSelected = item.id === selectedBundleId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedBundleId(item.id)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-950/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {item.id === 'fnb' && <Coffee className="w-5 h-5 text-blue-400" />}
                    {item.id === 'service' && <Scissors className="w-5 h-5 text-emerald-400" />}
                    {item.id === 'retail' && <ShoppingBag className="w-5 h-5 text-amber-400" />}
                    {item.id === 'starter' && <Sparkles className="w-5 h-5 text-purple-400" />}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                      {item.cardCount} Kartu
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold">{item.categoryName}</div>
                </button>
              );
            })}
          </div>

          {/* Detail Paket Rekomendasi Aktif */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                {activeBundle.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeBundle.title}
              </h3>
              <div className="text-xs font-semibold text-blue-400">
                Formasi Titik Pasang: {activeBundle.placement}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
                <span className="font-bold text-white">Mengapa strategi ini berhasil: </span>
                {activeBundle.insight}
              </p>
              <ul className="space-y-2 pt-1">
                {activeBundle.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ringkasan Paket Pilihan
              </div>
              <div className="text-3xl font-black text-white">
                {activeBundle.cardCount} Unit Kartu Pintar
              </div>
              <div className="text-xs text-slate-400">
                Siap diaktifkan untuk <span className="text-white font-semibold">{previewBrandName}</span>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={buildOrderWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pesan {activeBundle.title} via WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://shopee.co.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Order via Shopee
                  </a>
                  <a
                    href="https://tokopedia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Store className="w-3.5 h-3.5" /> Order via Tokopedia
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CARA KERJA 3 LANGKAH & KEUNGGULAN UTAMA
        ===================================================================== */}
        <section id="cara-kerja" className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Sistem First-Tap Claim Tanpa Pre-Order
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Aktif dalam 60 Detik Begitu Kartu Tiba di Tangan Anda.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-800 font-mono">01</span>
              </div>
              <h3 className="font-bold text-white text-base">
                Terima Kartu Fisik (Ready Stock)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tidak perlu menunggu proses cetak custom berhari-hari. Kartu dikirim langsung dan siap diaktifkan oleh pemilik toko saat paket dibuka.
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-800 font-mono">02</span>
              </div>
              <h3 className="font-bold text-white text-base">
                Tap Pertama untuk Klaim Toko
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tempelkan HP Anda ke kartu, ketik nama bisnis Anda di pencarian resmi Google Maps, lalu masukkan info WiFi dan tautan toko dalam 60 detik.
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-800 font-mono">03</span>
              </div>
              <h3 className="font-bold text-white text-base">
                Pajang & Kumpulkan Bintang 5
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kartu otomatis terkunci ke bisnis Anda. Setiap pelanggan yang men-tap akan langsung diarahkan ke ulasan Google Maps dan kanal resmi toko.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
            BOTTOM CONVERSION CTA BANNER
        ===================================================================== */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Siap Mengubah Setiap Pengunjung Menjadi Ulasan Bintang 5?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Miliki SmartHub Card hari ini. Satu investasi kecil sekali beli untuk mendongkrak reputasi Google Maps dan seluruh kanal penjualan bisnis Anda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={buildOrderWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-xl transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pesan Sekarang via WhatsApp</span>
            </a>
            <Link
              href="/claim/DEMO1"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-blue-900/50 hover:bg-blue-900/70 border border-blue-400/30 text-white font-semibold text-xs sm:text-sm transition"
            >
              <span>Coba Simulasi Klaim Kartu Baru</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-600">
        Diberdayakan oleh{' '}
        <a
          href="https://studiokalcer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition"
        >
          studiokalcer.com
        </a>
      </footer>
    </div>
  );
}
