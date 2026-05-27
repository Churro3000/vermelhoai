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
  const [loading, setLoading] = useState<'scan' | 'starter' | 'professional' | null>(null)
  const [error, setError] = useState('')

  const handleUpgrade = async (plan: 'scan' | 'starter' | 'professional') => {
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
          <Link href="/"><ShieldLogo size={26} textColor="text-gray-900" /></Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">

        <div className="text-center mb-12">
          <div className="badge badge-red mb-4 mx-auto inline-flex">
            <Zap className="w-3 h-3" /> Choose your plan
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-base text-gray-500">
            7-day free trial on subscription plans. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-center">
            <p className="text-[#CC1A1A] text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {/* Quick Scan */}
          <div className="card hover:border-gray-300 hover:shadow-sm transition-all duration-200">
            <div className="mb-7">
              <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Quick Scan</h3>
              <p className="text-gray-400 text-sm mb-5">Try it out — no subscription needed</p>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '-0.03em' }}>$5</span>
                <span className="text-gray-400 text-sm ml-1">one-time</span>
              </div>
              <p className="text-gray-400 text-xs font-medium mt-2.5">No expiry · No subscription</p>
            </div>
            <div className="space-y-2.5 mb-8">
              {['3 audits included', '30 adversarial probes', 'PDF security reports'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => handleUpgrade('scan')}
              disabled={loading !== null}
              className="btn-outline w-full justify-center py-2.5 text-sm disabled:opacity-60"
            >
              {loading === 'scan'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                : <>Buy Quick Scan <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>

          {/* Starter */}
          <div className="card border-[#CC1A1A] relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#CC1A1A]" />
            <div className="absolute top-4 right-4">
              <span className="badge badge-red text-xs">Most popular</span>
            </div>
            <div className="mb-7">
              <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Starter</h3>
              <p className="text-gray-400 text-sm mb-2">For AI developers and small teams</p>
              <p className="text-[#CC1A1A] text-xs font-semibold mb-4">Perfect while building your AI</p>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '-0.03em' }}>$99</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <p className="text-[#00A651] text-xs font-semibold mt-2.5">7-day free trial included</p>
            </div>
            <div className="space-y-2.5 mb-8">
              {['50 audits per month', '200+ adversarial probes', 'PDF security reports', 'Email support'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => handleUpgrade('starter')}
              disabled={loading !== null}
              className="btn-outline w-full justify-center py-2.5 text-sm disabled:opacity-60"
            >
              {loading === 'starter'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                : <>Start free trial <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>

          {/* Professional */}
          <div className="card hover:border-gray-300 hover:shadow-sm transition-all duration-200">
            <div className="mb-7">
              <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Professional</h3>
              <p className="text-gray-400 text-sm mb-2">For AI companies shipping to production</p>
              <p className="text-[#CC1A1A] text-xs font-semibold mb-4">For teams shipping AI to production</p>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '-0.03em' }}>$299</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <p className="text-[#00A651] text-xs font-semibold mt-2.5">7-day free trial included</p>
            </div>
            <div className="space-y-2.5 mb-8">
              {[
                'Unlimited audits',
                '200+ adversarial probes',
                'PDF reports + CSV export',
                'API access for CI/CD integration',
                'Custom probe upload',
                'Priority email support',
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => handleUpgrade('professional')}
              disabled={loading !== null}
              className="btn-red w-full justify-center py-2.5 text-sm disabled:opacity-60"
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