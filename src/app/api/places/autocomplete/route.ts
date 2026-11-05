import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const input = searchParams.get('input');

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const query = input.trim();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // 1. Jika GOOGLE_PLACES_API_KEY tersedia dan bukan placeholder, utamakan Google Places API resmi
  if (apiKey && apiKey !== 'your-google-places-api-key') {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&types=establishment&language=id&key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.predictions) && data.predictions.length > 0) {
        const predictions = data.predictions.map((p: any) => ({
          place_id: p.place_id,
          description: p.description,
          main_text: p.structured_formatting?.main_text || p.description,
          secondary_text: p.structured_formatting?.secondary_text || '',
        }));

        return NextResponse.json({ predictions, source: 'google_places' });
      }
    } catch (err: any) {
      console.error('Google Places Autocomplete error:', err);
    }
  }

  // 2. Fallback Penelusuran Real Geocoding (OpenStreetMap / Komoot Photon untuk data lokasi nyata Indonesia)
  try {
    const geoUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'TapToReview/1.0' },
      next: { revalidate: 60 }
    });
    const geoData = await geoRes.json();

    const realPredictions: Array<{
      place_id: string;
      description: string;
      main_text: string;
      secondary_text: string;
    }> = [];

    if (Array.isArray(geoData.features)) {
      for (let i = 0; i < geoData.features.length; i++) {
        const f = geoData.features[i];
        const p = f.properties || {};
        const name = p.name || query;
        const street = [p.street, p.housenumber ? `No. ${p.housenumber}` : ''].filter(Boolean).join(' ');
        const region = [p.district || p.suburb || p.locality, p.city || p.county, p.state].filter(Boolean).join(', ');
        const secondary = [street, region].filter(Boolean).join(', ') || p.country || 'Indonesia';

        realPredictions.push({
          place_id: `osm_${p.osm_type || 'p'}_${p.osm_id || i}`,
          description: `${name}, ${secondary}`,
          main_text: name,
          secondary_text: secondary,
        });
      }
    }

    // Selalu tambahkan opsi nama bisnis khusus/brand mandiri agar pemilik toko dapat mendaftarkan bisnisnya
    realPredictions.push({
      place_id: `custom_${encodeURIComponent(query)}`,
      description: `${query} (Nama Bisnis / Brand Baru)`,
      main_text: query,
      secondary_text: 'Daftarkan nama ini dan atur alamat toko',
    });

    return NextResponse.json({ predictions: realPredictions, source: 'real_geocoding' });
  } catch (geoErr) {
    return NextResponse.json({
      predictions: [
        {
          place_id: `custom_${encodeURIComponent(query)}`,
          description: `${query} (Nama Bisnis Mandiri)`,
          main_text: query,
          secondary_text: 'Daftarkan nama ini dan atur alamat toko',
        }
      ],
      source: 'fallback'
    });
  }
}
