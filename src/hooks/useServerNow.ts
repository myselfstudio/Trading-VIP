import { useEffect, useState } from 'react'

/** A ticking "now" anchored to the server clock so a wrong device clock can't skew countdowns. */
export function useServerNow(serverTimeIso: string | null, intervalMs = 30_000): number {
  const offset = serverTimeIso ? Date.parse(serverTimeIso) - Date.now() : 0
  const [now, setNow] = useState(() => Date.now() + offset)
  useEffect(() => {
    setNow(Date.now() + offset)
    const id = window.setInterval(() => setNow(Date.now() + offset), intervalMs)
    return () => window.clearInterval(id)
  }, [offset, intervalMs])
  return now
}
