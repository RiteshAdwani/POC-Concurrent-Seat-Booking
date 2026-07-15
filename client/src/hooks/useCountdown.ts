import { useEffect, useState } from 'react'

export interface Countdown {
  remainingMs: number | null
  formattedTime: string
}

/**
 * @description Tracks the live remaining time until targetTimestamp, ticking once per
 * second. Returns both the raw remainingMs (null when there's no target) and a
 * ready-to-render mm:ss formattedTime, so callers can use whichever they need. Clamps
 * at 0 once the target passes rather than going negative.
 */
export const useCountdown = (targetTimestamp: number | null): Countdown => {
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    if (targetTimestamp === null) {
      return
    }

    /**
     * @description Recomputes the remaining time against the current clock. Only ever
     * called from a timer callback, never directly in the effect body — reading the
     * clock during render/effect-body execution would be an impure, non-idempotent read.
     */
    const tick = () => {
      setRemainingMs(Math.max(targetTimestamp - Date.now(), 0))
    }

    const immediateId = setTimeout(tick, 0)
    const intervalId = setInterval(tick, 1000)
    return () => {
      clearTimeout(immediateId)
      clearInterval(intervalId)
    }
  }, [targetTimestamp])

  const resolvedRemainingMs = targetTimestamp === null ? null : remainingMs

  if (resolvedRemainingMs === null) {
    return { remainingMs: null, formattedTime: '--:--' }
  }

  const totalSeconds = Math.ceil(resolvedRemainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return {
    remainingMs: resolvedRemainingMs,
    formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
  }
}
