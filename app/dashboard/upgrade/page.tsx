'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Loader2, ArrowLeft, Zap } from 'lucide-react'

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

export default function UpgradePage() {
  const [loading, setLoading] = useState<'starter' | 'professional' | null>(null)
  const [error, setError] = useState('')

  const handleUpgrade = async (plan: 'starter' | 'professional') => {
    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Payment failed.'); setLoading(null); return }
      window.location.href = data.paymentUrl
    } catch {
      setError('Could not connect to payment provider. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <ShieldLogo size={26} textColor="text-gray-900" />
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-12">
          <div className="badge badge-red mb-4 mx-auto inline-flex">
            <Zap className="w-3 h-3" /> Upgrade your plan
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Choose your plan
          </h1>
          <p className="text-lg text-gray-500">
            Red team your AI seriously. 7-day free trial. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-center">
            <p className="text-[#CC1A1A] text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">

          {/* Starter */}
          <div className="card">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 mb-1"
                style={{ fontFamily: 'var(--font-display)' }}>Starter</h3>
              <p className="text-gray-500 text-sm mb-4">For AI developers and small teams building and testing as they go</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900"
                  style={{ fontFamily: 'var(--font-display)' }}>$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-[#00A651] text-xs font-semibold mt-2">7-day free trial included</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                '50 tests per month',
                '100+ adversarial probes',
                'PDF security reports',
                'Email support (72hr response)',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#00A651] shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => handleUpgrade('starter')}
              disabled={loading !== null}
              className="btn-outline w-full justify-center py-3.5 disabled:opacity-60"
            >
              {loading === 'starter'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                : <>Start free trial <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>

          {/* Professional */}
          <div className="card border-[#CC1A1A] relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="badge badge-red text-xs">Most popular</span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 mb-1"
                style={{ fontFamily: 'var(--font-display)' }}>Professional</h3>
              <p className="text-gray-500 text-sm mb-4">For AI companies shipping to production. Continuous security testing.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900"
                  style={{ fontFamily: 'var(--font-display)' }}>$299</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-[#00A651] text-xs font-semibold mt-2">7-day free trial included</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                'Unlimited tests',
                '200+ adversarial probes (updated monthly)',
                'PDF reports + CSV export',
                'API access for CI/CD integration',
                'Custom probe upload',
                'Email support (72hr response)',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#00A651] shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => handleUpgrade('professional')}
              disabled={loading !== null}
              className="btn-red w-full justify-center py-3.5 disabled:opacity-60"
            >
              {loading === 'professional'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                : <>Start free trial <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Payments secured by Lemon Squeezy · Cancel anytime · No hidden fees
        </p>
      </main>
    </div>
  )
}