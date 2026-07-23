// "Your hold"/"Expiring soon" aren't listed here — holding seats navigates straight
// to /checkout, so this grid never actually renders either of those states. That
// color language lives on ActiveHoldStatus (on /checkout) instead, where it's
// actually visible.
// Reuses Seat.tsx's own .seat-* classes (defined in index.css) so the legend can
// never drift out of sync with the grid's actual colors.
export const LEGEND_ITEMS = [
  { label: 'Available', swatchClassName: 'seat-available' },
  { label: 'Selected', swatchClassName: 'seat-selected' },
  { label: 'Held by others', swatchClassName: 'seat-held-other' },
  { label: 'Booked', swatchClassName: 'seat-booked' },
] as const
