import type { Handler } from '@netlify/functions'

const CORS = {
  'Access-Control-Allow-Origin': '*',          // tighten in prod
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
}

// pick sandbox vs live
function apiBase() {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase()
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken() {
  const cid = process.env.PAYPAL_CLIENT_ID || ''
  const secret = process.env.PAYPAL_SECRET || ''
  if (!cid || !secret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET')
  }
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${cid}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`OAuth failed: ${res.status} ${await res.text()}`)
  const j = await res.json()
  return j.access_token as string
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
    }
    if (!event.body) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Empty body' }) }
    }

    const { amountCents, currency = 'USD', orderId } = JSON.parse(event.body)
    const value = (Number(amountCents) / 100).toFixed(2)
    if (!amountCents || Number.isNaN(Number(amountCents)) || Number(amountCents) <= 0) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'amountCents required (integer cents)' }) }
    }

    const token = await getAccessToken()

    const createRes = await fetch(`${apiBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId || 'order',
            amount: { currency_code: (currency || 'USD').toUpperCase(), value },
          },
        ],
        application_context: {
          user_action: 'PAY_NOW',
          brand_name: 'Llenroc Tech',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    })

    if (!createRes.ok) {
      const txt = await createRes.text().catch(() => '')
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: `PayPal create failed: ${txt}` }) }
    }

    const order = await createRes.json()
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ orderID: order.id }) }
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e?.message || 'Server error' }) }
  }
}
