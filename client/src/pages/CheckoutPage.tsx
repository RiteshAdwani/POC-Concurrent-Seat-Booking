import { Armchair } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActiveHoldStatus } from '@/components/ActiveHoldStatus'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <div className="flex min-h-svh flex-col items-center gap-6 px-4 py-10">
      <Header />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Review your booking</CardTitle>
          <CardDescription>
            {seatCount} seat{seatCount === 1 ? '' : 's'} selected
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {activeHold.seatIds.map((seatId) => (
              <span
                key={seatId}
                className="seat-mine inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium"
              >
                <Armchair className="size-3" />
                {seatId}
              </span>
            ))}
          </div>
          <Separator />
          <ActiveHoldStatus activeHold={activeHold} />
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirmClick}
            disabled={isConfirmPending || !isConnected}
          >
            {isConfirmPending ? 'Confirming…' : 'Confirm Booking'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
