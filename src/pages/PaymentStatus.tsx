import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { CheckCircle2, Circle, Loader2, Send, XCircle } from 'lucide-react'
import { Badge, Button, Card, ExternalButton, LinkButton, Notice } from '@/components/ui'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import { useJoinTarget } from '@/layouts/SiteLayout'
import { formatDate, formatINR } from '@/lib/format'
import { cn } from '@/lib/cn'

type StepState = 'done' | 'active' | 'todo' | 'failed'

function Step({ state, title, detail }: { state: StepState; title: string; detail: string }) {
  const icon =
    state === 'done' ? <CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden /> :
    state === 'active' ? <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden /> :
    state === 'failed' ? <XCircle className="h-5 w-5 text-error" aria-hidden /> :
    <Circle className="h-5 w-5 text-outline" aria-hidden />
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className={cn('font-label-data-lg text-label-data-lg', state === 'todo' ? 'text-outline' : 'text-on-surface')}>{title}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{detail}</p>
      </div>
    </li>
  )
}

export default function PaymentStatus() {
  const [params] = useSearchParams()
  const parsed = z.uuid().safeParse(params.get('order'))
  const orderId = parsed.success ? parsed.data : null
  const { status, phase, error, restart } = usePaymentStatus(orderId)
  const { botUrl } = useJoinTarget()

  if (!orderId) {
    return (
      <div className="mx-auto max-w-2xl px-gutter-mobile py-16">
        <Notice tone="warning" title="No payment to check" action={<LinkButton to="/member" variant="secondary">Go to member hub</LinkButton>}>
          This page needs an order reference. Return to checkout from the Telegram bot, or open your member hub to see your membership.
        </Notice>
      </div>
    )
  }

  const state = status?.state ?? 'pending_verification'
  const verified = state === 'success' || state === 'paid_invitation_pending'
  const failed = state === 'failed' || state === 'expired'
  const timedOut = phase === 'timeout' && !verified && !failed

  return (
    <div className="mx-auto max-w-2xl px-gutter-mobile py-12">
      <Card className="p-space-lg shadow-xl">
        <div className="mb-space-lg flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone={state === 'success' ? 'active' : failed ? 'danger' : verified ? 'vip' : 'alert'} className="mb-3">
              {state === 'success' ? 'Verified' : failed ? 'Not completed' : verified ? 'Verified · invite pending' : 'Pending verification'}
            </Badge>
            <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">
              {state === 'success' ? 'You’re in. Check Telegram.' : failed ? 'Payment not completed' : verified ? 'Payment verified' : 'Verifying your payment'}
            </h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              {state === 'success' && status?.membershipExpiresAt
                ? `Your membership is active until ${formatDate(status.membershipExpiresAt)}.`
                : failed
                  ? state === 'expired' ? 'This payment attempt expired before it was paid. You have not been charged.' : 'The payment failed or was declined. If money left your account, your bank normally reverses it automatically.'
                  : 'Don’t close this page yet. We’re waiting for Razorpay to confirm your payment to our server.'}
            </p>
          </div>
          {status && <span className="font-label-data-lg text-label-data-lg text-on-surface">{formatINR(status.amount)}</span>}
        </div>

        {phase === 'error' ? (
          <Notice tone="error" title="We couldn’t load this payment" action={<LinkButton to="/member" variant="secondary">Member hub</LinkButton>}>
            {error ?? 'Open your member hub to check your membership.'}
          </Notice>
        ) : (
          <ol className="flex flex-col gap-5" aria-live="polite">
            <Step state={failed ? 'failed' : 'done'} title="Payment submitted" detail={failed ? 'The payment didn’t complete.' : 'You finished the Razorpay checkout.'} />
            <Step
              state={failed ? 'todo' : verified ? 'done' : 'active'}
              title="Verified by our server"
              detail={verified ? 'Razorpay confirmed the payment and your membership was activated.' : 'The confirmation usually arrives within seconds.'}
            />
            <Step
              state={state === 'success' ? 'done' : state === 'paid_invitation_pending' ? 'active' : 'todo'}
              title="Invite sent on Telegram"
              detail={state === 'success' ? 'The bot sent a single-use invite link to your private chat.' : state === 'paid_invitation_pending' ? 'Sending your invite… if this takes long we retry automatically.' : 'Sent right after verification.'}
            />
          </ol>
        )}

        {timedOut && (
          <div className="mt-space-lg">
            <Notice tone="warning" title="Still waiting for confirmation" action={<Button variant="secondary" onClick={restart}>Check again</Button>}>
              Confirmations can occasionally take a few minutes. You can safely leave: if the payment is confirmed, the bot will message you with your invite. If you were charged and nothing arrives within an hour, contact support with your payment reference.
            </Notice>
          </div>
        )}
        {phase === 'polling' && error && <p className="mt-4 font-body-sm text-body-sm text-[#F59E0B]">Having trouble reaching the server. Retrying…</p>}

        {verified && phase !== 'error' && (
          <div className="mt-space-lg flex flex-col gap-3 border-t border-outline-variant/20 pt-space-lg sm:flex-row">
            {botUrl && <ExternalButton href={botUrl.replace('?start=join', '')} target="_blank"><Send className="h-4 w-4" aria-hidden />Open Telegram</ExternalButton>}
            <LinkButton to="/member" variant="secondary">View membership</LinkButton>
          </div>
        )}
        {failed && (
          <div className="mt-space-lg border-t border-outline-variant/20 pt-space-lg">
            <p className="mb-3 font-body-sm text-body-sm text-on-surface-variant">To try again, send /join to the bot for a fresh checkout link.</p>
            {botUrl && <ExternalButton href={botUrl} target="_blank" variant="secondary"><Send className="h-4 w-4" aria-hidden />Open Telegram bot</ExternalButton>}
          </div>
        )}
      </Card>
      <p className="mt-4 text-center font-disclaimer-legal text-disclaimer-legal text-outline">
        This page shows only what our server has verified. A success message from your browser or bank app is not used as proof of payment.
      </p>
    </div>
  )
}
