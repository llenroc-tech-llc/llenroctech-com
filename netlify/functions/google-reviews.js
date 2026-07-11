// netlify/functions/google-reviews.js
const FIELDS = "places.id,places.displayName,places.formattedAddress";
const DETAIL_FIELDS = "rating,userRatingCount,reviews";

// --- helpers (search by text query if PLACE_ID not provided) ---
async function searchPlaceId({ apiKey, textQuery, bias }) {
  const body = { textQuery, regionCode: "US", languageCode: "en" };
  if (bias) body.locationBias = { circle: { center: bias.center, radius: bias.radius } };

  const resp = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELDS
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) return { error: `searchText ${resp.status}: ${await resp.text()}` };
  const data = await resp.json();
  const id = data?.places?.[0]?.id?.replace(/^places\//, "");
  return { id, raw: data };
}

async function getDetails({ apiKey, placeId }) {
  const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=${DETAIL_FIELDS}`, {
    headers: { "X-Goog-Api-Key": apiKey }
  });
  if (!resp.ok) return { error: `details ${resp.status}: ${await resp.text()}` };
  const data = await resp.json();
  return { data };
}

export const handler = async () => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeIdEnv = process.env.GOOGLE_PLACE_ID;
  const q = (process.env.BUSINESS_QUERY || "").trim();

  if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "Missing GOOGLE_PLACES_API_KEY" }) };

  let placeId = placeIdEnv;
  if (!placeId) {
    const lat = Number(process.env.LAT);
    const lon = Number(process.env.LON);
    const radius = Number(process.env.RADIUS_M || 50000);
    const bias = (!isNaN(lat) && !isNaN(lon)) ? { center: { latitude: lat, longitude: lon }, radius } : undefined;

    const search = await searchPlaceId({ apiKey, textQuery: q || "Llenroc Tech Fort Mill SC", bias });
    if (search.error) return { statusCode: 500, body: JSON.stringify({ error: search.error }) };
    placeId = search.id;
  }

  const det = await getDetails({ apiKey, placeId });
  if (det.error) return { statusCode: 500, body: JSON.stringify({ error: det.error }) };

  const reviews = (det.data.reviews || []).map(r => ({
    author_name: r.authorName,
    profile_photo_url: r.authorPhotoUri,
    rating: r.rating,
    relative_time_description: r.relativePublishTimeDescription,
    text: r.text?.text || r.originalText?.text || ""
  }));

  return { statusCode: 200, body: JSON.stringify({ reviews }) };
};
