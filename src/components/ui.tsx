import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

/* ---------- Buttons (Stitch: primary VIP gradient, secondary, ghost) ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-label-data-md text-label-data-md font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none'
const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-fixed shadow-[0_0_24px_rgba(160,120,255,0.4)] hover:shadow-[0_0_36px_rgba(160,120,255,0.6)]',
  secondary:
    'bg-surface-container-high/80 hover:bg-surface-bright text-on-surface border border-outline-variant/30 backdrop-blur-md',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  danger: 'bg-error text-on-error hover:opacity-90',
}
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-4 py-2.5 rounded-lg',
  lg: 'px-6 py-3.5 rounded-xl font-label-data-lg text-label-data-lg',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string): string {
  return cn(base, variants[variant], sizes[size], extra)
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button {...rest} disabled={rest.disabled || loading} className={buttonClass(variant, size, className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link {...rest} className={buttonClass(variant, size, className)} />
}

export function ExternalButton({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size }) {
  return <a rel="noopener noreferrer" {...rest} className={buttonClass(variant, size, className)} />
}

/* ---------- Badges (pill, Space Grotesk, per design system) ---------- */
type Tone = 'active' | 'alert' | 'danger' | 'vip' | 'neutral'
const tones: Record<Tone, string> = {
  active: 'bg-[rgba(16,185,129,0.12)] text-[#10B981] border-[rgba(16,185,129,0.3)]',
  alert: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444] border-[rgba(239,68,68,0.3)]',
  vip: 'bg-[rgba(139,92,246,0.15)] text-[#A855F7] border-[rgba(139,92,246,0.4)]',
  neutral: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-label-badge text-label-badge uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ---------- Cards (glass layer 1) ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-outline-variant/30 bg-surface-container/80 backdrop-blur-xl', className)}>
      {children}
    </div>
  )
}

/* ---------- Notices ---------- */
type NoticeTone = 'info' | 'success' | 'warning' | 'error'
const noticeStyles: Record<NoticeTone, { box: string; icon: ReactNode }> = {
  info: { box: 'bg-surface-container-high text-on-surface-variant', icon: <Info className="h-5 w-5 text-primary" aria-hidden /> },
  success: { box: 'bg-secondary/10 text-on-surface', icon: <CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden /> },
  warning: { box: 'bg-[rgba(245,158,11,0.1)] text-on-surface', icon: <TriangleAlert className="h-5 w-5 text-[#F59E0B]" aria-hidden /> },
  error: { box: 'bg-error-container/30 text-on-error-container', icon: <AlertCircle className="h-5 w-5 text-error" aria-hidden /> },
}

export function Notice({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: NoticeTone
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  const s = noticeStyles[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex flex-col gap-4 rounded-xl p-space-md sm:flex-row sm:items-center sm:justify-between', s.box)}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{s.icon}</span>
        <div>
          <p className="font-label-data-lg text-label-data-lg">{title}</p>
          {children && <div className="mt-1 font-body-sm text-body-sm opacity-90">{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-on-surface-variant" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
      <span className="font-body-sm text-body-sm">{label ?? 'Loading…'}</span>
    </div>
  )
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  badge,
  title,
  lead,
  align = 'left',
}: {
  badge: string
  title: string
  lead?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={cn('mb-12 flex max-w-2xl flex-col', align === 'center' ? 'mx-auto items-center text-center' : 'items-start')}>
      <Badge tone="vip" className="mb-3">
        {badge}
      </Badge>
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight md:font-headline-lg md:text-headline-lg">
        {title}
      </h2>
      {lead && <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{lead}</p>}
    </div>
  )
}
