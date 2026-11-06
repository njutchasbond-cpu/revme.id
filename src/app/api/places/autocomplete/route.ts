import { NextRequest, NextResponse } from 'next/server';

// Bounding Box resmi seluruh Kepulauan Indonesia (Sabang sampai Merauke)
const INDONESIA_BBOX = '94.9,-11.2,141.1,6.2';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const input = searchParams.get('input');

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const query = input.trim();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // 1. Jika GOOGLE_PLACES_API_KEY tersedia dan valid, kunci ketat ke wilayah Indonesia (components=country:id)
  if (apiKey && apiKey !== 'your-google-places-api-key') {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&components=country:id&language=id&key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.predictions) && data.predictions.length > 0) {
        const predictions = data.predictions.map((p: any) => ({
          place_id: p.place_id,
          description: p.description,
          main_text: p.structured_formatting?.main_text || p.description,
          secondary_text: p.structured_formatting?.secondary_text || 'Indonesia',
        }));

        return NextResponse.json({ predictions, source: 'google_places_id' });
      }
    } catch (err: any) {
      console.error('Google Places Autocomplete error:', err);
    }
  }

  // 2. Penelusuran Lokasi Nyata Khusus Wilayah Indonesia (Nominatim ID + Photon BBOX Indonesia)
  const realPredictions: Array<{
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
  }> = [];

  const seenKeys = new Set<string>();

  try {
    // Query 2A: OpenStreetMap Nominatim dengan filter ketat countrycodes=id (100% Indonesia)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=id&addressdetails=1&limit=6&accept-language=id&q=${encodeURIComponent(
      query
    )}`;

    // Query 2B: Photon dengan Bounding Box Kepulauan Indonesia
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&bbox=${INDONESIA_BBOX}&limit=8`;

    const [nomRes, phoRes] = await Promise.allSettled([
      fetch(nominatimUrl, {
        headers: { 'User-Agent': 'SmartHubCardIndonesia/1.0 (https://studiokalcer.com)' },
        next: { revalidate: 60 },
      }),
      fetch(photonUrl, {
        headers: { 'User-Agent': 'SmartHubCardIndonesia/1.0 (https://studiokalcer.com)' },
        next: { revalidate: 60 },
      }),
    ]);

    // Proses hasil Nominatim (Khusus Indonesia)
    if (nomRes.status === 'fulfilled' && nomRes.value.ok) {
      const nomData = await nomRes.value.json();
      if (Array.isArray(nomData)) {
        for (const item of nomData) {
          const addr = item.address || {};
          if (addr.country_code && addr.country_code.toLowerCase() !== 'id') continue;

          const mainName =
            item.name ||
            addr.amenity ||
            addr.shop ||
            addr.office ||
            addr.Suburb ||
            addr.village ||
            query;

          const roadPart = [addr.road, addr.house_number ? `No. ${addr.house_number}` : '']
            .filter(Boolean)
            .join(' ');
          const areaPart = [
            addr.suburb || addr.village || addr.neighbourhood,
            addr.city || addr.town || addr.county || addr.regency,
            addr.state,
          ]
            .filter(Boolean)
            .join(', ');

          const secondary = [roadPart, areaPart].filter(Boolean).join(', ') || item.display_name || 'Indonesia';
          const dedupeKey = `${mainName.toLowerCase()}|${secondary.toLowerCase()}`;

          if (!seenKeys.has(dedupeKey)) {
            seenKeys.add(dedupeKey);
            realPredictions.push({
              place_id: `id_nom_${item.place_id}`,
              description: `${mainName}, ${secondary}`,
              main_text: mainName,
              secondary_text: secondary,
            });
          }
        }
      }
    }

    // Proses hasil Photon (Filter ketat countrycode === 'ID')
    if (phoRes.status === 'fulfilled' && phoRes.value.ok && realPredictions.length < 6) {
      const phoData = await phoRes.value.json();
      if (Array.isArray(phoData.features)) {
        for (let i = 0; i < phoData.features.length; i++) {
          const f = phoData.features[i];
          const p = f.properties || {};

          // Wajib hanya wilayah Indonesia (Tolak negara lain!)
          const countryCode = (p.countrycode || '').toUpperCase();
          const countryName = p.country || '';
          if (countryCode !== 'ID' && !/indonesia/i.test(countryName)) {
            continue;
          }

          const name = p.name || query;
          const street = [p.street, p.housenumber ? `No. ${p.housenumber}` : '']
            .filter(Boolean)
            .join(' ');
          const region = [
            p.district || p.suburb || p.locality,
            p.city || p.county,
            p.state,
          ]
            .filter(Boolean)
            .join(', ');
          const secondary = [street, region].filter(Boolean).join(', ') || 'Indonesia';
          const dedupeKey = `${name.toLowerCase()}|${secondary.toLowerCase()}`;

          if (!seenKeys.has(dedupeKey)) {
            seenKeys.add(dedupeKey);
            realPredictions.push({
              place_id: `id_osm_${p.osm_type || 'p'}_${p.osm_id || i}`,
              description: `${name}, ${secondary}`,
              main_text: name,
              secondary_text: secondary,
            });
          }

          if (realPredictions.length >= 6) break;
        }
      }
    }
  } catch (geoErr) {
    // Lanjut ke opsi custom brand Indonesia
  }

  // Selalu sediakan opsi paling atas/bawah untuk menggunakan nama brand secara langsung di Indonesia
  realPredictions.push({
    place_id: `custom_${encodeURIComponent(query)}`,
    description: `${query} — Gunakan Nama Bisnis Ini (Wilayah Indonesia)`,
    main_text: query,
    secondary_text: 'Pakai nama usaha ini & isi alamat lengkap toko Anda di Indonesia',
  });

  return NextResponse.json({
    predictions: realPredictions,
    source: 'indonesia_geocoding',
  });
}
