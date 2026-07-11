import type { Handler } from '@netlify/functions';

async function getAppToken() {
  const resp = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    })
  });
  if (!resp.ok) throw new Error(`Token error ${resp.status}: ${await resp.text()}`);
  return (await resp.json()).access_token as string;
}

const LIST_MAP: Record<string, string> = {
  // ENV VARS: each holds the Graph listId for that table
  datamapping: process.env.SP_LIST_DATAMAPPING_ID!,
  privacyinputs: process.env.SP_LIST_PRIVACYINPUTS_ID!,
  lawfulbasis: process.env.SP_LIST_LAWFULBASIS_ID!,
  cookies: process.env.SP_LIST_COOKIES_ID!,
  dpas: process.env.SP_LIST_DPAS_ID!,
  security: process.env.SP_LIST_SECURITY_ID!,
  incident: process.env.SP_LIST_INCIDENT_ID!,
  leadimpl: process.env.SP_LIST_LEADIMPL_ID!,
};

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };

    const body = event.body ? JSON.parse(event.body) : {};
    const { form, botField, ...fieldsIn } = body;
    if (botField) return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
    if (!form || !LIST_MAP[form]) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid form key' }) };

    // Basic requireds per form (server-side)
    const requiredByForm: Record<string, string[]> = {
      datamapping: ['ClientProject','DataElement','Purpose'],
      privacyinputs: ['ClientProject'],
      lawfulbasis: ['ClientProject','ProcessingActivity','LawfulBasis'],
      cookies: ['ClientProject','ToolOrCookie'],
      dpas: ['ClientProject','ProcessorName'],
      security: ['ClientProject'],
      incident: ['ClientProject'],
      leadimpl: ['ClientProject'],
    };
    const missing = (requiredByForm[form] || []).filter(k => !fieldsIn[k] || String(fieldsIn[k]).trim() === '');
    if (missing.length) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: `Missing required: ${missing.join(', ')}` }) };
    }

    const token = await getAppToken();
    const siteId = process.env.SP_SITE_ID!;
    const listId = LIST_MAP[form];

    // Note: field names must match your SharePoint list internal names.
    const resp = await fetch(`https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { Title: fieldsIn.ClientProject, ...fieldsIn } }),
    });

    if (!resp.ok) return { statusCode: resp.status, headers: cors, body: JSON.stringify({ error: await resp.text() }) };
    const item = await resp.json();
    return { statusCode: 201, headers: cors, body: JSON.stringify({ ok: true, id: item?.id }) };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err?.message || 'Server error' }) };
  }
};
