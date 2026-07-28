import type { SeatLayout, SeatTier } from "../types";
import { buildSeatId } from "../store/helpers";

// ─── Seat Categories ──────────────────────────────────────────────────────────
// The single source of truth for the entire seat map: which rows exist, what
// category (and price) each belongs to, and where that row's aisle gaps are.
// Everything below (ROWS, VALID_SEAT_IDS, SEAT_LAYOUT, isSeatPosition) is derived
// from this instead of being hand-authored as its own parallel, row-keyed list.

interface SeatCategoryRowConfig {
  label: string;
  // Column positions with no seat at all (an aisle/walkway) — hand-designed per
  // row, not one rule copy-pasted onto every row. Real theaters aren't perfectly
  // uniform: the aisle drifts slightly row to row, and the back row is full-width.
  gaps: number[];
}

interface SeatCategoryConfig extends SeatTier {
  rows: SeatCategoryRowConfig[];
}

// Category order here is also rendering order — Platinum rows sit closest to the screen.
export const SEAT_CATEGORIES: SeatCategoryConfig[] = [
  {
    name: "Silver",
    price: 320,
    rows: [
      { label: "A", gaps: [5, 6] },
      { label: "B", gaps: [5, 6] },
      { label: "C", gaps: [1, 5, 6, 10] },
      { label: "D", gaps: [1, 5, 6, 10] },
    ],
  },
  {
    name: "Gold",
    price: 410,
    rows: [
      { label: "E", gaps: [1, 5, 6, 10] },
      { label: "F", gaps: [5, 6] },
      { label: "G", gaps: [5, 6] },
    ],
  },
  {
    name: "Platinum",
    price: 450,
    rows: [
      { label: "H", gaps: [1, 5, 6] },
      { label: "I", gaps: [1, 5, 6, 10] },
      { label: "J", gaps: [] }, // back row — full width, no aisle
    ],
  },
];

export const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const ROWS = SEAT_CATEGORIES.flatMap((category) =>
  category.rows.map((row) => row.label),
);

const rowGaps = new Map<string, Set<number>>();
for (const category of SEAT_CATEGORIES) {
  for (const row of category.rows) {
    rowGaps.set(row.label, new Set(row.gaps));
  }
}

/**
 * @description True if (row, col) is a real, bookable seat position — false for an
 * aisle/walkway. Reads directly off that row's gap set in SEAT_CATEGORIES —
 * VALID_SEAT_IDS, SEAT_LAYOUT, and SeatStore.init() all derive from this instead of
 * each maintaining their own copy.
 */
export const isSeatPosition = (row: string, col: number): boolean =>
  !rowGaps.get(row)?.has(col);

export const VALID_SEAT_IDS = new Set(
  ROWS.flatMap((row) =>
    COLS.filter((col) => isSeatPosition(row, col)).map((col) => `${row}${col}`),
  ),
);

export const SOFT_LOCK_MS = 5 * 60 * 1000; // 5 min — TTL warning threshold
export const HARD_LOCK_MS = 10 * 60 * 1000; // 10 min — auto-release

export const MAX_SEATS_PER_BOOKING = 8;

// Served to clients via GET /api/layout — the frontend maps straight over
// categories then rows, instead of regrouping a flat row list itself. Never
// builds a SeatId itself either way — buildSeatId (the only place allowed to
// cast to SeatId) stays entirely server-side.
export const SEAT_LAYOUT: SeatLayout = {
  categories: SEAT_CATEGORIES.map((category) => ({
    name: category.name,
    price: category.price,
    rows: category.rows.map((row) => ({
      label: row.label,
      seatIds: COLS.map((col) =>
        isSeatPosition(row.label, col) ? buildSeatId(row.label, col) : null,
      ),
    })),
  })),
  cols: COLS,
  maxSeatsPerBooking: MAX_SEATS_PER_BOOKING,
};

// Window a disconnected socket has to reconnect (with Socket.IO's Connection State
// Recovery) before its held seats are released. Shortened for demo purposes —
// Socket.IO's own default is 2 minutes.
export const CONNECTION_RECOVERY_WINDOW_MS = 8 * 1000;
