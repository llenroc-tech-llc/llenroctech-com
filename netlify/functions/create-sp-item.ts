// netlify/functions/create-sp-item.ts
// Auto-maps display names ⇄ internal names so it adapts to your list.

type Json = Record<string, any>;

// Tiny fetch helper (works locally + prod)
async function http(url: string, init?: RequestInit) {
  const f = (globalThis as any).fetch || (await import('node-fetch')).default;
  return f(url as any, init as any) as Promise<Response>;
}

export async function handler(event: any) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // ---- Parse body ----
    let data: Json = {};
    try { data = JSON.parse(event.body || '{}'); }
    catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }; }

    // ---- Env ----
    const env = {
      tenant: process.env.MS_TENANT_ID,
      clientId: process.env.MS_CLIENT_ID,
      clientSecret: process.env.MS_CLIENT_SECRET,
      siteId: process.env.MS_SITE_ID,
      listId: process.env.MS_LIST_ID,
    };
    const missing = Object.entries(env).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing env vars', missing }) };
    }

    // ---- 1) Get app token ----
    const tokenRes = await http(`https://login.microsoftonline.com/${env.tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.clientId!,
        client_secret: env.clientSecret!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    const tokenTxt = await tokenRes.text();
    if (!tokenRes.ok) {
      return { statusCode: tokenRes.status, body: JSON.stringify({ error: 'Token request failed', details: tokenTxt }) };
    }
    const { access_token } = JSON.parse(tokenTxt);

    // ---- 2) Read list columns (to map names) ----
    const colsRes = await http(
      `https://graph.microsoft.com/v1.0/sites/${env.siteId}/lists/${env.listId}/columns?$select=name,displayName`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const colsJson = await colsRes.json();
    if (!colsRes.ok) {
      return { statusCode: colsRes.status, body: JSON.stringify({ error: 'Read columns failed', details: colsJson }) };
    }

    type Col = { name: string; displayName: string };
    const cols: Col[] = colsJson.value || [];

    // Build an index where both internal name and display name resolve to the internal name
    const index = new Map<string, string>();
    for (const c of cols) {
      if (c.name) index.set(c.name.toLowerCase(), c.name);
      if (c.displayName) index.set(c.displayName.toLowerCase(), c.name);
    }
    const resolve = (...aliases: string[]) => {
      for (const a of aliases) {
        const hit = index.get(a.toLowerCase());
        if (hit) return hit;
      }
      return null;
    };

    // Helper to add a field only if a matching column exists
    const fields: any = {};
    const assign = (aliases: string[], value: any) => {
      const name = resolve(...aliases);
      if (name != null && value !== undefined && value !== '') fields[name] = value;
      return name;
    };

    // ---- 3) Map incoming data to actual internal names ----
    // Title is always safe to set
    fields['Title'] = `Contract: ${data.ClientName || 'Unknown'}`;

    // Add your fields with friendly aliases (internal & display possibilities)
    assign(['ClientName', 'Client Name'], data.ClientName);
    assign(['ClientEmail', 'Client Email'], data.ClientEmail);
    assign(['ClientTitle', 'Client Title'], data.ClientTitle);
    assign(['ProjectScope', 'Project Scope'], data.ProjectScope);
    assign(['ProjectFee', 'Project Fee'], Number(data.ProjectFee || 0));
    assign(['EffectiveDate', 'Effective Date'], data.EffectiveDate);
    assign(['StartDate', 'Start Date'], data.StartDate);
    assign(['EndDate', 'End Date'], data.EndDate);
    assign(['GoverningLawCounty', 'Governing Law County'], data.GoverningLawCounty);
    assign(['Status'], 'Pending Review'); // only if you actually have a Status column

    // If you want to debug what mapped / didn’t, uncomment:
    // const unmapped = ['ClientName','ClientEmail','ClientTitle','ProjectScope','ProjectFee','EffectiveDate','StartDate','EndDate','GoverningLawCounty','Status']
    //   .filter(k => !resolve(k, k.replace(/([A-Z])/g,' $1').trim()));
    // console.log({ mapped: Object.keys(fields), unmapped });

    // ---- 4) Create item ----
    const spRes = await http(`https://graph.microsoft.com/v1.0/sites/${env.siteId}/lists/${env.listId}/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    const spTxt = await spRes.text();
    if (!spRes.ok) {
      return { statusCode: spRes.status, body: JSON.stringify({ error: 'SharePoint create failed', details: spTxt }) };
    }

    return { statusCode: 200, body: spTxt };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err?.message || 'Server error', stack: err?.stack }) };
  }
}
