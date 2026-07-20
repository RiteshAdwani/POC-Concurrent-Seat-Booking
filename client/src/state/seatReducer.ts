import { MAX_SEATS_PER_BOOKING } from '@/constants/seat.constants'
import { SeatStatus, type SeatId, type SeatsSnapshot } from '@/types/seat'

export interface HoldBatch {
  seatIds: SeatId[]
  expiresAt: number
  softExpiresAt: number
  isExpiringSoon: boolean
}

export interface SeatSocketState {
  seats: SeatsSnapshot
  // Seats the user picked before holding them. Kept here (not in a component)
  // so a confirmed hold can clear it in the same update, with no extra effect needed.
  selectedSeatIds: Set<SeatId>
  // The one hold this client currently has, if any. Only one hold can be
  // active at a time, so the UI only ever has to track a single batch.
  activeHold: HoldBatch | null
  isHoldPending: boolean
  isConfirmPending: boolean
  isReleasePending: boolean
  isConnected: boolean
  presenceCount: number
}

export const initialSeatSocketState: SeatSocketState = {
  seats: {},
  selectedSeatIds: new Set(),
  activeHold: null,
  isHoldPending: false,
  isConfirmPending: false,
  isReleasePending: false,
  isConnected: false,
  presenceCount: 0,
}

export enum SeatSocketActionType {
  FullSync = 'FULL_SYNC',
  StateChanged = 'STATE_CHANGED',
  SeatToggled = 'SEAT_TOGGLED',
  HoldRequested = 'HOLD_REQUESTED',
  HoldConfirmed = 'HOLD_CONFIRMED',
  HoldRejected = 'HOLD_REJECTED',
  HoldExpiringSoon = 'HOLD_EXPIRING_SOON',
  ConfirmRequested = 'CONFIRM_REQUESTED',
  ConfirmSucceeded = 'CONFIRM_SUCCEEDED',
  ConfirmFailed = 'CONFIRM_FAILED',
  ReleaseRequested = 'RELEASE_REQUESTED',
  ReleaseSucceeded = 'RELEASE_SUCCEEDED',
  ReleaseFailed = 'RELEASE_FAILED',
  Connected = 'CONNECTED',
  Disconnected = 'DISCONNECTED',
  ActiveUsersCountUpdated = 'ACTIVE_USERS_COUNT_UPDATED',
}

export type SeatSocketAction =
  | { type: SeatSocketActionType.FullSync; snapshot: SeatsSnapshot }
  | { type: SeatSocketActionType.StateChanged; seats: Array<{ seatId: SeatId; status: SeatStatus }> }
  | { type: SeatSocketActionType.SeatToggled; seatId: SeatId }
  | { type: SeatSocketActionType.HoldRequested }
  | { type: SeatSocketActionType.HoldConfirmed; hold: Omit<HoldBatch, 'isExpiringSoon'> }
  | { type: SeatSocketActionType.HoldRejected }
  | { type: SeatSocketActionType.HoldExpiringSoon }
  | { type: SeatSocketActionType.ConfirmRequested }
  | { type: SeatSocketActionType.ConfirmSucceeded }
  | { type: SeatSocketActionType.ConfirmFailed }
  | { type: SeatSocketActionType.ReleaseRequested }
  | { type: SeatSocketActionType.ReleaseSucceeded }
  | { type: SeatSocketActionType.ReleaseFailed }
  | { type: SeatSocketActionType.Connected }
  | { type: SeatSocketActionType.Disconnected }
  | { type: SeatSocketActionType.ActiveUsersCountUpdated; count: number }

/**
 * @description Pure reducer for all seat-related state. Handles: replacing the full
 * seat list on (re)connect, applying incremental updates from the server, tracking
 * local seat selection, and moving a hold through to either a confirmed booking or
 * a voluntary release.
 *
 * selectedSeatIds and activeHold only get cleared once the transaction truly ends —
 * the booking succeeds, the user voluntarily releases the hold, or we notice (via
 * StateChanged) that the held seats were released without ever being confirmed, which
 * is how an expired hold is caught, since expiry has no event of its own. A failed
 * confirm leaves the hold active, matching what the backend does. A successful release
 * clears selectedSeatIds too (unlike a successful confirm) — voluntarily leaving the
 * checkout page means starting over, not continuing to edit the same picks.
 */
export const seatSocketReducer = (
  state: SeatSocketState,
  action: SeatSocketAction,
): SeatSocketState => {
  switch (action.type) {
    case SeatSocketActionType.FullSync:
      // A new sync means a new connection. The server has already released
      // anything we were holding, so clear local hold/selection state too.
      return {
        ...state,
        seats: action.snapshot,
        selectedSeatIds: new Set(),
        activeHold: null,
        isHoldPending: false,
        isConfirmPending: false,
        isReleasePending: false,
      }

    case SeatSocketActionType.StateChanged: {
      const seats = { ...state.seats }
      // True if a seat we held is no longer Held — either it got booked, or
      // it expired. Expiry has no event of its own, so this is how we catch it.
      // If it was booked instead, ConfirmSucceeded already cleared this state,
      // so redoing the same cleanup here is safe.
      let didActiveHoldExpire = false
      for (const { seatId, status } of action.seats) {
        // This event never includes timestamps. Keep the ones we already
        // have if the seat is still held, otherwise clear them.
        const existing = seats[seatId]
        seats[seatId] =
          status === SeatStatus.Held
            ? { status, expiresAt: existing?.expiresAt ?? null, softExpiresAt: existing?.softExpiresAt ?? null }
            : { status, expiresAt: null, softExpiresAt: null }

        if (status !== SeatStatus.Held && state.activeHold?.seatIds.includes(seatId)) {
          didActiveHoldExpire = true
        }
      }

      if (didActiveHoldExpire) {
        return {
          ...state,
          seats,
          selectedSeatIds: new Set(),
          activeHold: null,
          isConfirmPending: false,
          isReleasePending: false,
        }
      }

      return { ...state, seats }
    }

    case SeatSocketActionType.SeatToggled: {
      // Adds or removes a seat from the local selection. New additions are
      // capped at MAX_SEATS_PER_BOOKING; removing is always allowed.
      const selectedSeatIds = new Set(state.selectedSeatIds)
      if (selectedSeatIds.has(action.seatId)) {
        selectedSeatIds.delete(action.seatId)
      } else if (selectedSeatIds.size < MAX_SEATS_PER_BOOKING) {
        selectedSeatIds.add(action.seatId)
      }
      return { ...state, selectedSeatIds }
    }

    case SeatSocketActionType.HoldRequested:
      // A hold request just went out — block further attempts until the
      // server responds with HoldConfirmed or HoldRejected.
      return { ...state, isHoldPending: true }

    case SeatSocketActionType.HoldConfirmed:
      // Selection isn't cleared yet — holding is just the first step. It only
      // clears once the booking succeeds (or the hold expires).
      return {
        ...state,
        isHoldPending: false,
        activeHold: { ...action.hold, isExpiringSoon: false },
      }

    case SeatSocketActionType.HoldRejected:
      // The hold attempt failed — nothing was ever held, so just clear the
      // pending flag, there's no state to roll back.
      return { ...state, isHoldPending: false }

    case SeatSocketActionType.HoldExpiringSoon:
      // The server warned this hold is about to expire — flag it so the UI
      // can show a countdown/warning. No-op if there's no active hold.
      return state.activeHold
        ? { ...state, activeHold: { ...state.activeHold, isExpiringSoon: true } }
        : state

    case SeatSocketActionType.ConfirmRequested:
      // A confirm request just went out — block further attempts until the
      // server responds with ConfirmSucceeded or ConfirmFailed.
      return { ...state, isConfirmPending: true }

    case SeatSocketActionType.ConfirmSucceeded:
      // Booking succeeded, so the hold and the selection that led to it are
      // both done. Clear them.
      return {
        ...state,
        isConfirmPending: false,
        activeHold: null,
        selectedSeatIds: new Set(),
      }

    case SeatSocketActionType.ConfirmFailed:
      // Keep the hold active. The backend doesn't release seats just
      // because a confirm attempt failed.
      return { ...state, isConfirmPending: false }

    case SeatSocketActionType.ReleaseRequested:
      return { ...state, isReleasePending: true }

    case SeatSocketActionType.ReleaseSucceeded:
      // Full reset, matching BookMyShow-style "cancel wipes the slate" — unlike
      // ConfirmSucceeded's sibling above, this clears selectedSeatIds too, since
      // leaving the checkout page voluntarily means starting over, not editing.
      return {
        ...state,
        isReleasePending: false,
        activeHold: null,
        selectedSeatIds: new Set(),
      }

    case SeatSocketActionType.ReleaseFailed:
      // If this failed because the hold already hard-expired, the StateChanged
      // reconciliation above will have already cleared activeHold independently.
      return { ...state, isReleasePending: false }

    case SeatSocketActionType.Connected:
      // The socket is up. seat:full:sync (handled separately) is what
      // actually repopulates seat/hold state, not this.
      return { ...state, isConnected: true }

    case SeatSocketActionType.Disconnected:
      // Leave hold/selection state as-is. On reconnect, seat:full:sync will
      // resync (or clear) it against the real server state.
      return { ...state, isConnected: false }

    case SeatSocketActionType.ActiveUsersCountUpdated:
      // Updates the live count of connected users shown in the header.
      return { ...state, presenceCount: action.count }

    default:
      return state
  }
}
