import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { card_id, interaction_type } = body;

    if (!card_id || !interaction_type) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    let deviceType = 'Desktop';
    if (/android/i.test(userAgent)) {
      deviceType = 'Android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = 'iOS';
    }

    // Coba simpan ke Supabase jika tersedia
    try {
      const adminClient = getAdminSupabase();
      await adminClient.from('interaction_logs').insert({
        card_id,
        interaction_type,
        device_type: deviceType,
        user_agent: userAgent.slice(0, 500),
      });
    } catch (dbErr) {
      // Abaikan jika Supabase offline dalam mode pengembangan lokal
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

