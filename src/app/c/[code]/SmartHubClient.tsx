'use client';

import React, { useState } from 'react';
import { 
  Star, 
  Wifi, 
  Copy, 
  Check, 
  Instagram, 
  Globe, 
  MessageCircle, 
  BookOpen, 
  Briefcase, 
  MapPin, 
  ExternalLink,
  Share2
} from 'lucide-react';
import type { Card } from '@/lib/types';

interface SmartHubClientProps {
  card: Card;
}

export default function SmartHubClient({ card }: SmartHubClientProps) {
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    } catch (e) {
      // Background request
    }
  };

  const handleCopyWifi = () => {
    if (!card.wifi_password) return;
    navigator.clipboard.writeText(card.wifi_password);
    setCopiedWifi(true);
    logInteraction('click_wifi_copy');
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: card.business_name || 'Profil Bisnis',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatInstagramUrl = (handle?: string | null) => {
    if (!handle) return '';
    const clean = handle.replace('@', '').trim();
    return `https://instagram.com/${clean}`;
  };

  const formatTiktokUrl = (handle?: string | null) => {
    if (!handle) return '';
    const clean = handle.replace('@', '').trim();
    return `https://www.tiktok.com/@${clean}`;
  };

  const formatWhatsappUrl = (phone?: string | null) => {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9]/g, '');
    const formatted = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
    return `https://wa.me/${formatted}?text=Halo%20${encodeURIComponent(card.business_name || '')},%20saya%20ingin%20bertanya`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center py-6 px-4 sm:px-6">
      <main className="w-full max-w-md flex flex-col space-y-4">
        
        {/* Tombol Bagikan di Sudut Atas */}
        <div className="flex justify-end">
          <button
            onClick={handleShare}
            aria-label="Bagikan Tautan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Tautan Tersalin' : 'Bagikan'}</span>
          </button>
        </div>

        {/* Profil Toko */}
        <section className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 text-center shadow-xl backdrop-blur-sm">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/20 mb-3 border border-blue-400/30">
            {card.business_name ? card.business_name.charAt(0).toUpperCase() : 'B'}
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            {card.business_name || 'Nama Bisnis'}
          </h1>

          {card.business_category && (
            <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold mt-1">
              {card.business_category}
            </p>
          )}

          {card.business_address && (
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-2.5 px-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="line-clamp-2">{card.business_address}</span>
            </div>
          )}
        </section>

        {/* Tombol Utama: Ulasan Google Maps */}
        {card.review_url && (
          <a
            href={card.review_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => logInteraction('click_review')}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl p-4 shadow-lg shadow-indigo-600/20 border border-blue-400/30 flex items-center justify-between transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0 border border-white/20">
                <Star className="w-6 h-6 fill-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Beri Ulasan di Google Maps</div>
                <div className="text-xs text-blue-100/80">Ulasan bintang 5 sangat berarti bagi kami</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
          </a>
        )}

        {/* Akses WiFi Instan */}
        {card.wifi_ssid && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Koneksi WiFi Pengunjung</div>
                  <div className="text-xs text-slate-400 font-mono">{card.wifi_ssid}</div>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tersedia
              </span>
            </div>

            {card.wifi_password && (
              <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">Kata Sandi</span>
                  <span className="font-mono text-slate-200 font-medium tracking-wide">
                    {card.wifi_password}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWifi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition active:scale-95"
                >
                  {copiedWifi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWifi ? 'Tersalin' : 'Salin Sandi'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Daftar Tautan Layanan & Menu */}
        <div className="space-y-2.5">

          {/* Buku Menu / Katalog */}
          {card.menu_url && (
            <a
              href={card.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logInteraction('click_menu')}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-200 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Buku Menu & Katalog</div>
                  <div className="text-xs text-slate-400">Lihat daftar menu dan harga</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          )}

          {/* Layanan & Reservasi */}
          {card.services_url && (
            <a
              href={card.services_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logInteraction('click_services')}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-200 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Layanan & Reservasi</div>
                  <div className="text-xs text-slate-400">Pemesanan tempat atau layanan</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          )}

          {/* WhatsApp Pemesanan / CS */}
          {card.whatsapp_number && (
            <a
              href={formatWhatsappUrl(card.whatsapp_number)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logInteraction('click_whatsapp')}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-200 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Hubungi via WhatsApp</div>
                  <div className="text-xs text-slate-400">Tanya informasi atau reservasi</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          )}

          {/* Instagram */}
          {card.instagram_username && (
            <a
              href={formatInstagramUrl(card.instagram_username)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logInteraction('click_instagram')}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-200 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Instagram Resmi</div>
                  <div className="text-xs text-slate-400 font-mono">@{card.instagram_username.replace('@', '')}</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          )}

          {/* TikTok */}
          {card.tiktok_username && (
            <a
              href={formatTiktokUrl(card.tiktok_username)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logInteraction('click_tiktok')}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-200 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold text-xs">
                  TT
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">TikTok</div>
                  <div className="text-xs text-slate-400 font-mono">@{card.tiktok_username.replace('@', '')}</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          )}

          {/* Situs Web */}
          {card.website_url && (
            <a
              href={card.website_url.startsWith('http') ? card.website_url : `https://${card.website_url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logInteraction('click_website')}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-200 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Kunjungi Situs Web</div>
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">{card.website_url}</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          )}

        </div>

        {/* Footer */}
        <footer className="pt-6 pb-4 text-center">
          <p className="text-[11px] text-slate-600">
            Diberdayakan oleh{' '}
            <a
              href="https://studiokalcer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition"
            >
              studiokalcer.com
            </a>
          </p>
          <p className="text-[10px] text-slate-700 mt-0.5">
            Kode Seri: {card.short_code}
          </p>
        </footer>

      </main>
    </div>
  );
}

