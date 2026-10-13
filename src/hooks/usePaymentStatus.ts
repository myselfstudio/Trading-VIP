import { useCallback, useEffect, useState } from 'react'
import type { OrderStatusResponse } from '@shared/contracts'
import { ApiError, api, isAbortError } from '@/lib/api'

const MAX_POLLS = 40
const MAX_DURATION_MS = 3 * 60_000

export type PollPhase = 'polling' | 'settled' | 'timeout' | 'error'

/**
 * Polls the server for the verified state of one order. The URL only carries an order id;
 * the server checks that the signed-in member owns it. Nothing from the browser is proof of payment.
 */
export function usePaymentStatus(orderId: string | null) {
  const [status, setStatus] = useState<OrderStatusResponse | null>(null)
  const [phase, setPhase] = useState<PollPhase>('polling')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!orderId) return
    let stopped = false
    let timer: number | undefined
    const ctrl = new AbortController()
    const started = Date.now()
    let polls = 0
    setPhase('polling')
    setError(null)

    const tick = async () => {
      polls += 1
      try {
        const s = await api.getOrderStatus(orderId, ctrl.signal)
        if (stopped) return
        setStatus(s)
        setError(null)
        if (s.state === 'success' || s.state === 'failed' || s.state === 'expired') {
          setPhase('settled')
          return
        }
      } catch (err) {
        if (stopped || isAbortError(err)) return
        if (err instanceof ApiError && [401, 403, 404].includes(err.status)) {
          setError(err.message)
          setPhase('error')
          return
        }
        setError(err instanceof ApiError ? err.message : 'Could not reach the server.')
      }
      if (Date.now() - started > MAX_DURATION_MS || polls >= MAX_POLLS) {
        setPhase('timeout')
        return
      }
      timer = window.setTimeout(tick, Math.min(3000 + polls * 500, 8000))
    }
    void tick()

    return () => {
      stopped = true
      ctrl.abort()
      window.clearTimeout(timer)
    }
  }, [orderId, attempt])

  const restart = useCallback(() => setAttempt((a) => a + 1), [])
  return { status, phase, error, restart }
}
