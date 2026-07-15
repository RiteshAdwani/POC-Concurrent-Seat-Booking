import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useSeatSocket } from '@/state/useSeatSocket'
import type { HoldBatch } from '@/state/seatReducer'

interface ConfirmBookingDialogProps {
  activeHold: HoldBatch
  disabled?: boolean
}

/**
 * @description Dialog listing the seats in the active hold, letting the user emit
 * seat:confirm for them. Closes immediately on confirm — the resulting toast and grid
 * update (via seat:confirm:success/failed) are the real source of truth for the outcome,
 * not anything tracked locally in this dialog.
 */
export const ConfirmBookingDialog = ({ activeHold, disabled = false }: ConfirmBookingDialogProps) => {
  const { isConfirmPending, confirmBooking } = useSeatSocket()
  const [isOpen, setIsOpen] = useState(false)
  const seatCount = activeHold.seatIds.length

  /**
   * @description Emits seat:confirm for the held seats and closes the dialog.
   */
  const handleConfirmClick = () => {
    confirmBooking(activeHold.seatIds)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          Confirm Booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your booking</DialogTitle>
          <DialogDescription>
            You're about to book {seatCount} seat{seatCount === 1 ? '' : 's'}:{' '}
            {activeHold.seatIds.join(', ')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmClick} disabled={isConfirmPending}>
            {isConfirmPending ? 'Confirming…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
