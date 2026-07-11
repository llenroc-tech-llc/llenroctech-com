// netlify/functions/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // sk_test_...

export async function handler(event) {
  const isDev = process.env.NETLIFY_DEV === 'true';

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Expect { amount: 5.00, label?: string, metadata?: object }
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: 'Invalid JSON' };
    }

    const amountUsd = Number(body.amount);
    if (!Number.isFinite(amountUsd)) {
      return { statusCode: 400, body: 'Amount must be a number' };
    }

    // Convert to cents; clamp min/max (edit to taste)
    const amount = Math.round(amountUsd * 100);
    if (amount < 100)  return { statusCode: 400, body: 'Minimum is $1.00' };
    if (amount > 1_000_000) return { statusCode: 400, body: 'Maximum is $10,000' };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: body.label || 'Llenroc Tech – Custom Payment' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      success_url: `${process.env.SITE_URL || 'http://localhost:4200'}/checkout/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL || 'http://localhost:4200'}/checkout/cancel`,
      metadata: body.metadata || {}
      // automatic_tax: { enabled: true }, // optional later
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, id: session.id }),
    };
  } catch (err) {
    console.error('create-checkout-session error:', err?.message, err);
    return {
      statusCode: 500,
      body: isDev ? (err?.message || 'Stripe session error') : 'Stripe session error'
    };
  }
}
