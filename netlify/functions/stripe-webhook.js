// netlify/functions/stripe-webhook.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    return { statusCode: 400, body: `Invalid signature: ${err.message}` };
  }

  // record in Supabase (idempotent)
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // idempotency
  await supabase.from('webhook_events').insert({
    id: stripeEvent.id, provider: 'stripe', raw: stripeEvent
  }).catch(() => { /* ignore if exists */ });

  if (['payment_intent.succeeded','payment_intent.payment_failed','payment_intent.processing','charge.refunded']
      .includes(stripeEvent.type)) {
    const intent = stripeEvent.data.object; // PaymentIntent
    await supabase.from('payments').upsert({
      provider: 'stripe',
      provider_payment_id: intent.id,
      status: intent.status,
      amount_cents: intent.amount || null,
      currency: (intent.currency || 'usd').toLowerCase(),
      customer_email: intent.receipt_email || null,
      order_id: intent.metadata?.orderId || null,
      raw: intent,
      updated_at: new Date().toISOString()
    }, { onConflict: 'provider_payment_id' });
  }

  return { statusCode: 200, body: 'ok' };
}
