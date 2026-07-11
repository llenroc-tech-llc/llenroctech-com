import type { Handler } from '@netlify/functions'
import fetch from 'node-fetch'

const isLive = process.env.PAYPAL_ENV === 'live'
const BASE = isLive ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com'
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const SECRET = process.env.PAYPAL_SECRET
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID

// Supabase (server-side) — optional but recommended
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      // CORS is not required for PayPal, but keeps local tests happy
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }
}

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !SECRET) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET')
  }
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error('PayPal token failed: ' + (await res.text()))
  const json = (await res.json()) as { access_token: string }
  return json.access_token
}

async function supabaseInsert(row: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return // silently skip if not configured
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  })
  if (!res.ok) {
    const txt = await res.text()
    console.error('Supabase insert failed:', txt)
  }
}

export const handler: Handler = async (event) => {
  // Preflight (useful when testing with tools that send OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, 'Method Not Allowed')
  }

  if (!WEBHOOK_ID) {
    console.error('Missing PAYPAL_WEBHOOK_ID')
    return jsonResponse(500, 'Server not configured')
  }

  // Normalize headers (case-insensitive)
  const headers: Record<string, string> = {}
  for (const [k, v] of Object.entries(event.headers || {})) {
    headers[k.toLowerCase()] = Array.isArray(v) ? v[0] : (v as string)
  }

  const transmissionId = headers['paypal-transmission-id']
  const transmissionTime = headers['paypal-transmission-time']
  const certUrl = headers['paypal-cert-url']
  const authAlgo = headers['paypal-auth-algo']
  const transmissionSig = headers['paypal-transmission-sig']

  const rawBody = event.body || ''
  let webhookEvent: any
  try {
    webhookEvent = JSON.parse(rawBody)
  } catch {
    return jsonResponse(400, 'Invalid JSON body')
  }

  // 1) Verify signature with PayPal
  try {
    const accessToken = await getAccessToken()
    const verifyRes = await fetch(`${BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    })

    const verify = await verifyRes.json()
    if (verify?.verification_status !== 'SUCCESS') {
      console.error('PayPal webhook verification failed:', verify)
      return jsonResponse(400, 'Invalid signature')
    }
  } catch (err) {
    console.error('Verification error:', err)
    return jsonResponse(500, 'Verification error')
  }

  // 2) Handle events
  try {
    const type = webhookEvent?.event_type as string
    const resource = webhookEvent?.resource

    switch (type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const amountStr = resource?.amount?.value ?? '0'
        const currency = String(resource?.amount?.currency_code || 'USD').toLowerCase()
        const amount = Math.round(Number(amountStr) * 100) // cents
        const captureId = resource?.id
        const payerEmail = resource?.payer?.email_address ?? null
        const payerName = resource?.payer?.name
          ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim()
          : null
        const orderId = resource?.supplementary_data?.related_ids?.order_id ?? null

        await supabaseInsert({
          provider: 'paypal',
          status: 'succeeded',
          amount,
          currency,
          intent_id: captureId,     // capture id as unique reference
          order_id: orderId,
          email: payerEmail,
          name: payerName,
        })
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const amountStr = resource?.amount?.value ?? '0'
        const currency = String(resource?.amount?.currency_code || 'USD').toLowerCase()
        const amount = Math.round(Number(amountStr) * 100)
        const captureId = resource?.id

        await supabaseInsert({
          provider: 'paypal',
          status: 'refunded',
          amount,
          currency,
          intent_id: captureId,
        })
        break
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        const amountStr = resource?.amount?.value ?? '0'
        const currency = String(resource?.amount?.currency_code || 'USD').toLowerCase()
        const amount = Math.round(Number(amountStr) * 100)
        const captureId = resource?.id

        await supabaseInsert({
          provider: 'paypal',
          status: 'denied',
          amount,
          currency,
          intent_id: captureId,
        })
        break
      }

      // Optional: useful for debugging order flows before capture
      case 'CHECKOUT.ORDER.APPROVED':
      case 'CHECKOUT.ORDER.COMPLETED': {
        // You could log or no-op
        break
      }

      default:
        // No-op for other events; you can add more as needed.
        break
    }

    return jsonResponse(200, { ok: true })
  } catch (err) {
    console.error('Handler error:', err)
    return jsonResponse(500, 'Server error')
  }
}
