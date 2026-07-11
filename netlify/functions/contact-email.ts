import type { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const resendApiKey = process.env.RESEND_API_KEY ?? '';

export const handler: Handler = async (event) => {
  // CORS & healthcheck
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers: cors, body: 'contact-email: ok' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  if (!resendApiKey) return json(500, { ok:false, error:'Missing RESEND_API_KEY' });

  const body = safeJson(event.body);
  if (!body) return json(400, { ok:false, error:'Invalid JSON' });

  const { name, email, phone, subject, budget, message } = body;
  if (!name || !email || !message) {
    return json(400, { ok:false, error:'name, email, message required' });
  }

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

  if (error) return json(502, { ok:false, error:String(error?.message || error) });
  return json(200, { ok:true, id:data?.id });
};

// Helpers
function json(statusCode: number, body: unknown) {
  return { statusCode, headers: { 'content-type': 'application/json', ...cors }, body: JSON.stringify(body) };
}
function safeJson(b?: string | null) { try { return b ? JSON.parse(b) : null; } catch { return null; } }
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
