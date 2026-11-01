import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { short_code, business_name, business_address, google_place_id, owner_phone, owner_email } = body;

    if (!short_code || !business_name || !google_place_id) {
      return NextResponse.json({ error: 'Semua data wajib diisi' }, { status: 400 });
    }

    const review_url = `https://search.google.com/local/writereview?placeid=${google_place_id}`;
    const normalizedCode = short_code.toUpperCase();

    // 1. Coba update di Supabase
    try {
      const adminClient = getAdminSupabase();
      const { data: updatedCard, error } = await adminClient
        .from('cards')
        .update({
          status: 'active',
          business_name,
          business_address,
          google_place_id,
          review_url,
          owner_phone: owner_phone || null,
          owner_email: owner_email || null,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('short_code', normalizedCode)
        .eq('status', 'unclaimed')
        .select()
        .single();

      if (updatedCard) {
        return NextResponse.json({ success: true, card: updatedCard });
      }
    } catch (dbErr) {
      console.warn('Supabase update skipped/failed, checking dev store:', dbErr);
    }

    // 2. Fallback Dev Store
    const devCard = global.__DEV_CARDS_STORE__?.get(normalizedCode);
    if (devCard) {
      if (devCard.status === 'active') {
        return NextResponse.json({ error: 'Kartu ini sudah pernah diklaim sebelumnya.' }, { status: 400 });
      }

      devCard.status = 'active';
      devCard.business_name = business_name;
      devCard.business_address = business_address;
      devCard.google_place_id = google_place_id;
      devCard.review_url = review_url;
      devCard.owner_phone = owner_phone;
      devCard.claimed_at = new Date().toISOString();

      return NextResponse.json({ success: true, card: devCard });
    }

    // Jika kode kartu tidak ada di database sama sekali, buatkan baru (auto-claim dev)
    const newCard = {
      id: `card-${Date.now()}`,
      short_code: normalizedCode,
      status: 'active',
      business_name,
      business_address,
      google_place_id,
      review_url,
      owner_phone,
      tap_count: 0,
      claimed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    global.__DEV_CARDS_STORE__?.set(normalizedCode, newCard);

    return NextResponse.json({ success: true, card: newCard });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

