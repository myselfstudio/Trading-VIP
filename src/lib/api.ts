import type { z } from 'zod'
import {
  AdminMemberDetailSchema,
  AdminMembersResponseSchema,
  AdminSummarySchema,
  ApiErrorSchema,
  CreateOrderResponseSchema,
  LinkSessionSchema,
  MemberDashboardSchema,
  OrderStatusResponseSchema,
  PublicConfigSchema,
  RetryInvitationResponseSchema,
  type AdminMembersQuery,
} from '@shared/contracts'
import { mockRequest } from './mock'

/** UI-only preview mode. Dead code in production builds (import.meta.env.DEV is false). */
export const isMock = import.meta.env.DEV && import.meta.env.VITE_UI_MOCK === 'true'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

type TokenProvider = () => Promise<string | null>
let adminTokenProvider: TokenProvider = async () => null
export function setAdminTokenProvider(fn: TokenProvider): void {
  adminTokenProvider = fn
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  admin?: boolean
  timeoutMs?: number
  signal?: AbortSignal
}

function parseWith<S extends z.ZodType>(schema: S, raw: unknown): z.infer<S> {
  const result = schema.safeParse(raw)
  if (!result.success) throw new ApiError(502, 'bad_response', 'The server sent an unexpected response. Please try again.')
  return result.data
}

async function request<S extends z.ZodType>(path: string, schema: S, opts: RequestOptions = {}): Promise<z.infer<S>> {
  const method = opts.method ?? 'GET'

  if (isMock) {
    await new Promise((r) => setTimeout(r, 250))
    let raw: unknown
    try {
      raw = await mockRequest(method, path, opts.body)
    } catch (e) {
      const m = e as { status?: number; code?: string; message?: string }
      throw new ApiError(m.status ?? 500, m.code ?? 'mock_error', m.message ?? 'Mock error')
    }
    return parseWith(schema, raw)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000)
  opts.signal?.addEventListener('abort', () => controller.abort(), { once: true })

  const headers: Record<string, string> = {
    Accept: 'application/json',
    // Custom header: forces a CORS preflight for cross-site callers (CSRF defence in depth).
    'X-Requested-With': 'trading-vip',
  }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.admin) {
    const token = await adminTokenProvider()
    if (!token) throw new ApiError(401, 'unauthenticated', 'Please sign in again.')
    headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (opts.signal?.aborted) throw err
    if (controller.signal.aborted) throw new ApiError(0, 'timeout', 'The request timed out. Check your connection and try again.')
    throw new ApiError(0, 'network', 'Network error. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }

  let json: unknown = null
  try {
    json = await res.json()
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const parsed = ApiErrorSchema.safeParse(json)
    throw new ApiError(
      res.status,
      parsed.success ? parsed.data.error.code : `http_${res.status}`,
      parsed.success ? parsed.data.error.message : 'Something went wrong. Please try again.',
    )
  }
  return parseWith(schema, json)
}

export const api = {
  getPublicConfig: (signal?: AbortSignal) => request('/api/public-config', PublicConfigSchema, { signal }),

  /** Exchanges the signed Telegram link token for a short-lived, httpOnly member session cookie. */
  validateLink: (token: string, signal?: AbortSignal) =>
    request('/api/membership/validate-link', LinkSessionSchema, { method: 'POST', body: { token }, signal }),

  getSession: (signal?: AbortSignal) => request('/api/membership/session', LinkSessionSchema, { signal }),

  createOrder: (signal?: AbortSignal) =>
    request('/api/razorpay/create-order', CreateOrderResponseSchema, { method: 'POST', body: {}, signal }),

  getOrderStatus: (orderId: string, signal?: AbortSignal) =>
    request(`/api/membership/status?orderId=${encodeURIComponent(orderId)}`, OrderStatusResponseSchema, { signal }),

  getDashboard: (signal?: AbortSignal) => request('/api/membership/status', MemberDashboardSchema, { signal }),
}

export const adminApi = {
  summary: (signal?: AbortSignal) => request('/api/admin/summary', AdminSummarySchema, { admin: true, signal }),

  members: (query: Partial<AdminMembersQuery>, signal?: AbortSignal) => {
    const qs = new URLSearchParams()
    if (query.status) qs.set('status', query.status)
    if (query.q) qs.set('q', query.q)
    if (query.page) qs.set('page', String(query.page))
    if (query.pageSize) qs.set('pageSize', String(query.pageSize))
    return request(`/api/admin/members?${qs.toString()}`, AdminMembersResponseSchema, { admin: true, signal })
  },

  memberDetail: (id: string, signal?: AbortSignal) =>
    request(`/api/admin/members?id=${encodeURIComponent(id)}`, AdminMemberDetailSchema, { admin: true, signal }),

  retryInvitation: (memberId: string, signal?: AbortSignal) =>
    request('/api/admin/retry-invitation', RetryInvitationResponseSchema, {
      method: 'POST',
      body: { memberId },
      admin: true,
      signal,
    }),
}
