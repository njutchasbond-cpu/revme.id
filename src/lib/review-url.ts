/**
 * Helper untuk memastikan URL ulasan Google mengarah langsung ke pop-up
 * pemberian rating bintang 5 (Write a Review), bukan sekadar halaman pencarian peta.
 */

export function extractChIJFromInput(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Jika input langsung berupa Place ID (diawali ChIJ)
  if (/^ChIJ[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }

  // Jika input berupa URL yang mengandung placeid=ChIJ... atau place_id=ChIJ...
  const match = trimmed.match(/[?&]place_?id=(ChIJ[a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export function isDirectWriteReviewUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('search.google.com/local/writereview') ||
    trimmed.includes('g.page/r/') ||
    trimmed.includes('/review')
  );
}

export function buildGoogleReviewUrl(params: {
  google_place_id?: string | null;
  custom_review_url?: string | null;
  business_name?: string | null;
  business_address?: string | null;
}): { google_place_id: string | null; review_url: string } {
  const { google_place_id, custom_review_url, business_name, business_address } = params;

  // 1. Cek apakah ada ChIJ Place ID dari google_place_id atau dari custom_review_url
  const chijFromPlaceId = extractChIJFromInput(google_place_id);
  const chijFromCustomUrl = extractChIJFromInput(custom_review_url);
  const validChIJ = chijFromPlaceId || chijFromCustomUrl;

  if (validChIJ) {
    return {
      google_place_id: validChIJ,
      review_url: `https://search.google.com/local/writereview?placeid=${validChIJ}`,
    };
  }

  // 2. Jika user/admin mengisi link ulasan langsung (misal https://g.page/r/.../review)
  if (custom_review_url && custom_review_url.trim().length > 0) {
    let cleanUrl = custom_review_url.trim();
    if (!cleanUrl.includes('google.com/maps/search/')) {
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      if (/^https?:\/\/g\.page\/r\/[a-zA-Z0-9_-]+\/?$/i.test(cleanUrl)) {
        cleanUrl = cleanUrl.replace(/\/?$/, '/review');
      }
      return {
        google_place_id: google_place_id || null,
        review_url: cleanUrl,
      };
    }
  }

  // 3. Fallback ke pencarian Google Maps jika belum ada Place ID ChIJ maupun link g.page/r/
  const query = [business_name || '', business_address || ''].filter(Boolean).join(' ').trim();
  return {
    google_place_id: google_place_id || null,
    review_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Indonesia')}`,
  };
}

async function queryAutocompletePlaceId(query: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: query,
        includedRegionCodes: ['id'],
        languageCode: 'id',
        regionCode: 'ID',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const firstPrediction = data.suggestions
        ?.map((s: any) => s.placePrediction)
        .find((p: any) => p?.placeId && p.placeId.startsWith('ChIJ'));

      if (firstPrediction?.placeId) {
        return firstPrediction.placeId;
      }
    }
  } catch {
    // Ignore and continue fallback
  }
  return null;
}

/**
 * Mencari Google Place ID (ChIJ...) resmi menggunakan Google Places API (New)
 * Autocomplete & Text Search jika GOOGLE_PLACES_API_KEY tersedia.
 */
export async function resolveGooglePlaceViaNewApi(
  businessName: string,
  businessAddress?: string | null
): Promise<{ place_id: string; review_url: string } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your-google-places-api-key') {
    return null;
  }

  const cleanName = (businessName || '').trim();
  const cleanAddress = (businessAddress || '').trim();
  if (!cleanName) return null;

  try {
    // 1A. Coba Places API (New) Autocomplete dengan nama bisnis + alamat
    if (cleanAddress) {
      const combinedId = await queryAutocompletePlaceId(`${cleanName} ${cleanAddress}`, apiKey);
      if (combinedId) {
        return {
          place_id: combinedId,
          review_url: `https://search.google.com/local/writereview?placeid=${combinedId}`,
        };
      }
    }

    // 1B. Coba Places API (New) Autocomplete dengan nama bisnis saja (paling akurat jika alamat manual berbeda format)
    const nameOnlyId = await queryAutocompletePlaceId(cleanName, apiKey);
    if (nameOnlyId) {
      return {
        place_id: nameOnlyId,
        review_url: `https://search.google.com/local/writereview?placeid=${nameOnlyId}`,
      };
    }

    // 2. Fallback ke Places API (New) Text Search dengan FieldMask sederhana places.id
    const textQuery = [cleanName, cleanAddress].filter(Boolean).join(' ').trim();
    const newApiRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({
        textQuery,
        regionCode: 'ID',
        languageCode: 'id',
        maxResultCount: 1,
      }),
    });

    if (newApiRes.ok) {
      const data = await newApiRes.json();
      const firstPlace = data.places?.[0];
      if (firstPlace?.id) {
        return {
          place_id: firstPlace.id,
          review_url: `https://search.google.com/local/writereview?placeid=${firstPlace.id}`,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to resolve Google Place ID via API:', err);
  }

  return null;
}
