import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

function getUserEmail(req: NextRequest): string | null {
  const session = req.cookies.get('hr_session')?.value
  if (!session) return null
  try {
    return JSON.parse(Buffer.from(session, 'base64').toString()).email
  } catch {
    return null
  }
}

// GET — check if user has an API key (returns prefix only, never full key)
export async function GET(req: NextRequest) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check plan
    const subRows = await sql`
      SELECT plan FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    if (subRows[0]?.plan !== 'professional') {
      return NextResponse.json({ error: 'API access is a Professional feature.' }, { status: 403 })
    }

    const rows = await sql`
      SELECT key_prefix, created_at FROM api_keys
      WHERE user_email = ${userEmail}
      LIMIT 1
    `

    if (rows.length === 0) return NextResponse.json({ hasKey: false })
    return NextResponse.json({
      hasKey: true,
      keyPrefix: rows[0].key_prefix,
      createdAt: rows[0].created_at,
    })
  } catch (err) {
    console.error('API keys GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch API key.' }, { status: 500 })
  }
}

// POST — generate a new API key (replaces existing)
export async function POST(req: NextRequest) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check plan
    const subRows = await sql`
      SELECT plan FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    if (subRows[0]?.plan !== 'professional') {
      return NextResponse.json({ error: 'API access is a Professional feature.' }, { status: 403 })
    }

    // Generate key: vrm_live_ + 32 random hex chars
    const rawKey = `vrm_live_${crypto.randomBytes(16).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = `${rawKey.slice(0, 16)}...`

    // Delete existing key and insert new one
    await sql`DELETE FROM api_keys WHERE user_email = ${userEmail}`
    await sql`
      INSERT INTO api_keys (user_email, key_hash, key_prefix)
      VALUES (${userEmail}, ${keyHash}, ${keyPrefix})
    `

    // Return the full raw key ONCE — never stored, never retrievable again
    return NextResponse.json({ key: rawKey, keyPrefix })
  } catch (err) {
    console.error('API keys POST error:', err)
    return NextResponse.json({ error: 'Failed to generate API key.' }, { status: 500 })
  }
}

// DELETE — revoke API key
export async function DELETE(req: NextRequest) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`DELETE FROM api_keys WHERE user_email = ${userEmail}`
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API keys DELETE error:', err)
    return NextResponse.json({ error: 'Failed to revoke API key.' }, { status: 500 })
  }
}