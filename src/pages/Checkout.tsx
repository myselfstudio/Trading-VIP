import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Banknote, CheckCircle2, Clock, CreditCard, Gavel, Lock, QrCode, Send, ShieldCheck } from 'lucide-react'
import type { CreateOrderResponse } from '@shared/contracts'
import { RiskNotice } from '@/components/RiskNotice'
import { Button, ExternalButton, Notice, Spinner } from '@/components/ui'
import { useLinkSession } from '@/hooks/useLinkSession'
import { useJoinTarget } from '@/layouts/SiteLayout'
import { ApiError, api, isMock } from '@/lib/api'
import { formatDate, formatINR, previewRenewalExpiry } from '@/lib/format'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { cn } from '@/lib/cn'

const ackSchema = z.object({
  ack: z.boolean().refine((v) => v === true, { message: 'Please confirm you have read and accept the points above.' }),
})
type AckForm = z.infer<typeof ackSchema>

type PayState =
  | { kind: 'idle' }
  | { kind: 'creating' }
  | { kind: 'open' }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string }
  | { kind: 'error'; message: string }

const perks = [
  { t: 'Private Telegram group', d: 'A single-use invite link is sent to you by the bot after payment is verified.' },
  { t: 'Daily pre-market analysis', d: 'Educational market breakdowns and structural watchlists.' },
  { t: 'Risk worksheets', d: 'Position-sizing and reward-to-risk templates for your own journal.' },
  { t: 'Live Q&A sessions', d: 'Periodic risk-management sessions with the community.' },
]

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  // Captured once so removing ?t= from the URL does not re-trigger link validation.
  const tokenRef = useRef(params.get('t'))
  const { state, retry } = useLinkSession(tokenRef.current)
  const { config, botUrl } = useJoinTarget()
  const [pay, setPay] = useState<PayState>({ kind: 'idle' })
  const orderRef = useRef<CreateOrderResponse | null>(null)
  const strippedRef = useRef(false)

  const { register, handleSubmit, formState } = useForm<AckForm>({
    resolver: zodResolver(ackSchema),
    defaultValues: { ack: false },
  })

  // Keep the signed token out of the address bar and browser history once it has been exchanged.
  useEffect(() => {
    if (state.status === 'ready' && tokenRef.current && !strippedRef.current) {
      strippedRef.current = true
      navigate('/checkout', { replace: true })
    }
  }, [state.status, navigate])

  const startPayment = async () => {
    setPay({ kind: 'creating' })
    try {
      const order = orderRef.current ?? (await api.createOrder())
      orderRef.current = order
      const statusUrl = `/payment/status?order=${encodeURIComponent(order.orderId)}`
      if (isMock) {
        navigate(statusUrl)
        return
      }
      await openRazorpayCheckout({
        keyId: order.keyId,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        description: `${config.durationDays}-day membership`,
        // The browser callback only moves to the status page; the server webhook alone grants access.
        onSubmitted: () => navigate(statusUrl),
        onDismissed: () => setPay({ kind: 'cancelled' }),
        onFailed: (message) => setPay({ kind: 'failed', message }),
      })
      setPay({ kind: 'open' })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setPay({ kind: 'error', message: 'Your checkout link has expired. Send /join to the bot for a new one.' })
      } else if (err instanceof ApiError) {
        setPay({ kind: 'error', message: err.message })
      } else {
        setPay({ kind: 'error', message: 'Could not load the payment window. Check your connection or ad blocker and try again.' })
      }
    }
  }

  if (state.status === 'loading') return <div className="mx-auto max-w-3xl px-gutter-mobile py-16"><Spinner label="Verifying your link…" /></div>

  if (state.status !== 'ready') {
    const title =
      state.status === 'no_link' ? 'Start from the Telegram bot' : state.status === 'invalid' ? 'This link can’t be used' : 'Couldn’t verify your link'
    const body =
      state.status === 'no_link'
        ? 'Checkout links are personal and are sent by our Telegram bot. Open the bot and send /join to get yours.'
        : state.message
    return (
      <div className="mx-auto max-w-3xl px-gutter-mobile py-16">
        <Notice
          tone={state.status === 'error' ? 'error' : 'warning'}
          title={title}
          action={
            state.status === 'error' ? (
              <Button variant="secondary" onClick={retry}>Try again</Button>
            ) : botUrl ? (
              <ExternalButton href={botUrl} target="_blank"><Send className="h-4 w-4" aria-hidden />Open Telegram bot</ExternalButton>
            ) : undefined
          }
        >
          {body}
        </Notice>
      </div>
    )
  }

  const { session } = state
  const amount = formatINR(config.priceInPaise)
  const serverNow = Date.parse(session.serverTime)
  const currentExpiry = session.membership?.status === 'active' ? session.membership.expiresAt : null
  const estimatedExpiry = previewRenewalExpiry(currentExpiry, serverNow, config.durationDays)
  const busy = pay.kind === 'creating' || pay.kind === 'open'

  return (
    <div className="mx-auto w-full max-w-7xl px-gutter-mobile pb-16 lg:px-margin">
      <nav aria-label="Progress" className="flex flex-col gap-space-sm pb-8 pt-6 md:flex-row md:items-center md:justify-between">
        <ol className="flex items-center gap-space-xs font-label-badge text-label-badge uppercase tracking-wider">
          <li className="flex items-center gap-1 font-semibold text-secondary"><CheckCircle2 className="h-4 w-4" aria-hidden />Plan</li>
          <li aria-hidden className="text-outline">/</li>
          <li aria-current="step" className="flex items-center gap-1 font-semibold text-primary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />Secure checkout</li>
          <li aria-hidden className="text-outline">/</li>
          <li className="text-outline">Telegram invite</li>
        </ol>
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 font-label-data-md text-label-data-md text-on-surface-variant">
          <Lock className="h-4 w-4 text-secondary" aria-hidden />Payments processed by Razorpay
        </span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12 lg:gap-space-xl">
        {/* LEFT: order summary */}
        <div className="flex flex-col gap-space-md lg:col-span-5">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-xl lg:p-space-lg">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="mb-4 flex items-start justify-between gap-space-sm">
              <div>
                <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">Trading VIP — {config.durationDays}-day pass</h1>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Educational community access. Not investment advice.</p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary"><ShieldCheck className="h-6 w-6" aria-hidden /></div>
            </div>

            <dl className="mb-space-md space-y-2 rounded-lg bg-surface-container-lowest p-space-sm font-body-sm text-body-sm">
              <div className="flex items-center justify-between"><dt className="flex items-center gap-1.5 font-medium text-on-surface-variant"><Clock className="h-4 w-4 text-secondary" aria-hidden />Duration</dt><dd className="font-label-data-md text-label-data-md text-on-surface">{config.durationDays} days</dd></div>
              <div className="flex items-center justify-between"><dt className="flex items-center gap-1.5 font-medium text-on-surface-variant"><Send className="h-4 w-4 text-primary" aria-hidden />Delivery</dt><dd className="font-label-data-md text-label-data-md text-on-surface">Private invite from the bot</dd></div>
              <div className="flex items-center justify-between"><dt className="flex items-center gap-1.5 font-medium text-on-surface-variant"><ShieldCheck className="h-4 w-4 text-tertiary" aria-hidden />Telegram account</dt><dd className="font-label-data-md text-label-data-md text-secondary">{session.telegramFirstName ?? 'Linked'} (verified)</dd></div>
            </dl>

            <div className="mb-space-lg space-y-3">
              <h2 className="font-label-badge text-label-badge uppercase tracking-wider text-outline">What’s included</h2>
              {perks.map((p) => (
                <div key={p.t} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary shadow-[0_0_12px_rgba(78,222,163,0.35)]"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /></div>
                  <div>
                    <p className="font-label-data-md text-label-data-md text-on-surface">{p.t}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 rounded-xl bg-surface-container-highest/60 p-space-md">
              {session.isRenewal && currentExpiry && (
                <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant"><span>Current access ends</span><span className="font-label-data-md text-label-data-md text-on-surface">{formatDate(currentExpiry)}</span></div>
              )}
              <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant"><span>{session.isRenewal ? 'Renewal' : 'Membership'} ({config.durationDays} days)</span><span className="font-label-data-md text-label-data-md text-on-surface">{amount}</span></div>
              <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant"><span>{session.isRenewal ? 'New expiry (estimate)' : 'Access ends (estimate)'}</span><span className="font-label-data-md text-label-data-md text-on-surface">{formatDate(estimatedExpiry)}</span></div>
              <div className="h-px bg-surface-container" />
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="block font-label-data-lg text-label-data-lg text-on-surface">Total payable now</span>
                  <span className="font-disclaimer-legal text-disclaimer-legal text-outline">One-time payment · no auto-renewal</span>
                </div>
                <div className="text-right">
                  <span className="font-headline-md text-headline-md font-bold text-primary">{formatINR(config.priceInPaise)}</span>
                  <span className="block font-label-badge text-label-badge uppercase text-on-surface-variant">INR</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-space-sm">
            <div className="mb-1 flex items-center gap-1.5 text-outline"><Gavel className="h-4 w-4" aria-hidden /><span className="font-label-badge text-label-badge uppercase tracking-wider">Educational material only</span></div>
            <p className="font-disclaimer-legal text-disclaimer-legal leading-relaxed text-outline">Trading VIP is an educational community. Nothing in the curriculum or live sessions is a buy or sell recommendation or investment advice.</p>
          </div>
        </div>

        {/* RIGHT: payment */}
        <div className="flex flex-col gap-space-md lg:col-span-7">
          {pay.kind === 'failed' && (
            <Notice tone="error" title="Payment didn’t go through" action={<Button variant="danger" onClick={() => setPay({ kind: 'idle' })}>Dismiss</Button>}>
              {pay.message} You can try again from the payment window or start a new attempt below.
            </Notice>
          )}
          {pay.kind === 'cancelled' && (
            <Notice tone="info" title="Checkout closed" action={<Button variant="secondary" onClick={() => setPay({ kind: 'idle' })}>Return to order</Button>}>
              You closed the payment window before finishing. Nothing was charged.
            </Notice>
          )}
          {pay.kind === 'error' && <Notice tone="error" title="Couldn’t start checkout">{pay.message}</Notice>}

          <form
            onSubmit={handleSubmit(startPayment)}
            noValidate
            className="flex flex-col gap-space-lg rounded-xl bg-surface-container-low p-space-md shadow-xl lg:p-space-lg"
          >
            <section aria-labelledby="who" className="flex flex-col gap-space-sm">
              <h2 id="who" className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 font-label-badge text-label-badge text-primary">1</span>
                Your Telegram account
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Your invite will go to the Telegram account that opened this link
                {session.telegramFirstName ? <> (<strong className="text-on-surface">{session.telegramFirstName}</strong>)</> : null}. It can’t be changed here.
                If this isn’t you, don’t pay: open the bot from your own account.
              </p>
            </section>

            <section aria-labelledby="how" className="flex flex-col gap-space-sm">
              <h2 id="how" className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 font-label-badge text-label-badge text-primary">2</span>
                Payment methods
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { i: QrCode, c: 'text-secondary', t: 'UPI', d: 'Google Pay, PhonePe, Paytm and other UPI apps' },
                  { i: CreditCard, c: 'text-primary', t: 'Cards', d: 'Credit and debit cards' },
                  { i: Banknote, c: 'text-tertiary', t: 'Netbanking', d: 'Supported Indian banks' },
                ].map(({ i: Icon, c, t, d }) => (
                  <div key={t} className="flex flex-col rounded-lg bg-surface-container-lowest p-3.5">
                    <Icon className={cn('mb-2 h-6 w-6', c)} aria-hidden />
                    <span className="font-label-data-md text-label-data-md font-semibold text-on-surface">{t}</span>
                    <span className="mt-1 font-disclaimer-legal text-disclaimer-legal text-on-surface-variant">{d}</span>
                  </div>
                ))}
              </div>
              <p className="font-disclaimer-legal text-disclaimer-legal text-outline">
                You’ll pick your method inside Razorpay’s secure window. We never see or store your card details.
              </p>
            </section>

            <section aria-labelledby="confirm" className="flex flex-col gap-space-sm">
              <h2 id="confirm" className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 font-label-badge text-label-badge text-primary">3</span>
                Confirm and pay
              </h2>
              <label className="group flex cursor-pointer items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-surface-container-high/40">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-outline-variant bg-surface-container-lowest accent-primary-container" aria-invalid={!!formState.errors.ack} {...register('ack')} />
                <span className="font-body-sm text-body-sm leading-snug text-on-surface-variant group-hover:text-on-surface">
                  I understand this is an <span className="font-medium text-on-surface">educational community</span>, not investment advice, and that trading can lose money.
                  I accept the <a className="text-primary underline underline-offset-2" href="/legal/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
                  <a className="text-primary underline underline-offset-2" href="/legal/refunds" target="_blank" rel="noreferrer">Refund policy</a>. Access is personal and non-transferable.
                </span>
              </label>
              {formState.errors.ack && <p role="alert" className="px-2.5 font-body-sm text-body-sm text-error">{formState.errors.ack.message}</p>}

              <Button type="submit" size="lg" loading={busy} className="w-full py-4 font-bold">
                {!busy && <Lock className="h-5 w-5" aria-hidden />}
                {pay.kind === 'creating' ? 'Preparing secure checkout…' : pay.kind === 'open' ? 'Payment window open' : `Pay ${amount}`}
              </Button>
              <p className="text-center font-disclaimer-legal text-disclaimer-legal text-outline">
                After paying you’ll land on a status page. Access starts only once our server verifies the payment.
              </p>
            </section>
          </form>
        </div>
      </div>

      <div className="mt-space-xl"><RiskNotice withLinks /></div>
    </div>
  )
}
