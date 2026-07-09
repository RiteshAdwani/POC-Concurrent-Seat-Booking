import { MAX_SEATS_PER_BOOKING } from '@/constants/seat.constants'

// Client-owned copy only — messages that originate from the server (hold
// rejected, confirm failed, etc.) arrive via each event's own `message`
// field and are rendered as-is, not duplicated here.
export const ErrorMessages = {
  SeatUnavailable: 'This seat is already held or booked',
  SeatSelectionLimitReached: `Max ${MAX_SEATS_PER_BOOKING} seats per booking`,
  MissingSeatSocketProvider: 'useSeatSocket must be used within a SeatSocketProvider',
} as const
