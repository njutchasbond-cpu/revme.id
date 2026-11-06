import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { devCardsStore } from '@/lib/dev-store';
import type { Card } from '@/lib/types';

export const dynamic = 'force-dynamic';

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

    const newCards: Array<Omit<Card, 'id'>> = [];
    const now = new Date().toISOString();

    for (let i = 1; i <= Number(count); i++) {
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const short_code = `${prefix}${randomStr}`;

      newCards.push({
        short_code,
        status: 'unclaimed',
        mode: 'smart_hub',
        batch_number: batch_name,
        tap_count: 0,
        created_at: now,
        updated_at: now,
      });
    }

    // 1. Simpan ke Supabase (id otomatis UUID dari database via gen_random_uuid)
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient.from('cards').insert(newCards).select();
      if (error) {
        console.error('Supabase batch insert error:', error);
        return NextResponse.json({ error: `Gagal menyimpan ke database: ${error.message}` }, { status: 500 });
      }
      if (data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, cards: data, source: 'supabase' });
      }
    } catch (dbErr: any) {
      console.error('Database connection error:', dbErr);
      return NextResponse.json({ error: `Koneksi database bermasalah: ${dbErr.message}` }, { status: 500 });
    }

    // 2. Dev Store Fallback jika Supabase offline
    if (devCardsStore) {
      const mockCards: Card[] = newCards.map(c => ({
        ...c,
        id: `mock-${c.short_code}`,
      }));
      for (const c of mockCards) {
        devCardsStore.set(c.short_code, c);
      }
      return NextResponse.json({
        success: true,
        count: mockCards.length,
        cards: mockCards,
        source: 'dev_store',
      });
    }

    return NextResponse.json({ error: 'Tidak dapat menyimpan kartu.' }, { status: 500 });
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

    const resetPayload: any = {
      status: 'unclaimed',
      mode: 'smart_hub',
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
        .maybeSingle();

      if (error) {
        console.error('Supabase reset error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data) {
        return NextResponse.json({ success: true, card: data });
      }
    } catch (dbErr: any) {
      console.error('Database reset exception:', dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
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

// Update / Edit Data Kartu dari Admin
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { short_code, ...updateFields } = body;

    if (!short_code) {
      return NextResponse.json({ error: 'short_code wajib diisi' }, { status: 400 });
    }

    const normalizedCode = short_code.toUpperCase();
    const now = new Date().toISOString();

    let review_url = updateFields.review_url;
    if (updateFields.google_place_id && !review_url) {
      review_url = updateFields.google_place_id.startsWith('ChIJ')
        ? `https://search.google.com/local/writereview?placeid=${updateFields.google_place_id}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((updateFields.business_name || '') + ' ' + (updateFields.business_address || ''))}`;
    }

    const payloadToSave = {
      ...updateFields,
      review_url: review_url || updateFields.review_url || null,
      updated_at: now,
    };

    // 1. Update di Supabase
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient
        .from('cards')
        .update(payloadToSave)
        .eq('short_code', normalizedCode)
        .select()
        .single();

      if (error && (error.message.includes('column') || error.message.includes('schema cache') || error.message.includes('does not exist'))) {
        const safePayload = { ...payloadToSave };
        delete (safePayload as any).shopee_url;
        delete (safePayload as any).tokopedia_url;
        delete (safePayload as any).shopeefood_url;
        delete (safePayload as any).gofood_url;

        const retry = await adminClient
          .from('cards')
          .update(safePayload)
          .eq('short_code', normalizedCode)
          .select()
          .maybeSingle();

        if (retry.data) {
          return NextResponse.json({ success: true, card: retry.data });
        }
      } else if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data) {
        return NextResponse.json({ success: true, card: data });
      }
    } catch (dbErr: any) {
      console.error('Database update error:', dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    // 2. Dev Store Fallback
    if (devCardsStore) {
      const devCard = devCardsStore.get(normalizedCode);
      if (devCard) {
        const merged: Card = {
          ...devCard,
          ...payloadToSave,
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
