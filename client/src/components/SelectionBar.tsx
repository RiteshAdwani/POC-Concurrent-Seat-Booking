import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildSeatPriceMap, formatPrice, sumSeatPrices } from '@/lib/seatPricing'
import { useSeatSocket } from '@/state/useSeatSocket'
import type { SeatLayout } from '@/types/seatLayout'

interface SelectionBarProps {
  layout: SeatLayout
}

/**
 * @description Displays the current selection count, running total, and a "Hold
 * Selected" button. Once a hold is confirmed, AppLayout navigates away to /checkout
 * entirely — this bar only ever needs to show the pre-hold selection UI, never an
 * active-hold state.
 */
export const SelectionBar = ({ layout }: SelectionBarProps) => {
  const { selectedSeatIds, isHoldPending, isConnected, holdSeats } = useSeatSocket()
  const selectedCount = selectedSeatIds.size

  const priceBySeatId = useMemo(() => buildSeatPriceMap(layout), [layout])
  const total = useMemo(
    () => sumSeatPrices(selectedSeatIds, priceBySeatId),
    [selectedSeatIds, priceBySeatId],
  )

  /**
   * @description Emits seat:hold for the current selection.
   */
  const handleHoldClick = () => {
    holdSeats(Array.from(selectedSeatIds))
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant="secondary" className="px-3 py-1 text-sm">
        {selectedCount}/{layout.maxSeatsPerBooking} selected
      </Badge>
      {selectedCount > 0 && (
        <Badge variant="secondary" className="px-3 py-1 text-sm tabular-nums">
          {formatPrice(total)}
        </Badge>
      )}
      <Button
        size="sm"
        disabled={selectedCount === 0 || isHoldPending || !isConnected}
        onClick={handleHoldClick}
      >
        {isHoldPending ? 'Holding…' : 'Hold Selected'}
      </Button>
    </div>
  )
}
