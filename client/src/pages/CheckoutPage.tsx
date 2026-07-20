import { useNavigate } from 'react-router-dom'
import { ActiveHoldStatus } from '@/components/ActiveHoldStatus'
import { Button } from '@/components/ui/button'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description The /checkout route: held-seat summary, live countdown, and a direct
 * confirm action — no seat grid here, matching a real checkout page. Only ever
 * meaningfully rendered while activeHold exists; AppLayout's sync-effect redirects away
 * otherwise, but that redirect only takes effect after this render commits, so
 * activeHold is handled defensively here (renders nothing) until then.
 */
export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { activeHold, isConfirmPending, isConnected, confirmBooking } = useSeatSocket()

  if (!activeHold) {
    return null
  }

  const seatCount = activeHold.seatIds.length

  /**
   * @description Emits seat:confirm for the held seats.
   */
  const handleConfirmClick = () => {
    confirmBooking(activeHold.seatIds)
  }

  return (
    <div className="flex min-h-svh flex-col items-center gap-8 py-10">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-medium">Review your booking</h1>
        <p className="text-sm text-muted-foreground">
          You're about to book {seatCount} seat{seatCount === 1 ? '' : 's'}:{' '}
          {activeHold.seatIds.join(', ')}
        </p>
      </div>
      <ActiveHoldStatus activeHold={activeHold} />
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button onClick={handleConfirmClick} disabled={isConfirmPending || !isConnected}>
          {isConfirmPending ? 'Confirming…' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  )
}
