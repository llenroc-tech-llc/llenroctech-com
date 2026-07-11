// netlify/functions/testimonials.ts
import type { Handler } from '@netlify/functions';

type Testimonial = {
  author: string;
  company?: string;
  text: string;
  rating: number;
  avatarSrc?: string;
};

export const handler: Handler = async (event) => {
  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';
  const placeId =
    event.queryStringParameters?.placeId ||
    process.env.GOOGLE_PLACE_ID ||
    '';

  // meta: return write review url etc
  const wantMeta = event.queryStringParameters?.meta === '1';

  if (!apiKey || !placeId) {
    return json(400, {
      error:
        'Missing GOOGLE_PLACES_API_KEY/GOOGLE_MAPS_API_KEY or GOOGLE_PLACE_ID',
    });
  }

  try {
    if (wantMeta) {
      return json(200, {
        placeId,
        name: undefined,
        writeReviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
          placeId
        )}`,
      });
    }

    // 1) Try Places API (New) v1
    const v1 = await fetchV1PlaceDetails(apiKey, placeId);
    if (v1.ok) {
      const mapped = mapV1ToTestimonials(v1.data);
      return json(200, mapped, /*no-cache*/ true);
    } else {
      console.error('Places v1 error', v1.status, v1.data);
    }

    // 2) Fallback to legacy Place Details
    const legacy = await fetchLegacyDetails(apiKey, placeId);
    if (legacy.ok) {
      const mapped = mapLegacyToTestimonials(legacy.data);
      return json(200, mapped, true);
    } else {
      console.error('Legacy Place Details error', legacy.status, legacy.data);
      return json(502, {
        error: 'Failed to load place details',
        status: legacy.status,
        details: legacy.data,
      });
    }
  } catch (err: any) {
    console.error('Unhandled testimonials error', err);
    return json(500, { error: err?.message ?? 'Unknown error' });
  }
};

// ---------- helpers ----------

function json(statusCode: number, body: any, noCache = false) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...(noCache ? { 'Cache-Control': 'no-store' } : {}),
    },
    body: JSON.stringify(body),
  };
}

// Places API (New) v1
async function fetchV1PlaceDetails(apiKey: string, placeId: string) {
  const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    placeId
  )}`;
  // Reviews require the 'reviews' field in the mask
  const fieldMask =
    'id,displayName,googleMapsUri,reviews,reviews.authorAttribution,reviews.publishTime,reviews.rating,reviews.text,reviews.originalText,reviews.relativePublishTimeDescription';

  const res = await fetch(`${endpoint}?fields=${encodeURIComponent(fieldMask)}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask, // Google accepts either query 'fields' or header mask
      'Accept': 'application/json',
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // leave as null
  }
  // v1 errors are in res.status and body.error / error.message
  if (!res.ok || (data && data.error)) {
    return { ok: false as const, status: data?.error?.status || res.status, data };
  }
  return { ok: true as const, status: 'OK', data };
}

function mapV1ToTestimonials(v1: any): Testimonial[] {
  const name = v1?.displayName?.text || 'Google Reviewer';
  const reviews: any[] = v1?.reviews || [];
  return reviews.map((r) => ({
    author: r?.authorAttribution?.displayName || 'Anonymous',
    company: name,
    text: r?.text?.text || r?.originalText?.text || '',
    rating: clamp(Number(r?.rating ?? 5), 1, 5),
    avatarSrc: r?.authorAttribution?.photoUri, // may be undefined
  }));
}

// Legacy Place Details
async function fetchLegacyDetails(apiKey: string, placeId: string) {
  const fields = 'name,url,reviews';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok || data?.status !== 'OK') {
    return { ok: false as const, status: data?.status || res.status, data };
  }
  return { ok: true as const, status: 'OK', data };
}

function mapLegacyToTestimonials(legacy: any): Testimonial[] {
  const name = legacy?.result?.name || 'Google Reviewer';
  const reviews: any[] = legacy?.result?.reviews || [];
  return reviews.map((r) => ({
    author: r?.author_name || 'Anonymous',
    company: name,
    text: r?.text || '',
    rating: clamp(Number(r?.rating ?? 5), 1, 5),
    avatarSrc: r?.profile_photo_url,
  }));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
