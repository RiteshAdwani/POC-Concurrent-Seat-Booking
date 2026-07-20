import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MAX_SEATS_PER_BOOKING } from '@/constants/seat.constants'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description Displays the current selection count and a "Hold Selected" button. Once
 * a hold is confirmed, AppLayout navigates away to /checkout entirely — this bar only
 * ever needs to show the pre-hold selection UI, never an active-hold state.
 */
export const SelectionBar = () => {
  const { selectedSeatIds, isHoldPending, isConnected, holdSeats } = useSeatSocket()
  const selectedCount = selectedSeatIds.size

  /**
   * @description Emits seat:hold for the current selection.
   */
  const handleHoldClick = () => {
    holdSeats(Array.from(selectedSeatIds))
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
