import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { devCardsStore } from '@/lib/dev-store';
import type { Card } from '@/lib/types';
import { packMediaFallback, normalizeCardMedia } from '@/lib/image-utils';
import { buildGoogleReviewUrl, resolveGooglePlaceViaNewApi } from '@/lib/review-url';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      short_code, 
      business_name, 
      business_category,
      business_address, 
      logo_url,
      banner_url,
      google_place_id, 
      review_url: custom_review_url,
      owner_phone, 
      owner_email,
      mode = 'smart_hub',
      wifi_ssid,
      wifi_password,
      menu_url,
      services_url,
      instagram_username,
      tiktok_username,
      website_url,
      whatsapp_number,
      shopee_url,
      tokopedia_url,
      shopeefood_url,
      gofood_url,
    } = body;

    if (!short_code || !business_name || !google_place_id) {
      return NextResponse.json({ error: 'Nama bisnis dan Place ID wajib diisi' }, { status: 400 });
    }

    let { google_place_id: resolvedPlaceId, review_url } = buildGoogleReviewUrl({
      google_place_id,
      custom_review_url,
      business_name,
      business_address,
    });

    // Jika belum memiliki ChIJ Place ID maupun link g.page/r/, coba cari otomatis via Google Places API (New)
    if (
      (!resolvedPlaceId || !resolvedPlaceId.startsWith('ChIJ')) &&
      review_url.includes('google.com/maps/search/')
    ) {
      const autoResolved = await resolveGooglePlaceViaNewApi(business_name, business_address);
      if (autoResolved) {
        resolvedPlaceId = autoResolved.place_id;
        review_url = autoResolved.review_url;
      }
    }

    const normalizedCode = short_code.toUpperCase();
    const now = new Date().toISOString();

    const cardMode: 'smart_hub' | 'direct_review' = mode === 'direct_review' ? 'direct_review' : 'smart_hub';

    const updatePayload = {
      status: 'active' as const,
      mode: cardMode,
      business_name,
      business_category: business_category || null,
      business_address,
      logo_url: logo_url || null,
      banner_url: banner_url || null,
      google_place_id: resolvedPlaceId || google_place_id,
      review_url,
      owner_phone: owner_phone || null,
      owner_email: owner_email || null,
      wifi_ssid: wifi_ssid || null,
      wifi_password: wifi_password || null,
      menu_url: menu_url || null,
      services_url: services_url || null,
      instagram_username: instagram_username || null,
      tiktok_username: tiktok_username || null,
      website_url: website_url || null,
      whatsapp_number: whatsapp_number || owner_phone || null,
      shopee_url: shopee_url || null,
      tokopedia_url: tokopedia_url || null,
      shopeefood_url: shopeefood_url || null,
      gofood_url: gofood_url || null,
      claimed_at: now,
      updated_at: now,
    };

    // 1. Coba simpan ke Supabase secara permanen
    try {
      const adminClient = getAdminSupabase();

      // Cek apakah kartu sudah terdaftar di Supabase
      const { data: existingCard, error: checkErr } = await adminClient
        .from('cards')
        .select('*')
        .eq('short_code', normalizedCode)
        .maybeSingle();

      if (existingCard) {
        if (existingCard.status === 'active') {
          return NextResponse.json({ error: 'Kartu ini sudah pernah diklaim sebelumnya.' }, { status: 400 });
        }

        const { data: updatedCard, error: updateErr } = await adminClient
          .from('cards')
          .update(updatePayload)
          .eq('id', existingCard.id)
          .select()
          .single();

        if (updatedCard) {
          return NextResponse.json({ success: true, card: normalizeCardMedia(updatedCard) });
        }
        if (updateErr && (updateErr.message.includes('column') || updateErr.message.includes('schema cache') || updateErr.message.includes('does not exist'))) {
          const safeUpdate = { ...updatePayload };
          delete (safeUpdate as any).banner_url;
          (safeUpdate as any).logo_url = packMediaFallback(logo_url, banner_url);
          delete (safeUpdate as any).shopee_url;
          delete (safeUpdate as any).tokopedia_url;
          delete (safeUpdate as any).shopeefood_url;
          delete (safeUpdate as any).gofood_url;
          const retry = await adminClient
            .from('cards')
            .update(safeUpdate)
            .eq('id', existingCard.id)
            .select()
            .maybeSingle();
          if (retry.data) return NextResponse.json({ success: true, card: normalizeCardMedia(retry.data) });
        }
        if (updateErr) {
          console.error('Supabase update error:', updateErr);
        }
      } else {
        // Jika kartu belum ada di tabel Supabase (misal pengujian DEMO1 langsung di Vercel),
        // otomatis buat baris baru di Supabase agar data tersimpan permanen!
        const { data: insertedCard, error: insertErr } = await adminClient
          .from('cards')
          .insert({
            short_code: normalizedCode,
            tap_count: 0,
            created_at: now,
            ...updatePayload,
          })
          .select()
          .single();

        if (insertedCard) {
          return NextResponse.json({ success: true, card: normalizeCardMedia(insertedCard) });
        }
        if (insertErr && (insertErr.message.includes('column') || insertErr.message.includes('schema cache') || insertErr.message.includes('does not exist'))) {
          const safeInsert = {
            short_code: normalizedCode,
            tap_count: 0,
            created_at: now,
            ...updatePayload,
          };
          delete (safeInsert as any).banner_url;
          (safeInsert as any).logo_url = packMediaFallback(logo_url, banner_url);
          delete (safeInsert as any).shopee_url;
          delete (safeInsert as any).tokopedia_url;
          delete (safeInsert as any).shopeefood_url;
          delete (safeInsert as any).gofood_url;
          const retry = await adminClient
            .from('cards')
            .insert(safeInsert)
            .select()
            .maybeSingle();
          if (retry.data) return NextResponse.json({ success: true, card: normalizeCardMedia(retry.data) });
        }
        if (insertErr) {
          console.error('Supabase insert error:', insertErr);
          // Beritahu detail error agar user tahu jika tabel belum dibuat di Supabase
          return NextResponse.json({ 
            error: `Gagal menyimpan ke database Supabase: ${insertErr.message}. Pastikan schema.sql sudah dijalankan di Supabase SQL Editor.` 
          }, { status: 500 });
        }
      }
    } catch (dbErr: any) {
      console.warn('Supabase operation failed, checking dev store fallback:', dbErr);
    }

    // 2. Fallback Dev Store lokal
    if (devCardsStore) {
      const existing = devCardsStore.get(normalizedCode);
      if (existing) {
        if (existing.status === 'active') {
          return NextResponse.json({ error: 'Kartu ini sudah pernah diklaim sebelumnya' }, { status: 400 });
        }

        const merged: Card = {
          ...existing,
          ...updatePayload,
        };
        devCardsStore.set(normalizedCode, merged);
        return NextResponse.json({ success: true, card: merged });
      }

      // Jika kartu belum ada di in-memory, buatkan entri baru
      const newCard: Card = {
        id: `dev-${Date.now()}`,
        short_code: normalizedCode,
        tap_count: 0,
        created_at: now,
        ...updatePayload,
      };
      devCardsStore.set(normalizedCode, newCard);
      return NextResponse.json({ success: true, card: newCard });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
