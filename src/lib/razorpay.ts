interface RazorpayFailure {
  error?: { code?: string; description?: string }
}

interface RazorpayOptions {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description: string
  theme?: { color?: string }
  modal?: { ondismiss?: () => void; confirm_close?: boolean }
  /** Intentionally ignores the browser payload: only the server webhook can confirm payment. */
  handler: () => void
}

interface RazorpayInstance {
  open(): void
  on(event: 'payment.failed', cb: (r: RazorpayFailure) => void): void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (loading) return loading
  loading = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = SCRIPT_SRC
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => {
      loading = null
      el.remove()
      reject(new Error('script_load_failed'))
    }
    document.head.appendChild(el)
  })
  return loading
}

export interface OpenCheckoutArgs {
  keyId: string
  razorpayOrderId: string
  amount: number
  currency: string
  description: string
  onSubmitted: () => void
  onDismissed: () => void
  onFailed: (message: string) => void
}

export async function openRazorpayCheckout(args: OpenCheckoutArgs): Promise<void> {
  await loadScript()
  if (!window.Razorpay) throw new Error('script_load_failed')
  const instance = new window.Razorpay({
    key: args.keyId,
    order_id: args.razorpayOrderId,
    amount: args.amount,
    currency: args.currency,
    name: 'Trading VIP',
    description: args.description,
    theme: { color: '#8B5CF6' },
    modal: { ondismiss: args.onDismissed, confirm_close: true },
    handler: args.onSubmitted,
  })
  instance.on('payment.failed', (r) => args.onFailed(r.error?.description ?? 'The payment could not be completed.'))
  instance.open()
}
