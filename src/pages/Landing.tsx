import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  CandlestickChart,
  CheckCircle2,
  ChevronDown,
  Eye,
  LineChart,
  Lock,
  Send,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import { RiskNotice } from '@/components/RiskNotice'
import { Badge, Card, ExternalButton, LinkButton, SectionHeading } from '@/components/ui'
import { useJoinTarget } from '@/layouts/SiteLayout'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/cn'

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const } }),
}

function JoinButton({ children, className, size = 'lg' }: { children: ReactNode; className?: string; size?: 'md' | 'lg' }) {
  const { botUrl } = useJoinTarget()
  return botUrl ? (
    <ExternalButton href={botUrl} target="_blank" size={size} className={className}>
      {children}
    </ExternalButton>
  ) : (
    <LinkButton to="/#pricing" size={size} className={className}>
      {children}
    </LinkButton>
  )
}

function Hero() {
  const { config } = useJoinTarget()
  const price = formatINR(config.priceInPaise)
  return (
    <section className="mx-auto max-w-7xl px-gutter-mobile pb-20 pt-12 lg:px-margin lg:pb-28 lg:pt-20">
      <div className="grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col items-start gap-space-md lg:col-span-7">
          <motion.div custom={0} variants={reveal} initial="hidden" animate="show">
            <Badge tone="neutral" className="bg-surface-container-high/90 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary-container" />
              Disciplined education • Systematic process • Risk first
            </Badge>
          </motion.div>
          <motion.h1
            custom={1}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mt-1 max-w-2xl font-headline-xl-mobile text-headline-xl-mobile tracking-tight text-on-surface sm:font-headline-xl sm:text-headline-xl"
          >
            Trade Smarter. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-on-surface via-primary to-primary-container bg-clip-text text-transparent">Learn With Discipline.</span>
          </motion.h1>
          <motion.p custom={2} variants={reveal} initial="hidden" animate="show" className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            Structured lessons on technical analysis, order-flow concepts, position sizing and trading psychology, delivered in a private
            Telegram community for people who want process over hype.
          </motion.p>
          <motion.div custom={3} variants={reveal} initial="hidden" animate="show" className="flex w-full flex-wrap items-center gap-space-md pt-2 sm:w-auto">
            <JoinButton className="group justify-between gap-4">
              <span className="flex items-center gap-2 font-semibold tracking-wide">
                Get VIP access
                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
              <span className="rounded-full bg-surface-container-lowest/40 px-2 py-0.5 font-label-badge text-label-badge">{price}</span>
            </JoinButton>
            <a
              href="#curriculum"
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-high/80 px-5 py-3.5 font-label-data-md text-label-data-md text-on-surface backdrop-blur-md transition-all hover:bg-surface-bright"
            >
              <Eye className="h-[18px] w-[18px] text-primary" aria-hidden />
              Explore membership
            </a>
          </motion.div>
          <motion.div custom={4} variants={reveal} initial="hidden" animate="show" className="mt-4 flex max-w-lg items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-low/70 px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-outline" aria-hidden />
            <span className="font-disclaimer-legal text-disclaimer-legal text-outline">
              Education only. No profit guarantees, no buy or sell calls, no investment advice.
            </span>
          </motion.div>
        </div>

        {/* Sample-lesson panel: replaces the Stitch live-signal mock so no price levels or targets look like recommendations. */}
        <motion.div custom={3} variants={reveal} initial="hidden" animate="show" className="relative mt-8 lg:col-span-5 lg:mt-0">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container/90 p-space-md shadow-[0_20px_50px_rgba(11,14,23,0.85)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-error/70" />
                <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                <span className="h-3 w-3 rounded-full bg-secondary/70" />
                <span className="ml-2 font-label-badge text-label-badge text-outline">SAMPLE LESSON</span>
              </div>
              <Badge tone="alert">Hypothetical</Badge>
            </div>

            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest/80 p-3">
              <div className="flex items-center justify-between font-label-data-md text-label-data-md text-on-surface-variant">
                <span className="flex items-center gap-1.5 font-semibold text-on-surface">
                  <CandlestickChart className="h-[18px] w-[18px] text-primary" aria-hidden />
                  Position-sizing worked example
                </span>
              </div>
              <svg className="h-32 w-full overflow-visible" viewBox="0 0 380 130" role="img" aria-label="Illustrative price path with a predefined invalidation level">
                <defs>
                  <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#a078ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#a078ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[30, 70, 105].map((y) => (
                  <line key={y} x1="0" x2="380" y1={y} y2={y} stroke="#32343f" strokeDasharray="3 3" strokeWidth="0.75" />
                ))}
                <line x1="0" x2="380" y1="112" y2="112" stroke="#ef4444" strokeOpacity="0.6" strokeDasharray="5 4" strokeWidth="1" />
                <text x="8" y="124" fill="#ef4444" fontSize="9" fontFamily="Space Grotesk">PREDEFINED INVALIDATION</text>
                <motion.path
                  d="M 10 95 Q 45 100, 70 85 T 130 90 T 180 55 T 225 65 T 270 38 T 320 28 T 370 24"
                  fill="none"
                  stroke="#d0bcff"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />
                <path d="M 10 95 Q 45 100, 70 85 T 130 90 T 180 55 T 225 65 T 270 38 T 320 28 T 370 24 L 370 110 L 10 110 Z" fill="url(#chartGrad)" />
              </svg>
              <div className="grid grid-cols-3 gap-2 border-t border-outline-variant/15 pt-2 font-label-data-md text-label-data-md">
                <div>
                  <div className="font-label-badge text-[10px] uppercase text-outline">Risk per idea</div>
                  <div className="font-semibold text-on-surface">1% of capital</div>
                </div>
                <div>
                  <div className="font-label-badge text-[10px] uppercase text-error">Invalidation</div>
                  <div className="font-semibold text-error">Set before entry</div>
                </div>
                <div>
                  <div className="font-label-badge text-[10px] uppercase text-secondary">Reward : risk</div>
                  <div className="font-semibold text-secondary">1 : 2 (example)</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-high/60 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container/20 text-primary">
                <Brain className="h-[18px] w-[18px]" aria-hidden />
              </div>
              <div>
                <span className="font-label-badge text-label-badge uppercase text-primary">Psychology protocol</span>
                <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                  “If it is not on the checklist, it is not a trade. Write the rules before the market opens, not during.”
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-surface-container-highest/90 px-4 py-2.5 shadow-xl backdrop-blur-md sm:-left-8">
            <ShieldCheck className="h-5 w-5 text-secondary" aria-hidden />
            <div>
              <div className="font-label-data-md text-label-data-md font-semibold text-on-surface">Illustration only</div>
              <div className="font-label-badge text-[10px] uppercase text-outline">Not a recommendation</div>
            </div>
          </div>
        </motion.div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-space-md border-t border-outline-variant/20 pt-8 sm:mt-20 md:grid-cols-4">
        {[
          { v: `${config.durationDays} days`, l: 'of access per payment', c: 'text-on-surface' },
          { v: '1 plan', l: 'No tiers, no upsells', c: 'text-primary' },
          { v: 'No auto-debit', l: 'You renew only when you choose', c: 'text-secondary' },
          { v: 'Education', l: 'No calls, no advice, no guarantees', c: 'text-on-surface' },
        ].map((s) => (
          <div key={s.v} className="flex flex-col">
            <dd className={cn('order-1 font-headline-md text-headline-md font-bold tracking-tight', s.c)}>{s.v}</dd>
            <dt className="order-2 font-body-sm text-body-sm text-on-surface-variant">{s.l}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

const pillars = [
  { icon: LineChart, title: 'Advanced market analysis', accent: 'primary', body: 'Multi-timeframe top-down frameworks, liquidity mapping, Fibonacci expansion arrays and anchored volume profile, taught as ways to read price rather than predict it.', foot: 'Frameworks: order flow, fair value gaps' },
  { icon: ShieldCheck, title: 'Quantitative risk management', accent: 'secondary', body: 'Position-sizing worksheets, reward-to-risk planning, drawdown guardrails and invalidation rules defined before any trade is taken.', foot: 'Example rule: a fixed, small risk per idea' },
  { icon: Brain, title: 'Trading psychology & discipline', accent: 'primary', body: 'Practical tactics against revenge trading and FOMO, with journal templates and daily debriefs that build consistent decision-making.', foot: 'Focus: calm execution, bias awareness' },
  { icon: Users, title: 'Live peer & mentor community', accent: 'tertiary', body: 'A private Telegram room for case-study discussion, chart reviews and weekend debriefs, plus an archive of past sessions.', foot: 'Interactive: discussions, chart reviews' },
] as const

const accentClasses = {
  primary: { icon: 'bg-primary/10 text-primary group-hover:bg-primary-container group-hover:text-on-primary-fixed', foot: 'text-primary', border: 'hover:border-primary/40' },
  secondary: { icon: 'bg-secondary/10 text-secondary group-hover:bg-secondary-container group-hover:text-on-secondary', foot: 'text-secondary', border: 'hover:border-secondary/40' },
  tertiary: { icon: 'bg-tertiary-container/10 text-tertiary group-hover:bg-tertiary-container group-hover:text-on-tertiary', foot: 'text-tertiary', border: 'hover:border-tertiary-container/40' },
}

function Curriculum() {
  return (
    <section id="curriculum" className="w-full scroll-mt-24 border-y border-outline-variant/20 bg-surface-container-lowest/60 py-20">
      <div className="mx-auto max-w-7xl px-gutter-mobile lg:px-margin">
        <SectionHeading badge="Curriculum" title="Four pillars that replace guesswork with process." lead="Each pillar is taught as a repeatable framework you can test, journal and refine on your own." />
        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2">
          {pillars.map((p, i) => {
            const a = accentClasses[p.accent]
            const Icon = p.icon
            return (
              <div key={p.title} className={cn('group flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-low/80 p-space-lg shadow-md backdrop-blur-md transition-all duration-300 hover:bg-surface-container', a.border)}>
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-all', a.icon)}>
                      <Icon className="h-[26px] w-[26px]" aria-hidden />
                    </div>
                    <span className="font-label-badge text-label-badge text-outline">PILLAR {String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mb-2 font-headline-sm text-headline-sm text-on-surface">{p.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{p.body}</p>
                </div>
                <div className={cn('mt-6 border-t border-outline-variant/15 pt-4 font-label-data-md text-label-data-md', a.foot)}>{p.foot}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Steps() {
  const { config } = useJoinTarget()
  const steps = [
    { n: '01', t: 'Start the Telegram bot', d: 'Open the bot and send /start. It links your Telegram account and sends you a personal checkout link.', note: 'Your link is tied to your account', icon: Send, tone: 'text-primary' },
    { n: '02', t: 'Pay with Razorpay', d: `Pay ${formatINR(config.priceInPaise)} for ${config.durationDays} days using UPI, cards or netbanking in Razorpay’s secure checkout.`, note: 'One payment, no auto-debit', icon: Lock, tone: 'text-secondary' },
    { n: '03', t: 'Receive your invite', d: 'After our server verifies the payment, the bot sends a single-use invite link to your private chat.', note: 'Usually within a minute', icon: Zap, tone: 'text-secondary' },
  ]
  return (
    <section className="mx-auto w-full max-w-7xl px-gutter-mobile py-20 lg:px-margin">
      <SectionHeading align="center" badge="How it works" title="Join in three steps" lead="Access is granted only after your payment is verified on our server." />
      <ol className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="flex flex-col items-start rounded-2xl border border-outline-variant/30 bg-surface-container/70 p-space-lg backdrop-blur-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-label-data-lg text-label-data-lg font-bold text-primary">{s.n}</div>
            <h3 className="mb-2 font-headline-sm text-headline-sm text-on-surface">{s.t}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{s.d}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 font-label-badge text-label-badge text-outline">
              <s.icon className={cn('h-4 w-4', s.tone)} aria-hidden />
              {s.note}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

const inclusions = [
  'Daily pre-market breakdowns and structural watchlists',
  'Educational trade reviews with the reasoning explained',
  'Weekly private live analysis sessions and voice debriefs',
  'Position-sizing and reward-to-risk worksheets',
  'Private 24/7 VIP Telegram discussion group',
  'Bot commands for membership status and renewal (/status, /join)',
]

function Pricing() {
  const { config } = useJoinTarget()
  return (
    <section id="pricing" className="relative w-full scroll-mt-24 bg-gradient-to-b from-transparent via-surface-container-lowest/80 to-transparent py-20">
      <div className="mx-auto max-w-4xl px-gutter-mobile lg:px-margin">
        <SectionHeading align="center" badge="Pricing" title="Invest in your discipline, not in promises." lead="One plan with everything included. No tiers, no contracts, no auto-renewal." />
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-surface-container/95 p-space-lg shadow-[0_16px_48px_rgba(160,120,255,0.25)] backdrop-blur-2xl sm:p-space-xl">
          <div className="absolute right-6 top-6 hidden sm:block">
            <Badge tone="vip" className="bg-primary-container text-on-primary-fixed shadow-[0_0_12px_rgba(160,120,255,0.5)]">One plan</Badge>
          </div>
          <div className="flex flex-col justify-between gap-6 border-b border-outline-variant/20 pb-8 md:flex-row md:items-end">
            <div>
              <div className="font-label-badge text-label-badge uppercase tracking-wider text-outline">Membership access</div>
              <h3 className="mt-1 font-headline-md text-headline-md font-bold text-on-surface md:font-headline-lg md:text-headline-lg">{config.durationDays}-day VIP pass</h3>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">One-time payment. Renew whenever you want; each renewal adds {config.durationDays} days.</p>
            </div>
            <div className="flex shrink-0 flex-col md:items-end">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface sm:font-headline-xl sm:text-headline-xl">{formatINR(config.priceInPaise)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/ {config.durationDays} days</span>
              </div>
              <span className="font-disclaimer-legal text-disclaimer-legal text-outline">Charged in INR</span>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 py-8 sm:grid-cols-2">
            {inclusions.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
                <span className="font-body-md text-body-md text-on-surface">{t}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-outline-variant/20 pt-6">
            <JoinButton className="w-full py-4 font-headline-sm text-headline-sm">Get VIP access • {formatINR(config.priceInPaise)}</JoinButton>
            <p className="mt-3 text-center font-disclaimer-legal text-disclaimer-legal text-outline">
              The button opens our Telegram bot, which sends your personal checkout link.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-outline-variant/15 pt-4 font-label-badge text-label-badge uppercase text-outline sm:justify-between">
            <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-secondary" aria-hidden />Checkout by Razorpay</span>
            <span className="flex items-center gap-1.5"><Send className="h-4 w-4 text-tertiary" aria-hidden />Invite via Telegram bot</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden />No auto-renewal</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const faqs: Array<{ q: string; a: ReactNode }> = [
  { q: 'How quickly do I get access after paying?', a: 'Usually within a minute. Razorpay confirms the payment to our server, the server verifies it, and the bot then sends a single-use invite link in your private chat. The checkout page itself never grants access.' },
  { q: 'Do you provide guaranteed returns or trading tips?', a: <><strong className="text-on-surface">No.</strong> Trading VIP is an educational community. We do not provide buy or sell calls, investment advice, portfolio management or any guarantee of profit. Examples are illustrative and results vary.</> },
  { q: 'Will I be charged again automatically?', a: 'No. One payment buys 30 days of access. Before it ends, the bot reminds you and you can renew from your member page or with /join. A renewal adds 30 days to whichever is later: your current expiry or the time of payment.' },
  { q: 'What happens when my 30 days end?', a: 'Your access lapses and the bot removes you from the private group. Removal is handled by a scheduled job, so it can happen some time after the exact expiry moment, not at the second. Renew any time to get a fresh invite link.' },
  { q: 'What skill level do I need?', a: 'The material suits intermediate beginners who know basic candlestick anatomy but want structure, and experienced traders who struggle with FOMO and position sizing.' },
  { q: 'Can I get a refund?', a: <>Refund eligibility is explained in our <Link className="text-primary underline underline-offset-2" to="/legal/refunds">refund policy</Link>. Please read it before paying.</> },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="mx-auto w-full max-w-4xl scroll-mt-24 px-gutter-mobile py-20 lg:px-margin">
      <SectionHeading align="center" badge="FAQ" title="Frequently asked questions" lead="Straight answers before you step inside the room." />
      <div className="flex flex-col gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <Card key={f.q} className="overflow-hidden rounded-xl bg-surface-container/80 backdrop-blur-none">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-container-high/50"
                >
                  <span className="font-headline-sm text-base font-semibold text-on-surface">{f.q}</span>
                  <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform', isOpen ? 'rotate-180 text-primary' : 'text-outline')} aria-hidden />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-panel-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 font-body-md text-body-md text-on-surface-variant">{f.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <Hero />
      <Curriculum />
      <Steps />
      <Pricing />
      <Faq />
      <div className="mx-auto w-full max-w-7xl px-gutter-mobile pb-12 lg:px-margin">
        <RiskNotice withLinks />
      </div>
    </MotionConfig>
  )
}
