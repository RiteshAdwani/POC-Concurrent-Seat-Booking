// ─── Enums ───────────────────────────────────────────────────────────────────

export enum SeatStatus {
  Available = 'available',
  Held = 'held',
  Booked = 'booked',
}

// Events the client emits to the server
export enum ClientEvent {
  SeatHold    = 'seat:hold',
  SeatConfirm = 'seat:confirm',
  SeatRelease = 'seat:release',
}

// Events the server emits to clients
export enum ServerEvent {
  SeatHoldConfirmed    = 'seat:hold:confirmed',
  SeatHoldRejected     = 'seat:hold:rejected',
  SeatHoldExpiringSoon = 'seat:hold:expiring-soon',
  SeatConfirmSuccess   = 'seat:confirm:success',
  SeatConfirmFailed    = 'seat:confirm:failed',
  SeatReleaseSuccess   = 'seat:release:success',
  SeatReleaseFailed    = 'seat:release:failed',
  SeatsStateChanged    = 'seats:state:changed',
  SeatFullSync         = 'seat:full:sync',
  PresenceUpdate       = 'presence:update',
}

// ─── Branded Types ────────────────────────────────────────────────────────────

// Phantom brand — string at runtime, distinct type at compile time.
// Only buildSeatId() may cast to SeatId; all other code receives it already branded.
declare const __seatId: unique symbol;
export type SeatId = string & { readonly [__seatId]: never };

// ─── Core Types ──────────────────────────────────────────────────────────────

// Internal server representation — never sent to clients
export interface SeatRecord {
  status: SeatStatus;
  heldBy: string | null;
  expiresAt: number | null;
  softExpiresAt: number | null;
  batchId: string | null;
}

// Public seat shape — safe to send over the wire (no internal fields)
export interface SeatSnapshot {
  status: SeatStatus;
  expiresAt: number | null;
  softExpiresAt: number | null;
}

// Full seat map — sent on initial connect and reconnect resync
export type SeatsSnapshot = Record<SeatId, SeatSnapshot>;

// ─── HTTP Types ───────────────────────────────────────────────────────────────

// GET /api/seats response
export type GetSeatsResponse = SeatsSnapshot;

// ─── Socket Types ─────────────────────────────────────────────────────────────

// What the client emits to the server — raw strings before server validation
export type ClientToServerEvents = {
  [ClientEvent.SeatHold]:    (payload: { seatIds: string[] }) => void;
  [ClientEvent.SeatConfirm]: (payload: { seatIds: string[] }) => void;
  [ClientEvent.SeatRelease]: (payload: { seatIds: string[] }) => void;
};

// What the server emits to clients
export type ServerToClientEvents = {
  // Sent to the requesting client only — hold was successful
  [ServerEvent.SeatHoldConfirmed]:    (event: SeatHoldConfirmedEvent) => void;

  // Sent to the requesting client only — hold failed, roll back optimistic update
  [ServerEvent.SeatHoldRejected]:     (event: SeatHoldRejectedEvent) => void;

  // Sent to the requesting client only — TTL soft warning
  [ServerEvent.SeatHoldExpiringSoon]: (event: SeatHoldExpiringSoonEvent) => void;

  // Sent to the requesting client only — booking confirmed
  [ServerEvent.SeatConfirmSuccess]:   (event: SeatConfirmSuccessEvent) => void;

  // Sent to the requesting client only — booking failed, hold is still active
  [ServerEvent.SeatConfirmFailed]:    (event: SeatConfirmFailedEvent) => void;

  // Sent to the requesting client only — hold released successfully
  [ServerEvent.SeatReleaseSuccess]:   (event: SeatReleaseSuccessEvent) => void;

  // Sent to the requesting client only — release failed (not held / not yours / already gone)
  [ServerEvent.SeatReleaseFailed]:    (event: SeatReleaseFailedEvent) => void;

  // Broadcast to ALL clients — one or more seats changed state
  [ServerEvent.SeatsStateChanged]:    (event: SeatsStateChangedEvent) => void;

  // Sent to newly connected / reconnected client — full seat map for initial render / resync
  [ServerEvent.SeatFullSync]:         (snapshot: SeatsSnapshot) => void;

  // Broadcast to ALL clients — connected user count changed
  [ServerEvent.PresenceUpdate]:       (event: PresenceEvent) => void;
};

// ─── Socket Event Shapes ─────────────────────────────────────────────────────

// Base for all targeted seat events — carries seatIds and a displayable message for toasts
// Record<never, never> is an empty-key object — intersection with it is identity (no property collisions)
type SeatEvent<T extends Record<string, unknown> = Record<never, never>> = {
  seatIds: SeatId[];
  message: string;
} & T;

export type SeatHoldConfirmedEvent = SeatEvent<{
  expiresAt: number;     // absolute timestamp (ms) — hard lock expiry
  softExpiresAt: number; // absolute timestamp (ms) — warning threshold
  ttlMs: number;         // duration in ms — client uses this to compute local expiry (avoids clock skew)
}>;

export type SeatHoldRejectedEvent     = SeatEvent;
export type SeatHoldExpiringSoonEvent = SeatEvent;
export type SeatConfirmSuccessEvent   = SeatEvent;
export type SeatConfirmFailedEvent    = SeatEvent;
export type SeatReleaseSuccessEvent   = SeatEvent;
export type SeatReleaseFailedEvent    = SeatEvent;

export interface SeatsStateChangedEvent {
  seats: Array<{ seatId: SeatId; status: SeatStatus }>;
}

export interface PresenceEvent {
  count: number;
}
