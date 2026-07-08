import { SeatStatus, type SeatId, type SeatsSnapshot } from '@/types/seat'

export interface SeatSocketState {
  seats: SeatsSnapshot
}

export const initialSeatSocketState: SeatSocketState = {
  seats: {},
}

export enum SeatSocketActionType {
  FullSync = 'FULL_SYNC',
  StateChanged = 'STATE_CHANGED',
}

export type SeatSocketAction =
  | { type: SeatSocketActionType.FullSync; snapshot: SeatsSnapshot }
  | { type: SeatSocketActionType.StateChanged; seats: Array<{ seatId: SeatId; status: SeatStatus }> }

/**
 * @description Pure reducer for server-driven seat state. Handles a full snapshot replace
 * (on connect/reconnect) and incremental per-seat status patches (on broadcast changes).
 */
export const seatSocketReducer = (
  state: SeatSocketState,
  action: SeatSocketAction,
): SeatSocketState => {
  switch (action.type) {
    case SeatSocketActionType.FullSync:
      return { ...state, seats: action.snapshot }

    case SeatSocketActionType.StateChanged: {
      const seats = { ...state.seats }
      for (const { seatId, status } of action.seats) {
        // seats:state:changed never carries timestamps (only seat:full:sync
        // does) — null them out unless the seat is still held, in which case
        // we keep whatever we already knew rather than inventing a value.
        const existing = seats[seatId]
        seats[seatId] =
          status === SeatStatus.Held
            ? { status, expiresAt: existing?.expiresAt ?? null, softExpiresAt: existing?.softExpiresAt ?? null }
            : { status, expiresAt: null, softExpiresAt: null }
      }
      return { ...state, seats }
    }

    default:
      return state
  }
}
