import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, LifeBuoy, RefreshCw, Send } from 'lucide-react'
import type { InvitationStatus, MemberDashboard, MembershipSummary, PaymentStatus } from '@shared/contracts'
import { Badge, Button, Card, ExternalButton, LinkButton, Notice, Spinner } from '@/components/ui'
import { useServerNow } from '@/hooks/useServerNow'
import { useJoinTarget } from '@/layouts/SiteLayout'
import { ApiError, api, isAbortError } from '@/lib/api'
import { formatDate, formatDateTime, formatINR, remainingUntil } from '@/lib/format'

type Load =
  | { s: 'loading' }
  | { s: 'no_session' }
  | { s: 'error'; message: string }
  | { s: 'ready'; data: MemberDashboard }

function statusBadge(m: MembershipSummary | null) {
  if (!m) return <Badge>No membership</Badge>
  if (m.status === 'active') return m.expiringSoon ? <Badge tone="alert">Expiring soon</Badge> : <Badge tone="active">Active</Badge>
  if (m.status === 'pending') return <Badge tone="alert">Pending</Badge>
  if (m.status === 'revoked') return <Badge tone="danger">Revoked</Badge>
  return <Badge tone="danger">Expired</Badge>
}

const paymentTone: Record<PaymentStatus, 'active' | 'danger' | 'alert' | 'neutral'> = {
  captured: 'active',
  failed: 'danger',
  refunded: 'neutral',
  partially_refunded: 'neutral',
  disputed: 'alert',
}

const invitationCopy: Record<InvitationStatus, string> = {
  pending: 'Your invite is being prepared. If it doesn’t arrive shortly, we retry automatically.',
  sent: 'Your invite link was sent to your private chat with the bot. Check the bot conversation in Telegram.',
  failed: 'We couldn’t deliver your invite yet. Make sure you haven’t blocked the bot; we’ll keep retrying and support can resend it.',
  used: 'Your invite link has been used. You’re in the group.',
  revoked: 'The previous invite was revoked.',
  expired: 'The previous invite link expired. Send /join to the bot to get a new one if you still need access.',
}

export default function Member() {
  const [load, setLoad] = useState<Load>({ s: 'loading' })
  const { config, botUrl } = useJoinTarget()

  const fetchData = useCallback((signal?: AbortSignal) => {
    setLoad({ s: 'loading' })
    api
      .getDashboard(signal)
      .then((data) => setLoad({ s: 'ready', data }))
      .catch((err: unknown) => {
        if (isAbortError(err)) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) setLoad({ s: 'no_session' })
        else setLoad({ s: 'error', message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.' })
      })
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    fetchData(ctrl.signal)
    return () => ctrl.abort()
  }, [fetchData])

  const now = useServerNow(load.s === 'ready' ? load.data.serverTime : null)

  if (load.s === 'loading') return <div className="mx-auto max-w-4xl px-gutter-mobile py-16"><Spinner label="Loading your membership…" /></div>

  if (load.s === 'no_session' || load.s === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-gutter-mobile py-16">
        <Notice
          tone={load.s === 'error' ? 'error' : 'warning'}
          title={load.s === 'error' ? 'Couldn’t load your membership' : 'Open your member page from Telegram'}
          action={
            load.s === 'error' ? (
              <Button variant="secondary" onClick={() => fetchData()}><RefreshCw className="h-4 w-4" aria-hidden />Try again</Button>
            ) : botUrl ? (
              <ExternalButton href={botUrl.replace('start=join', 'start=status')} target="_blank"><Send className="h-4 w-4" aria-hidden />Open Telegram bot</ExternalButton>
            ) : undefined
          }
        >
          {load.s === 'error' ? load.message : 'For your security we identify you through the Telegram bot. Send /status to the bot to get a personal link to this page.'}
        </Notice>
      </div>
    )
  }

  const { data } = load
  const m = data.membership
  const left = m?.expiresAt && m.status === 'active' ? remainingUntil(m.expiresAt, now) : null

  return (
    <div className="mx-auto w-full max-w-5xl px-gutter-mobile py-10 lg:px-margin">
      <header className="mb-space-lg">
        <p className="font-label-badge text-label-badge uppercase tracking-wider text-outline">Member hub</p>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-lg md:text-headline-lg">
          {data.telegramFirstName ? `Welcome back, ${data.telegramFirstName}` : 'Your membership'}
        </h1>
        {data.telegramUsername && <p className="font-body-sm text-body-sm text-on-surface-variant">Linked Telegram account: @{data.telegramUsername}</p>}
      </header>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        <Card className="p-space-lg lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Membership status</h2>
            {statusBadge(m)}
          </div>
          {m && m.expiresAt ? (
            <>
              <dl className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <div>
                  <dt className="font-label-badge text-label-badge uppercase text-outline">{m.status === 'active' ? 'Access ends' : 'Ended'}</dt>
                  <dd className="mt-1 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface"><CalendarClock className="h-5 w-5 text-primary" aria-hidden />{formatDateTime(m.expiresAt)}</dd>
                </div>
                <div>
                  <dt className="font-label-badge text-label-badge uppercase text-outline">Time remaining</dt>
                  <dd className="mt-1 font-label-data-lg text-label-data-lg text-on-surface">
                    {left ? `${left.days}d ${left.hours}h ${left.minutes}m` : m.status === 'active' ? 'Expiring now' : '—'}
                  </dd>
                </div>
              </dl>
              {m.status === 'active' && m.expiringSoon && (
                <p className="mt-space-md font-body-sm text-body-sm text-[#F59E0B]">Your access ends soon. Renewing now adds {config.durationDays} days after your current expiry.</p>
              )}
            </>
          ) : (
            <p className="mt-space-md font-body-md text-body-md text-on-surface-variant">You don’t have an active membership yet.</p>
          )}
          <div className="mt-space-lg border-t border-outline-variant/20 pt-space-md">
            <LinkButton to="/checkout" size="lg">{m && m.status === 'active' ? 'Renew membership' : 'Get membership'} • {formatINR(config.priceInPaise)}</LinkButton>
            <p className="mt-2 font-disclaimer-legal text-disclaimer-legal text-outline">One-time payment for {config.durationDays} days. No auto-renewal.</p>
          </div>
        </Card>

        <Card className="p-space-lg">
          <h2 className="mb-space-sm flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface"><Send className="h-5 w-5 text-primary" aria-hidden />Telegram access</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{data.invitation ? invitationCopy[data.invitation.status] : 'Your invite appears here after your first verified payment.'}</p>
          <ol className="mt-space-md list-decimal space-y-2 pl-5 font-body-sm text-body-sm text-on-surface-variant">
            <li>Open your chat with the bot.</li>
            <li>Tap the invite link it sent you. Each link works once and expires quickly.</li>
            <li>Lost the link? Send /join to the bot.</li>
          </ol>
          {data.invitation?.sentAt && <p className="mt-3 font-disclaimer-legal text-disclaimer-legal text-outline">Last sent {formatDateTime(data.invitation.sentAt)}</p>}
        </Card>

        <Card className="p-space-lg lg:col-span-3">
          <h2 className="mb-space-md font-headline-sm text-headline-sm text-on-surface">Payment history</h2>
          {data.payments.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="text-outline">
                    <th scope="col" className="pb-2 font-label-badge text-label-badge uppercase">Date</th>
                    <th scope="col" className="pb-2 font-label-badge text-label-badge uppercase">Amount</th>
                    <th scope="col" className="pb-2 font-label-badge text-label-badge uppercase">Status</th>
                    <th scope="col" className="pb-2 font-label-badge text-label-badge uppercase">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-surface-container-low/60' : ''}>
                      <td className="px-2 py-2.5 text-on-surface">{formatDate(p.createdAt)}</td>
                      <td className="px-2 py-2.5 font-label-data-md text-label-data-md text-on-surface">{formatINR(p.amount)}</td>
                      <td className="px-2 py-2.5"><Badge tone={paymentTone[p.status]}>{p.status.replace('_', ' ')}</Badge></td>
                      <td className="px-2 py-2.5 font-label-data-md text-label-data-md text-on-surface-variant">…{p.referenceSuffix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-space-lg lg:col-span-3">
          <h2 className="mb-space-sm flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface"><LifeBuoy className="h-5 w-5 text-primary" aria-hidden />Account and support</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Your account is your Telegram identity; there’s no password. To get a new personal link, send /status to the bot.
            {config.supportEmail ? <> For payment questions, email <a className="text-primary underline underline-offset-2" href={`mailto:${config.supportEmail}`}>{config.supportEmail}</a> and quote the reference from the table above.</> : null}
          </p>
        </Card>
      </div>
    </div>
  )
}
