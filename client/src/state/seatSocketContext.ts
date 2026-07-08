import { createContext } from 'react'
import type { SeatSocketState } from '@/state/seatReducer'

// Split into its own file (rather than living in SeatSocketProvider.tsx)
// so that file only exports the component — keeps it fast-refresh friendly.
export const SeatSocketContext = createContext<SeatSocketState | null>(null)
