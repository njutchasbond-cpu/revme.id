import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const placeId = searchParams.get('place_id');

  if (!placeId) {
    return NextResponse.json({ error: 'place_id is required' }, { status: 400 });
  }

  const directReviewUrl = placeId.startsWith('ChIJ')
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeId)}`;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (apiKey && apiKey !== 'your-google-places-api-key' && placeId.startsWith('ChIJ')) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,url&language=id&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.result) {
        return NextResponse.json({
          place_id: placeId,
          name: data.result.name,
          formatted_address: data.result.formatted_address,
          review_url: directReviewUrl,
        });
      }
    } catch (err: any) {
      console.error('Google Places Details error:', err);
    }
  }

  return NextResponse.json({
    place_id: placeId,
    name: 'Bisnis Terdaftar',
    formatted_address: '',
    review_url: directReviewUrl,
  });
}
