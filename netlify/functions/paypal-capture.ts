import type { Handler } from '@netlify/functions'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
}

function apiBase() {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase()
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken() {
  const cid = process.env.PAYPAL_CLIENT_ID || ''
  const secret = process.env.PAYPAL_SECRET || ''
  if (!cid || !secret) throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET')
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
    const { orderID } = JSON.parse(event.body || '{}')
    if (!orderID) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'orderID required' }) }
    }

    const token = await getAccessToken()
    const capRes = await fetch(`${apiBase()}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const txt = await capRes.text()
    if (!capRes.ok) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: `PayPal capture failed: ${txt}` }) }
    }
    return { statusCode: 200, headers: CORS, body: txt } // already JSON
  } catch (e: any) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e?.message || 'Server error' }) }
  }
}
