import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Badge, Button, Notice } from '@/components/ui'
import { isMock, setAdminTokenProvider } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'

/**
 * UX gate only. Every /api/admin/* endpoint re-checks the bearer token and the admin role on the server;
 * hiding this page is never treated as authorization.
 */
export default function AdminGuard() {
  const supabase = getSupabase()
  const navigate = useNavigate()
  const [ready, setReady] = useState(isMock)
  const [signedIn, setSignedIn] = useState(isMock)

  useEffect(() => {
    if (isMock || !supabase) return
    setAdminTokenProvider(async () => (await supabase.auth.getSession()).data.session?.access_token ?? null)
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSignedIn(!!data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session))
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  if (!isMock && !supabase) {
    return (
      <div className="mx-auto max-w-2xl px-gutter-mobile py-24">
        <Notice tone="error" title="Admin sign-in isn’t configured">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild.</Notice>
      </div>
    )
  }
  if (!ready) return null
  if (!signedIn) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-gutter-mobile lg:px-margin">
          <Link to="/admin" className="flex items-center gap-space-sm"><Logo size={28} /><span className="font-headline-sm text-headline-sm text-on-surface">Trading VIP</span><Badge tone="vip">Admin</Badge></Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase?.auth.signOut()
              navigate('/admin/login', { replace: true })
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />Sign out
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
