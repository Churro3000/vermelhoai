'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, User, Lock, CreditCard, Key, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'

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

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)

  // Password form
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // API key
  const [hasKey, setHasKey] = useState(false)
  const [keyPrefix, setKeyPrefix] = useState('')
  const [keyCreatedAt, setKeyCreatedAt] = useState('')
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keyLoading, setKeyLoading] = useState(false)
  const [keyMsg, setKeyMsg] = useState('')
  const [keyError, setKeyError] = useState('')
  const [copied, setCopied] = useState(false)

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
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => setUserPlan(data.plan ?? 'free'))
      .catch(() => setUserPlan('free'))
  }, [])

  useEffect(() => {
    if (userPlan === 'professional') {
      fetch('/api/user/api-keys')
        .then(res => res.json())
        .then(data => {
          setHasKey(data.hasKey ?? false)
          setKeyPrefix(data.keyPrefix ?? '')
          setKeyCreatedAt(data.createdAt ?? '')
        })
        .catch(() => {})
    }
  }, [userPlan])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMsg('')
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password.')
      } else {
        setPasswordMsg('Password changed successfully.')
        setPasswordForm({ current: '', newPass: '', confirm: '' })
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleGenerateKey = async () => {
    if (hasKey && !confirm('This will revoke your existing API key. Any integrations using it will stop working. Continue?')) return
    setKeyLoading(true)
    setKeyError('')
    setKeyMsg('')
    setNewlyGeneratedKey('')
    try {
      const res = await fetch('/api/user/api-keys', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setKeyError(data.error || 'Failed to generate key.')
      } else {
        setNewlyGeneratedKey(data.key)
        setKeyPrefix(data.keyPrefix)
        setHasKey(true)
        setShowKey(true)
        setKeyMsg('API key generated. Copy it now — it will not be shown again.')
      }
    } catch {
      setKeyError('Something went wrong. Please try again.')
    } finally {
      setKeyLoading(false)
    }
  }

  const handleRevokeKey = async () => {
    if (!confirm('Revoke your API key? Any integrations using it will stop working immediately.')) return
    setKeyLoading(true)
    setKeyError('')
    try {
      await fetch('/api/user/api-keys', { method: 'DELETE' })
      setHasKey(false)
      setKeyPrefix('')
      setNewlyGeneratedKey('')
      setKeyMsg('')
    } catch {
      setKeyError('Failed to revoke key.')
    } finally {
      setKeyLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newlyGeneratedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#CC1A1A] animate-spin" />
    </div>
  )

  if (!user) return null

  const planLabel = userPlan === 'starter' ? 'Starter — $99/month' : userPlan === 'professional' ? 'Professional — $299/month' : 'Free Trial'
  const planBadgeClass = userPlan === 'professional' ? 'badge badge-red' : userPlan === 'starter' ? 'badge badge-green' : 'badge badge-gray'

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <ShieldLogo size={28} textColor="text-gray-900" />
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 w-full flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Account Settings
        </h1>

        {/* ACCOUNT INFO */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-[#CC1A1A]" />
            </div>
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>Account</h2>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Email</p>
            <p className="text-gray-900 text-sm font-medium">{user.email}</p>
          </div>
        </div>

        {/* PLAN */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#CC1A1A]" />
            </div>
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>Subscription</h2>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Current plan</p>
              <span className={planBadgeClass}>{planLabel}</span>
            </div>
            <div className="flex gap-2">
              {userPlan === 'free' && (
                <Link href="/dashboard/upgrade">
                  <button className="btn-red text-sm py-2 px-4">Upgrade</button>
                </Link>
              )}
              {userPlan !== 'free' && (
                <button
                  onClick={() => window.open('https://vermelhoai.lemonsqueezy.com/billing', '_blank')}
                  className="btn-outline text-sm py-2 px-4"
                >
                  Manage billing
                </button>
              )}
            </div>
          </div>
          {userPlan !== 'free' && (
            <p className="text-xs text-gray-400 mt-3">
              To cancel or change your plan, click Manage billing to access the Lemon Squeezy customer portal.
            </p>
          )}
        </div>

        {/* API KEY — Professional only */}
        {userPlan === 'professional' && (
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Key className="w-4 h-4 text-[#CC1A1A]" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>API Access</h2>
                <p className="text-xs text-gray-400 mt-0.5">Use your API key to trigger scans from CI/CD pipelines</p>
              </div>
            </div>

            {/* Newly generated key — show once */}
            {newlyGeneratedKey && (
              <div className="bg-[#F0FDF4] border border-[#00A651]/30 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-[#00A651] mb-2">{keyMsg}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-2 font-mono text-gray-800 truncate">
                    {showKey ? newlyGeneratedKey : '•'.repeat(40)}
                  </code>
                  <button onClick={() => setShowKey(!showKey)} className="text-gray-400 hover:text-gray-700 shrink-0">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={handleCopy} className="btn-outline text-xs py-1.5 px-3 shrink-0">
                    {copied ? <><CheckCircle className="w-3.5 h-3.5 text-[#00A651]" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>
            )}

            {/* Existing key info */}
            {hasKey && !newlyGeneratedKey && (
              <div className="bg-[#F8F8F5] border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Active API key</p>
                <code className="text-sm font-mono text-gray-700">{keyPrefix}</code>
                {keyCreatedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(keyCreatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {!hasKey && !newlyGeneratedKey && (
              <p className="text-sm text-gray-400 mb-4">No API key generated yet.</p>
            )}

            {keyError && <p className="text-[#CC1A1A] text-sm mb-4">{keyError}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleGenerateKey}
                disabled={keyLoading}
                className="btn-red text-sm py-2 px-4 disabled:opacity-60"
              >
                {keyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : hasKey ? 'Regenerate key' : 'Generate API key'}
              </button>
              {hasKey && (
                <button
                  onClick={handleRevokeKey}
                  disabled={keyLoading}
                  className="btn-outline text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Revoke
                </button>
              )}
            </div>

            {/* Usage docs */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">How to use in CI/CD:</p>
              <pre className="text-xs bg-[#0D0D0B] text-gray-300 rounded-lg p-4 overflow-x-auto leading-relaxed">{`curl -X POST https://vermelhoai.com/api/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpointUrl": "https://your-ai.com/api/chat",
    "apiKey": "your-ai-api-key"
  }'`}</pre>
              <p className="text-xs text-gray-400 mt-2">The response includes a <code className="font-mono">reportUrl</code> linking directly to your report in the dashboard.</p>
            </div>
          </div>
        )}

        {/* CHANGE PASSWORD */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#CC1A1A]" />
            </div>
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>Change password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Current password</label>
              <input
                type="password"
                required
                placeholder="Your current password"
                value={passwordForm.current}
                onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#CC1A1A] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">New password</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={passwordForm.newPass}
                onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#CC1A1A] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm new password</label>
              <input
                type="password"
                required
                placeholder="Repeat new password"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#CC1A1A] transition-colors"
              />
            </div>
            {passwordError && <p className="text-[#CC1A1A] text-sm">{passwordError}</p>}
            {passwordMsg && (
              <div className="flex items-center gap-2 text-[#00A651] text-sm">
                <CheckCircle className="w-4 h-4" /> {passwordMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-red text-sm py-2.5 px-6 disabled:opacity-60"
            >
              {passwordLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                : 'Update password'
              }
            </button>
          </form>
        </div>

      </main>
    </div>
  )
}