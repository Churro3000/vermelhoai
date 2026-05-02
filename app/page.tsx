import Link from 'next/link'
import { Zap, FileText, ChevronRight, Check, AlertTriangle, Lock, Globe, Code2 } from 'lucide-react'

function ShieldLogo({ size = 27, textColor = 'text-gray-900' }: { size?: number; textColor?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for right-side shadow — lighter at top, darker toward bottom */}
          <linearGradient id="shadowFade" x1="12" y1="3" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B1010" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#5A0808" stopOpacity="0.8" />
          </linearGradient>
          {/* Clip to right half only */}
          <clipPath id="rightHalf">
            <rect x="12" y="0" width="12" height="24" />
          </clipPath>
        </defs>

        {/* Base shield — full red */}
        <path
          d="M12 2L4 5.5V11.5C4 16.25 7.4 20.7 12 22C16.6 20.7 20 16.25 20 11.5V5.5L12 2Z"
          fill="#CC1A1A"
        />

        {/* Right half shadow with fade — darker at bottom, lighter at top */}
        <path
          d="M12 2L4 5.5V11.5C4 16.25 7.4 20.7 12 22C16.6 20.7 20 16.25 20 11.5V5.5L12 2Z"
          fill="url(#shadowFade)"
          clipPath="url(#rightHalf)"
        />

        {/* Tiny white V notch — top right corner of shield */}
        <path
          d="M15.2 3.6L17.2 5.6L19.0 3.9"
          stroke="white"
          strokeWidth="0.85"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        className={`font-bold tracking-tight ${textColor}`}
        style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.67 }}
      >
        Vermelho<span className="text-[#CC1A1A]">AI</span>
      </span>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo — flush left */}
          <Link href="/" className="shrink-0">
            <ShieldLogo size={27} textColor="text-gray-900" />
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#probes" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Probes</a>
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
          </div>

          {/* CTA — flush right */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/signin">
              <button className="btn-outline text-sm py-2 px-4">Sign in</button>
            </Link>
            <Link href="/signup">
              <button className="btn-red text-sm py-2 px-5">
                Start free <span className="hidden sm:inline">trial</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-28 relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #CC1A1A 1px, transparent 0)',
          backgroundSize: '36px 36px'
        }} />
        {/* Glow blobs */}
        <div className="absolute top-16 right-[-80px] w-[480px] h-[480px] bg-[#CC1A1A]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-40px] w-72 h-72 bg-[#00A651]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Badge */}
          <div className="badge badge-red mb-7 inline-flex">
            <div className="w-1.5 h-1.5 rounded-full bg-[#CC1A1A] animate-pulse" />
            200+ adversarial probes
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-[64px] font-bold text-gray-900 leading-[1.08] tracking-tight mb-6 max-w-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Red team your AI.<br />
            <span className="text-[#CC1A1A]">Before someone else does.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
            VermelhoAI runs 200+ adversarial probes against your AI — jailbreaks, prompt injections, data extraction, goal hijacking, and more. Full security report in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link href="/signup">
              <button className="btn-red py-3 px-7 text-sm">
                Test your AI now <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="btn-outline py-3 px-7 text-sm">
                See how it works
              </button>
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">No credit card required · Results in 5–30 minutes</p>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="py-4 border-y border-gray-100 bg-[#F8F8F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-500 font-medium">
            <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Trusted by teams building</span>
            <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-[#CC1A1A]" /> Chatbots</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#CC1A1A]" /> Customer support AI</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#CC1A1A]" /> Enterprise LLM apps</span>
            <span className="flex items-center gap-1.5">
              {/* Mini shield — matches main logo style */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="shadowFadeMini" x1="12" y1="3" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#8B1010" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#5A0808" stopOpacity="0.8" />
                  </linearGradient>
                  <clipPath id="rightHalfMini">
                    <rect x="12" y="0" width="12" height="24" />
                  </clipPath>
                </defs>
                <path d="M12 2L4 5.5V11.5C4 16.25 7.4 20.7 12 22C16.6 20.7 20 16.25 20 11.5V5.5L12 2Z" fill="#CC1A1A" />
                <path d="M12 2L4 5.5V11.5C4 16.25 7.4 20.7 12 22C16.6 20.7 20 16.25 20 11.5V5.5L12 2Z" fill="url(#shadowFadeMini)" clipPath="url(#rightHalfMini)" />
              </svg>
              Medical AI tools
            </span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#CC1A1A]" /> AI agents</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <div className="badge badge-gray mb-4">How it works</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Three steps to a security report
            </h2>
            <p className="text-base text-gray-500 max-w-lg">No complex setup. No agent installation. Just connect your AI and run.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                icon: <Code2 className="w-5 h-5 text-[#CC1A1A]" />,
                title: 'Connect your AI',
                desc: 'Paste your AI endpoint URL and API key. Works with any OpenAI-compatible API, custom endpoints, or hosted models.',
              },
              {
                step: '02',
                icon: <Zap className="w-5 h-5 text-[#CC1A1A]" />,
                title: 'We run the probes',
                desc: '200+ adversarial probes fire against your model — DAN jailbreaks, prompt injections, goal hijacking, continuation attacks, social engineering, and more.',
              },
              {
                step: '03',
                icon: <FileText className="w-5 h-5 text-[#CC1A1A]" />,
                title: 'Download your report',
                desc: 'Full security report with vulnerability findings, severity ratings, and remediation recommendations. PDF-ready to share with your team.',
              },
            ].map((item) => (
              <div key={item.step} className="card h-full group hover:border-[#CC1A1A]/40 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center group-hover:bg-[#CC1A1A]/10 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-5xl font-bold text-gray-300 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBE CATEGORIES */}
      <section id="probes" className="py-24 bg-[#0D0D0B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <div className="badge badge-red mb-4">Probe library</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              200+ probes across 10 attack categories
            </h2>
            <p className="text-base text-gray-400 max-w-xl">
              Built from OWASP LLM Top 10, AutoDAN research, and real-world attack patterns. New probes added every month.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { category: 'DAN & Persona Jailbreaks', count: '12 probes', desc: 'DAN 11.0, DUDE, STAN, Developer Mode, token threat attacks, persona injection' },
              { category: 'Prompt Injection',         count: '10 probes', desc: 'Direct injection, indirect via documents, delimiter attacks, system override attempts' },
              { category: 'System Prompt Extraction', count: '10 probes', desc: 'Verbatim extraction, paraphrasing attacks, config leakage, restriction mapping' },
              { category: 'Data Extraction',          count: '10 probes', desc: 'PII leakage, credential harvesting, database queries, vector store extraction' },
              { category: 'Goal Hijacking',           count: '10 probes', desc: 'Ignore-say, nevermind, screaming-stop, instruction override, context reset attacks' },
              { category: 'Hallucination Induction',  count: '8 probes',  desc: 'False premise injection, fabricated prior consent, impossible capability claims' },
              { category: 'Social Engineering',       count: '10 probes', desc: 'Authority spoofing, urgency manipulation, bribery, peer pressure, flattery attacks' },
              { category: 'Continuation Attacks',     count: '10 probes', desc: 'Partial phrase completion, autocomplete exploitation, document continuation' },
              { category: 'OWASP LLM Top 10',         count: '10 probes', desc: 'Full coverage of LLM01–LLM10 including supply chain, overreliance, and plugin abuse' },
              { category: 'Edge Cases',               count: '10 probes', desc: 'Encoded payloads, steganography, language bypass, logic manipulation' },
            ].map((item) => (
              <div key={item.category} className="card-dark hover:border-gray-700 hover:bg-[#111110] transition-all duration-200">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{item.category}</h3>
                  <span className="badge badge-gray text-xs shrink-0 ml-2">{item.count}</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2.5 text-gray-500 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#00A651] shrink-0" />
            New probes added monthly — Starter: 50 probes · Professional: 200+ probes
          </div>
        </div>
      </section>

      {/* WHY VERMELHOAI */}
      <section className="py-24 bg-[#F8F8F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <div className="badge badge-gray mb-4 mx-auto">Why VermelhoAI</div>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                lineHeight: '1.35',
                marginBottom: '1rem',
                display: 'block',
                overflow: 'visible',
                paddingBottom: '6px',
              }}
            >
              Security testing that just works
            </h2>
            <p className="text-base text-gray-500 max-w-lg mx-auto">
              Other tools require deep technical setup and security expertise. VermelhoAI is built for shipping teams — powerful, simple, ready in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { name: 'CLI Tools',      desc: 'For developers',  setup: 'CLI setup required',   probes: 'DIY config',       price: 'Free / complex', highlight: false },
              { name: 'VermelhoAI',     desc: 'For everyone',    setup: 'Paste URL, click run', probes: '200+ built-in',    price: '$99/month',      highlight: true  },
              { name: 'Research Tools', desc: 'For researchers', setup: 'Python environment',   probes: '3,000+ (complex)', price: 'Free / complex', highlight: false },
            ].map((item) => (
              <div key={item.name} className={`card transition-all duration-200 ${item.highlight ? 'border-[#CC1A1A] bg-[#FEF2F2]/60 shadow-sm' : 'hover:border-gray-300'}`}>
                <div className="mb-5">
                  <h3 className={`text-lg font-bold mb-0.5 tracking-tight ${item.highlight ? 'text-[#CC1A1A]' : 'text-gray-900'}`}
                    style={{ fontFamily: 'var(--font-display)' }}>
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-gray-600"><Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {item.setup}</div>
                  <div className="flex items-center gap-2.5 text-gray-600"><Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {item.probes}</div>
                  <div className="flex items-center gap-2.5 text-gray-600"><Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14 text-center">
            <div className="badge badge-gray mb-4 mx-auto">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Simple, transparent pricing
            </h2>
            <p className="text-base text-gray-500" style={{ lineHeight: '1.6', paddingBottom: '0.125rem' }}>
              7-day free trial on all plans. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Starter */}
            <div className="card hover:border-gray-300 hover:shadow-sm transition-all duration-200">
              <div className="mb-7">
                <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Starter</h3>
                <p className="text-gray-400 text-sm mb-5">For AI developers and small teams</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', letterSpacing: '-0.03em' }}>$99</span>
                  <span className="text-gray-400 text-sm ml-1">/month</span>
                </div>
                <p className="text-[#00A651] text-xs font-semibold mt-2.5">7-day free trial included</p>
              </div>
              <div className="space-y-2.5 mb-8">
                {['50 tests per month', '100+ adversarial probes', 'PDF security reports', 'Email support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 text-[#00A651] shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/signup" className="block">
                <button className="btn-outline w-full justify-center py-2.5 text-sm">Start free trial</button>
              </Link>
            </div>

            {/* Professional */}
            <div className="card border-[#CC1A1A] relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#CC1A1A]" />
              <div className="absolute top-4 right-4">
                <span className="badge badge-red text-xs">Most popular</span>
              </div>
              <div className="mb-7">
                <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Professional</h3>
                <p className="text-gray-400 text-sm mb-5">For AI companies shipping to production</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', letterSpacing: '-0.03em' }}>$299</span>
                  <span className="text-gray-400 text-sm ml-1">/month</span>
                </div>
                <p className="text-[#00A651] text-xs font-semibold mt-2.5">7-day free trial included</p>
              </div>
              <div className="space-y-2.5 mb-8">
                {[
                  '200 tests per month',
                  '200+ adversarial probes (updated monthly)',
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
              <Link href="/signup" className="block">
                <button className="btn-red w-full justify-center py-2.5 text-sm">Start free trial</button>
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Just exploring? <Link href="/signup" className="text-[#CC1A1A] font-medium hover:underline">Sign up free</Link> — 10 probes included, no card required.
          </p>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="py-8 bg-[#F8F8F5] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-3 max-w-2xl">
            <AlertTriangle className="w-4 h-4 text-[#CC1A1A] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-700">Liability disclaimer: </span>
              VermelhoAI identifies potential vulnerabilities but does not guarantee complete security. Users are responsible for remediation.{' '}
              <Link href="/terms" className="text-[#CC1A1A] hover:underline">Terms of Service</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#0D0D0B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="shrink-0">
              <div className="mb-3">
                <ShieldLogo size={22} textColor="text-white" />
              </div>
              <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">
                AI red teaming for developers. Find vulnerabilities before your users do.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 text-sm">
              <div className="space-y-3">
                <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Product</p>
                <div className="space-y-2">
                  <a href="#how-it-works" className="block text-gray-600 text-sm hover:text-white transition-colors">How it works</a>
                  <a href="#probes" className="block text-gray-600 text-sm hover:text-white transition-colors">Probe library</a>
                  <a href="#pricing" className="block text-gray-600 text-sm hover:text-white transition-colors">Pricing</a>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Legal</p>
                <div className="space-y-2">
                  <Link href="/terms" className="block text-gray-600 text-sm hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="block text-gray-600 text-sm hover:text-white transition-colors">Privacy Policy</Link>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Account</p>
                <div className="space-y-2">
                  <Link href="/signin" className="block text-gray-600 text-sm hover:text-white transition-colors">Sign in</Link>
                  <Link href="/signup" className="block text-gray-600 text-sm hover:text-white transition-colors">Sign up</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">© 2026 VermelhoAI. All rights reserved.</p>
            <p className="text-gray-600 text-xs">vermelho = red in Portuguese 🇵🇹</p>
          </div>
        </div>
      </footer>

    </div>
  )
}