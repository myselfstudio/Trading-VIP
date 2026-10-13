import { describe, expect, it } from 'vitest'
import { ApiErrorSchema, CreateOrderResponseSchema } from '../shared/contracts'
import { formatINR, previewRenewalExpiry, remainingUntil, telegramBotUrl } from '../src/lib/format'

const DAY = 86_400_000

describe('formatINR', () => {
  it('formats whole rupees without decimals and keeps paise otherwise', () => {
    expect(formatINR(200000)).toBe('₹2,000')
    expect(formatINR(169492)).toBe('₹1,694.92')
  })
})

describe('previewRenewalExpiry (mirrors server rule: later of current expiry or now, + duration)', () => {
  const now = Date.parse('2026-10-13T00:00:00Z')
  it('renewing before expiry extends from the current expiry', () => {
    const expiry = new Date(now + 4 * DAY).toISOString()
    expect(previewRenewalExpiry(expiry, now, 30)).toBe(new Date(now + 34 * DAY).toISOString())
  })
  it('renewing after expiry starts from now', () => {
    const expiry = new Date(now - 6 * DAY).toISOString()
    expect(previewRenewalExpiry(expiry, now, 30)).toBe(new Date(now + 30 * DAY).toISOString())
  })
  it('new member starts from now', () => {
    expect(previewRenewalExpiry(null, now, 30)).toBe(new Date(now + 30 * DAY).toISOString())
  })
})

describe('remainingUntil', () => {
  it('reports expired when the time has passed', () => {
    expect(remainingUntil('2026-01-01T00:00:00Z', Date.parse('2026-01-02T00:00:00Z')).expired).toBe(true)
  })
  it('splits days, hours and minutes', () => {
    const r = remainingUntil('2026-01-03T05:30:00Z', Date.parse('2026-01-01T00:00:00Z'))
    expect(r).toEqual({ expired: false, days: 2, hours: 5, minutes: 30 })
  })
})

describe('telegramBotUrl', () => {
  it('accepts valid usernames and rejects anything that could break out of the URL', () => {
    expect(telegramBotUrl('TradingVipBot')).toBe('https://t.me/TradingVipBot?start=join')
    expect(telegramBotUrl('bad/../name')).toBeNull()
    expect(telegramBotUrl('')).toBeNull()
  })
})

describe('contracts', () => {
  it('rejects an order response with a non-INR currency or fractional paise', () => {
    const base = { orderId: '00000000-0000-4000-8000-000000000001', razorpayOrderId: 'order_x', keyId: 'rzp_test_x', testMode: true }
    expect(CreateOrderResponseSchema.safeParse({ ...base, amount: 200000, currency: 'INR' }).success).toBe(true)
    expect(CreateOrderResponseSchema.safeParse({ ...base, amount: 200000, currency: 'USD' }).success).toBe(false)
    expect(CreateOrderResponseSchema.safeParse({ ...base, amount: 1999.5, currency: 'INR' }).success).toBe(false)
  })
  it('parses the standard error envelope', () => {
    expect(ApiErrorSchema.safeParse({ error: { code: 'x', message: 'y' } }).success).toBe(true)
    expect(ApiErrorSchema.safeParse({ message: 'y' }).success).toBe(false)
  })
})
