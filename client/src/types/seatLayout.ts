// Mirrors the wire shape from server/src/types.ts — keep in sync manually,
// the two workspaces don't share a build.

import type { SeatId } from '@/types/seat'

export interface SeatRow {
  label: string
  seatIds: SeatId[]
}

export interface SeatLayout {
  rows: SeatRow[]
  cols: number[]
  maxSeatsPerBooking: number
}
