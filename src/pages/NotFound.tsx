import { LinkButton } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-gutter-mobile py-24 text-center">
      <p className="font-label-badge text-label-badge uppercase tracking-wider text-outline">404</p>
      <h1 className="mt-2 font-headline-md text-headline-md text-on-surface">Page not found</h1>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">The page you’re looking for doesn’t exist or has moved.</p>
      <LinkButton to="/" className="mt-space-lg" variant="secondary">Back to home</LinkButton>
    </div>
  )
}
