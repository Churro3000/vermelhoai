'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, ChevronDown, X, CheckCircle, Clock, Loader2, Target, Zap, Upload, Trash2 } from 'lucide-react'

interface Audit {
  audit_id: string
  timestamp: string
  endpoint_url: string
  risk_score: number
  risk_level: string
  total_probes: number
  vulnerabilities_found: number
}

interface CustomProbe {
  probe_id: string
  category: string
  prompt: string
  severity: string
  created_at: string
}

const riskBadge = (level: string) => {
  if (level === 'High Risk')   return 'badge badge-red'
  if (level === 'Medium Risk') return 'badge bg-yellow-50 text-yellow-700 border border-yellow-200'
  return 'badge badge-green'
}

function ShieldLogo({ size = 27, textColor = 'text-gray-900' }: { size?: number; textColor?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shadowFade" x1="12" y1="3" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B1010" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#5A0808" stopOpacity="0.8" />
            </linearGradient>
            <clipPath id="rightHalf">
              <rect x="12" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <path d="M12 2L4 5.5V11.5C4 16.25 7.4 20.7 12 22C16.6 20.7 20 16.25 20 11.5V5.5L12 2Z" fill="#CC1A1A" />
          <path d="M12 2L4 5.5V11.5C4 16.25 7.4 20.7 12 22C16.6 20.7 20 16.25 20 11.5V5.5L12 2Z" fill="url(#shadowFade)" clipPath="url(#rightHalf)" />
        </svg>
        <span style={{ position: 'absolute', top: '22%', right: '26%', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: size * 0.22, lineHeight: 1, userSelect: 'none' }}>V</span>
      </div>
      <span className={`font-bold tracking-tight ${textColor}`} style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.67 }}>
        Vermelho<span className="text-[#CC1A1A]">AI</span>
      </span>
    </div>
  )
}

// ── Circular audit loading overlay ──
function AuditLoadingOverlay({ probeCount }: { probeCount: number }) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initialising attack engine...')
  const rafRef = useRef<number>()
  const startRef = useRef<number>(0)

  // probeCount × 1000ms delay + overhead
  const estimatedMs = probeCount * 250 + 3000

  const statusMessages = [
    { at: 0,  text: 'Initialising attack engine...' },
    { at: 5,  text: 'Sending adversarial probes...' },
    { at: 20, text: 'Running jailbreak tests...' },
    { at: 35, text: 'Testing prompt injection vectors...' },
    { at: 50, text: 'Probing system prompt extraction...' },
    { at: 65, text: 'Running OWASP LLM Top 10 checks...' },
    { at: 78, text: 'Analysing AI responses...' },
    { at: 88, text: 'Calculating risk score...' },
    { at: 94, text: 'Finalising report...' },
  ]

  useEffect(() => {
    setProgress(0)
    startRef.current = performance.now()

    function tick(now: number) {
      const elapsed = now - startRef.current
      const raw = elapsed / estimatedMs
      const p = Math.min(raw * 90, 90) + (raw > 1 ? Math.min((raw - 1) * 5, 7) : 0)
      const capped = Math.min(p, 97)
      setProgress(capped)
      const msg = [...statusMessages].reverse().find(m => capped >= m.at)
      if (msg) setStatusText(msg.text)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // SVG circle math
  const size = 160
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center w-full max-w-sm">

        {/* Circular progress */}
        <div className="relative mb-6" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            {/* Track */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F0EFEA" strokeWidth={strokeWidth} />
            {/* Light red fill showing progress */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#FECACA" strokeWidth={strokeWidth}
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.6s ease-out' }} />
            {/* Spinning red arc on top */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#CC1A1A" strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.22} ${circumference * 0.78}`}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', animation: 'spin-arc 1.2s linear infinite' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {Math.round(progress)}
            </span>
            <span className="text-xs text-gray-400 mt-1">%</span>
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold text-gray-900 mb-1 text-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Audit in progress
        </h2>

        {/* Probe count line */}
        <p className="text-gray-400 text-sm text-center mb-1">
          Running {probeCount}+ adversarial probes
        </p>

        {/* Status text */}
        <p className="text-gray-400 text-xs text-center mb-6" style={{ minHeight: '1rem' }}>
          {statusText}
        </p>

        {/* Do not close — simple red text, no box */}
        <p className="text-[#CC1A1A] text-sm font-semibold text-center">
          Do not close or refresh this tab
        </p>
      </div>

      <style>{`
        @keyframes spin-arc {
          from { transform: rotate(-90deg); }
          to   { transform: rotate(270deg); }
        }
      `}</style>
    </div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditsLoading, setAuditsLoading] = useState(true)
  const [showNewAudit, setShowNewAudit] = useState(false)
  const [showCustomProbes, setShowCustomProbes] = useState(false)
  const [auditForm, setAuditForm] = useState({ url: '', apiKey: '', notes: '' })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [auditError, setAuditError] = useState('')
  const [userPlan, setUserPlan] = useState<string>('free')
  const [testsUsed, setTestsUsed] = useState<number>(0)
  const [testLimit, setTestLimit] = useState<number | null>(10)
  const [customProbes, setCustomProbes] = useState<CustomProbe[]>([])
  const [customProbesLoading, setCustomProbesLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('payment')

  const probeCount = userPlan === 'free' ? 10 : userPlan === 'scan' ? 30 : 210

  useEffect(() => {
    fetch('/api/subscription', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setUserPlan(data.plan ?? 'free')
        setTestsUsed(data.testsUsed ?? 0)
        setTestLimit(data.testLimit ?? 10)
      })
      .catch(() => setUserPlan('free'))
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) { router.replace('/signin'); return null }
        return res.json()
      })
      .then(data => {
        if (data) setUser(data)
        setLoading(false)
      })
      .catch(() => router.replace('/signin'))
  }, [router])

  useEffect(() => {
    fetch('/api/audits')
      .then(res => res.ok ? res.json() : [])
      .then(data => { setAudits(Array.isArray(data) ? data : []); setAuditsLoading(false) })
      .catch(() => setAuditsLoading(false))
  }, [])

  useEffect(() => {
    if (userPlan === 'professional') {
      setCustomProbesLoading(true)
      fetch('/api/custom-probes')
        .then(res => res.ok ? res.json() : { probes: [] })
        .then(data => setCustomProbes(data.probes ?? []))
        .catch(() => {})
        .finally(() => setCustomProbesLoading(false))
    }
  }, [userPlan])

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRunning(true)
    setAuditError('')
    setShowNewAudit(false)
    try {
      const res = await fetch('/api/run-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl: auditForm.url, apiKey: auditForm.apiKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuditError(data.error || 'Audit failed.')
        setIsRunning(false)
        setShowNewAudit(true)
        return
      }
      setIsRunning(false)
      router.push(`/dashboard/report/${data.auditId}`)
    } catch {
      setAuditError('Could not connect to audit engine. Please try again.')
      setIsRunning(false)
      setShowNewAudit(true)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploadSuccess('')
    setUploadLoading(true)
    try {
      const text = await file.text()
      let parsed: unknown
      try { parsed = JSON.parse(text) } catch {
        setUploadError('Invalid JSON file. Please check the format.')
        setUploadLoading(false)
        return
      }
      const probesArray = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)?.probes
      if (!Array.isArray(probesArray)) {
        setUploadError('File must contain a "probes" array or be an array of probes.')
        setUploadLoading(false)
        return
      }
      const res = await fetch('/api/custom-probes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probes: probesArray }),
      })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error || 'Upload failed.'); setUploadLoading(false); return }
      setUploadSuccess(`${data.count} custom probe${data.count === 1 ? '' : 's'} uploaded successfully.`)
      const refreshed = await fetch('/api/custom-probes').then(r => r.json())
      setCustomProbes(refreshed.probes ?? [])
    } catch {
      setUploadError('Failed to read file. Please try again.')
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const CUSTOM_PROBE_LIMIT = 50

  const handleDeleteCustomProbes = async () => {
    if (!confirm('Delete all your custom probes? This cannot be undone.')) return
    await fetch('/api/custom-probes', { method: 'DELETE' })
    setCustomProbes([])
    setUploadSuccess('')
    setUploadError('')
  }

  const handleDeleteSingleProbe = async (probeId: string) => {
    try {
      await fetch(`/api/custom-probes?probe_id=${encodeURIComponent(probeId)}`, { method: 'DELETE' })
      setCustomProbes(prev => prev.filter(p => p.probe_id !== probeId))
    } catch {
      // silently fail
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#CC1A1A] animate-spin" />
    </div>
  )

  if (!user) return null

  const testsRemaining = testLimit !== null ? testLimit - testsUsed : null
  const usagePercent = testLimit !== null ? Math.min((testsUsed / testLimit) * 100, 100) : 0
  const isAtLimit = testLimit !== null && testsUsed >= testLimit

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">

      {isRunning && <AuditLoadingOverlay probeCount={probeCount} />}

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><ShieldLogo size={28} textColor="text-gray-900" /></Link>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#FEF2F2] border border-[#CC1A1A]/20 flex items-center justify-center text-[#CC1A1A] font-bold text-sm">
                {user.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold hidden sm:block">{user.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg py-2 w-44 shadow-lg z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link href="/dashboard/settings">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Settings</button>
                </Link>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-6 py-10 w-full flex-1">

        {/* PAYMENT STATUS BANNERS */}
        {paymentStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#00A651] shrink-0" />
            <p className="text-green-700 text-sm font-semibold">Payment successful — your plan is now active. Welcome to VermelhoAI!</p>
          </div>
        )}
        {paymentStatus === 'cancelled' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-yellow-700 text-sm font-semibold">Payment cancelled — no charge was made. Upgrade anytime to unlock full access.</p>
          </div>
        )}
        {paymentStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <X className="w-5 h-5 text-[#CC1A1A] shrink-0" />
            <p className="text-red-700 text-sm font-semibold">Payment failed — please try again or contact support.</p>
          </div>
        )}

        {/* UPGRADE BANNER */}
        {userPlan === 'free' && paymentStatus !== 'success' && (
          <div className="card border-[#CC1A1A]/30 bg-[#FEF2F2]/50 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-display)' }}>You're on the free trial</p>
                <p className="text-gray-500 text-sm mt-0.5">Upgrade to run more tests with the full 200+ probe library.</p>
              </div>
              <Link href="/dashboard/upgrade" className="shrink-0">
                <button className="btn-red text-sm py-2 px-5 whitespace-nowrap flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Upgrade now
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* SCAN PLAN STATUS */}
        {userPlan === 'scan' && (
          <div className="card border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#CC1A1A] shrink-0" />
                <p className="text-gray-700 text-sm font-semibold">Quick Scan</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={`font-semibold ${isAtLimit ? 'text-[#CC1A1A]' : 'text-gray-700'}`}>
                  {testsUsed}/{testLimit} scans used
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-[#CC1A1A]' : 'bg-[#CC1A1A]/60'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>
            {isAtLimit && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
                <p className="text-[#CC1A1A] text-xs font-semibold">All 3 scans used. Buy more to continue.</p>
                <Link href="/dashboard/upgrade">
                  <button className="btn-red text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Buy 3 more audits
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* PLAN STATUS */}
        {userPlan !== 'free' && userPlan !== 'scan' && (
          <div className="card border-[#00A651]/30 bg-[#F0FDF4]/50 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#00A651] shrink-0" />
                <p className="text-green-700 text-sm font-semibold">
                  {userPlan === 'starter' ? 'Starter Plan' : userPlan === 'scan' ? 'Quick Scan' : 'Professional Plan'} — active
                </p>
              </div>
              {userPlan === 'starter' && testLimit !== null && (
                <div className="flex items-center gap-3 text-sm">
                  <span className={`font-semibold ${isAtLimit ? 'text-[#CC1A1A]' : 'text-gray-700'}`}>
                    {testsUsed}/{testLimit} tests used this month
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-[#CC1A1A]' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-[#00A651]'}`}
                      style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>
              )}
              {userPlan === 'professional' && (
                <span className="text-green-700 text-xs font-medium">Unlimited tests</span>
              )}
            </div>
            {isAtLimit && userPlan === 'starter' && (
              <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between gap-4">
                <p className="text-[#CC1A1A] text-xs font-semibold">Monthly limit reached. Resets on your next renewal date.</p>
                <Link href="/dashboard/upgrade">
                  <button className="btn-red text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Upgrade
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* FREE TIER USAGE */}
        {userPlan === 'free' && (
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 text-sm font-semibold">Free trial: {testsUsed}/{testLimit} tests used this month</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-[#CC1A1A]' : 'bg-gray-400'}`}
                    style={{ width: `${usagePercent}%` }} />
                </div>
              </div>
              {isAtLimit && (
                <Link href="/dashboard/upgrade">
                  <button className="btn-red text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0">
                    <Zap className="w-3 h-3" /> Upgrade to continue
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* WELCOME */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                Welcome back, {user.name.split('@')[0]}.
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Ready to red team your AI?</p>
            </div>
            <div className="flex items-center gap-2">
              {userPlan === 'professional' && (
                <button onClick={() => setShowCustomProbes(true)} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" /> Custom probes
                  {customProbes.length > 0 && (
                    <span className="badge badge-gray text-xs py-0 px-1.5">{customProbes.length}</span>
                  )}
                </button>
              )}
              {isAtLimit && userPlan === 'scan' ? (
                <Link href="/dashboard/upgrade">
                  <button className="btn-red flex items-center gap-2 whitespace-nowrap">
                    <Zap className="w-4 h-4" /> Buy 3 more audits
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => setShowNewAudit(true)}
                  disabled={isAtLimit}
                  className="btn-red flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Run New Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        {audits.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>{audits.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total audits</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-[#CC1A1A]" style={{ fontFamily: 'var(--font-display)' }}>
                {audits.filter(a => a.risk_level === 'High Risk').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">High risk found</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-[#00A651]" style={{ fontFamily: 'var(--font-display)' }}>
                {audits.filter(a => a.risk_level === 'Low Risk').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Low risk</p>
            </div>
          </div>
        )}

        {/* AUDITS TABLE */}
        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Audit history</h2>
        <div className="card p-0 overflow-hidden">
          {auditsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#CC1A1A] animate-spin" />
            </div>
          ) : audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-[#CC1A1A]" />
              </div>
              <p className="text-gray-900 font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>No audits yet</p>
              <p className="text-gray-400 text-sm mb-4">Run your first test to see results here.</p>
              <button onClick={() => setShowNewAudit(true)} disabled={isAtLimit}
                className="btn-red text-sm py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed">
                Run your first test
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold hidden md:table-cell">Endpoint</th>
                  <th className="text-left px-6 py-4 font-semibold">Score</th>
                  <th className="text-left px-6 py-4 font-semibold">Risk</th>
                  <th className="text-left px-6 py-4 font-semibold">Vulns</th>
                  <th className="text-left px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a, i) => (
                  <tr key={a.audit_id} className={`hover:bg-gray-50 transition-colors ${i < audits.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell max-w-[200px] truncate">{a.endpoint_url}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>{a.risk_score}</span>
                      <span className="text-gray-400 text-xs">/100</span>
                    </td>
                    <td className="px-6 py-4"><span className={riskBadge(a.risk_level)}>{a.risk_level}</span></td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {a.vulnerabilities_found}<span className="text-gray-400 text-xs"> / {a.total_probes}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/report/${a.audit_id}`}>
                        <button className="text-[#CC1A1A] hover:underline text-xs font-semibold">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* NEW AUDIT MODAL */}
      {showNewAudit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="card max-w-lg w-full relative">
            <button onClick={() => { setShowNewAudit(false); setAuditError('') }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#CC1A1A]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>New audit</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6 ml-12">
              Enter your AI endpoint. {userPlan === 'professional' && customProbes.length > 0
                ? `200+ built-in probes + ${customProbes.length} custom probe${customProbes.length === 1 ? '' : 's'} will run.`
                : userPlan === 'scan'
                ? '30 adversarial probes will run against your endpoint.'
                : '200+ adversarial probes will run against it.'}
            </p>
            {testLimit !== null && userPlan === 'starter' && (
              <div className="mb-4 px-3 py-2 bg-[#F8F8F5] rounded-lg border border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">{testsUsed}/{testLimit} tests used this month</span>
                <span className={`text-xs font-semibold ${testsRemaining === 1 ? 'text-[#CC1A1A]' : 'text-gray-500'}`}>{testsRemaining} remaining</span>
              </div>
            )}
            <form onSubmit={handleSubmitAudit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">AI endpoint URL</label>
                <input required type="url" placeholder="https://your-ai.com/api/chat"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#CC1A1A] transition-colors"
                  value={auditForm.url} onChange={e => setAuditForm({ ...auditForm, url: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">API key</label>
                <input required type="password" placeholder="Your API key"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#CC1A1A] transition-colors"
                  value={auditForm.apiKey} onChange={e => setAuditForm({ ...auditForm, apiKey: e.target.value })} />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-gray-400 text-xs">Keys are never stored — used only during the test.</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea placeholder="e.g. Customer support chatbot v2"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#CC1A1A] transition-colors resize-none h-20"
                  value={auditForm.notes} onChange={e => setAuditForm({ ...auditForm, notes: e.target.value })} />
              </div>
              {auditError && <p className="text-[#CC1A1A] text-sm font-semibold">{auditError}</p>}
              <button type="submit" disabled={isRunning} className="btn-red w-full justify-center py-3.5 disabled:opacity-60">
                <CheckCircle className="w-4 h-4" /> Launch audit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM PROBES MODAL */}
      {showCustomProbes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="card max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowCustomProbes(false); setUploadError(''); setUploadSuccess('') }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#CC1A1A]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>Custom probes</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6 ml-12">Upload your own probes to run alongside the built-in 200+ library. Max 50 probes per upload.</p>
            <div className="bg-[#F8F8F5] rounded-lg border border-gray-200 p-4 mb-5">
              <p className="text-xs font-semibold text-gray-700 mb-2">Expected JSON format:</p>
              <pre className="text-xs text-gray-500 overflow-x-auto leading-relaxed">{`{
  "probes": [
    {
      "id": "my-probe-1",
      "category": "Custom",
      "prompt": "Your test prompt here",
      "severity": "High"
    }
  ]
}`}</pre>
              <p className="text-xs text-gray-400 mt-2">Severity options: Critical, High, Medium, Low</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadLoading}
              className="btn-outline w-full justify-center py-2.5 text-sm mb-4 disabled:opacity-60">
              {uploadLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Select JSON file</>}
            </button>
            {uploadError && <p className="text-[#CC1A1A] text-sm font-semibold mb-4">{uploadError}</p>}
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-[#00A651] text-sm font-semibold mb-4">
                <CheckCircle className="w-4 h-4" /> {uploadSuccess}
              </div>
            )}
            {customProbesLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-[#CC1A1A] animate-spin" /></div>
            ) : customProbes.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">
                    {customProbes.length}/{CUSTOM_PROBE_LIMIT} custom probes active
                  </p>
                  <button onClick={handleDeleteCustomProbes} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#CC1A1A] transition-colors font-medium">
                    <Trash2 className="w-3.5 h-3.5" /> Delete all
                  </button>
                </div>
                {customProbes.length >= CUSTOM_PROBE_LIMIT && (
                  <p className="text-xs text-[#CC1A1A] font-medium mb-3">
                    Probe limit reached ({CUSTOM_PROBE_LIMIT} max). Delete a probe to add a new one.
                  </p>
                )}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customProbes.map(p => (
                    <div key={p.probe_id} className="flex items-center justify-between px-3 py-2 bg-[#F8F8F5] rounded-lg border border-gray-200">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-700 truncate">{p.probe_id}</p>
                        <p className="text-xs text-gray-400 truncate">{p.category} · {p.severity}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSingleProbe(p.probe_id)}
                        className="ml-3 shrink-0 text-gray-300 hover:text-[#CC1A1A] transition-colors"
                        aria-label="Delete probe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No custom probes uploaded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#CC1A1A] animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}