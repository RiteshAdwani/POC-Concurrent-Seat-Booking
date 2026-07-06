export const Messages = {
  // Seat hold errors
  SeatNotFound:        'Seat does not exist',
  SeatAlreadyHeld:     'Seat is already held or booked',
  SeatNotHeld:         'Seat is not currently held',
  SeatNotYourHold:     'You do not hold this seat',
  SeatsExceedLimit:    'Cannot select more than the maximum allowed seats at once',
  SeatsEmpty:          'No seat IDs provided',
  SeatsDuplicate:      'Duplicate seat IDs in request',
  InvalidPayload:      'Invalid request payload',

  // Success / notification responses
  SeatHoldConfirmed:   'Seats held successfully',
  SeatBookingSuccess:  'Seats booked successfully',
  SeatReleased:        'Seat hold released',
  SeatExpiringSoon:    'Your seats are expiring soon — confirm your booking!',
} as const;
