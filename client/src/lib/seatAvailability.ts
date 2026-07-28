import { ErrorMessages } from '@/constants/messages.constants'
import { SeatStatus } from '@/types/seat'

/**
 * @description Only called for seats that are neither toggleable nor already mine —
 * picks the single most relevant reason, in priority order, for the tooltip.
 */
export const getSeatUnavailabilityReason = (
  status: SeatStatus,
  isConnected: boolean,
  isMidTransaction: boolean,
  maxSeatsPerBooking: number,
): string => {
  if (!isConnected) return ErrorMessages.ConnectionLost
  if (status === SeatStatus.Booked) return ErrorMessages.SeatBooked
  if (status === SeatStatus.Held) return ErrorMessages.SeatHeldByOther
  if (isMidTransaction) return ErrorMessages.HoldTransactionInProgress
  return ErrorMessages.SeatSelectionLimitReached(maxSeatsPerBooking)
}
