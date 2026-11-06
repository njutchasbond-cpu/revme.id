import { redirect } from 'next/navigation';
import { getAdminSupabase } from '@/lib/supabase';
import { devCardsStore } from '@/lib/dev-store';
import SmartHubClient from './SmartHubClient';
import type { Card } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { resolveGooglePlaceViaNewApi } from '@/lib/review-url';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function CardAccessPage({ params }: PageProps) {
  const { code } = await params;
  const shortCode = code.toUpperCase();

  let card: Card | null = null;

  // 1. Fast-path untuk kartu demo simulasi (AKTIF1 & DIRECT1) agar render instan tanpa latensi DB
  const isDemoCard = shortCode === 'AKTIF1' || shortCode === 'DIRECT1';
  if (isDemoCard && devCardsStore?.has(shortCode)) {
    card = devCardsStore.get(shortCode) || null;
  }

  // 2. Coba cari di Supabase menggunakan Admin Client (Bypass RLS untuk pembacaan akurat)
  if (!card) {
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient
        .from('cards')
        .select('*')
        .eq('short_code', shortCode)
        .maybeSingle();

      if (data && !error) {
        card = data as Card;
      }
    } catch (err) {
      // Fallback ke dev store jika Supabase offline
    }
  }

  // 3. Fallback ke dev store lokal jika tidak ditemukan di Supabase
  if (!card && devCardsStore) {
    card = devCardsStore.get(shortCode) || null;
  }

  // Jika kartu belum terdaftar sama sekali
  if (!card) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white">Kartu Tidak Dikenal</h1>
          <p className="text-xs text-slate-400">
            Kode kartu <span className="font-mono text-slate-200 font-semibold">{shortCode}</span> belum terdaftar dalam sistem.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium rounded-xl transition"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  // Skenario A: Kartu belum diklaim (First-Tap Claim)
  if (card.status === 'unclaimed') {
    redirect(`/claim/${shortCode}`);
  }

  // Skenario B: Kartu dinonaktifkan
  if (card.status === 'inactive') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white">Kartu Nonaktif</h1>
          <p className="text-xs text-slate-400">
            Kartu ini sedang dinonaktifkan sementara oleh pemilik bisnis.
          </p>
        </div>
      </div>
    );
  }

  // Auto-upgrade kartu lama yang sebelumnya belum memiliki link writereview ChIJ...
  const needsReviewUpgrade =
    Boolean(card.business_name) &&
    (!card.review_url ||
      card.review_url.includes('google.com/maps/search/') ||
      !card.google_place_id ||
      !card.google_place_id.startsWith('ChIJ'));

  let upgradedFields: { google_place_id?: string; review_url?: string } = {};

  if (needsReviewUpgrade && card.business_name) {
    if (card.google_place_id && card.google_place_id.startsWith('ChIJ')) {
      card.review_url = `https://search.google.com/local/writereview?placeid=${card.google_place_id}`;
      upgradedFields = { review_url: card.review_url };
    } else {
      const resolved = await resolveGooglePlaceViaNewApi(card.business_name, card.business_address);
      if (resolved) {
        card.google_place_id = resolved.place_id;
        card.review_url = resolved.review_url;
        upgradedFields = {
          google_place_id: resolved.place_id,
          review_url: resolved.review_url,
        };
      }
    }
  }

  // Skenario C: Kartu Aktif - Catat tap log secara background asinkron (tidak memblokir redirect/render)
  if (card.id && !card.id.startsWith('mock-')) {
    try {
      const adminClient = getAdminSupabase();
      Promise.allSettled([
        adminClient.from('interaction_logs').insert({
          card_id: card.id,
          interaction_type: 'card_tap',
        }),
        adminClient
          .from('cards')
          .update({
            tap_count: (card.tap_count || 0) + 1,
            ...upgradedFields,
          })
          .eq('id', card.id),
      ]).catch(() => {});
    } catch (e) {}
  } else if (devCardsStore?.has(shortCode)) {
    const devItem = devCardsStore.get(shortCode)!;
    devItem.tap_count = (devItem.tap_count || 0) + 1;
    if (upgradedFields.google_place_id) devItem.google_place_id = upgradedFields.google_place_id;
    if (upgradedFields.review_url) devItem.review_url = upgradedFields.review_url;
  }

  // Jika mode Direct Review aktif dan link ulasan tersedia
  if (card.mode === 'direct_review' && card.review_url) {
    redirect(card.review_url);
  }

  // Jika mode Smart Hub aktif, tampilkan portal All-in-One
  return <SmartHubClient card={card} />;
}
