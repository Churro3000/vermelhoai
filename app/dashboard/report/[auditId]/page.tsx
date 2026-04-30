'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Download, ArrowLeft, AlertTriangle, CheckCircle, XCircle, Loader2, Target } from 'lucide-react'

interface AttackResult {
  id: string
  category: string
  prompt: string
  response: string
  vulnerable: boolean
  reason: string
  citation?: string
  severity?: string
  engine?: string
}

interface AuditData {
  auditId: string
  timestamp: string
  endpointUrl: string
  riskScore: number
  riskLevel: string
  totalProbes: number
  vulnerabilitiesFound: number
  results: AttackResult[]
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Jailbreak':                { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
  'Prompt Injection':         { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
  'System Prompt Extraction': { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200'  },
  'Data Extraction':          { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
  'Goal Hijacking':           { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  'Hallucination':            { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200'    },
  'Social Engineering':       { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  'Continuation Attack':      { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  'Edge Cases':               { bg: 'bg-gray-100',   text: 'text-gray-700',    border: 'border-gray-300'    },
}

const owaspColor = { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }

const getCategoryStyle = (category: string) => {
  if (category.startsWith('OWASP')) return owaspColor
  return categoryColors[category] ?? { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
}

const severityStyle = (severity: string) => {
  if (severity === 'Critical') return 'bg-red-100 text-red-700 border-red-200'
  if (severity === 'High')     return 'bg-orange-100 text-orange-700 border-orange-200'
  if (severity === 'Medium')   return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'vulnerable' | 'passed'>('all')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')

  useEffect(() => {
    const auditId = params?.auditId as string
    if (!auditId) { setLoading(false); return }
    fetch(`/api/audits/${auditId}`)
      .then(res => {
        if (res.status === 401) { router.replace('/signin'); return null }
        if (!res.ok) { setNotFound(true); setLoading(false); return null }
        return res.json()
      })
      .then(data => {
        if (data) setAudit(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [params, router])

  const handleDownloadPdf = async () => {
    if (!audit) return
    setPdfLoading(true)
    setPdfError('')
    try {
      const res = await fetch(`/api/pdf/${audit.auditId}`)
      if (!res.ok) {
        const errorText = await res.text()
        setPdfError(`Error ${res.status}: ${errorText}`)
        return
      }
      const blob = await res.blob()
      if (blob.size === 0) {
        setPdfError('PDF generated but is empty')
        return
      }
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vermelhoai-report-${audit.auditId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setPdfError(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#CC1A1A] animate-spin" />
    </div>
  )

  if (notFound || !audit) return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="w-10 h-10 text-[#CC1A1A]" />
      <p className="text-gray-900 font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>
        Audit not found
      </p>
      <Link href="/dashboard">
        <button className="btn-red text-sm py-2 px-5">Back to Dashboard</button>
      </Link>
    </div>
  )

  const score = audit.riskScore
  const results = audit.results ?? []
  const vulnCount = audit.vulnerabilitiesFound
  const totalProbes = audit.totalProbes
  const passCount = totalProbes - vulnCount
  const criticalCount = results.filter(r => r.severity === 'Critical' && r.vulnerable).length
  const highCount = results.filter(r => r.severity === 'High' && r.vulnerable).length
  const gaugeColor = score >= 70 ? '#CC1A1A' : score >= 40 ? '#D97706' : '#00A651'
  const riskTextColor = score >= 70 ? 'text-[#CC1A1A]' : score >= 40 ? 'text-yellow-600' : 'text-[#00A651]'

  const filteredResults = results.filter(r => {
    if (activeFilter === 'vulnerable') return r.vulnerable
    if (activeFilter === 'passed') return !r.vulnerable
    return true
  })

  const vulnCategories = [...new Set(results.filter(r => r.vulnerable).map(r => r.category))]

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#CC1A1A]" strokeWidth={2} />
            <span className="font-bold text-lg text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
              Vermelho<span className="text-[#CC1A1A]">AI</span>
            </span>
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors font-semibold">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </Link>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-6 py-10 w-full flex-1">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-gray-400 text-sm mb-1">
              Audit Report · {new Date(audit.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
              Security Audit Report
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              ID: <span className="font-mono text-gray-600">{audit.auditId}</span>
            </p>
            {audit.endpointUrl && (
              <p className="text-[#CC1A1A] text-xs mt-1 truncate max-w-md font-medium">
                {audit.endpointUrl}
              </p>
            )}
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="btn-red flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-60"
          >
            {pdfLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Download className="w-4 h-4" /> Download PDF</>
            }
          </button>
        </div>

        {/* PDF ERROR */}
        {pdfError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm font-semibold">PDF Error: {pdfError}</p>
          </div>
        )}

        {/* SCORE + SUMMARY */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F0EFEA" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={gaugeColor} strokeWidth="10"
                    strokeDasharray={`${(score / 100) * 264} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                    {score}
                  </span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
              <p className={`font-bold mt-2 text-sm ${riskTextColor}`} style={{ fontFamily: 'var(--font-display)' }}>
                {audit.riskLevel}
              </p>
            </div>

            <div className="flex-1 w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Executive Summary
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                VermelhoAI ran{' '}
                <span className="font-bold text-gray-900">{totalProbes} adversarial probes</span>{' '}
                across 10 attack categories including DAN jailbreaks, prompt injection, system prompt extraction,
                data extraction, goal hijacking, social engineering, and OWASP LLM Top 10.{' '}
                {vulnCount > 0
                  ? <><span className="font-bold text-[#CC1A1A]">{vulnCount} potential {vulnCount === 1 ? 'vulnerability' : 'vulnerabilities'}</span> {vulnCount === 1 ? 'was' : 'were'} identified.</>
                  : <span className="font-bold text-[#00A651]">No vulnerabilities detected.</span>
                }
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Vulnerabilities', val: vulnCount,     color: vulnCount > 0 ? 'text-[#CC1A1A]' : 'text-[#00A651]' },
                  { label: 'Probes run',      val: totalProbes,   color: 'text-gray-900' },
                  { label: 'Passed',          val: passCount,     color: 'text-[#00A651]' },
                  { label: 'Critical',        val: criticalCount, color: criticalCount > 0 ? 'text-[#CC1A1A]' : 'text-[#00A651]' },
                ].map(s => (
                  <div key={s.label} className="bg-[#F5F5F0] rounded-xl p-4 text-center">
                    <p className={`text-3xl font-bold ${s.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                      {s.val}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CRITICAL ALERT BANNER */}
        {(criticalCount > 0 || highCount > 0) && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#CC1A1A] mt-0.5 shrink-0" />
            <div>
              <p className="text-[#CC1A1A] font-bold text-sm">Immediate action required</p>
              <p className="text-red-700 text-sm mt-0.5">
                {criticalCount > 0 && <><span className="font-bold">{criticalCount} Critical</span> {criticalCount === 1 ? 'vulnerability' : 'vulnerabilities'} detected. </>}
                {highCount > 0 && <><span className="font-bold">{highCount} High</span> severity {highCount === 1 ? 'issue' : 'issues'} found. </>}
                Remediate before production deployment.
              </p>
            </div>
          </div>
        )}

        {/* FINDINGS */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            Detailed Findings
          </h2>
          <div className="flex items-center gap-2">
            {(['all', 'vulnerable', 'passed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  activeFilter === f
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {f === 'all' ? `All (${results.length})` : f === 'vulnerable' ? `Vulnerable (${vulnCount})` : `Passed (${passCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {filteredResults.map((r) => {
            const catStyle = getCategoryStyle(r.category)
            return (
              <div key={r.id} className={`card border-l-4 ${r.vulnerable ? 'border-l-[#CC1A1A]' : 'border-l-[#00A651]'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    {r.vulnerable
                      ? <XCircle className="w-5 h-5 text-[#CC1A1A]" />
                      : <CheckCircle className="w-5 h-5 text-[#00A651]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {r.category}
                      </span>
                      <span className={`text-xs font-bold ${r.vulnerable ? 'text-[#CC1A1A]' : 'text-[#00A651]'}`}>
                        {r.vulnerable ? '● VULNERABLE' : '✓ PASSED'}
                      </span>
                      {r.severity && r.vulnerable && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${severityStyle(r.severity)}`}>
                          {r.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{r.reason}</p>
                    {r.citation && (
                      <p className="text-[#CC1A1A] text-xs font-semibold mb-2">
                        📋 {r.citation}
                      </p>
                    )}
                    <details className="group">
                      <summary className="text-xs text-gray-400 font-semibold cursor-pointer hover:text-gray-600 transition-colors select-none">
                        View probe details ▸
                      </summary>
                      <div className="mt-3 space-y-2">
                        <div className="bg-[#F5F5F0] rounded-lg p-3">
                          <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wide">Attack prompt</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{r.prompt}</p>
                        </div>
                        <div className="bg-[#F5F5F0] rounded-lg p-3">
                          <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wide">Model response</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{r.response}</p>
                        </div>
                        {r.engine && (
                          <p className="text-xs text-gray-300">Analyzed by: {r.engine}</p>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* REMEDIATION — only show if vulnerabilities found */}
        {vulnCount > 0 && (
          <div className="card border-[#00A651]/30 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Remediation Recommendations
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              {[
                { title: 'Harden your system prompt', body: 'Add explicit role-restriction instructions. Test all persona injection variants. Use clear, unambiguous language about what the AI should never do.', ref: 'OWASP LLM01:2025' },
                { title: 'Implement output filtering', body: 'Deploy a detection layer that scans all model outputs for sensitive data patterns before returning responses to users.', ref: 'OWASP LLM02:2025' },
                { title: 'Suppress system verbosity', body: 'Configure your API gateway to return generic errors without system details, model version, or internal configuration.', ref: 'OWASP LLM07:2025' },
                { title: 'Add conversation-level monitoring', body: 'Implement monitoring to detect escalating adversarial patterns across multi-turn conversations.', ref: 'OWASP LLM08:2025' },
                { title: 'Restrict plugin and tool access', body: 'Apply least-privilege principles to any tools or data sources your AI has access to. Audit all integrations.', ref: 'OWASP LLM06:2025' },
              ].map((item, i) => (
                vulnCategories.length === 0 || i < 3 ? (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F5F5F0] border border-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.title}
                        <span className="ml-2 text-xs font-normal text-gray-400">{item.ref}</span>
                      </p>
                      <p className="text-gray-500 mt-0.5">{item.body}</p>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="btn-red flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-60"
          >
            {pdfLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Download className="w-4 h-4" /> Download PDF report</>
            }
          </button>
          <a href={`/api/audits/${audit.auditId}/csv`}>
            <button className="btn-outline text-sm py-2.5 px-5 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </a>
          <Link href="/dashboard">
            <button className="btn-outline text-sm py-2.5 px-5 flex items-center gap-2">
              <Target className="w-4 h-4" /> Run another audit
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="btn-outline text-sm py-2.5 px-5 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </button>
          </Link>
        </div>

        {/* FOOTER STAMP */}
        <div className="p-4 border border-gray-200 rounded-xl bg-white text-center">
          <p className="text-gray-400 text-xs tracking-widest uppercase font-semibold">
            VermelhoAI · AI Security Report · Powered by Groq LLM Analysis · {audit.auditId}
          </p>
        </div>

      </main>
    </div>
  )
}