import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Look up the token
    const rows = await sql`
      SELECT email, expires_at FROM password_resets
      WHERE token = ${token}
      LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
    }

    const { email, expires_at } = rows[0]

    // Check expiry
    if (new Date(expires_at) < new Date()) {
      await sql`DELETE FROM password_resets WHERE token = ${token}`
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
    }

    // Update password
    const hashed = await bcrypt.hash(password, 10)
    await sql`UPDATE users SET password = ${hashed} WHERE email = ${email}`

    // Delete the used token
    await sql`DELETE FROM password_resets WHERE token = ${token}`

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}