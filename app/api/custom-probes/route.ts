import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getUserEmail(req: NextRequest): string | null {
  const session = req.cookies.get('hr_session')?.value
  if (!session) return null
  try {
    return JSON.parse(Buffer.from(session, 'base64').toString()).email
  } catch {
    return null
  }
}

// GET — fetch user's custom probes
export async function GET(req: NextRequest) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check plan — only Professional can use custom probes
    const subRows = await sql`
      SELECT plan FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    const plan = subRows[0]?.plan ?? 'free'
    if (plan !== 'professional') {
      return NextResponse.json({ error: 'Custom probes are a Professional feature.' }, { status: 403 })
    }

    const probes = await sql`
      SELECT probe_id, category, prompt, severity, created_at
      FROM custom_probes
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
    `
    return NextResponse.json({ probes })
  } catch (err) {
    console.error('Custom probes GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch probes.' }, { status: 500 })
  }
}

// POST — upload custom probes from JSON
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
    const plan = subRows[0]?.plan ?? 'free'
    if (plan !== 'professional') {
      return NextResponse.json({ error: 'Custom probes are a Professional feature.' }, { status: 403 })
    }

    const body = await req.json()
    const probes = body.probes

    if (!Array.isArray(probes) || probes.length === 0) {
      return NextResponse.json({ error: 'Invalid format. Expected { probes: [...] }' }, { status: 400 })
    }

    if (probes.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 custom probes per upload.' }, { status: 400 })
    }

    const validSeverities = ['Critical', 'High', 'Medium', 'Low']

    // Validate each probe
    for (const p of probes) {
      if (!p.id || typeof p.id !== 'string') {
        return NextResponse.json({ error: 'Each probe must have a string "id" field.' }, { status: 400 })
      }
      if (!p.prompt || typeof p.prompt !== 'string' || p.prompt.trim().length < 10) {
        return NextResponse.json({ error: `Probe "${p.id}" must have a "prompt" of at least 10 characters.` }, { status: 400 })
      }
      if (!p.category || typeof p.category !== 'string') {
        return NextResponse.json({ error: `Probe "${p.id}" must have a "category" field.` }, { status: 400 })
      }
      if (p.severity && !validSeverities.includes(p.severity)) {
        return NextResponse.json({ error: `Probe "${p.id}" severity must be Critical, High, Medium, or Low.` }, { status: 400 })
      }
    }

    // Delete existing custom probes for this user and re-insert
    await sql`DELETE FROM custom_probes WHERE user_email = ${userEmail}`

    for (const p of probes) {
      await sql`
        INSERT INTO custom_probes (user_email, probe_id, category, prompt, severity)
        VALUES (${userEmail}, ${p.id}, ${p.category}, ${p.prompt.trim()}, ${p.severity ?? 'Medium'})
      `
    }

    return NextResponse.json({ success: true, count: probes.length })
  } catch (err) {
    console.error('Custom probes POST error:', err)
    return NextResponse.json({ error: 'Failed to save probes.' }, { status: 500 })
  }
}

// DELETE — clear all probes, or a single probe if ?probe_id= is provided
export async function DELETE(req: NextRequest) {
  const userEmail = getUserEmail(req)
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const probeId = req.nextUrl.searchParams.get('probe_id')

    if (probeId) {
      // Delete single probe
      await sql`DELETE FROM custom_probes WHERE user_email = ${userEmail} AND probe_id = ${probeId}`
    } else {
      // Delete all probes for this user
      await sql`DELETE FROM custom_probes WHERE user_email = ${userEmail}`
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Custom probes DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete probes.' }, { status: 500 })
  }
}