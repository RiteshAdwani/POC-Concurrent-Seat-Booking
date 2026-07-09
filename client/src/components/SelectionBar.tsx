import { Badge } from '@/components/ui/badge'
import { MAX_SEATS_PER_BOOKING } from '@/constants/seat.constants'

interface SelectionBarProps {
  selectedCount: number
}

/**
 * @description Displays how many seats are currently selected out of the max allowed per booking.
 */
export const SelectionBar = ({ selectedCount }: SelectionBarProps) => {
  return (
    <Badge variant="secondary" className="px-3 py-1 text-sm">
      {selectedCount}/{MAX_SEATS_PER_BOOKING} selected
    </Badge>
  )
}
