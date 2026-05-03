import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('hr_session')?.value
    if (!session) return NextResponse.json({ plan: 'free', testsUsed: 0, testLimit: 10 })
    const { email } = JSON.parse(Buffer.from(session, 'base64').toString())

    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT plan, status, expires_at FROM subscriptions
      WHERE user_email = ${email}
      AND status = 'active'
      LIMIT 1
    `

    const plan = rows[0]?.plan ?? 'free'
    const testLimit = plan === 'professional' ? null : plan === 'starter' ? 50 : 10

    // Count tests used this calendar month
    // Use billing period anchored to renewal date, not calendar month
    const expiresAt = rows[0]?.expires_at ? new Date(rows[0].expires_at) : null
    const periodStart = expiresAt
      ? new Date(expiresAt.getFullYear(), expiresAt.getMonth() - 1, expiresAt.getDate()).toISOString()
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const periodEnd = expiresAt ? expiresAt.toISOString() : new Date().toISOString()

    const usageRows = await sql`
      SELECT COUNT(*) as count FROM audits
      WHERE user_email = ${email}
      AND timestamp >= ${periodStart}
      AND timestamp <= ${periodEnd}
    `
    const testsUsed = parseInt(usageRows[0]?.count ?? '0')

    if (!rows.length) return NextResponse.json({ plan: 'free', testsUsed, testLimit: 10 })
    return NextResponse.json({ plan, status: rows[0].status, testsUsed, testLimit })
  } catch {
    return NextResponse.json({ plan: 'free', testsUsed: 0, testLimit: 10 })
  }
}