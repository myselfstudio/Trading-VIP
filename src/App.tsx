import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { SiteLayout } from '@/layouts/SiteLayout'
import Checkout from '@/pages/Checkout'
import Landing from '@/pages/Landing'
import Legal from '@/pages/Legal'
import Member from '@/pages/Member'
import NotFound from '@/pages/NotFound'
import PaymentStatus from '@/pages/PaymentStatus'

// Admin code (and the Supabase client) is split out so public visitors never download it.
const AdminGuard = lazy(() => import('@/pages/admin/AdminGuard'))
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Landing />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/status" element={<PaymentStatus />} />
          <Route path="member" element={<Member />} />
          <Route path="legal/:doc" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminGuard />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
