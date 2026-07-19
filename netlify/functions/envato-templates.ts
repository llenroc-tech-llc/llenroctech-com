import type { Handler } from '@netlify/functions';

const ENDPOINT = 'https://api.envato.com/v1/discovery/search/search/item';
const MAX_ITEMS = 9;
const ALLOWED_HOSTS = new Set(['themeforest.net', 'www.themeforest.net']);

const safeUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : undefined; } catch { return undefined; }
};

export const normalizeEnvatoItems = (payload: unknown) => {
  const matches = payload && typeof payload === 'object' && Array.isArray((payload as any).matches) ? (payload as any).matches : [];
  return matches.map((item: any) => {
    const marketplaceUrl = safeUrl(item?.url);
    if (!item?.id || typeof item?.name !== 'string' || !marketplaceUrl || !ALLOWED_HOSTS.has(new URL(marketplaceUrl).hostname)) return null;
    return {
      id: String(item.id), name: item.name.slice(0, 140), author: typeof item.author_username === 'string' ? item.author_username.slice(0, 80) : undefined,
      category: 'Website Template', framework: 'Angular',
      thumbnailUrl: safeUrl(item?.previews?.landscape_preview?.landscape_url || item?.previews?.icon_with_landscape_preview?.icon_url),
      previewUrl: safeUrl(item?.previews?.live_site?.url || item?.previews?.live_site?.https), marketplaceUrl,
      priceDisplay: Number.isFinite(item?.price_cents) ? `$${(item.price_cents / 100).toFixed(0)}` : undefined,
      tags: Array.isArray(item?.tags) ? item.tags.filter((tag: unknown) => typeof tag === 'string').slice(0, 6) : [], source: 'ThemeForest' as const,
      lastVerifiedAt: typeof item.updated_at === 'string' ? item.updated_at : undefined,
    };
  }).filter(Boolean).slice(0, MAX_ITEMS);
};

export const handler: Handler = async () => {
  const token = process.env.ENVATO_PERSONAL_TOKEN;
  if (!token) return { statusCode: 503, headers: {'Cache-Control':'no-store'}, body: JSON.stringify({ error: 'temporarily_unavailable' }) };
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const url = `${ENDPOINT}?site=themeforest.net&term=${encodeURIComponent('angular saas business dashboard')}&page=1&page_size=${MAX_ITEMS}`;
    const response = await fetch(url,{signal:controller.signal,headers:{Authorization:`Bearer ${token}`,'User-Agent':'llenroctech-template-inspiration',Accept:'application/json'}});
    if (!response.ok) return {statusCode:503,headers:{'Cache-Control':'no-store'},body:JSON.stringify({error:'temporarily_unavailable'})};
    const items=normalizeEnvatoItems(await response.json());
    return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=900, s-maxage=21600, stale-while-revalidate=86400'},body:JSON.stringify({items})};
  } catch { return {statusCode:503,headers:{'Cache-Control':'no-store'},body:JSON.stringify({error:'temporarily_unavailable'})}; }
  finally { clearTimeout(timeout); }
};
