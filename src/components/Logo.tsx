import { useId } from 'react'

/** Inline brand mark (the Stitch export referenced a hosted image that can expire). */
export function Logo({ size = 32 }: { size?: number }) {
  const gid = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Trading VIP">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a078ff" />
          <stop offset="100%" stopColor="#6d3bd7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gid})`} />
      <path d="M8 21l5-6 4 3 7-9" fill="none" stroke="#f8fafc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="9" r="2" fill="#4edea3" />
    </svg>
  )
}
