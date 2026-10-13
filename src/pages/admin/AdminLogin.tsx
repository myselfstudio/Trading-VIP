import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Logo } from '@/components/Logo'
import { Button, Card, Notice } from '@/components/ui'
import { isMock } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})
type Values = z.infer<typeof schema>

const field = 'w-full rounded-lg bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface shadow-inner placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const supabase = getSupabase()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) })

  if (isMock) return <Navigate to="/admin" replace />

  const onSubmit = async (v: Values) => {
    setError(null)
    if (!supabase) return setError('Admin sign-in isn’t configured.')
    const { error: err } = await supabase.auth.signInWithPassword(v)
    if (err) return setError('Email or password is incorrect.') // never reveal which one
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-gutter-mobile py-12">
      <Card className="w-full max-w-md p-space-lg shadow-xl">
        <div className="mb-space-lg flex items-center gap-space-sm"><Logo /><h1 className="font-headline-sm text-headline-sm text-on-surface">Admin sign-in</h1></div>
        {params.get('denied') && <div className="mb-space-md"><Notice tone="error" title="Not authorised">This account doesn’t have admin access.</Notice></div>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-space-md">
          <div>
            <label htmlFor="email" className="mb-1.5 block font-label-data-md text-label-data-md text-on-surface">Email</label>
            <input id="email" type="email" autoComplete="username" className={field} aria-invalid={!!formState.errors.email} {...register('email')} />
            {formState.errors.email && <p role="alert" className="mt-1 font-body-sm text-body-sm text-error">{formState.errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block font-label-data-md text-label-data-md text-on-surface">Password</label>
            <input id="password" type="password" autoComplete="current-password" className={field} aria-invalid={!!formState.errors.password} {...register('password')} />
            {formState.errors.password && <p role="alert" className="mt-1 font-body-sm text-body-sm text-error">{formState.errors.password.message}</p>}
          </div>
          {error && <p role="alert" className="font-body-sm text-body-sm text-error">{error}</p>}
          <Button type="submit" size="lg" loading={formState.isSubmitting}>Sign in</Button>
        </form>
      </Card>
    </div>
  )
}
