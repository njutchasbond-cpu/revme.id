'use client';

import * as React from 'react';
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  Globe,
  Instagram,
  LayoutGrid,
  List,
  MessageCircle,
  ShoppingBag,
  Store,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';
import type { Card as CardModel } from '@/lib/types';

export interface BentoActionGridProps {
  card: CardModel;
  onLogInteraction: (type: string) => void;
}

interface ActionItem {
  id: string;
  interactionType: string;
  title: string;
  subtitle: string;
  href: string;
  iconBg: string;
  iconText: string;
  iconBorder: string;
  badgeText?: string;
  isMonoSubtitle?: boolean;
  icon: React.ReactNode;
}

export function BentoActionGrid({ card, onLogInteraction }: BentoActionGridProps) {
  const [layoutMode, setLayoutMode] = React.useState<'bento' | 'list'>('bento');

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
    return `https://wa.me/${formatted}?text=Halo%20${encodeURIComponent(
      card.business_name || ''
    )},%20saya%20ingin%20bertanya`;
  };

  const ensureHttp = (url?: string | null) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // Tier 1: Primary Full-Width Links (Menu, Services, WhatsApp, Website)
  const primaryLinks: ActionItem[] = [];

  if (card.menu_url) {
    primaryLinks.push({
      id: 'menu',
      interactionType: 'click_menu',
      title: 'Buku Menu & Katalog',
      subtitle: 'Lihat daftar menu dan harga',
      href: card.menu_url,
      iconBg: 'bg-amber-500/15',
      iconText: 'text-amber-400',
      iconBorder: 'border-amber-500/25',
      icon: <BookOpen className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.services_url) {
    primaryLinks.push({
      id: 'services',
      interactionType: 'click_services',
      title: 'Layanan & Reservasi',
      subtitle: 'Pemesanan tempat atau layanan',
      href: card.services_url,
      iconBg: 'bg-purple-500/15',
      iconText: 'text-purple-400',
      iconBorder: 'border-purple-500/25',
      icon: <Briefcase className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.whatsapp_number) {
    primaryLinks.push({
      id: 'whatsapp',
      interactionType: 'click_whatsapp',
      title: 'Hubungi via WhatsApp',
      subtitle: 'Tanya informasi atau reservasi',
      href: formatWhatsappUrl(card.whatsapp_number),
      iconBg: 'bg-emerald-500/15',
      iconText: 'text-emerald-400',
      iconBorder: 'border-emerald-500/25',
      badgeText: 'Fast Response',
      icon: <MessageCircle className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.website_url) {
    primaryLinks.push({
      id: 'website',
      interactionType: 'click_website',
      title: 'Kunjungi Situs Web',
      subtitle: card.website_url,
      href: ensureHttp(card.website_url),
      iconBg: 'bg-blue-500/15',
      iconText: 'text-blue-400',
      iconBorder: 'border-blue-500/25',
      icon: <Globe className="w-4 h-4" aria-hidden="true" />,
    });
  }

  // Tier 2: Bento Grid Links (Socials, Marketplaces, Food Delivery)
  const secondaryLinks: ActionItem[] = [];

  if (card.instagram_username) {
    secondaryLinks.push({
      id: 'instagram',
      interactionType: 'click_instagram',
      title: 'Instagram Resmi',
      subtitle: `@${card.instagram_username.replace('@', '')}`,
      href: formatInstagramUrl(card.instagram_username),
      iconBg: 'bg-pink-500/15',
      iconText: 'text-pink-400',
      iconBorder: 'border-pink-500/25',
      isMonoSubtitle: true,
      icon: <Instagram className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.tiktok_username) {
    secondaryLinks.push({
      id: 'tiktok',
      interactionType: 'click_tiktok',
      title: 'TikTok',
      subtitle: `@${card.tiktok_username.replace('@', '')}`,
      href: formatTiktokUrl(card.tiktok_username),
      iconBg: 'bg-cyan-500/15',
      iconText: 'text-cyan-400',
      iconBorder: 'border-cyan-500/25',
      isMonoSubtitle: true,
      icon: (
        <span className="font-extrabold text-xs tracking-tighter" aria-hidden="true">
          TT
        </span>
      ),
    });
  }

  if (card.shopee_url) {
    secondaryLinks.push({
      id: 'shopee',
      interactionType: 'click_shopee',
      title: 'Shopee Official Store',
      subtitle: 'Belanja produk di Shopee',
      href: ensureHttp(card.shopee_url),
      iconBg: 'bg-orange-500/15',
      iconText: 'text-orange-400',
      iconBorder: 'border-orange-500/25',
      icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.tokopedia_url) {
    secondaryLinks.push({
      id: 'tokopedia',
      interactionType: 'click_tokopedia',
      title: 'Tokopedia Official Store',
      subtitle: 'Belanja produk di Tokopedia',
      href: ensureHttp(card.tokopedia_url),
      iconBg: 'bg-emerald-500/15',
      iconText: 'text-emerald-400',
      iconBorder: 'border-emerald-500/25',
      icon: <Store className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.shopeefood_url) {
    secondaryLinks.push({
      id: 'shopeefood',
      interactionType: 'click_shopeefood',
      title: 'ShopeeFood',
      subtitle: 'Pesan antar via ShopeeFood',
      href: ensureHttp(card.shopeefood_url),
      iconBg: 'bg-amber-500/15',
      iconText: 'text-amber-400',
      iconBorder: 'border-amber-500/25',
      icon: <UtensilsCrossed className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (card.gofood_url) {
    secondaryLinks.push({
      id: 'gofood',
      interactionType: 'click_gofood',
      title: 'GoFood',
      subtitle: 'Pesan antar via GoFood',
      href: ensureHttp(card.gofood_url),
      iconBg: 'bg-rose-500/15',
      iconText: 'text-rose-400',
      iconBorder: 'border-rose-500/25',
      icon: <Utensils className="w-4 h-4" aria-hidden="true" />,
    });
  }

  if (primaryLinks.length === 0 && secondaryLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Primary Full-Width Links */}
      {primaryLinks.length > 0 && (
        <div className="space-y-2.5">
          {primaryLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLogInteraction(item.interactionType)}
              className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between text-slate-100 transition-all duration-200 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconText} flex items-center justify-center border ${item.iconBorder} shrink-0`}
                >
                  {item.icon}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {item.title}
                    </span>
                    {item.badgeText && (
                      <span className="hidden xs:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {item.badgeText}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs text-slate-300 truncate ${
                      item.isMonoSubtitle ? 'font-mono' : ''
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <ExternalLink
                className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      )}

      {/* Secondary Links: Socials & Official Store (Bento 2-Column or List View) */}
      {secondaryLinks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Kanal Media Sosial & Official Store
            </span>

            {secondaryLinks.length >= 2 && (
              <div className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setLayoutMode('bento')}
                  aria-label="Tampilan Grid Bento 2 Kolom"
                  aria-pressed={layoutMode === 'bento'}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                    layoutMode === 'bento'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" aria-hidden="true" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('list')}
                  aria-label="Tampilan Daftar Penuh"
                  aria-pressed={layoutMode === 'list'}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                    layoutMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <List className="w-3 h-3" aria-hidden="true" />
                  <span>List</span>
                </button>
              </div>
            )}
          </div>

          <div
            className={
              layoutMode === 'bento' && secondaryLinks.length >= 2
                ? 'grid grid-cols-2 gap-2.5'
                : 'space-y-2.5'
            }
          >
            {secondaryLinks.map((item, idx) => {
              const isLastOddItem =
                layoutMode === 'bento' &&
                secondaryLinks.length % 2 === 1 &&
                idx === secondaryLinks.length - 1;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLogInteraction(item.interactionType)}
                  className={`group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between text-slate-100 transition-all duration-200 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isLastOddItem ? 'col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconText} flex items-center justify-center border ${item.iconBorder} shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.title}
                      </div>
                      <div
                        className={`text-[11px] text-slate-300 truncate ${
                          item.isMonoSubtitle ? 'font-mono' : ''
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ExternalLink
                    className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 ml-1.5"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

