'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, User, Lock, CreditCard } from 'lucide-react'

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
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

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
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Email</p>
              <p className="text-gray-900 text-sm font-medium">{user.email}</p>
            </div>
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
              To cancel or change your plan, click Manage billing. You will be taken to the Lemon Squeezy customer portal.
            </p>
          )}
        </div>

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