import type { SeatId, SeatStatus, SeatsSnapshot } from '@/types/seat'

// Mirrors the wire contract from server/src/types.ts — keep in sync manually,
// the two workspaces don't share a build.

export enum ClientEvent {
  SeatHold = 'seat:hold',
  SeatConfirm = 'seat:confirm',
  SeatRelease = 'seat:release',
}

export enum ServerEvent {
  SeatHoldConfirmed = 'seat:hold:confirmed',
  SeatHoldRejected = 'seat:hold:rejected',
  SeatHoldExpiringSoon = 'seat:hold:expiring-soon',
  SeatConfirmSuccess = 'seat:confirm:success',
  SeatConfirmFailed = 'seat:confirm:failed',
  SeatReleaseSuccess = 'seat:release:success',
  SeatReleaseFailed = 'seat:release:failed',
  SeatsStateChanged = 'seats:state:changed',
  SeatFullSync = 'seat:full:sync',
  PresenceUpdate = 'presence:update',
}

interface SeatEventBase {
  seatIds: SeatId[]
  message: string
}

export interface SeatHoldConfirmedEvent extends SeatEventBase {
  expiresAt: number
  softExpiresAt: number
  ttlMs: number
}

export type SeatHoldRejectedEvent = SeatEventBase
export type SeatHoldExpiringSoonEvent = SeatEventBase
export type SeatConfirmSuccessEvent = SeatEventBase
export type SeatConfirmFailedEvent = SeatEventBase
export type SeatReleaseSuccessEvent = SeatEventBase
export type SeatReleaseFailedEvent = SeatEventBase

export interface SeatsStateChangedEvent {
  seats: Array<{ seatId: SeatId; status: SeatStatus }>
}

export interface PresenceEvent {
  count: number
}

export type ClientToServerEvents = {
  [ClientEvent.SeatHold]: (payload: { seatIds: string[] }) => void
  [ClientEvent.SeatConfirm]: (payload: { seatIds: string[] }) => void
  [ClientEvent.SeatRelease]: (payload: { seatIds: string[] }) => void
}

export type ServerToClientEvents = {
  [ServerEvent.SeatHoldConfirmed]: (event: SeatHoldConfirmedEvent) => void
  [ServerEvent.SeatHoldRejected]: (event: SeatHoldRejectedEvent) => void
  [ServerEvent.SeatHoldExpiringSoon]: (event: SeatHoldExpiringSoonEvent) => void
  [ServerEvent.SeatConfirmSuccess]: (event: SeatConfirmSuccessEvent) => void
  [ServerEvent.SeatConfirmFailed]: (event: SeatConfirmFailedEvent) => void
  [ServerEvent.SeatReleaseSuccess]: (event: SeatReleaseSuccessEvent) => void
  [ServerEvent.SeatReleaseFailed]: (event: SeatReleaseFailedEvent) => void
  [ServerEvent.SeatsStateChanged]: (event: SeatsStateChangedEvent) => void
  [ServerEvent.SeatFullSync]: (snapshot: SeatsSnapshot) => void
  [ServerEvent.PresenceUpdate]: (event: PresenceEvent) => void
}
