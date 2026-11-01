import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const input = searchParams.get('input');

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Jika API Key Google belum diset di .env, sediakan mock search untuk testing lokal
  if (!apiKey || apiKey === 'your-google-places-api-key') {
    const mockResults = [
      {
        place_id: `ChIJj6XMWNwzRy4R23c8HJQWjoM`,
        description: `${input} (Google Review Siap Pakai)`,
        main_text: `${input}`,
        secondary_text: 'Toko Terverifikasi Google Maps',
      },
      {
        place_id: `ChIJj6XMWNwzRy4R23c8HJQWjoM`,
        description: `${input} Coffee & Eatery`,
        main_text: `${input} Coffee & Eatery`,
        secondary_text: 'Cabang Utama Terverifikasi',
      },
    ];
    return NextResponse.json({ predictions: mockResults });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=establishment&language=id&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: data.error_message || data.status }, { status: 400 });
    }

    const predictions = (data.predictions || []).map((p: any) => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.structured_formatting?.main_text || p.description,
      secondary_text: p.structured_formatting?.secondary_text || '',
    }));

    return NextResponse.json({ predictions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

