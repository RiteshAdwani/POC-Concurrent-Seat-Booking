import { MAX_SEATS_PER_BOOKING } from '@/constants/seat.constants'

// Client-owned copy only — messages that originate from the server (hold
// rejected, confirm failed, etc.) arrive via each event's own `message`
// field and are rendered as-is, not duplicated here.
export const ErrorMessages = {
  SeatUnavailable: 'This seat is already held or booked',
  SeatSelectionLimitReached: `Max ${MAX_SEATS_PER_BOOKING} seats per booking`,
  HoldTransactionInProgress: 'Finish confirming or release your current hold before selecting more seats',
  MissingSeatSocketProvider: 'useSeatSocket must be used within a SeatSocketProvider',
  ConnectionLost: 'Reconnecting to the server…',
} as const
