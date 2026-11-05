import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { devCardsStore } from '@/lib/dev-store';
import type { Card } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      short_code, 
      business_name, 
      business_category,
      business_address, 
      google_place_id, 
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
    } = body;

    if (!short_code || !business_name || !google_place_id) {
      return NextResponse.json({ error: 'Nama bisnis dan Place ID wajib diisi' }, { status: 400 });
    }

    const review_url = google_place_id.startsWith('ChIJ')
      ? `https://search.google.com/local/writereview?placeid=${google_place_id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business_name + (business_address ? ' ' + business_address : ''))}`;
    const normalizedCode = short_code.toUpperCase();
    const now = new Date().toISOString();

    const cardMode: 'smart_hub' | 'direct_review' = mode === 'direct_review' ? 'direct_review' : 'smart_hub';

    const updatePayload = {
      status: 'active' as const,
      mode: cardMode,
      business_name,
      business_category: business_category || null,
      business_address,
      google_place_id,
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
          return NextResponse.json({ success: true, card: updatedCard });
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
          return NextResponse.json({ success: true, card: insertedCard });
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
