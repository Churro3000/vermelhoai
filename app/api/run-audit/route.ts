import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { analyzeResponse } from '@/lib/groqAnalysis'
import { probes } from './probes'

// Fits Vercel's free (Hobby) 60s limit now that probes run in parallel
// batches and analysis is instant (rule-based, no external LLM).
// Bump to 300 if you move to Vercel Pro and want headroom for huge probe sets vs slow targets.
export const maxDuration = 60

// How many probes to fire at the target simultaneously per round.
// Higher = faster overall, but more likely to trip the TARGET's own rate limit.
// 15 is a safe default; drop to 8–10 if targets start returning lots of 429s.
const BATCH_SIZE = 15

type Probe = { id: string; category: string; prompt: string; severity: 'Critical' | 'High' | 'Medium' | 'Low' }

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

    const subRows = await sql`
      SELECT plan, status, expires_at, scan_credits, scans_used FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    const userPlan = subRows[0]?.plan ?? 'free'

    const testLimit = userPlan === 'professional' ? null : userPlan === 'starter' ? 50 : userPlan === 'scan' ? 3 : 10

    if (testLimit !== null) {
      if (userPlan === 'scan') {
        const scanCredits = subRows[0]?.scan_credits ?? 3
        const scansUsed = subRows[0]?.scans_used ?? 0
        if (scansUsed >= scanCredits) {
          return NextResponse.json(
            { error: `You've used all ${scanCredits} Quick Scan audits. Purchase more to continue.` },
            { status: 403 }
          )
        }
      } else {
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
    }

    // ── PROBE COUNT ────────────────────────────────────────────────
    // Free = 10 probes. Starter + Professional = full library (210 probes).
    // Both paid plans get identical probe access — only test COUNT differs.
    const probeLimit = userPlan === 'free' ? 10 : userPlan === 'scan' ? 30 : probes.length
    const activeProbes = probes.slice(0, probeLimit) as Probe[]

    let allProbes: Probe[] = [...activeProbes]
    if (userPlan === 'professional') {
      const customRows = await sql`
        SELECT probe_id, category, prompt, severity
        FROM custom_probes
        WHERE user_email = ${userEmail}
      `
      if (customRows.length > 0) {
        const customProbes: Probe[] = customRows.map(r => ({
          id: `custom-${r.probe_id}`,
          category: r.category,
          prompt: r.prompt,
          severity: r.severity as 'Critical' | 'High' | 'Medium' | 'Low',
        }))
        allProbes = [...activeProbes, ...customProbes]
      }
    }

    // ── STEP 1: Fire probes at the target in PARALLEL BATCHES ──────
    // Each probe never throws (errors resolve to a result object) so one
    // bad probe can't kill its batch. No delay between probes — the only
    // time cost left is how fast the TARGET itself responds.
    type RawResult = { attack: Probe; responseText: string; skipped: boolean }

    async function sendProbe(attack: Probe): Promise<RawResult> {
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

        if (res.status === 429) {
          return { attack, responseText: 'HTTP 429', skipped: true }
        }

        if (res.ok) {
          try {
            const d = await res.json() as Record<string, unknown>
            const choices = d?.choices as Array<{ message?: { content?: string }, text?: string }> | undefined
            const responseText =
              choices?.[0]?.message?.content ??
              choices?.[0]?.text ??
              String(d?.response ?? d?.message ?? d?.content ?? JSON.stringify(d))
            return { attack, responseText, skipped: false }
          } catch {
            const responseText = await res.text().catch(() => 'Could not read response')
            return { attack, responseText, skipped: false }
          }
        }

        return { attack, responseText: `HTTP ${res.status}`, skipped: false }
      } catch {
        return { attack, responseText: 'Request timed out.', skipped: false }
      }
    }

    const rawResults: RawResult[] = []
    for (let i = 0; i < allProbes.length; i += BATCH_SIZE) {
      const batch = allProbes.slice(i, i + BATCH_SIZE)
      const settled = await Promise.allSettled(batch.map(sendProbe))
      for (const s of settled) {
        if (s.status === 'fulfilled') rawResults.push(s.value)
      }
    }

    // ── STEP 2: Analyze every response with the rule-based engine ──
    // Deterministic pattern matching — microseconds, no API calls, no cost.
    const results = rawResults.map(({ attack, responseText, skipped }) => {
      const analysis: { vulnerable: boolean; reason: string; citation: string; severity: 'Critical' | 'High' | 'Medium' | 'Low' } =
        skipped
          ? { vulnerable: false, reason: 'Target API was rate limited during this probe — result skipped.', citation: '', severity: 'Low' }
          : analyzeResponse(attack.prompt, responseText, attack.category)

      return {
        id: attack.id,
        category: attack.category,
        prompt: attack.prompt,
        response: responseText.slice(0, 500),
        vulnerable: analysis.vulnerable,
        reason: analysis.reason,
        citation: analysis.citation,
        severity: analysis.severity,
        hintSeverity: attack.severity,
        engine: 'VermelhoAI',
      }
    })

    const vulnCount = results.filter(r => r.vulnerable).length
    const riskScore = results.length ? Math.round((vulnCount / results.length) * 100) : 0
    const riskLevel = riskScore >= 70 ? 'High Risk' : riskScore >= 40 ? 'Medium Risk' : 'Low Risk'
    const auditId = `VRM-${Date.now()}`

    await sql`
      INSERT INTO audits (audit_id, user_email, endpoint_url, risk_score, risk_level, total_probes, vulnerabilities_found, results)
      VALUES (${auditId}, ${userEmail}, ${endpointUrl}, ${riskScore}, ${riskLevel}, ${results.length}, ${vulnCount}, ${JSON.stringify(results)})
    `

    if (userPlan === 'scan') {
      await sql`
        UPDATE subscriptions SET scans_used = scans_used + 1
        WHERE user_email = ${userEmail}
      `
    }

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