import type { SeatId } from '@/types/seat'
import type { SeatLayout } from '@/types/seatLayout'

/**
 * @description Flattens the layout's rows into a seatId -> tier price lookup, so any
 * component holding a list of seatIds (selection, an active hold) can price them
 * without knowing which row each one belongs to.
 */
export const buildSeatPriceMap = (layout: SeatLayout): Map<SeatId, number> => {
  const priceBySeatId = new Map<SeatId, number>()

  for (const category of layout.categories) {
    for (const row of category.rows) {
      for (const seatId of row.seatIds) {
        if (seatId !== null) {
          priceBySeatId.set(seatId, category.price)
        }
      }
    }
  }

  return priceBySeatId
}

/**
 * @description Sums the price of each given seatId against the price map, skipping any
 * seatId the map doesn't recognise (defensive only — every real seatId is always in it).
 */
export const sumSeatPrices = (seatIds: Iterable<SeatId>, priceBySeatId: Map<SeatId, number>): number => {
  let total = 0
  for (const seatId of seatIds) {
    total += priceBySeatId.get(seatId) ?? 0
  }
  return total
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/**
 * @description Formats a price as Indian Rupees, e.g. 450 -> "₹450".
 */
export const formatPrice = (amount: number): string => currencyFormatter.format(amount)
