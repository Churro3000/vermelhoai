import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'
import { analyzeWithGroq } from '@/lib/groqAnalysis'
import { probes } from '@/app/api/run-audit/probes'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    // Authenticate via API key from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer vrm_live_')) {
      return NextResponse.json(
        { error: 'Missing or invalid API key. Use Authorization: Bearer vrm_live_...' },
        { status: 401 }
      )
    }

    const rawKey = authHeader.replace('Bearer ', '').trim()
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

    const sql = neon(process.env.DATABASE_URL!)

    // Look up user by key hash
    const keyRows = await sql`
      SELECT user_email FROM api_keys
      WHERE key_hash = ${keyHash}
      LIMIT 1
    `
    if (keyRows.length === 0) {
      return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 })
    }
    const userEmail = keyRows[0].user_email

    // Verify Professional plan
    const subRows = await sql`
      SELECT plan, status, expires_at FROM subscriptions
      WHERE user_email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `
    if (subRows[0]?.plan !== 'professional') {
      return NextResponse.json(
        { error: 'API access requires a Professional plan.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { endpointUrl, apiKey } = body

    if (!endpointUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: endpointUrl and apiKey.' },
        { status: 400 }
      )
    }

    // Fetch custom probes for this user
    const customRows = await sql`
      SELECT probe_id, category, prompt, severity
      FROM custom_probes
      WHERE user_email = ${userEmail}
    `
    const customProbes = customRows.map(r => ({
      id: `custom-${r.probe_id}`,
      category: r.category,
      prompt: r.prompt,
      severity: r.severity as 'Critical' | 'High' | 'Medium' | 'Low',
    }))

    const allProbes = [...probes, ...customProbes]

    // Run all probes sequentially
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
            messages: [{ role: 'user', content: attack.prompt }],
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

    // Analyze with Groq
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vermelhoai.vercel.app'

    return NextResponse.json({
      auditId,
      reportUrl: `${appUrl}/dashboard/report/${auditId}`,
      timestamp: new Date().toISOString(),
      riskScore,
      riskLevel,
      totalProbes: results.length,
      vulnerabilitiesFound: vulnCount,
      summary: {
        critical: results.filter(r => r.vulnerable && r.severity === 'Critical').length,
        high: results.filter(r => r.vulnerable && r.severity === 'High').length,
        medium: results.filter(r => r.vulnerable && r.severity === 'Medium').length,
        low: results.filter(r => r.vulnerable && r.severity === 'Low').length,
      },
      results,
    })
  } catch (err) {
    console.error('CI/CD scan error:', err)
    return NextResponse.json({ error: 'Scan failed.' }, { status: 500 })
  }
}