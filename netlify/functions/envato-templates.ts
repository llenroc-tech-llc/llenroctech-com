import type { Handler } from "@netlify/functions";

const BASE = "https://api.envato.com/v1/discovery/search/search/item";

export const handler: Handler = async (event) => {
  const q = event.queryStringParameters?.q || "angular";
  const page = event.queryStringParameters?.page || "1";
  const pageSize = event.queryStringParameters?.page_size || "12";

  const url =
    `${BASE}?site=themeforest.net&term=${encodeURIComponent(q)}` +
    `&page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(pageSize)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.ENVATO_TOKEN!}`,
      "User-Agent": "llenroctech-templates (support@llenroctech.com)",
      Accept: "application/json",
    },
  });

  if (res.status === 429) {
    const retry = res.headers.get("Retry-After") || "30";
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "rate_limited", retryAfterSec: retry }),
    };
  }

  if (!res.ok) {
    return { statusCode: res.status, body: await res.text() };
  }

  const data = await res.json();
  const items = (data.matches || []).map((it: any) => ({
    id: it.id,
    name: it.name,
    author: it.author_username,
    url: it.url,
    livePreview: it?.previews?.live_site?.url || it?.previews?.live_site?.https || it.url,
    thumbnail: it?.previews?.landscape_preview?.landscape_url || it?.previews?.icon_with_landscape_preview?.icon_url,
    rating: it?.rating?.rating ?? 0,
    rating_count: it?.rating?.count ?? 0,
    updated_at: it.updated_at,
    price_cents: it?.price_cents,
    tags: it?.tags,
  }));

  return { statusCode: 200, body: JSON.stringify({ items }) };
};