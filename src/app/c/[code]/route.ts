import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminSupabase } from '@/lib/supabase';

// In-memory store untuk simulasi testing lokal sebelum database Supabase di-connect
declare global {
  var __DEV_CARDS_STORE__: Map<string, any> | undefined;
}

global.__DEV_CARDS_STORE__ = new Map([
  [
    'DEMO1',
    {
      id: 'mock-1',
      short_code: 'DEMO1',
      status: 'unclaimed',
      tap_count: 0,
    },
  ],
  [
    'AKTIF1',
    {
      id: 'mock-2',
      short_code: 'AKTIF1',
      status: 'active',
      business_name: 'Bisnis Anda (Aktif)',
      review_url: 'https://search.google.com/local/writereview?placeid=ChIJj6XMWNwzRy4R23c8HJQWjoM',
      tap_count: 12,
    },
  ],
]);

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const shortCode = code.toUpperCase();
  const userAgent = req.headers.get('user-agent') || '';

  // Deteksi tipe perangkat
  let deviceType = 'Desktop';
  if (/android/i.test(userAgent)) {
    deviceType = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    deviceType = 'iOS';
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. Coba fetch dari Supabase
  try {
    const { data: card, error } = await supabase
      .from('cards')
      .select('*')
      .eq('short_code', shortCode)
      .maybeSingle();

    if (card) {
      if (card.status === 'unclaimed') {
        return NextResponse.redirect(`${appUrl}/claim/${shortCode}`, 307);
      }

      if (card.status === 'inactive') {
        return new NextResponse(
          `<html><body style="font-family:sans-serif;text-align:center;padding:50px;">
            <h2>Kartu Ulasan Nonaktif</h2>
            <p>Kartu ini sedang dinonaktifkan oleh pemiliknya.</p>
          </body></html>`,
          { headers: { 'content-type': 'text/html' } }
        );
      }

      if (card.status === 'active' && card.review_url) {
        // Catat tap log secara background/asynchronous
        try {
          const adminClient = getAdminSupabase();
          await adminClient.from('tap_logs').insert({
            card_id: card.id,
            device_type: deviceType,
            user_agent: userAgent.slice(0, 500),
          });
          const rpcRes = await adminClient.rpc('increment_card_tap', { card_id_param: card.id });
          if (rpcRes.error) {
            // fallback direct update jika rpc belum dibuat
            await adminClient
              .from('cards')
              .update({ tap_count: (card.tap_count || 0) + 1 })
              .eq('id', card.id);
          }
        } catch (e) {
          console.error('Failed to log tap:', e);
        }

        return NextResponse.redirect(card.review_url, 302);
      }
    }
  } catch (err) {
    console.error('Supabase query error, fallback to dev store:', err);
  }

  // 2. Fallback ke Memory Store (Untuk kemudahan preview/testing lokal)
  const devCard = global.__DEV_CARDS_STORE__?.get(shortCode);
  if (devCard) {
    if (devCard.status === 'unclaimed') {
      return NextResponse.redirect(`${appUrl}/claim/${shortCode}`, 307);
    }
    if (devCard.status === 'active' && devCard.review_url) {
      devCard.tap_count = (devCard.tap_count || 0) + 1;
      return NextResponse.redirect(devCard.review_url, 302);
    }
  }

  // Jika kartu tidak terdaftar di sistem sama sekali
  return new NextResponse(
    `<html><body style="font-family:sans-serif;text-align:center;padding:50px;line-height:1.6;">
      <h2 style="color:#e11d48;">Kartu Tidak Dikenal</h2>
      <p>Kode kartu <b>${shortCode}</b> belum terdaftar di sistem.</p>
      <a href="${appUrl}" style="color:#2563eb;text-decoration:none;">Kembali ke Beranda</a>
    </body></html>`,
    { headers: { 'content-type': 'text/html' }, status: 404 }
  );
}

