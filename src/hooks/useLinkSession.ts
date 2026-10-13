import { useCallback, useEffect, useState } from 'react'
import type { LinkSession } from '@shared/contracts'
import { ApiError, api, isAbortError } from '@/lib/api'

export type LinkState =
  | { status: 'loading' }
  | { status: 'no_link' }
  | { status: 'invalid'; message: string }
  | { status: 'error'; message: string }
  | { status: 'ready'; session: LinkSession }

/**
 * With a token: exchanges the signed link for a member session cookie.
 * Without one: asks the server whether a valid session cookie already exists.
 */
export function useLinkSession(token: string | null) {
  const [state, setState] = useState<LinkState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setState({ status: 'loading' })
    const run = token ? api.validateLink(token, ctrl.signal) : api.getSession(ctrl.signal)
    run
      .then((session) => setState({ status: 'ready', session }))
      .catch((err: unknown) => {
        if (isAbortError(err)) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setState(token ? { status: 'invalid', message: err.message } : { status: 'no_link' })
        } else {
          setState({ status: 'error', message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.' })
        }
      })
    return () => ctrl.abort()
  }, [token, attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { state, retry }
}
