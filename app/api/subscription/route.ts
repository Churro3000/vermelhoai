import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('hr_session')?.value
    if (!session) return NextResponse.json({ plan: 'free', testsUsed: 0, testLimit: 10 })
    const { email } = JSON.parse(Buffer.from(session, 'base64').toString())

    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT plan, status FROM subscriptions
      WHERE user_email = ${email}
      AND status = 'active'
      LIMIT 1
    `

    const plan = rows[0]?.plan ?? 'free'
    const testLimit = plan === 'professional' ? null : plan === 'starter' ? 50 : 10

    // Count tests used this calendar month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const usageRows = await sql`
      SELECT COUNT(*) as count FROM audits
      WHERE user_email = ${email}
      AND timestamp >= ${monthStart}
      AND timestamp <= ${monthEnd}
    `
    const testsUsed = parseInt(usageRows[0]?.count ?? '0')

    if (!rows.length) return NextResponse.json({ plan: 'free', testsUsed, testLimit: 10 })
    return NextResponse.json({ plan, status: rows[0].status, testsUsed, testLimit })
  } catch {
    return NextResponse.json({ plan: 'free', testsUsed: 0, testLimit: 10 })
  }
}