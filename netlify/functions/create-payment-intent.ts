import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*', // tighten to your domain in prod
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

// Init Stripe (use a current API version or omit the apiVersion key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

// Safe Supabase logger (no-op if not configured)
async function logToSupabase(row: any) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Guard: skip if missing or invalid
  if (!base || !/^https?:\/\//.test(base) || !key) {
    console.warn('[logToSupabase] skipped — missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  try {
    const url = `${base}/rest/v1/payments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[logToSupabase] insert failed:', res.status, txt);
    }
  } catch (e: any) {
    console.warn('[logToSupabase] error:', e?.message);
  }
}

export const handler: Handler = async (event) => {
  try {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: CORS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }) };
    }

    if (!event.body) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Empty request body' }) };
    }

    let payload: any;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    // Expect { amount: <cents>, currency: 'usd', name?, email?, address?, orderId? }
    const amount = Number(payload.amount);
    const currency = (payload.currency || 'usd').toLowerCase();
    const name = payload.name || 'Guest';
    const email = payload.email || '';
    const addr = payload.address || null;

    if (!Number.isInteger(amount) || amount <= 0) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'amount must be a positive integer in smallest unit (cents)' }) };
    }
    if (typeof currency !== 'string' || currency.length !== 3) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'currency must be a 3-letter code (e.g. "usd")' }) };
    }

    // Build a stable idempotency key (prevents duplicate PIs if client double-submits)
    const idemKey = `pi:${payload.orderId || ''}:${amount}:${currency}:${email || ''}`;

    // Create PaymentIntent (card only — no Klarna/etc shown)
    const pi = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        receipt_email: email || undefined,
        description: `Llenroc Tech Payment - ${name}`,
        payment_method_types: ['card'], // only Card in Payment Element
        metadata: {
          customer_name: name,
          form_email: email,
          orderId: payload.orderId || '',
        },
        shipping: addr
          ? {
              name,
              address: {
                line1: addr.line1 || '',
                line2: addr.line2 || '',
                city: addr.city || '',
                state: addr.state || '',
                postal_code: addr.postal || '',
                country: (addr.country || 'US').toUpperCase(),
              },
            }
          : undefined,
      },
      { idempotencyKey: idemKey }
    );

    // Fire-and-forget log (won’t crash if misconfigured)
    logToSupabase({
      provider: 'stripe',
      status: 'created',
      amount,
      currency,
      intent_id: pi.id,
      email,
      name,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ clientSecret: pi.client_secret }),
    };
  } catch (err: any) {
    console.error('[create-payment-intent] ERROR:', err?.message, err?.stack);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err?.message || 'Server error creating PaymentIntent' }),
    };
  }
};
