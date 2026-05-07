import Link from 'next/link'

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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <ShieldLogo size={26} textColor="text-gray-900" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-semibold">
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="card">
          <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                1. Introduction
              </h2>
              <p>VermelhoAI ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use the VermelhoAI platform. By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                2. Information We Collect
              </h2>
              <p className="mb-3">We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-semibold text-gray-900">Account information:</span> Email address and password (hashed) when you create an account</li>
                <li><span className="font-semibold text-gray-900">Audit data:</span> AI endpoint URLs, audit results, risk scores, and security findings generated during tests</li>
                <li><span className="font-semibold text-gray-900">Usage data:</span> Information about how you use the Service including pages visited and features used</li>
                <li><span className="font-semibold text-gray-900">Payment data:</span> Subscription and billing information processed by Lemon Squeezy — we do not store payment card details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                3. API Keys
              </h2>
              <p>API keys submitted for testing are used solely to conduct the authorized security test during that session. API keys are transmitted securely over HTTPS and are never stored in our database, logs, or any persistent storage. Once the audit is complete, the API key is discarded.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                4. How We Use Your Information
              </h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Provide, operate, and maintain the Service</li>
                <li>Process your subscription and send billing receipts</li>
                <li>Send audit completion notifications and security reports</li>
                <li>Respond to support requests and inquiries</li>
                <li>Improve and develop new features for the Service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                5. Data Storage and Security
              </h2>
              <p>Your data is stored in a secure PostgreSQL database hosted by Neon. We implement industry-standard security measures including encrypted connections (TLS), hashed passwords (bcrypt), and access controls. Audit results are stored and associated only with your account and are not accessible to other users.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                6. Data Retention
              </h2>
              <p>We retain your account information for as long as your account is active. Audit results and reports are retained indefinitely so you can access historical reports. If you delete your account, your personal data and audit history will be permanently deleted within 30 days. API keys are never retained beyond the duration of a test session.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                7. Third Party Services
              </h2>
              <p className="mb-3">We use the following third party services to operate VermelhoAI:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="font-semibold text-gray-900">Neon:</span> Database hosting</li>
                <li><span className="font-semibold text-gray-900">Vercel:</span> Application hosting and deployment</li>
                <li><span className="font-semibold text-gray-900">Groq:</span> AI analysis of security test results</li>
                <li><span className="font-semibold text-gray-900">Lemon Squeezy:</span> Payment processing and subscription management</li>
                <li><span className="font-semibold text-gray-900">Resend:</span> Transactional email delivery</li>
              </ul>
              <p className="mt-3">Each of these services has their own privacy policy governing their use of data.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                8. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your audit reports and data</li>
                <li>Opt out of non-essential communications</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:hello.vermelhoai@gmail.com" className="text-[#CC1A1A] hover:underline">hello.vermelhoai@gmail.com</a></p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                9. Cookies
              </h2>
              <p>VermelhoAI uses a single session cookie (`hr_session`) to maintain your authenticated session. This cookie is strictly necessary for the Service to function and does not track you across other websites. We do not use advertising cookies or third party tracking cookies.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                10. Children's Privacy
              </h2>
              <p>VermelhoAI is not directed at children under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                11. Changes to This Policy
              </h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on the Service. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                12. Official Communications
              </h2>
              <p>VermelhoAI communicates with users exclusively via <a href="mailto:hello.vermelhoai@gmail.com" className="text-[#CC1A1A] hover:underline">hello.vermelhoai@gmail.com</a>. We will never contact you from any other email address. If you receive a message claiming to be from VermelhoAI from a different address, treat it as fraudulent and do not click any links.</p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                13. Contact
              </h2>
              <p>For privacy-related questions or to exercise your rights, contact us at <a href="mailto:hello.vermelhoai@gmail.com" className="text-[#CC1A1A] hover:underline">hello.vermelhoai@gmail.com</a></p>
            </section>

          </div>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-gray-400 text-sm">
          © 2026 VermelhoAI. All rights reserved. ·{' '}
          <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
        </p>
      </footer>
    </div>
  )
}