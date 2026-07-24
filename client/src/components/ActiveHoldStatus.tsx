import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCountdown } from '@/hooks/useCountdown'
import type { HoldBatch } from '@/state/seatReducer'

interface ActiveHoldStatusProps {
  activeHold: HoldBatch
}

/**
 * @description Shows a live mm:ss countdown to the active hold's expiry. Violet by
 * default — this is where "your hold" is actually visible to the user (the seat grid
 * itself never renders this state, since holding navigates straight to /checkout) —
 * switching to amber once the server has flagged it as expiring soon.
 */
export const ActiveHoldStatus = ({ activeHold }: ActiveHoldStatusProps) => {
  const { formattedTime: countdown } = useCountdown(activeHold.expiresAt)

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border px-3 py-2',
        activeHold.isExpiringSoon
          ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100'
          : 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-100',
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <Clock className="size-4" />
        {activeHold.isExpiringSoon ? 'Expiring soon' : 'Hold active'}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums">{countdown}</span>
    </div>
  )
}
