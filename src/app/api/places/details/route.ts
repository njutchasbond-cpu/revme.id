import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const placeId = searchParams.get('place_id');

  if (!placeId) {
    return NextResponse.json({ error: 'place_id is required' }, { status: 400 });
  }

  // Standar URL review langsung dari Google Place ID
  const directReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'your-google-places-api-key') {
    return NextResponse.json({
      place_id: placeId,
      name: 'Bisnis Mitra (Demo Mode)',
      formatted_address: 'Alamat Lokasi Terverifikasi di Google Maps',
      review_url: directReviewUrl,
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,url&language=id&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || data.status }, { status: 400 });
    }

    return NextResponse.json({
      place_id: placeId,
      name: data.result.name,
      formatted_address: data.result.formatted_address,
      review_url: directReviewUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

