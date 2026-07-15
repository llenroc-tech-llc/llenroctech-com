import type { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const cors = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
};

const resendApiKey = process.env.RESEND_API_KEY ?? '';
const MAX_REQUEST_BYTES = 8 * 1024;
const PRODUCTION_ORIGINS = new Set([
  'https://llenroctech.com',
  'https://www.llenroctech.com',
]);

type ContactRequest = {
  botField: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  budget: string;
  message: string;
};

export const config = {
  path: ['/.netlify/functions/contact-email', '/api/contact-email'],
  rateLimit: {
    windowLimit: 3,
    windowSize: 3600,
    aggregateBy: ['ip', 'domain'],
  },
};

export const handler: Handler = async (event) => {
  const corsHeaders = getCorsHeaders(event.headers);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method Not Allowed' }, corsHeaders, { Allow: 'POST' });
  }
  if (!isOriginAllowed(event.headers)) {
    return json(403, { ok: false, error: 'Request origin is not allowed.' }, corsHeaders);
  }

  const contentType = getHeader(event.headers, 'content-type');
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, error: 'Content-Type must be application/json.' }, corsHeaders);
  }

  if (!event.body) return json(400, { ok: false, error: 'Request body is required.' }, corsHeaders);

  const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  if (bodyBuffer.byteLength > MAX_REQUEST_BYTES) {
    return json(413, { ok: false, error: 'The request is too large.' }, corsHeaders);
  }

  const parsedBody = safeJson(bodyBuffer.toString('utf8'));
  const validation = validateContactRequest(parsedBody);
  if (validation.ok === false) return json(400, { ok: false, error: validation.error }, corsHeaders);

  const { botField, name, email, phone, subject, budget, message } = validation.value;
  if (botField) return json(400, { ok: false, error: 'Invalid request.' }, corsHeaders);

  if (!resendApiKey) return json(500, { ok: false, error: 'The contact service is temporarily unavailable.' }, corsHeaders);

  // Instantiate Resend
  const resend = new Resend(resendApiKey);

  // Email meta
  const fromAddress = 'hello@llenroctech.com'; // ✅ must be verified sender
  const toAddress   = 'support@llenroctech.com';

  const prettySubject = `New Contact • ${name} ${subject ? `— ${subject}` : ''}`.trim();

  // Plaintext fallback
  const textBody =
`New contact submission

Name:   ${name}
Email:  ${email}
Phone:  ${phone || '-'}
Budget: ${budget || '-'}
Subject:${subject || '-'}
Message:
${message}
`;

  // HTML body
  const htmlBody = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <title>${prettySubject}</title>
    <style>
      body{margin:0;padding:0;background:#f6f7fb;-webkit-font-smoothing:antialiased;}
      table{border-collapse:collapse;}
      img{border:0;outline:none;text-decoration:none;max-width:100%;}
      .wrapper{width:100%;background:#f6f7fb;padding:24px;}
      .container{max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;
                 box-shadow:0 2px 12px rgba(18,22,33,.06);overflow:hidden;}
      .header{background:#0f172a;color:#fff;padding:20px 24px;}
      .brand{font:600 18px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}
      .content{padding:24px;color:#0f172a;font:400 14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}
      .h1{margin:0 0 8px;font:700 20px/1.3 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}
      .muted{color:#6b7280;}
      .card{border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:16px 0;background:#fafafa;}
      .row{margin:0 0 8px;}
      .k{display:inline-block;width:88px;color:#6b7280;}
      .v{color:#111827;}
      .msg{white-space:pre-wrap;border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:12px;margin-top:8px;}
      .cta{margin-top:20px;}
      .btn{display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;
           padding:10px 14px;font-weight:600}
      .footer{padding:18px 24px;color:#6b7280;font:400 12px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;text-align:center;}
      @media (prefers-color-scheme: dark){
        body{background:#0b1220}
        .container{background:#0f172a;color:#e5e7eb}
        .header{background:#0b0f1a}
        .card{background:#0b0f1a;border-color:#1f2937}
        .msg{background:#0f172a;border-color:#1f2937;color:#e5e7eb}
        .muted{color:#9ca3af}
        .v{color:#f3f4f6}
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <table role="presentation" class="container" width="100%">
        <tr>
          <td class="header">
            <div class="brand">Llenroc Tech • Contact</div>
          </td>
        </tr>
        <tr>
          <td class="content">
            <h1 class="h1">New contact form submission</h1>
            <p class="muted">You received a new message from your website.</p>

            <div class="card">
              <div class="row"><span class="k">Name</span><span class="v">${escapeHtml(name)}</span></div>
              <div class="row"><span class="k">Email</span><span class="v">${escapeHtml(email)}</span></div>
              <div class="row"><span class="k">Phone</span><span class="v">${escapeHtml(phone || '-')}</span></div>
              <div class="row"><span class="k">Budget</span><span class="v">${escapeHtml(budget || '-')}</span></div>
              <div class="row"><span class="k">Subject</span><span class="v">${escapeHtml(subject || '-')}</span></div>
              <div class="row"><span class="k">Message</span></div>
              <div class="msg">${escapeHtml(message).replace(/\n/g,'<br/>')}</div>
            </div>

            <div class="cta">
              <a class="btn" href="mailto:${encodeURIComponent(email)}?subject=Re:%20${encodeURIComponent(subject || 'Your enquiry')}">
                Reply to ${escapeHtml(name)}
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td class="footer">
            Sent automatically from llenroctech.com • Reply will go to the sender.<br/>
            © ${new Date().getFullYear()} Llenroc Tech
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`;

  // Send
  const { data, error } = await resend.emails.send({
    from: `Llenroc Tech <${fromAddress}>`,
    to: toAddress,
    subject: prettySubject,
    replyTo: email,
    text: textBody,
    html: htmlBody
  });

  if (error) return json(502, { ok: false, error: 'The message could not be sent. Please try again later.' }, corsHeaders);
  return json(200, { ok: true, id: data?.id }, corsHeaders);
};

// Helpers
function getAllowedOrigins() {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = new Set([...PRODUCTION_ORIGINS, ...configuredOrigins]);

  if (process.env.CONTEXT !== 'production') {
    origins.add('http://localhost:4200');
    origins.add('http://localhost:8888');
  }

  return origins;
}

function getHeader(headers: Record<string, string | undefined>, name: string) {
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return String(entry?.[1] || '');
}

function isOriginAllowed(headers: Record<string, string | undefined>) {
  const origin = getHeader(headers, 'origin');
  return !origin || getAllowedOrigins().has(origin);
}

function getCorsHeaders(headers: Record<string, string | undefined>) {
  const origin = getHeader(headers, 'origin');
  return origin && getAllowedOrigins().has(origin)
    ? { ...cors, 'Access-Control-Allow-Origin': origin }
    : cors;
}

function json(statusCode: number, body: unknown, corsHeaders: Record<string, string>, extraHeaders: Record<string, string> = {}) {
  return { statusCode, headers: { 'content-type': 'application/json', ...corsHeaders, ...extraHeaders }, body: JSON.stringify(body) };
}
function safeJson(value: string): unknown { try { return JSON.parse(value); } catch { return null; } }

function validateContactRequest(value: unknown): { ok: true; value: ContactRequest } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Invalid request.' };
  }

  const input = value as Record<string, unknown>;
  const allowedFields = new Set(['botField', 'name', 'email', 'phone', 'subject', 'budget', 'message']);
  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    return { ok: false, error: 'Invalid request fields.' };
  }

  for (const field of allowedFields) {
    if (input[field] !== undefined && typeof input[field] !== 'string') {
      return { ok: false, error: `Invalid ${field}.` };
    }
  }

  const result: ContactRequest = {
    botField: String(input.botField || '').trim(),
    name: normalizeSingleLine(input.name),
    email: normalizeSingleLine(input.email).toLowerCase(),
    phone: normalizeSingleLine(input.phone),
    subject: normalizeSingleLine(input.subject),
    budget: normalizeSingleLine(input.budget),
    message: String(input.message || '').trim(),
  };

  if (result.botField.length > 200) return { ok: false, error: 'Invalid botField.' };
  if (result.name.length < 2 || result.name.length > 100) return { ok: false, error: 'Name must be between 2 and 100 characters.' };
  if (result.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) return { ok: false, error: 'A valid email address is required.' };
  if (result.phone.length > 30) return { ok: false, error: 'Phone must not exceed 30 characters.' };
  if (result.subject.length > 160) return { ok: false, error: 'Subject must not exceed 160 characters.' };
  if (result.budget.length > 100) return { ok: false, error: 'Budget must not exceed 100 characters.' };
  if (result.message.length < 10 || result.message.length > 4000) return { ok: false, error: 'Message must be between 10 and 4000 characters.' };

  return { ok: true, value: result };
}

function normalizeSingleLine(value: unknown) {
  return String(value || '').replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
