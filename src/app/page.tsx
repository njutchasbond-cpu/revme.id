'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Settings,
  Smartphone,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const [manualCode, setManualCode] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-900">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            ★
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900">
            Tap<span className="text-blue-600">Review</span>
          </span>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-gray-500" /> Admin Portal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 pt-10 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen NFC + QR Review Card
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Panen Ulasan Google Bintang 5 Dalam <span className="text-blue-600">1 Detik.</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Kartu fisik pintar dengan chip NFC dan Dynamic QR Code. Pelanggan cukup tempelkan HP di kasir, langsung membuka modal review resmi Google Maps.
        </p>

        {/* Simulasi Card Preview */}
        <div className="pt-6 pb-4">
          <div className="relative mx-auto w-72 sm:w-80 h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-gray-950 via-gray-900 to-blue-950 p-5 text-white shadow-2xl border border-gray-800 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="text-[10px] font-mono tracking-widest text-gray-400">NFC CHIP</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold">TAP TO REVIEW</div>
              <div className="text-base sm:text-lg font-bold">Dekatkan HP ke Sini</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800">
              <div className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>NFC & QR Code</span>
              </div>
              <div className="font-mono text-gray-300">#DEMO1</div>
            </div>
          </div>
        </div>

        {/* Input Manual Kode Kartu (Fallback bagi pembeli) */}
        <div className="max-w-md mx-auto bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 text-left mb-1.5 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-blue-600" /> Baru Terima Kartu? Aktifkan di sini:
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Ketik kode (misal: DEMO1)"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
            />
            <Link
              href={manualCode ? `/c/${manualCode}` : '#'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1"
            >
              Aktifkan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Interactive Simulation Sandbox */}
        <div className="pt-8">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Simulasi Alur Pengguna (Klik untuk mencoba)
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/c/DEMO1"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" /> 1. Coba Tap Kartu Baru (First-Tap Claim)
            </Link>
            <Link
              href="/c/AKTIF1"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Star className="w-4 h-4 fill-white" /> 2. Coba Tap Kartu yang Sudah Aktif
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" /> 3. Masuk ke Super Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="font-bold text-gray-900">Sistem First-Tap Claim</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tanpa kode PIN atau voucher fisik yang merepotkan. Pembeli pertama yang men-tap kartu langsung mengunci toko dalam hitungan detik.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold">
              📦
            </div>
            <h3 className="font-bold text-gray-900">100% Ready Stock Massal</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cetak ribuan kartu dengan desain generik sekaligus. Jual langsung di Shopee/Tokopedia tanpa sistem Pre-Order.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              🛡️
            </div>
            <h3 className="font-bold text-gray-900">Kepatuhan Kebijakan Google</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mengarahkan 100% tap langsung ke form resmi Google Review tanpa filter ulasan ilegal yang berisiko disuspend Google.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} DW Tap to Review. Dibuat untuk ekosistem UMKM & F&B.
      </footer>
    </div>
  );
}

