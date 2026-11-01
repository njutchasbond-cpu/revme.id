import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const adminClient = getAdminSupabase();
    const { data: cards, error } = await adminClient
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (cards && cards.length > 0) {
      return NextResponse.json({ cards });
    }
  } catch (err) {
    console.warn('Supabase fetch failed, fallback to dev store:', err);
  }

  // Fallback Dev Store
  const devCards = Array.from(global.__DEV_CARDS_STORE__?.values() || []);
  return NextResponse.json({ cards: devCards });
}

// Generate Batch Kartu Baru
export async function POST(req: NextRequest) {
  try {
    const { count = 10, prefix = 'DW', batch_name = 'BATCH-01' } = await req.json();

    const newCards: any[] = [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (let i = 1; i <= Number(count); i++) {
      // Format serial unik pendek, misal: DW-8921 atau kode berurutan
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const short_code = `${prefix}${randomStr}`;

      newCards.push({
        short_code,
        status: 'unclaimed',
        batch_number: batch_name,
        tap_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Coba insert ke Supabase
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient.from('cards').insert(newCards).select();
      if (data) {
        return NextResponse.json({ success: true, count: data.length, cards: data });
      }
    } catch (dbErr) {
      console.warn('Supabase insert failed, storing to dev store:', dbErr);
    }

    // Dev Store Fallback
    for (const c of newCards) {
      global.__DEV_CARDS_STORE__?.set(c.short_code, { ...c, id: `card-${c.short_code}` });
    }

    return NextResponse.json({
      success: true,
      count: newCards.length,
      cards: newCards,
      note: 'Stored in development memory store',
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
      return NextResponse.json({ error: 'short_code is required' }, { status: 400 });
    }

    const normalizedCode = short_code.toUpperCase();

    // Reset di Supabase
    try {
      const adminClient = getAdminSupabase();
      const { data, error } = await adminClient
        .from('cards')
        .update({
          status: 'unclaimed',
          business_name: null,
          business_address: null,
          google_place_id: null,
          review_url: null,
          owner_phone: null,
          owner_id: null,
          claimed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('short_code', normalizedCode)
        .select()
        .single();

      if (data) {
        return NextResponse.json({ success: true, card: data });
      }
    } catch (dbErr) {
      console.warn('Supabase reset failed, updating dev store:', dbErr);
    }

    // Reset di Dev Store
    const devCard = global.__DEV_CARDS_STORE__?.get(normalizedCode);
    if (devCard) {
      devCard.status = 'unclaimed';
      devCard.business_name = null;
      devCard.business_address = null;
      devCard.google_place_id = null;
      devCard.review_url = null;
      devCard.owner_phone = null;
      devCard.claimed_at = null;
      return NextResponse.json({ success: true, card: devCard });
    }

    return NextResponse.json({ error: 'Kartu tidak ditemukan' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

