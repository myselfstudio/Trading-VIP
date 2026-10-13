import { useEffect, useState } from 'react'
import type { PublicConfig } from '@shared/contracts'
import { api } from '@/lib/api'

/** Display-only fallback so the marketing page renders if the API is unreachable. The server still enforces price. */
export const FALLBACK_CONFIG: PublicConfig = {
  priceInPaise: 200000,
  currency: 'INR',
  durationDays: 30,
  testMode: false,
  telegramBotUsername: '',
  supportEmail: '',
}

let cached: Promise<PublicConfig> | null = null

export function usePublicConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    if (!cached) cached = api.getPublicConfig()
    cached
      .then((c) => alive && setConfig(c))
      .catch(() => {
        cached = null
        if (alive) setFailed(true)
      })
    return () => {
      alive = false
    }
  }, [])

  return { config: config ?? FALLBACK_CONFIG, loaded: config !== null, failed }
}
