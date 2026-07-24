import type { SeatLayout } from '../types';
import { buildSeatId } from '../store/helpers';

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const VALID_SEAT_IDS = new Set(
  ROWS.flatMap(row => COLS.map(col => `${row}${col}`)),
);

export const SOFT_LOCK_MS = 5 * 60 * 1000;  // 5 min — TTL warning threshold
export const HARD_LOCK_MS = 10 * 60 * 1000; // 10 min — auto-release

export const MAX_SEATS_PER_BOOKING = 8;

// Served to clients via GET /api/layout — the frontend derives its grid from this
// instead of hardcoding its own copy of ROWS/COLS/MAX_SEATS_PER_BOOKING, and never
// builds a SeatId itself — buildSeatId (the only place allowed to cast to SeatId)
// stays entirely server-side.
export const SEAT_LAYOUT: SeatLayout = {
  rows: ROWS.map(row => ({ label: row, seatIds: COLS.map(col => buildSeatId(row, col)) })),
  cols: COLS,
  maxSeatsPerBooking: MAX_SEATS_PER_BOOKING,
};
