import { SeatId, SeatRecord, SeatSnapshot, SeatStatus } from '../types';

/**
 * @description Constructs a branded SeatId from a row letter and column number.
 * This is the only place in the codebase that casts to SeatId.
 */
export function buildSeatId(row: string, col: number): SeatId {
  return `${row}${col}` as SeatId;
}

/**
 * @description Returns a fresh SeatRecord in the Available state with all fields nulled.
 * Used both during initialisation and when releasing a held seat.
 */
export function buildEmptyRecord(): SeatRecord {
  return {
    status: SeatStatus.Available,
    heldBy: null,
    expiresAt: null,
    softExpiresAt: null,
    batchId: null,
  };
}

/**
 * @description Strips internal-only fields (heldBy, batchId) from a SeatRecord,
 * producing the public SeatSnapshot shape that is safe to send over the wire.
 */
export function recordToSnapshot(record: SeatRecord): SeatSnapshot {
  return {
    status: record.status,
    expiresAt: record.expiresAt,
    softExpiresAt: record.softExpiresAt,
  };
}
