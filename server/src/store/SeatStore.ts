import { randomUUID } from 'crypto';
import { ROWS, COLS, SOFT_LOCK_MS, HARD_LOCK_MS, Messages } from "../constants";
import { SeatId, SeatRecord, SeatStatus, SeatsSnapshot } from "../types";
import { buildSeatId, buildEmptyRecord, recordToSnapshot } from "./helpers";

// ─── Result Types ─────────────────────────────────────────────────────────────

interface SeatsHoldSuccess {
  ok: true;
  seatIds: SeatId[];
  expiresAt: number;
  softExpiresAt: number;
}

interface SeatsHoldFailure {
  ok: false;
  reason: string;
}

type SeatsHoldResult = SeatsHoldSuccess | SeatsHoldFailure;

interface BookingsConfirmSuccess {
  ok: true;
}

interface BookingsConfirmFailure {
  ok: false;
  reason: string;
}

type BookingsConfirmResult = BookingsConfirmSuccess | BookingsConfirmFailure;

// ─── Batch ────────────────────────────────────────────────────────────────────

class SeatBatch {
  constructor(
    readonly batchId: string,
    readonly seatIds: SeatId[],
    readonly socketId: string,
    readonly expiresAt: number,
    readonly softExpiresAt: number,
    private readonly softTimer: NodeJS.Timeout,
    private readonly hardTimer: NodeJS.Timeout,
  ) {}

  /**
   * @description Clears both the soft-expiry warning timer and the hard-expiry release timer.
   * Called when a batch is confirmed or released before either timer fires.
   */
  cancel(): void {
    clearTimeout(this.softTimer);
    clearTimeout(this.hardTimer);
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export class SeatStore {
  private seats: Map<SeatId, SeatRecord> = new Map();
  private batches: Map<string, SeatBatch> = new Map();

  constructor() {
    this.init();
  }

  // ─── Initialisation ──────────────────────────────────────────────────────

  /**
   * @description Populates the seat map with one Available record for every seat in the grid.
   * Called once from the constructor; the map is never reset after that.
   */
  private init(): void {
    for (const row of ROWS) {
      for (const col of COLS) {
        this.seats.set(buildSeatId(row, col), buildEmptyRecord());
      }
    }
  }

  // ─── Core Operations ─────────────────────────────────────────────────────

  /**
   * @description Attempts to place an all-or-nothing hold on the requested seats for the given socket.
   * Schedules a soft-expiry callback at SOFT_LOCK_MS (warning) and a hard-expiry callback at
   * HARD_LOCK_MS (auto-release). Both callbacks are cancelled if the batch is confirmed or
   * released before they fire.
   */
  requestSeatsHold(
    seatIds: SeatId[],
    socketId: string,
    onSoftExpiry: (seatIds: SeatId[]) => void,
    onHardExpiry: (seatIds: SeatId[]) => void,
  ): SeatsHoldResult {
    // Validate ALL seats before touching any — all-or-nothing.
    // Node.js single-threaded event loop means no other hold request can
    // interleave between this validation loop and the write loop below.
    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId);
      if (!seat) return { ok: false, reason: Messages.SeatNotFound };
      if (seat.status !== SeatStatus.Available) return { ok: false, reason: Messages.SeatAlreadyHeld };
    }

    const now = Date.now();
    const softExpiresAt = now + SOFT_LOCK_MS;
    const expiresAt = now + HARD_LOCK_MS;
    const batchId = randomUUID();

    const softTimer = setTimeout(() => {
      onSoftExpiry(seatIds);
    }, SOFT_LOCK_MS);

    const hardTimer = setTimeout(() => {
      const releasedIds = this.releaseSeatsHold(batchId);
      if (releasedIds.length) onHardExpiry(releasedIds);
    }, HARD_LOCK_MS);

    const batch = new SeatBatch(batchId, seatIds, socketId, expiresAt, softExpiresAt, softTimer, hardTimer);
    this.batches.set(batchId, batch);

    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId)!;
      seat.status = SeatStatus.Held;
      seat.heldBy = socketId;
      seat.softExpiresAt = softExpiresAt;
      seat.expiresAt = expiresAt;
      seat.batchId = batchId;
    }

    return { ok: true, seatIds, expiresAt, softExpiresAt };
  }

  /**
   * @description Transitions all seats in the batch from Held to Booked for the given socket.
   * Validates that every seat is still held by this socket before committing any change.
   * Cancels the batch timers on success so no expiry fires after booking is complete.
   */
  confirmBookings(seatIds: SeatId[], socketId: string): BookingsConfirmResult {
    // Validate ALL seats before confirming any
    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId);
      if (!seat) return { ok: false, reason: Messages.SeatNotFound };
      if (seat.status !== SeatStatus.Held) return { ok: false, reason: Messages.SeatNotHeld };
      if (seat.heldBy !== socketId) return { ok: false, reason: Messages.SeatNotYourHold };
    }

    const { batchId } = this.seats.get(seatIds[0])!;
    if (batchId) {
      this.batches.get(batchId)?.cancel();
      this.batches.delete(batchId);
    }

    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId)!;
      seat.status = SeatStatus.Booked;
      seat.heldBy = null;
      seat.expiresAt = null;
      seat.softExpiresAt = null;
      seat.batchId = null;
    }

    return { ok: true };
  }

  /**
   * @description Voluntarily releases all seats in the given batch back to Available for the
   * given socket, cancelling its timers early. Validates that every seat is still held by this
   * socket before releasing any — same all-or-nothing shape as confirmBookings, just resetting
   * to Available instead of Booked. Assumes seatIds is one whole batch, not a partial slice of it.
   */
  releaseHeldSeats(seatIds: SeatId[], socketId: string): BookingsConfirmResult {
    // Validate ALL seats before releasing any
    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId);
      if (!seat) return { ok: false, reason: Messages.SeatNotFound };
      if (seat.status !== SeatStatus.Held) return { ok: false, reason: Messages.SeatNotHeld };
      if (seat.heldBy !== socketId) return { ok: false, reason: Messages.SeatNotYourHold };
    }

    const { batchId } = this.seats.get(seatIds[0])!;
    if (batchId) {
      this.batches.get(batchId)?.cancel();
      this.batches.delete(batchId);
    }

    for (const seatId of seatIds) {
      this.seats.set(seatId, buildEmptyRecord());
    }

    return { ok: true };
  }

  /**
   * @description Releases every seat currently held by the given socket and returns their IDs.
   * Intended to be called on socket disconnect so abandoned holds are freed immediately.
   * Cancels any pending batch timers to prevent ghost expiry callbacks after release.
   */
  releaseAllHeldBy(socketId: string): SeatId[] {
    const releasedIds: SeatId[] = [];
    const cancelledBatches = new Set<string>();

    for (const [seatId, seat] of this.seats) {
      if (seat.heldBy === socketId && seat.status === SeatStatus.Held) {
        if (seat.batchId && !cancelledBatches.has(seat.batchId)) {
          this.batches.get(seat.batchId)?.cancel();
          this.batches.delete(seat.batchId);
          cancelledBatches.add(seat.batchId);
        }
        this.seats.set(seatId, buildEmptyRecord());
        releasedIds.push(seatId);
      }
    }

    return releasedIds;
  }

  // ─── Snapshot ────────────────────────────────────────────────────────────

  /**
   * @description Returns a public snapshot of all seats, stripping internal fields (heldBy, batchId).
   * Used for the initial full-sync on connect and the GET /api/seats REST endpoint.
   */
  getSnapshot(): SeatsSnapshot {
    const snapshot = {} as SeatsSnapshot;

    for (const [seatId, record] of this.seats) {
      snapshot[seatId] = recordToSnapshot(record);
    }

    return snapshot;
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  /**
   * @description Releases all seats belonging to the given batch and returns the IDs that were
   * actually freed. Seats already confirmed (Booked) are skipped. Called by the hard-expiry timer.
   */
  private releaseSeatsHold(batchId: string): SeatId[] {
    const batch = this.batches.get(batchId);
    if (!batch) return [];

    batch.cancel();
    this.batches.delete(batchId);

    const releasedIds: SeatId[] = [];
    for (const seatId of batch.seatIds) {
      const seat = this.seats.get(seatId);
      if (seat && seat.status === SeatStatus.Held) {
        this.seats.set(seatId, buildEmptyRecord());
        releasedIds.push(seatId);
      }
    }
    return releasedIds;
  }
}
