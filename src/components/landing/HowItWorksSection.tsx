'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface HowItWorksSectionProps {
  orderWhatsAppUrl: string;
}

export function HowItWorksSection({ orderWhatsAppUrl }: HowItWorksSectionProps) {
  return (
    <>
      <section id="cara-kerja" className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge
            variant="blue"
            className="uppercase tracking-wider text-xs font-extrabold text-white"
          >
            <Clock className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />
            <span>Sistem First-Tap Claim Tanpa Pre-Order</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Aktif dalam 60 Detik Begitu Kartu Tiba di Tangan Anda.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-[#071326] border-[#024aad]/50 p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#024aad] border border-white/30 text-white flex items-center justify-center shadow-md shadow-[#024aad]/40">
                <PackageCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-2xl font-black text-[#1d6ff2]/60 font-mono">
                01
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base">
              Terima Kartu Fisik (Ready Stock)
            </h3>
            <p className="text-xs text-[#d9e8ff] leading-relaxed">
              Tidak perlu menunggu proses cetak custom berhari-hari. Kartu dikirim langsung dan siap diaktifkan oleh pemilik toko saat paket dibuka.
            </p>
          </Card>

          <Card className="bg-[#071326] border-[#024aad]/50 p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#024aad] border border-white/30 text-white flex items-center justify-center shadow-md shadow-[#024aad]/40">
                <Smartphone className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-2xl font-black text-[#1d6ff2]/60 font-mono">
                02
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base">
              Tap Pertama untuk Klaim Toko
            </h3>
            <p className="text-xs text-[#d9e8ff] leading-relaxed">
              Tempelkan HP Anda ke kartu, ketik nama bisnis Anda di pencarian resmi Google Maps, lalu masukkan info WiFi dan tautan toko dalam 60 detik.
            </p>
          </Card>

          <Card className="bg-[#071326] border-[#024aad]/50 p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#024aad] border border-white/30 text-white flex items-center justify-center shadow-md shadow-[#024aad]/40">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-2xl font-black text-[#1d6ff2]/60 font-mono">
                03
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base">
              Pajang & Kumpulkan Bintang 5
            </h3>
            <p className="text-xs text-[#d9e8ff] leading-relaxed">
              Kartu otomatis terkunci ke bisnis Anda. Setiap pelanggan yang men-tap akan langsung diarahkan ke ulasan Google Maps dan kanal resmi toko.
            </p>
          </Card>
        </div>
      </section>

      {/* Bottom Conversion CTA Banner in Exact Studio Kalcer Cobalt Blue */}
      <section className="bg-gradient-to-br from-[#024aad] via-[#023b8a] to-[#071d42] border-2 border-white/25 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-[#024aad]/40">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#024aad] border-2 border-white shadow-xl overflow-hidden flex items-center justify-center">
          <img
            src="/logo-kalcer.png"
            alt="Logo Studio Kalcer"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
          Siap Mengubah Setiap Pengunjung Menjadi Ulasan Bintang 5?
        </h2>
        <p className="text-xs sm:text-sm text-[#eef5ff] max-w-xl mx-auto leading-relaxed">
          Miliki SmartHub Card hari ini. Satu investasi kecil sekali beli untuk mendongkrak reputasi Google Maps dan seluruh kanal penjualan bisnis Anda.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={orderWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3.5 rounded-xl bg-white text-[#024aad] hover:bg-[#d9e8ff] font-black text-xs sm:text-sm shadow-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span>Pesan Sekarang via WhatsApp</span>
          </a>
          <Link
            href="/claim/DEMO1"
            className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3.5 rounded-xl bg-[#040d1f]/60 hover:bg-[#040d1f]/80 border border-white/35 text-white font-bold text-xs sm:text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Coba Simulasi Klaim Kartu Baru</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
