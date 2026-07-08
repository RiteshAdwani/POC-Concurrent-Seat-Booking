import { useContext } from 'react'
import { ErrorMessages } from '@/constants/messages.constants'
import { SeatSocketContext } from '@/state/seatSocketContext'

/**
 * @description Reads the current seat-socket state (the seats map) from context. Throws if
 * called outside a SeatSocketProvider.
 */
export const useSeatSocket = () => {
  const context = useContext(SeatSocketContext)
  if (!context) {
    throw new Error(ErrorMessages.MissingSeatSocketProvider)
  }
  return context
}
