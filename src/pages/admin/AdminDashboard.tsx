import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react'
import type {
  AdminMemberDetail,
  AdminMemberRow,
  AdminMembersResponse,
  AdminStatusFilter,
  AdminSummary,
} from '@shared/contracts'
import { Badge, Button, Card, Notice, Spinner } from '@/components/ui'
import { ApiError, adminApi, isAbortError } from '@/lib/api'
import { formatDate, formatDateTime, formatINR } from '@/lib/format'
import { getSupabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

const PAGE_SIZE = 25
const filters: Array<{ id: AdminStatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'expiring', label: 'Expiring (5 days)' },
  { id: 'expired', label: 'Expired' },
  { id: 'pending', label: 'Pending' },
]

function memberBadge(m: AdminMemberRow) {
  if (m.status === 'active') return m.expiringSoon ? <Badge tone="alert">Expiring</Badge> : <Badge tone="active">Active</Badge>
  if (m.status === 'pending') return <Badge tone="alert">Pending</Badge>
  if (m.status === 'revoked') return <Badge tone="danger">Revoked</Badge>
  return <Badge tone="danger">Expired</Badge>
}

function invitationBadge(s: AdminMemberRow['invitationStatus']) {
  if (!s) return <span className="text-outline">—</span>
  return <Badge tone={s === 'failed' ? 'danger' : s === 'used' || s === 'sent' ? 'active' : 'neutral'}>{s}</Badge>
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-space-md">
      <p className="font-label-badge text-label-badge uppercase tracking-wider text-outline">{label}</p>
      <p className={cn('mt-1 font-headline-md text-headline-md font-bold tracking-tight', tone ?? 'text-on-surface')}>{value}</p>
    </Card>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [data, setData] = useState<AdminMembersResponse | null>(null)
  const [status, setStatus] = useState<AdminStatusFilter>('all')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminMemberRow | null>(null)
  const [reload, setReload] = useState(0)

  const handleAuth = useCallback(
    async (err: unknown): Promise<boolean> => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        await getSupabase()?.auth.signOut()
        navigate(`/admin/login${err.status === 403 ? '?denied=1' : ''}`, { replace: true })
        return true
      }
      return false
    },
    [navigate],
  )

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(search.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    const ctrl = new AbortController()
    adminApi.summary(ctrl.signal).then(setSummary).catch(async (e: unknown) => {
      if (isAbortError(e) || (await handleAuth(e))) return
    })
    return () => ctrl.abort()
  }, [reload, handleAuth])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    adminApi
      .members({ status, q: q || undefined, page, pageSize: PAGE_SIZE }, ctrl.signal)
      .then((r) => {
        setData(r)
        setError(null)
        setLoading(false)
      })
      .catch(async (e: unknown) => {
        if (isAbortError(e) || (await handleAuth(e))) return
        setError(e instanceof ApiError ? e.message : 'Could not load members.')
        setLoading(false)
      })
    return () => ctrl.abort()
  }, [status, q, page, reload, handleAuth])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="mx-auto w-full max-w-7xl px-gutter-mobile py-8 lg:px-margin">
      <div className="mb-space-lg flex items-end justify-between gap-3">
        <div>
          <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">Memberships</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Figures come from verified payment records.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setReload((n) => n + 1)}><RefreshCw className="h-4 w-4" aria-hidden />Refresh</Button>
      </div>

      <section aria-label="Key metrics" className="mb-space-lg grid grid-cols-2 gap-space-md md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Verified revenue" value={summary ? formatINR(summary.revenueInPaise) : '—'} tone="text-primary" />
        <Metric label="Active" value={summary ? String(summary.activeCount) : '—'} tone="text-secondary" />
        <Metric label="Expiring ≤5d" value={summary ? String(summary.expiringCount) : '—'} tone="text-[#F59E0B]" />
        <Metric label="Expired" value={summary ? String(summary.expiredCount) : '—'} />
        <Metric label="Pending" value={summary ? String(summary.pendingCount) : '—'} />
        <Metric label="Failed invites" value={summary ? String(summary.failedInvitationCount) : '—'} tone={summary && summary.failedInvitationCount > 0 ? 'text-error' : undefined} />
      </section>

      <div className="mb-space-md flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={status === f.id}
              onClick={() => {
                setStatus(f.id)
                setPage(1)
              }}
              className={cn('rounded-full border px-3 py-1.5 font-label-data-md text-label-data-md transition-colors', status === f.id ? 'border-primary/50 bg-primary/15 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface')}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, @username or ID"
            aria-label="Search members"
            maxLength={64}
            className="w-full rounded-lg bg-surface-container-lowest py-2.5 pl-9 pr-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {error && <div className="mb-space-md"><Notice tone="error" title="Couldn’t load members">{error}</Notice></div>}

      <Card className="overflow-hidden rounded-xl">
        {loading && !data ? (
          <Spinner label="Loading members…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left font-body-sm text-body-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 text-outline">
                  {['Member', 'Status', 'Expires', 'Invitation', 'Total paid', ''].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-label-badge text-label-badge uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={cn(loading && 'opacity-60')}>
                {data?.rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No members match these filters.</td></tr>
                )}
                {data?.rows.map((m, i) => (
                  <tr key={m.id} className={cn('border-b border-white/5 transition-colors hover:bg-[rgba(139,92,246,0.06)]', i % 2 === 0 ? 'bg-surface-container-low/60' : '')}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-on-surface">{m.firstName ?? 'Unknown'}</div>
                      <div className="font-label-data-md text-label-data-md text-on-surface-variant">{m.telegramUsername ? `@${m.telegramUsername}` : 'no username'} · {m.telegramUserId}</div>
                    </td>
                    <td className="px-4 py-3">{memberBadge(m)}</td>
                    <td className="px-4 py-3 text-on-surface">{m.expiresAt ? formatDate(m.expiresAt) : '—'}</td>
                    <td className="px-4 py-3">{invitationBadge(m.invitationStatus)}</td>
                    <td className="px-4 py-3 font-label-data-md text-label-data-md text-on-surface">{formatINR(m.totalPaidInPaise)}</td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelected(m)}>Details</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-outline-variant/20 px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
          <span>{data ? `${data.total} member${data.total === 1 ? '' : 's'}` : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" aria-hidden /></Button>
            <span className="font-label-data-md text-label-data-md">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" aria-hidden /></Button>
          </div>
        </div>
      </Card>

      {selected && <MemberDrawer member={selected} onClose={() => setSelected(null)} onChanged={() => setReload((n) => n + 1)} onAuthError={handleAuth} />}
    </div>
  )
}

function MemberDrawer({
  member,
  onClose,
  onChanged,
  onAuthError,
}: {
  member: AdminMemberRow
  onClose: () => void
  onChanged: () => void
  onAuthError: (e: unknown) => Promise<boolean>
}) {
  const [detail, setDetail] = useState<AdminMemberDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setDetail(null)
    adminApi.memberDetail(member.id, ctrl.signal).then(setDetail).catch(async (e: unknown) => {
      if (isAbortError(e) || (await onAuthError(e))) return
      setError(e instanceof ApiError ? e.message : 'Could not load details.')
    })
    return () => ctrl.abort()
  }, [member.id, version, onAuthError])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const current = detail?.member ?? member
  const canRetry = current.invitationStatus === 'failed'

  const retry = async () => {
    setRetrying(true)
    setMessage(null)
    try {
      const r = await adminApi.retryInvitation(member.id)
      setMessage(`Retry finished: invitation is now “${r.invitationStatus}”. Membership expiry was not changed.`)
      setVersion((v) => v + 1)
      onChanged()
    } catch (e) {
      if (await onAuthError(e)) return
      setMessage(e instanceof ApiError ? e.message : 'Retry failed.')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${member.firstName ?? 'member'}`}
        className="h-full w-full max-w-lg overflow-y-auto border-l border-primary/30 bg-surface-container p-space-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-space-md flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{member.firstName ?? 'Unknown'}</h2>
            <p className="font-label-data-md text-label-data-md text-on-surface-variant">{member.telegramUsername ? `@${member.telegramUsername} · ` : ''}{member.telegramUserId}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X className="h-4 w-4" aria-hidden /></Button>
        </div>
        <div className="mb-space-md flex gap-2">{memberBadge(current)}{invitationBadge(current.invitationStatus)}</div>

        {canRetry && (
          <div className="mb-space-md">
            <Button onClick={retry} loading={retrying}>Retry invitation delivery</Button>
            <p className="mt-2 font-disclaimer-legal text-disclaimer-legal text-outline">Sends a fresh single-use link. It never extends the membership.</p>
          </div>
        )}
        {message && <p role="status" className="mb-space-md font-body-sm text-body-sm text-on-surface-variant">{message}</p>}
        {error && <Notice tone="error" title="Couldn’t load details">{error}</Notice>}
        {!detail && !error && <Spinner />}

        {detail && (
          <>
            <h3 className="mb-2 mt-space-md font-label-badge text-label-badge uppercase tracking-wider text-outline">Payments</h3>
            {detail.payments.length === 0 ? <p className="font-body-sm text-body-sm text-on-surface-variant">No payments.</p> : (
              <ul className="space-y-2">
                {detail.payments.map((p) => (
                  <li key={p.id} className="rounded-lg bg-surface-container-lowest p-3">
                    <div className="flex items-center justify-between"><span className="font-label-data-md text-label-data-md text-on-surface">{formatINR(p.amount)}</span><Badge tone={p.status === 'captured' ? 'active' : p.status === 'failed' ? 'danger' : 'alert'}>{p.status.replace('_', ' ')}</Badge></div>
                    <p className="mt-1 break-all font-label-data-md text-label-data-md text-on-surface-variant">{p.razorpayPaymentId} · {p.razorpayOrderId}</p>
                    <p className="font-disclaimer-legal text-disclaimer-legal text-outline">{formatDateTime(p.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="mb-2 mt-space-md font-label-badge text-label-badge uppercase tracking-wider text-outline">Invitations</h3>
            {detail.invitations.length === 0 ? <p className="font-body-sm text-body-sm text-on-surface-variant">No invitations.</p> : (
              <ul className="space-y-2">
                {detail.invitations.map((inv) => (
                  <li key={inv.id} className="rounded-lg bg-surface-container-lowest p-3">
                    <div className="flex items-center justify-between">{invitationBadge(inv.status)}<span className="font-label-data-md text-label-data-md text-on-surface-variant">{inv.attempts} attempt{inv.attempts === 1 ? '' : 's'}</span></div>
                    {inv.errorCode && <p className="mt-1 font-label-data-md text-label-data-md text-error">{inv.errorCode}</p>}
                    <p className="font-disclaimer-legal text-disclaimer-legal text-outline">Created {formatDateTime(inv.createdAt)}{inv.sentAt ? ` · sent ${formatDateTime(inv.sentAt)}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
