import { TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Design-system "Regulatory Compliance Callout". Never size the legal text below 11px. */
export function RiskNotice({ withLinks = false }: { withLinks?: boolean }) {
  return (
    <section aria-labelledby="risk-title" className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/80 p-space-md sm:p-space-lg">
      <div className="flex items-center gap-2 text-[#F59E0B]">
        <TriangleAlert className="h-5 w-5" aria-hidden />
        <h2 id="risk-title" className="font-label-badge text-label-badge font-semibold uppercase tracking-wider">
          Educational material only · Risk disclosure
        </h2>
      </div>
      <p className="mt-3 font-disclaimer-legal text-disclaimer-legal leading-relaxed text-outline">
        Trading in financial instruments, including equities, derivatives, commodities, currencies and digital assets, involves substantial
        risk of loss and is not suitable for everyone. SEBI studies have found that the large majority of individual F&amp;O traders lose
        money. <strong className="text-on-surface-variant">Trading VIP</strong> is an educational community that discusses market concepts,
        risk management and trading psychology. It does not provide investment advice, research recommendations, buy or sell calls, or
        portfolio management, and nothing shared in it is a guarantee or prediction of returns. Examples are illustrative, and past results
        do not indicate future results. Consult a SEBI-registered adviser before deciding how to use your own capital.
      </p>
      {withLinks && (
        <nav aria-label="Legal" className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-outline-variant/15 pt-3 font-label-badge text-label-badge uppercase text-outline">
          <Link className="hover:text-primary" to="/legal/terms">Terms of service</Link>
          <Link className="hover:text-primary" to="/legal/privacy">Privacy policy</Link>
          <Link className="hover:text-primary" to="/legal/refunds">Refund policy</Link>
        </nav>
      )}
    </section>
  )
}
