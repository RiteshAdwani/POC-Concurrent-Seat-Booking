import { createContext } from 'react'
import type { SeatLayout } from '@/types/seatLayout'

export interface SeatLayoutContextValue {
  layout: SeatLayout | null
  error: unknown | null
}

export const SeatLayoutContext = createContext<SeatLayoutContextValue | null>(null)
