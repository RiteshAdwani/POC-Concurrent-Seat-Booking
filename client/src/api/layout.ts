import { apiRoute } from '@/constants/apiRoute.constants'
import { ErrorMessages } from '@/constants/messages.constants'
import { SERVER_URL } from '@/constants/serverUrl.constants'
import type { SeatLayout } from '@/types/seatLayout'

/**
 * @description Fetches the static seat map shape (rows, cols, maxSeatsPerBooking) from
 * the backend. Called once on app load — this never changes at runtime, unlike the
 * live per-seat status the socket connection streams.
 */
export const fetchSeatLayout = async (): Promise<SeatLayout> => {
  const res = await fetch(`${SERVER_URL}${apiRoute.layout}`)
  if (!res.ok) {
    throw new Error(ErrorMessages.SeatLayoutFetchFailed(res.status))
  }
  return res.json()
}
