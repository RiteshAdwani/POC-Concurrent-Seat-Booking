import { useContext } from 'react'
import { ErrorMessages } from '@/constants/messages.constants'
import { SeatLayoutContext } from '@/state/seatLayoutContext'

/**
 * @description Reads the seat layout from context. AppLayout fetches it once (it's the
 * single top-level route element, so it never unmounts while the app is open) and
 * provides it here — no module-level cache needed. Throws if called outside AppLayout's
 * tree.
 */
export const useSeatLayout = () => {
  const context = useContext(SeatLayoutContext)
  if (!context) {
    throw new Error(ErrorMessages.MissingSeatLayoutProvider)
  }
  return context
}
