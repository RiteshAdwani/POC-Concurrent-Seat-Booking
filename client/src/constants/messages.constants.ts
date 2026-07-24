// Client-owned copy only — messages that originate from the server (hold
// rejected, confirm failed, etc.) arrive via each event's own `message`
// field and are rendered as-is, not duplicated here.
export const ErrorMessages = {
  SeatHeldByOther: 'Held by another user',
  SeatBooked: 'Already booked',
  // maxSeatsPerBooking is a runtime value (fetched from the backend layout), not
  // a build-time constant, so this stays a function instead of a baked-in string.
  SeatSelectionLimitReached: (max: number) => `Max ${max} seats per booking`,
  HoldTransactionInProgress: 'Finish confirming or release your current hold before selecting more seats',
  MissingSeatSocketProvider: 'useSeatSocket must be used within a SeatSocketProvider',
  SeatLayoutFetchFailed: (status: number) => `Failed to load seat layout (${status})`,
  ConnectionLost: 'Reconnecting to the server…',
} as const
