import type { SeatId } from '@/types/seat'

// Mirrors server/src/constants/seat.ts — keep in sync manually,
// the two workspaces don't share a build.
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
export const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const MAX_SEATS_PER_BOOKING = 8

/**
 * @description Constructs a seat ID from a row letter and column number, e.g. buildSeatId('A', 1) -> 'A1'.
 */
export const buildSeatId = (row: string, col: number): SeatId => {
  return `${row}${col}`
}
