import { Navigate, useParams } from 'react-router-dom'
import { Notice } from '@/components/ui'
import { usePublicConfig } from '@/hooks/usePublicConfig'

interface Section {
  h: string
  p: string[]
}

const effective = 'Draft — effective on publication'

const docs: Record<string, { title: string; sections: Section[] }> = {
  terms: {
    title: 'Terms of Service',
    sections: [
      { h: '1. What Trading VIP is', p: ['Trading VIP is a paid, private Telegram community that shares trading education: market concepts, risk-management frameworks and discussion of trading psychology. It is educational material only.', 'Nothing in the community is investment advice, a research report, a recommendation to buy or sell any security or other instrument, or portfolio management. Examples and charts are illustrative and may be hypothetical.'] },
      { h: '2. No guarantee of results', p: ['Trading involves substantial risk of loss. We make no promise or guarantee of profit, income or any particular outcome. Past examples do not indicate future results. You alone are responsible for your trading decisions and any losses.'] },
      { h: '3. Eligibility', p: ['You must be at least 18 years old and legally able to enter a contract. You must be able to lawfully use the service where you live.'] },
      { h: '4. Membership and payment', p: ['A membership gives one person access for 30 days from activation. Payment is a one-time charge in Indian rupees processed by Razorpay; there is no automatic renewal. Renewing before expiry extends access by 30 days from your current expiry date; renewing after expiry starts a new 30-day period from the time payment is verified.', 'Access is granted only after our server verifies payment with Razorpay. A message in your browser or banking app is not confirmation.'] },
      { h: '5. Access, expiry and removal', p: ['Each invite link is single-use, tied to your Telegram account and expires quickly. Memberships are personal and non-transferable. When your membership expires you will be removed from the private group. Removal runs on a schedule, so it may happen some time after the exact expiry moment.', 'Telegram’s platform limits what any operator can enforce. We cannot technically prevent members from copying or sharing content; doing so breaches these terms and may end your access without refund.'] },
      { h: '6. Acceptable use', p: ['Do not share your invite, resell or redistribute content, harass others, post spam or promotions, or share content that is unlawful. We may remove members who break these rules.'] },
      { h: '7. Liability', p: ['To the extent permitted by law, the service is provided as is and we are not liable for trading losses or for indirect or consequential loss. Nothing here limits liability that cannot be limited by law.'] },
      { h: '8. Governing law', p: ['These terms are governed by the laws of India. Courts at [city, state] have jurisdiction, subject to any rights you have under mandatory consumer law.'] },
      { h: '9. Contact', p: ['[Business legal name], [registered address]. Support: see the contact details in the site footer.'] },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { h: 'Who we are', p: ['[Business legal name] (“we”) operates Trading VIP. This policy explains what personal data we process and why.'] },
      { h: 'What we collect', p: ['From Telegram, when you start the bot: your Telegram user ID, chat ID, first name and username (if set). From payments: Razorpay order and payment references, amount, status and timestamps. We do not receive or store your card number, CVV, UPI PIN or bank credentials; Razorpay collects those.', 'Technical data such as IP address and request logs may be processed by our hosting provider for security and reliability. We avoid logging tokens and secrets.'] },
      { h: 'Why we use it', p: ['To identify you securely, verify payments, grant and remove group access, show your membership status, prevent fraud and abuse, keep financial records and respond to support requests.'] },
      { h: 'Who processes it', p: ['Razorpay (payments), Telegram (messaging and group access), Supabase (database and admin authentication) and Vercel (hosting). These providers process data on our behalf under their own terms and may store it outside India.'] },
      { h: 'Retention', p: ['We keep membership and payment records for as long as needed for the service and to meet tax and accounting obligations, then delete or anonymise them. [Insert retention periods after legal review.]'] },
      { h: 'Your rights', p: ['Under India’s Digital Personal Data Protection Act, 2023 you may request access to, correction of, or erasure of your personal data, and may withdraw consent, subject to legal retention duties. Contact us using the details in the site footer.'] },
      { h: 'Cookies', p: ['We use a strictly necessary, httpOnly session cookie after you open a link from the Telegram bot. We do not use advertising cookies.'] },
    ],
  },
  refunds: {
    title: 'Refund Policy',
    sections: [
      { h: 'Default policy (edit before launch)', p: ['Memberships are digital access that begins as soon as your payment is verified and your invite is sent, so payments are generally non-refundable once the invite has been delivered.'] },
      { h: 'When we will refund', p: ['We will refund in full if you were charged but we could not deliver a working invite despite retries, if you were charged twice for the same period, or if a payment was captured in error. Contact support within 7 days with your payment reference.', 'Approved refunds go back to the original payment method through Razorpay; timing depends on your bank.'] },
      { h: 'Chargebacks and reversals', p: ['If a payment is refunded, reversed or disputed, the related membership may be shortened or revoked and you may be removed from the group. Please contact us first so we can fix problems quickly.'] },
      { h: 'Not eligible', p: ['Dissatisfaction with market outcomes, trading losses, or change of mind after access has been delivered are not grounds for a refund under this default policy.'] },
    ],
  },
}

export default function Legal() {
  const { doc = '' } = useParams()
  const { config } = usePublicConfig()
  const entry = docs[doc]
  if (!entry) return <Navigate to="/" replace />

  return (
    <article className="mx-auto max-w-3xl px-gutter-mobile py-12 lg:px-margin">
      <p className="font-label-badge text-label-badge uppercase tracking-wider text-outline">{effective}</p>
      <h1 className="mb-space-md mt-1 font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-lg md:text-headline-lg">{entry.title}</h1>
      <div className="mb-space-lg">
        <Notice tone="warning" title="Template — legal review required">
          This is a starting draft with placeholders in [brackets]. Have a qualified Indian lawyer review it, including whether offering paid trading content requires SEBI registration, before accepting real payments.
        </Notice>
      </div>
      <div className="space-y-space-lg">
        {entry.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-2 font-headline-sm text-headline-sm text-on-surface">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="mb-3 max-w-[70ch] font-body-md text-body-md text-on-surface-variant">{t}</p>
            ))}
          </section>
        ))}
      </div>
      {config.supportEmail && (
        <p className="mt-space-lg font-body-sm text-body-sm text-on-surface-variant">
          Questions: <a className="text-primary underline underline-offset-2" href={`mailto:${config.supportEmail}`}>{config.supportEmail}</a>
        </p>
      )}
    </article>
  )
}
