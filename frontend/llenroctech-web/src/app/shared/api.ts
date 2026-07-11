// Helper for calling Netlify Functions in dev/prod
export const FN_BASE =
  location.hostname.endsWith('netlify.app') || location.hostname.endsWith('llenroctech.com')
    ? '/.netlify/functions'
    : (import.meta as any).env?.NG_APP_FN_BASE || '/.netlify/functions';
