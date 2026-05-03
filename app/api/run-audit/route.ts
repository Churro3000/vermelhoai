import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { analyzeWithGroq } from '@/lib/groqAnalysis'
import { probes } from './probes'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const { endpointUrl, apiKey } = await req.json()
    if (!endpointUrl || !apiKey) {
      return NextResponse.json({ error: 'Missing endpoint URL or API key' }, { status: 400 })
    }

    const session = req.cookies.get('hr_session')?.value
    const userEmail = session
      ? JSON.parse(Buffer.from(session, 'base64').toString()).email
      : 'anonymous'

    const sql = neon(process.env.DATABASE_URL!)

    // Check subscription tier
    const subRows = await sql`
      SELECT plan, status, created_at FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    const userPlan = subRows[0]?.plan ?? 'free'

    // Monthly test limits — professional is unlimited
    const testLimit = userPlan === 'professional' ? null : userPlan === 'starter' ? 50 : 10

    // Count tests used this calendar month
    if (testLimit !== null) {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const usageRows = await sql`
        SELECT COUNT(*) as count FROM audits
        WHERE user_email = ${userEmail}
        AND timestamp >= ${monthStart}
        AND timestamp <= ${monthEnd}
      `
      const testsUsedThisMonth = parseInt(usageRows[0]?.count ?? '0')

      if (testsUsedThisMonth >= testLimit) {
        return NextResponse.json(
          {
            error: userPlan === 'free'
              ? `You've used all ${testLimit} free tests this month. Upgrade to run more.`
              : `You've used all ${testLimit} tests this month. Your limit resets next month.`
          },
          { status: 403 }
        )
      }
    }

    // Probe limit — all paid plans get full 200+ probe library
    const probeLimit = userPlan === 'free' ? 10 : probes.length
    const activeProbes = probes.slice(0, probeLimit)

    // Step 1: Run all probes sequentially, collect raw responses
    const rawResults = []
    for (const attack of activeProbes) {
      try {
        const res = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: attack.prompt }]
          }),
          signal: AbortSignal.timeout(10000),
        })

        let responseText = `HTTP ${res.status}`
        if (res.ok) {
          try {
            const d = await res.json() as Record<string, unknown>
            const choices = d?.choices as Array<{ message?: { content?: string }, text?: string }> | undefined
            responseText =
              choices?.[0]?.message?.content ??
              choices?.[0]?.text ??
              String(d?.response ?? d?.message ?? d?.content ?? JSON.stringify(d))
          } catch {
            responseText = await res.text().catch(() => 'Could not read response')
          }
        }

        rawResults.push({ attack, responseText })
      } catch {
        rawResults.push({ attack, responseText: 'Request timed out.' })
      }
    }

    // Step 2: Analyze with Groq sequentially with delay to avoid rate limits
    const results = []
    for (const { attack, responseText } of rawResults) {
      const analysis = await analyzeWithGroq(attack.prompt, responseText, attack.category)
      results.push({
        id: attack.id,
        category: attack.category,
        prompt: attack.prompt,
        response: responseText.slice(0, 500),
        vulnerable: analysis.vulnerable,
        reason: analysis.reason,
        citation: analysis.citation,
        severity: analysis.severity,
        hintSeverity: attack.severity,
        engine: 'VermelhoAI + Groq',
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const vulnCount = results.filter(r => r.vulnerable).length
    const riskScore = Math.round((vulnCount / results.length) * 100)
    const riskLevel = riskScore >= 70 ? 'High Risk' : riskScore >= 40 ? 'Medium Risk' : 'Low Risk'
    const auditId = `VRM-${Date.now()}`

    await sql`
      INSERT INTO audits (audit_id, user_email, endpoint_url, risk_score, risk_level, total_probes, vulnerabilities_found, results)
      VALUES (${auditId}, ${userEmail}, ${endpointUrl}, ${riskScore}, ${riskLevel}, ${results.length}, ${vulnCount}, ${JSON.stringify(results)})
    `

    // Send audit complete email
    try {
      const { resend } = await import('@/lib/emails/resend')
      const { AuditCompleteEmail } = await import('@/lib/emails/auditComplete')
      await resend.emails.send({
        from: 'VermelhoAI <onboarding@resend.dev>',
        to: userEmail,
        subject: `Your AI Security Report is Ready — ${riskLevel} (${riskScore}/100)`,
        react: AuditCompleteEmail({
          userName: userEmail,
          auditId,
          riskScore,
          riskLevel,
          totalProbes: results.length,
          vulnerabilitiesFound: vulnCount,
          endpointUrl,
          appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://vermelhoai.vercel.app',
        }),
      })
    } catch (emailErr) {
      console.error('Email send error:', emailErr)
    }

    return NextResponse.json({
      auditId,
      timestamp: new Date().toISOString(),
      riskScore,
      riskLevel,
      totalProbes: results.length,
      vulnerabilitiesFound: vulnCount,
      results,
    })
  } catch (err) {
    console.error('Audit error:', err)
    return NextResponse.json({ error: 'Audit failed.' }, { status: 500 })
  }
}