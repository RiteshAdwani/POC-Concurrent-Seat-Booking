import { Badge } from '@/components/ui/badge'
import { MAX_SEATS_PER_BOOKING } from '@/constants/seat'

interface SelectionBarProps {
  selectedCount: number
}

export function SelectionBar({ selectedCount }: SelectionBarProps) {
  return (
    <Badge variant="secondary" className="px-3 py-1 text-sm">
      {selectedCount}/{MAX_SEATS_PER_BOOKING} selected
    </Badge>
  )
}
