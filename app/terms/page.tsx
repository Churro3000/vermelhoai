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

const sectionTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: '-0.01em',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: May 2026</p>

          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                1. Acceptance of Terms
              </h2>
              <p>By accessing or using VermelhoAI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. These terms apply to all users, including visitors, registered users, and paying customers.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                2. Description of Service
              </h2>
              <p>VermelhoAI is an AI red teaming platform that allows developers and organizations to test their AI systems against adversarial probes. The Service runs automated security tests against AI endpoints provided by users and generates security reports based on the results.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                3. Authorized Use Only
              </h2>
              <p className="mb-3">You may only use VermelhoAI to test AI systems that you own or have explicit written authorization to test. By submitting an endpoint URL, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You are the owner of the AI system being tested, or</li>
                <li>You have explicit written permission from the owner to conduct security testing</li>
                <li>Your use of the Service complies with all applicable laws and regulations</li>
                <li>You will not use the Service to test systems belonging to third parties without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                4. Prohibited Uses
              </h2>
              <p className="mb-3">You may not use VermelhoAI to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Test AI systems without authorization from their owners</li>
                <li>Conduct attacks against production systems without proper change management approval</li>
                <li>Use the probe library to develop malicious attacks against third parties</li>
                <li>Attempt to reverse engineer, decompile, or extract the probe library</li>
                <li>Resell, redistribute, or sublicense access to the Service</li>
                <li>Violate any applicable local, national, or international laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                5. No Security Guarantee
              </h2>
              <p>VermelhoAI is a testing tool designed to help identify potential vulnerabilities. A passing score or low risk rating does not guarantee that your AI system is free from vulnerabilities. The Service tests against a defined set of known attack patterns and does not cover all possible attack vectors. You remain solely responsible for the security of your AI systems.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                6. Subscriptions and Billing
              </h2>
              <p className="mb-3">VermelhoAI offers paid subscription plans billed monthly. By subscribing you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Pay the applicable subscription fee in advance each billing period</li>
                <li>Provide accurate billing information</li>
                <li>Notify us of any billing disputes within 30 days</li>
              </ul>
              <p className="mt-3">Subscriptions automatically renew unless cancelled before the renewal date. You may cancel at any time through your account settings. No refunds are provided for partial billing periods.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                7. Free Trial
              </h2>
              <p>New subscribers receive a 7-day free trial. No charge is made during the trial period. If you cancel before the trial ends, you will not be charged. After the trial period, your subscription will automatically convert to a paid plan at the applicable rate.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                7a. Monthly Test Allowance and Reset Policy
              </h2>
              <p className="mb-3">Subscription plans that include a monthly test allowance (currently the Starter plan at 50 tests per month) are subject to the following conditions:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your monthly test allowance resets automatically on your billing renewal date each month, regardless of how many tests were used during the preceding period.</li>
                <li>Unused tests do not carry over to the following billing period. Any tests remaining at the end of a billing period are forfeited upon renewal.</li>
                <li>It is the sole responsibility of the subscriber to utilise their allocated tests within each billing period. VermelhoAI does not provide refunds, credits, or compensation for unused tests at the time of renewal.</li>
                <li>The Professional plan currently offers unlimited tests per billing period and is not subject to a monthly test cap.</li>
              </ul>
              <p className="mt-3">By subscribing to a plan with a monthly test allowance, you acknowledge and accept that unused tests will not roll over and that the allowance resets on each renewal date irrespective of usage.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                8. Data and Privacy
              </h2>
              <p>API keys submitted for testing are used solely to conduct the authorized security test and are never stored permanently. Audit results and reports are stored securely and are only accessible to the account that generated them. See our <Link href="/privacy" className="text-[#CC1A1A] hover:underline">Privacy Policy</Link> for full details on data handling.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                9. Intellectual Property
              </h2>
              <p>The VermelhoAI platform, probe library, reports, and all associated intellectual property remain the exclusive property of VermelhoAI. Security reports generated for your account are yours to use for internal security purposes. You may not redistribute or resell reports generated by the Service.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                10. Limitation of Liability
              </h2>
              <p>To the maximum extent permitted by applicable law, VermelhoAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability to you for any claims arising from these terms shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                11. Disclaimer of Warranties
              </h2>
              <p>The Service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure. We disclaim all warranties including but not limited to merchantability, fitness for a particular purpose, and non-infringement.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                12. Changes to Terms
              </h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of material changes by email or by posting a notice on the Service. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                13. Official Communications
              </h2>
              <p>VermelhoAI communicates with users via two official email addresses: <a href="mailto:hello@vermelhoai.com" className="text-[#CC1A1A] hover:underline">hello@vermelhoai.com</a> (automated notifications and system emails) and <a href="mailto:hello.vermelhoai@gmail.com" className="text-[#CC1A1A] hover:underline">hello.vermelhoai@gmail.com</a> (direct support and correspondence). We will never contact you from any other address. If you receive a message claiming to be from VermelhoAI from a different address, treat it as fraudulent and do not click any links.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3" style={sectionTitle}>
                14. Contact
              </h2>
              <p>For questions about these Terms of Service, contact us at <a href="mailto:hello.vermelhoai@gmail.com" className="text-[#CC1A1A] hover:underline">hello.vermelhoai@gmail.com</a></p>
            </section>

          </div>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-gray-400 text-sm">
          © 2026 VermelhoAI. All rights reserved. ·{' '}
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
        </p>
      </footer>
    </div>
  )
}