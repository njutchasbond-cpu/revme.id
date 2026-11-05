import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { devCardsStore } from '@/lib/dev-store';
import type { Card } from '@/lib/types';

export async function GET(req: NextRequest) {
  let dbError: string | null = null;

  try {
    const adminClient = getAdminSupabase();
    const { data: cards, error } = await adminClient
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      dbError = error.message;
    } else if (cards) {
      return NextResponse.json({ 
        cards, 
        source: 'supabase',
        total: cards.length 
      });
    }
  } catch (err: any) {
    dbError = err.message;
  }

  const devCards = Array.from(devCardsStore?.values() || []);
  return NextResponse.json({ 
    cards: devCards, 
    source: 'dev_store',
    supabase_error: dbError,
    supabase_configured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase.co')
    )
  });
}

// Generate Batch Kartu Baru
export async function POST(req: NextRequest) {
  try {
    const { count = 10, prefix = 'DW', batch_name = 'BATCH-01' } = await req.json();

    const newCards: Card[] = [];
    const now = new Date().toISOString();

    for (let i = 1; i <= Number(count); i++) {
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const short_code = `${prefix}${randomStr}`;

      newCards.push({
        id: `card-${short_code}`,
        short_code,
        status: 'unclaimed',
        mode: 'smart_hub',
        batch_number: batch_name,
        tap_count: 0,
        created_at: now,
        updated_at: now,
      });
    }

    // Coba simpan ke Supabase
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient.from('cards').insert(newCards).select();
      if (data) {
        return NextResponse.json({ success: true, count: data.length, cards: data, source: 'supabase' });
      }
      if (error) {
        console.error('Supabase batch insert error:', error);
      }
    } catch (dbErr) {
      // Abaikan jika Supabase offline
    }

    // Dev Store Fallback
    if (devCardsStore) {
      for (const c of newCards) {
        devCardsStore.set(c.short_code, c);
      }
    }

    return NextResponse.json({
      success: true,
      count: newCards.length,
      cards: newCards,
      note: 'Tersimpan dalam memory store pengembangan',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Reset Kartu (Force Reset to Unclaimed)
export async function PUT(req: NextRequest) {
  try {
    const { short_code } = await req.json();
    if (!short_code) {
      return NextResponse.json({ error: 'short_code wajib diisi' }, { status: 400 });
    }

    const normalizedCode = short_code.toUpperCase();
    const now = new Date().toISOString();

    const resetPayload = {
      status: 'unclaimed' as const,
      mode: 'smart_hub' as const,
      business_name: null,
      business_category: null,
      business_address: null,
      google_place_id: null,
      review_url: null,
      owner_phone: null,
      owner_email: null,
      owner_id: null,
      wifi_ssid: null,
      wifi_password: null,
      menu_url: null,
      services_url: null,
      instagram_username: null,
      tiktok_username: null,
      website_url: null,
      whatsapp_number: null,
      shopee_url: null,
      tokopedia_url: null,
      shopeefood_url: null,
      gofood_url: null,
      claimed_at: null,
      updated_at: now,
    };

    // Reset di Supabase
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient
        .from('cards')
        .update(resetPayload)
        .eq('short_code', normalizedCode)
        .select()
        .single();

      if (data) {
        return NextResponse.json({ success: true, card: data });
      }
    } catch (dbErr) {
      // Abaikan jika Supabase offline
    }

    // Reset di Dev Store
    if (devCardsStore) {
      const devCard = devCardsStore.get(normalizedCode);
      if (devCard) {
        const merged: Card = {
          ...devCard,
          ...resetPayload,
        };
        devCardsStore.set(normalizedCode, merged);
        return NextResponse.json({ success: true, card: merged });
      }
    }

    return NextResponse.json({ error: 'Kartu tidak ditemukan' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
