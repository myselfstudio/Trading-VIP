/**
 * Local UI preview data. Only reachable when VITE_UI_MOCK=true in a dev server.
 * Mirrors the shapes in shared/contracts.ts. Never used in production builds.
 */
const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString()

class MockError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

let renewal = false
let polls = 0

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

function membership(now: number) {
  return { status: 'active', startsAt: iso(now - 25 * DAY), expiresAt: iso(now + 4 * DAY), expiringSoon: true }
}

function members(now: number) {
  const statuses = ['active', 'active', 'expired', 'pending', 'active', 'expired', 'active', 'revoked'] as const
  return Array.from({ length: 14 }, (_, i) => {
    const status = statuses[i % statuses.length]
    const offset = status === 'active' ? (i % 3 === 0 ? 3 : 20) : status === 'expired' ? -6 : 0
    return {
      id: uuid(100 + i),
      telegramUserId: String(700000000 + i * 1371),
      telegramUsername: i % 4 === 3 ? null : `trader_${i + 1}`,
      firstName: ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Sana', 'Vikram'][i % 7],
      status,
      expiringSoon: status === 'active' && offset <= 5,
      expiresAt: status === 'pending' ? null : iso(now + offset * DAY),
      invitationStatus: status === 'pending' ? 'failed' : status === 'active' ? 'used' : 'sent',
      totalPaidInPaise: status === 'pending' ? 0 : 200000 * (1 + (i % 3)),
      lastPaymentAt: status === 'pending' ? null : iso(now - (i + 2) * DAY),
    }
  })
}

export async function mockRequest(method: string, path: string, body: unknown): Promise<unknown> {
  const now = Date.now()
  const url = new URL(path, 'http://mock.local')
  const p = url.pathname

  if (p === '/api/public-config') {
    return {
      priceInPaise: 200000,
      currency: 'INR',
      durationDays: 30,
      testMode: true,
      telegramBotUsername: 'TradingVipDemoBot',
      supportEmail: 'support@example.com',
    }
  }

  if (p === '/api/membership/validate-link' && method === 'POST') {
    const token = (body as { token?: string }).token ?? ''
    if (token.startsWith('invalid')) throw new MockError(401, 'invalid_link', 'This link is invalid or has expired. Send /join to the bot for a new one.')
    renewal = token.includes('renew')
    return { telegramFirstName: 'Demo', isRenewal: renewal, membership: renewal ? membership(now) : null, serverTime: iso(now) }
  }

  if (p === '/api/membership/session') {
    return { telegramFirstName: 'Demo', isRenewal: renewal, membership: renewal ? membership(now) : null, serverTime: iso(now) }
  }

  if (p === '/api/razorpay/create-order' && method === 'POST') {
    polls = 0
    return { orderId: uuid(1), razorpayOrderId: 'order_MOCK', amount: 200000, currency: 'INR', keyId: 'rzp_test_mock', testMode: true }
  }

  if (p === '/api/membership/status') {
    const orderId = url.searchParams.get('orderId')
    if (orderId) {
      polls += 1
      const state = polls < 3 ? 'pending_verification' : polls < 5 ? 'paid_invitation_pending' : 'success'
      return {
        orderId,
        state,
        amount: 200000,
        currency: 'INR',
        membershipExpiresAt: state === 'pending_verification' ? null : iso(now + 30 * DAY),
        invitationStatus: state === 'success' ? 'sent' : state === 'paid_invitation_pending' ? 'pending' : null,
        serverTime: iso(now),
      }
    }
    return {
      telegramFirstName: 'Demo',
      telegramUsername: 'demo_trader',
      membership: membership(now),
      invitation: { status: 'used', createdAt: iso(now - 25 * DAY), sentAt: iso(now - 25 * DAY) },
      payments: [
        { id: uuid(11), amount: 200000, currency: 'INR', status: 'captured', createdAt: iso(now - 25 * DAY), referenceSuffix: 'a1B2c3' },
        { id: uuid(12), amount: 200000, currency: 'INR', status: 'captured', createdAt: iso(now - 55 * DAY), referenceSuffix: 'x9Y8z7' },
      ],
      serverTime: iso(now),
    }
  }

  if (p === '/api/admin/summary') {
    return {
      revenueInPaise: 4800000,
      activeCount: 18,
      expiringCount: 5,
      expiredCount: 9,
      pendingCount: 2,
      failedInvitationCount: 1,
      serverTime: iso(now),
    }
  }

  if (p === '/api/admin/members') {
    const all = members(now)
    const id = url.searchParams.get('id')
    if (id) {
      const member = all.find((m) => m.id === id) ?? all[0]
      return {
        member,
        payments: [
          { id: uuid(21), razorpayPaymentId: 'pay_MOCK0001', razorpayOrderId: 'order_MOCK0001', amount: 200000, currency: 'INR', status: 'captured', createdAt: iso(now - 12 * DAY) },
        ],
        invitations: [
          { id: uuid(31), status: member.invitationStatus, attempts: member.invitationStatus === 'failed' ? 3 : 1, errorCode: member.invitationStatus === 'failed' ? 'telegram_403_bot_blocked' : null, createdAt: iso(now - 12 * DAY), sentAt: member.invitationStatus === 'failed' ? null : iso(now - 12 * DAY) },
        ],
      }
    }
    const status = url.searchParams.get('status') ?? 'all'
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const filtered = all.filter((m) => {
      if (status === 'expiring' && !(m.status === 'active' && m.expiringSoon)) return false
      if (status !== 'all' && status !== 'expiring' && m.status !== status) return false
      return !q || `${m.firstName} ${m.telegramUsername ?? ''} ${m.telegramUserId}`.toLowerCase().includes(q)
    })
    return { rows: filtered, total: filtered.length, page: 1, pageSize: 25 }
  }

  if (p === '/api/admin/retry-invitation' && method === 'POST') return { ok: true, invitationStatus: 'sent' }

  throw new MockError(404, 'not_found', 'Not found')
}
