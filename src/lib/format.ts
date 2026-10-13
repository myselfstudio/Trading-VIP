const TZ = 'Asia/Kolkata'

export function formatINR(paise: number): string {
  const whole = paise % 100 === 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(
    new Date(iso),
  )
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
    timeZoneName: 'short',
  }).format(new Date(iso))
}

export interface Remaining {
  expired: boolean
  days: number
  hours: number
  minutes: number
}

export function remainingUntil(expiresIso: string, nowMs: number): Remaining {
  const diff = new Date(expiresIso).getTime() - nowMs
  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 }
  const minutesTotal = Math.floor(diff / 60000)
  return {
    expired: false,
    days: Math.floor(minutesTotal / 1440),
    hours: Math.floor((minutesTotal % 1440) / 60),
    minutes: minutesTotal % 60,
  }
}

const DAY_MS = 86_400_000

/** Preview only: the server computes the real expiry at activation. */
export function previewRenewalExpiry(currentExpiryIso: string | null, serverNowMs: number, durationDays: number): string {
  const base = currentExpiryIso ? Math.max(new Date(currentExpiryIso).getTime(), serverNowMs) : serverNowMs
  return new Date(base + durationDays * DAY_MS).toISOString()
}

/** Validates a Telegram bot username before it is used to build a t.me link. */
export function telegramBotUrl(username: string, startParam = 'join'): string | null {
  return /^[A-Za-z0-9_]{5,32}$/.test(username) ? `https://t.me/${username}?start=${startParam}` : null
}
