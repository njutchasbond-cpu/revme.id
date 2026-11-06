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
  Wifi,
  Instagram,
  Layers,
  ExternalLink,
  PackageCheck
} from 'lucide-react';

export default function HomePage() {
  const [manualCode, setManualCode] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Smart<span className="text-blue-500">Hub</span> Card
          </span>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" /> Admin Portal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 pt-12 pb-20 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Kartu NFC & Dynamic QR All-in-One
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Satu Tap di Kasir untuk <span className="text-blue-500">Seluruh Info Bisnismu.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Kartu fisik pintar berbasis NFC dan Dynamic QR Code. Mengintegrasikan ulasan Google Maps bintang 5, kata sandi WiFi instan, buku menu, reservasi, media sosial, dan situs web dalam satu sentuhan.
        </p>

        {/* Simulasi Card Preview */}
        <div className="pt-6 pb-2">
          <div className="relative mx-auto w-72 sm:w-80 h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-850 to-blue-950 p-5 text-white shadow-2xl border border-slate-800 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-400">NFC CHIP</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold">ALL-IN-ONE SMART HUB</div>
              <div className="text-base sm:text-lg font-bold">Dekatkan HP ke Sini</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <Star className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="font-mono text-slate-300">#AKTIF1</div>
            </div>
          </div>
        </div>

        {/* Input Manual Kode Kartu */}
        <div className="max-w-md mx-auto bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 text-left mb-1.5 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-blue-400" /> Baru Terima Kartu? Akses di sini:
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Ketik kode (misal: DEMO1)"
              className="flex-1 px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono text-white placeholder:text-slate-600"
            />
            <Link
              href={manualCode ? `/c/${manualCode}` : '#'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition inline-flex items-center gap-1"
            >
              Buka <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Sandbox Uji Coba Langsung */}
        <div className="pt-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Simulasi Alur Pengguna (Klik untuk Menguji)
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/c/DEMO1"
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

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-12 text-left">
          
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Sistem First-Tap Claim</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tanpa kode PIN atau voucher fisik. Pembeli pertama yang menempelkan ponsel langsung mengaktifkan kartu dan mengunci toko dalam hitungan detik.
            </p>
          </div>

          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">100% Ready Stock Massal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cetak ribuan kartu dengan serial unik sekaligus. Jual langsung di marketplace tanpa perlu menunggu data pembeli sebelum produksi.
            </p>
          </div>

          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Kepatuhan Kebijakan Resmi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tanpa penyaringan ulasan ilegal (review gating). Ulasan diarahkan secara transparan ke Google Maps guna menjaga keamanan akun bisnis.
            </p>
          </div>

        </div>

      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
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
