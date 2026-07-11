// netlify/functions/create-checkout-session-card-only.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    const amountUsd = Number(body.amount);
    if (!Number.isFinite(amountUsd)) return { statusCode: 400, body: 'Amount must be a number' };

    const amount = Math.round(amountUsd * 100);
    if (amount < 100)  return { statusCode: 400, body: 'Minimum is $1.00' };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], // 👈 force card-only
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: body.label || 'Payment' },
          unit_amount: amount
        },
        quantity: 1
      }],
      customer_email: body.customerEmail || undefined,
      success_url: `${process.env.SITE_URL || 'http://localhost:4200'}/checkout/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL || 'http://localhost:4200'}/checkout/cancel`,
      metadata: body.metadata || {}
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url, id: session.id }) };
  } catch (err) {
    return { statusCode: 500, body: err?.message || 'Stripe error' };
  }
}
