// Mirrors the wire shapes from server/src/types.ts — keep in sync manually,
// the two workspaces don't share a build.

export type SeatId = string

export enum SeatStatus {
  Available = 'available',
  Held = 'held',
  Booked = 'booked',
}

export interface SeatSnapshot {
  status: SeatStatus
  expiresAt: number | null
  softExpiresAt: number | null
}

export type SeatsSnapshot = Record<SeatId, SeatSnapshot>
