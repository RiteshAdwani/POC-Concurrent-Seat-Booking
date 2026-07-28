// Mirrors the wire shape from server/src/types.ts — keep in sync manually,
// the two workspaces don't share a build.

import type { SeatId } from '@/types/seat'

export interface SeatTier {
  name: string
  price: number
}

export interface SeatRow {
  label: string
  // A null entry means there's no seat at that column in this row (an aisle/walkway)
  // — render a spacer, not a seat.
  seatIds: (SeatId | null)[]
}

// A pricing category and the rows that belong to it — map straight over
// categories then rows, no need to regroup a flat row list on this side.
export interface SeatCategory extends SeatTier {
  rows: SeatRow[]
}

export interface SeatLayout {
  categories: SeatCategory[]
  cols: number[]
  maxSeatsPerBooking: number
}
