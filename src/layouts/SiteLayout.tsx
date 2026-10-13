import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, CircleHelp, Home, ShieldCheck, Tag } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Badge, ExternalButton, LinkButton } from '@/components/ui'
import { usePublicConfig } from '@/hooks/usePublicConfig'
import { formatINR, telegramBotUrl } from '@/lib/format'
import { cn } from '@/lib/cn'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

const navLink = 'rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface'

export function useJoinTarget() {
  const { config } = usePublicConfig()
  const bot = telegramBotUrl(config.telegramBotUsername)
  return { config, botUrl: bot }
}

export function SiteLayout() {
  const { config, botUrl } = useJoinTarget()
  const { pathname } = useLocation()
  const price = formatINR(config.priceInPaise)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <ScrollManager />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[550px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-60 h-[600px] w-[600px] rounded-full bg-tertiary-container/5 blur-[160px]" />
      </div>

      {config.testMode && (
        <div className="relative z-[60] bg-[rgba(245,158,11,0.15)] py-1 text-center font-label-badge text-label-badge uppercase tracking-wider text-[#F59E0B]">
          Test mode — payments are simulated and no real money is charged
        </div>
      )}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-primary/20 bg-surface-container-lowest/80 backdrop-blur-xl" style={config.testMode ? { top: 24 } : undefined}>
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-space-md px-gutter-mobile lg:px-margin">
          <div className="flex shrink-0 items-center gap-space-md">
            <Link to="/" className="flex items-center gap-space-sm" aria-label="Trading VIP home">
              <Logo />
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">TRADING VIP</span>
            </Link>
            <Badge className="hidden sm:inline-flex">Educational community</Badge>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-space-xs xl:flex">
            <NavLink to="/" end className={({ isActive }) => cn(navLink, isActive && 'bg-surface-container-high font-semibold text-primary')}>
              Home
            </NavLink>
            <Link to="/#curriculum" className={navLink}>Curriculum</Link>
            <Link to="/#pricing" className={navLink}>Pricing</Link>
            <Link to="/#faq" className={navLink}>FAQ</Link>
            <NavLink to="/member" className={({ isActive }) => cn(navLink, isActive && 'bg-surface-container-high font-semibold text-primary')}>
              Member hub
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-space-sm">
            {botUrl ? (
              <ExternalButton href={botUrl} target="_blank" className="hidden sm:inline-flex">
                Join VIP • {price}
              </ExternalButton>
            ) : (
              <LinkButton to="/#pricing" className="hidden sm:inline-flex">
                Join VIP • {price}
              </LinkButton>
            )}
          </div>
        </div>
      </header>

      <main className={cn('relative z-10 w-full', config.testMode ? 'pt-[104px]' : 'pt-20')}>
        <Outlet />
      </main>

      <footer className="relative z-10 mt-space-xl w-full border-t border-outline-variant/20 bg-surface-container-lowest pb-24 pt-space-xl xl:pb-space-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-lg px-gutter-mobile md:flex-row lg:px-margin">
          <div className="flex flex-col items-center gap-space-xs md:items-start">
            <div className="flex items-center gap-space-sm">
              <Logo size={24} />
              <span className="font-headline-sm text-headline-sm text-on-surface">TRADING VIP</span>
            </div>
            <p className="max-w-md text-center font-disclaimer-legal text-disclaimer-legal text-outline md:text-left">
              Trading education only. Trading carries significant risk of loss. Nothing here is investment advice.
            </p>
            {config.supportEmail && (
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href={`mailto:${config.supportEmail}`}>
                {config.supportEmail}
              </a>
            )}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-space-lg gap-y-2 font-body-sm text-body-sm text-on-surface-variant">
            <Link className="hover:text-primary" to="/">Home</Link>
            <Link className="hover:text-primary" to="/member">Member hub</Link>
            <Link className="hover:text-primary" to="/legal/terms">Terms</Link>
            <Link className="hover:text-primary" to="/legal/privacy">Privacy</Link>
            <Link className="hover:text-primary" to="/legal/refunds">Refunds</Link>
          </nav>
          <div className="text-center font-label-badge text-label-badge uppercase tracking-wider text-outline">
            © {new Date().getFullYear()} Trading VIP. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile bottom navigation (Stitch) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/30 bg-surface-container-lowest/95 px-gutter-mobile py-space-xs backdrop-blur-xl xl:hidden">
        <nav aria-label="Mobile" className="flex items-center justify-around">
          {[
            { to: '/', label: 'Home', icon: Home, active: pathname === '/' },
            { to: '/#curriculum', label: 'Learn', icon: BookOpen, active: false },
            { to: '/#pricing', label: 'Pricing', icon: Tag, active: false },
            { to: '/member', label: 'Member', icon: ShieldCheck, active: pathname.startsWith('/member') },
            { to: '/#faq', label: 'FAQ', icon: CircleHelp, active: false },
          ].map(({ to, label, icon: Icon, active }) => (
            <Link key={label} to={to} aria-current={active ? 'page' : undefined} className={cn('flex flex-col items-center py-1', active ? 'font-semibold text-primary' : 'text-on-surface-variant hover:text-on-surface')}>
              <Icon className="h-5 w-5" aria-hidden />
              <span className="mt-0.5 font-label-badge text-[10px] tracking-tight">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
