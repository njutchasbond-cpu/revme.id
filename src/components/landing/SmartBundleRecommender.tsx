'use client';

import * as React from 'react';
import {
  Check,
  Coffee,
  CreditCard,
  MessageCircle,
  Scissors,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface BundleOption {
  id: string;
  categoryName: string;
  badge: string;
  title: string;
  cardCount: number;
  placement: string;
  insight: string;
  benefits: string[];
}

export const BUNDLE_OPTIONS: BundleOption[] = [
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
      'Bisa diklaim semua ke 1 toko yang sama dalam hitungan menit',
    ],
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
      'Tampilan meja cermin lebih rapi dan berkelas',
    ],
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
      'Mendongkrak reputasi pencarian lokal di Google Maps',
    ],
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
      'Sekali beli untuk selamanya tanpa biaya langganan bulanan',
    ],
  },
];

export interface SmartBundleRecommenderProps {
  selectedBundleId: string;
  onSelectBundleId: (id: string) => void;
  brandName: string;
  orderWhatsAppUrl: string;
}

export function SmartBundleRecommender({
  selectedBundleId,
  onSelectBundleId,
  brandName,
  orderWhatsAppUrl,
}: SmartBundleRecommenderProps) {
  const activeBundle =
    BUNDLE_OPTIONS.find((b) => b.id === selectedBundleId) || BUNDLE_OPTIONS[0];

  return (
    <section id="bundle-recommender" className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge
          variant="blue"
          className="uppercase tracking-wider text-xs font-extrabold text-white"
        >
          <Store className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />
          <span>Rekomendasi Titik Penempatan Strategis</span>
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Jangan Hanya Pasang 1 Kartu di Meja Kasir.
        </h2>
        <p className="text-xs sm:text-sm text-[#d9e8ff]">
          Pilih jenis usaha Anda di bawah ini untuk melihat titik pemasangan kartu yang menghasilkan jumlah tap dan ulasan paling tinggi:
        </p>
      </div>

      {/* Category Selector Tabs */}
      <div
        role="tablist"
        aria-label="Pilih kategori paket bisnis"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {BUNDLE_OPTIONS.map((item) => {
          const isSelected = item.id === selectedBundleId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectBundleId(item.id)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isSelected
                  ? 'bg-[#024aad] border-white text-white shadow-xl shadow-[#024aad]/40'
                  : 'bg-[#071326] border-[#024aad]/45 text-[#d9e8ff] hover:border-[#599bff] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                {item.id === 'fnb' && (
                  <Coffee
                    className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#8ebeff]'}`}
                    aria-hidden="true"
                  />
                )}
                {item.id === 'service' && (
                  <Scissors
                    className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#8ebeff]'}`}
                    aria-hidden="true"
                  />
                )}
                {item.id === 'retail' && (
                  <ShoppingBag
                    className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#8ebeff]'}`}
                    aria-hidden="true"
                  />
                )}
                {item.id === 'starter' && (
                  <CreditCard
                    className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#8ebeff]'}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-white text-[#024aad] border-white'
                      : 'bg-[#040d1f] border-[#024aad]/50 text-white'
                  }`}
                >
                  {item.cardCount} Kartu
                </span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold">
                {item.categoryName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Bundle Card */}
      <Card className="bg-[#071326] border-[#024aad]/50 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <Badge variant="blue" className="text-[11px] font-extrabold text-white">
            {activeBundle.badge}
          </Badge>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {activeBundle.title}
          </h3>
          <div className="text-xs font-extrabold text-[#8ebeff]">
            Formasi Titik Pasang: {activeBundle.placement}
          </div>
          <p className="text-xs sm:text-sm text-[#eef5ff] leading-relaxed bg-[#040d1f] border border-[#024aad]/50 p-4 rounded-2xl">
            <span className="font-extrabold text-white">
              Mengapa strategi ini berhasil:{' '}
            </span>
            {activeBundle.insight}
          </p>
          <ul className="space-y-2 pt-1">
            {activeBundle.benefits.map((b, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-white font-medium"
              >
                <Check
                  className="w-4 h-4 text-[#599bff] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 bg-[#040d1f] border-2 border-[#024aad]/60 rounded-2xl p-6 space-y-4 text-center shadow-xl">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#bcd7ff]">
            Ringkasan Paket Pilihan
          </div>
          <div className="text-3xl font-black text-white">
            {activeBundle.cardCount} Unit Kartu Pintar
          </div>
          <div className="text-xs text-[#d9e8ff]">
            Siap diaktifkan untuk{' '}
            <span className="text-white font-extrabold">{brandName}</span>
          </div>

          <div className="space-y-2.5 pt-2">
            <a
              href={orderWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#024aad] hover:bg-[#1d6ff2] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/30 shadow-lg shadow-[#024aad]/40 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Pesan {activeBundle.title} via WhatsApp</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://shopee.co.id"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] py-2.5 px-3 rounded-xl bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/60 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />
                <span>Order via Shopee</span>
              </a>
              <a
                href="https://tokopedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] py-2.5 px-3 rounded-xl bg-[#071326] hover:bg-[#071d42] border border-[#024aad]/60 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Store className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />
                <span>Order via Tokopedia</span>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
