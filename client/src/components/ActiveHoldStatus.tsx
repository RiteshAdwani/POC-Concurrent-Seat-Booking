import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCountdown } from '@/hooks/useCountdown'
import type { HoldBatch } from '@/state/seatReducer'

interface ActiveHoldStatusProps {
  activeHold: HoldBatch
}

/**
 * @description Shows a live mm:ss countdown to the active hold's expiry, switching to
 * amber styling once the server has flagged it as expiring soon.
 */
export const ActiveHoldStatus = ({ activeHold }: ActiveHoldStatusProps) => {
  const { formattedTime: countdown } = useCountdown(activeHold.expiresAt)
  const seatCount = activeHold.seatIds.length

  return (
    <Badge
      variant="secondary"
      className={cn(
        'px-3 py-1 text-sm',
        activeHold.isExpiringSoon &&
          'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
      )}
    >
      {seatCount} seat{seatCount === 1 ? '' : 's'} held · expires in {countdown}
    </Badge>
  )
}
