import { COLS, MAX_SEATS_PER_BOOKING, ROWS, buildSeatId } from '@/constants/seat'
import { Seat } from '@/components/Seat'
import type { SeatId } from '@/types/seat'

interface SeatGridProps {
  selectedSeatIds: Set<SeatId>
  onToggleSeat: (seatId: SeatId) => void
}

export function SeatGrid({ selectedSeatIds, onToggleSeat }: SeatGridProps) {
  const isAtCap = selectedSeatIds.size >= MAX_SEATS_PER_BOOKING

  return (
    <div className="inline-flex flex-col gap-1.5 rounded-xl border bg-card p-4">
      <div className="flex gap-1.5 pl-9">
        {COLS.map((col) => (
          <div key={col} className="flex size-9 items-center justify-center text-xs text-muted-foreground">
            {col}
          </div>
        ))}
      </div>
      {ROWS.map((row) => (
        <div key={row} className="flex items-center gap-1.5">
          <div className="flex size-9 items-center justify-center text-xs text-muted-foreground">
            {row}
          </div>
          {COLS.map((col) => {
            const seatId = buildSeatId(row, col)
            const isSelected = selectedSeatIds.has(seatId)
            return (
              <Seat
                key={col}
                seatId={seatId}
                isSelected={isSelected}
                isSelectable={isSelected || !isAtCap}
                onToggle={onToggleSeat}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
