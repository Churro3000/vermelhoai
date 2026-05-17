import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-signature')
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', secret!)
    const digest = hmac.update(rawBody).digest('hex')
    if (signature !== digest) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta?.event_name

    // Handle one-time Quick Scan purchase
    if (eventName === 'order_created') {
      const attrs = payload.data?.attributes
      const userEmail = attrs?.user_email
      const variantId = String(attrs?.first_order_item?.variant_id ?? '')

      if (variantId === String(process.env.LEMONSQUEEZY_SCAN_VARIANT_ID) && userEmail) {
        const sql = neon(process.env.DATABASE_URL!)
        // Add 3 credits on top of any existing credits (stacking purchases)
        await sql`
          INSERT INTO subscriptions (user_email, plan, status, expires_at, scan_credits)
          VALUES (${userEmail}, 'scan', 'active', NULL, 3)
          ON CONFLICT (user_email)
          DO UPDATE SET
            plan = CASE WHEN subscriptions.plan IN ('starter', 'professional') THEN subscriptions.plan ELSE 'scan' END,
            status = 'active',
            scan_credits = COALESCE(subscriptions.scan_credits, 0) + 3
        `
      }
      return NextResponse.json({ received: true })
    }

    // Only handle subscription created/updated events
    if (!['subscription_created', 'subscription_updated'].includes(eventName)) {
      return NextResponse.json({ received: true })
    }

    const attrs = payload.data?.attributes
    const userEmail = attrs?.user_email
    const status = attrs?.status
    const variantId = String(attrs?.variant_id)
    const renewsAt = attrs?.renews_at

    const plan = variantId === String(process.env.LEMONSQUEEZY_STARTER_VARIANT_ID)
      ? 'starter'
      : variantId === String(process.env.LEMONSQUEEZY_PROFESSIONAL_VARIANT_ID)
      ? 'professional'
      : null

    if (!plan || !userEmail) {
      return NextResponse.json({ received: true })
    }

    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      INSERT INTO subscriptions (user_email, plan, status, expires_at)
      VALUES (${userEmail}, ${plan}, ${status}, ${renewsAt})
      ON CONFLICT (user_email)
      DO UPDATE SET
        plan = ${plan},
        status = ${status},
        expires_at = ${renewsAt}
    `

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}