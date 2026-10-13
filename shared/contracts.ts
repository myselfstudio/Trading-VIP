/**
 * Single source of truth for the API contract between the React frontend,
 * the Vercel functions in /api, and (by name) the database enums.
 * Money is always integer paise. Dates are ISO-8601 strings produced by the server.
 */
import { z } from 'zod'

export const CURRENCY = 'INR' as const

const iso = z.iso.datetime({ offset: true })
const paise = z.number().int().nonnegative()

// ---------- Errors ----------
export const ApiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
})
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>

// ---------- Public config (display only; the server enforces price) ----------
export const PublicConfigSchema = z.object({
  priceInPaise: z.number().int().positive(),
  currency: z.literal(CURRENCY),
  durationDays: z.number().int().positive(),
  testMode: z.boolean(),
  telegramBotUsername: z.string(),
  supportEmail: z.string(),
})
export type PublicConfig = z.infer<typeof PublicConfigSchema>

// ---------- Membership ----------
export const MembershipStatusSchema = z.enum(['pending', 'active', 'expired', 'revoked'])
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>

export const MembershipSummarySchema = z.object({
  status: MembershipStatusSchema,
  startsAt: iso.nullable(),
  expiresAt: iso.nullable(),
  expiringSoon: z.boolean(),
})
export type MembershipSummary = z.infer<typeof MembershipSummarySchema>

// ---------- Signed link exchange / member session ----------
export const ValidateLinkRequestSchema = z.object({
  token: z.string().min(20).max(2048),
})
export type ValidateLinkRequest = z.infer<typeof ValidateLinkRequestSchema>

export const LinkSessionSchema = z.object({
  telegramFirstName: z.string().nullable(),
  isRenewal: z.boolean(),
  membership: MembershipSummarySchema.nullable(),
  serverTime: iso,
})
export type LinkSession = z.infer<typeof LinkSessionSchema>

// ---------- Orders / checkout ----------
export const CreateOrderResponseSchema = z.object({
  orderId: z.uuid(),
  razorpayOrderId: z.string(),
  amount: paise,
  currency: z.literal(CURRENCY),
  keyId: z.string(),
  testMode: z.boolean(),
})
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>

export const InvitationStatusSchema = z.enum(['pending', 'sent', 'failed', 'used', 'revoked', 'expired'])
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>

export const OrderStateSchema = z.enum([
  'pending_verification',
  'paid_invitation_pending',
  'success',
  'failed',
  'expired',
])
export type OrderState = z.infer<typeof OrderStateSchema>

export const OrderStatusResponseSchema = z.object({
  orderId: z.uuid(),
  state: OrderStateSchema,
  amount: paise,
  currency: z.literal(CURRENCY),
  membershipExpiresAt: iso.nullable(),
  invitationStatus: InvitationStatusSchema.nullable(),
  serverTime: iso,
})
export type OrderStatusResponse = z.infer<typeof OrderStatusResponseSchema>

// ---------- Member dashboard ----------
export const PaymentStatusSchema = z.enum(['captured', 'failed', 'refunded', 'partially_refunded', 'disputed'])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export const PaymentRecordSchema = z.object({
  id: z.uuid(),
  amount: paise,
  currency: z.literal(CURRENCY),
  status: PaymentStatusSchema,
  createdAt: iso,
  /** Last characters of the Razorpay payment id, for support lookups. */
  referenceSuffix: z.string(),
})
export type PaymentRecord = z.infer<typeof PaymentRecordSchema>

export const MemberDashboardSchema = z.object({
  telegramFirstName: z.string().nullable(),
  telegramUsername: z.string().nullable(),
  membership: MembershipSummarySchema.nullable(),
  invitation: z
    .object({ status: InvitationStatusSchema, createdAt: iso, sentAt: iso.nullable() })
    .nullable(),
  payments: z.array(PaymentRecordSchema),
  serverTime: iso,
})
export type MemberDashboard = z.infer<typeof MemberDashboardSchema>

// ---------- Admin ----------
export const AdminStatusFilterSchema = z.enum(['all', 'active', 'expiring', 'expired', 'pending'])
export type AdminStatusFilter = z.infer<typeof AdminStatusFilterSchema>

export const AdminSummarySchema = z.object({
  revenueInPaise: paise,
  activeCount: z.number().int().nonnegative(),
  expiringCount: z.number().int().nonnegative(),
  expiredCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  failedInvitationCount: z.number().int().nonnegative(),
  serverTime: iso,
})
export type AdminSummary = z.infer<typeof AdminSummarySchema>

export const AdminMemberRowSchema = z.object({
  id: z.uuid(),
  telegramUserId: z.string(),
  telegramUsername: z.string().nullable(),
  firstName: z.string().nullable(),
  status: MembershipStatusSchema,
  expiringSoon: z.boolean(),
  expiresAt: iso.nullable(),
  invitationStatus: InvitationStatusSchema.nullable(),
  totalPaidInPaise: paise,
  lastPaymentAt: iso.nullable(),
})
export type AdminMemberRow = z.infer<typeof AdminMemberRowSchema>

export const AdminMembersQuerySchema = z.object({
  status: AdminStatusFilterSchema.default('all'),
  q: z.string().trim().max(64).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})
export type AdminMembersQuery = z.infer<typeof AdminMembersQuerySchema>

export const AdminMembersResponseSchema = z.object({
  rows: z.array(AdminMemberRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
})
export type AdminMembersResponse = z.infer<typeof AdminMembersResponseSchema>

export const AdminPaymentRowSchema = z.object({
  id: z.uuid(),
  razorpayPaymentId: z.string(),
  razorpayOrderId: z.string(),
  amount: paise,
  currency: z.literal(CURRENCY),
  status: PaymentStatusSchema,
  createdAt: iso,
})
export type AdminPaymentRow = z.infer<typeof AdminPaymentRowSchema>

export const AdminInvitationRowSchema = z.object({
  id: z.uuid(),
  status: InvitationStatusSchema,
  attempts: z.number().int().nonnegative(),
  errorCode: z.string().nullable(),
  createdAt: iso,
  sentAt: iso.nullable(),
})
export type AdminInvitationRow = z.infer<typeof AdminInvitationRowSchema>

export const AdminMemberDetailSchema = z.object({
  member: AdminMemberRowSchema,
  payments: z.array(AdminPaymentRowSchema),
  invitations: z.array(AdminInvitationRowSchema),
})
export type AdminMemberDetail = z.infer<typeof AdminMemberDetailSchema>

export const RetryInvitationRequestSchema = z.object({ memberId: z.uuid() })
export type RetryInvitationRequest = z.infer<typeof RetryInvitationRequestSchema>

export const RetryInvitationResponseSchema = z.object({
  ok: z.literal(true),
  invitationStatus: InvitationStatusSchema,
})
export type RetryInvitationResponse = z.infer<typeof RetryInvitationResponseSchema>
