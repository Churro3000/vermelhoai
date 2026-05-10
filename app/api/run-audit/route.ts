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
      SELECT plan, status, expires_at FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    const userPlan = subRows[0]?.plan ?? 'free'

    // Monthly test limits — professional is unlimited
    const testLimit = userPlan === 'professional' ? null : userPlan === 'starter' ? 50 : 10

    // Count tests used in current billing period
    if (testLimit !== null) {
      const expiresAt = subRows[0]?.expires_at ? new Date(subRows[0].expires_at) : null
      const periodStart = expiresAt
        ? new Date(expiresAt.getFullYear(), expiresAt.getMonth() - 1, expiresAt.getDate()).toISOString()
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const periodEnd = expiresAt ? expiresAt.toISOString() : new Date().toISOString()

      const usageRows = await sql`
        SELECT COUNT(*) as count FROM audits
        WHERE user_email = ${userEmail}
        AND timestamp >= ${periodStart}
        AND timestamp <= ${periodEnd}
      `
      const testsUsedThisPeriod = parseInt(usageRows[0]?.count ?? '0')

      if (testsUsedThisPeriod >= testLimit) {
        return NextResponse.json(
          {
            error: userPlan === 'free'
              ? `You've used all ${testLimit} free tests. Upgrade to run more.`
              : `You've used all ${testLimit} tests this billing period. Your limit resets on your next renewal date.`
          },
          { status: 403 }
        )
      }
    }

    // Probe limit — all paid plans get full built-in library, free gets 10
    const probeLimit = userPlan === 'free' ? 10 : probes.length // starter + professional both get full library
    const activeProbes = probes.slice(0, probeLimit)

    // Merge custom probes for Professional users
    let allProbes = [...activeProbes]
    if (userPlan === 'professional') {
      const customRows = await sql`
        SELECT probe_id, category, prompt, severity
        FROM custom_probes
        WHERE user_email = ${userEmail}
      `
      if (customRows.length > 0) {
        const customProbes = customRows.map(r => ({
          id: `custom-${r.probe_id}`,
          category: r.category,
          prompt: r.prompt,
          severity: r.severity as 'Critical' | 'High' | 'Medium' | 'Low',
        }))
        allProbes = [...activeProbes, ...customProbes]
      }
    }

    // Step 1: Run all probes sequentially, collect raw responses
    const rawResults = []
    for (const attack of allProbes) {
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
      await new Promise(resolve => setTimeout(resolve, 3500))
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
        from: 'VermelhoAI <hello@vermelhoai.com>',
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
          appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://vermelhoai.com',
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