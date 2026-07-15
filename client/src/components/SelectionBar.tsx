import { ActiveHoldStatus } from '@/components/ActiveHoldStatus'
import { ConfirmBookingDialog } from '@/components/ConfirmBookingDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MAX_SEATS_PER_BOOKING } from '@/constants/seat.constants'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description Displays the current selection count and a "Hold Selected" button while
 * there's no active hold; once a hold is confirmed, swaps that for the live countdown and
 * a "Confirm Booking" dialog trigger instead — only one transaction is ever in flight, so
 * the bar only ever shows the controls relevant to whichever stage it's in. Selection is
 * only cleared once the reducer sees the transaction fully complete, not the instant
 * "Hold Selected" or "Confirm" is clicked.
 */
export const SelectionBar = () => {
  const { selectedSeatIds, activeHold, isHoldPending, isConnected, holdSeats } = useSeatSocket()
  const selectedCount = selectedSeatIds.size

  /**
   * @description Emits seat:hold for the current selection.
   */
  const handleHoldClick = () => {
    holdSeats(Array.from(selectedSeatIds))
  }

  if (activeHold) {
    return (
      <div className="flex items-center gap-3">
        <ActiveHoldStatus activeHold={activeHold} />
        <ConfirmBookingDialog activeHold={activeHold} disabled={!isConnected} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant="secondary" className="px-3 py-1 text-sm">
        {selectedCount}/{MAX_SEATS_PER_BOOKING} selected
      </Badge>
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
