import { createContext } from 'react'
import type { SeatSocketState } from '@/state/seatReducer'
import type { SeatId } from '@/types/seat'

export interface SeatSocketContextValue extends SeatSocketState {
  toggleSeat: (seatId: SeatId) => void
  holdSeats: (seatIds: SeatId[]) => void
  confirmBooking: (seatIds: SeatId[]) => void
}


export const SeatSocketContext = createContext<SeatSocketContextValue | null>(null)
