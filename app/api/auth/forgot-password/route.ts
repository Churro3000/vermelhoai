import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required.' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Check user exists — but always return success to avoid email enumeration
    const users = await sql`SELECT id FROM users WHERE email = ${email}`
    if (users.length === 0) {
      return NextResponse.json({ success: true })
    }

    // Delete any existing reset tokens for this email
    await sql`DELETE FROM password_resets WHERE email = ${email}`

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now

    await sql`
      INSERT INTO password_resets (email, token, expires_at)
      VALUES (${email}, ${token}, ${expiresAt.toISOString()})
    `

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vermelhoai.com'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    // Send reset email via Resend
    try {
      const { resend } = await import('@/lib/emails/resend')
      await resend.emails.send({
        from: 'VermelhoAI <hello.vermelhoai@gmail.com>',
        to: email,
        subject: 'Reset your VermelhoAI password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
            <h2 style="color: #CC1A1A; font-size: 24px; margin-bottom: 8px;">Password reset</h2>
            <p style="color: #5A5852; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset your VermelhoAI password. Click the button below to set a new one.
              This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #CC1A1A; color: white; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">
              Reset password
            </a>
            <p style="color: #9A9890; font-size: 13px; line-height: 1.6;">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
            <hr style="border: none; border-top: 1px solid #E0DED8; margin: 24px 0;" />
            <p style="color: #9A9890; font-size: 12px;">VermelhoAI · AI Red Teaming Platform</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Reset email error:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}